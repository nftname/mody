'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { defineChain } from "thirdweb";
import { client } from "@/lib/client";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const account = useActiveAccount();
  const chain = defineChain(137); 

  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
    setIsInsightsOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (item: string, e: React.MouseEvent) => {
    if (item === 'Portfolio') {
        e.preventDefault();
        router.push('/dashboard');
    }
    closeMenu();
  };

  const handlePortfolioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/dashboard');
    closeMenu();
  };

  const goldButtonStyle = {
    background: 'linear-gradient(135deg, #F0B90B 0%, #FCD535 50%, #F0B90B 100%)',
    color: '#000',
    border: '1px solid #b3882a',
    fontWeight: '700' as const,
    fontSize: '12px',
    height: '38px',
    borderRadius: '8px',
    minWidth: '120px',
  };

  const portfolioBtnStyle = {
    color: '#FCD535', 
    border: '1px solid #FCD535', 
    borderRadius: '4px', 
    height: '38px',
    fontSize: '12px', 
    fontWeight: '600', 
    background: 'transparent', 
    padding: '0 10px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer', 
    transition: 'all 0.2s', 
    width: '45px',
    whiteSpace: 'nowrap' as const
  };

  const navbarBgColor = '#0b0e11';
  const menuItems = ['Home', 'Market', 'NGX', 'Mint', 'NNM Concept'];

  return (
    <>
    <nav className="navbar navbar-expand-lg sticky-top border-bottom border-secondary py-0 position-relative" 
         style={{ backgroundColor: navbarBgColor, zIndex: 1050, height: '60px', paddingRight: '5px' }}>
      
      <div className="container-fluid px-2 h-100 align-items-center d-flex flex-nowrap">
        
        <div className="d-flex align-items-center" style={{ minWidth: '80px', flexShrink: 1, overflow:'hidden' }}> 
            <Link href="/" className="navbar-brand d-flex align-items-center gap-2 m-0 p-0" onClick={closeMenu} style={{ textDecoration: 'none' }}> 
              <svg width="29" height="29" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
                <defs>
                  <linearGradient id="blockGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF5CC" />
                    <stop offset="20%" stopColor="#FCD535" />
                    <stop offset="80%" stopColor="#B3882A" />
                  </linearGradient>
                  <filter id="innerEtch" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.8" />
                  </filter>
                </defs>
                <g filter="url(#innerEtch)">
                    <path d="M256 20 L356 120 L256 220 L156 120 Z" fill="url(#blockGold)" />
                    <path d="M156 120 L256 220 L256 240 L156 140 Z" fill="#9E7C0C" />
                    <path d="M256 292 L356 392 L256 492 L156 392 Z" fill="url(#blockGold)" />
                    <path d="M356 392 L256 492 L256 472 L356 372 Z" fill="#5C4004" opacity="0.5" />
                    <path d="M120 156 L220 256 L120 356 L20 256 Z" fill="url(#blockGold)" />
                    <path d="M392 156 L492 256 L392 356 L292 256 Z" fill="url(#blockGold)" />
                    <circle cx="256" cy="256" r="10" fill="#0b0e11" />
                </g>
              </svg>
              <span style={{ fontFamily: 'sans-serif', fontWeight: '800', fontSize: '20px', background: 'linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px', lineHeight: '1', marginTop: '1px' }}>NNM</span>
            </Link>
        </div>

        <div className="d-flex d-lg-none align-items-center ms-auto gap-2 flex-nowrap" style={{ overflow: 'visible' }}>
            <button className="btn p-1 border-0" onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} style={{ width: '28px' }}>
                <i className="bi bi-search" style={{ fontSize: '16px', color: '#FCD535' }}></i>
            </button>

            <button className="btn p-0 d-flex align-items-center justify-content-center" onClick={handlePortfolioClick}
                style={{ width: '32px', height: '32px', border: '1px solid #FCD535', borderRadius: '8px', color: '#FCD535', backgroundColor: 'transparent', flexShrink: 0 }}>
                <i className="bi bi-person-circle" style={{ fontSize: '18px' }}></i>
            </button>

            <div style={{ transform: 'scale(0.85)', transformOrigin: 'right center' }}>
                <ConnectButton 
                    client={client}
                    chain={chain}
                    theme="dark"
                    connectButton={{
                        label: "Connect",
                        style: {
                            ...goldButtonStyle,
                            height: '32px',
                            minWidth: 'auto',
                            fontSize: '12px',
                            padding: '0 10px'
                        }
                    }}
                    detailsButton={{
                        style: {
                            ...goldButtonStyle,
                            height: '32px',
                            minWidth: 'auto',
                            padding: '0 10px'
                        }
                    }}
                />
            </div>

            <button className="navbar-toggler border-0 p-0 shadow-none ms-1" type="button" onClick={toggleMenu} style={{ width: '24px' }}>
                {isMenuOpen ? <i className="bi bi-x-lg text-white" style={{ fontSize: '24px' }}></i> : <i className="bi bi-list text-white" style={{ fontSize: '24px' }}></i>}
            </button>
        </div>

        <div className={`collapse navbar-collapse flex-grow-1 ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
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
                    
                    <li 
                        className="nav-item dropdown w-100 w-lg-auto" 
                        style={{ zIndex: 1055 }}
                        onMouseEnter={() => setIsInsightsOpen(true)}
                        onMouseLeave={() => setIsInsightsOpen(false)}
                    >
                      <a 
                        className={`nav-link dropdown-toggle fw-semibold shadow-none desktop-nav-link ${isInsightsOpen ? 'show' : ''}`} 
                        href="#" 
                        role="button" 
                        onClick={(e) => { e.preventDefault(); setIsInsightsOpen(!isInsightsOpen); }}
                        style={{ fontSize: '13px', padding: '8px 8px', whiteSpace: 'nowrap' }}
                      >
                        Insights
                      </a>
                      <ul className={`dropdown-menu border-secondary shadow-lg py-1 ${isInsightsOpen ? 'show' : ''}`} 
                          style={{ backgroundColor: '#161b22', minWidth: '150px', marginTop: '0px', border: '1px solid #333' }}>
                        {['How it Works', 'Contact'].map((subItem) => (
                            <li key={subItem}>
                                <Link 
                                    className="dropdown-item text-white py-2 px-3" 
                                    href={`/${subItem.toLowerCase().replace(/\s+/g, '-')}`} 
                                    onClick={closeMenu} 
                                    style={{ fontSize: '11px', transition: '0.2s' }}
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
                
                <div className="position-relative" style={{ width: '200px', height: '38px', flexShrink: 0 }}>
                   <input type="text" className="form-control search-input-custom text-white shadow-none" placeholder="Search..." style={{ borderRadius: '8px', fontSize:'13px', height: '100%', paddingLeft: '30px', border: '1px solid rgba(252, 213, 53, 0.9)', boxShadow: '0 0 5px rgba(252, 213, 53, 0.1)', caretColor: '#FCD535' }} />
                   <i className="bi bi-search position-absolute text-secondary" style={{top: '50%', transform: 'translateY(-50%)', left: '10px', fontSize: '12px', color: '#FCD535 !important'}}></i>
                </div>
                
                <button 
                    onClick={handlePortfolioClick} 
                    className="btn" 
                    style={portfolioBtnStyle} 
                    title="Go to Dashboard"
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(252, 213, 53, 0.1)'; }} 
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                    <i className="bi bi-person-circle" style={{fontSize: '20px'}}></i>
                </button>

                <ConnectButton 
                    client={client}
                    chain={chain}
                    theme="dark"
                    connectButton={{
                        style: goldButtonStyle,
                    }}
                    detailsButton={{
                        style: goldButtonStyle,
                    }}
                />
            </div>
          </div>
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="d-lg-none position-absolute start-0 w-100 border-bottom border-secondary" style={{ top: '60px', zIndex: 1049, backgroundColor: navbarBgColor, padding: '12px 15px' }}>
            <div className="position-relative">
                <input ref={mobileSearchInputRef} type="text" className="form-control bg-dark text-white shadow-none" placeholder="Search collections..." style={{ borderRadius: '4px', fontSize: '14px', height: '42px', paddingLeft: '38px', paddingRight: '35px', border: '1px solid var(--unified-gold-color)', caretColor: '#FCD535' }} />
                <i className="bi bi-search position-absolute" style={{ top: '50%', left: '12px', transform: 'translateY(-50%)', fontSize: '16px', color: 'var(--unified-gold-color)' }}></i>
                <button onClick={() => setIsMobileSearchOpen(false)} className="btn btn-link position-absolute text-secondary text-decoration-none p-0" style={{ top: '50%', right: '12px', transform: 'translateY(-50%)' }}><i className="bi bi-x-lg" style={{ fontSize: '16px' }}></i></button>
            </div>
        </div>
      )}

      {isMenuOpen && ( <div onClick={closeMenu} className="d-lg-none" style={{ position: 'fixed', top: '60px', left: 0, width: '100vw', height: 'calc(100vh - 60px)', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 1040 }}></div> )}

      <style jsx global>{`
        .desktop-nav-link { color: #ffffff !important; transition: color 0.2s ease, padding 0.3s; }
        .desktop-nav-link:hover, .desktop-nav-link.active { color: #FCD535 !important; }
        .text-gold { color: #FCD535 !important; }
        .dropdown-item:hover, .dropdown-item:focus { background-color: #2b3139 !important; color: #FCD535 !important; }
        .nav-link:focus, .nav-link:active { color: #FCD535 !important; outline: none !important; box-shadow: none !important; }
        .navbar-toggler:focus { box-shadow: none !important; }
        .search-input-custom { background-color: #161b22 !important; transition: background-color 0.3s ease; }
        .search-input-custom:focus { background-color: ${navbarBgColor} !important; border-color: #FCD535 !important; }
        @media (max-width: 991px) { 
            .nav-link { color: #ffffff !important; border-bottom: 1px solid #222; width: 100%; text-align: left; padding-left: 0 !important; }
            .nav-link:hover, .nav-link.active { color: #FCD535 !important; padding-left: 10px !important; transition: 0.3s; }
            .navbar-collapse { background-color: ${navbarBgColor} !important; position: absolute; top: 60px; left: 0; width: 100%; padding: 20px; border-bottom: 2px solid #FCD535 !important; box-shadow: 0 20px 40px rgba(0,0,0,0.9); z-index: 9990; max-height: 50vh; overflow-y: auto; }
            .dropdown-menu { background-color: #161b22 !important; border: 1px solid #333 !important; }
            .dropdown-menu.show { display: block; position: static; width: 100%; margin-top: 5px; margin-bottom: 10px; }
        }
      `}</style>
    </nav>
    </>
  );
};

export default Navbar;
