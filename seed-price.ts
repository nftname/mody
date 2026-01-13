
// seed-price.ts
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

// تاريخ التوقف (نرجع للوراء حتى 2021)
const STOP_DATE = new Date('2021-01-01').getTime();

// دالة جلب الأسعار (Close Price)
async function fetchBinanceHourlyPrice(symbol: string) {
  let allCandles: any[] = [];
  let endTime = Date.now();
  let fetching = true;

  console.log(`   --> Fetching ${symbol} Price history...`);

  while (fetching) {
    try {
      const url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=1h&limit=1000&endTime=${endTime}`;
      const res = await fetch(url);
      if (!res.ok) break;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;

      // هنا التغيير الجوهري: نأخذ العنصر رقم [4] وهو Close Price
      const candles = data.map((d: any) => ({
        time: Math.floor(d[0] / 1000), 
        price: parseFloat(d[4]) // Index 4 is Close Price
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
  console.log("🚀 Starting Price Index Seed...");
  
  console.log("🧹 Truncating DB...");
  const { error } = await supabase.rpc('truncate_ngx_volume_index');
  if (error) await supabase.from('ngx_volume_index').delete().neq('id', 0);

  const recordsToUpsert: any[] = [];

  for (const sector of SECTORS) {
    console.log(`\n--- Sector: ${sector.key} ---`);
    const allPrices: Record<number, number> = {};
    const tokenCounts: Record<number, number> = {}; // لنعرف كم عملة كانت موجودة في هذا الوقت
    let hasData = false;

    for (const symbol of sector.symbols) {
      const history = await fetchBinanceHourlyPrice(symbol);
      if (history.length > 0) {
        hasData = true;
        history.forEach((h: any) => {
          const roundedTime = Math.floor(h.time / 3600) * 3600;
          // نجمع الأسعار لنحسب المتوسط لاحقاً
          allPrices[roundedTime] = (allPrices[roundedTime] || 0) + h.price;
          tokenCounts[roundedTime] = (tokenCounts[roundedTime] || 0) + 1;
        });
      }
    }

    if (!hasData) continue;
    const sortedTimes = Object.keys(allPrices).map(Number).sort((a, b) => a - b);

    // حساب متوسط السعر للقطاع
    const sectorValues: Record<number, number> = {};
    sortedTimes.forEach(t => {
        // قيمة القطاع = مجموع أسعار العملات / عددها
        sectorValues[t] = allPrices[t] / tokenCounts[t];
    });

    // --- حساب الأساس (Base 1000) ---
    // سنجعل بداية المؤشر تساوي 1000 نقطة ليكون شكله احترافي
    let sumFirstWeek = 0;
    let countFirstWeek = 0;
    const initialPoints = sortedTimes.slice(0, 168); // أول أسبوع
    initialPoints.forEach(t => {
        sumFirstWeek += sectorValues[t];
        countFirstWeek++;
    });

    // هذا هو السعر الذي يوازي 1000 نقطة
    const basePrice = countFirstWeek > 0 ? sumFirstWeek / countFirstWeek : sectorValues[sortedTimes[0]];
    console.log(`   📊 Base Price for 1000 points: ${basePrice.toFixed(4)}`);

    sortedTimes.forEach(t => {
      const currentPrice = sectorValues[t];
      // المعادلة: (السعر الحالي / سعر الأساس) * 1000
      const indexVal = basePrice > 0 ? (currentPrice / basePrice) * 1000 : 0;
      
      recordsToUpsert.push({
        sector_key: sector.key,
        timestamp: t,
        volume_raw: currentPrice, // نخزن السعر هنا بدلاً من الفوليوم
        index_value: parseFloat(indexVal.toFixed(2))
      });
    });
  }

  // حساب ALL (متوسط المؤشرات)
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
    const chunkSize = 5000;
    for (let i = 0; i < recordsToUpsert.length; i += chunkSize) {
      const chunk = recordsToUpsert.slice(i, i + chunkSize);
      await supabase.from('ngx_volume_index').upsert(chunk, { onConflict: 'sector_key, timestamp' });
      process.stdout.write('💾');
    }
  }
  console.log("\n✅ SUCCESS! Price Index Built.");
}

run();
