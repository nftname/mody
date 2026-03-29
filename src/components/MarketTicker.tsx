'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePublicClient } from 'wagmi'; 
import { parseAbi, erc721Abi } from 'viem';
import { supabase } from '@/lib/supabase';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';

const MARKET_ABI = parseAbi([
    "function getAllListings() view returns (uint256[] tokenIds, uint256[] prices, address[] sellers)"
]);

const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://ipfs.io/ipfs/') : uri;
};

export default function MarketTicker() {
  const publicClient = usePublicClient(); 
  
  const [prices, setPrices] = useState({ eth: 0, ethChange: 0, pol: 0, polChange: 0 });
  
  const [ngxIndex, setNgxIndex] = useState({ val: '84.2', change: 1.5 });
  const [ngxCap, setNgxCap] = useState({ val: '$2.54B', change: 4.88 });
  const [ngxVol, setNgxVol] = useState({ val: '2.4M', change: 0.86 });
  
  const [topItems, setTopItems] = useState<any[]>([]);
  const [newItems, setNewItems] = useState<any[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPrices({
            eth: data.eth || 0,
            ethChange: data.ethChange || 0,
            pol: data.pol || 0,
            polChange: data.polChange || 0
        });
      } catch (e) {}
    };

    fetchPrices();
    const priceInterval = setInterval(fetchPrices, 60000); 

    return () => clearInterval(priceInterval);
  }, []);

  useEffect(() => {
    const fetchNgxData = async () => {
      try {
        const [r1, r2, r3] = await Promise.all([
          fetch('/api/ngx').catch(() => null), 
          fetch('/api/ngx-cap').catch(() => null), 
          fetch('/api/ngx-volume').catch(() => null)
        ]);
        
        if (r1 && r1.ok) { const j = await r1.json(); setNgxIndex({ val: (j.score || 84.2).toFixed(1), change: j.change24h || 0 }); }
        if (r2 && r2.ok) { const j = await r2.json(); setNgxCap({ val: j.marketCap || '$2.54B', change: j.change24h || 0 }); }
        if (r3 && r3.ok) { const j = await r3.json(); setNgxVol({ val: j.marketStats?.totalVolumeDisplay || '2.4M', change: j.marketStats?.totalVolChange || 0 }); }
      } catch (e) {}
    };
    
    fetchNgxData();
    const interval = setInterval(fetchNgxData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchHomeLogicData = async () => {
        const now = Date.now();
        if (now - lastFetchTime < 120000 && lastFetchTime !== 0) return; 
        if (!publicClient) return;

        try {
            const data = await publicClient.readContract({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKET_ABI,
                functionName: 'getAllListings'
            });
            const [tokenIds] = data; 

            if (!tokenIds || tokenIds.length === 0) return;

            const { data: activities } = await supabase
                .from('activities')
                .select('token_id, price, activity_type, created_at')
                .in('activity_type', ['Sale', 'List']) 
                .order('created_at', { ascending: false });

            const volumeMap: Record<number, number> = {};
            const latestListTimeMap: Record<number, number> = {};

            if (activities) {
                activities.forEach((act: any) => {
                    const tid = Number(act.token_id);
                    let actTime: number;
                    try {
                        const dateStr = act.created_at.includes('Z') ? act.created_at : act.created_at + 'Z';
                        actTime = new Date(dateStr).getTime();
                        if (isNaN(actTime)) actTime = new Date(act.created_at).getTime();
                    } catch { actTime = new Date(act.created_at).getTime(); }

                    if (act.activity_type === 'Sale') {
                        const price = Number(act.price) || 0;
                        volumeMap[tid] = (volumeMap[tid] || 0) + price;
                    }

                    if (act.activity_type === 'List') {
                        if (!latestListTimeMap[tid] || actTime > latestListTimeMap[tid]) {
                            latestListTimeMap[tid] = actTime;
                        }
                    }
                });
            }

            const getRealName = async (tokenId: bigint) => {
                try {
                    const uri = await publicClient.readContract({
                        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                        abi: erc721Abi,
                        functionName: 'tokenURI',
                        args: [tokenId]
                    });
                    const metaRes = await fetch(resolveIPFS(uri as string));
                    const meta = await metaRes.json();
                    return meta.name || `Asset #${tokenId}`;
                } catch { return `Asset #${tokenId}`; }
            };

            const allItems = tokenIds.map(id => ({
              id: Number(id),
              volume: volumeMap[Number(id)] || 0,
              listedAt: latestListTimeMap[Number(id)] || 0 
            }));

            const sortedNew = [...allItems]
              .filter(item => item.listedAt > 0) 
              .sort((a, b) => b.listedAt - a.listedAt) 
              .slice(0, 3);

            const newItemsData = await Promise.allSettled(sortedNew.map(async (item, i) => {
              const name = await getRealName(BigInt(item.id));
              return { id: `just-${i}`, label: 'Just Listed', value: name, link: `/asset/${item.id}`, type: 'NEW' };
            }));
            
            const validNewItems = newItemsData
                .filter(res => res.status === 'fulfilled')
                .map((res: any) => res.value);

            if (isMounted) setNewItems(validNewItems);

            const sortedTop = [...allItems].sort((a, b) => b.volume - a.volume).slice(0, 3);
            const topItemsData = await Promise.allSettled(sortedTop.map(async (item, i) => {
                const name = await getRealName(BigInt(item.id));
                return { id: `top-${i}`, label: 'Top Assets', value: name, link: `/asset/${item.id}`, type: 'TOP' };
            }));
            
            const validTopItems = topItemsData
                .filter(res => res.status === 'fulfilled')
                .map((res: any) => res.value);

            if (isMounted) {
                setTopItems(validTopItems);
                setLastFetchTime(now);
            }

        } catch (e) {}
    };

    fetchHomeLogicData();
    const interval = setInterval(fetchHomeLogicData, 60000);
    
    return () => {
        isMounted = false;
        clearInterval(interval);
    };
  }, [publicClient, lastFetchTime]);

  const items = useMemo(() => {
    const marketItems = [
        { id: 'ngx', label: 'NFX INDEX', value: ngxIndex.val, change: ngxIndex.change, link: '/ngx' },
        { id: 'ngx-cap', label: 'NFX CAP', value: ngxCap.val, change: ngxCap.change, link: '/ngx' },
        { id: 'ngx-vol', label: 'NFX VOL', value: ngxVol.val, change: ngxVol.change, link: '/ngx' },
        
        { id: 'eth', label: 'ETH', value: `$${prices.eth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: prices.ethChange, link: '/market' },
        { id: 'pol', label: 'POL', value: `$${prices.pol.toFixed(2)}`, change: prices.polChange, link: '/market' },
        
        { id: 'nnm-static', label: 'NNM Sovereign Assets', link: '/market', isStatic: true },
    ];

    const combined = [...marketItems, ...newItems, ...topItems];
    return [...combined, ...combined]; 
  }, [prices, ngxIndex, ngxCap, ngxVol, newItems, topItems]);

  return (
    <div className="w-100 overflow-hidden position-relative border-bottom border-secondary border-opacity-25" 
         style={{ 
             backgroundColor: 'rgba(24, 26, 32, 0.7)',
             backdropFilter: 'blur(10px)',
             height: '40px', 
             zIndex: 40,
             borderBottomColor: '#2B3139 !important' 
         }}>
      
      <div className="d-flex align-items-center h-100 ticker-track">
        {items.map((item, index) => (
          <Link href={item.link} key={`${item.id}-${index}`} className="text-decoration-none h-100 d-flex align-items-center ticker-link">
            <div className="d-flex align-items-center px-4 h-100" style={{ whiteSpace: 'nowrap' }}>
              
              {item.isStatic ? (
                <span style={{ 
                    color: '#FCD535', 
                    fontSize: '11px', 
                    fontWeight: '800', 
                    letterSpacing: '0.5px' 
                }}>
                  {item.label}
                </span>
              ) : (
                <>
                  <span className="me-2" style={{ 
                      color: '#FCD535', 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      letterSpacing: '0.5px' 
                  }}>
                    {item.label}:
                  </span>
                  
                  {item.value && (
                    <span className="me-2" style={{ 
                        fontSize: '12px',
                        fontWeight: '500', 
                        fontFamily: '"Inter", sans-serif',
                        color: '#EAECEF' 
                    }}>
                        {item.value}
                    </span>
                  )}
                  
                  {(item.change !== undefined) && (
                    <span style={{ 
                        color: item.change >= 0 ? '#0ecb81' : '#f6465d', 
                        fontSize: '10px', 
                        fontWeight: '600'
                    }}>
                      {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                    </span>
                  )}
                </>
              )}
            </div>
            <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .ticker-track {
          animation: scroll 40s linear infinite;
          width: max-content;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        .ticker-link {
            transition: background-color 0.2s;
        }
        .ticker-link:hover {
            background-color: rgba(255, 255, 255, 0.05); 
        }
        @keyframes scroll {
          0% { transform: translateX(0); } 100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
