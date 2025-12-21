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
  
  export const NGX_HISTORY = [
    { time: '2021-Q1', value: 45 },
    { time: '2021-Q3', value: 88 },
    { time: '2022-Q2', value: 32 },
    { time: '2023-Q1', value: 40 },
    { time: '2023-Q4', value: 55 },
    { time: '2024-Q2', value: 72 },
    { time: '2025-Q1', value: 83 },
    { time: '2025-Q3', value: 95 },
    { time: '2026-Q1', value: 120 },
    { time: '2026-Q4', value: 145 }
  ];
  
  export function getNGXLiveScore(): NGXData {
    const baseScore = 83.4;
    const variation = (Math.random() * 0.4) - 0.2;
    const currentScore = Number((baseScore + variation).toFixed(2));
  
    let status: NGXData['status'] = 'Neutral';
    if (currentScore < 20) status = 'Panic';
    else if (currentScore < 40) status = 'Weak';
    else if (currentScore < 60) status = 'Neutral';
    else if (currentScore < 80) status = 'Bullish';
    else status = 'Hyper';
  
    return {
      score: currentScore,
      status: status,
      change24h: 3.8,
      lastUpdate: new Date().toISOString(),
      breakdown: {
        price: 72.1,
        volume: 60.4,
        sentiment: 66.7,
        activity: 88.2
      }
    };
  }