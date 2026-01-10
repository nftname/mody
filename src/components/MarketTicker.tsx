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

// --- دوال مساعدة (مثل Home) ---
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
  const publicClient = usePublicClient(); // استخدام العميل العام للبلوكشين لجلب الأسماء
  
  // الحالة (State)
  const [prices, setPrices] = useState({ eth: 0, ethChange: 0, pol: 0, polChange: 0 });
  
  // بيانات NGX
  const [ngxIndex, setNgxIndex] = useState({ val: '84.2', change: 1.5 });
  const [ngxCap, setNgxCap] = useState({ val: '$2.54B', change: 4.88 });
  const [ngxVol, setNgxVol] = useState({ val: '2.4M', change: 0.86 });
  
  // بيانات NNM والأصول
  const [nnmVolChange, setNnmVolChange] = useState(0);
  const [topItems, setTopItems] = useState<TickerItem[]>([]);
  const [newItems, setNewItems] = useState<TickerItem[]>([]);
  
  // نظام الكاش (التخزين المؤقت)
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // 1. جلب أسعار العملات (CoinGecko) - كل دقيقة
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

  // 2. جلب بيانات NGX APIs - كل دقيقة
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

  // 3. الحسابات الهجينة + جلب الأسماء من البلوكشين (مثل Home) - كل دقيقتين
  useEffect(() => {
    const fetchHybridData = async () => {
        const now = Date.now();
        // التحقق من الكاش (دقيقتين = 120000 مللي ثانية)
        if (now - lastFetchTime < 120000 && lastFetchTime !== 0) return;

        try {
            // أ) حساب NNM Volume % (Supabase سريع)
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

            // دالة مساعدة لجلب الاسم الحقيقي من البلوكشين
            const getRealName = async (tokenId: string) => {
                if (!publicClient) return `Asset #${tokenId}`;
                try {
                    // قراءة URI من العقد الذكي مباشرة
                    const uri = await publicClient.readContract({
                        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                        abi: erc721Abi,
                        functionName: 'tokenURI',
                        args: [BigInt(tokenId)]
                    });
                    // جلب الميتا داتا من IPFS
                    const metaRes = await fetch(resolveIPFS(uri as string));
                    if (!metaRes.ok) return `Asset #${tokenId}`;
                    const meta = await metaRes.json();
                    return meta.name || `Asset #${tokenId}`;
                } catch (err) {
                    return `Asset #${tokenId}`;
                }
            };

            // ب) NEW Assets: جلب IDs من Supabase -> ثم الاسم من البلوكشين
            const { data: mints } = await supabase.from('activities').select('token_id').eq('activity_type', 'Mint').order('created_at', { ascending: false }).limit(3);
            if (mints) {
                const newItemsPromises = mints.map(async (m, i) => {
                    const realName = await getRealName(m.token_id);
                    return {
                        id: `new-${i}`,
                        label: 'NEW Assets',
                        value: realName,
                        link: `/asset/${m.token_id}`,
                        type: 'NEW' as const
                    };
                });
                setNewItems(await Promise.all(newItemsPromises));
            }

            // ج) TOP Assets: جلب IDs من Supabase (الأعلى سعراً) -> ثم الاسم من البلوكشين
            const { data: tops } = await supabase.from('activities').select('token_id').eq('activity_type', 'Sale').order('price', { ascending: false }).limit(3);
            if (tops) {
                const topItemsPromises = tops.map(async (s, i) => {
                    const realName = await getRealName(s.token_id);
                    return {
                        id: `top-${i}`,
                        label: 'TOP Assets',
                        value: realName,
                        link: `/asset/${s.token_id}`,
                        type: 'TOP' as const
                    };
                });
                setTopItems(await Promise.all(topItemsPromises));
            }

            setLastFetchTime(now); // تحديث وقت الكاش

        } catch (e) { console.error("Hybrid Logic Error", e); }
    };

    fetchHybridData();
    // التحقق كل 30 ثانية، لكن الكود في الأعلى سيمنع التنفيذ إلا بعد مرور دقيقتين
    const interval = setInterval(fetchHybridData, 30000); 
    return () => clearInterval(interval);
  }, [publicClient, lastFetchTime]); // يعتمد على publicClient والوقت


  // --- تجميع الشريط ---
  const items = useMemo(() => {
    const marketItems: TickerItem[] = [
        { id: 'ngx', label: 'NGX INDEX', value: ngxIndex.val, change: ngxIndex.change, isUp: ngxIndex.change >= 0, link: '/ngx', type: 'NGX' },
        { id: 'ngx-cap', label: 'NGX CAP', value: ngxCap.val, change: ngxCap.change, isUp: ngxCap.change >= 0, link: '/ngx', type: 'NGX' },
        { id: 'ngx-vol', label: 'NGX VOL', value: ngxVol.val, change: ngxVol.change, isUp: ngxVol.change >= 0, link: '/ngx', type: 'NGX' },
        
        // ETH (3 حروف)
        { id: 'eth', label: 'ETH', value: `$${prices.eth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: prices.ethChange, isUp: prices.ethChange >= 0, link: '/market', type: 'MARKET' },
        
        // POL
        { id: 'pol', label: 'POL', value: `$${prices.pol.toFixed(2)}`, change: prices.polChange, isUp: prices.polChange >= 0, link: '/market', type: 'MARKET' },
        
        // NNM VOL (بدون رقم أبيض)
        { id: 'nnm', label: 'NNM VOL', value: '', change: nnmVolChange, isUp: nnmVolChange >= 0, link: '/market', type: 'MARKET' },
    ];

    const combined = [...marketItems, ...newItems, ...topItems];
    return [...combined, ...combined]; // تكرار للحركة المستمرة
  }, [prices, ngxIndex, ngxCap, ngxVol, nnmVolChange, newItems, topItems]);

  const getColor = (item: TickerItem) => {
      return '#FCD535'; // ذهبي للعناوين دائماً
  };

  return (
    <div className="w-100 overflow-hidden position-relative" 
         style={{ backgroundColor: '#0b0e11', height: '40px', zIndex: 40, borderBottom: '1px solid #222' }}>
      
      <div className="d-flex align-items-center h-100 ticker-track">
        {items.map((item, index) => (
          <Link href={item.link} key={`${item.id}-${index}`} className="text-decoration-none h-100 d-flex align-items-center ticker-link">
            <div className="d-flex align-items-center px-4 h-100" style={{ whiteSpace: 'nowrap' }}>
              
              {/* العنوان: ذهبي */}
              <span className="me-2" style={{ 
                  color: '#FCD535', 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  letterSpacing: '0.5px' 
              }}>
                {item.label}:
              </span>
              
              {/* القيمة: أبيض (إلا إذا كانت فارغة) */}
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
              
              {/* التغير: ملون */}
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
