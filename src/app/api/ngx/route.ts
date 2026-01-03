import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface NGXData {
  score: number;
  status: 'STRONG SELL' | 'SELL' | 'NEUTRAL' | 'BUY' | 'STRONG BUY';
  change24h: number;
  lastUpdate: string;
  marketCap: {
    total: number;
    change: number;
  };
  volume: {
    total: number;
    intensity: number; // 0 to 100 representation of buying pressure
    sectors: number[]; // Array for the bars [Identity, Art, Gaming, Total]
  };
}

let cachedData: NGXData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000;

export async function GET() {
  const now = Date.now();

  if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
    return NextResponse.json(cachedData);
  }

  try {
    // Fetch Price, 24h Change, Market Cap, and Total Volume
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network,ethereum-name-service,apecoin,immutable-x&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true',
      { 
        next: { revalidate: 60 }, 
        headers: { 'Accept': 'application/json' } 
      }
    );

    if (!response.ok) {
        throw new Error('API Error');
    }

    const data = await response.json();
    
    // Extract Changes
    const ethChange = data.ethereum.usd_24h_change || 0;
    const identityChange = data['ethereum-name-service'].usd_24h_change || 0;
    const artChange = data.apecoin.usd_24h_change || 0;
    const gamingChange = data['immutable-x'].usd_24h_change || 0;

    // Calculate NGX Score
    const globalMomentum = 
        (identityChange * 0.30) + 
        (artChange * 0.25) + 
        (gamingChange * 0.25) + 
        (ethChange * 0.20);
    
    let finalScore = 50 + (globalMomentum * 3.5);
    finalScore = Math.max(10, Math.min(95, finalScore));

    let status: NGXData['status'] = 'NEUTRAL';
    if (finalScore < 25) status = 'STRONG SELL';
    else if (finalScore < 45) status = 'SELL';
    else if (finalScore < 55) status = 'NEUTRAL';
    else if (finalScore < 75) status = 'BUY';
    else status = 'STRONG BUY';

    // Calculate Market Cap (Proxy for NFT Market using our basket)
    const totalCap = 
        data['ethereum-name-service'].usd_market_cap + 
        data.apecoin.usd_market_cap + 
        data['immutable-x'].usd_market_cap;
    
    // Average Change for the Cap visual
    const avgCapChange = (identityChange + artChange + gamingChange) / 3;

    // Calculate Buying Pressure (Volume / Cap Ratio)
    // We create an array for the bars: [ENS Vol, APE Vol, IMX Vol, Overall Ratio]
    const volENS = data['ethereum-name-service'].usd_24h_vol;
    const volAPE = data.apecoin.usd_24h_vol;
    const volIMX = data['immutable-x'].usd_24h_vol;
    const totalVol = volENS + volAPE + volIMX;

    // Normalize volumes for the bars (relative to the total)
    // This makes the bars "Real" representations of which sector has volume right now
    const bar1 = (volENS / totalVol) * 100; // Identity Bar
    const bar2 = (volAPE / totalVol) * 100; // Art Bar
    const bar3 = (volIMX / totalVol) * 100; // Gaming Bar
    
    // Pressure Intensity (Turnover ratio)
    const turnoverRatio = (totalVol / totalCap) * 100; // Higher = More trading activity

    cachedData = {
      score: Number(finalScore.toFixed(1)),
      status: status,
      change24h: Number(globalMomentum.toFixed(2)),
      lastUpdate: new Date().toISOString(),
      marketCap: {
        total: totalCap,
        change: avgCapChange
      },
      volume: {
        total: totalVol,
        intensity: turnoverRatio,
        sectors: [bar1, bar2, bar3, turnoverRatio * 5] // 4th bar is overall intensity
      }
    };
    lastFetchTime = now;

    return NextResponse.json(cachedData);

  } catch (error) {
    // Fallback data
    return NextResponse.json(cachedData || {
        score: 50.0,
        status: 'NEUTRAL',
        change24h: 0,
        lastUpdate: new Date().toISOString(),
        marketCap: { total: 0, change: 0 },
        volume: { total: 0, intensity: 0, sectors: [20, 20, 20, 20] }
    });
  }
}
