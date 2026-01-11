'use client';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="desktop-only-footer" style={{ backgroundColor: '#0b0e11', borderTop: '1px solid #111', padding: '40px 0 20px', marginTop: 'auto' }}>
        <div className="container">
            <div className="row g-4">
                
                {/* SECTION 1: MARKETPLACE */}
                <div className="col-6 col-md-3">
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Marketplace</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        <li><Link href="/market" className="footer-link-item">Market</Link></li>
                        <li><Link href="/ngx" className="footer-link-item">Analysis (NGX)</Link></li>
                        <li><Link href="/mint" className="footer-link-item">Minting</Link></li>
                        <li><Link href="/ranking" className="footer-link-item">Rankings</Link></li>
                    </ul>
                </div>

                {/* SECTION 2: RESOURCES */}
                <div className="col-6 col-md-3">
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Resources</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        {/* Help Center موجه لصفحة Contact */}
                        <li><Link href="/contact" className="footer-link-item">Help Center</Link></li> 
                        <li><Link href="/blog" className="footer-link-item">Blog</Link></li>
                        <li><Link href="/news" className="footer-link-item">News & Updates</Link></li>
                    </ul>
                </div>

                {/* SECTION 3: COMPANY */}
                <div className="col-6 col-md-3">
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Company</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        <li><Link href="/about" className="footer-link-item">About Us</Link></li>
                        {/* Careers الآن هي صفحة نظام الأفلييت */}
                        <li><Link href="/careers" className="footer-link-item">Affiliate Program</Link></li>
                        <li><Link href="/legal" className="footer-link-item">Legal & Terms</Link></li>
                        <li><Link href="/contact" className="footer-link-item">Contact</Link></li>
                    </ul>
                </div>

                {/* SECTION 4: SOCIALS */}
                <div className="col-6 col-md-3 ps-md-4" style={{ borderLeft: '1px solid #1a1a1a' }}>
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Community</h6>
                    <div className="d-flex flex-column gap-2">
                        <a href="#" className="footer-social-row"><i className="bi bi-twitter-x"></i><span>Twitter</span></a>
                        <a href="#" className="footer-social-row"><i className="bi bi-discord"></i><span>Discord</span></a>
                        <a href="#" className="footer-social-row"><i className="bi bi-instagram"></i><span>Instagram</span></a>
                    </div>
                </div>

            </div>
            
            <div className="row mt-5 pt-3 border-top border-secondary" style={{ borderColor: '#1a1a1a !important' }}>
                <div className="col-12 text-center text-secondary" style={{ fontSize: '10px' }}>
                    &copy; 2025 NNM NFT Name Market. All rights reserved.
                </div>
            </div>
        </div>

        <style jsx>{`
            .footer-social-row { 
                display: flex; align-items: center; gap: 10px; 
                color: rgba(255, 255, 255, 0.5); 
                text-decoration: none; font-size: 13px; 
                transition: all 0.2s ease; 
            }
            .footer-social-row:hover { color: #fff; transform: translateX(5px); }
            .footer-social-row i { color: #FCD535; font-size: 14px; } 
            
            .footer-link-item { 
                text-decoration: none; 
                color: rgba(255, 255, 255, 0.6); 
                font-size: 13px; 
                transition: color 0.2s; 
            }
            .footer-link-item:hover { color: #FCD535; }
            
            @media (max-width: 768px) {
                .desktop-only-footer { display: none !important; }
            }
        `}</style>
    </footer>
  );
};

export default Footer;
