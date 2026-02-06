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
  
  // State for Dropdowns
  const [isInsightsOpen, setIsInsightsOpen] = useState(false); // Used for NGX now based on your logic
  const [isNNMConceptOpen, setIsNNMConceptOpen] = useState(false);
  
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

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isDrawerOpen]);

  useEffect(() => {
    setIsDrawerOpen(false);
    setDrawerTranslate(0);
    setIsMobileSearchOpen(false);
    setIsInsightsOpen(false);
    setIsNNMConceptOpen(false);
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
    setIsNNMConceptOpen(false);
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

  // ✅ الألوان الموحدة 
  const exactDarkColor = '#0B0E11'; 
  const drawerBgColor = '#1E1E1E'; 
  
  const dropdownColor = '#0B0E11'; 
  const metallicGoldHex = '#F0C420'; 
  const subtleBorder = 'rgba(255, 255, 255, 0.08)'; 
  const offWhiteText = '#E0E0E0';
  const matteGoldIcon = '#CBA135';

  const elementHeight = '29px'; 
  const elementFontSize = '11px';
  // Reduced by 10% from 13px -> ~11.7px
  const navFontSize = '11.7px'; 
  // Reduced by 20% for the new dropdown -> ~10.4px
  const dropDownSmallFont = '10.5px';

  // --- START WALLET LOGIC (RESTORED EXACTLY FROM ORIGINAL) ---
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
  // --- END WALLET LOGIC ---

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

  const menuIcons: { [key: string]: string } = {
    'Home': 'bi-house-door',
    'Market': 'bi-shop',
    'NGX': 'bi-activity',
    'Mint': 'bi-diamond',
    'ChainFace': 'bi-person-badge', // New Icon
    'NNM Concept': 'bi-layers'
  };

  // Main items for loop (ChainFace added manually in Desktop layout)
  const menuItems = ['Home', 'Market'];

  // Mobile Bottom Drawer Items (Contact moved here)
  const bottomDrawerItems = [
    { label: 'News & Updates', href: '/news', icon: 'bi-newspaper' },
    { label: 'Market Indices', href: '/market-indices', icon: 'bi-graph-up-arrow' },
    { label: 'Affiliate Program', href: '/affiliate', icon: 'bi-briefcase' },
    { label: 'Rankings', href: '/ranking', icon: 'bi-trophy' },
    { label: 'Blog', href: '/blog', icon: 'bi-pencil-square' },
    { label: 'Contact', href: '/contact', icon: 'bi-chat-left-text' } // Moved from top list
  ];

  const ChicProfileIcon = ({ size = 24, color = metallicGoldHex }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4V4.01C14.2 4.01 16 5.8 16 8C16 10.2 14.2 12 12 12C9.8 12 8 10.2 8 8C8 5.8 9.8 4 12 4ZM12 14C15.5 14 18.37 15.28 19.5 17.15C17.7 19.56 14.98 20.98 12 21V21C9.02 20.98 6.3 19.56 4.5 17.15C5.63 15.28 8.5 14 12 14Z" fill={color}/>
    </svg>
  );

  const LogoSVG = ({ mobile = false, size = 30 }: { mobile?: boolean, size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
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
    <nav className="navbar fixed-top py-0" 
         style={{ 
             backgroundColor: exactDarkColor, 
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
        
        {/* MOBILE HEADER (Left Side) */}
        <div className="d-flex align-items-center d-lg-none me-auto gap-2">
            <button className="navbar-toggler border-0 p-0 shadow-none d-flex align-items-center" type="button" onClick={toggleDrawer} style={{ width: 'auto' }}>
                <CustomHamburger />
            </button>

            <Link href="/" className="navbar-brand d-flex align-items-center gap-2 m-0 p-0" style={{ textDecoration: 'none' }}> 
              <LogoSVG mobile={true} size={31} />
              <span className="gold-text-gradient" style={{ fontFamily: 'sans-serif', fontWeight: '800', fontSize: '22px', letterSpacing: '0.5px', marginTop: '1px' }}>NNM</span>
            </Link>
        </div>

        {/* DESKTOP LOGO */}
        <div className="d-none d-lg-flex align-items-center" style={{ flexShrink: 0, marginRight: '40px' }}> 
            <Link href="/" className="navbar-brand d-flex align-items-center gap-2 m-0 p-0" style={{ textDecoration: 'none' }}> 
              <LogoSVG mobile={false} />
              <span className="gold-text-gradient" style={{ fontFamily: 'sans-serif', fontWeight: '800', fontSize: '22px', letterSpacing: '1px', marginTop: '1px' }}>NNM</span>
            </Link>
        </div>

        {/* MOBILE RIGHT ICONS */}
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

        {/* DESKTOP CONTENT */}
        <div className="d-none d-lg-flex flex-grow-1 align-items-center justify-content-between" id="desktopNav">
            
            {/* Desktop Links */}
            <div className="d-flex align-items-center" style={{ flexShrink: 1, minWidth: 0, paddingTop: '5px' }}> 
                <ul className="navbar-nav mb-2 mb-lg-0 d-flex flex-row align-items-center" style={{ gap: '18px' }}>
                    
                    {/* Home & Market */}
                    {menuItems.map((item) => (
                        <li className="nav-item" key={item}>
                            <Link 
                                href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={(e) => handleNavClick(item, e)}
                                className={`nav-link fw-medium desktop-nav-link ${pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) ? 'active' : ''}`}
                                style={{ fontSize: navFontSize, whiteSpace: 'nowrap' }} 
                            >
                                {item}
                            </Link>
                        </li>
                    ))}
                    
                    {/* NGX Dropdown (Was Insights) */}
                    <li className="nav-item dropdown position-relative" style={{ zIndex: 1055 }}
                        onMouseEnter={() => setIsInsightsOpen(true)}
                        onMouseLeave={() => setIsInsightsOpen(false)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Link 
                          href="/ngx"
                          className={`nav-link fw-medium shadow-none desktop-nav-link ${pathname === '/ngx' ? 'active' : ''}`}
                          style={{ fontSize: navFontSize, whiteSpace: 'nowrap', padding: '0.5rem 0' }}
                        >
                          NGX
                        </Link>
                        <button 
                          onClick={(e) => { e.preventDefault(); setIsInsightsOpen(!isInsightsOpen); }}
                          className="btn p-0 border-0 bg-transparent"
                          style={{ fontSize: '9px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Toggle dropdown"
                        >
                          <i className="bi bi-chevron-down" style={{ fontSize: '9px' }}></i>
                        </button>
                      </div>
                      
                      <ul className={`dropdown-menu shadow-lg ${isInsightsOpen ? 'show' : ''}`} 
                          style={{ 
                              position: 'absolute',
                              top: '100%',
                              left: '0',
                              backgroundColor: dropdownColor, 
                              border: `1px solid ${subtleBorder}`, 
                              minWidth: '120px', 
                              marginTop: '0px', 
                              paddingTop: '8px', 
                              paddingBottom: '8px',
                              borderRadius: '8px'
                          }}>
                        {[
                          { label: 'NGX', href: '/ngx' },
                          { label: 'Market Indices', href: '/market-indices' }
                        ].map((subItem, idx, arr) => (
                            <li key={subItem.label}>
                                <Link className="dropdown-item py-2 px-3 dropdown-link-custom" href={subItem.href} 
                                    style={{ 
                                        fontSize: navFontSize, 
                                        transition: '0.2s', 
                                        color: '#E0E0E0',
                                        borderBottom: idx !== arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                    }} 
                                >
                                    {subItem.label}
                                </Link>
                            </li>
                        ))}
                      </ul>
                    </li>

                    {/* Mint */}
                    <li className="nav-item">
                        <Link 
                            href="/mint"
                            onClick={(e) => handleNavClick('Mint', e)}
                            className={`nav-link fw-medium desktop-nav-link ${pathname === '/mint' ? 'active' : ''}`}
                            style={{ fontSize: navFontSize, whiteSpace: 'nowrap' }} 
                        >
                            Mint
                        </Link>
                    </li>

                    {/* ChainFace (New Item) */}
                    <li className="nav-item">
                        <Link 
                            href="/chainface"
                            onClick={(e) => handleNavClick('ChainFace', e)}
                            className={`nav-link fw-medium desktop-nav-link ${pathname === '/chainface' ? 'active' : ''}`}
                            style={{ fontSize: navFontSize, whiteSpace: 'nowrap' }} 
                        >
                            ChainFace
                        </Link>
                    </li>
                    
                    {/* NNM Concept Dropdown (2 Columns) */}
                    <li className="nav-item dropdown position-relative" style={{ zIndex: 1055 }}
                        onMouseEnter={() => setIsNNMConceptOpen(true)}
                        onMouseLeave={() => setIsNNMConceptOpen(false)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Link 
                          href="/nnm-concept"
                          className={`nav-link fw-medium shadow-none desktop-nav-link`}
                          style={{ fontSize: navFontSize, whiteSpace: 'nowrap', padding: '0.5rem 0' }}
                        >
                          NNM Concept
                        </Link>
                        <button 
                          onClick={(e) => { e.preventDefault(); setIsNNMConceptOpen(!isNNMConceptOpen); }}
                          className="btn p-0 border-0 bg-transparent"
                          style={{ fontSize: '9px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Toggle dropdown"
                        >
                          <i className="bi bi-chevron-down" style={{ fontSize: '9px' }}></i>
                        </button>
                      </div>
                      
                      {/* Mega Dropdown Structure */}
                      <div className={`dropdown-menu shadow-lg ${isNNMConceptOpen ? 'show' : ''}`} 
                          style={{ 
                              position: 'absolute',
                              top: '100%',
                              left: '0',
                              backgroundColor: dropdownColor, 
                              border: `1px solid ${subtleBorder}`, 
                              minWidth: '240px', 
                              marginTop: '0px', 
                              padding: '0',
                              borderRadius: '8px',
                              display: isNNMConceptOpen ? 'flex' : 'none',
                              flexDirection: 'row',
                              overflow: 'hidden'
                          }}>
                        
                        {/* Right Column: NNM Concept + How it Works */}
                        <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '6px 0' }}>
                           <Link className="dropdown-item py-2 px-3 dropdown-link-custom" href="/nnm-concept" 
                                style={{ fontSize: dropDownSmallFont, color: '#E0E0E0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                NNM Concept
                           </Link>
                           <Link className="dropdown-item py-2 px-3 dropdown-link-custom" href="/how-it-works" 
                                style={{ fontSize: dropDownSmallFont, color: '#E0E0E0' }}>
                                How it Works
                           </Link>
                        </div>

                        {/* Left Column: Conviction + Registry */}
                        <div style={{ flex: 1, padding: '6px 0' }}>
                           <Link className="dropdown-item py-2 px-3 dropdown-link-custom" href="/conviction-rank" 
                                style={{ fontSize: dropDownSmallFont, color: '#E0E0E0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                Conviction Rank
                           </Link>
                           <Link className="dropdown-item py-2 px-3 dropdown-link-custom" href="/ranking" 
                                style={{ fontSize: dropDownSmallFont, color: '#E0E0E0' }}>
                                Registry Rank
                           </Link>
                        </div>

                      </div>
                    </li>
                </ul>
            </div>

            {/* Desktop Right Side */}
            <div className="d-flex align-items-center justify-content-end gap-2" style={{ flexShrink: 0, marginLeft: '20px' }}> 
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

      {/* MOBILE DRAWER */}
      <div 
        className={`mobile-drawer d-lg-none ${isDrawerOpen ? 'open' : ''}`} 
        style={{ 
            transform: isDrawerOpen ? `translateX(${drawerTranslate}px)` : 'translateX(-100%)',
            boxShadow: 'none', 
            borderRight: 'none',
            backgroundColor: drawerBgColor 
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
          <div style={{
              position: 'absolute',
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '60px', 
              backgroundColor: '#252525', 
              borderTopLeftRadius: '6px',
              borderBottomLeftRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              boxShadow: '-1px 0 4px rgba(0,0,0,0.3)',
              opacity: 1,
              zIndex: 1001
          }}>
              <div style={{ width: '2px', height: '24px', backgroundColor: '#000', borderRadius: '1px', opacity: 0.6 }}></div>
              <div style={{ width: '2px', height: '24px', backgroundColor: '#000', borderRadius: '1px', opacity: 0.6 }}></div>
          </div>

          <div className="drawer-header d-flex align-items-center justify-content-between px-4 pt-4 pb-4 w-100 mt-0 position-relative" 
               style={{ backgroundColor: 'transparent', borderTop: 'none', borderBottom: 'none' }}>
              
              <div className="d-flex align-items-center gap-3">
                 <LogoSVG mobile={true} size={40} />
                 <span className="gold-text-gradient" style={{ fontFamily: 'sans-serif', fontWeight: '800', fontSize: '28px', letterSpacing: '0.5px' }}>NNM</span>
              </div>

              <button onClick={closeDrawer} className="btn p-0 d-flex align-items-center justify-content-center" 
                      style={{ 
                          width: '36px', height: '36px', 
                          borderRadius: '50%', 
                          backgroundColor: 'transparent', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          color: offWhiteText 
                      }}>
                  <i className="bi bi-x" style={{ fontSize: '24px' }}></i>
              </button>
          </div>
          
          <hr className="m-0" style={{ width: '85%', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.05)', opacity: 1 }} />

          <div className="drawer-content px-4 pt-4 pb-5 d-flex flex-column h-100 no-scrollbar" style={{ overflowY: 'auto', backgroundColor: 'transparent' }}>
              <div className="d-flex flex-column w-100 justify-content-start gap-2" style={{ marginTop: '-8px' }}>
                  <div className="d-flex flex-column gap-2">
                    {/* Standard Items */}
                    {menuItems.map((item) => (
                        <Link key={item} 
                                href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={closeDrawer}
                                className="text-decoration-none fw-bold py-1 d-flex align-items-center gap-3"
                                style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                            <i className={`bi ${menuIcons[item]} opacity-75`} style={{ fontSize: '18px' }}></i>
                            {item}
                        </Link>
                    ))}

                    <Link href="/ngx" onClick={closeDrawer} className="text-decoration-none fw-bold py-1 d-flex align-items-center gap-3" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                        <i className="bi bi-activity opacity-75" style={{ fontSize: '18px' }}></i>
                        NGX
                    </Link>

                    <Link href="/mint" onClick={closeDrawer} className="text-decoration-none fw-bold py-1 d-flex align-items-center gap-3" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                        <i className="bi bi-diamond opacity-75" style={{ fontSize: '18px' }}></i>
                        Mint
                    </Link>

                    {/* ChainFace Replaced Contact Here */}
                    <Link href="/chainface" onClick={closeDrawer} className="text-decoration-none fw-bold py-1 d-flex align-items-center gap-3" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                        <i className="bi bi-person-badge opacity-75" style={{ fontSize: '18px' }}></i>
                        ChainFace
                    </Link>

                    <Link href="/nnm-concept" onClick={closeDrawer} className="text-decoration-none fw-bold py-1 d-flex align-items-center gap-3" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                        <i className="bi bi-layers opacity-75" style={{ fontSize: '18px' }}></i>
                        NNM Concept
                    </Link>
                    <Link href="/how-it-works" onClick={closeDrawer} className="text-decoration-none fw-bold py-1 d-flex align-items-center gap-3" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                        <i className="bi bi-info-circle opacity-75" style={{ fontSize: '18px' }}></i>
                        How it Works
                    </Link>
                    <Link href="/conviction-rank" onClick={closeDrawer} className="text-decoration-none fw-bold py-1 d-flex align-items-center gap-3" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                        <i className="bi bi-trophy opacity-75" style={{ fontSize: '18px' }}></i>
                        Conviction Rank
                    </Link>
                  </div>

                  <hr className="m-0" style={{ width: '85%', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.03)', opacity: 1, marginTop: '6px', marginBottom: '6px' }} />

                  {/* Secondary Items (Contact moved here) */}
                  <div className="d-flex flex-column gap-2">
                    {bottomDrawerItems.map((item) => (
                        <Link key={item.label} 
                                href={item.href}
                                onClick={closeDrawer}
                                className="text-decoration-none fw-normal py-1 d-flex align-items-center gap-3"
                                style={{ fontSize: '13px', color: '#888' }}>
                            <i className={`bi ${item.icon}`} style={{ fontSize: '14px', opacity: 0.8 }}></i>
                            {item.label}
                        </Link>
                    ))}
                  </div>
              </div>

              <div className="drawer-footer pt-3 border-top border-secondary border-opacity-10 mt-2 d-flex align-items-center w-100 mb-5">
                  <div className="d-flex justify-content-start align-items-center px-2" style={{ gap: '25px', paddingRight: '80px', width: '100%' }}>
                      
                      {/* X (Twitter) - Updated to Profile Link */}
                      <a href="https://x.com/nnmmarket" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-twitter-x" style={{ fontSize: '20px', color: matteGoldIcon }}></i>
                      </a>

                      {/* Facebook */}
                      <a href="https://www.facebook.com/profile.php?id=61586895007931" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-facebook" style={{ fontSize: '20px', color: matteGoldIcon }}></i>
                      </a>

                      {/* Discord */}
                      <a href="https://discord.gg/gNR8zwgtpc" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-discord" style={{ fontSize: '20px', color: matteGoldIcon }}></i>
                      </a>

                      {/* Medium (Replaces Telegram) */}
                      <a href="https://medium.com/@nftnnmmarket" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-medium" style={{ fontSize: '20px', color: matteGoldIcon }}></i>
                      </a>

                      {/* Instagram */}
                      <a href="https://www.instagram.com/NNM_Assets" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-instagram" style={{ fontSize: '20px', color: matteGoldIcon }}></i>
                      </a>
                      
                  </div>
              </div>

          </div>
      </div>

      {isMobileSearchOpen && (
        <div className="d-lg-none position-absolute start-0 w-100" style={{ top: '64px', zIndex: 1049, backgroundColor: exactDarkColor, padding: '12px 15px', borderBottom: `1px solid ${subtleBorder}` }}>
            <form onSubmit={handleSearch} className="position-relative">
                <input ref={mobileSearchInputRef} type="text" className="form-control text-white shadow-none" placeholder="Search..." 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', fontSize: '14px', height: '42px', paddingLeft: '38px', paddingRight: '35px', border: `1px solid ${subtleBorder}`, caretColor: metallicGoldHex }} 
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
            background-color: ${drawerBgColor};
            z-index: 9999;
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none; 
            scrollbar-width: none; 
        }
      `}</style>
    </nav>
    
    <div style={{ height: '64px' }}></div>
    </>
  );
};

export default Navbar;
