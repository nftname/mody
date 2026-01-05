import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SectorData {
  label: string;
  value: number;
  color: string;
  volume: string;
}

interface NGXAssetsData {
  sectors: SectorData[];
  lastUpdate: string;
}

let cachedData: NGXAssetsData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000;

export async function GET() {
  const now = Date.now();

  if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
    return NextResponse.json(cachedData);
  }

  try {
    // 1. Fetch Proxy Data from CoinGecko
    // ENS (Domains), ApeCoin (Art), Immutable-X (Gaming), Decentraland (Utility)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum-name-service,apecoin,immutable-x,decentraland&vs_currencies=usd&include_24hr_vol=true',
      { 
        next: { revalidate: 60 }, 
        headers: { 'Accept': 'application/json' } 
      }
    );

    if (!response.ok) throw new Error('API Error');
    const data = await response.json();

    // 2. Extract Volumes (Proxies for Activity)
    const volENS = data['ethereum-name-service']?.usd_24h_vol || 50000000;
    const volAPE = data.apecoin?.usd_24h_vol || 40000000;
    const volIMX = data['immutable-x']?.usd_24h_vol || 30000000;
    const volMANA = data.decentraland?.usd_24h_vol || 20000000;

    // 3. Logic: Find the "Leader" to set the 100% Scale
    // We want the highest real volume to be the full height bar.
    const maxVol = Math.max(volENS, volAPE, volIMX, volMANA);

    // 4. Strategic Logic for "Imperium" (IMP)
    // Goal: ~75% of the Leader (Humble but strong presence)
    // We create a simulated volume that is always competitive but slightly lower than the max.
    // Random jitter (0.95 to 1.05) to make it look alive.
    const impVolumeBase = maxVol * 0.75; 
    const impVolume = impVolumeBase * (0.95 + Math.random() * 0.1); 

    // 5. Build the Bars Data
    // Colors: Blue-Grey for market (#607D8B), Gold for IMP (#FCD535)
    
    // Function to calculate bar height (percentage)
    const calcHeight = (vol: number) => Math.round((vol / maxVol) * 100);
    // Function to format volume string (e.g. $45M)
    const fmtVol = (vol: number) => `$${(vol / 1000000).toFixed(1)}M`;

    const sectors: SectorData[] = [
      { 
        label: 'IMP', // Imperium
        value: calcHeight(impVolume), 
        color: '#FCD535', // Gold - The Distinguished Asset
        volume: 'High Stability' // Custom tooltip text
      },
      { 
        label: 'DOM', // Domains (ENS)
        value: calcHeight(volENS), 
        color: '#607D8B', // Blue-Grey
        volume: fmtVol(volENS)
      },
      { 
        label: 'ART', // Art (APE)
        value: calcHeight(volAPE), 
        color: '#546E7A', // Slightly darker Blue-Grey
        volume: fmtVol(volAPE)
      },
      { 
        label: 'GAM', // Gaming (IMX)
        value: calcHeight(volIMX), 
        color: '#78909C', // Slightly lighter Blue-Grey
        volume: fmtVol(volIMX)
      },
      { 
        label: 'UTL', // Utility (MANA)
        value: calcHeight(volMANA), 
        color: '#455A64', // Dark Blue-Grey
        volume: fmtVol(volMANA)
      }
    ];

    cachedData = {
      sectors,
      lastUpdate: new Date().toISOString()
    };
    lastFetchTime = now;

    return NextResponse.json(cachedData);

  } catch (error) {
    // Fallback if API fails
    return NextResponse.json({
        sectors: [
            { label: 'IMP', value: 75, color: '#FCD535', volume: 'High' },
            { label: 'DOM', value: 95, color: '#607D8B', volume: '$50M' },
            { label: 'ART', value: 60, color: '#546E7A', volume: '$30M' },
            { label: 'GAM', value: 80, color: '#78909C', volume: '$40M' },
            { label: 'UTL', value: 40, color: '#455A64', volume: '$20M' }
        ],
        lastUpdate: new Date().toISOString()
    });
  }
}
