'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { ConnectButton, useActiveAccount, useActiveWallet } from "thirdweb/react";
import { defineChain } from "thirdweb";
import { createWallet, walletConnect } from "thirdweb/wallets"; 
import { client } from "@/lib/client";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  walletConnect(),
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const chain = defineChain(137); 

  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [drawerTranslate, setDrawerTranslate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isDrawerOpen]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
    setIsMobileSearchOpen(false);
    setDrawerTranslate(0);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerTranslate(0);
  };

  const handleNavClick = (item: string, e: React.MouseEvent) => {
    if (item === 'Portfolio') {
        e.preventDefault();
        router.push('/dashboard');
    }
    closeDrawer();
  };

  const handlePortfolioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/dashboard');
    closeDrawer();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/market?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    const diff = currentTouch - touchStart;
    if (diff < 0) {
        setDrawerTranslate(diff);
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; 
    
    if (isLeftSwipe) {
      closeDrawer();
    } else {
      setDrawerTranslate(0); 
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const goldGradient = 'linear-gradient(135deg, #FFD700 0%, #FCE570 50%, #FFD700 100%)';
  const navbarBgColor = '#0b0e11';
  const richGoldColor = '#FFD700';

  const customDisconnectStyle = {
    background: goldGradient,
    color: '#000',
    border: '1px solid #FFD700',
    fontWeight: '700' as const,
    fontSize: '11px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    cursor: 'pointer',
  };

  const customConnectStyle = {
    background: '#21262d', 
    color: '#fff', 
    border: '1px solid rgba(255, 215, 0, 0.3)', 
    fontWeight: '600' as const,
    fontSize: '12px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    gap: '6px',
  };

  const portfolioBtnStyle = {
    color: richGoldColor, 
    border: 'none', 
    background: 'transparent', 
    padding: '0 6px',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer', 
    transition: 'all 0.2s', 
    height: '23px', 
  };

  const menuItems = ['Home', 'Market', 'NGX', 'Mint', 'NNM Concept'];
  const secondaryLinks = ['Analytics', 'Newsletter', 'Blog', 'Careers', 'Partners'];

  const CustomWalletTrigger = ({ isMobile }: { isMobile: boolean }) => {
    const height = isMobile ? '24px' : '27px'; 
    const minWidth = isMobile ? '90px' : '110px';
    const fontSize = isMobile ? '11px' : '12px';

    return (
      <div style={{ position: 'relative', height: height, minWidth: minWidth, display: 'inline-block' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            {!account ? (
                <div style={customDisconnectStyle}>Connect Wallet</div>
            ) : (
                <div style={{...customConnectStyle, fontSize}}>
                    <div style={{
                        width: '6px', height: '6px', borderRadius: '50%', 
                        background: '#00ff00', boxShadow: '0 0 6px #00ff00', flexShrink: 0
                    }}></div>
                    <span style={{ fontFamily: 'monospace' }}>
                        {account.address.slice(0, 4)}...{account.address.slice(-4)}
                    </span>
                </div>
            )}
        </div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, opacity: 0, overflow: 'hidden' }}>
             <ConnectButton 
                client={client}
                wallets={wallets}
                chain={chain}
                theme="dark"
                connectButton={{ style: { width: '100%', height: '100%' } }}
                connectModal={{
                    size: "compact",
                    showThirdwebBranding: false,
                }}
            />
        </div>
      </div>
    );
  };

  const ChicProfileIcon = ({ size = 24, color = richGoldColor }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4V4.01C14.2 4.01 16 5.8 16 8C16 10.2 14.2 12 12 12C9.8 12 8 10.2 8 8C8 5.8 9.8 4 12 4ZM12 14C15.5 14 18.37 15.28 19.5 17.15C17.7 19.56 14.98 20.98 12 21V21C9.02 20.98 6.3 19.56 4.5 17.15C5.63 15.28 8.5 14 12 14Z" fill={color}/>
    </svg>
  );

  return (
    <>
    <nav className="navbar navbar-expand-lg fixed-top py-0" 
         style={{ 
             backgroundColor: navbarBgColor, 
             zIndex: 1050, 
             height: '60px', 
             paddingRight: '5px',
             borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
             boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
         }}>
      
      <div className="container-fluid px-2 h-100 align-items-center d-flex flex-nowrap">
        
        <div className="d-flex align-items-center d-lg-none me-auto gap-2">
            <button className="navbar-toggler border-0 p-0 shadow-none" type="button" onClick={toggleDrawer} style={{ width: '24px' }}>
                <i className="bi bi-list" style={{ fontSize: '26px', color: richGoldColor }}></i>
            </button>

            <Link href="/" className="navbar-brand d-flex align-items-center gap-2 m-0 p-0" style={{ textDecoration: 'none' }}> 
              <svg width="28" height="28" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
                <defs>
                  <linearGradient id="blockGoldMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FCE570" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
                <g>
                    <path d="M256 20 L356 120 L256 220 L156 120 Z" fill="url(#blockGoldMobile)" />
                    <path d="M156 120 L256 220 L256 240 L156 140 Z" fill="#B8860B" />
                    <path d="M256 292 L356 392 L256 492 L156 392 Z" fill="url(#blockGoldMobile)" />
                    <path d="M120 156 L220 256 L120 356 L20 256 Z" fill="url(#blockGoldMobile)" />
                    <path d="M392 156 L492 256 L392 356 L292 256 Z" fill="url(#blockGoldMobile)" />
                    <circle cx="256" cy="256" r="10" fill="#0b0e11" />
                </g>
              </svg>
              <span style={{ fontFamily: 'sans-serif', fontWeight: '800', fontSize: '21px', color: richGoldColor, letterSpacing: '1px', lineHeight: '1', marginTop: '1px' }}>NNM</span>
            </Link>
        </div>

        <div className="d-none d-lg-flex align-items-center" style={{ minWidth: '80px', flexShrink: 1, overflow:'hidden' }}> 
            <Link href="/" className="navbar-brand d-flex align-items-center gap-2 m-0 p-0" style={{ textDecoration: 'none' }}> 
              <svg width="29" height="29" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
                <defs>
                  <linearGradient id="blockGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FCE570" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                  <filter id="innerEtch" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.8" />
                  </filter>
                </defs>
                <g filter="url(#innerEtch)">
                    <path d="M256 20 L356 120 L256 220 L156 120 Z" fill="url(#blockGold)" />
                    <path d="M156 120 L256 220 L256 240 L156 140 Z" fill="#B8860B" />
                    <path d="M256 292 L356 392 L256 492 L156 392 Z" fill="url(#blockGold)" />
                    <path d="M356 392 L256 492 L256 472 L356 372 Z" fill="#8B6508" opacity="0.5" />
                    <path d="M120 156 L220 256 L120 356 L20 256 Z" fill="url(#blockGold)" />
                    <path d="M392 156 L492 256 L392 356 L292 256 Z" fill="url(#blockGold)" />
                    <circle cx="256" cy="256" r="10" fill="#0b0e11" />
                </g>
              </svg>
              <span style={{ fontFamily: 'sans-serif', fontWeight: '800', fontSize: '20px', background: 'linear-gradient(135deg, #FFD700 0%, #FCE570 50%, #FFD700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px', lineHeight: '1', marginTop: '1px' }}>NNM</span>
            </Link>
        </div>

        <div className="d-flex d-lg-none align-items-center ms-auto" style={{ gap: '8px', overflow: 'visible', paddingRight: '0px' }}>
            <button className="btn p-1 border-0" onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} style={{ width: '28px' }}>
                <i className="bi bi-search" style={{ fontSize: '16px', color: richGoldColor }}></i>
            </button>

            <button className="btn p-0 d-flex align-items-center justify-content-center" onClick={handlePortfolioClick}
                style={{ width: '32px', height: '32px', border: 'none', backgroundColor: 'transparent', flexShrink: 0 }}>
                <ChicProfileIcon size={24} color={richGoldColor} />
            </button>

            <CustomWalletTrigger isMobile={true} />
        </div>

        <div className="collapse navbar-collapse flex-grow-1" id="navbarNav">
          <div className="d-flex flex-column flex-lg-row align-items-start w-100" style={{ paddingTop: '4px' }}>
            
            <div className="d-flex align-items-center me-auto ms-0 ms-lg-4"> 
                <ul className="navbar-nav mb-2 mb-lg-0 gap-1 gap-lg-1 align-items-start align-items-lg-center w-100">
                    {menuItems.map((item) => (
                        <li className="nav-item w-100 w-lg-auto" key={item}>
                            <Link 
                                href={item === 'Portfolio' ? '/dashboard' : (item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`)}
                                onClick={(e) => handleNavClick(item, e)}
                                className={`nav-link fw-semibold desktop-nav-link ${pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) ? 'active' : ''}`}
                                style={{ fontSize: '13px', padding: '8px 8px', whiteSpace: 'nowrap' }} 
                            >
                                {item}
                            </Link>
                        </li>
                    ))}
                    <li className="nav-item dropdown w-100 w-lg-auto" style={{ zIndex: 1055 }}
                        onMouseEnter={() => setIsInsightsOpen(true)}
                        onMouseLeave={() => setIsInsightsOpen(false)}>
                      <a className={`nav-link dropdown-toggle fw-semibold shadow-none desktop-nav-link ${isInsightsOpen ? 'show' : ''}`} 
                        href="#" role="button" onClick={(e) => { e.preventDefault(); setIsInsightsOpen(!isInsightsOpen); }}
                        style={{ fontSize: '13px', padding: '8px 8px', whiteSpace: 'nowrap' }}>
                        Insights
                      </a>
                      <ul className={`dropdown-menu border-secondary shadow-lg py-1 ${isInsightsOpen ? 'show' : ''}`} 
                          style={{ backgroundColor: '#161b22', minWidth: '150px', marginTop: '0px', border: '1px solid #333' }}>
                        {['How it Works', 'Contact'].map((subItem) => (
                            <li key={subItem}>
                                <Link className="dropdown-item text-white py-2 px-3" href={`/${subItem.toLowerCase().replace(/\s+/g, '-')}`} 
                                    style={{ fontSize: '14px', transition: '0.2s' }} 
                                >
                                    {subItem}
                                </Link>
                            </li>
                        ))}
                      </ul>
                    </li>
                </ul>
            </div>

            <div className="d-none d-lg-flex align-items-center justify-content-end gap-2" style={{ marginTop: '5px' }}> 
                <form onSubmit={handleSearch} className="position-relative" style={{ width: '280px', height: '23px', flexShrink: 0 }}>
                   <input type="text" className="form-control search-input-custom text-white shadow-none" placeholder="Search..." 
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ borderRadius: '6px', fontSize:'13px', height: '100%', paddingLeft: '30px', border: '1px solid rgba(255, 215, 0, 0.5)', boxShadow: '0 0 5px rgba(255, 215, 0, 0.1)', caretColor: richGoldColor }} 
                   />
                   <button type="submit" className="btn p-0 position-absolute" style={{top: '50%', transform: 'translateY(-50%)', left: '10px', border:'none', background:'transparent'}}>
                        <i className="bi bi-search text-secondary" style={{fontSize: '12px', color: `${richGoldColor} !important`}}></i>
                   </button>
                </form>
                
                <button onClick={handlePortfolioClick} className="btn" style={portfolioBtnStyle} title="Go to Dashboard">
                    <ChicProfileIcon size={26} color={richGoldColor} />
                </button>

                <CustomWalletTrigger isMobile={false} />
            </div>
          </div>
        </div>
      </div>

      <div 
        className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`} 
        style={{ transform: isDrawerOpen ? `translateX(${drawerTranslate}px)` : 'translateX(-100%)' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
          <div style={{
              position: 'absolute',
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '14px',
              height: '150px', 
              backgroundColor: '#1a1a1a',
              borderTopLeftRadius: '6px',
              borderBottomLeftRadius: '6px',
              zIndex: 10001,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              borderLeft: '1px solid rgba(255, 215, 0, 0.3)',
              borderTop: '1px solid rgba(255, 215, 0, 0.1)',
              borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
              boxShadow: '-2px 0 8px rgba(255, 215, 0, 0.1)'
          }}>
          </div>

          <div className="drawer-header d-flex flex-column align-items-start px-4 pt-5 pb-3 w-100 mt-4 position-relative" style={{borderBottom: '1px solid #1a1a1a'}}>
              <button onClick={closeDrawer} className="btn position-absolute top-0 end-0 m-3 text-secondary p-2">
                  <i className="bi bi-x-lg" style={{ fontSize: '22px', color: '#888' }}></i>
              </button>

              <div className="d-flex align-items-center gap-3 mb-2">
                <svg width="40" height="40" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="drawerGoldRich" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#FCE570" />
                        <stop offset="100%" stopColor="#FFD700" />
                      </linearGradient>
                    </defs>
                    <g>
                        <path d="M256 20 L356 120 L256 220 L156 120 Z" fill="url(#drawerGoldRich)" />
                        <path d="M156 120 L256 220 L256 240 L156 140 Z" fill="#B8860B" />
                        <path d="M256 292 L356 392 L256 492 L156 392 Z" fill="url(#drawerGoldRich)" />
                        <path d="M120 156 L220 256 L120 356 L20 256 Z" fill="url(#drawerGoldRich)" />
                        <path d="M392 156 L492 256 L392 356 L292 256 Z" fill="url(#drawerGoldRich)" />
                    </g>
                </svg>
                <span style={{ fontFamily: 'sans-serif', fontWeight: '800', fontSize: '26px', color: richGoldColor, letterSpacing: '1px' }}>NNM</span>
              </div>
          </div>

          <div className="drawer-content px-4 py-3 d-flex flex-column h-100" style={{ overflowY: 'auto' }}>
              <div className="d-flex flex-column w-100 flex-grow-1 justify-content-evenly">
                  <div className="d-flex flex-column gap-3">
                    {menuItems.map((item) => (
                        <Link key={item} 
                                href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={closeDrawer}
                                className="text-decoration-none fw-bold"
                                style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.85)', letterSpacing: '0.5px' }}>
                            {item}
                        </Link>
                    ))}
                    <Link href="/how-it-works" onClick={closeDrawer} className="text-decoration-none fw-bold" style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.85)', letterSpacing: '0.5px' }}>How it Works</Link>
                    <Link href="/contact" onClick={closeDrawer} className="text-decoration-none fw-bold" style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.85)', letterSpacing: '0.5px' }}>Contact</Link>
                  </div>

                  <hr className="border-secondary opacity-10 my-1 w-100" />

                  <div className="d-flex flex-column gap-3">
                    {secondaryLinks.map((link) => (
                        <Link key={link} 
                                href={`/${link.toLowerCase()}`}
                                onClick={closeDrawer}
                                className="text-decoration-none fw-normal"
                                style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.6)' }}>
                            {link}
                        </Link>
                    ))}
                  </div>
              </div>

              <div className="drawer-footer pt-3 border-top border-secondary border-opacity-10 mt-2 d-flex align-items-center w-100">
                  <div className="d-flex justify-content-between align-items-center" style={{ width: '80%', paddingRight: '15px' }}>
                      <i className="bi bi-twitter-x" style={{ fontSize: '20px', color: richGoldColor }}></i>
                      <i className="bi bi-discord" style={{ fontSize: '20px', color: richGoldColor }}></i>
                      <i className="bi bi-instagram" style={{ fontSize: '20px', color: richGoldColor }}></i>
                      <i className="bi bi-telegram" style={{ fontSize: '20px', color: richGoldColor }}></i>
                      <i className="bi bi-youtube" style={{ fontSize: '20px', color: richGoldColor }}></i>
                  </div>
                  
                  <div className="d-flex justify-content-center align-items-center" style={{ width: '20%', borderLeft: '1px solid #222' }}>
                      <Link href="/contact" onClick={closeDrawer}>
                        <i className="bi bi-envelope-fill" style={{ fontSize: '22px', color: richGoldColor }}></i>
                      </Link>
                  </div>
              </div>
          </div>
      </div>

      {isMobileSearchOpen && (
        <div className="d-lg-none position-absolute start-0 w-100" style={{ top: '60px', zIndex: 1049, backgroundColor: navbarBgColor, padding: '12px 15px', borderBottom: '1px solid rgba(255, 215, 0, 0.3)' }}>
            <form onSubmit={handleSearch} className="position-relative">
                <input ref={mobileSearchInputRef} type="text" className="form-control bg-dark text-white shadow-none" placeholder="Search collections..." 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ borderRadius: '4px', fontSize: '14px', height: '42px', paddingLeft: '38px', paddingRight: '35px', border: '1px solid #FFD700', caretColor: '#FFD700' }} 
                />
                <button type="submit" className="btn p-0 position-absolute" style={{ top: '50%', left: '12px', transform: 'translateY(-50%)', border:'none', background:'transparent' }}>
                    <i className="bi bi-search" style={{ fontSize: '16px', color: richGoldColor }}></i>
                </button>
                <button type="button" onClick={() => setIsMobileSearchOpen(false)} className="btn btn-link position-absolute text-secondary text-decoration-none p-0" style={{ top: '50%', right: '12px', transform: 'translateY(-50%)' }}><i className="bi bi-x-lg" style={{ fontSize: '16px' }}></i></button>
            </form>
        </div>
      )}

      <style jsx global>{`
        .desktop-nav-link { color: #ffffff !important; transition: color 0.2s ease, padding 0.3s; }
        .desktop-nav-link:hover, .desktop-nav-link.active { color: ${richGoldColor} !important; }
        .text-gold { color: ${richGoldColor} !important; }
        .dropdown-item:hover, .dropdown-item:focus { background-color: #2b3139 !important; color: ${richGoldColor} !important; }
        .nav-link:focus, .nav-link:active { color: ${richGoldColor} !important; outline: none !important; box-shadow: none !important; }
        .navbar-toggler:focus { box-shadow: none !important; }
        .search-input-custom { background-color: #161b22 !important; transition: background-color 0.3s ease; }
        .search-input-custom:focus { background-color: ${navbarBgColor} !important; border-color: ${richGoldColor} !important; }

        .tw-connect-wallet { width: 100% !important; height: 100% !important; }

        @media (max-width: 991px) {
            footer, .footer { display: none !important; }
        }

        .mobile-drawer {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background-color: #0b0e11;
            z-index: 9999;
            transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
      `}</style>
    </nav>
    
    <div style={{ height: '60px' }}></div>
    </>
  );
};

export default Navbar;
