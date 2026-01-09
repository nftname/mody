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
  // (اختياري) التحقق من مفتاح سري لضمان أن لا أحد غيرك يستدعي هذا الرابط
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { return new Response('Unauthorized', { status: 401 }); }

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
        recordsToInsert.push({
          sector_key: sector.key,
          timestamp: now,
          value: sumPrice / count // نفس معادلة المتوسط في السكربت التاريخي
        });
      }
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
