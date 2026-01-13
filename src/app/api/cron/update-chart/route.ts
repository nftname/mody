import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Binance Symbols Mapping
const SECTORS = [
  { key: 'NAM', symbols: ['ENSUSDT', 'IDUSDT', 'FIDAUSDT'] },
  { key: 'ART', symbols: ['APEUSDT', 'BLURUSDT', 'RNDRUSDT'] },
  { key: 'GAM', symbols: ['IMXUSDT', 'GALAUSDT', 'BEAMXUSDT'] },
  { key: 'UTL', symbols: ['MANAUSDT', 'SANDUSDT', 'HIGHUSDT'] }
];

async function fetchBinanceKlines(symbol: string, interval: string, limit: number) {
  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    // Binance format: [openTime, open, high, low, close, volume, ...]
    // We need time (0) and volume (5)
    return data.map((d: any) => ({
      time: Math.floor(d[0] / 1000),
      vol: parseFloat(d[5])
    }));
  } catch (e) {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    // 1. Check if we need Full History (Seed) or Just Update
    const { count } = await supabase.from('ngx_volume_index').select('*', { count: 'exact', head: true });
    const isSeeding = count === 0;
    const LIMIT = isSeeding ? 1000 : 2; // 1000 days for seed, 2 candles for live update

    const recordsToUpsert: any[] = [];
    const sectorIndices: Record<string, number> = {}; 

    // 2. Process Each Sector
    for (const sector of SECTORS) {
      const allVolumes: Record<number, number> = {};

      // Fetch Data for all tokens in sector
      await Promise.all(sector.symbols.map(async (sym) => {
        const klines = await fetchBinanceKlines(sym, '1d', LIMIT);
        klines.forEach((k: any) => {
          allVolumes[k.time] = (allVolumes[k.time] || 0) + k.vol;
        });
      }));

      // Sort by time
      const sortedTimes = Object.keys(allVolumes).map(Number).sort((a, b) => a - b);
      if (sortedTimes.length === 0) continue;

      // Logic: If Seeding, find Base Volume (Day 1). If Update, fetch Base from DB or use Logic.
      // For simplicity in this logic: We recalculate the Base Logic if Seeding.
      
      let baseVolume = 0;
      
      if (isSeeding) {
         // First non-zero volume is the base
         baseVolume = allVolumes[sortedTimes[0]] || 1;
      } else {
         // In update mode, we need to maintain consistency. 
         // Realistically, we should fetch the "Base" from a stored config, 
         // but to keep it simple & robust: We retrieve the very first record of this sector to get the base ratio.
         // OR: We just save Raw Volume and let Frontend normalize? 
         // YOUR REQUEST: Backend calculates Index.
         // SOLVE: We will query the FIRST EVER record for this sector to get its Base Factor.
         
         const { data: firstRec } = await supabase
            .from('ngx_volume_index')
            .select('volume_raw, index_value')
            .eq('sector_key', sector.key)
            .order('timestamp', { ascending: true })
            .limit(1)
            .single();
            
         if (firstRec && firstRec.volume_raw > 0) {
            // Factor = 100 / volume_raw
            baseVolume = (firstRec.volume_raw * 100) / firstRec.index_value; 
         } else {
            baseVolume = allVolumes[sortedTimes[0]] || 1; // Fallback
         }
      }

      // Prepare Records
      sortedTimes.forEach(t => {
        const rawVol = allVolumes[t];
        const indexVal = baseVolume > 0 ? (rawVol / baseVolume) * 100 : 0;
        
        recordsToUpsert.push({
          sector_key: sector.key,
          timestamp: t,
          volume_raw: rawVol,
          index_value: parseFloat(indexVal.toFixed(2))
        });
        
        // Save latest for ALL calc
        if (t === sortedTimes[sortedTimes.length - 1]) {
            sectorIndices[sector.key] = parseFloat(indexVal.toFixed(2));
        }
      });
    }

    // 3. Calculate "ALL" Index (Average of 4 sectors)
    // For seeding "ALL", we would need to align timestamps across all sectors.
    // To save complexity: We will calculate ALL index only based on the data points we are inserting now.
    
    // Group records by Timestamp to calculate 'ALL'
    const recordsByTime: Record<number, { sum: number, count: number }> = {};
    
    recordsToUpsert.forEach(r => {
        if (!recordsByTime[r.timestamp]) recordsByTime[r.timestamp] = { sum: 0, count: 0 };
        recordsByTime[r.timestamp].sum += r.index_value;
        recordsByTime[r.timestamp].count += 1;
    });

    Object.keys(recordsByTime).forEach(tStr => {
        const t = Number(tStr);
        const { sum, count } = recordsByTime[t];
        if (count === 4) { // Only if we have data for all 4 sectors
            recordsToUpsert.push({
                sector_key: 'ALL',
                timestamp: t,
                volume_raw: 0, // Not applicable for ALL
                index_value: parseFloat((sum / 4).toFixed(2))
            });
        }
    });

    // 4. Batch Upsert
    if (recordsToUpsert.length > 0) {
      const { error } = await supabase.from('ngx_volume_index').upsert(recordsToUpsert, { onConflict: 'sector_key, timestamp' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, mode: isSeeding ? 'SEEDING' : 'UPDATE', records: recordsToUpsert.length });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
