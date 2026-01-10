// src/app/api/cron/update-chart/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SECTORS = [
  { key: 'NAM', tokens: ['ethereum-name-service', 'space-id', 'bonfida'] },
  { key: 'ART', tokens: ['apecoin', 'blur', 'render-token'] },
  { key: 'GAM', tokens: ['immutable-x', 'gala', 'beam-2'] },
  { key: 'UTL', tokens: ['decentraland', 'the-sandbox', 'highstreet'] }
];

export async function GET(request: Request) {
  try {
    const allTokenIds = SECTORS.flatMap(s => s.tokens).join(',');
    
    // جلب الأسعار الحالية
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${allTokenIds}&vs_currencies=usd`,
      { cache: 'no-store' }
    );
    const data = await response.json();
    const now = Date.now();
    const recordsToInsert = [];

    // 1. حساب القطاعات الفرعية
    let totalAllSum = 0;
    let totalAllCount = 0;

    for (const sector of SECTORS) {
      let sumPrice = 0;
      let count = 0;

      sector.tokens.forEach(tokenId => {
        if (data[tokenId] && data[tokenId].usd) {
          sumPrice += data[tokenId].usd;
          count++;
        }
      });

      if (count > 0) {
        // إضافة سجل القطاع الفرعي
        const sectorValue = sumPrice / count;
        recordsToInsert.push({
          sector_key: sector.key,
          timestamp: now,
          value: sectorValue
        });

        // تجميع للقطاع العام
        totalAllSum += sectorValue;
        totalAllCount++;
      }
    }

    // 2. حساب وإضافة القطاع العام (ALL) - هذا كان ناقصاً
    if (totalAllCount > 0) {
        recordsToInsert.push({
            sector_key: 'ALL',
            timestamp: now,
            value: totalAllSum / totalAllCount // متوسط المتوسطات
        });
    }

    if (recordsToInsert.length > 0) {
      const { error } = await supabase.from('ngx_chart_history').insert(recordsToInsert);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, inserted: recordsToInsert.length });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
