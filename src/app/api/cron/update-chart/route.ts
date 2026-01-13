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
    
    // 1. Fetch current live prices from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${allTokenIds}&vs_currencies=usd`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
        throw new Error(`CoinGecko API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const now = Date.now(); // Current timestamp in ms
    const recordsToInsert = [];

    let totalAllSum = 0;
    let totalAllCount = 0;

    // 2. Calculate Sector Indices with Fail-Safes
    for (const sector of SECTORS) {
      let sumPrice = 0;
      let validTokenCount = 0;

      sector.tokens.forEach(tokenId => {
        // FAIL-SAFE: Check if token data exists and is a valid number
        if (data[tokenId] && typeof data[tokenId].usd === 'number') {
          sumPrice += data[tokenId].usd;
          validTokenCount++;
        }
      });

      if (validTokenCount > 0) {
        // Calculate average for this sector
        const sectorValue = sumPrice / validTokenCount; 
        
        recordsToInsert.push({
          sector_key: sector.key,
          timestamp: now,
          value: sectorValue
        });

        // Add to the Global Accumulator
        totalAllSum += sectorValue;
        totalAllCount++;
      }
    }

    // 3. Calculate "ALL" Index (The Global Benchmark)
    if (totalAllCount > 0) {
        recordsToInsert.push({
            sector_key: 'ALL',
            timestamp: now,
            value: totalAllSum / totalAllCount 
        });
    }

    // 4. Insert into Supabase (Persistence)
    if (recordsToInsert.length > 0) {
      const { error } = await supabase.from('ngx_chart_history').insert(recordsToInsert);
      if (error) throw error;
    }

    return NextResponse.json({ 
        success: true, 
        inserted: recordsToInsert.length, 
        timestamp: new Date(now).toISOString() 
    });

  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
