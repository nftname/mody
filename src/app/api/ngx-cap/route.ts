import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface CoinData {
  id: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: {
    price: number[];
  };
}

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum-name-service,apecoin,immutable-x,render-token,blur,decentraland,the-sandbox&sparkline=true',
      {
        next: { revalidate: 60 },
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data: CoinData[] = await response.json();

    let totalMarketCap = 0;
    let weightedChangeSum = 0;
    let weightedProgressSum = 0;

    data.forEach((coin) => {
      totalMarketCap += coin.market_cap;
    });

    data.forEach((coin) => {
      const weight = coin.market_cap / totalMarketCap;
      
      weightedChangeSum += (coin.price_change_percentage_24h * weight);

      const prices = coin.sparkline_in_7d.price;
      const min7d = Math.min(...prices);
      const max7d = Math.max(...prices);
      const current = coin.current_price;

      let progress = 50;
      if (max7d !== min7d) {
        progress = ((current - min7d) / (max7d - min7d)) * 100;
      }
      progress = Math.max(0, Math.min(100, progress));

      weightedProgressSum += (progress * weight);
    });

    const formatMarketCap = (num: number) => {
      if (num >= 1e12) {
        return '$' + (num / 1e12).toFixed(2) + 'T';
      } else if (num >= 1e9) {
        return '$' + (num / 1e9).toFixed(2) + 'B';
      } else {
        return '$' + (num / 1e6).toFixed(2) + 'M';
      }
    };

    return NextResponse.json({
      marketCap: formatMarketCap(totalMarketCap),
      change24h: Number(weightedChangeSum.toFixed(2)),
      rangeProgress: Math.round(weightedProgressSum)
    });

  } catch (error) {
    return NextResponse.json({
      marketCap: '$0.00B',
      change24h: 0,
      rangeProgress: 50
    });
  }
}
