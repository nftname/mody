'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FULL_ASSET_LIST } from '@/data/assets';

interface TickerItem {
  label: string;
  value: string;
  change: number;
  isUp: boolean;
  link: string;
  sub?: string;
  type: 'MARKET' | 'SOLD' | 'LISTED';
}

interface TickerData {
  ngx: number;
  ngxChange: number;
  eth: number;
  ethChange: number;
  pol: number; 
  polChange: number;
}

export default function MarketTicker() {
  const [tickerData, setTickerData] = useState<TickerData>({
    ngx: 84.2, ngxChange: 2.4,
    eth: 3200, ethChange: 1.2,
    pol: 0.45, polChange: -0.5
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/ngx');
        if (!res.ok) return;
        const json = await res.json();
        
        setTickerData({
            ngx: json.score || 84.2,
            ngxChange: json.change24h || 1.5,
            eth: json.crypto?.eth?.price || 3250,
            ethChange: json.crypto?.eth?.change || 0.5,
            pol: json.crypto?.matic?.price || json.crypto?.polygon?.price || 0.45,
            polChange: json.crypto?.matic?.change || json.crypto?.polygon?.change || -1.2
        });
      } catch (error) {
        console.error("Ticker update failed");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); 
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val: number) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  const items = useMemo(() => {
    const soldItems: TickerItem[] = FULL_ASSET_LIST
      .filter(a => a.lastSale > 0)
      .slice(0, 5)
      .map(a => ({
        label: 'SOLD',
        value: a.name,
        sub: `${a.lastSale.toFixed(0)} POL`, 
        change: a.change,
        isUp: a.change >= 0,
        link: `/asset/${a.id}`,
        type: 'SOLD'
      }));

    const listedItems: TickerItem[] = FULL_ASSET_LIST
      .filter(a => a.status === 'listed')
      .slice(0, 5)
      .map(a => ({
        label: 'LISTED',
        value: a.name,
        sub: `${a.floor.toFixed(1)} POL`, 
        change: 0,
        isUp: true,
        link: `/asset/${a.id}`,
        type: 'LISTED'
      }));

    const combinedAssets = [...soldItems, ...listedItems].sort(() => Math.random() - 0.5);

    const marketItems: TickerItem[] = [
      { label: "NGX INDEX", value: tickerData.ngx.toFixed(1), change: tickerData.ngxChange, isUp: tickerData.ngxChange >= 0, link: "/ngx", type: 'MARKET' },
      { label: "ETH", value: formatCurrency(tickerData.eth), change: tickerData.ethChange, isUp: tickerData.ethChange >= 0, link: "/market", type: 'MARKET' },
      { label: "POL", value: formatCurrency(tickerData.pol), change: tickerData.polChange, isUp: tickerData.polChange >= 0, link: "/market", type: 'MARKET' },
      { label: "NNM VOL", value: "2.4M POL", change: 5.8, isUp: true, link: "/market", type: 'MARKET' },
    ];

    return [...marketItems, ...combinedAssets, ...marketItems, ...combinedAssets];
  }, [tickerData]);

  const getLabelColor = (type: string) => {
      if (type === 'SOLD') return '#0ecb81';
      if (type === 'LISTED') return '#38bdf8';
      return '#FCD535';
  };

  return (
    <div className="w-100 overflow-hidden position-relative" 
         style={{ backgroundColor: '#050505', height: '40px', zIndex: 40, borderBottom: '1px solid #222' }}>
      
      <div className="d-flex align-items-center h-100 ticker-track">
        {items.map((item, index) => (
          <Link href={item.link} key={`${item.label}-${index}`} className="text-decoration-none h-100 d-flex align-items-center ticker-link">
            <div className="d-flex align-items-center px-4 h-100" style={{ whiteSpace: 'nowrap' }}>
              
              <span className="me-2" style={{ 
                  color: getLabelColor(item.type), 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  letterSpacing: '0.5px' 
              }}>
                {item.label}:
              </span>
              
              <span className="me-2" style={{ 
                  fontSize: '12px',
                  fontWeight: '400', 
                  fontFamily: 'sans-serif',
                  color: item.type === 'MARKET' ? '#FFFFFF' : '#FCD535' 
              }}>
                {item.value} 
                {item.sub && (
                    <span className="ms-2" style={{ fontSize: '12px', fontWeight: '400', color: '#FFFFFF' }}>
                        {item.sub}
                    </span>
                )}
              </span>
              
              {item.change !== 0 && (
                <span style={{ 
                    color: item.isUp ? '#0ecb81' : '#f6465d', 
                    fontSize: '10px', 
                    fontWeight: '500'
                }}>
                  {item.isUp ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                </span>
              )}
            </div>
            <div style={{ width: '1px', height: '15px', backgroundColor: '#333' }}></div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .ticker-track {
          animation: scroll 27s linear infinite;
          width: max-content;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        .ticker-link {
            transition: background-color 0.2s;
        }
        .ticker-link:hover {
            background-color: #1a1a1a;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
