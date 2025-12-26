'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MarketTicker from '@/components/MarketTicker';
import NGXWidget from '@/components/NGXWidget';
import { FULL_ASSET_LIST } from '@/data/assets';

const GOLD_GRADIENT = 'linear-gradient(180deg, #FFD700 0%, #B3882A 100%)';

const FOX_PATH = "M29.77 8.35C29.08 7.37 26.69 3.69 26.69 3.69L22.25 11.23L16.03 2.19L9.67 11.23L5.35 3.69C5.35 3.69 2.97 7.37 2.27 8.35C2.19 8.46 2.13 8.6 2.13 8.76C2.07 10.33 1.83 17.15 1.83 17.15L9.58 24.32L15.93 30.2L16.03 30.29L16.12 30.2L22.47 24.32L30.21 17.15C30.21 17.15 29.98 10.33 29.91 8.76C29.91 8.6 29.86 8.46 29.77 8.35ZM11.16 19.34L7.56 12.87L11.53 14.86L13.88 16.82L11.16 19.34ZM16.03 23.33L12.44 19.34L15.06 16.92L16.03 23.33ZM16.03 23.33L17.03 16.92L19.61 19.34L16.03 23.33ZM20.89 19.34L18.17 16.82L20.52 14.86L24.49 12.87L20.89 19.34Z";

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

const getCardStyles = (tier: string) => {
    switch(tier) {
        case 'immortal': 
            return {
                bg: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 100%)',
                border: '1px solid rgba(252, 213, 53, 0.3)',
                shadow: '0 10px 40px rgba(0,0,0,0.9), inset 0 0 20px rgba(0,0,0,0.9)',
                textColor: GOLD_GRADIENT
            };
        case 'elite': 
            return {
                bg: 'linear-gradient(135deg, #2b0505 0%, #4a0a0a 100%)',
                border: '1px solid rgba(255, 50, 50, 0.3)',
                shadow: '0 10px 40px rgba(40,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.9)',
                textColor: GOLD_GRADIENT
            };
        default:
            return {
                bg: 'linear-gradient(135deg, #002b36 0%, #004d40 100%)',
                border: '1px solid rgba(0, 255, 200, 0.2)',
                shadow: '0 10px 40px rgba(0,30,30,0.8), inset 0 0 20px rgba(0,0,0,0.9)',
                textColor: GOLD_GRADIENT
            };
    }
};

const CoinIcon = ({ name, tier }: { name: string, tier: string }) => {
    let bg = '#222';
    if (tier === 'immortal') bg = 'linear-gradient(135deg, #333 0%, #111 100%)';
    if (tier === 'elite') bg = 'linear-gradient(135deg, #4a0a0a 0%, #1a0000 100%)';
    if (tier === 'prime') bg = 'linear-gradient(135deg, #004d40 0%, #002b36 100%)';

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
            {name.charAt(0)}
        </div>
    );
};

