'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamicImport from 'next/dynamic';
import MarketTicker from '@/components/MarketTicker';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';
import { usePublicClient } from "wagmi";
import { parseAbi, formatEther, erc721Abi } from 'viem';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase';

// --- CONSTANTS ---
const MARKET_ABI = parseAbi([
    "function getAllListings() view returns (uint256[] tokenIds, uint256[] prices, address[] sellers)"
]);

const FOX_PATH = "M29.77 8.35C29.08 7.37 26.69 3.69 26.69 3.69L22.25 11.23L16.03 2.19L9.67 11.23L5.35 3.69C5.35 3.69 2.97 7.37 2.27 8.35C2.19 8.46 2.13 8.6 2.13 8.76C2.07 10.33 1.83 17.15 1.83 17.15L9.58 24.32L15.93 30.2L16.03 30.29L16.12 30.2L22.47 24.32L30.21 17.15C30.21 17.15 29.98 10.33 29.91 8.76C29.91 8.6 29.86 8.46 29.77 8.35ZM11.16 19.34L7.56 12.87L11.53 14.86L13.88 16.82L11.16 19.34ZM16.03 23.33L12.44 19.34L15.06 16.92L16.03 23.33ZM16.03 23.33L17.03 16.92L19.61 19.34L16.03 23.33ZM20.89 19.34L18.17 16.82L20.52 14.86L24.49 12.87L20.89 19.34Z";

const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
};

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

const CoinIcon = ({ name, tier }: { name: string, tier: string }) => {
    let bg = '#222';
    if (tier?.toLowerCase() === 'immortal') bg = 'linear-gradient(135deg, #333 0%, #111 100%)';
    else if (tier?.toLowerCase() === 'elite') bg = 'linear-gradient(135deg, #4a0a0a 0%, #1a0000 100%)';
    else bg = 'linear-gradient(135deg, #004d40 0%, #002b36 100%)';

    return (
        <div style={{
            width: '32px', height: '32px', 
            borderRadius: '50%',
            background: bg,
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: 'inset 0 0 5px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', 
            fontWeight: 'bold', fontFamily: 'serif',
            color: '#FCD535', textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            flexShrink: 0
        }}>
            {name ? name.charAt(0) : 'N'}
        </div>
    );
};

// --- ASSET CARD ---
const AssetCard = ({ item }: { item: any }) => {
    return (
      <div className="asset-card-container hover-lift" style={{ cursor: 'pointer' }}>
          <Link href={`/asset/${item.id}`} className="text-decoration-none w-100">
              
              <div className="position-relative w-100" style={{ 
                  height: '160px', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  boxShadow: '0 8px 20px rgba(0,0,0,0.6)', 
                  marginBottom: '10px', 
                  border: '1px solid rgba(255,255,255,0.1)'
              }}>
                   <Image 
                        src="/cart.jpg" 
                        alt={item.name} 
                        fill 
                        style={{ objectFit: 'fill', objectPosition: 'center' }} 
                   />

                   <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.15)' }}></div>

                   <div style={{
                       position: 'absolute',
                       top: '50%',
                       left: '50%',
                       transform: 'translate(-50%, -45%)', 
                       textAlign: 'center',
                       width: '100%',
                       zIndex: 10
                   }}>
                       <h3 style={{
                           fontFamily: '"Playfair Display", serif',
                           fontStyle: 'italic',
                           fontWeight: '700',
                           fontSize: '28px',
                           background: 'linear-gradient(180deg, #e6cf8b 0%, #c49938 50%, #9e7b2a 100%)',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.9))',
                           margin: 0,
                           letterSpacing: '1px'
                       }}>
                           {item.name}
                       </h3>
                   </div>

                   <div style={{
                       position: 'absolute',
                       bottom: '10px',
                       width: '100%',
                       textAlign: 'center',
                       zIndex: 10,
                       padding: '0 10px'
                   }}>
                       <p style={{
                           fontFamily: 'serif',
                           fontSize: '9px',
                           color: '#D4D4D4',
                           letterSpacing: '1.5px',
                           margin: 0,
                           textTransform: 'uppercase',
                           fontWeight: '600',
                           textShadow: '0 1px 3px rgba(0,0,0,1)'
                       }}>
                           <span style={{ color: '#c49938' }}>GEN-0</span> #{item.id} GENESIS <span style={{ opacity: 0.5, margin: '0 4px' }}>|</span> MINTED 2025
                       </p>
                   </div>
              </div>
              
              <div className="w-100 d-flex justify-content-between align-items-end px-2">
                  <div className="text-start">
                      <div className="text-secondary text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px', marginBottom: '2px' }}>Name</div>
                      <h5 className="fw-bold m-0" style={{ fontSize: '13px', color: '#ffffff' }}>{item.name}</h5>
                  </div>
                  <div className="text-center">
                      <div className="text-secondary text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px', marginBottom: '2px' }}>Price</div>
                      <h5 className="fw-normal m-0" style={{ fontSize: '13px', color: '#ffffff' }}>{item.priceUsdDisplay}</h5>
                  </div>
                  <div className="text-end">
                      <div className="text-secondary text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px', marginBottom: '2px' }}>Vol</div>
                      <h5 className="fw-normal m-0" style={{ fontSize: '13px', color: '#ffffff' }}>{item.volumeUsdDisplay}</h5>
                  </div>
              </div>
          </Link>
      </div>
    );
};
  
