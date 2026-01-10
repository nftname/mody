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
    ngx: 84.2, ngxChange: 1.5,
    eth: 3200, ethChange: 0.0,
    pol: 0.45, polChange: 0.0
  });
  
  // بيانات مؤشرات NGX الإضافية
  const [ngxCap, setNgxCap] = useState({ val: '$2.66B', change: 1.15 });
  const [ngxVol, setNgxVol] = useState({ val: '2.4M', change: 0.86 });
  
  // بيانات NNM الداخلية
  const [nnmVolChange, setNnmVolChange] = useState(0);
  const [topItems, setTopItems] = useState<TickerItem[]>([]);
  const [newItems, setNewItems] = useState<TickerItem[]>([]);

  // 1. جلب أسعار العملات (CoinGecko) - تعديل جراحي لجلب النسبة المئوية
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token,matic-network,ethereum&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        
        const polKey = data['polygon-ecosystem-token'] ? 'polygon-ecosystem-token' : 'matic-network';
        
        setTickerData(prev => ({
            ...prev,
            eth: data.ethereum.usd,
            ethChange: data.ethereum.usd_24h_change,
            pol: data[polKey].usd,
            polChange: data[polKey].usd_24h_change
        }));
      } catch (e) { console.error("Price API Error", e); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. جلب بيانات NGX APIs (إضافة الكاب والفوليوم للشريط)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/ngx');
        if (res.ok) {
            const json = await res.json();
            setTickerData(prev => ({
                ...prev,
                ngx: json.score || 84.2,
                ngxChange: json.change24h || 1.5
            }));
        }
        // جلب NGX Cap
        const resCap = await fetch('/api/ngx-cap');
        if (resCap.ok) {
            const jCap = await resCap.json();
            setNgxCap({ val: jCap.marketCap || '$2.66B', change: jCap.change24h || 0 });
        }
        // جلب NGX Volume
        const resVol = await fetch('/api/ngx-volume');
        if (resVol.ok) {
            const jVol = await resVol.json();
            setNgxVol({ 
                val: jVol.marketStats?.totalVolumeDisplay || '2.4M', 
                change: jVol.marketStats?.totalVolChange || 0 
            });
        }
      } catch (error) { console.error("Ticker update failed"); }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // 3. الحسابات الهجينة (تعديل جراحي لجلب الأسماء الحقيقية)
  useEffect(() => {
    const fetchHybridData = async () => {
        try {
            // أ) حساب NNM Volume %
            const { data: sales } = await supabase.from('activities').select('price, created_at').eq('activity_type', 'Sale');
            if (sales) {
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;
                let volT = 0, volY = 0;
                sales.forEach((s: any) => {
                    const time = new Date(s.created_at).getTime();
                    if (now - time <= oneDay) volT += Number(s.price);
                    else if (now - time <= 2 * oneDay) volY += Number(s.price);
                });
                setNnmVolChange(volY === 0 ? (volT > 0 ? 100 : 0) : ((volT - volY) / volY) * 100);
            }

            // ب) جلب أحدث 3 أسماء (NEW MINTS) - جلب الاسم وليس الـ ID
            const { data: mints } = await supabase.from('activities').select('asset_name, token_id').eq('activity_type', 'Mint').order('created_at', { ascending: false }).limit(3);
            if (mints) {
                setNewItems(mints.map((m, i) => ({
                    id: `new-${i}`, label: 'NEW MINTS', value: m.asset_name || `Asset #${m.token_id}`, link: `/asset/${m.token_id}`, type: 'NEW'
                })));
            }

            // ج) جلب أفضل 3 أسماء (TOP ASSETS) - جلب الاسم وليس الـ ID
            const { data: tops } = await supabase.from('activities').select('asset_name, token_id, price').eq('activity_type', 'Sale').order('price', { ascending: false }).limit(3);
            if (tops) {
                setTopItems(tops.map((s, i) => ({
                    id: `top-${i}`, label: 'TOP ASSETS', value: s.asset_name || `Asset #${s.token_id}`, link: `/asset/${s.token_id}`, type: 'TOP'
                })));
            }
        } catch (e) { console.error("Hybrid fetch error", e); }
    };
    fetchHybridData();
  }, []);

  // --- تجميع الشريط ---
  const items = useMemo(() => {
    const marketItems: TickerItem[] = [
        { id: 'ngx', label: 'NGX INDEX', value: tickerData.ngx.toFixed(1), change: tickerData.ngxChange, isUp: tickerData.ngxChange >= 0, link: '/ngx', type: 'NGX' },
        { id: 'ngx-cap', label: 'NGX CAP', value: ngxCap.val, change: ngxCap.change, isUp: ngxCap.change >= 0, link: '/ngx', type: 'NGX' },
        { id: 'ngx-vol', label: 'NGX VOL', value: ngxVol.val, change: ngxVol.change, isUp: ngxVol.change >= 0, link: '/ngx', type: 'NGX' },
        { id: 'eth', label: 'ETHEREUM', value: `$${tickerData.eth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: tickerData.ethChange, isUp: tickerData.ethChange >= 0, link: '/market', type: 'MARKET' },
        { id: 'pol', label: 'POL', value: `$${tickerData.pol.toFixed(2)}`, change: tickerData.polChange, isUp: tickerData.polChange >= 0, link: '/market', type: 'MARKET' },
        { id: 'nnm', label: 'NNM VOL', value: `${Math.abs(nnmVolChange).toFixed(1)}%`, change: nnmVolChange, isUp: nnmVolChange >= 0, link: '/market', type: 'MARKET' },
    ];

    const combined = [...marketItems, ...newItems, ...topItems];
    return [...combined, ...combined]; 
  }, [tickerData, ngxCap, ngxVol, nnmVolChange, newItems, topItems]);

  const getColor = (item: TickerItem) => {
      if (item.type === 'TOP') return '#0ecb81';
      if (item.type === 'NEW') return '#38BDF8';
      return '#FCD535'; // اللون الذهبي الافتراضي للعناوين
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
              
              {/* VALUE: أبيض دائماً */}
              <span className="me-2" style={{ 
                  fontSize: '12px',
                  fontWeight: '500', 
                  fontFamily: '"Inter", sans-serif',
                  color: '#FFFFFF' 
              }}>
                {item.value}
              </span>
              
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
          animation: scroll 45s linear infinite;
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
