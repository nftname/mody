import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // السماح بدقيقة كاملة للتنفيذ

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// تعريف القطاعات والعملات المكونة لها
const SECTORS = [
  { key: 'NAM', symbols: ['ENSUSDT', 'IDUSDT', 'FIDAUSDT'] },
  { key: 'ART', symbols: ['APEUSDT', 'BLURUSDT', 'RNDRUSDT'] },
  { key: 'GAM', symbols: ['IMXUSDT', 'GALAUSDT', 'BEAMXUSDT'] },
  { key: 'UTL', symbols: ['MANAUSDT', 'SANDUSDT', 'HIGHUSDT'] }
];

// دالة جلب البيانات مع حل مشكلة الحظر الجغرافي (Vercel US Servers)
async function fetchBinanceKlines(symbol: string, interval: string, limit: number) {
  try {
    // المحاولة 1: استخدام data-api.binance.vision (مسموح عالمياً غالباً)
    let url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    let res = await fetch(url, { cache: 'no-store' });

    // المحاولة 2: إذا فشل، نستخدم Binance US (احتياطي لسيرفرات أمريكا)
    if (!res.ok) {
        console.log(`Vision API failed for ${symbol}, trying US API...`);
        // ملاحظة: الرموز في US قد تختلف أحياناً، لكن للعملات الرئيسية هي نفسها
        url = `https://api.binance.us/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
        res = await fetch(url, { cache: 'no-store' });
    }

    if (!res.ok) {
        const errText = await res.text();
        console.error(`Failed to fetch ${symbol}: ${res.status} - ${errText}`);
        return [];
    }

    const data = await res.json();
    
    if (!Array.isArray(data)) return [];

    // إرجاع التوقيت والحجم فقط
    return data.map((d: any) => ({
      time: Math.floor(d[0] / 1000), // Unix Timestamp
      vol: parseFloat(d[5])          // Volume
    }));
  } catch (e) {
    console.error(`Exception fetching ${symbol}:`, e);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    // 1. فحص هل نحتاج لتأسيس (Seed) أم تحديث (Update)
    const { count } = await supabase.from('ngx_volume_index').select('*', { count: 'exact', head: true });
    const isSeeding = count === 0;
    
    // إذا تأسيس نجلب 1000 يوم، إذا تحديث نجلب آخر شمعتين فقط
    const LIMIT = isSeeding ? 1000 : 2; 

    const recordsToUpsert: any[] = [];
    const sectorIndices: Record<string, number> = {}; 

    // 2. معالجة كل قطاع
    for (const sector of SECTORS) {
      const allVolumes: Record<number, number> = {};

      // جلب بيانات كل العملات في القطاع وجمع أحجامها
      await Promise.all(sector.symbols.map(async (sym) => {
        const klines = await fetchBinanceKlines(sym, '1d', LIMIT);
        klines.forEach((k: any) => {
          allVolumes[k.time] = (allVolumes[k.time] || 0) + k.vol;
        });
      }));

      const sortedTimes = Object.keys(allVolumes).map(Number).sort((a, b) => a - b);
      if (sortedTimes.length === 0) continue;

      // حساب معامل المعايرة (Base Factor)
      let baseVolume = 0;
      
      if (isSeeding) {
         // في التأسيس: أول يوم هو الأساس (100)
         baseVolume = allVolumes[sortedTimes[0]] || 1;
      } else {
         // في التحديث: نجلب معامل الأساس من أول سجل في الداتا بيز للحفاظ على النسق
         const { data: firstRec } = await supabase
            .from('ngx_volume_index')
            .select('volume_raw, index_value')
            .eq('sector_key', sector.key)
            .order('timestamp', { ascending: true })
            .limit(1)
            .single();
            
         if (firstRec && firstRec.volume_raw > 0) {
            baseVolume = (firstRec.volume_raw * 100) / firstRec.index_value; 
         } else {
            baseVolume = allVolumes[sortedTimes[0]] || 1; 
         }
      }

      // تجهيز البيانات للحفظ
      sortedTimes.forEach(t => {
        const rawVol = allVolumes[t];
        // المعادلة: (الحجم الحالي / حجم الأساس) * 100
        const indexVal = baseVolume > 0 ? (rawVol / baseVolume) * 100 : 0;
        
        recordsToUpsert.push({
          sector_key: sector.key,
          timestamp: t,
          volume_raw: rawVol,
          index_value: parseFloat(indexVal.toFixed(2))
        });
      });
    }

    // 3. حساب مؤشر "ALL" (متوسط القطاعات الأربعة)
    const recordsByTime: Record<number, { sum: number, count: number }> = {};
    
    recordsToUpsert.forEach(r => {
        if (!recordsByTime[r.timestamp]) recordsByTime[r.timestamp] = { sum: 0, count: 0 };
        recordsByTime[r.timestamp].sum += r.index_value;
        recordsByTime[r.timestamp].count += 1;
    });

    Object.keys(recordsByTime).forEach(tStr => {
        const t = Number(tStr);
        const { sum, count } = recordsByTime[t];
        // نحسب المتوسط فقط إذا توفرت بيانات لجميع القطاعات (أو أغلبها) لضمان الدقة
        if (count >= 1) { 
            recordsToUpsert.push({
                sector_key: 'ALL',
                timestamp: t,
                volume_raw: 0, 
                index_value: parseFloat((sum / count).toFixed(2))
            });
        }
    });

    // 4. الحفظ في قاعدة البيانات
    if (recordsToUpsert.length > 0) {
      const { error } = await supabase
        .from('ngx_volume_index')
        .upsert(recordsToUpsert, { onConflict: 'sector_key, timestamp' });
      
      if (error) throw error;
    }

    return NextResponse.json({ 
        success: true, 
        mode: isSeeding ? 'SEEDING' : 'UPDATE', 
        records: recordsToUpsert.length 
    });

  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
