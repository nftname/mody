import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SectorData {
  label: string;
  value: number;
  color: string;
  volume: string;
  change: number; // مطلوب في الواجهة
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
    // 1. سلة العملات (نفس التعديل السابق)
    const tokens = {
      nam: ['ethereum-name-service', 'space-id', 'bonfida'],
      art: ['apecoin', 'blur', 'render-token'],
      gam: ['immutable-x', 'gala', 'beam-2'],
      utl: ['decentraland', 'the-sandbox', 'highstreet']
    };

    const allIds = [
      ...tokens.nam, ...tokens.art, ...tokens.gam, ...tokens.utl
    ].join(',');

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${allIds}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`,
      { 
        next: { revalidate: 60 }, 
        headers: { 'Accept': 'application/json' } 
      }
    );

    if (!response.ok) throw new Error('API Error');
    const data = await response.json();

    const calculateSector = (ids: string[], label: string, color: string) => {
      let totalVol = 0;
      let totalChange = 0;
      let validCount = 0;

      ids.forEach(id => {
        const coin = data[id];
        if (coin) {
          totalVol += coin.usd_24h_vol || 0;
          totalChange += coin.usd_24h_change || 0;
          validCount++;
        }
      });

      const avgChange = validCount > 0 ? totalChange / validCount : 0;

      return {
        label: label,
        value: 0, // سيتم حسابه لاحقاً
        rawVol: totalVol,
        volume: `$${(totalVol / 1000000).toFixed(1)}M`,
        change: avgChange,
        color: color
      };
    };

    const sectorsRaw = [
      calculateSector(tokens.nam, 'NAM', '#38BDF8'),
      calculateSector(tokens.art, 'ART', '#7B61FF'),
      calculateSector(tokens.gam, 'GAM', '#0ECB81'),
      calculateSector(tokens.utl, 'UTL', '#00D8D6')
    ];

    const maxVol = Math.max(...sectorsRaw.map(s => s.rawVol));
    
    // تصحيح: تعيين البيانات مع الحفاظ على change
    const sectors: SectorData[] = sectorsRaw.map(s => ({
      label: s.label,
      value: maxVol > 0 ? Math.round((s.rawVol / maxVol) * 100) : 0,
      color: s.color,
      volume: s.volume,
      change: s.change // تم تمرير القيمة هنا لحل الخطأ
    }));

    const totalMarketChange = sectorsRaw.reduce((acc, curr) => acc + curr.change, 0) / 4;
    const sortedByChange = [...sectorsRaw].sort((a, b) => b.change - a.change);
    const topGainer = sortedByChange[0];
    const topLoser = sortedByChange[sortedByChange.length - 1];

    cachedData = {
      sectors: sectors, // تمرير المصفوفة كاملة كما هي
      marketStats: {
        totalVolChange: Number(totalMarketChange.toFixed(2)),
        topGainer: { name: topGainer.label, change: Number(topGainer.change.toFixed(2)) },
        topLoser: { name: topLoser.label, change: Number(topLoser.change.toFixed(2)) }
      },
      lastUpdate: new Date().toISOString()
    };
    lastFetchTime = now;

    return NextResponse.json(cachedData);

  } catch (error) {
    // تصحيح: إضافة change إلى بيانات الطوارئ
    return NextResponse.json({
        sectors: [
            { label: 'NAM', value: 80, color: '#38BDF8', volume: '$45M', change: 2.5 },
            { label: 'ART', value: 60, color: '#7B61FF', volume: '$35M', change: -1.2 },
            { label: 'GAM', value: 70, color: '#0ECB81', volume: '$40M', change: 5.0 },
            { label: 'UTL', value: 40, color: '#00D8D6', volume: '$20M', change: 0.5 }
        ],
        marketStats: {
            totalVolChange: 0.5,
            topGainer: { name: 'NAM', change: 2.5 },
            topLoser: { name: 'ART', change: -1.2 }
        },
        lastUpdate: new Date().toISOString()
    });
  }
}
