'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { usePublicClient } from 'wagmi'; 
import { parseAbi, erc721Abi, formatEther } from 'viem'; // تمت إضافة formatEther
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config'; // تأكدنا من استيراد عنوان الماركت

// --- إعداد اتصال Supabase ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ABI الخاص بالماركت (مأخوذ من كود Home) ---
const MARKET_ABI = parseAbi([
    "function getAllListings() view returns (uint256[] tokenIds, uint256[] prices, address[] sellers)"
]);

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
  
  const [topItems, setTopItems] = useState<TickerItem[]>([]);
  const [newItems, setNewItems] = useState<TickerItem[]>([]);
  
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // 1. جلب أسعار العملات (مستقل)
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token,matic-network,ethereum&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        const polKey = data['polygon-ecosystem-token'] ? 'polygon-ecosystem-token' : 'matic-network';
        
        if (data.ethereum && data[polKey]) {
            setPrices({ 
                eth: data.ethereum.usd, 
                ethChange: data.ethereum.usd_24h_change,
                pol: data[polKey].usd,
                polChange: data[polKey].usd_24h_change
            });
        }
      } catch (e) { console.error(e); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. جلب مؤشرات NGX
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

  // 3. المنطق الهجين المتطابق مع Home (Contract + DB Aggregation)
  useEffect(() => {
    const fetchHomeLogicData = async () => {
        const now = Date.now();
        // كاش لمدة دقيقتين
        if (now - lastFetchTime < 120000 && lastFetchTime !== 0) return;

        if (!publicClient) return;

        try {
            // أ) جلب كل العروض من البلوكشين (مثل Home تماماً)
            const data = await publicClient.readContract({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKET_ABI,
                functionName: 'getAllListings'
            });
            const [tokenIds, pricesOnChain] = data; // sellers لا نحتاجه هنا

            if (tokenIds.length === 0) return;

            // ب) تجهيز خريطة الفوليوم من Supabase (لحساب Top Performers)
            const { data: allActivities } = await supabase.from('activities').select('token_id, price, activity_type, created_at');
            const volumeMap: any = {};
            const oneDay = 24 * 60 * 60 * 1000;
            let totalVolToday = 0; 
            let totalVolYest = 0;

            if (allActivities) {
                allActivities.forEach((act: any) => {
                    const tid = Number(act.token_id);
                    const price = Number(act.price) || 0;
                    const time = new Date(act.created_at).getTime();

                    // حساب الفوليوم لكل أصل (لترتيب Top Performers)
                    if (act.activity_type === 'Sale') {
                        volumeMap[tid] = (volumeMap[tid] || 0) + price;
                        
                        // حساب NNM Vol الإجمالي للموقع
                        if (now - time <= oneDay) totalVolToday += price;
                        else if (now - time <= 2 * oneDay) totalVolYest += price;
                    }
                });
            }

            // ضبط نسبة NNM VOL
            setNnmVolChange(totalVolYest === 0 ? (totalVolToday > 0 ? 100 : 0) : ((totalVolToday - totalVolYest) / totalVolYest) * 100);

            // ج) دالة لجلب الاسم
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

            // د) تحضير القائمة الأساسية
            // ملاحظة: نحتاج فقط أعلى 3 وأحدث 3، لذا لا داعي لجلب أسماء الكل لتوفير الموارد
            // سنقوم بالفرز (Sort) أولاً باستخدام الـ IDs والفوليوم، ثم نجلب أسماء الفائزين فقط.

            const allListings = tokenIds.map((id, index) => ({
                id: Number(id),
                price: pricesOnChain[index],
                volume: volumeMap[Number(id)] || 0
            }));

            // --- 1. Just Listed (ترتيب حسب الـ ID تنازلي - الأحدث) ---
            const sortedByNew = [...allListings].sort((a, b) => b.id - a.id).slice(0, 3);
            const newListingsPromises = sortedByNew.map(async (item, i) => {
                const name = await getRealName(BigInt(item.id));
                return {
                    id: `just-${i}`,
                    label: 'Just Listed',
                    value: name,
                    link: `/asset/${item.id}`,
                    type: 'NEW' as const
                };
            });
            setNewItems(await Promise.all(newListingsPromises));

            // --- 2. Top Performers (ترتيب حسب الفوليوم تنازلي) ---
            const sortedByVol = [...allListings].sort((a, b) => b.volume - a.volume).slice(0, 3);
            const topListingsPromises = sortedByVol.map(async (item, i) => {
                const name = await getRealName(BigInt(item.id));
                return {
                    id: `top-${i}`,
                    label: 'Top Performers',
                    value: name,
                    // sub: `${item.volume.toFixed(1)} POL`, // اختياري: عرض الفوليوم بجانب الاسم
                    link: `/asset/${item.id}`,
                    type: 'TOP' as const
                };
            });
            setTopItems(await Promise.all(topListingsPromises));

            setLastFetchTime(now);

        } catch (e) { console.error("Ticker Hybrid Logic Error", e); }
    };

    fetchHomeLogicData();
    const interval = setInterval(fetchHomeLogicData, 30000);
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
                    color: '#FFFFFF' 
                }}>
                    {item.value}
                    {item.sub && <span className="ms-2 text-secondary" style={{ fontSize: '11px' }}>({item.sub})</span>}
                </span>
              )}
              
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