function Home() {
  
    // --- MARKET LOGIC SYNC ---
    const [activeTab, setActiveTab] = useState<'trending' | 'top'>('trending');
    const [timeFilter, setTimeFilter] = useState('24H');
    const [currencyFilter, setCurrencyFilter] = useState('All');
    const [isMobileCurrencyOpen, setIsMobileCurrencyOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [realListings, setRealListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exchangeRates, setExchangeRates] = useState({ pol: 0, eth: 0 });
    const publicClient = usePublicClient();

    // Fetch exchange rates (ETH, POL)
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token,matic-network,ethereum&vs_currencies=usd');
                const data = await res.json();
                const polPrice = data['polygon-ecosystem-token']?.usd || data['matic-network']?.usd || 0;
                const ethPrice = data['ethereum']?.usd || 0;
                setExchangeRates({ pol: polPrice, eth: ethPrice });
            } catch (e) { console.error(e); }
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch market data (listings, activities, offers, votes)
    useEffect(() => {
        const fetchMarketData = async () => {
            if (!publicClient) return;
            try {
                // 1. Fetch Listings from Smart Contract
                const data = await publicClient.readContract({
                    address: MARKETPLACE_ADDRESS as `0x${string}`,
                    abi: MARKET_ABI,
                    functionName: 'getAllListings'
                });
                const [tokenIds, prices] = data;
                if (tokenIds.length === 0) { setRealListings([]); setLoading(false); return; }

                // 2. Fetch Data from Supabase (Activities, Offers, Votes)
                const { data: allActivities } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
                const { data: offersData } = await supabase.from('offers').select('token_id').eq('status', 'active');
                const { data: votesData } = await supabase.from('conviction_votes').select('token_id');

                // Votes Map: Each vote = 100 points
                const votesMap: Record<string, number> = {};
                if (votesData && votesData.length > 0) {
                    votesData.forEach((v: any) => {
                        const idStr = String(v.token_id).trim();
                        votesMap[idStr] = (votesMap[idStr] || 0) + 100;
                    });
                }

                // Stats Map: volume, lastSale, listedTime
                const statsMap: Record<number, any> = {};
                const now = Date.now();
                let timeLimit = Infinity;
                if (timeFilter === '1H') timeLimit = 3600 * 1000;
                else if (timeFilter === '6H') timeLimit = 3600 * 6 * 1000;
                else if (timeFilter === '24H') timeLimit = 3600 * 24 * 1000;
                else if (timeFilter === '7D') timeLimit = 3600 * 24 * 7 * 1000;

                if (allActivities) {
                    allActivities.forEach((act: any) => {
                        const tid = Number(act.token_id);
                        const price = Number(act.price) || 0;
                        let actTime: number;
                        try {
                            const dateStr = act.created_at.includes('Z') ? act.created_at : act.created_at + 'Z';
                            actTime = new Date(dateStr).getTime();
                            if (isNaN(actTime)) actTime = new Date(act.created_at).getTime();
                        } catch { actTime = new Date(act.created_at).getTime(); }

                        if (!statsMap[tid]) statsMap[tid] = { volume: 0, sales: 0, lastSale: 0, listedTime: 0, lastActive: 0 };
                        if (actTime > statsMap[tid].lastActive) statsMap[tid].lastActive = actTime;
                        if ((act.activity_type === 'Sale' || act.activity_type === 'Mint') && statsMap[tid].lastSale === 0) {
                            statsMap[tid].lastSale = price;
                        }
                        if (act.activity_type === 'Sale') {
                            const age = now - actTime;
                            if (age >= 0) {
                                statsMap[tid].volume += price;
                                statsMap[tid].sales += 1;
                            }
                        }
                        if ((act.activity_type === 'List' || act.activity_type === 'Mint')) {
                            if (actTime > statsMap[tid].listedTime) {
                                statsMap[tid].listedTime = actTime;
                            }
                        }
                    });
                }

                const offersCountMap: any = {};
                if (offersData) offersData.forEach((o: any) => {
                    const tid = Number(o.token_id);
                    offersCountMap[tid] = (offersCountMap[tid] || 0) + 1;
                });

                // Merge On-Chain & Off-Chain Data
                const items = await Promise.all(tokenIds.map(async (id, index) => {
                    try {
                        const tid = Number(id);
                        const idStr = id.toString();
                        const uri = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'tokenURI', args: [id] });
                        const metaRes = await fetch(resolveIPFS(uri));
                        const meta = metaRes.ok ? await metaRes.json() : {};
                        const tierAttr = (meta.attributes as any[])?.find((a: any) => a.trait_type === "Tier")?.value || "founder";
                        const stats = statsMap[tid] || { volume: 0, sales: 0, lastSale: 0, listedTime: 0 };
                        const offersCount = offersCountMap[tid] || 0;
                        const conviction = votesMap[idStr] || 0;
                        const trendingScore = (stats.sales * 20) + (offersCount * 5) + (conviction * 0.2);
                        const pricePol = parseFloat(formatEther(prices[index]));
                        let change = 0;
                        if (stats.lastSale > 0) {
                            change = ((pricePol - stats.lastSale) / stats.lastSale) * 100;
                        }
                        return {
                            id: tid,
                            name: meta.name || `Asset #${id}`,
                            tier: tierAttr,
                            pricePol: pricePol,
                            lastSale: stats.lastSale,
                            volume: stats.volume,
                            listedTime: stats.listedTime,
                            lastActive: stats.lastActive,
                            trendingScore: trendingScore,
                            offersCount: offersCount,
                            convictionScore: conviction,
                            listed: 'Now',
                            change: change,
                            currencySymbol: 'POL'
                        };
                    } catch (e) { return null; }
                }));
                setRealListings(items.filter(i => i !== null));
            } catch (error) { console.error("Fetch error", error); } finally { setLoading(false); }
        };
        fetchMarketData();
    }, [publicClient, timeFilter]);

    // --- DATA PROCESSING WITH TIME FILTER ---
    const processedData = useMemo(() => {
        let data = [...realListings];
        // 1. Apply Time Filter (by lastActive)
        if (timeFilter !== 'All') {
            let timeLimit = Infinity;
            if (timeFilter === '1H') timeLimit = 3600 * 1000;
            else if (timeFilter === '6H') timeLimit = 3600 * 6 * 1000;
            else if (timeFilter === '24H') timeLimit = 3600 * 24 * 1000;
            else if (timeFilter === '7D') timeLimit = 3600 * 24 * 7 * 1000;
            const now = Date.now();
            data = data.filter(item => (now - (item.lastActive || 0)) <= timeLimit);
        }
        // 2. Sort by tab
        if (activeTab === 'top') {
            data.sort((a, b) => b.volume - a.volume);
        } else {
            data.sort((a, b) => b.trendingScore - a.trendingScore);
        }
        return data.map((item, index) => ({ ...item, rank: index + 1 }));
    }, [realListings, activeTab, timeFilter]);

    // --- GALLERIES ---
    const featuredItems = useMemo(() => {
        return [...processedData].sort((a, b) => b.volume - a.volume).slice(0, 3);
    }, [processedData]);
    // Just Listed: Sort by listedTime DESC, top 3
    const newListingsItems = useMemo(() => {
        // Use realListings (raw data) to ensure we get the absolute latest items
        // regardless of the current 'Top' or 'Trending' tab selection.
        return [...realListings]
            .filter(item => item.listedAt > 0)
            .sort((a, b) => b.listedAt - a.listedAt)
            .slice(0, 3);
    }, [realListings]);

    // --- TABLE DATA ---
    const desktopLeftData = processedData.slice(0, 5);
    const desktopRightData = processedData.slice(5, 10);
    const mobileSlideOne = processedData.slice(0, 5);
    const mobileSlideTwo = processedData.slice(5, 10);
  
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) { setIsMobileCurrencyOpen(false); }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRankStyle = (rank: number) => { const baseStyle = { fontStyle: 'italic', fontWeight: '700', fontSize: '20px', paddingBottom: '2px' }; if (rank === 1) return { ...baseStyle, color: '#FF9900', textShadow: '0 0 10px rgba(255, 153, 0, 0.4)' }; if (rank === 2) return { ...baseStyle, color: '#FFC233', textShadow: '0 0 10px rgba(255, 194, 51, 0.3)' }; if (rank === 3) return { ...baseStyle, color: '#FCD535', textShadow: '0 0 10px rgba(252, 213, 53, 0.2)' }; return { color: '#fff', fontWeight: '300', fontSize: '20px' }; };
  const handleMobileCurrencySelect = (c: string) => { setCurrencyFilter(c); setIsMobileCurrencyOpen(false); };

  const formatTablePrice = (valPol: number) => {
      if (!exchangeRates.pol || exchangeRates.pol === 0) return `${valPol.toFixed(2)} POL`;
      if (currencyFilter === 'All') return `${(valPol * exchangeRates.pol).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} $`;
      if (currencyFilter === 'ETH') return `${(valPol * exchangeRates.pol / (exchangeRates.eth || 3000)).toFixed(4)} ETH`;
      return `${valPol.toFixed(2)} POL`;
  };

  const formatTableVolume = (valPol: number) => {
      if (!exchangeRates.pol || exchangeRates.pol === 0) return `${valPol.toFixed(2)} POL`;
      const valUsd = valPol * exchangeRates.pol;
      return `${valUsd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} $`;
  };

  return (
    <main className="no-select" style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', paddingBottom: '0px', fontFamily: '"Inter", "Segoe UI", sans-serif', overflowX: 'hidden' }}>
      
      {/* Import Google Font for the Card */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
      `}</style>

      <MarketTicker />

      <div className="header-wrapper shadow-sm">
        <div className="container-fluid p-0"> 
            <div className="widgets-grid-container">
                <div className="widget-item"> <NGXWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXCapWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXVolumeWidget theme="dark" /> </div>
            </div>
            <div className="row align-items-center px-3 mt-3 text-section desktop-only-text">
                <div className="col-lg-12">
                    <h1 className="fw-bold mb-2 main-title">NNM &mdash; The Global Market for <span style={{ color: '#E0E0E0' }}>Nexus Rare Digital Name NFTs</span></h1>
                    <p className="mb-0 main-desc">Where Nexus Digital Name NFTs gain real financial value and global liquidity.</p>
                </div>
            </div>
            <div className="d-block d-md-none px-3 mt-3 mobile-only-text">
                <h1 className="fw-bold text-white h4 text-start m-0" style={{ letterSpacing: '-0.5px', lineHeight: '1.3', color: '#E0E0E0' }}>NNM &mdash; The Global Market of <span style={{ color: '#E0E0E0' }}>Nexus Rare Digital Name NFTs.</span></h1>
                <p style={{ fontFamily: '"Inter", "Segoe UI", sans-serif', fontSize: '15px', color: '#B0B0B0', marginTop: '8px', marginBottom: 0 }}>Where Nexus Digital Name NFTs gain real financial value and global liquidity.</p>
            </div>
        </div>
      </div>

      <section className="py-2 pt-md-2 pb-md-4 overflow-hidden">
          <div className="container-fluid px-0">
              <div className="hero-grid-system" style={{ paddingLeft: '15px', paddingRight: '15px', gap: '5px' }}>
                  <div className="hero-card position-relative overflow-hidden" style={{ height: '180px', border: '1px solid #333', cursor: 'pointer', backgroundColor: '#000' }}>
                      <Image src="/hero-blue.jpg" alt="Immortals" fill style={{objectFit: "fill"}} />
                  </div>
                  <div className="hero-card position-relative overflow-hidden" style={{ height: '180px', border: '1px solid #333', cursor: 'pointer', backgroundColor: '#000' }}>
                      <Image src="/hero-red.jpg" alt="Elite" fill style={{objectFit: "fill"}} />
                  </div>
                  <div className="hero-card position-relative overflow-hidden" style={{ height: '180px', border: '1px solid #333', cursor: 'pointer', backgroundColor: '#000' }}>
                      <Image src="/hero-black.jpg" alt="Founders" fill style={{objectFit: "fill"}} />
                  </div>
              </div>
          </div>
      </section>

      <section className="container py-2 py-md-4">
          <div className="row g-5 align-items-center mb-4 mobile-filter-gap">
              <div className="col-12 col-lg-6">
                  <div className="d-flex gap-5 align-items-center justify-content-start">
                      <div onClick={() => setActiveTab('trending')} className={`cursor-pointer fw-bold ${activeTab === 'trending' ? 'text-white' : 'text-header-gray'} filter-tab-hover`} style={{ fontSize: '20px', position: 'relative' }}>Trending{activeTab === 'trending' && <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '3px', background: '#FCD535' }}></div>}</div>
                      <div onClick={() => setActiveTab('top')} className={`cursor-pointer fw-bold ${activeTab === 'top' ? 'text-white' : 'text-header-gray'} filter-tab-hover`} style={{ fontSize: '20px', position: 'relative' }}>Top{activeTab === 'top' && <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '3px', background: '#FCD535' }}></div>}</div>
                  </div>
              </div>
              <div className="col-12 col-lg-6">
                  <div className="d-flex gap-3 align-items-center justify-content-start justify-content-lg-start">
                      <div className="d-none d-md-flex binance-filter-group align-items-center">{['All', 'ETH', 'POL'].map((c) => (<button key={c} onClick={() => setCurrencyFilter(c)} className={`btn btn-sm border-0 binance-filter-btn ${currencyFilter === c ? 'active-currency' : 'text-header-gray'}`} style={{ fontSize: '13px', minWidth: '50px', fontWeight: '400' }}>{c === 'ETH' && <i className="bi bi-currency-ethereum me-1"></i>}{c}</button>))}</div>
                      <div className="d-block d-md-none position-relative" ref={dropdownRef}><button onClick={() => setIsMobileCurrencyOpen(!isMobileCurrencyOpen)} className="btn btn-sm border-0 active-currency d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '13px', borderRadius: '2px', height: '32px', width: '85px', fontWeight: '400', border: '1px solid #333' }}>{currencyFilter} <span style={{ fontSize: '10px', marginLeft: 'auto' }}>▼</span></button>{isMobileCurrencyOpen && (<div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '2px', backgroundColor: '#1E2329', border: '1px solid #333', borderRadius: '2px', zIndex: 1000, width: '85px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}><div onClick={() => handleMobileCurrencySelect('All')} className="px-2 py-2 text-white small cursor-pointer hover-bg-gray text-center">All</div><div onClick={() => handleMobileCurrencySelect('ETH')} className="px-2 py-2 text-white small cursor-pointer hover-bg-gray text-center">ETH</div><div onClick={() => handleMobileCurrencySelect('POL')} className="px-2 py-2 text-white small cursor-pointer hover-bg-gray text-center">POL</div></div>)}</div>
                      <div className="binance-filter-group d-flex align-items-center">{['1H', '6H', '24H', '7D', 'All'].map((t) => (<button key={t} onClick={() => setTimeFilter(t)} className={`btn btn-sm border-0 binance-filter-btn ${timeFilter === t ? 'active-time' : 'text-header-gray'}`} style={{ fontSize: '13px', minWidth: '45px', fontWeight: '400' }}>{t}</button>))}</div>
                  </div>
              </div>
          </div>

          <div className="row g-4 d-none d-lg-flex">
              <div className="col-lg-6"><DesktopTable data={desktopLeftData} formatTablePrice={formatTablePrice} formatTableVolume={formatTableVolume} getRankStyle={getRankStyle} /></div>
              <div className="col-lg-6"><DesktopTable data={desktopRightData} formatTablePrice={formatTablePrice} formatTableVolume={formatTableVolume} getRankStyle={getRankStyle} /></div>
          </div>
          <div className="d-block d-lg-none">
              <div className="mobile-swipe-wrapper">
                  <div className="mobile-slide"><MobileTableHeader />{mobileSlideOne.map((item) => (<MobileRow key={item.id} item={item} formatTablePrice={formatTablePrice} formatTableVolume={formatTableVolume} getRankStyle={getRankStyle} />))}</div>
                  <div className="mobile-slide"><MobileTableHeader />{mobileSlideTwo.map((item) => (<MobileRow key={item.id} item={item} formatTablePrice={formatTablePrice} formatTableVolume={formatTableVolume} getRankStyle={getRankStyle} />))}</div>
              </div>
          </div>
          
          <div className="text-center mt-4 mb-5"><Link href="/market" className="btn view-all-btn px-4 py-2" style={{ borderRadius: '6px', fontSize: '18px', minWidth: '160px', color: '#fff', transition: 'all 0.3s' }}>View All</Link></div>

          <div className="mt-5 mb-5">
              <h3 className="text-white fw-bold mb-4" style={{ fontSize: '20px', letterSpacing: '-0.5px' }}>Top Performers</h3>
              {loading ? <div className="text-secondary text-center">Loading Assets...</div> :
              <div className="row g-4 d-none d-lg-flex">
                  {featuredItems.map((item) => (<div key={item.id} className="col-lg-4 col-xl-4"><AssetCard item={item} /></div>))}
              </div>}
              {!loading && <div className="d-flex d-lg-none mobile-card-wrapper" style={{ gap: '15px', overflowX: 'auto', paddingBottom: '10px', paddingRight: '20px' }}>
                  {featuredItems.map((item) => (<div key={item.id} className="mobile-card-item" style={{ minWidth: '85%', flex: '0 0 85%' }}><AssetCard item={item} /></div>))}
              </div>}
          </div>

          <div style={{ marginTop: '5.25rem', marginBottom: '3rem' }}>
              <h3 className="text-white fw-bold mb-4" style={{ fontSize: '20px', letterSpacing: '-0.5px' }}>Just Listed</h3>
              {loading ? <div className="text-secondary text-center">Loading Listings...</div> :
              <div className="row g-4 d-none d-lg-flex">
                  {newListingsItems.map((item) => (<div key={item.id} className="col-lg-4 col-xl-4"><AssetCard item={item} /></div>))}
              </div>}
              {!loading && <div className="d-flex d-lg-none mobile-card-wrapper" style={{ gap: '15px', overflowX: 'auto', paddingBottom: '10px', paddingRight: '20px' }}>
                  {newListingsItems.map((item) => (<div key={item.id} className="mobile-card-item" style={{ minWidth: '85%', flex: '0 0 85%' }}><AssetCard item={item} /></div>))}
              </div>}
          </div>
      </section>

      <div className="w-100 py-3 border-top border-bottom border-secondary position-relative" style={{ borderColor: '#333 !important', marginTop: '5rem', marginBottom: '80px', backgroundColor: '#0b0e11', maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)' }}>
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
        .fw-light { font-weight: 300 !important; } .text-header-gray { color: #848E9C !important; } .cursor-pointer { cursor: pointer; } .hover-bg-gray:hover { background-color: #2B3139; }
        .mobile-card-wrapper::-webkit-scrollbar { display: none; } .mobile-card-wrapper { -ms-overflow-style: none; scrollbar-width: none; scroll-snap-type: x mandatory; } .mobile-card-item { scroll-snap-align: start; }
        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .marquee-track { animation: scroll 75s linear infinite; width: max-content; }
        .filter-tab-hover:hover { color: #fff !important; } .binance-filter-btn:hover { color: #fff !important; } .mobile-filter-gap { margin-bottom: 1rem !important; } @media (max-width: 991px) { .mobile-filter-gap { row-gap: 12px !important; --bs-gutter-y: 12px !important; margin-bottom: 0.55rem !important; } }
        .mobile-swipe-wrapper { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; gap: 40px; padding-bottom: 10px; align-items: flex-start; } .mobile-swipe-wrapper::-webkit-scrollbar { display: none; } .mobile-slide { min-width: 100%; flex: 0 0 100%; scroll-snap-align: center; }
        .binance-filter-group { border: 1px solid #333; background: transparent; padding: 4px; border-radius: 2px; gap: 2px; } .binance-filter-btn { border-radius: 2px; padding: 6px 12px; transition: all 0.2s; } .active-time, .active-currency { background-color: #2B3139 !important; color: #FCD535 !important; }
        .table { --bs-table-bg: transparent; --bs-table-color: #fff; } .table > :not(caption) > * > * { background-color: transparent !important; box-shadow: none !important; border-bottom-color: #222; } .binance-row { transition: background-color 0.2s; cursor: pointer; } .binance-row:hover { background-color: #1E2329 !important; }
        @keyframes subtleShake { 0% { transform: translateX(0); } 25% { transform: translateX(2px); } 50% { transform: translateX(-2px); } 75% { transform: translateX(1px); } 100% { transform: translateX(0); } } .name-shake { display: inline-block; transition: color 0.3s; } .binance-row:hover .name-shake { animation: subtleShake 0.4s ease-in-out; color: #FCD535 !important; }
        .view-all-btn { background-color: #1E2329; border: none; } .view-all-btn:hover, .view-all-btn:active { background-color: #474D57 !important; color: #fff !important; box-shadow: 0 0 15px rgba(255,255,255,0.1); }
        .hero-grid-system { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; } 
        @media (max-width: 991px) { 
            .hero-grid-system { display: flex !important; overflow-x: auto; scroll-snap-type: x mandatory; } 
            .hero-card { flex: 0 0 85%; scroll-snap-align: start; height: 180px !important; } 
        }
        
        /* --- NEW ASSET CARD STYLES --- */
        .asset-card-container {
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 10px;
            background-color: transparent;
            transition: transform 0.3s ease, border-color 0.3s ease;
        }
        
        .hover-lift:hover {
            transform: translateY(-4px); /* Slight Lift */
            border-color: rgba(255,255,255,0.1); 
        }
      `}</style>
    </main>
  );
}

