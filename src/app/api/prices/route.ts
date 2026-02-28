import { NextResponse } from 'next/server';

let cachedPrices: any = null;
let lastUpdate = 0;

const CACHE_DURATION = 60 * 1000; 

export async function GET() {
    const now = Date.now();

    if (cachedPrices && (now - lastUpdate < CACHE_DURATION)) {
        return NextResponse.json(cachedPrices);
    }

    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token,matic-network,ethereum&vs_currencies=usd&include_24hr_change=true',
            { next: { revalidate: 60 } } 
        );

        const data = await response.json();

        const polPrice = data['polygon-ecosystem-token']?.usd || data['matic-network']?.usd || 0;
        const ethPrice = data['ethereum']?.usd || 0;
        
        const polChange = data['polygon-ecosystem-token']?.usd_24h_change || data['matic-network']?.usd_24h_change || 0;
        const ethChange = data['ethereum']?.usd_24h_change || 0;

        const prices = {
            pol: polPrice,
            eth: ethPrice,
            usd: 1, 
            timestamp: new Date().toISOString(),
            polChange: polChange,
            ethChange: ethChange
        };

        cachedPrices = prices;
        lastUpdate = now;

        return NextResponse.json(prices);

    } catch (error) {
        console.error("Price API Fetch Error:", error);
        
        if (cachedPrices) return NextResponse.json(cachedPrices);

        return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
}
