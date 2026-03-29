// seed-v2.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) { console.error("❌ Keys missing!"); process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);

const SECTORS = [
  { key: 'NAM', symbols: ['ENSUSDT', 'IDUSDT', 'FIDAUSDT'] },
  { key: 'ART', symbols: ['APEUSDT', 'BLURUSDT', 'RNDRUSDT'] },
  { key: 'GAM', symbols: ['IMXUSDT', 'GALAUSDT', 'BEAMXUSDT'] },
  { key: 'UTL', symbols: ['MANAUSDT', 'SANDUSDT', 'HIGHUSDT'] }
];

// نرجع للوراء حتى 2021 لضمان تاريخ كامل
const STOP_DATE = new Date('2021-01-01').getTime();

// دالة جلب ساعات بتكرار ذكي
async function fetchBinanceHourlyFull(symbol: string) {
  let allCandles: any[] = [];
  let endTime = Date.now();
  let fetching = true;

  console.log(`   --> Fetching ${symbol} hourly history...`);

  while (fetching) {
    try {
      // نطلب 1000 ساعة في كل مرة
      const url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=1h&limit=1000&endTime=${endTime}`;
      const res = await fetch(url);
      if (!res.ok) break;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;

      const candles = data.map((d: any) => ({
        time: Math.floor(d[0] / 1000), 
        vol: parseFloat(d[5])
      }));

      allCandles = [...candles, ...allCandles];
      const firstTime = data[0][0];
      endTime = firstTime - 1;

      if (firstTime <= STOP_DATE || data.length < 1000) fetching = false;
      else process.stdout.write('.');
      
    } catch (e) { break; }
  }
  console.log(` Done (${allCandles.length} hours)`);
  return allCandles;
}

async function run() {
  console.log("🚀 Starting V2 Seed (Hourly + Smart Base)...");
  
  // 1. تنظيف الجدول
  console.log("🧹 Truncating DB...");
  const { error } = await supabase.rpc('truncate_nfx_volume_index');
  if (error) await supabase.from('nfx_volume_index').delete().neq('id', 0);

  const recordsToUpsert: any[] = [];

  for (const sector of SECTORS) {
    console.log(`\n--- Sector: ${sector.key} ---`);
    const allVolumes: Record<number, number> = {};
    let hasData = false;

    for (const symbol of sector.symbols) {
      const history = await fetchBinanceHourlyFull(symbol);
      if (history.length > 0) {
        hasData = true;
        history.forEach((h: any) => {
          // تقريب لأقرب ساعة (00:00, 01:00, ...)
          const roundedTime = Math.floor(h.time / 3600) * 3600;
          allVolumes[roundedTime] = (allVolumes[roundedTime] || 0) + h.vol;
        });
      }
    }

    if (!hasData) continue;
    const sortedTimes = Object.keys(allVolumes).map(Number).sort((a, b) => a - b);

    // --- الحل السحري: حساب الأساس بناءً على متوسط أول أسبوع (168 ساعة) ---
    // هذا يمنع الأرقام الفلكية إذا كانت أول ساعة ضعيفة
    let sumFirstWeek = 0;
    let countFirstWeek = 0;
    // نأخذ أول 168 نقطة (أسبوع) أو المتاح
    const initialPoints = sortedTimes.slice(0, 168); 
    initialPoints.forEach(t => {
        sumFirstWeek += allVolumes[t];
        countFirstWeek++;
    });

    const baseVolume = countFirstWeek > 0 ? sumFirstWeek / countFirstWeek : (allVolumes[sortedTimes[0]] || 1);
    console.log(`   📊 Smart Base (Avg of first week): ${Math.round(baseVolume)}`);

    // تجهيز البيانات
    sortedTimes.forEach(t => {
      const rawVol = allVolumes[t];
      // المعادلة: (الحجم / متوسط الأسبوع الأول) * 100
      const indexVal = baseVolume > 0 ? (rawVol / baseVolume) * 100 : 0;
      
      recordsToUpsert.push({
        sector_key: sector.key,
        timestamp: t,
        volume_raw: rawVol,
        index_value: parseFloat(indexVal.toFixed(2))
      });
    });
  }

  // حساب ALL
  console.log(`\n--- Calculating 'ALL' Index ---`);
  const recordsByTime: Record<number, { sum: number, count: number }> = {};
  recordsToUpsert.forEach(r => {
      if (!recordsByTime[r.timestamp]) recordsByTime[r.timestamp] = { sum: 0, count: 0 };
      recordsByTime[r.timestamp].sum += r.index_value;
      recordsByTime[r.timestamp].count += 1;
  });

  Object.keys(recordsByTime).forEach(tStr => {
      const t = Number(tStr);
      const { sum, count } = recordsByTime[t];
      if (count >= 1) { 
          recordsToUpsert.push({
              sector_key: 'ALL',
              timestamp: t,
              volume_raw: 0, 
              index_value: parseFloat((sum / count).toFixed(2))
          });
      }
  });

  console.log(`💾 Saving ${recordsToUpsert.length} records...`);
  if (recordsToUpsert.length > 0) {
    const chunkSize = 5000; // دفعات كبيرة
    for (let i = 0; i < recordsToUpsert.length; i += chunkSize) {
      const chunk = recordsToUpsert.slice(i, i + chunkSize);
      await supabase.from('nfx_volume_index').upsert(chunk, { onConflict: 'sector_key, timestamp' });
      process.stdout.write('💾');
    }
  }
  console.log("\n✅ SUCCESS!");
}

run();
