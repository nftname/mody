import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SectorData {
  label: string;
  value: number;
  color: string;
  volume: string;
}

interface MarketStats {
  totalVolChange: number;
  topGainer: { name: string; change: number };
  topLoser: { name: string; change: number };
}

interface NGXVolumeData {
  sectors: SectorData[];
  marketStats: MarketStats;
  lastUpdate: string;
}

let cachedData: NGXVolumeData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000;

export async function GET() {
  const now = Date.now();

  if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
    return NextResponse.json(cachedData);
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum-name-service,apecoin,immutable-x,decentraland&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true',
      { 
        next: { revalidate: 60 }, 
        headers: { 'Accept': 'application/json' } 
      }
    );

    if (!response.ok) throw new Error('API Error');
    const data = await response.json();

    const tokens = [
        // تم تغيير التسمية من DOM إلى NAM لتعكس Digital Name Assets
        { id: 'ethereum-name-service', label: 'NAM', vol: data['ethereum-name-service'].usd_24h_vol, change: data['ethereum-name-service'].usd_24h_change },
        { id: 'apecoin', label: 'ART', vol: data.apecoin.usd_24h_vol, change: data.apecoin.usd_24h_change },
        { id: 'immutable-x', label: 'GAM', vol: data['immutable-x'].usd_24h_vol, change: data['immutable-x'].usd_24h_change },
        { id: 'decentraland', label: 'UTL', vol: data.decentraland.usd_24h_vol, change: data.decentraland.usd_24h_change }
    ];

    const maxVol = Math.max(...tokens.map(t => t.vol));
    const totalVolChange = tokens.reduce((acc, curr) => acc + curr.change, 0) / tokens.length;
    
    // تم حذف منطق Imperium Logic (impVolume) نهائياً

    const calcHeight = (vol: number) => Math.round((vol / maxVol) * 100);
    const fmtVol = (vol: number) => `$${(vol / 1000000).toFixed(1)}M`;

    // تم حذف SOV من هنا، وتعيين ألوان مميزة لكل قطاع
    const sectors: SectorData[] = [
      { label: 'NAM', value: calcHeight(tokens[0].vol), color: '#38BDF8', volume: fmtVol(tokens[0].vol) }, // Blue for Names
      { label: 'ART', value: calcHeight(tokens[1].vol), color: '#7B61FF', volume: fmtVol(tokens[1].vol) }, // Purple for Art
      { label: 'GAM', value: calcHeight(tokens[2].vol), color: '#0ECB81', volume: fmtVol(tokens[2].vol) }, // Green for Gaming
      { label: 'UTL', value: calcHeight(tokens[3].vol), color: '#00D8D6', volume: fmtVol(tokens[3].vol) }  // Teal for Utility
    ];

    const sortedByChange = [...tokens].sort((a, b) => b.change - a.change);
    const topGainer = sortedByChange[0];
    const topLoser = sortedByChange[sortedByChange.length - 1];

    cachedData = {
      sectors,
      marketStats: {
        totalVolChange: Number(totalVolChange.toFixed(2)),
        topGainer: { name: topGainer.label, change: Number(topGainer.change.toFixed(2)) },
        topLoser: { name: topLoser.label, change: Number(topLoser.change.toFixed(2)) }
      },
      lastUpdate: new Date().toISOString()
    };
    lastFetchTime = now;

    return NextResponse.json(cachedData);

  } catch (error) {
    // بيانات احتياطية نظيفة بدون SOV
    return NextResponse.json({
        sectors: [
            { label: 'NAM', value: 90, color: '#38BDF8', volume: '$50M' },
            { label: 'ART', value: 50, color: '#7B61FF', volume: '$30M' },
            { label: 'GAM', value: 70, color: '#0ECB81', volume: '$40M' },
            { label: 'UTL', value: 40, color: '#00D8D6', volume: '$20M' }
        ],
        marketStats: {
            totalVolChange: 12.5,
            topGainer: { name: 'GAM', change: 5.2 },
            topLoser: { name: 'ART', change: -1.2 }
        },
        lastUpdate: new Date().toISOString()
    });
  }
}
