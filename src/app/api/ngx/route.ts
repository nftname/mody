import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface NGXData {
  score: number;
  status: 'STRONG SELL' | 'SELL' | 'NEUTRAL' | 'BUY' | 'STRONG BUY';
  change24h: number;
  lastUpdate: string;
  crypto: {
    eth: { price: number; change: number };
    matic: { price: number; change: number };
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
    // جلب سلة العملات الممثلة للقطاعات
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network,ethereum-name-service,apecoin,immutable-x&vs_currencies=usd&include_24hr_change=true',
      { next: { revalidate: 60 }, headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) {
        throw new Error('API Error');
    }

    const prices = await response.json();
    
    // استخراج نسب التغير
    const ethChange = prices.ethereum.usd_24h_change || 0;
    const maticChange = prices['matic-network'].usd_24h_change || 0;
    
    const identitySector = prices['ethereum-name-service'].usd_24h_change || 0; // ENS (Identity 30%)
    const artSector = prices.apecoin.usd_24h_change || 0; // APE (Art 25%)
    const gamingSector = prices['immutable-x'].usd_24h_change || 0; // IMX (Gaming 25%)

    // المعادلة العالمية الجديدة
    const globalMomentum = 
        (identitySector * 0.30) + 
        (artSector * 0.25) + 
        (gamingSector * 0.25) + 
        (ethChange * 0.20);
    
    // تحويل الزخم إلى رقم مؤشر (Base 50)
    let finalScore = 50 + (globalMomentum * 3.5);
    finalScore = Math.max(10, Math.min(95, finalScore));

    let status: NGXData['status'] = 'NEUTRAL';
    if (finalScore < 25) status = 'STRONG SELL';
    else if (finalScore < 45) status = 'SELL';
    else if (finalScore < 55) status = 'NEUTRAL';
    else if (finalScore < 75) status = 'BUY';
    else status = 'STRONG BUY';

    cachedData = {
      score: Number(finalScore.toFixed(1)),
      status: status,
      change24h: Number(globalMomentum.toFixed(2)),
      lastUpdate: new Date().toISOString(),
      crypto: {
        eth: { price: prices.ethereum.usd, change: ethChange },
        matic: { price: prices['matic-network'].usd, change: maticChange }
      }
    };
    lastFetchTime = now;

    return NextResponse.json(cachedData);

  } catch (error) {
    return NextResponse.json(cachedData || {
        score: 52.5,
        status: 'NEUTRAL',
        change24h: 0.5,
        lastUpdate: new Date().toISOString(),
        crypto: {
            eth: { price: 3200, change: 0 },
            matic: { price: 0.5, change: 0 }
        }
    });
  }
}