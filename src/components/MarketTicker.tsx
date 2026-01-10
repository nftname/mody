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
  const [prices, setPrices] = useState({ eth: 0, pol: 0 });
  
  // بيانات مؤشرات NGX
  const [ngxIndex, setNgxIndex] = useState({ val: '84.2', change: 1.5 });
  const [ngxCap, setNgxCap] = useState({ val: '$2.54B', change: 4.88 });
  const [ngxVol, setNgxVol] = useState({ val: '2.4M', change: 0.86 });
  
  // بيانات NNM الداخلية
  const [nnmVolChange, setNnmVolChange] = useState(0);
  const [topItems, setTopItems] = useState<TickerItem[]>([]);
  const [newItems, setNewItems] = useState<TickerItem[]>([]);

  // 1. جلب أسعار العملات (CoinGecko) - لتوحيد السعر مع الماركت
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token,matic-network,ethereum&vs_currencies=usd');
        const data = await res.json();
        const polPrice = data['polygon-ecosystem-token']?.usd || data['matic-network']?.usd || 0;
        const ethPrice = data['ethereum']?.usd || 0;
        setPrices({ eth: ethPrice, pol: polPrice });
      } catch (e) { console.error(e); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. جلب بيانات NGX APIs (Index, Cap, Volume)
  useEffect(() => {
    const fetchNgxData = async () => {
      try {
        // NGX Index
        const res1 = await fetch('/api/ngx');
        if (res1.ok) {
            const j1 = await res1.json();
            setNgxIndex({ val: (j1.score || 84.2).toFixed(1), change: j1.change24h || 0 });
        }
        // NGX Cap
        const res2 = await fetch('/api/ngx-cap');
        if (res2.ok) {
            const j2 = await res2.json();
            setNgxCap({ val: j2.marketCap || '$2.54B', change: j2.change24h || 0 });
        }
        // NGX Volume
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

  // 3. الحسابات الهجينة (Supabase): NNM Vol, Top 3, New 3
  useEffect(() => {
    const fetchHybridData = async () => {
        try {
            // أ) حساب NNM Volume % (مبيعات اليوم vs الأمس)
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

            // ب) جلب أحدث 3 (Mint)
            const { data: mints } = await supabase
                .from('activities')
                .select('token_id, created_at')
                .eq('activity_type', 'Mint')
                .order('created_at', { ascending: false })
                .limit(3);

            if (mints) {
                setNewItems(mints.map((m, i) => ({
                    id: `new-${i}`,
                    label: 'NEW',
                    value: `Asset #${m.token_id}`,
                    link: `/asset/${m.token_id}`,
                    type: 'NEW',
                    isUp: true
                })));
            }

            // ج) جلب أفضل 3 (Top Sales)
            const { data: topSales } = await supabase
                .from('activities')
                .select('token_id, price')
                .eq('activity_type', 'Sale')
                .order('price', { ascending: false })
                .limit(3);

            if (topSales) {
                setTopItems(topSales.map((s, i) => ({
                    id: `top-${i}`,
                    label: 'TOP',
                    value: `Asset #${s.token_id}`,
                    sub: `${Number(s.price).toFixed(0)} POL`,
                    link: `/asset/${s.token_id}`,
                    type: 'TOP',
                    isUp: true
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
        { id: 'eth', label: 'ETH', value: `$${prices.eth.toLocaleString()}`, link: '/market', type: 'MARKET' },
        { id: 'pol', label: 'POL', value: `$${prices.pol.toFixed(3)}`, link: '/market', type: 'MARKET' },
        { id: 'nnm', label: 'NNM VOL', value: `${Math.abs(nnmVolChange).toFixed(1)}%`, change: nnmVolChange, isUp: nnmVolChange >= 0, link: '/market', type: 'MARKET' },
    ];

    // خلط العناصر (سوق + جديد + متصدر)
    const combined = [...marketItems, ...newItems, ...topItems];
    // تكرار القائمة لضمان استمرارية الشريط المتحرك
    return [...combined, ...combined]; 
  }, [prices, ngxIndex, ngxCap, ngxVol, nnmVolChange, newItems, topItems]);

  const getColor = (item: TickerItem) => {
      if (item.type === 'TOP') return '#0ecb81'; // أخضر
      if (item.type === 'NEW') return '#38BDF8'; // أزرق سماوي
      if (item.type === 'NGX') return '#FCD535'; // ذهبي
      return '#FFFFFF'; // أبيض للعملات
  };

  return (
    <div className="w-100 overflow-hidden position-relative" 
         style={{ backgroundColor: '#0b0e11', height: '40px', zIndex: 40, borderBottom: '1px solid #222' }}>
      
      <div className="d-flex align-items-center h-100 ticker-track">
        {items.map((item, index) => (
          <Link href={item.link} key={`${item.id}-${index}`} className="text-decoration-none h-100 d-flex align-items-center ticker-link">
            <div className="d-flex align-items-center px-4 h-100" style={{ whiteSpace: 'nowrap' }}>
              
              <span className="me-2" style={{ 
                  color: getColor(item), 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  letterSpacing: '0.5px' 
              }}>
                {item.label}:
              </span>
              
              <span className="me-2" style={{ 
                  fontSize: '12px',
                  fontWeight: '500', 
                  fontFamily: '"Inter", sans-serif',
                  color: item.type === 'MARKET' ? '#FFFFFF' : '#E0E0E0' 
              }}>
                {item.value}
                {item.sub && <span className="ms-2 text-secondary" style={{ fontSize: '11px' }}>({item.sub})</span>}
              </span>
              
              {item.change !== undefined && (
                <span style={{ 
                    color: item.isUp ? '#0ecb81' : '#f6465d', 
                    fontSize: '10px', 
                    fontWeight: '600'
                }}>
                  {item.isUp ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
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
