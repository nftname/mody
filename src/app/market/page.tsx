'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import MarketTicker from '@/components/MarketTicker';
import NGXWidget from '@/components/NGXWidget';
import { usePublicClient } from "wagmi";
import { parseAbi, formatEther, erc721Abi } from 'viem';
// استيراد العنوان الصحيح من ملف الكونفيج
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';

const BACKGROUND_DARK = '#1E1E1E';
const TEXT_PRIMARY = '#E0E0E0';
const TEXT_MUTED = '#B0B0B0';
const MARKET_ABI = parseAbi([
    "function getAllListings() view returns (uint256[] tokenIds, uint256[] prices, address[] sellers)"
]);

const ITEMS_PER_PAGE = 30;
const GOLD_GRADIENT = 'linear-gradient(180deg, #FFD700 0%, #FDB931 50%, #B8860B 100%)';
const BODY_TEXT_STYLE = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: TEXT_MUTED,
    fontFamily: '"Inter", "Segoe UI", sans-serif'
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
            width: '45px', height: '45px', 
            borderRadius: '50%',
            background: bg,
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: 'inset 0 0 5px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', 
            fontWeight: 'bold', fontFamily: 'serif',
            color: '#F0C420', textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            flexShrink: 0
        }}>
            {name ? name.charAt(0) : 'N'}
        </div>
    );
};

const ActionButton = ({ text }: { text: string }) => (
    <button className="btn btn-sm fw-bold d-flex align-items-center justify-content-center" style={{
        background: GOLD_GRADIENT,
        border: 'none', color: '#000',
        fontSize: '10px', padding: '4px 12px',
        borderRadius: '2px', 
        boxShadow: '0 1px 4px rgba(252, 213, 53, 0.2)',
        height: '24px', width: '50px',
        cursor: 'pointer'
    }}>
        {text}
    </button>
);

const getRankStyle = (rank: number) => {
    const baseStyle = { fontStyle: 'italic', fontWeight: '800', fontSize: '18px' };
    if (rank === 1) return { ...baseStyle, color: '#FFD700', textShadow: '0 0 10px rgba(253, 185, 49, 0.4)' };
    if (rank === 2) return { ...baseStyle, color: '#FDB931', textShadow: '0 0 10px rgba(240, 196, 32, 0.3)' };
    if (rank === 3) return { ...baseStyle, color: '#F0C420', textShadow: '0 0 10px rgba(184, 134, 11, 0.25)' };
    return { color: '#E0E0E0', fontWeight: '500', fontSize: '14px', fontStyle: 'normal' };
};

const SortArrows = ({ active, direction, onClick }: any) => (
    <div onClick={onClick} className="d-inline-flex flex-column ms-2 cursor-pointer" 
         style={{ height: '16px', justifyContent: 'center', verticalAlign: 'middle', width: '10px' }}>
        <i className={`bi bi-caret-up-fill ${active && direction === 'asc' ? 'text-warning' : 'text-secondary'}`} style={{ fontSize: '10px', lineHeight: '8px' }}></i>
        <i className={`bi bi-caret-down-fill ${active && direction === 'desc' ? 'text-warning' : 'text-secondary'}`} style={{ fontSize: '10px', lineHeight: '8px' }}></i>
    </div>
);

