'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// --- إعداد اتصال Supabase ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  // الحالة (State) كما هي
  const [prices, setPrices] = useState({ eth: 0, ethChange: 0, pol: 0, polChange: 0 });
  const [ngxIndex, setNgxIndex] = useState({ val: '84.2', change: 1.5 });
  const [ngxCap, setNgxCap] = useState({ val: '$2.54B', change: 4.88 });
  const [ngxVol, setNgxVol] = useState({ val: '2.4M', change: 0.86 });
  
  // بيانات NNM الداخلية
  const [nnmVolChange, setNnmVolChange] = useState(0);
  const [topItems, setTopItems] = useState<TickerItem[]>([]);
  const [newItems, setNewItems] = useState<TickerItem[]>([]);

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
        const res1 = await fetch('/api/ngx');
        if (res1.ok) {
            const j1 = await res1.json();
            setNgxIndex({ val: (j1.score || 84.2).toFixed(1), change: j1.change24h || 0 });
        }
        const res2 = await fetch('/api/ngx-cap');
        if (res2.ok) {
            const j2 = await res2.json();
            setNgxCap({ val: j2.marketCap || '$2.54B', change: j2.change24h || 0 });
        }
        const res3 = await fetch('/api/ngx-volume');
        if (res3.ok) {
            const j3 = await res3.json();
            setNgxVol({ 
                val: j3.marketStats?.totalVolumeDisplay || '2.4M', 
                change: j3.marketStats?.totalVolChange || 0 
            });
        }
      } catch (e) { console.error(e); }
    };
    fetchNgxData();
    const interval = setInterval(fetchNgxData, 60000);
    return () => clearInterval(interval);
  }, []);

  // 3. الحسابات الهجينة (Supabase) - تعديل جراحي لجلب الأسماء وإضافة التصنيفات
  useEffect(() => {
    const fetchHybridData = async () => {
        try {
            // أ) حساب NNM Volume %
            const { data: sales } = await supabase
                .from('activities')
                .select('price, created_at')
                .eq('activity_type', 'Sale');
            
            if (sales) {
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;
                let volToday = 0;
                let volYesterday = 0;

                sales.forEach((sale: any) => {
                    const time = new Date(sale.created_at).getTime();
                    const price = Number(sale.price) || 0;
                    const diff = now - time;
                    if (diff <= oneDay) volToday += price;
                    else if (diff <= 2 * oneDay) volYesterday += price;
                });

                let pct = 0;
                if (volYesterday === 0) pct = volToday > 0 ? 100 : 0;
                else pct = ((volToday - volYesterday) / volYesterday) * 100;
                setNnmVolChange(pct);
            }

            // ب) NEW Assets: جلب أحدث 3 عمليات Mint (الاسم الحقيقي)
            const { data: mints } = await supabase
                .from('activities')
                .select('asset_name, token_id, created_at') 
                .eq('activity_type', 'Mint')
                .order('created_at', { ascending: false })
                .limit(3);

            if (mints) {
                setNewItems(mints.map((m, i) => ({
                    id: `new-${i}`,
                    label: 'NEW Assets',
                    value: m.asset_name || `Asset #${m.token_id}`, // عرض الاسم
                    link: `/asset/${m.token_id}`,
                    type: 'NEW'
                })));
            }

            // ج) TOP Assets: جلب أعلى 3 مبيعات (الاسم الحقيقي)
            const { data: topSales } = await supabase
                .from('activities')
                .select('asset_name, token_id, price')
                .eq('activity_type', 'Sale')
                .order('price', { ascending: false })
                .limit(3);

            if (topSales) {
                setTopItems(topSales.map((s, i) => ({
                    id: `top-${i}`,
                    label: 'TOP Assets',
                    value: s.asset_name || `Asset #${s.token_id}`, // عرض الاسم
                    sub: `${Number(s.price).toFixed(0)} POL`,
                    link: `/asset/${s.token_id}`,
                    type: 'TOP'
                })));
            }

        } catch (e) { console.error("Hybrid fetch error", e); }
    };
    fetchHybridData();
    const interval = setInterval(fetchHybridData, 30000);
    return () => clearInterval(interval);
  }, []);


  // --- تجميع الشريط ---
  const items = useMemo(() => {
    // العناصر الأساسية (السوق)
    const marketItems: TickerItem[] = [
        { id: 'ngx', label: 'NGX INDEX', value: ngxIndex.val, change: ngxIndex.change, isUp: ngxIndex.change >= 0, link: '/ngx', type: 'NGX' },
        { id: 'ngx-cap', label: 'NGX CAP', value: ngxCap.val, change: ngxCap.change, isUp: ngxCap.change >= 0, link: '/ngx', type: 'NGX' },
        { id: 'ngx-vol', label: 'NGX VOL', value: ngxVol.val, change: ngxVol.change, isUp: ngxVol.change >= 0, link: '/ngx', type: 'NGX' },
        
        // تعديل: ETH (3 حروف فقط) + التغير
        { id: 'eth', label: 'ETH', value: `$${prices.eth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: prices.ethChange, isUp: prices.ethChange >= 0, link: '/market', type: 'MARKET' },
        
        // تعديل: POL + التغير
        { id: 'pol', label: 'POL', value: `$${prices.pol.toFixed(2)}`, change: prices.polChange, isUp: prices.polChange >= 0, link: '/market', type: 'MARKET' },
        
        // تعديل: NNM VOL (قيمة فارغة لعدم عرض الرقم الأبيض)
        { id: 'nnm', label: 'NNM VOL', value: '', change: nnmVolChange, isUp: nnmVolChange >= 0, link: '/market', type: 'MARKET' },
    ];

    // خلط العناصر (سوق + جديد + متصدر)
    const combined = [...marketItems, ...newItems, ...topItems];
    // تكرار القائمة لضمان استمرارية الشريط المتحرك
    return [...combined, ...combined]; 
  }, [prices, ngxIndex, ngxCap, ngxVol, nnmVolChange, newItems, topItems]);

  const getColor = (item: TickerItem) => {
      // اللون الذهبي للعناوين فقط
      return '#FCD535'; 
  };

  return (
    <div className="w-100 overflow-hidden position-relative" 
         style={{ backgroundColor: '#0b0e11', height: '40px', zIndex: 40, borderBottom: '1px solid #222' }}>
      
      <div className="d-flex align-items-center h-100 ticker-track">
        {items.map((item, index) => (
          <Link href={item.link} key={`${item.id}-${index}`} className="text-decoration-none h-100 d-flex align-items-center ticker-link">
            <div className="d-flex align-items-center px-4 h-100" style={{ whiteSpace: 'nowrap' }}>
              
              {/* LABEL: ذهبي دائماً */}
              <span className="me-2" style={{ 
                  color: '#FCD535', 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  letterSpacing: '0.5px' 
              }}>
                {item.label}:
              </span>
              
              {/* VALUE: أبيض دائماً (يختفي إذا كان فارغاً كما في NNM VOL) */}
              {item.value && (
                <span className="me-2" style={{ 
                    fontSize: '12px',
                    fontWeight: '500', 
                    fontFamily: '"Inter", sans-serif',
                    color: '#FFFFFF' 
                }}>
                    {item.value}
                    {item.sub && (
                        <span className="ms-2 text-secondary" style={{ fontSize: '11px' }}>({item.sub})</span>
                    )}
                </span>
              )}
              
              {/* CHANGE: ملون مع سهم */}
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
