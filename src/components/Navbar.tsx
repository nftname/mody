'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  
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
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isDrawerOpen]);

  // Reset all states on route change
  useEffect(() => {
    setIsDrawerOpen(false);
    setDrawerTranslate(0);
    setIsMobileSearchOpen(false);
    setIsInsightsOpen(false);
  }, [pathname]);

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
    setIsInsightsOpen(false);
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

  // --- Swipe Logic ---
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    const diff = currentTouch - touchStart;
    if (diff < 0) { setDrawerTranslate(diff); }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; 
    if (isLeftSwipe) { closeDrawer(); } else { setDrawerTranslate(0); }
    setTouchStart(null); setTouchEnd(null);
  };

  // --- 🎨 THE EXACT DARK BLUE COLOR ---
  const exactDarkColor = '#0b0e11'; 
  
  const dropdownColor = '#0a0c10'; 
  const metallicGoldHex = '#F0C420'; 
  const paleGoldHex = '#D4C49D'; 
  const subtleBorder = 'rgba(255, 255, 255, 0.08)'; 

  const elementHeight = '29px'; 
  const elementFontSize = '11px';

  // --- Styles ---
  
  const customDisconnectStyle = {
    background: 'transparent',
    color: metallicGoldHex,
    border: `1px solid ${metallicGoldHex}`,
    fontWeight: '600' as const,
    fontSize: elementFontSize,
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    padding: '0 8px',
    transition: 'all 0.2s ease',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap' as const
  };

  const customConnectStyle = {
    background: '#141414', 
    color: '#E0E0E0', 
    border: `1px solid rgba(240, 196, 32, 0.3)`, 
    fontWeight: '500' as const,
    fontSize: elementFontSize,
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    gap: '6px',
    padding: '0 8px'
  };

  const portfolioBtnStyle = {
    color: metallicGoldHex, 
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
    const height = isMobile ? '28px' : elementHeight; 
    const minWidth = isMobile ? '80px' : '110px'; 
    const fontSize = isMobile ? '11px' : elementFontSize;
    const btnText = isMobile ? 'Connect' : 'Connect Wallet'; 

    return (
      <div style={{ position: 'relative', height: height, minWidth: minWidth, display: 'inline-block' }}>
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openConnectModal, authenticationStatus, mounted }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');
            return (
              <div {...(!ready && { 'aria-hidden': true, 'style': { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })} style={{ width: '100%', height: '100%' }}>
                {(() => {
                  if (!connected) {
                    return ( <div onClick={openConnectModal} style={customDisconnectStyle} className="hover-effect-btn"> {btnText} </div> );
                  }
                  if (chain.unsupported) {
                    return ( <div onClick={openConnectModal} style={{...customDisconnectStyle, borderColor: '#ff4d4d', color: '#ff4d4d'}}> Wrong Net </div> );
                  }
                  return (
                    <div onClick={openAccountModal} style={{...customConnectStyle, fontSize}}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#27ae60', boxShadow: '0 0 8px rgba(39, 174, 96, 0.6)', flexShrink: 0 }}></div>
                        <span style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}> {account.displayName} </span>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    );
  };

  const ChicProfileIcon = ({ size = 24, color = metallicGoldHex }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4V4.01C14.2 4.01 16 5.8 16 8C16 10.2 14.2 12 12 12C9.8 12 8 10.2 8 8C8 5.8 9.8 4 12 4ZM12 14C15.5 14 18.37 15.28 19.5 17.15C17.7 19.56 14.98 20.98 12 21V21C9.02 20.98 6.3 19.56 4.5 17.15C5.63 15.28 8.5 14 12 14Z" fill={color}/>
    </svg>
  );

  const LogoSVG = ({ mobile = false }: { mobile?: boolean }) => (
    <svg width={mobile ? "31" : "30"} height={mobile ? "31" : "30"} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
        <defs>
            <linearGradient id={mobile ? "goldGradMob" : "goldGradDesk"} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FDB931" />
            <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
        </defs>
        <g>
            <path d="M256 20 L356 120 L256 220 L156 120 Z" fill={`url(#${mobile ? "goldGradMob" : "goldGradDesk"})`} />
            <path d="M156 120 L256 220 L256 240 L156 140 Z" fill="#B8860B" opacity="0.9" />
            <path d="M256 292 L356 392 L256 492 L156 392 Z" fill={`url(#${mobile ? "goldGradMob" : "goldGradDesk"})`} />
            <path d="M120 156 L220 256 L120 356 L20 256 Z" fill={`url(#${mobile ? "goldGradMob" : "goldGradDesk"})`} />
            <path d="M392 156 L492 256 L392 356 L292 256 Z" fill={`url(#${mobile ? "goldGradMob" : "goldGradDesk"})`} />
        </g>
    </svg>
  );

  const CustomHamburger = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6H20" stroke={metallicGoldHex} strokeWidth="2" strokeLinecap="round"/>
        <path d="M4 12H20" stroke={metallicGoldHex} strokeWidth="2" strokeLinecap="round"/>
        <path d="M4 18H20" stroke={metallicGoldHex} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  return (
    <>
    <nav className="navbar navbar-expand-lg fixed-top py-0" 
         style={{ 
             // FORCED TO EXACT VARIABLE (No manual RGBA)
             backgroundColor: exactDarkColor, 
             backdropFilter: 'blur(10px)',
             WebkitBackdropFilter: 'blur(10px)',
             zIndex: 1050, 
             height: '64px', 
             borderBottom: `1px solid ${subtleBorder}`,
             width: '100%', 
             top: 0,
             left: 0,
             transform: 'translateZ(0)', 
             willChange: 'transform'
         }}>
      
      <div className="container-fluid h-100 align-items-center d-flex flex-nowrap px-3 px-lg-4">
        
        {/* Mobile Toggle & Logo */}
        <div className="d-flex align-items-center d-lg-none me-auto gap-2">
            <button className="navbar-toggler border-0 p-0 shadow-none d-flex align-items-center" type="button" onClick={toggleDrawer} style={{ width: 'auto' }}>
                <CustomHamburger />
            </button>

            <Link href="/" className="navbar-brand d-flex align-items-center gap-2 m-0 p-0" style={{ textDecoration: 'none' }}> 
              <LogoSVG mobile={true} />
              <span className="gold-text-gradient" style={{ fontFamily: 'sans-serif', fontWeight: '800', fontSize: '22px', letterSpacing: '0.5px', marginTop: '1px' }}>NNM</span>
            </Link>
        </div>

        {/* Desktop Logo */}
        <div className="d-none d-lg-flex align-items-center" style={{ flexShrink: 0, marginRight: '15px' }}> 
            <Link href="/" className="navbar-brand d-flex align-items-center gap-2 m-0 p-0" style={{ textDecoration: 'none' }}> 
              <LogoSVG mobile={false} />
              <span className="gold-text-gradient" style={{ fontFamily: 'sans-serif', fontWeight: '800', fontSize: '22px', letterSpacing: '1px', marginTop: '1px' }}>NNM</span>
            </Link>
        </div>

        {/* Mobile Right Icons */}
        <div className="d-flex d-lg-none align-items-center ms-auto" style={{ gap: '8px', overflow: 'visible', paddingRight: '0px' }}>
            <button className="btn p-1 border-0" onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} style={{ width: '28px' }}>
                <i className="bi bi-search" style={{ fontSize: '16px', color: metallicGoldHex }}></i>
            </button>

            <button className="btn p-0 d-flex align-items-center justify-content-center" onClick={handlePortfolioClick}
                style={{ width: '32px', height: '32px', border: 'none', backgroundColor: 'transparent', flexShrink: 0 }}>
                <ChicProfileIcon size={24} color={metallicGoldHex} />
            </button>

            <CustomWalletTrigger isMobile={true} />
        </div>

        {/* Desktop Menu */}
        <div className="collapse navbar-collapse flex-grow-1" id="navbarNav">
          <div className="d-flex flex-column flex-lg-row align-items-center w-100 justify-content-between">
            
            <div className="d-flex align-items-center" style={{ flexShrink: 1, minWidth: 0, paddingTop: '5px' }}> 
                <ul className="navbar-nav mb-2 mb-lg-0 gap-2 gap-xl-3 align-items-center">
                    {menuItems.map((item) => (
                        <li className="nav-item" key={item}>
                            <Link 
                                href={item === 'Portfolio' ? '/dashboard' : (item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`)}
                                onClick={(e) => handleNavClick(item, e)}
                                className={`nav-link fw-medium desktop-nav-link ${pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) ? 'active' : ''}`}
                                style={{ fontSize: '13px', whiteSpace: 'nowrap' }} 
                            >
                                {item}
                            </Link>
                        </li>
                    ))}
                    
                    <li className="nav-item dropdown" style={{ zIndex: 1055 }}
                        onMouseEnter={() => setIsInsightsOpen(true)}
                        onMouseLeave={() => setIsInsightsOpen(false)}>
                      <a className={`nav-link dropdown-toggle fw-medium shadow-none desktop-nav-link ${isInsightsOpen ? 'show' : ''}`} 
                        href="#" role="button" onClick={(e) => { e.preventDefault(); setIsInsightsOpen(!isInsightsOpen); }}
                        style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                        Insights
                      </a>
                      <ul className={`dropdown-menu shadow-lg ${isInsightsOpen ? 'show' : ''}`} 
                          style={{ 
                              backgroundColor: dropdownColor, 
                              border: `1px solid ${subtleBorder}`, 
                              minWidth: '160px', 
                              marginTop: '0px', 
                              paddingTop: '8px', 
                              paddingBottom: '8px',
                              borderRadius: '8px'
                          }}>
                        {['How it Works', 'Contact'].map((subItem, idx, arr) => (
                            <li key={subItem}>
                                <Link className="dropdown-item py-2 px-3 dropdown-link-custom" href={`/${subItem.toLowerCase().replace(/\s+/g, '-')}`} 
                                    style={{ 
                                        fontSize: '13px', 
                                        transition: '0.2s', 
                                        color: '#E0E0E0',
                                        borderBottom: idx !== arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                    }} 
                                >
                                    {subItem}
                                </Link>
                            </li>
                        ))}
                      </ul>
                    </li>
                </ul>
            </div>

            <div style={{ flexGrow: 1 }}></div>

            <div className="d-none d-lg-flex align-items-center justify-content-end gap-2" style={{ flexShrink: 0, marginLeft: '20px' }}> 
                <form onSubmit={handleSearch} className="position-relative" style={{ width: '240px', height: elementHeight }}>
                   <input type="text" className="form-control search-input-custom text-white shadow-none" placeholder="Search..." 
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ borderRadius: '6px', fontSize:'13px', height: '100%', paddingLeft: '34px', border: `1px solid rgba(240, 196, 32, 0.1)`, caretColor: metallicGoldHex }} 
                   />
                   <button type="submit" className="btn p-0 position-absolute" style={{top: '50%', transform: 'translateY(-50%)', left: '10px', border:'none', background:'transparent'}}>
                        <i className="bi bi-search" style={{fontSize: '13px', color: metallicGoldHex}}></i>
                   </button>
                </form>
                
                <button onClick={handlePortfolioClick} className="btn" style={portfolioBtnStyle} title="Go to Dashboard">
                    <ChicProfileIcon size={26} color={metallicGoldHex} />
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
          {/* MODIFIED HERE: 
              - Height changed from '80px' to '20vh' (20% of viewport height).
              - Background color changed to '#2d2d2d' (Dark Gray).
          */}
          <div style={{
              position: 'absolute',
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '4px',
              height: '20vh', 
              backgroundColor: '#2d2d2d', 
              borderTopLeftRadius: '4px',
              borderBottomLeftRadius: '4px',
              opacity: 1
          }}>
          </div>

          {/* MODIFIED HERE: 
              - Removed 'borderBottom' to unify the look.
              - Background remains 'exactDarkColor' to match the drawer content.
          */}
          <div className="drawer-header d-flex align-items-center justify-content-between px-4 pt-4 pb-3 w-100 mt-0 position-relative" 
               style={{ backgroundColor: exactDarkColor }}>
              
              <div className="d-flex align-items-center gap-3">
                 <LogoSVG mobile={true} />
                 <span className="gold-text-gradient" style={{ fontFamily: 'sans-serif', fontWeight: '800', fontSize: '24px', letterSpacing: '0.5px' }}>NNM</span>
              </div>

              {/* Close Button */}
              <button onClick={closeDrawer} className="btn p-0 d-flex align-items-center justify-content-center" 
                      style={{ 
                          width: '36px', height: '36px', 
                          borderRadius: '50%', 
                          backgroundColor: 'transparent', 
                          border: '1px solid #333', 
                          color: '#777' 
                      }}>
                  <i className="bi bi-x" style={{ fontSize: '24px' }}></i>
              </button>
          </div>

          <div className="drawer-content px-4 py-3 d-flex flex-column h-100" style={{ overflowY: 'auto', backgroundColor: exactDarkColor }}>
              <div className="d-flex flex-column w-100 flex-grow-1 justify-content-start gap-3 mt-2">
                  <div className="d-flex flex-column gap-2">
                    {menuItems.map((item) => (
                        <Link key={item} 
                                href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={closeDrawer}
                                className="text-decoration-none fw-bold py-2"
                                style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.5px' }}>
                            {item}
                        </Link>
                    ))}
                    <Link href="/how-it-works" onClick={closeDrawer} className="text-decoration-none fw-bold py-2" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.5px' }}>How it Works</Link>
                    <Link href="/contact" onClick={closeDrawer} className="text-decoration-none fw-bold py-2" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.5px' }}>Contact</Link>
                  </div>

                  <hr className="border-secondary opacity-10 my-1 w-100" />

                  <div className="d-flex flex-column gap-2">
                    {secondaryLinks.map((link) => (
                        <Link key={link} 
                                href={`/${link.toLowerCase()}`}
                                onClick={closeDrawer}
                                className="text-decoration-none fw-normal py-1"
                                style={{ fontSize: '15px', color: '#888' }}>
                            {link}
                        </Link>
                    ))}
                  </div>
              </div>

              <div className="drawer-footer pt-3 border-top border-secondary border-opacity-10 mt-2 d-flex align-items-center w-100 mb-4">
                  {/* REDUCED SPACING: Changed gap-4 to gap-2 (50% less) */}
                  <div className="d-flex justify-content-start align-items-center gap-2 px-3" style={{ width: '80%' }}>
                      <i className="bi bi-twitter-x" style={{ fontSize: '18px', color: paleGoldHex }}></i>
                      <i className="bi bi-facebook" style={{ fontSize: '18px', color: paleGoldHex }}></i>
                      <i className="bi bi-discord" style={{ fontSize: '18px', color: paleGoldHex }}></i>
                      <i className="bi bi-telegram" style={{ fontSize: '18px', color: paleGoldHex }}></i>
                      <i className="bi bi-instagram" style={{ fontSize: '18px', color: paleGoldHex }}></i>
                  </div>
              </div>
          </div>
      </div>

      {isMobileSearchOpen && (
        <div className="d-lg-none position-absolute start-0 w-100" style={{ top: '64px', zIndex: 1049, backgroundColor: exactDarkColor, padding: '12px 15px', borderBottom: `1px solid ${subtleBorder}` }}>
            <form onSubmit={handleSearch} className="position-relative">
                <input ref={mobileSearchInputRef} type="text" className="form-control bg-dark text-white shadow-none" placeholder="Search..." 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ borderRadius: '4px', fontSize: '14px', height: '42px', paddingLeft: '38px', paddingRight: '35px', border: `1px solid ${subtleBorder}`, caretColor: metallicGoldHex }} 
                />
                <button type="submit" className="btn p-0 position-absolute" style={{ top: '50%', left: '12px', transform: 'translateY(-50%)', border:'none', background:'transparent' }}>
                    <i className="bi bi-search" style={{ fontSize: '16px', color: metallicGoldHex }}></i>
                </button>
                <button type="button" onClick={() => setIsMobileSearchOpen(false)} className="btn btn-link position-absolute text-secondary text-decoration-none p-0" style={{ top: '50%', right: '12px', transform: 'translateY(-50%)' }}><i className="bi bi-x-lg" style={{ fontSize: '16px' }}></i></button>
            </form>
        </div>
      )}

      <style jsx global>{`
        .gold-text-gradient {
            background: linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #FFD700 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
        }

        .desktop-nav-link { color: #ffffff !important; transition: color 0.3s ease; }
        .desktop-nav-link:hover, .desktop-nav-link.active { color: ${metallicGoldHex} !important; }
        
        .dropdown-link-custom:hover, .dropdown-link-custom:focus { 
            background-color: rgba(255, 255, 255, 0.05) !important; 
            color: ${metallicGoldHex} !important; 
        }
        
        .search-input-custom { background-color: rgba(255, 255, 255, 0.05) !important; transition: all 0.3s ease; }
        .search-input-custom:focus { background-color: rgba(255, 255, 255, 0.1) !important; border-color: ${metallicGoldHex} !important; }

        .hover-effect-btn:hover { background-color: rgba(240, 196, 32, 0.1) !important; }

        .mobile-drawer {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background-color: ${exactDarkColor};
            z-index: 9999;
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
      `}</style>
    </nav>
    
    <div style={{ height: '64px' }}></div>
    </>
  );
};

export default Navbar;
