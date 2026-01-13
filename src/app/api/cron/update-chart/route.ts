import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // دقيقة واحدة كافية للتحديث

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// نفس العملات التي استخدمناها في السكريبت (Binance Pairs)
const SECTORS = [
  { key: 'NAM', symbols: ['ENSUSDT', 'IDUSDT', 'FIDAUSDT'] },
  { key: 'ART', symbols: ['APEUSDT', 'BLURUSDT', 'RNDRUSDT'] },
  { key: 'GAM', symbols: ['IMXUSDT', 'GALAUSDT', 'BEAMXUSDT'] },
  { key: 'UTL', symbols: ['MANAUSDT', 'SANDUSDT', 'HIGHUSDT'] }
];

// دالة خفيفة تجلب آخر شمعتين فقط للتحديث المستمر
async function fetchBinanceRecent(symbol: string) {
  try {
    // نطلب آخر شمعتين (اليوم وأمس) لضمان تحديث الشمعة الحالية وإغلاق الشمعة السابقة
    const url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=1d&limit=2`;
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
        // محاولة بديلة في حال فشل Vision API (للسيرفرات الأمريكية)
        const fallbackUrl = `https://api.binance.us/api/v3/klines?symbol=${symbol}&interval=1d&limit=2`;
        const fallbackRes = await fetch(fallbackUrl, { cache: 'no-store' });
        if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            return data.map((d: any) => ({ time: Math.floor(d[0] / 1000), vol: parseFloat(d[5]) }));
        }
        return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((d: any) => ({
      time: Math.floor(d[0] / 1000), 
      vol: parseFloat(d[5])
    }));
  } catch (e) {
    console.error(`Error fetching update for ${symbol}:`, e);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const recordsToUpsert: any[] = [];

    for (const sector of SECTORS) {
      const allVolumes: Record<number, number> = {};
      let hasData = false;

      // 1. جلب البيانات الحديثة لكل عملة
      for (const symbol of sector.symbols) {
        const history = await fetchBinanceRecent(symbol);
        if (history.length > 0) {
            hasData = true;
            history.forEach((h: any) => {
                // توحيد التوقيت (منتصف الليل)
                const roundedTime = Math.floor(h.time / 86400) * 86400;
                allVolumes[roundedTime] = (allVolumes[roundedTime] || 0) + h.vol;
            });
        }
      }

      if (!hasData) continue;
      const sortedTimes = Object.keys(allVolumes).map(Number).sort((a, b) => a - b);

      // 2. جلب "قيمة الأساس" (Base Volume) من أول سجل في التاريخ
      // هذا ضروري لكي يتم حساب المؤشر بنفس معيار الـ 8000 يوم السابقة
      const { data: firstRec } = await supabase
        .from('ngx_volume_index')
        .select('volume_raw, index_value')
        .eq('sector_key', sector.key)
        .order('timestamp', { ascending: true }) // الأقدم أولاً
        .limit(1)
        .single();

      let baseVolume = 1;
      if (firstRec && firstRec.volume_raw > 0) {
         // استخراج معامل الأساس: (Volume / Index) * 100
         // أو ببساطة: إذا كان المؤشر = (Vol / Base) * 100
         // إذن Base = (Vol * 100) / Index
         baseVolume = (firstRec.volume_raw * 100) / firstRec.index_value;
      } else {
         // في حالة نادرة جداً (الجدول فارغ)، نعتبر الحجم الحالي هو الأساس
         baseVolume = allVolumes[sortedTimes[0]] || 1;
      }

      // 3. حساب قيمة المؤشر الجديدة
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

    // 4. حساب تحديث قطاع ALL
    const recordsByTime: Record<number, { sum: number, count: number }> = {};
    recordsToUpsert.forEach(r => {
        if (!recordsByTime[r.timestamp]) recordsByTime[r.timestamp] = { sum: 0, count: 0 };
        recordsByTime[r.timestamp].sum += r.index_value;
        recordsByTime[r.timestamp].count += 1;
    });

    Object.keys(recordsByTime).forEach(tStr => {
        const t = Number(tStr);
        const { sum, count } = recordsByTime[t];
        // نقبل التحديث حتى لو لقطاع واحد لضمان الاستمرارية، لكن الأفضل اكتمال البيانات
        if (count >= 1) { 
            recordsToUpsert.push({
                sector_key: 'ALL',
                timestamp: t,
                volume_raw: 0, 
                index_value: parseFloat((sum / count).toFixed(2))
            });
        }
    });

    // 5. الحفظ في قاعدة البيانات
    if (recordsToUpsert.length > 0) {
      const { error } = await supabase
        .from('ngx_volume_index')
        .upsert(recordsToUpsert, { onConflict: 'sector_key, timestamp' });
      
      if (error) throw error;
    }

    return NextResponse.json({ 
        success: true, 
        source: 'Binance (Live Update)', 
        recordsUpdated: recordsToUpsert.length 
    });

  } catch (error: any) {
    console.error("Cron Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
