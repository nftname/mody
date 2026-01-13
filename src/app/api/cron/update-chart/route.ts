import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SECTORS = [
  { key: 'NAM', symbols: ['ENSUSDT', 'IDUSDT', 'FIDAUSDT'] },
  { key: 'ART', symbols: ['APEUSDT', 'BLURUSDT', 'RNDRUSDT'] },
  { key: 'GAM', symbols: ['IMXUSDT', 'GALAUSDT', 'BEAMXUSDT'] },
  { key: 'UTL', symbols: ['MANAUSDT', 'SANDUSDT', 'HIGHUSDT'] }
];

async function fetchBinanceRecentPrice(symbol: string) {
  try {
    const url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`;
    let res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
        res = await fetch(`https://api.binance.us/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`, { cache: 'no-store' });
    }
    
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((d: any) => ({
      time: Math.floor(d[0] / 1000), 
      price: parseFloat(d[4]) // Close Price
    }));
  } catch (e) { return []; }
}

export async function GET(request: Request) {
  try {
    const recordsToUpsert: any[] = [];

    for (const sector of SECTORS) {
      const allPrices: Record<number, number> = {};
      const tokenCounts: Record<number, number> = {};
      let hasData = false;

      for (const symbol of sector.symbols) {
        const history = await fetchBinanceRecentPrice(symbol);
        if (history.length > 0) {
            hasData = true;
            history.forEach((h: any) => {
                const roundedTime = Math.floor(h.time / 3600) * 3600;
                allPrices[roundedTime] = (allPrices[roundedTime] || 0) + h.price;
                tokenCounts[roundedTime] = (tokenCounts[roundedTime] || 0) + 1;
            });
        }
      }

      if (!hasData) continue;
      const sortedTimes = Object.keys(allPrices).map(Number).sort((a, b) => a - b);

      // استرجاع معامل الأساس (Base 1000) من الداتا بيز
      const { data: firstRec } = await supabase
        .from('ngx_volume_index')
        .select('volume_raw, index_value')
        .eq('sector_key', sector.key)
        .order('timestamp', { ascending: true })
        .limit(1)
        .single();

      // Base = (Price * 1000) / Index
      let basePrice = 1;
      if (firstRec && firstRec.index_value > 0) {
         basePrice = (firstRec.volume_raw * 1000) / firstRec.index_value;
      } else {
         basePrice = (allPrices[sortedTimes[0]] / tokenCounts[sortedTimes[0]]) || 1;
      }

      sortedTimes.forEach(t => {
        const avgPrice = allPrices[t] / tokenCounts[t];
        const indexVal = basePrice > 0 ? (avgPrice / basePrice) * 1000 : 0;
        
        recordsToUpsert.push({
          sector_key: sector.key,
          timestamp: t,
          volume_raw: avgPrice,
          index_value: parseFloat(indexVal.toFixed(2))
        });
      });
    }

    // حساب ALL
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

    if (recordsToUpsert.length > 0) {
      await supabase.from('ngx_volume_index').upsert(recordsToUpsert, { onConflict: 'sector_key, timestamp' });
    }

    return NextResponse.json({ success: true, updated: recordsToUpsert.length });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
