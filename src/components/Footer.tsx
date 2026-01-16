'use client';
import Link from 'next/link';

const Footer = () => {
  const headerFontSize = '12px';
  const socialFontSize = '8px'; 
  const generalLinkFontSize = '10px';
  
  const linkColor = 'rgba(255, 255, 255, 0.5)';
  const linkHoverColor = '#FCD535';

  return (
    <footer className="desktop-only-footer" style={{ backgroundColor: '#0B0E11', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '40px 0 20px', marginTop: 'auto' }}>
        <div className="container">
            <div className="row g-3">
                
                {/* SECTION 1: COMMUNITY */}
                <div className="col-6 col-md-3 pe-md-2" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: headerFontSize, letterSpacing: '1px' }}>Community</h6>
                    <div className="d-flex flex-column gap-2">
                        <a href="https://x.com/nnmmarket" target="_blank" rel="noopener noreferrer" className="footer-social-row">
                            <i className="bi bi-twitter-x"></i><span>Twitter</span>
                        </a>
                        <a href="#" className="footer-social-row">
                            <i className="bi bi-discord"></i><span>Discord</span>
                        </a>
                        <a href="https://medium.com/@nftnnmmarket" target="_blank" rel="noopener noreferrer" className="footer-social-row">
                            <i className="bi bi-medium"></i><span>Medium</span>
                        </a>
                        <a href="#" className="footer-social-row">
                            <i className="bi bi-facebook"></i><span>Facebook</span>
                        </a>
                        <a href="https://www.instagram.com/NNM_Assets" target="_blank" rel="noopener noreferrer" className="footer-social-row">
                            <i className="bi bi-instagram"></i><span>Instagram</span>
                        </a>
                    </div>
                </div>

                {/* SECTION 2: MARKETPLACE */}
                <div className="col-6 col-md-3 ps-md-4">
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: headerFontSize, letterSpacing: '1px' }}>Marketplace</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        <li><Link href="/market" className="footer-link-item">Market</Link></li>
                        <li><Link href="/ngx" className="footer-link-item">Analysis (NGX)</Link></li>
                        <li><Link href="/mint" className="footer-link-item">Minting</Link></li>
                        <li><Link href="/ranking" className="footer-link-item">Rankings</Link></li>
                    </ul>
                </div>

                {/* SECTION 3: RESOURCES */}
                <div className="col-6 col-md-3">
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: headerFontSize, letterSpacing: '1px' }}>Resources</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        <li><Link href="/news" className="footer-link-item">News & Updates</Link></li>
                        <li><Link href="/blog" className="footer-link-item">Blog</Link></li>
                        <li><Link href="/nnm-concept" className="footer-link-item">NNM Concept</Link></li>
                        <li><Link href="/contact" className="footer-link-item">Help Center</Link></li>
                    </ul>
                </div>

                {/* SECTION 4: COMPANY */}
                <div className="col-6 col-md-3">
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: headerFontSize, letterSpacing: '1px' }}>Company</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        <li><Link href="/about" className="footer-link-item">About Us</Link></li>
                        <li><Link href="/affiliate" className="footer-link-item">Affiliate Program</Link></li>
                        <li><Link href="/legal" className="footer-link-item">Legal & Terms</Link></li>
                        <li><Link href="/contact" className="footer-link-item">Contact</Link></li>
                    </ul>
                </div>

            </div>
            
            <div className="row mt-5 pt-3 border-top border-secondary" style={{ borderColor: 'rgba(255, 255, 255, 0.05) !important' }}>
                <div className="col-12 text-center text-secondary" style={{ fontSize: '10px' }}>
                    &copy; 2025 NNM NFT Digital Name Asset. All rights reserved.
                </div>
            </div>
        </div>

        <style jsx>{`
            /* Social Rows Style */
            .footer-social-row { 
                display: flex; align-items: center; gap: 8px; 
                color: ${linkColor}; 
                text-decoration: none; 
                font-size: ${socialFontSize} !important; 
                font-weight: 400 !important;
                line-height: 1.5;
                transition: all 0.2s ease; 
            }
            .footer-social-row:hover { color: #fff; transform: translateX(5px); }
            .footer-social-row i { color: ${linkHoverColor}; font-size: 11px !important; } 
            
            /* General Links Style */
            .footer-link-item { 
                display: inline-block;
                text-decoration: none; 
                color: ${linkColor}; 
                font-size: ${generalLinkFontSize} !important; 
                font-weight: 400 !important;
                line-height: 1.5;
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
