import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../data/config";
import ABI from "../data/abi.json";

export interface NGXMetric {
  value: number;
  label: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface NGXData {
  score: number;
  status: 'Panic' | 'Weak' | 'Neutral' | 'Bullish' | 'Hyper';
  change24h: number;
  lastUpdate: string;
  breakdown: {
    price: number;
    volume: number;
    sentiment: number;
    activity: number;
  };
}

let cachedData: NGXData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function getNGXLiveScore(): Promise<NGXData> {
  const now = Date.now();

  if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedData;
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,ethereum-name-service&vs_currencies=usd&include_24hr_change=true"
    );
    const marketData = await response.json();

    const ethChange = marketData.ethereum.usd_24h_change || 0;
    const ensChange = marketData['ethereum-name-service'].usd_24h_change || 0;

    const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.registry, provider);
    
    let nnmSupply = 0;
    try {
        const supplyBigInt = await contract.totalSupply();
        nnmSupply = Number(supplyBigInt);
    } catch (e) {
        nnmSupply = 0;
    }

    const marketScore = 50 + (ethChange * 2); 
    const nameMarketScore = 50 + (ensChange * 2);
    const nnmActivityBonus = Math.min(nnmSupply * 0.1, 20);

    let finalScore = (marketScore * 0.7) + ((nameMarketScore + nnmActivityBonus) * 0.3);

    finalScore = Math.max(10, Math.min(99, finalScore));

    let status: NGXData['status'] = 'Neutral';
    if (finalScore < 30) status = 'Panic';
    else if (finalScore < 45) status = 'Weak';
    else if (finalScore < 60) status = 'Neutral';
    else if (finalScore < 75) status = 'Bullish';
    else status = 'Hyper';

    const newData: NGXData = {
      score: Number(finalScore.toFixed(2)),
      status: status,
      change24h: Number(((ethChange * 0.7) + (ensChange * 0.3)).toFixed(2)),
      lastUpdate: new Date().toISOString(),
      breakdown: {
        price: Number(Math.min(99, 50 + ethChange * 3).toFixed(1)),
        volume: Number(Math.min(99, 40 + Math.abs(ethChange) * 5).toFixed(1)),
        sentiment: Number(Math.min(99, 50 + ensChange * 3).toFixed(1)),
        activity: Number(Math.min(99, 30 + nnmActivityBonus * 2).toFixed(1))
      }
    };

    cachedData = newData;
    lastFetchTime = now;

    return newData;

  } catch (error) {
    if (cachedData) return cachedData;
    
    return {
      score: 50.0,
      status: 'Neutral',
      change24h: 0,
      lastUpdate: new Date().toISOString(),
      breakdown: { price: 50, volume: 50, sentiment: 50, activity: 50 }
    };
  }
}

export const NGX_HISTORY = [
  { time: '2024-Q1', value: 45 },
  { time: '2024-Q2', value: 52 },
  { time: '2024-Q3', value: 48 },
  { time: '2024-Q4', value: 65 },
  { time: '2025-Q1', value: 83 },
  { time: '2025-Q2', value: 95 },
  { time: '2025-Q3', value: 110 },
  { time: '2025-Q4', value: 145 }
];
