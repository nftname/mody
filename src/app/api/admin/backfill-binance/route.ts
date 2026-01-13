
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// السماح بتشغيل السكريبت لفترة أطول (لأنه يعالج بيانات 7 أيام)
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// خريطة الأزواج على Binance
const BINANCE_PAIRS = {
  NAM: ['ENSUSDT', 'IDUSDT', 'FIDAUSDT'],
  ART: ['APEUSDT', 'BLURUSDT', 'RNDRUSDT'],
  GAM: ['IMXUSDT', 'GALAUSDT', 'BEAMXUSDT'],
  UTL: ['MANAUSDT', 'SANDUSDT', 'HIGHUSDT']
};

export async function GET(request: Request) {
  try {
    const limit = 168; // 7 days * 24 hours
    const interval = '1h';
    
    // 1. جلب البيانات الخام من Binance لكل العملات دفعة واحدة
    // تخزين مؤقت: Map<Symbol, Map<Timestamp, Price>>
    const marketData: Record<string, Record<number, number>> = {};
    const allSymbols = Object.values(BINANCE_PAIRS).flat();

    console.log(`Starting Binance Backfill for ${allSymbols.length} pairs...`);

    await Promise.all(allSymbols.map(async (symbol) => {
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        if (!res.ok) {
            console.error(`Failed to fetch ${symbol}: ${res.statusText}`);
            return;
        }
        const data = await res.json();
        // Binance Kline format: [Open Time, Open, High, Low, Close, ...]
        // We use Close price (index 4)
        marketData[symbol] = {};
        data.forEach((kline: any[]) => {
            const time = kline[0]; // timestamp in ms
            const closePrice = parseFloat(kline[4]);
            marketData[symbol][time] = closePrice;
        });
    }));

    // 2. تجميع التوقيتات المشتركة (لضمان المحاذاة)
    // نأخذ توقيتات أول عملة كمرجع (ENSUSDT)
    const timestamps = Object.keys(marketData['ENSUSDT'] || {}).map(Number).sort((a, b) => a - b);

    const recordsToUpsert = [];

    // 3. حساب المؤشرات لكل ساعة
    for (const ts of timestamps) {
        let totalAllSum = 0;
        let totalAllCount = 0;

        // لكل قطاع
        for (const [sectorKey, symbols] of Object.entries(BINANCE_PAIRS)) {
            let sumPrice = 0;
            let count = 0;

            symbols.forEach(sym => {
                if (marketData[sym] && marketData[sym][ts]) {
                    sumPrice += marketData[sym][ts];
                    count++;
                }
            });

            if (count > 0) {
                const sectorValue = sumPrice / count;
                
                // سجل القطاع
                recordsToUpsert.push({
                    sector_key: sectorKey,
                    timestamp: ts,
                    value: sectorValue
                });

                // تجميع للمؤشر العام
                totalAllSum += sectorValue;
                totalAllCount++;
            }
        }

        // سجل المؤشر العام
        if (totalAllCount > 0) {
            recordsToUpsert.push({
                sector_key: 'ALL',
                timestamp: ts,
                value: totalAllSum / totalAllCount
            });
        }
    }

    // 4. الإرسال لقاعدة البيانات (Upsert Logic)
    // نستخدم upsert بدلاً من insert لكي يقوم بتحديث البيانات الموجودة أو إضافة المفقودة
    if (recordsToUpsert.length > 0) {
        // نقسم البيانات لدفعات صغيرة لتجنب أخطاء الحجم
        const batchSize = 100;
        for (let i = 0; i < recordsToUpsert.length; i += batchSize) {
            const batch = recordsToUpsert.slice(i, i + batchSize);
            const { error } = await supabase
                .from('ngx_chart_history')
                .upsert(batch, { onConflict: 'sector_key,timestamp' }); // هام: يجب أن يكون هناك unique constraint في الداتا بيز، وإلا سيعمل كـ insert
            
            if (error) {
                // إذا لم يكن هناك unique constraint، سنستخدم insert عادي وسيقبل التكرار (ليس مشكلة كبيرة في حالتك لأننا سنرتب ونفلتر عند العرض)
                // لكن الأفضل هو upsert
                console.warn("Upsert failed, trying insert (might duplicate):", error.message);
                await supabase.from('ngx_chart_history').insert(batch);
            }
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: `Backfilled ${timestamps.length} hours (approx 7 days) of data from Binance.`,
        records_processed: recordsToUpsert.length
    });

  } catch (error: any) {
    console.error("Backfill Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
