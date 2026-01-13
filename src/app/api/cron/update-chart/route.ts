import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SECTORS = [
  { key: 'NAM', ids: ['ethereum-name-service', 'space-id', 'bonfida'] },
  { key: 'ART', ids: ['apecoin', 'blur', 'render-token'] },
  { key: 'GAM', ids: ['immutable-x', 'gala', 'beam-2'] },
  { key: 'UTL', ids: ['decentraland', 'the-sandbox', 'highstreet'] }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchCoinGeckoHistory(coinId: string, days: string | number) {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
        console.error(`Error fetching ${coinId}: ${res.status}`);
        return null;
    }

    const data = await res.json();
    if (!data.total_volumes || !Array.isArray(data.total_volumes)) return null;

    return data.total_volumes.map((item: any[]) => ({
      time: Math.floor(item[0] / 1000), 
      vol: item[1]
    }));

  } catch (e) {
    console.error(`Exception fetching ${coinId}:`, e);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { count } = await supabase.from('ngx_volume_index').select('*', { count: 'exact', head: true });
    
    // التعديل هنا: إذا كان تأسيس، اطلب "max" (كل السنوات)، وإذا تحديث اطلب يوم واحد
    const isSeeding = count === 0;
    const DAYS = isSeeding ? 'max' : 1; 

    const recordsToUpsert: any[] = [];

    for (const sector of SECTORS) {
      const allVolumes: Record<number, number> = {};
      let hasData = false;

      for (const coinId of sector.ids) {
        const history = await fetchCoinGeckoHistory(coinId, DAYS);
        
        if (history) {
            hasData = true;
            history.forEach((h: any) => {
                const roundedTime = Math.floor(h.time / 3600) * 3600;
                allVolumes[roundedTime] = (allVolumes[roundedTime] || 0) + h.vol;
            });
        }
        if (isSeeding) await delay(1500); 
      }

      if (!hasData) continue;

      const sortedTimes = Object.keys(allVolumes).map(Number).sort((a, b) => a - b);
      if (sortedTimes.length === 0) continue;

      let baseVolume = 0;

      if (isSeeding) {
         baseVolume = allVolumes[sortedTimes[0]] || 1;
      } else {
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

    const recordsByTime: Record<number, { sum: number, count: number }> = {};
    recordsToUpsert.forEach(r => {
        if (!recordsByTime[r.timestamp]) recordsByTime[r.timestamp] = { sum: 0, count: 0 };
        recordsByTime[r.timestamp].sum += r.index_value;
        recordsByTime[r.timestamp].count += 1;
    });

    Object.keys(recordsByTime).forEach(tStr => {
        const t = Number(tStr);
        const { sum, count } = recordsByTime[t];
        if (count >= 2) { 
            recordsToUpsert.push({
                sector_key: 'ALL',
                timestamp: t,
                volume_raw: 0, 
                index_value: parseFloat((sum / count).toFixed(2))
            });
        }
    });

    if (recordsToUpsert.length > 0) {
      const chunkSize = 1000;
      for (let i = 0; i < recordsToUpsert.length; i += chunkSize) {
        const chunk = recordsToUpsert.slice(i, i + chunkSize);
        const { error } = await supabase
            .from('ngx_volume_index')
            .upsert(chunk, { onConflict: 'sector_key, timestamp' });
        if (error) console.error('Supabase Insert Error:', error);
      }
    }

    return NextResponse.json({ 
        success: true, 
        source: 'CoinGecko',
        mode: isSeeding ? 'SEEDING' : 'UPDATE', 
        records: recordsToUpsert.length 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
