'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import MarketTicker from '@/components/MarketTicker';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';
import { usePublicClient, useAccount } from "wagmi";
import { parseAbi, formatEther, erc721Abi } from 'viem';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase';

// --- Constants & ABIs ---
const MARKET_ABI = parseAbi([
    "function getAllListings() view returns (uint256[] tokenIds, uint256[] prices, address[] sellers)"
]);

const ITEMS_PER_PAGE = 30;
const GOLD_GRADIENT = 'linear-gradient(180deg, #FFD700 0%, #B3882A 100%)';
const FOX_PATH = "M29.77 8.35C29.08 7.37 26.69 3.69 26.69 3.69L22.25 11.23L16.03 2.19L9.67 11.23L5.35 3.69C5.35 3.69 2.97 7.37 2.27 8.35C2.19 8.46 2.13 8.6 2.13 8.76C2.07 10.33 1.83 17.15 1.83 17.15L9.58 24.32L15.93 30.2L16.03 30.29L16.12 30.2L22.47 24.32L30.21 17.15C30.21 17.15 29.98 10.33 29.91 8.76C29.91 8.6 29.86 8.46 29.77 8.35ZM11.16 19.34L7.56 12.87L11.53 14.86L13.88 16.82L11.16 19.34ZM16.03 23.33L12.44 19.34L15.06 16.92L16.03 23.33ZM16.03 23.33L17.03 16.92L19.61 19.34L16.03 23.33ZM20.89 19.34L18.17 16.82L20.52 14.86L24.49 12.87L20.89 19.34Z";

// --- Components ---

const GoldIcon = ({ icon, isCustomSVG = false }: { icon: string, isCustomSVG?: boolean }) => {
    if (isCustomSVG) {
        return (
            <svg viewBox="0 0 32 32" width="22" height="22" style={{ marginBottom: '2px' }}>
                <defs>
                    <linearGradient id="goldGradientIcon" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FCD535" />
                        <stop offset="100%" stopColor="#B3882A" />
                    </linearGradient>
                </defs>
                <path d={icon} fill="url(#goldGradientIcon)" />
            </svg>
        );
    }
    return <i className={`bi ${icon} brand-icon-gold`} style={{ fontSize: '20px' }}></i>;
};

const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
};

const CoinIcon = ({ name, tier }: { name: string, tier: string }) => {
    let bg = '#222';
    if (tier?.toLowerCase() === 'immortal') bg = 'linear-gradient(135deg, #333 0%, #111 100%)';
    else if (tier?.toLowerCase() === 'elite') bg = 'linear-gradient(135deg, #4a0a0a 0%, #1a0000 100%)';
    else if (tier?.toLowerCase() === 'founder' || tier?.toLowerCase() === 'founders') bg = 'linear-gradient(135deg, #004d40 0%, #002b36 100%)';

    return (
        <div style={{
            width: '40px', height: '40px', 
            borderRadius: '50%',
            background: bg,
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: 'inset 0 0 5px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', 
            fontWeight: 'bold', fontFamily: 'serif',
            color: '#FCD535', textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            flexShrink: 0
        }}>
            {name ? name.charAt(0) : 'N'}
        </div>
    );
};

// Update: Width reduced 20%, text changed to "Buy - Bid"
const ActionButton = () => (
    <button className="btn btn-sm d-flex align-items-center justify-content-center hover-glass" style={{
        background: 'rgba(252, 213, 53, 0.05)', 
        border: '1px solid #FCD535', 
        color: '#FCD535',
        fontSize: '11px', 
        fontWeight: '300',
        padding: '0 5px', // Reduced padding
        borderRadius: '4px', 
        height: '28px',
        width: '85px', // Reduced width (was 100px)
        backdropFilter: 'blur(4px)',
        cursor: 'pointer',
        letterSpacing: '0.5px',
        transition: 'all 0.3s ease'
    }}>
        Buy - Bid
    </button>
);