const AssetCard = ({ item }: { item: any }) => {
    const style = getCardStyles(item.tier);
    return (
      <div className="museum-case position-relative p-2 d-flex flex-column align-items-center justify-content-center"
           style={{ width: '100%', height: '180px', backgroundColor: 'transparent', borderRadius: '8px', cursor: 'pointer' }}>
          <Link href={`/asset/${item.id}`} className="text-decoration-none w-100 h-100 d-flex flex-column align-items-center justify-content-center">
              <div className="static-asset position-relative"
                   style={{ width: '90%', height: '65%', background: style.bg, border: style.border, borderRadius: '8px', overflow: 'hidden', marginTop: '10px', marginBottom: '10px', boxShadow: style.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                   <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                       <p style={{ fontFamily: 'serif', fontWeight: 'bold', fontSize: '10px', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px', margin: 0, paddingBottom: '4px', textTransform: 'uppercase' }}>GEN-0 #001 GENESIS</p>
                       <h3 style={{ fontFamily: 'serif', fontWeight: '900', fontSize: '25px', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.9))', letterSpacing: '1.5px', margin: 0, textTransform: 'uppercase', lineHeight: '1.1' }}>{item.name}</h3>
                       <p style={{ fontFamily: 'serif', fontWeight: 'bold', fontSize: '10px', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px', margin: 0, paddingTop: '4px', textTransform: 'uppercase' }}>OWNED & MINTED - 2025</p>
                   </div>
                   <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)', zIndex: 1 }}></div>
              </div>
              <div className="w-100 d-flex justify-content-between align-items-end px-2" style={{ marginTop: 'auto' }}>
                  <div className="text-start"><div className="text-secondary text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px', marginBottom: '4px' }}>Name</div><h5 className="fw-bold m-0" style={{ fontSize: '13px', color: '#ffffff' }}>{item.name}</h5></div>
                  <div className="text-center"><div className="text-secondary text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px', marginBottom: '4px' }}>Price</div><div className="fw-bold" style={{ fontSize: '14px', color: '#0ecb81' }}>{Number(item.floor).toFixed(2)} <span style={{ fontSize: '9px', color: '#888' }}>POL</span></div></div>
                  <div className="text-end"><div className="text-secondary text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px', marginBottom: '4px' }}>Vol</div><div className="fw-bold" style={{ fontSize: '14px', color: '#ffffff' }}>{Number(item.volume).toFixed(2)} <span style={{ fontSize: '9px', color: '#888' }}>POL</span></div></div>
              </div>
          </Link>
      </div>
    );
};
  
export default function Home() {
  
  const [activeTab, setActiveTab] = useState<'trending' | 'top'>('trending');
  const [timeFilter, setTimeFilter] = useState('1H');
  const [currencyFilter, setCurrencyFilter] = useState('All');
  
  const [isMobileCurrencyOpen, setIsMobileCurrencyOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const featuredItems = FULL_ASSET_LIST.slice(0, 3);
  const newListingsItems = FULL_ASSET_LIST.slice(3, 6);
  
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
  
  const desktopLeftData = FULL_ASSET_LIST.slice(0, 5);
  const desktopRightData = FULL_ASSET_LIST.slice(5, 10);
  const mobileSlideOne = FULL_ASSET_LIST.slice(0, 5);
  const mobileSlideTwo = FULL_ASSET_LIST.slice(5, 10);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMobileCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getColorClass = (change: number) => { return change >= 0 ? 'text-success' : 'text-danger'; };
  const getRankStyle = (rank: number) => { const baseStyle = { fontStyle: 'italic', fontWeight: '700', fontSize: '20px', paddingBottom: '2px' }; if (rank === 1) return { ...baseStyle, color: '#FF9900', textShadow: '0 0 10px rgba(255, 153, 0, 0.4)' }; if (rank === 2) return { ...baseStyle, color: '#FFC233', textShadow: '0 0 10px rgba(255, 194, 51, 0.3)' }; if (rank === 3) return { ...baseStyle, color: '#FCD535', textShadow: '0 0 10px rgba(252, 213, 53, 0.2)' }; return { color: '#fff', fontWeight: '300', fontSize: '20px' }; };
  const handleMobileCurrencySelect = (c: string) => { setCurrencyFilter(c); setIsMobileCurrencyOpen(false); };

  return (
    <main style={{ backgroundColor: '#0d1117', minHeight: '100vh', paddingBottom: '0px', fontFamily: '"Inter", "Segoe UI", sans-serif', overflowX: 'hidden' }}>
      
      <MarketTicker />

      <section className="d-none d-md-block pt-md-4 pb-2">
          <div className="container-fluid px-0">
              <div className="d-flex justify-content-between align-items-center" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                  
                  <div style={{ flex: 1, paddingBottom: '15px' }}>
                      <h1 style={{ 
                          fontFamily: '"Inter", "Segoe UI", sans-serif', 
                          fontSize: '1.53rem', 
                          fontWeight: '700',
                          letterSpacing: '-1px', 
                          color: '#FFFFFF', 
                          margin: 0,
                          lineHeight: '1.3'
                      }}>
                          NNM &mdash; The Global Market for <span style={{ color: '#FCD535' }}>Nexus Rare Digital<br />Name NFTs</span>
                      </h1>
                      
                      <p style={{ 
                          fontFamily: '"Inter", "Segoe UI", sans-serif', 
                          fontSize: '15px', 
                          fontWeight: '400',
                          color: '#B0B3B8', 
                          marginTop: '10px', 
                          marginBottom: 0,
                          maxWidth: '650px' 
                      }}>
                          Where Nexus Digital Name NFTs gain real financial value and global liquidity.
                      </p>
                  </div>

                  <div style={{ minWidth: '380px' }}>
                      <NGXWidget theme="dark" />
                  </div>

              </div>
          </div>
      </section>

      <section className="d-block d-md-none pt-3 pb-2 px-3">
          <h1 className="fw-bold text-white h4 text-start m-0" style={{ letterSpacing: '-0.5px', lineHeight: '1.3' }}>
              NNM &mdash; The Global Market of <span style={{ color: '#FCD535' }}>Nexus Rare Digital Name NFTs.</span>
          </h1>
          <p style={{ 
              fontFamily: '"Inter", "Segoe UI", sans-serif', 
              fontSize: '13px', 
              color: '#B0B3B8', 
              marginTop: '8px',
              marginBottom: 0
          }}>
              Where Nexus Digital Name NFTs gain real financial value and global liquidity.
          </p>
          <div className="mt-3">
              <NGXWidget theme="dark" />
          </div>
      </section>

      <section className="py-2 pt-md-0 pb-md-4 overflow-hidden">
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
                      <div className="d-block d-md-none position-relative" ref={dropdownRef}><button onClick={() => setIsMobileCurrencyOpen(!isMobileCurrencyOpen)} className="btn btn-sm border-0 active-currency d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '13px', borderRadius: '2px', height: '32px', width: '85px', fontWeight: '400', border: '1px solid #333' }}>{currencyFilter} <span style={{ fontSize: '10px', marginLeft: 'auto' }}>â–¼</span></button>{isMobileCurrencyOpen && (<div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '2px', backgroundColor: '#1E2329', border: '1px solid #333', borderRadius: '2px', zIndex: 1000, width: '85px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}><div onClick={() => handleMobileCurrencySelect('All')} className="px-2 py-2 text-white small cursor-pointer hover-bg-gray text-center">All</div><div onClick={() => handleMobileCurrencySelect('ETH')} className="px-2 py-2 text-white small cursor-pointer hover-bg-gray text-center">ETH</div><div onClick={() => handleMobileCurrencySelect('POL')} className="px-2 py-2 text-white small cursor-pointer hover-bg-gray text-center">POL</div></div>)}</div>
                      <div className="binance-filter-group d-flex align-items-center">{['1H', '6H', '24H', '7D'].map((t) => (<button key={t} onClick={() => setTimeFilter(t)} className={`btn btn-sm border-0 binance-filter-btn ${timeFilter === t ? 'active-time' : 'text-header-gray'}`} style={{ fontSize: '13px', minWidth: '45px', fontWeight: '400' }}>{t}</button>))}</div>
                  </div>
              </div>
          </div>

          <div className="row g-4 d-none d-lg-flex">
              <div className="col-lg-6"><DesktopTable data={desktopLeftData} getColorClass={getColorClass} getRankStyle={getRankStyle} /></div>
              <div className="col-lg-6"><DesktopTable data={desktopRightData} getColorClass={getColorClass} getRankStyle={getRankStyle} /></div>
          </div>
          <div className="d-block d-lg-none">
              <div className="mobile-swipe-wrapper">
                  <div className="mobile-slide"><MobileTableHeader />{mobileSlideOne.map((item) => (<MobileRow key={item.id} item={item} getColorClass={getColorClass} getRankStyle={getRankStyle} />))}</div>
                  <div className="mobile-slide"><MobileTableHeader />{mobileSlideTwo.map((item) => (<MobileRow key={item.id} item={item} getColorClass={getColorClass} getRankStyle={getRankStyle} />))}</div>
              </div>
          </div>
          
          <div className="text-center mt-4 mb-5"><Link href="/market" className="btn view-all-btn px-4 py-2" style={{ borderRadius: '6px', fontSize: '18px', minWidth: '160px', color: '#fff', transition: 'all 0.3s' }}>View All</Link></div>

          <div className="mt-5 mb-5">
              <h3 className="text-white fw-bold mb-4" style={{ fontSize: '20px', letterSpacing: '-0.5px' }}>Featured Assets</h3>
              <div className="row g-4 d-none d-lg-flex">
                  {featuredItems.map((item) => (<div key={item.id} className="col-lg-4 col-xl-4"><AssetCard item={item} /></div>))}
              </div>
              <div className="d-flex d-lg-none mobile-card-wrapper" style={{ gap: '15px', overflowX: 'auto', paddingBottom: '10px', paddingRight: '20px' }}>
                  {featuredItems.map((item) => (<div key={item.id} className="mobile-card-item" style={{ minWidth: '85%', flex: '0 0 85%' }}><AssetCard item={item} /></div>))}
              </div>
          </div>

          <div style={{ marginTop: '5.25rem', marginBottom: '3rem' }}>
              <h3 className="text-white fw-bold mb-4" style={{ fontSize: '20px', letterSpacing: '-0.5px' }}>New Listings</h3>
              <div className="row g-4 d-none d-lg-flex">
                  {newListingsItems.map((item) => (<div key={item.id} className="col-lg-4 col-xl-4"><AssetCard item={item} /></div>))}
              </div>
              <div className="d-flex d-lg-none mobile-card-wrapper" style={{ gap: '15px', overflowX: 'auto', paddingBottom: '10px', paddingRight: '20px' }}>
                  {newListingsItems.map((item) => (<div key={item.id} className="mobile-card-item" style={{ minWidth: '85%', flex: '0 0 85%' }}><AssetCard item={item} /></div>))}
              </div>
          </div>

          <div className="w-100 py-3 border-top border-bottom border-secondary position-relative" style={{ borderColor: '#333 !important', marginTop: '5rem', marginBottom: '50px', backgroundColor: '#050505', maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)' }}>
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
      </section>

      <style jsx global>{`
        .fw-light { font-weight: 300 !important; } .text-header-gray { color: #848E9C !important; } .cursor-pointer { cursor: pointer; } .hover-bg-gray:hover { background-color: #2B3139; }
        .mobile-card-wrapper::-webkit-scrollbar { display: none; } .mobile-card-wrapper { -ms-overflow-style: none; scrollbar-width: none; scroll-snap-type: x mandatory; } .mobile-card-item { scroll-snap-align: start; }
        .static-asset { box-shadow: 0 15px 35px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(40, 40, 40, 0.5), inset 0 0 15px rgba(0,0,0,0.5); }
        @media (max-width: 991px) { .static-asset { box-shadow: 0 5px 15px rgba(0,0,0,0.9) !important; border: 1px solid rgba(30, 30, 30, 0.8) !important; } }
        .brand-text-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(252, 213, 53, 0.2); } .brand-icon-gold { color: #FCD535; text-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .marquee-track { animation: scroll 66s linear infinite; width: max-content; }
        .filter-tab-hover:hover { color: #fff !important; } .binance-filter-btn:hover { color: #fff !important; } .mobile-filter-gap { margin-bottom: 1rem !important; } @media (max-width: 991px) { .mobile-filter-gap { row-gap: 12px !important; --bs-gutter-y: 12px !important; margin-bottom: 0.55rem !important; } }
        .mobile-swipe-wrapper { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; gap: 40px; padding-bottom: 10px; align-items: flex-start; } .mobile-swipe-wrapper::-webkit-scrollbar { display: none; } .mobile-slide { min-width: 100%; flex: 0 0 100%; scroll-snap-align: center; }
        .binance-filter-group { border: 1px solid #333; background: transparent; padding: 4px; border-radius: 2px; gap: 2px; } .binance-filter-btn { border-radius: 2px; padding: 6px 12px; transition: all 0.2s; } .active-time, .active-currency { background-color: #2B3139 !important; color: #FCD535 !important; }
        .table { --bs-table-bg: transparent; --bs-table-color: #fff; } .table > :not(caption) > * > * { background-color: transparent !important; box-shadow: none !important; border-bottom-color: #222; } .binance-row { transition: background-color 0.2s; cursor: pointer; } .binance-row:hover { background-color: #1E2329 !important; }
        @keyframes subtleShake { 0% { transform: translateX(0); } 25% { transform: translateX(2px); } 50% { transform: translateX(-2px); } 75% { transform: translateX(1px); } 100% { transform: translateX(0); } } .name-shake { display: inline-block; transition: color 0.3s; } .binance-row:hover .name-shake { animation: subtleShake 0.4s ease-in-out; color: #FCD535 !important; }
        .view-all-btn { background-color: #1E2329; border: none; } .view-all-btn:hover, .view-all-btn:active { background-color: #474D57 !important; color: #fff !important; box-shadow: 0 0 15px rgba(255,255,255,0.1); }
        .hero-grid-system { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; } 
        @media (max-width: 991px) { 
            .hero-grid-system { 
                display: flex !important; 
                overflow-x: auto; 
                scroll-snap-type: x mandatory; 
            } 
            .hero-card { 
                flex: 0 0 85%; 
                scroll-snap-align: start; 
                height: 180px !important; 
            } 
        }
      `}</style>
    </main>
  );
}

function MobileTableHeader() { return ( <div className="d-flex justify-content-between mb-3 border-bottom border-secondary pb-2" style={{ borderColor: '#333 !important', height: '40px', alignItems: 'flex-end' }}> <div style={{ flex: 2 }}> <span style={{ fontSize: '13px', color: '#848E9C' }}>Name Asset</span> </div> <div style={{ flex: 2, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}> <span style={{ fontSize: '13px', color: '#848E9C', width: '80px', textAlign: 'right' }}>Floor Price</span> <span style={{ fontSize: '13px', color: '#848E9C', width: '80px', textAlign: 'right' }}>Volume</span> </div> </div> ); }
function MobileRow({ item, getColorClass, getRankStyle }: any) { return ( <Link href={`/asset/${item.id}`} className="text-decoration-none"> <div className="d-flex align-items-center justify-content-between py-3 binance-row" style={{ borderBottom: '1px solid #222' }}> <div className="d-flex align-items-center gap-3" style={{ flex: 2 }}> <div style={{ width: '20px', textAlign: 'center' }}> {item.rank <= 3 ? ( <span style={{ ...getRankStyle(item.rank), fontSize: '18px' }}>{item.rank}</span> ) : ( <span className="text-white fw-light">{item.rank}</span> )} </div> <CoinIcon name={item.name} tier={item.tier} /> <span className="text-white fw-light name-shake" style={{ fontSize: '14px' }}>{item.name}</span> </div> <div className="d-flex justify-content-end align-items-center" style={{ flex: 2, gap: '10px' }}> <div className="d-flex flex-column align-items-end" style={{ width: '80px' }}> <span className="fw-bold text-white" style={{ fontSize: '14px' }}>{Number(item.floor).toFixed(2)}</span> <span className={`small ${getColorClass(item.change)}`} style={{ fontSize: '10px' }}>{Number(item.change).toFixed(2)}%</span> </div> <div className="d-flex flex-column align-items-end" style={{ width: '80px' }}> <span className="small text-white" style={{ fontSize: '13px' }}>{Number(item.volume).toFixed(2)}</span> <span className={`small ${getColorClass(item.change)}`} style={{ fontSize: '10px' }}>{Number(item.change).toFixed(2)}%</span> </div> </div> </div> </Link> ); }
function DesktopTable({ data, getColorClass, getRankStyle }: any) {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    return (
        <div className="table-responsive">
            <table className="table table-dark align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                <thead><tr style={{ fontSize: '15px', borderBottom: '1px solid #333', height: '50px' }}>
                        <th colSpan={2} style={{ paddingBottom: '15px', fontWeight: '400', color: '#848E9C', verticalAlign: 'middle' }}>Name Asset</th>
                        <th style={{ paddingBottom: '15px', textAlign: 'right', fontWeight: '400', color: '#848E9C', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Floor Price</th>
                        <th style={{ paddingBottom: '15px', textAlign: 'right', fontWeight: '400', color: '#848E9C', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Volume</th>
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
                            <td style={{ verticalAlign: 'middle' }}>
                                <Link href={`/asset/${item.id}`} className="text-decoration-none text-white">
                                    <div className="d-flex align-items-center gap-3">
                                        <CoinIcon name={item.name} tier={item.tier} />
                                        <span className="fw-light name-shake">{item.name}</span>
                                    </div>
                                </Link>
                            </td>
                                                    <td className="text-end" style={{ verticalAlign: 'middle' }}>
                                {isMounted ? (
                                    <>
                                        <span className="text-white fw-bold me-2">{Number(item.floor).toFixed(2)}</span>
                                        <span className={`small ${getColorClass(item.change)}`}>{item.change > 0 ? '+' : ''}{Number(item.change).toFixed(2)}%</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-secondary fw-bold me-2">--</span>
                                        <span className={`small text-secondary`}>--%</span>
                                    </>
                                )}
                            </td>
                            <td className="text-end" style={{ verticalAlign: 'middle' }}>
                                {isMounted ? (
                                    <>
                                        <span className="text-white fw-bold me-2">{Number(item.volume).toFixed(2)}</span>
                                        <span className={`small ${getColorClass(item.change)}`}>{item.change > 0 ? '+' : ''}{Number(item.change).toFixed(2)}%</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-secondary fw-bold me-2">--</span>
                                        <span className="small text-secondary">--%</span>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