function MobileTableHeader() { 
    return ( 
        <div className="d-flex justify-content-between mb-3 border-bottom border-secondary pb-2" style={{ borderColor: '#333 !important', height: '40px', alignItems: 'flex-end' }}> 
            {/* 45% Name */}
            <div style={{ flex: '0 0 45%' }}> 
                <span style={{ fontSize: '13.5px', color: '#848E9C' }}>Name Asset</span> 
            </div> 
            {/* 35% Price */}
            <div style={{ flex: '0 0 35%', textAlign: 'left' }}> 
                <span style={{ fontSize: '13.5px', color: '#848E9C' }}>Price</span> 
            </div>
            {/* 20% Volume */}
            <div style={{ flex: '0 0 20%', textAlign: 'right' }}> 
                <span style={{ fontSize: '13.5px', color: '#848E9C' }}>Volume</span> 
            </div> 
        </div> 
    ); 
}

function MobileRow({ item, formatTablePrice, formatTableVolume, getRankStyle }: any) { 
    return ( 
        <Link href={`/asset/${item.id}`} className="text-decoration-none"> 
            <div className="d-flex align-items-center justify-content-between py-3 binance-row" style={{ borderBottom: '1px solid #222' }}> 
                
                {/* 45% Name */}
                <div className="d-flex align-items-center gap-2" style={{ flex: '0 0 45%', overflow: 'hidden' }}> 
                    <div style={{ width: '15px', textAlign: 'center', flexShrink: 0 }}> 
                        {item.rank <= 3 ? ( <span style={{ ...getRankStyle(item.rank), fontSize: '14px' }}>{item.rank}</span> ) : ( <span className="text-white fw-light" style={{ fontSize: '10px' }}>{item.rank}</span> )} 
                    </div> 
                    <CoinIcon name={item.name} tier={item.tier} /> 
                    <span className="text-white fw-bold name-shake text-truncate" style={{ fontSize: '12px' }}>{item.name}</span> 
                </div> 
                
                {/* 35% Price - CRITICAL: Removed flex-column, Added whitespace-nowrap */}
                <div className="d-flex align-items-center gap-2" style={{ flex: '0 0 35%', whiteSpace: 'nowrap' }}> 
                    <span className="fw-normal text-white" style={{ fontSize: '13px' }}>{formatTablePrice(item.pricePol)}</span> 
                    {item.change !== 0 && (
                        <span className="d-flex align-items-center" style={{ fontSize: '11px', fontWeight: 'bold', color: item.change > 0 ? '#0ecb81' : '#ea3943' }}>
                            {Math.abs(item.change).toFixed(0)}% 
                            <i className={`bi ${item.change > 0 ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`} style={{ fontSize: '9px', marginLeft: '2px' }}></i>
                        </span>
                    )}
                </div> 

                {/* 20% Volume */}
                <div className="d-flex flex-column align-items-end" style={{ flex: '0 0 20%', textAlign: 'right' }}> 
                    <span className="text-white" style={{ fontSize: '13px', fontWeight: '400' }}>{formatTableVolume(item.volume)}</span> 
                </div> 
            </div> 
        </Link> 
    ); 
}