const getRankStyle = (rank: number) => {
    const baseStyle = { fontStyle: 'italic', fontWeight: '800', fontSize: '18px' };
    if (rank === 1) return { ...baseStyle, color: '#FF9900', textShadow: '0 0 10px rgba(255, 153, 0, 0.4)' };
    if (rank === 2) return { ...baseStyle, color: '#FFC233', textShadow: '0 0 10px rgba(255, 194, 51, 0.3)' };
    if (rank === 3) return { ...baseStyle, color: '#FCD535', textShadow: '0 0 10px rgba(252, 213, 53, 0.2)' };
    return { color: '#fff', fontWeight: '500', fontSize: '14px', fontStyle: 'normal' };
};

const SortArrows = ({ active, direction, onClick }: any) => (
    <div onClick={onClick} className="d-inline-flex flex-column ms-2 cursor-pointer" 
         style={{ height: '16px', justifyContent: 'center', verticalAlign: 'middle', width: '10px' }}>
        <i className={`bi bi-caret-up-fill ${active && direction === 'asc' ? 'text-warning' : 'text-secondary'}`} style={{ fontSize: '10px', lineHeight: '8px' }}></i>
        <i className={`bi bi-caret-down-fill ${active && direction === 'desc' ? 'text-warning' : 'text-secondary'}`} style={{ fontSize: '10px', lineHeight: '8px' }}></i>
    </div>
);

// Improved Listed Time Logic
const formatTimeAgo = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return 'Recent'; // Fallback
    const now = Date.now();
    const diff = now - timestamp;
    
    // Safety check for futuristic dates or very old dates (glitch protection)
    if (diff < 0) return 'Just now';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 365) return 'Recently'; // If DB has weird old date, show generic text

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
};

const getPaginationRange = (current: number, total: number) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const range = [];
    const showStart = 3; 
    const showEnd = 2;   
    for (let i = 1; i <= showStart; i++) range.push(i);
    if (current > showStart + 1) range.push('...');
    if (current > showStart && current <= total - showEnd) range.push(current);
    if (current < total - showEnd) if (range[range.length - 1] !== '...') range.push('...');
    for (let i = total - showEnd + 1; i <= total; i++) if (i > showStart) range.push(i);
    return range;
};