function MarketPage() {
  const [activeFilter, setActiveFilter] = useState('All Assets');
  const [timeFilter, setTimeFilter] = useState('24H');
  const [currencyFilter, setCurrencyFilter] = useState('POL'); 
  const [watchlist, setWatchlist] = useState<number[]>([]); 
  
  const [realListings, setRealListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchMarketData = async () => {
        if (!publicClient) return;
        try {
            // استخدام العنوان الصحيح من ملف الكونفيج
            const data = await publicClient.readContract({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKET_ABI,
                functionName: 'getAllListings'
            });

            const [tokenIds, prices, sellers] = data;

            if (tokenIds.length === 0) {
                setRealListings([]);
                setLoading(false);
                return;
            }

            const items = await Promise.all(tokenIds.map(async (id, index) => {
                try {
                    const uri = await publicClient.readContract({
                        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                        abi: erc721Abi,
                        functionName: 'tokenURI',
                        args: [id]
                    });
                    
                    const metaRes = await fetch(resolveIPFS(uri));
                    const meta = metaRes.ok ? await metaRes.json() : {};
                    const tierAttr = (meta.attributes as any[])?.find((a: any) => a.trait_type === "Tier")?.value || "founder";

                    return {
                        id: Number(id),
                        rank: index + 1, 
                        name: meta.name || `Asset #${id}`,
                        tier: tierAttr,
                        floor: formatEther(prices[index]),
                        lastSale: '---',
                        volume: '---',
                        listed: 'Now',
                        change: 0,
                        currencySymbol: 'POL'
                    };
                } catch (e) {
                    return null;
                }
            }));

            setRealListings(items.filter(i => i !== null));
        } catch (error) {
            console.error("Failed to fetch listings", error);
        } finally {
            setLoading(false);
        }
    };

    fetchMarketData();
  }, [publicClient]);

  const finalData = useMemo(() => {
      let processedData = [...realListings];
      
      if (activeFilter === 'Watchlist') {
          processedData = processedData.filter(item => watchlist.includes(item.id));
      }
      
      if (sortConfig) {
          processedData.sort((a: any, b: any) => {
              const valA = isNaN(parseFloat(a[sortConfig.key])) ? a[sortConfig.key] : parseFloat(a[sortConfig.key]);
              const valB = isNaN(parseFloat(b[sortConfig.key])) ? b[sortConfig.key] : parseFloat(b[sortConfig.key]);
              if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
              if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }
      return processedData;
  }, [activeFilter, watchlist, sortConfig, realListings]);

  const totalPages = Math.ceil(finalData.length / ITEMS_PER_PAGE);
  const currentTableData = finalData.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const toggleWatchlist = (id: number) => {
    setWatchlist(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
      }
  };

  const getCurrencyLabel = () => currencyFilter === 'ETH' ? 'ETH' : 'POL';

    return (
        <main style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '50px', color: TEXT_PRIMARY }}>
      
      <MarketTicker />

      <section className="container pt-3 pb-3 d-none d-md-block">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-4">
              <div className="text-center text-lg-start pt-2" style={{ flex: 1 }}>
                  <h1 className="fw-bold mb-2 text-nowrap-desktop" 
                      style={{ 
                          fontFamily: '"Inter", "Segoe UI", sans-serif', 
                          fontSize: '1.53rem', 
                          fontWeight: '700', 
                          letterSpacing: '-1px', 
                          lineHeight: '1.2',
                          color: TEXT_PRIMARY 
                      }}>
                      Buy & Sell Nexus Rare Digital Name Assets NFTs
                  </h1>
                  
                  <p style={{ 
                      ...BODY_TEXT_STYLE,
                      maxWidth: '650px', 
                      marginTop: '10px',
                      marginBottom: 0,
                  }}>
                      Live prices, verified rarity, and a growing marketplace where traders compete for the most valuable digital name assets — turning NFTs into liquid financial power.
                  </p>
              </div>
              <div style={{ width: '100%', maxWidth: '380px' }}>
                  <NGXWidget />
              </div>
          </div>
      </section>

      <section className="d-block d-md-none pt-3 pb-2 px-3 text-start">
          <h1 className="fw-bold h4 text-start m-0" 
              style={{ fontFamily: '"Inter", "Segoe UI", sans-serif', letterSpacing: '-0.5px', lineHeight: '1.3', color: TEXT_PRIMARY }}>
              Buy & Sell Nexus Rare Digital Name Assets NFTs.
          </h1>
          <p className="text-start" style={{ 
              ...BODY_TEXT_STYLE,
              fontSize: '14px',
              marginTop: '8px',
              marginBottom: 0
          }}>
              Live prices, verified rarity, and a growing marketplace where traders compete for the most valuable digital name assets. Turn your NFTs into liquid financial power.
          </p>
          <div className="mt-3">
              <NGXWidget />
          </div>
      </section>

      <section className="container mb-0 mt-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3 border-top border-bottom border-secondary" 
               style={{ borderColor: '#222 !important', padding: '2px 0' }}>
              
              <div className="d-flex gap-4 overflow-auto no-scrollbar w-100 w-lg-auto align-items-center justify-content-start" style={{ paddingTop: '2px' }}>
                  <div 
                    onClick={() => setActiveFilter('Watchlist')}
                    className={`d-flex align-items-center gap-1 cursor-pointer filter-item ${activeFilter === 'Watchlist' ? 'active' : ''}`}
                    style={{ fontSize: '16px', fontWeight: 'bold', color: activeFilter === 'Watchlist' ? '#E0E0E0' : '#F0C420', paddingBottom: '4px' }}
                  >
                      <i className={`bi ${activeFilter === 'Watchlist' ? 'bi-star-fill text-warning' : 'bi-star-fill'}`}></i> Watchlist
                  </div>
                  {['Trending', 'Top', 'All Assets'].map(f => (
                      <div key={f} onClick={() => setActiveFilter(f)} 
                          className={`cursor-pointer filter-item fw-bold ${activeFilter === f ? 'active' : 'text-header-gray'} desktop-nowrap`}
                          style={{ fontSize: '16px', whiteSpace: 'nowrap', position: 'relative', paddingBottom: '4px', color: activeFilter === f ? '#E0E0E0' : '#848E9C' }}>
                          {f}
                      </div>
                  ))}
              </div>

              <div className="d-flex gap-3 align-items-center w-100 w-lg-auto overflow-auto no-scrollbar justify-content-start justify-content-lg-end" style={{ height: '32px', marginTop: '2px', marginBottom: '2px' }}>
                   <div className="binance-filter-group d-flex align-items-center flex-shrink-0" style={{ height: '100%' }}>
                      {['All', 'ETH', 'POL'].map(c => (
                          <button key={c} onClick={() => setCurrencyFilter(c)}
                                  className={`btn btn-sm border-0 binance-filter-btn hover-gold-text ${currencyFilter === c ? 'active-currency' : 'text-header-gray'}`}
                                  style={{ fontSize: '13px', minWidth: '50px', fontWeight: '400', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {c}
                          </button>
                      ))}
                   </div>
                   <div className="binance-filter-group d-flex align-items-center flex-shrink-0" style={{ height: '100%' }}>
                      {['1H', '6H', '24H', '7D', 'All'].map(t => (
                          <button key={t} onClick={() => setTimeFilter(t)} 
                                  className={`btn btn-sm border-0 binance-filter-btn hover-gold-text ${timeFilter === t ? 'active-time' : 'text-header-gray'}`}
                                  style={{ fontSize: '13px', minWidth: '45px', fontWeight: '400', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {t}
                          </button>
                      ))}
                   </div>
              </div>
          </div>
      </section>

      <section className="container mt-5 pt-0">
          <div className="table-responsive no-scrollbar">
              
              {loading ? (
                 <div className="text-center py-5 text-secondary">Loading Marketplace Data...</div>
              ) : activeFilter === 'Watchlist' && finalData.length === 0 ? (
                  <div className="text-center py-5 text-secondary">
                      <i className="bi bi-star" style={{ fontSize: '40px', marginBottom: '10px', display: 'block' }}></i>
                      Your watchlist is empty.
                  </div>
              ) : finalData.length === 0 ? (
                  <div className="text-center py-5 text-secondary">No items listed for sale yet.</div>
              ) : (
                  <table className="table align-middle mb-0" style={{ minWidth: '900px', borderCollapse: 'separate', borderSpacing: '0', color: '#E0E0E0' }}>
                      
                      <thead style={{ position: 'sticky', top: '0', zIndex: 50, backgroundColor: '#1E1E1E' }}>
                          <tr style={{ borderBottom: '1px solid #333' }}>
                              <th onClick={() => handleSort('rank')} style={{ backgroundColor: '#1E1E1E', color: '#E0E0E0', fontSize: '15px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', width: '80px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                                  <div className="d-flex align-items-center">Rank <SortArrows active={sortConfig?.key === 'rank'} direction={sortConfig?.direction} /></div>
                              </th>
                              <th onClick={() => handleSort('name')} style={{ backgroundColor: '#1E1E1E', color: '#E0E0E0', fontSize: '15px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', minWidth: '220px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                                  <div className="d-flex align-items-center">Asset Name <SortArrows active={sortConfig?.key === 'name'} direction={sortConfig?.direction} /></div>
                              </th>
                              <th onClick={() => handleSort('floor')} style={{ backgroundColor: '#1E1E1E', color: '#E0E0E0', fontSize: '15px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', textAlign: 'left', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                                  <div className="d-flex align-items-center justify-content-start">Price <SortArrows active={sortConfig?.key === 'floor'} direction={sortConfig?.direction} /></div>
                              </th>
                              <th style={{ backgroundColor: '#1E1E1E', color: '#E0E0E0', fontSize: '15px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                  Last Sale
                              </th>
                              <th style={{ backgroundColor: '#1E1E1E', color: '#E0E0E0', fontSize: '15px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                  Volume
                              </th>
                              <th style={{ backgroundColor: '#1E1E1E', color: '#E0E0E0', fontSize: '15px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                  Listed
                              </th>
                              <th style={{ backgroundColor: '#1E1E1E', color: '#E0E0E0', fontSize: '15px', fontWeight: '600', padding: '4px 10px', borderBottom: '1px solid #333', textAlign: 'center', width: '140px', whiteSpace: 'nowrap' }}>
                                  Action
                              </th>
                          </tr>
                      </thead>

                      <tbody>
                          {currentTableData.map((item: any) => (
                              <tr key={item.id} className="market-row" style={{ transition: 'background-color 0.2s' }}>
                                  <td style={{ padding: '16px 10px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                      <div className="d-flex align-items-center gap-3">
                                          <i 
                                            className={`bi ${watchlist.includes(item.id) ? 'bi-star-fill text-warning' : 'bi-star text-secondary'} hover-gold cursor-pointer`} 
                                            style={{ fontSize: '14px' }}
                                            onClick={() => toggleWatchlist(item.id)}
                                          ></i>
                                          <span style={getRankStyle(item.rank) as any}>{item.rank}</span>
                                      </div>
                                  </td>
                                  <td style={{ padding: '16px 10px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                      <Link href={`/asset/${item.id}`} className="d-flex align-items-center gap-3 text-decoration-none group">
                                          <CoinIcon name={item.name} tier={item.tier} />
                                          <span className="fw-bold name-hover name-shake" style={{ fontSize: '14px', letterSpacing: '0.5px', color: '#E0E0E0' }}>{item.name}</span>
                                      </Link>
                                  </td>
                                  <td className="text-start" style={{ padding: '16px 10px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                      <div className="d-flex align-items-center justify-content-start gap-2">
                                          <span className="fw-bold" style={{ fontSize: '14px', color: '#E0E0E0' }}>{item.floor}</span>
                                          <span style={{ fontSize: '12px', color: '#E0E0E0' }}>{item.currencySymbol || getCurrencyLabel()}</span>
                                          <span style={{ fontSize: '12px', color: '#0ecb81' }}>+0.00%</span>
                                      </div>
                                  </td>
                                  <td className="text-end" style={{ padding: '16px 10px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                      <span style={{ fontSize: '13px', color: '#E0E0E0' }}>{item.lastSale}</span>
                                  </td>
                                  <td className="text-end" style={{ padding: '16px 10px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                      <span style={{ fontSize: '13px', color: '#E0E0E0' }}>{item.volume}</span>
                                  </td>
                                  <td className="text-end" style={{ padding: '16px 10px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                      <span style={{ fontSize: '12px', color: '#E0E0E0' }}>{item.listed}</span>
                                  </td>
                                  <td className="text-center" style={{ padding: '16px 10px', borderBottom: '1px solid #1c2128', backgroundColor: 'transparent' }}>
                                      <div className="d-flex justify-content-center gap-2">
                                          <Link href={`/asset/${item.id}`} className="text-decoration-none">
                                              <ActionButton text="Buy" />
                                          </Link>
                                          <Link href={`/asset/${item.id}`} className="text-decoration-none">
                                              <button className="btn btn-sm border-secondary hover-white" style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '2px', background: 'transparent', color: '#E0E0E0' }}>Bid</button>
                                          </Link>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              )}
          </div>

          {totalPages > 1 && activeFilter !== 'Watchlist' && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-5 text-secondary" style={{ fontSize: '14px' }}>
                  <i 
                      className={`bi bi-chevron-left ${currentPage === 1 ? 'text-muted' : 'cursor-pointer hover-white'}`}
                      style={{ color: currentPage === 1 ? '#666' : '#E0E0E0' }}
                      onClick={() => goToPage(currentPage - 1)}
                  ></i>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <span 
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`cursor-pointer ${currentPage === page ? 'fw-bold' : 'hover-white'}`}
                          style={{ padding: '0 5px', color: '#E0E0E0' }}
                      >
                          {page}
                      </span>
                  ))}

                  <i 
                      className={`bi bi-chevron-right ${currentPage === totalPages ? 'text-muted' : 'cursor-pointer hover-white'}`}
                      style={{ color: currentPage === totalPages ? '#666' : '#E0E0E0' }}
                      onClick={() => goToPage(currentPage + 1)}
                  ></i>
              </div>
          )}

      </section>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .market-row:hover td { background-color: rgba(255, 255, 255, 0.03) !important; }
        
        .name-hover:hover { color: #F0C420; text-decoration: none !important; }
        
        @keyframes subtleShake { 0% { transform: translateX(0); } 25% { transform: translateX(2px); } 50% { transform: translateX(-2px); } 75% { transform: translateX(1px); } 100% { transform: translateX(0); } }
        .market-row:hover .name-shake { animation: subtleShake 0.4s ease-in-out; color: #F0C420 !important; }

        .filter-item { border-bottom: 2px solid transparent; transition: all 0.2s; cursor: pointer; padding-bottom: 4px; }
        .filter-item:hover, .filter-item.active { color: #E0E0E0 !important; border-bottom: 2px solid #F0C420; }
        
        .binance-filter-btn { border-radius: 2px; padding: 6px 12px; transition: all 0.2s; }
        .binance-filter-group { border: 1px solid #333; background: transparent; padding: 4px; border-radius: 2px; gap: 2px; }
        .active-time, .active-currency { background-color: #2B3139 !important; color: #F0C420 !important; }
        .text-header-gray { color: #848E9C !important; }

        .hover-gold-text:hover:not(.active-time):not(.active-currency) { color: #F0C420 !important; }
        
        .hover-gold:hover { color: #F0C420 !important; }
        .hover-white:hover { color: #E0E0E0 !important; border-color: #E0E0E0 !important; }
        .mobile-filter-gap { margin-bottom: 1rem !important; }
        .cursor-pointer { cursor: pointer; }

        @media (min-width: 992px) {
            .text-nowrap-desktop { white-space: nowrap; }
            .desktop-nowrap { white-space: nowrap; }
        }
      `}</style>
    </main>
  );
}

export default dynamicImport(() => Promise.resolve(MarketPage), { ssr: false });
