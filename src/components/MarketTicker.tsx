'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { usePublicClient } from 'wagmi'; 
import { parseAbi, erc721Abi } from 'viem';
import { NFT_COLLECTION_ADDRESS } from '@/data/config';

// --- إعداد اتصال Supabase ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- دوال مساعدة لجلب الصور والبيانات (مثل Home) ---
const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
};

interface TickerItem {
  id: string;
  label: string;
  value: string;
  change?: number;
  isUp?: boolean;
  link: string;
  type: 'MARKET' | 'TOP' | 'NEW' | 'NGX';
  sub?: string;
}

export default function MarketTicker() {
  const publicClient = usePublicClient(); 
  
  // الحالة (State)
  const [prices, setPrices] = useState({ eth: 0, ethChange: 0, pol: 0, polChange: 0 });
  const [ngxIndex, setNgxIndex] = useState({ val: '84.2', change: 1.5 });
  const [ngxCap, setNgxCap] = useState({ val: '$2.54B', change: 4.88 });
  const [ngxVol, setNgxVol] = useState({ val: '2.4M', change: 0.86 });
  const [nnmVolChange, setNnmVolChange] = useState(0);
  
  // القوائم الجديدة (الأسماء)
  const [topItems, setTopItems] = useState<TickerItem[]>([]);
  const [newItems, setNewItems] = useState<TickerItem[]>([]); // هذا لـ Just Listed
  
  // نظام الكاش (دقيقتين)
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // 1. جلب أسعار العملات (CoinGecko)
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token,matic-network,ethereum&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        const polKey = data['polygon-ecosystem-token'] ? 'polygon-ecosystem-token' : 'matic-network';
        
        setPrices({ 
            eth: data.ethereum.usd || 0, 
            ethChange: data.ethereum.usd_24h_change || 0,
            pol: data[polKey]?.usd || 0,
            polChange: data[polKey]?.usd_24h_change || 0
        });
      } catch (e) { console.error(e); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. جلب بيانات NGX APIs
  useEffect(() => {
    const fetchNgxData = async () => {
      try {
        const [r1, r2, r3] = await Promise.all([fetch('/api/ngx'), fetch('/api/ngx-cap'), fetch('/api/ngx-volume')]);
        if (r1.ok) { const j = await r1.json(); setNgxIndex({ val: (j.score || 84.2).toFixed(1), change: j.change24h || 0 }); }
        if (r2.ok) { const j = await r2.json(); setNgxCap({ val: j.marketCap || '$2.54B', change: j.change24h || 0 }); }
        if (r3.ok) { const j = await r3.json(); setNgxVol({ val: j.marketStats?.totalVolumeDisplay || '2.4M', change: j.marketStats?.totalVolChange || 0 }); }
      } catch (e) { console.error(e); }
    };
    fetchNgxData();
    const interval = setInterval(fetchNgxData, 60000);
    return () => clearInterval(interval);
  }, []);

  // 3. الحسابات الهجينة + جلب الأسماء من البلوكشين (مثل Home)
  useEffect(() => {
    const fetchHybridData = async () => {
        const now = Date.now();
        // الكاش: إذا لم يمر دقيقتين، لا تعيد الطلب
        if (now - lastFetchTime < 120000 && lastFetchTime !== 0) return;

        try {
            // أ) حساب NNM Volume %
            const { data: sales } = await supabase.from('activities').select('price, created_at').eq('activity_type', 'Sale');
            if (sales) {
                const oneDay = 86400000;
                let volT = 0, volY = 0;
                sales.forEach((s: any) => {
                    const t = new Date(s.created_at).getTime();
                    if (now - t <= oneDay) volT += Number(s.price);
                    else if (now - t <= 2 * oneDay) volY += Number(s.price);
                });
                setNnmVolChange(volY === 0 ? (volT > 0 ? 100 : 0) : ((volT - volY) / volY) * 100);
            }

            // دالة مساعدة لجلب الاسم الحقيقي من البلوكشين (نفس منطق Home)
            const getRealName = async (tokenId: string, fallbackName?: string) => {
                if (fallbackName) return fallbackName; // إذا كان الاسم موجود في الداتا بيز استخدمه
                if (!publicClient) return `Asset #${tokenId}`;
                try {
                    const uri = await publicClient.readContract({
                        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                        abi: erc721Abi,
                        functionName: 'tokenURI',
                        args: [BigInt(tokenId)]
                    });
                    const metaRes = await fetch(resolveIPFS(uri as string));
                    if (!metaRes.ok) return `Asset #${tokenId}`;
                    const meta = await metaRes.json();
                    return meta.name || `Asset #${tokenId}`;
                } catch (err) {
                    return `Asset #${tokenId}`;
                }
            };

            // ب) Just Listed: (نبحث عن آخر عمليات LIST في الداتا بيز لتطابق Home)
            // ملاحظة: Home يفرز الـ Listings. نحن سنأخذ آخر 3 عمليات List كتقريب ممتاز وسريع
            const { data: listings } = await supabase
                .from('activities')
                .select('asset_name, token_id')
                .eq('activity_type', 'List') // تغيير من Mint إلى List لتطابق Just Listed
                .order('created_at', { ascending: false })
                .limit(3);

            if (listings && listings.length > 0) {
                const newItemsPromises = listings.map(async (m, i) => {
                    const realName = await getRealName(m.token_id, m.asset_name);
                    return {
                        id: `just-${i}`,
                        label: 'Just Listed', // الاسم كما في Home
                        value: realName,
                        link: `/asset/${m.token_id}`,
                        type: 'NEW' as const
                    };
                });
                setNewItems(await Promise.all(newItemsPromises));
            }

            // ج) Top Performers: (نبحث عن أعلى المبيعات سعراً)
            const { data: topSales } = await supabase
                .from('activities')
                .select('asset_name, token_id, price')
                .eq('activity_type', 'Sale')
                .order('price', { ascending: false })
                .limit(3);

            if (topSales && topSales.length > 0) {
                const topItemsPromises = topSales.map(async (s, i) => {
                    const realName = await getRealName(s.token_id, s.asset_name);
                    return {
                        id: `top-${i}`,
                        label: 'Top Performers', // الاسم كما في Home
                        value: realName,
                        link: `/asset/${s.token_id}`,
                        type: 'TOP' as const
                    };
                });
                setTopItems(await Promise.all(topItemsPromises));
            }

            setLastFetchTime(now);

        } catch (e) { console.error("Hybrid Logic Error", e); }
    };

    fetchHybridData();
    const interval = setInterval(fetchHybridData, 30000); 
    return () => clearInterval(interval);
  }, [publicClient, lastFetchTime]);


  // --- تجميع الشريط ---
  const items = useMemo(() => {
    const marketItems: TickerItem[] = [
        { id: 'ngx', label: 'NGX INDEX', value: ngxIndex.val, change: ngxIndex.change, isUp: ngxIndex.change >= 0, link: '/ngx', type: 'NGX' },
        { id: 'ngx-cap', label: 'NGX CAP', value: ngxCap.val, change: ngxCap.change, isUp: ngxCap.change >= 0, link: '/ngx', type: 'NGX' },
        { id: 'ngx-vol', label: 'NGX VOL', value: ngxVol.val, change: ngxVol.change, isUp: ngxVol.change >= 0, link: '/ngx', type: 'NGX' },
        
        { id: 'eth', label: 'ETH', value: `$${prices.eth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: prices.ethChange, isUp: prices.ethChange >= 0, link: '/market', type: 'MARKET' },
        { id: 'pol', label: 'POL', value: `$${prices.pol.toFixed(2)}`, change: prices.polChange, isUp: prices.polChange >= 0, link: '/market', type: 'MARKET' },
        { id: 'nnm', label: 'NNM VOL', value: '', change: nnmVolChange, isUp: nnmVolChange >= 0, link: '/market', type: 'MARKET' },
    ];

    // دمج القوائم: السوق + Just Listed + Top Performers
    const combined = [...marketItems, ...newItems, ...topItems];
    return [...combined, ...combined]; 
  }, [prices, ngxIndex, ngxCap, ngxVol, nnmVolChange, newItems, topItems]);

  return (
    <div className="w-100 overflow-hidden position-relative" 
         style={{ backgroundColor: '#0b0e11', height: '40px', zIndex: 40, borderBottom: '1px solid #222' }}>
      
      <div className="d-flex align-items-center h-100 ticker-track">
        {items.map((item, index) => (
          <Link href={item.link} key={`${item.id}-${index}`} className="text-decoration-none h-100 d-flex align-items-center ticker-link">
            <div className="d-flex align-items-center px-4 h-100" style={{ whiteSpace: 'nowrap' }}>
              
              {/* العنوان: ذهبي (Top Performers, Just Listed, NGX...) */}
              <span className="me-2" style={{ 
                  color: '#FCD535', 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  letterSpacing: '0.5px' 
              }}>
                {item.label}:
              </span>
              
              {/* القيمة: أبيض (الاسم الحقيقي أو السعر) */}
              {item.value && (
                <span className="me-2" style={{ 
                    fontSize: '12px',
                    fontWeight: '500', 
                    fontFamily: '"Inter", sans-serif',
                    color: '#FFFFFF' 
                }}>
                    {item.value}
                    {item.sub && <span className="ms-2 text-secondary" style={{ fontSize: '11px' }}>({item.sub})</span>}
                </span>
              )}
              
              {/* التغير: ملون (للأسعار والفوليوم) */}
              {item.change !== undefined && (
                <span style={{ 
                    color: item.change >= 0 ? '#0ecb81' : '#f6465d', 
                    fontSize: '10px', 
                    fontWeight: '600'
                }}>
                  {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                </span>
              )}
            </div>
            <div style={{ width: '1px', height: '14px', backgroundColor: '#333' }}></div>
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