function MarketPage() {
  const { address, isConnected } = useAccount(); 
  const trustedBrands = [ 
    { name: "POLYGON", icon: "bi-link-45deg", isCustom: false },
    { name: "BNB CHAIN", icon: "bi-diamond-fill", isCustom: false },
    { name: "ETHEREUM", icon: "bi-currency-ethereum", isCustom: false },
    { name: "SOLANA", icon: "bi-lightning-charge-fill", isCustom: false },
    { name: "METAMASK", icon: FOX_PATH, isCustom: true }, 
    { name: "UNISWAP", icon: "bi-arrow-repeat", isCustom: false },
    { name: "CHAINLINK", icon: "bi-hexagon-fill", isCustom: false },
    { name: "PINATA", icon: "bi-cloud-fill", isCustom: false }, 
    { name: "IPFS", icon: "bi-box-seam-fill", isCustom: false },
    { name: "ARWEAVE", icon: "bi-database-fill-lock", isCustom: false },
    { name: "BUNDLR", icon: "bi-collection-fill", isCustom: false },
    { name: "ZKSYNC", icon: "bi-shield-check", isCustom: false },
    { name: "OPTIMISM", icon: "bi-graph-up-arrow", isCustom: false }
  ];

  const [activeFilter, setActiveFilter] = useState('All Assets');
  const [timeFilter, setTimeFilter] = useState('24H');
  const [currencyFilter, setCurrencyFilter] = useState('POL'); 
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set()); 
  
  const [realListings, setRealListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState({ pol: 0, eth: 0 });

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const publicClient = usePublicClient();

  useEffect(() => {
      const fetchPrices = async () => {
          try {
              const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network,ethereum&vs_currencies=usd');
              const data = await res.json();
              setExchangeRates({
                  pol: data['matic-network']?.usd || 0.40, 
                  eth: data['ethereum']?.usd || 3000
              });
          } catch (e) { console.error("Price API Error", e); }
      };
      fetchPrices();
      const interval = setInterval(fetchPrices, 60000); 
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isConnected && address) {
        const fetchFavorites = async () => {
            try {
                const { data } = await supabase.from('favorites').select('token_id').eq('wallet_address', address);
                if (data) {
                    setFavoriteIds(new Set(data.map((i: any) => Number(i.token_id))));
                }
            } catch (e) { console.error("Fav fetch error", e); }
        };
        fetchFavorites();
    }
  }, [address, isConnected]);

  const handleToggleFavorite = async (e: React.MouseEvent, id: number) => {
      e.preventDefault(); e.stopPropagation();
      if (!isConnected || !address) return; 
      const nextFavs = new Set(favoriteIds);
      if (nextFavs.has(id)) nextFavs.delete(id); else nextFavs.add(id);
      setFavoriteIds(nextFavs); 
      try {
          if (favoriteIds.has(id)) await supabase.from('favorites').delete().match({ wallet_address: address, token_id: id.toString() });
          else await supabase.from('favorites').insert({ wallet_address: address, token_id: id.toString() });
      } catch (err) { }
  };

  useEffect(() => {
    const fetchMarketData = async () => {
        if (!publicClient) return;
        try {
            const data = await publicClient.readContract({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKET_ABI,
                functionName: 'getAllListings'
            });
            const [tokenIds, prices] = data;

            if (tokenIds.length === 0) { setRealListings([]); setLoading(false); return; }

            const { data: allActivities } = await supabase
                .from('activities')
                .select('*')
                .order('created_at', { ascending: false }); 
            
            const { data: offersData } = await supabase
                .from('offers')
                .select('token_id')
                .eq('status', 'active');

            const statsMap: Record<number, any> = {}; 
            const now = Date.now();

            let timeLimit = 0;
            if (timeFilter === '1H') timeLimit = 3600 * 1000;
            else if (timeFilter === '6H') timeLimit = 3600 * 6 * 1000;
            else if (timeFilter === '24H') timeLimit = 3600 * 24 * 1000;
            else if (timeFilter === '7D') timeLimit = 3600 * 24 * 7 * 1000;
            else timeLimit = 315360000000; 

            if (allActivities) {
                allActivities.forEach((act: any) => {
                    const tid = Number(act.token_id);
                    const actTime = new Date(act.created_at).getTime();
                    const price = Number(act.price) || 0;

                    if (!statsMap[tid]) statsMap[tid] = { volume: 0, sales: 0, lastSale: 0, listedTime: 0 };

                    if (act.activity_type === 'Sale') {
                        if (statsMap[tid].lastSale === 0) statsMap[tid].lastSale = price; 
                        
                        if (now - actTime <= timeLimit) {
                            statsMap[tid].volume += price;
                            statsMap[tid].sales += 1;
                        }
                    }

                    // Fix: Ensure we capture the Listed time if available, preferring recent
                    if ((act.activity_type === 'List' || act.activity_type === 'Mint')) {
                        // Because array is sorted DESC, the first one found is the latest.
                        if (statsMap[tid].listedTime === 0) {
                            statsMap[tid].listedTime = actTime;
                        }
                    }
                });
            }

            const offersCountMap: any = {};
            if (offersData) offersData.forEach((o: any) => offersCountMap[o.token_id] = (offersCountMap[o.token_id] || 0) + 1);

            const items = await Promise.all(tokenIds.map(async (id, index) => {
                try {
                    const tid = Number(id);
                    const uri = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'tokenURI', args: [id] });
                    const metaRes = await fetch(resolveIPFS(uri));
                    const meta = metaRes.ok ? await metaRes.json() : {};
                    const tierAttr = (meta.attributes as any[])?.find((a: any) => a.trait_type === "Tier")?.value || "founder";
                    
                    const stats = statsMap[tid] || { volume: 0, sales: 0, lastSale: 0, listedTime: 0 };
                    const offersCount = offersCountMap[tid] || 0;
                    
                    const trendingScore = stats.sales + offersCount; 

                    return {
                        id: tid,
                        name: meta.name || `Asset #${id}`,
                        tier: tierAttr,
                        pricePol: parseFloat(formatEther(prices[index])), 
                        lastSale: stats.lastSale,
                        volume: stats.volume,
                        listedTime: stats.listedTime,
                        trendingScore: trendingScore,
                        offersCount: offersCount,
                        listed: 'Now', 
                        change: 0,
                        currencySymbol: 'POL'
                    };
                } catch (e) { return null; }
            }));

            setRealListings(items.filter(i => i !== null));
        } catch (error) { console.error("Fetch error", error); } finally { setLoading(false); }
    };

    fetchMarketData();
  }, [publicClient, timeFilter]); 

  const finalData = useMemo(() => {
      let processedData = [...realListings];
      
      if (activeFilter === 'Top') {
          processedData.sort((a, b) => b.volume - a.volume);
      } else if (activeFilter === 'Trending') {
          processedData.sort((a, b) => b.trendingScore - a.trendingScore);
      } else if (activeFilter === 'Most Offers') { 
          processedData.sort((a, b) => b.offersCount - a.offersCount);
      } else if (activeFilter === 'Watchlist') {
          processedData = processedData.filter(item => favoriteIds.has(item.id));
      } else {
          processedData.sort((a, b) => a.id - b.id); 
      }
      
      if (sortConfig) {
          processedData.sort((a: any, b: any) => {
              const valA = a[sortConfig.key];
              const valB = b[sortConfig.key];
              if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
              if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }
      return processedData;
  }, [activeFilter, favoriteIds, sortConfig, realListings]);

  const totalPages = Math.ceil(finalData.length / ITEMS_PER_PAGE);
  const currentTableData = finalData.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const paginationRange = getPaginationRange(currentPage, totalPages);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const goToPage = (page: number) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  const formatPrice = (priceInPol: number) => {
      if (currencyFilter === 'ETH') {
          const priceInUsd = priceInPol * exchangeRates.pol;
          const valInEth = priceInUsd / exchangeRates.eth;
          
          if (valInEth === 0) return '0 ETH';
          if (valInEth < 0.0001) return '< 0.0001 ETH';
          return `${valInEth.toFixed(4)} ETH`;
      }
      return `${priceInPol.toFixed(2)} POL`;
  };

  return (
    <main className="no-select" style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '50px', overflowX: 'hidden' }}>
      
      <MarketTicker />

      {/* HEADER */}
      <div className="header-wrapper shadow-sm">
        <div className="container-fluid p-0"> 
            <div className="widgets-grid-container">
                <div className="widget-item"> <NGXWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXCapWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXVolumeWidget theme="dark" /> </div>
            </div>
            <div className="row align-items-center px-3 mt-3 text-section desktop-only-text">
                <div className="col-lg-12">
                    <h1 className="fw-bold mb-2 main-title">Buy & Sell <span style={{ color: '#E0E0E0' }}>Nexus Rare</span> Digital Name Assets NFTs</h1>
                    <p className="mb-0 main-desc">Live prices, verified rarity, and a growing marketplace where traders compete for the most valuable digital name assets.</p>
                </div>
            </div>
            <div className="d-block d-md-none px-3 mt-3 mobile-only-text">
                <h1 className="fw-bold text-white h4 text-start m-0" style={{ letterSpacing: '-0.5px', lineHeight: '1.3', color: '#E0E0E0' }}>Buy & Sell <span style={{ color: '#E0E0E0' }}>Nexus Rare</span> Digital Name Assets NFTs.</h1>
                <p style={{ fontFamily: '"Inter", "Segoe UI", sans-serif', fontSize: '15px', color: '#B0B0B0', marginTop: '8px', marginBottom: 0, lineHeight: '1.5' }}>Live prices, verified rarity, and a growing marketplace where traders compete for the most valuable digital name assets.</p>
            </div>
        </div>
      </div>

      <section className="container mb-0 mt-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3 border-top border-bottom border-secondary" style={{ borderColor: '#222 !important', padding: '2px 0' }}>
              <div className="d-flex gap-4 overflow-auto no-scrollbar w-100 w-lg-auto align-items-center justify-content-start" style={{ paddingTop: '2px' }}>
                  <div onClick={() => setActiveFilter('Watchlist')} className={`cursor-pointer filter-item ${activeFilter === 'Watchlist' ? 'active' : 'text-header-gray'}`} style={{ fontSize: '13.5px', fontWeight: 'bold', paddingBottom: '4px' }}>Watchlist</div>
                  {['Trending', 'Top', 'Most Offers', 'All Assets'].map(f => (
                      <div key={f} onClick={() => setActiveFilter(f)} className={`cursor-pointer filter-item fw-bold ${activeFilter === f ? 'text-white active' : 'text-header-gray'} desktop-nowrap`} style={{ fontSize: '13.5px', whiteSpace: 'nowrap', position: 'relative', paddingBottom: '4px' }}>{f}</div>
                  ))}
              </div>
              <div className="d-flex gap-3 align-items-center w-100 w-lg-auto overflow-auto no-scrollbar justify-content-start justify-content-lg-end" style={{ height: '32px', marginTop: '2px', marginBottom: '2px' }}>
                   <div className="binance-filter-group d-flex align-items-center flex-shrink-0" style={{ height: '100%' }}>
                      {['All', 'ETH', 'POL'].map(c => (
                          <button key={c} onClick={() => setCurrencyFilter(c)} className={`btn btn-sm border-0 binance-filter-btn hover-gold-text ${currencyFilter === c ? 'active-currency' : 'text-header-gray'}`} style={{ fontSize: '13px', minWidth: '50px', fontWeight: '400', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c}</button>
                      ))}
                   </div>
                   <div className="binance-filter-group d-flex align-items-center flex-shrink-0" style={{ height: '100%' }}>
                      {['1H', '6H', '24H', '7D', 'All'].map(t => (
                          <button key={t} onClick={() => setTimeFilter(t)} className={`btn btn-sm border-0 binance-filter-btn hover-gold-text ${timeFilter === t ? 'active-time' : 'text-header-gray'}`} style={{ fontSize: '13px', minWidth: '45px', fontWeight: '400', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t}</button>
                      ))}
                   </div>
              </div>
          </div>
      </section>

      <section className="container mt-5 pt-0">
          <div className="table-responsive no-scrollbar">
              {loading ? ( <div className="text-center py-5 text-secondary">Loading Marketplace Data...</div>
              ) : activeFilter === 'Watchlist' && finalData.length === 0 ? ( <div className="text-center py-5 text-secondary">Your watchlist is empty.</div>
              ) : finalData.length === 0 ? ( <div className="text-center py-5 text-secondary">No items listed for sale yet.</div>
              ) : (
                  <table className="table align-middle mb-0" style={{ minWidth: '900px', borderCollapse: 'separate', borderSpacing: '0' }}>
                      <thead style={{ position: 'sticky', top: '0', zIndex: 50, backgroundColor: '#1E1E1E' }}>
                          <tr style={{ borderBottom: '1px solid #333' }}>
                              <th onClick={() => handleSort('rank')} style={{ backgroundColor: '#1E1E1E', color: '#c0c0c0', fontSize: '13.5px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', width: '80px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                                  <div className="d-flex align-items-center">Rank <SortArrows active={sortConfig?.key === 'rank'} direction={sortConfig?.direction} /></div>
                              </th>
                              <th onClick={() => handleSort('name')} style={{ backgroundColor: '#1E1E1E', color: '#c0c0c0', fontSize: '13.5px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', minWidth: '180px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                                  <div className="d-flex align-items-center">Asset Name <SortArrows active={sortConfig?.key === 'name'} direction={sortConfig?.direction} /></div>
                              </th>
                              {/* Price Align Left, Reduced width to close gap */}
                              <th onClick={() => handleSort('pricePol')} style={{ backgroundColor: '#1E1E1E', color: '#c0c0c0', fontSize: '13.5px', fontWeight: '600', padding: '4px 0', borderBottom: '1px solid #333', textAlign: 'left', whiteSpace: 'nowrap', cursor: 'pointer', width: '100px' }}>
                                  <div className="d-flex align-items-center justify-content-start">Price <SortArrows active={sortConfig?.key === 'pricePol'} direction={sortConfig?.direction} /></div>
                              </th>
                              {/* Last Sale Align Left */}
                              <th style={{ backgroundColor: '#1E1E1E', color: '#c0c0c0', fontSize: '13.5px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', textAlign: 'left', whiteSpace: 'nowrap' }}>Last Sale</th>
                              {/* Volume Align Left */}
                              <th onClick={() => handleSort('volume')} style={{ backgroundColor: '#1E1E1E', color: '#c0c0c0', fontSize: '13.5px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', textAlign: 'left', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                                  <div className="d-flex align-items-center justify-content-start">Volume <SortArrows active={sortConfig?.key === 'volume'} direction={sortConfig?.direction} /></div>
                              </th>
                              <th style={{ backgroundColor: '#1E1E1E', color: '#c0c0c0', fontSize: '13.5px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', textAlign: 'right', whiteSpace: 'nowrap' }}>Listed</th>
                              <th style={{ backgroundColor: '#1E1E1E', color: '#c0c0c0', fontSize: '13.5px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', textAlign: 'center', width: '140px', whiteSpace: 'nowrap' }}>Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          {currentTableData.map((item: any, index: number) => {
                              const dynamicRank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                              return (
                                <tr key={item.id} className="market-row" style={{ transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <i className={`bi ${favoriteIds.has(item.id) ? 'bi-heart-fill text-white' : 'bi-heart text-secondary'} hover-gold cursor-pointer`} style={{ fontSize: '14px' }} onClick={(e) => handleToggleFavorite(e, item.id)}></i>
                                            <span style={getRankStyle(dynamicRank) as any}>{dynamicRank}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                        <Link href={`/asset/${item.id}`} className="d-flex align-items-center gap-2 text-decoration-none group">
                                            <CoinIcon name={item.name} tier={item.tier} />
                                            <span className="text-white fw-bold name-hover name-shake" style={{ fontSize: '13.5px', letterSpacing: '0.5px', color: '#E0E0E0' }}>{item.name}</span>
                                        </Link>
                                    </td>
                                    {/* Price: Left Align, Normal Weight */}
                                    <td className="text-start" style={{ padding: '12px 0', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                        <div className="d-flex align-items-center justify-content-start gap-2">
                                            <span className="text-white" style={{ fontSize: '14px', fontWeight: '400', color: '#E0E0E0' }}>{formatPrice(item.pricePol)}</span>
                                        </div>
                                    </td>
                                    {/* Last Sale: Left Align */}
                                    <td className="text-start" style={{ padding: '12px 10px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                        <span className="text-white" style={{ fontSize: '13px', color: '#E0E0E0' }}>{item.lastSale ? formatPrice(item.lastSale) : '---'}</span>
                                    </td>
                                    {/* Volume: Left Align */}
                                    <td className="text-start" style={{ padding: '12px 10px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                        <div className="d-flex flex-column align-items-start">
                                            <span className="text-white" style={{ fontSize: '13px', color: '#E0E0E0' }}>{formatPrice(item.volume)}</span>
                                            {item.volume > 0 && <span style={{ fontSize: '10px', color: '#0ecb81' }}>+<i className="bi bi-caret-up-fill"></i></span>}
                                        </div>
                                    </td>
                                    <td className="text-end" style={{ padding: '12px 10px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                        <span className="text-white" style={{ fontSize: '12px', color: '#E0E0E0' }}>{formatTimeAgo(item.listedTime)}</span>
                                    </td>
                                    <td className="text-center" style={{ padding: '12px 10px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                        <Link href={`/asset/${item.id}`} className="text-decoration-none">
                                            <ActionButton />
                                        </Link>
                                    </td>
                                </tr>
                              );
                          })}
                      </tbody>
                  </table>
              )}
          </div>

          <div className="d-flex justify-content-center align-items-center gap-3 mt-5 text-secondary" style={{ fontSize: '14px' }}>
              <i className={`bi bi-chevron-left ${currentPage === 1 ? 'text-muted' : 'cursor-pointer hover-white'}`} onClick={() => goToPage(currentPage - 1)}></i>
              {paginationRange.map((pageNumber, index) => {
                  if (pageNumber === '...') return <span key={index} className="text-muted">...</span>;
                  return (
                      <span key={index} onClick={() => goToPage(pageNumber as number)} className={`cursor-pointer ${currentPage === pageNumber ? 'text-white fw-bold' : 'hover-white'}`} style={{ padding: '0 5px', minWidth: '24px', textAlign: 'center', color: currentPage === pageNumber ? '#fff' : '#6c757d' }}>
                          {pageNumber}
                      </span>
                  );
              })}
              <i className={`bi bi-chevron-right ${currentPage === totalPages ? 'text-muted' : 'cursor-pointer hover-white'}`} onClick={() => goToPage(currentPage + 1)}></i>
          </div>
      </section>

      <div className="w-100 py-3 border-top border-bottom border-secondary position-relative" style={{ borderColor: '#333 !important', marginTop: '5rem', marginBottom: '40px', backgroundColor: '#0b0e11', maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)' }}>
          <div className="text-center mb-2"><span className="text-secondary text-uppercase" style={{ fontSize: '10px', letterSpacing: '3px', opacity: 1, color: '#aaa' }}>Built for Web3</span></div>
          <div className="marquee-container overflow-hidden position-relative w-100">
              <div className="marquee-track d-flex align-items-center">
                  {[...trustedBrands, ...trustedBrands, ...trustedBrands].map((brand, index) => (
                      <div key={index} className="brand-item d-flex align-items-center justify-content-center mx-5" style={{ minWidth: '120px', transition: '0.4s' }}>
                          <div className="brand-logo d-flex align-items-center gap-2" style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Montserrat, sans-serif', letterSpacing: '1px' }}>
                              <GoldIcon icon={brand.icon} isCustomSVG={brand.isCustom} />
                              <span className="brand-text-gold">{brand.name}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      <style jsx global>{`
        .no-select { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
        .header-wrapper { background: #242424; border-bottom: 1px solid #2E2E2E; padding: 4px 0; margin-top: 0; }
        .widgets-grid-container { display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; max-width: 1050px; margin: 0 auto; padding: 0 15px; }
        .widget-item { flex: 0 0 310px; }
        .main-title { font-size: 1.53rem; color: #E0E0E0; letter-spacing: -1px; }
        .main-desc { font-size: 15px; color: #B0B0B0; max-width: 650px; }
        .text-section { max-width: 1050px; margin: 0 auto; }
        @media (max-width: 768px) {
            .header-wrapper { padding: 2px 0 !important; }
            .widgets-grid-container { display: flex !important; flex-wrap: nowrap !important; justify-content: space-between !important; gap: 2px !important; padding: 0 4px !important; max-width: 100% !important; overflow-x: hidden; }
            .widget-item { flex: 1 1 auto !important; min-width: 0 !important; max-width: 33% !important; }
            .desktop-only-text { display: none !important; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .market-row:hover td { background-color: rgba(255, 255, 255, 0.03) !important; }
        .name-hover:hover { color: #FCD535; text-decoration: none !important; }
        @keyframes subtleShake { 0% { transform: translateX(0); } 25% { transform: translateX(2px); } 50% { transform: translateX(-2px); } 75% { transform: translateX(1px); } 100% { transform: translateX(0); } }
        .market-row:hover .name-shake { animation: subtleShake 0.4s ease-in-out; color: #FCD535 !important; }
        .filter-item { border-bottom: 2px solid transparent; transition: all 0.2s; cursor: pointer; padding-bottom: 4px; }
        .filter-item:hover, .filter-item.active { color: #fff !important; border-bottom: 2px solid #FCD535; }
        .binance-filter-btn { border-radius: 2px; padding: 6px 12px; transition: all 0.2s; }
        .binance-filter-group { border: 1px solid #333; background: transparent; padding: 4px; border-radius: 2px; gap: 2px; }
        .active-time, .active-currency { background-color: #2B3139 !important; color: #FCD535 !important; }
        .text-header-gray { color: #848E9C !important; }
        .hover-gold-text:hover:not(.active-time):not(.active-currency) { color: #FCD535 !important; }
        .hover-gold:hover { color: #FCD535 !important; }
        .hover-white:hover { color: #fff !important; border-color: #fff !important; }
        .hover-glass:hover { background: rgba(252, 213, 53, 0.15) !important; box-shadow: 0 0 10px rgba(252, 213, 53, 0.3); }
        .cursor-pointer { cursor: pointer; }
        @media (min-width: 992px) { .text-nowrap-desktop { white-space: nowrap; } .desktop-nowrap { white-space: nowrap; } }
        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } 
        .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } 
        .marquee-track { animation: scroll 75s linear infinite; width: max-content; }
      `}</style>
    </main>
  );
}

export default dynamicImport(() => Promise.resolve(MarketPage), { ssr: false });
