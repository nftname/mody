'use client';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#0b0e11', borderTop: '1px solid #111', padding: '30px 0 15px', marginTop: 'auto' }}>
        <div className="container">
            <div className="row g-4">
                
                {/* SECTION 1: SOCIALS */}
                <div className="col-6 col-md-2" style={{ borderRight: '1px solid #111' }}>
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Community</h6>
                    <div className="d-flex flex-column gap-2">
                        <a href="#" className="footer-social-row"><i className="bi bi-twitter-x" style={{ fontSize: '14px' }}></i><span>Twitter</span></a>
                        <a href="#" className="footer-social-row"><i className="bi bi-discord" style={{ fontSize: '14px' }}></i><span>Discord</span></a>
                        <a href="#" className="footer-social-row"><i className="bi bi-linkedin" style={{ fontSize: '14px' }}></i><span>LinkedIn</span></a>
                        <a href="#" className="footer-social-row"><i className="bi bi-facebook" style={{ fontSize: '14px' }}></i><span>Facebook</span></a>
                        <a href="#" className="footer-social-row"><i className="bi bi-instagram" style={{ fontSize: '14px' }}></i><span>Instagram</span></a>
                    </div>
                </div>

                {/* SECTION 2: MARKETPLACE (LINKED) */}
                <div className="col-6 col-md-3 ps-md-4">
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Marketplace</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        {/* ✅ الروابط تم تفعيلها هنا */}
                        <li><Link href="/market" className="footer-link-item" style={{ fontSize: '13px' }}>Market</Link></li>
                        <li><Link href="/dashboard" className="footer-link-item" style={{ fontSize: '13px' }}>Analytics</Link></li>
                        <li><Link href="/mint" className="footer-link-item" style={{ fontSize: '13px' }}>Minting</Link></li>
                        <li><Link href="/market" className="footer-link-item" style={{ fontSize: '13px' }}>Rankings</Link></li>
                    </ul>
                </div>

                {/* SECTION 3: RESOURCES */}
                <div className="col-6 col-md-3">
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Resources</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        <li><Link href="/help" className="footer-link-item" style={{ fontSize: '13px' }}>Help Center</Link></li>
                        <li><Link href="/partners" className="footer-link-item" style={{ fontSize: '13px' }}>Partners</Link></li>
                        <li><Link href="/blog" className="footer-link-item" style={{ fontSize: '13px' }}>Blog</Link></li>
                        <li><Link href="/newsletter" className="footer-link-item" style={{ fontSize: '13px' }}>Newsletter</Link></li>
                    </ul>
                </div>

                {/* SECTION 4: COMPANY */}
                <div className="col-6 col-md-4">
                    <h6 className="fw-bold mb-3 text-white text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Company</h6>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        <li><Link href="/about" className="footer-link-item" style={{ fontSize: '13px' }}>About Us</Link></li>
                        <li><Link href="/careers" className="footer-link-item" style={{ fontSize: '13px' }}>Careers</Link></li>
                        <li><Link href="/legal" className="footer-link-item" style={{ fontSize: '13px' }}>Legal</Link></li>
                        <li><Link href="/contact" className="footer-link-item" style={{ fontSize: '13px' }}>Contact</Link></li>
                    </ul>
                </div>

            </div>
            
            <div className="row mt-5 pt-3 border-top border-secondary" style={{ borderColor: '#111 !important' }}>
                <div className="col-12 text-center text-white-50" style={{ fontSize: '10px' }}>
                    &copy; 2025 NNM NFT Name Market. All rights reserved.
                </div>
            </div>
        </div>

        <style jsx>{`
            .footer-social-row { display: flex; align-items: center; gap: 10px; color: rgba(255, 255, 255, 0.5); text-decoration: none; font-size: 13px; transition: all 0.2s ease; }
            .footer-social-row:hover { color: #fff; padding-left: 5px; }
            .footer-social-row i { color: #FCD535; } 
            .footer-social-row:hover i { color: #fff; }
            .footer-link-item { text-decoration: none; color: rgba(255, 255, 255, 0.6); transition: color 0.2s; }
            .footer-link-item:hover { color: #FCD535; }
        `}</style>
    </footer>
  );
};

export default Footer;