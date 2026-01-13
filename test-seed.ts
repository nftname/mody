// test-seed.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// 1. إعداد الاتصال
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Supabase keys are missing from .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. إعداد العملات
const SECTORS = [
  { key: 'NAM', symbols: ['ENSUSDT', 'IDUSDT', 'FIDAUSDT'] },
  { key: 'ART', symbols: ['APEUSDT', 'BLURUSDT', 'RNDRUSDT'] },
  { key: 'GAM', symbols: ['IMXUSDT', 'GALAUSDT', 'BEAMXUSDT'] },
  { key: 'UTL', symbols: ['MANAUSDT', 'SANDUSDT', 'HIGHUSDT'] }
];

// تاريخ التوقف (نرجع للوراء حتى هذا التاريخ) - مثلاً 1 يناير 2020
const STOP_DATE = new Date('2020-01-01').getTime();

// دالة ذكية تجلب التاريخ كاملاً من باينانس
async function fetchBinanceFullHistory(symbol: string) {
  let allCandles: any[] = [];
  let endTime = Date.now(); 
  let fetching = true;

  console.log(`   --> Fetching ${symbol} full history...`);

  while (fetching) {
    try {
      // نطلب 1000 شمعة تنتهي عند endTime
      const url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=1d&limit=1000&endTime=${endTime}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        console.warn(`      ⚠️ Warning: Could not fetch batch for ${symbol}`);
        break;
      }

      const data = await res.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        fetching = false;
        break;
      }

      // تحويل البيانات
      const candles = data.map((d: any) => ({
        time: Math.floor(d[0] / 1000), 
        vol: parseFloat(d[5])          
      }));

      // دمج البيانات الجديدة في البداية
      allCandles = [...candles, ...allCandles];

      // تحديث وقت النهاية للدفعة التالية (وقت أول شمعة - 1 ملي ثانية)
      const firstCandleTime = data[0][0]; 
      endTime = firstCandleTime - 1;

      // نتوقف إذا وصلنا للتاريخ المحدد أو انتهت البيانات
      if (firstCandleTime <= STOP_DATE || data.length < 1000) {
        fetching = false;
      } else {
        process.stdout.write('.'); // مؤشر تحميل
      }

    } catch (e) {
      console.error(`Error fetching batch for ${symbol}:`, e);
      break;
    }
  }
  
  console.log(` Done (${allCandles.length} days found)`);
  return allCandles;
}

async function run() {
  console.log("🚀 Starting Script (Binance Full History)...");
  
  // 3. مسح البيانات القديمة تماماً
  console.log("🧹 Cleaning DB...");
  const { error: delError } = await supabase.from('ngx_volume_index').delete().neq('id', 0);
  if (delError) console.error("Warning cleaning DB:", delError.message);

  const recordsToUpsert: any[] = [];

  // 4. معالجة القطاعات
  for (const sector of SECTORS) {
    console.log(`\n--- Processing Sector: ${sector.key} ---`);
    const allVolumes: Record<number, number> = {};
    let hasData = false;

    for (const symbol of sector.symbols) {
      const history = await fetchBinanceFullHistory(symbol);
      
      if (history && history.length > 0) {
          hasData = true;
          history.forEach((h: any) => {
              // توحيد التوقيت لمنتصف الليل
              const roundedTime = Math.floor(h.time / 86400) * 86400;
              allVolumes[roundedTime] = (allVolumes[roundedTime] || 0) + h.vol;
          });
      }
    }

    if (!hasData) {
        console.log(`❌ No data found for sector ${sector.key}`);
        continue;
    }

    const sortedTimes = Object.keys(allVolumes).map(Number).sort((a, b) => a - b);
    
    // حساب Base 100 بناءً على أول يوم تاريخي
    const baseVolume = allVolumes[sortedTimes[0]] || 1;

    console.log(`   📊 Base Volume: ${baseVolume}`);

    sortedTimes.forEach(t => {
      const rawVol = allVolumes[t];
      const indexVal = baseVolume > 0 ? (rawVol / baseVolume) * 100 : 0;
      
      recordsToUpsert.push({
        sector_key: sector.key,
        timestamp: t,
        volume_raw: rawVol,
        index_value: parseFloat(indexVal.toFixed(2))
      });
    });
  }

  // 5. حساب مؤشر ALL
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

  // 6. الحفظ
  console.log(`💾 Saving ${recordsToUpsert.length} records to Supabase...`);
  
  if (recordsToUpsert.length > 0) {
    const chunkSize = 2000;
    for (let i = 0; i < recordsToUpsert.length; i += chunkSize) {
      const chunk = recordsToUpsert.slice(i, i + chunkSize);
      const { error } = await supabase
          .from('ngx_volume_index')
          .upsert(chunk, { onConflict: 'sector_key, timestamp' });
      
      if (error) {
          console.error(`❌ DB Insert Error: ${error.message}`);
      } else {
          process.stdout.write('💾'); 
      }
    }
  }

  console.log("\n\n🎉 SUCCESS! Full history loaded.");
}

run();