function DesktopTable({ data, formatTablePrice, formatTableVolume, getRankStyle }: any) {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    return (
        <div className="table-responsive">
            <table className="table table-dark align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                <thead><tr style={{ fontSize: '15px', borderBottom: '1px solid #333', height: '50px' }}>
                        <th colSpan={2} style={{ paddingBottom: '15px', fontWeight: '400', color: '#848E9C', verticalAlign: 'middle', width: '45%' }}>Name Asset</th>
                        <th style={{ paddingBottom: '15px', textAlign: 'left', fontWeight: '400', color: '#848E9C', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '25%', paddingLeft: '15px' }}>Price</th>
                        <th style={{ paddingBottom: '15px', textAlign: 'left', fontWeight: '400', color: '#848E9C', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '30%', paddingLeft: '40px' }}>Volume</th>
                </tr></thead>

                <tbody style={{ fontSize: '14px', borderTop: 'none' }}>
                    {data.map((item: any) => (
                        <tr key={item.id} className="binance-row">
                            <td style={{ width: '40px', verticalAlign: 'middle' }}>
                                {item.rank <= 3 ? (
                                    <span style={{ ...getRankStyle(item.rank), fontSize: '20px' }}>{item.rank}</span>
                                ) : (
                                    <span className="text-white fw-light">{item.rank}</span>
                                )}
                            </td>
                            <td style={{ verticalAlign: 'middle', paddingRight: '0' }}>
                                <Link href={`/asset/${item.id}`} className="text-decoration-none text-white">
                                    <div className="d-flex align-items-center gap-3">
                                        <CoinIcon name={item.name} tier={item.tier} />
                                        <span className="fw-bold name-shake" style={{ fontSize: '13.5px' }}>{item.name}</span>
                                    </div>
                                </Link>
                            </td>
                            <td className="text-start" style={{ verticalAlign: 'middle', paddingLeft: '15px' }}>
                                {isMounted ? (
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="text-white fw-normal" style={{ fontSize: '11.5px' }}>{formatTablePrice(item.pricePol)}</span>
                                        {item.change !== 0 && (
                                            <span className="d-flex align-items-center" style={{ fontSize: '10.5px', fontWeight: 'bold', color: item.change > 0 ? '#0ecb81' : '#ea3943' }}>
                                                {Math.abs(item.change).toFixed(0)}%
                                                <i className={`bi ${item.change > 0 ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`} style={{ fontSize: '9px', marginLeft: '2px' }}></i>
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-secondary fw-normal" style={{ fontSize: '11.5px' }}>--</span>
                                )}
                            </td>
                            <td className="text-start" style={{ verticalAlign: 'middle', paddingLeft: '40px' }}>
                                {isMounted ? (
                                    <span className="text-white fw-normal" style={{ fontSize: '11px' }}>{formatTableVolume(item.volume)}</span>
                                ) : (
                                    <span className="text-secondary fw-normal" style={{ fontSize: '11px' }}>--</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default dynamicImport(() => Promise.resolve(Home), { ssr: false });

