'use client';
import Link from 'next/link';

const Footer = () => {
  const headerFontSize = '14px';     
  const socialFontSize = '13px';       
  const standardLinkFontSize = '9px';
  
  const linkColor = 'rgba(255, 255, 255, 0.5)';
  const linkHoverColor = '#FCD535';

  return (
    <footer className="desktop-only-footer">
        <div className="container">
            <div className="row g-3">
                
                <div className="col-6 col-md-3 pe-md-2" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: headerFontSize, letterSpacing: '1px' }}>Community</h6>
                    <div className="d-flex flex-column gap-2">
                        <a href="https://x.com/nnmmarket" target="_blank" rel="noopener noreferrer" className="footer-social-row">
                            <i className="bi bi-twitter-x"></i><span>Twitter</span>
                        </a>
                        <a href="https://t.me/NFTNNM" target="_blank" rel="noopener noreferrer" className="footer-social-row">
                            <i className="bi bi-telegram"></i><span>Telegram</span>
                        </a>
                        <a href="https://discord.gg/gNR8zwgtpc" target="_blank" rel="noopener noreferrer" className="footer-social-row">
                            <i className="bi bi-discord"></i><span>Discord</span>
                        </a>
                        <a href="https://www.facebook.com/profile.php?id=61586895007931" target="_blank" rel="noopener noreferrer" className="footer-social-row">
                            <i className="bi bi-facebook"></i><span>Facebook</span>
                        </a>
                        <a href="https://www.instagram.com/NNM_Assets" target="_blank" rel="noopener noreferrer" className="footer-social-row">
                            <i className="bi bi-instagram"></i><span>Instagram</span>
                        </a>
                        <a href="https://medium.com/@nftnnmmarket" target="_blank" rel="noopener noreferrer" className="footer-social-row">
                            <i className="bi bi-medium"></i><span>Medium</span>
                        </a>
                    </div>
                </div>

                <div className="col-6 col-md-3 ps-md-4">
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: headerFontSize, letterSpacing: '1px' }}>Marketplace</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        <li><Link href="/market" className="footer-link-item">Market</Link></li>
                        <li><Link href="/nfx" className="footer-link-item">Analysis (NFX)</Link></li>
                        <li><Link href="/conviction-rank" className="footer-link-item">Conviction Rank</Link></li>
                        <li><Link href="/ranking" className="footer-link-item">Registry Rank</Link></li>
                    </ul>
                </div>

                <div className="col-6 col-md-3">
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: headerFontSize, letterSpacing: '1px' }}>Resources</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        <li><Link href="/news" className="footer-link-item">News & Updates</Link></li>
                        <li><Link href="/market-indices" className="footer-link-item">Market Indices</Link></li>
                        <li><Link href="/how-it-works" className="footer-link-item">How it Works</Link></li>
                        <li><Link href="/blog" className="footer-link-item">Blog</Link></li>
                    </ul>
                </div>

                <div className="col-6 col-md-3">
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: headerFontSize, letterSpacing: '1px' }}>Company</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        <li><Link href="/Rewards" className="footer-link-item">NNM Rewards</Link></li>
                        <li><Link href="/affiliate" className="footer-link-item">Affiliate Program</Link></li>
                        <li><Link href="/legal" target="_blank" className="footer-link-item">Legal & Terms</Link></li>
                        <li><Link href="/contact" className="footer-link-item">Contact</Link></li>
                    </ul>
                </div>

            </div>
            
            <div className="row mt-5 pt-3 border-top border-secondary" style={{ borderColor: 'rgba(255, 255, 255, 0.05) !important' }}>
                <div className="col-12 text-center text-secondary" style={{ fontSize: '10px' }}>
                    &copy; 2026 NNM Digital Name Assets Market. All rights reserved.
                </div>
            </div>
        </div>

        <style jsx>{`
            .desktop-only-footer {
                position: relative;
                overflow: hidden;
                background: linear-gradient(to bottom, #050a16 0%, #050a16 100%);
                border-top: 1px solid rgba(59, 130, 246, 0.15);
                padding: 40px 0 20px;
                margin-top: auto;
            }

            .desktop-only-footer::before {
                content: '';
                position: absolute;
                top: 0;
                right: -100%;
                width: 100%;
                height: 2px;
                background: linear-gradient(270deg, transparent, rgba(59, 130, 246, 0.8), transparent);
                animation: tech-wave-rtl 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                z-index: 1;
            }

            .desktop-only-footer::after {
                content: '';
                position: absolute;
                top: 0;
                right: -100%;
                width: 50%;
                height: 100%;
                background: linear-gradient(270deg, transparent, rgba(59, 130, 246, 0.02), transparent);
                animation: light-sweep-rtl 8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                pointer-events: none;
            }

            @keyframes tech-wave-rtl {
                0% { right: -100%; }
                100% { right: 100%; }
            }

            @keyframes light-sweep-rtl {
                0% { right: -100%; }
                100% { right: 100%; }
            }

            .footer-social-row { 
                display: flex; align-items: center; gap: 10px; 
                color: ${linkColor}; 
                text-decoration: none; 
                font-size: ${socialFontSize};
                transition: all 0.2s ease; 
            }
            .footer-social-row:hover { color: #fff; transform: translateX(5px); }
            .footer-social-row i { color: ${linkHoverColor}; font-size: 14px; } 
            
            .footer-link-item { 
                text-decoration: none; 
                color: ${linkColor}; 
                font-size: ${standardLinkFontSize}; 
                transition: color 0.2s; 
            }
            .footer-link-item:hover { color: ${linkHoverColor}; }
            
            @media (max-width: 768px) {
                .desktop-only-footer { display: none !important; }
            }
        `}</style>
    </footer>
  );
};

export default Footer;
