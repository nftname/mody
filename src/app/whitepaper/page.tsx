'use client';
import Link from 'next/link';
import React from 'react';

const GOLD_BASE = '#FCD535';
const GOLD_LIGHT = '#FFF5CC';
const GOLD_DARK = '#B3882A';
const TEXT_OFF_WHITE = '#EAECEF';
const TEXT_BODY_COLOR = '#848E9C';

export default function WhitepaperPage() {
  return (
    <main className="whitepaper-page" style={{ 
      backgroundColor: '#181A20', 
      minHeight: '100vh', 
      paddingBottom: '50px', 
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&family=Satoshi:wght@700;900&family=Orbitron:wght@500;700&display=swap');
        
        .wp-section-title { color: ${GOLD_BASE}; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.4rem; font-family: 'Satoshi', sans-serif; text-transform: uppercase; letter-spacing: 1px; }
        .wp-sub-header { color: ${TEXT_OFF_WHITE}; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.8rem; font-size: 1.1rem; }
        .wp-text { color: ${TEXT_BODY_COLOR}; line-height: 1.7; font-size: 14.5px; margin-bottom: 1.2rem; text-align: justify; }
        .wp-list { list-style: none; padding-left: 0; margin-bottom: 1.5rem; }
        .wp-list li { 
            position: relative; 
            padding-left: 22px; 
            color: ${TEXT_BODY_COLOR}; 
            margin-bottom: 8px; 
            font-size: 14.5px;
            line-height: 1.6;
        }
        .wp-list li::before {
            content: "•";
            color: ${GOLD_BASE};
            font-weight: bold;
            position: absolute;
            left: 0;
            top: 0;
        }
        .token-info-box {
            background-color: rgba(30, 35, 41, 0.5);
            border: 1px solid rgba(252, 213, 53, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .highlight-gold { color: ${GOLD_BASE}; font-weight: 600; }
        .disclaimer-box {
            border-left: 3px solid #5e1139;
            background-color: rgba(94, 17, 57, 0.05);
            padding: 15px 20px;
            margin: 25px 0;
        }
      `}</style>

      <section className="container pt-5">
          <div className="row justify-content-center">
              <div className="col-12 col-lg-10">
                  
                  {/* Header Section */}
                  <div className="text-center mb-5">
                      <h1 className="fw-bold mb-2" 
                          style={{ 
                              fontSize: '3rem', 
                              fontFamily: '"Satoshi", sans-serif',
                              color: TEXT_OFF_WHITE,
                              lineHeight: '1.1'
                          }}>
                        NNM Protocol
                      </h1>
                      <h2 className="fw-light mb-4" style={{ fontSize: '1.2rem', color: GOLD_BASE, letterSpacing: '2px' }}>
                        WHITEPAPER v1.0 | MARCH 2026
                      </h2>
                      <div style={{ width: '80px', height: '3px', backgroundColor: GOLD_BASE, margin: '20px auto' }}></div>
                  </div>

                  {/* Disclaimer Section */}
                  <div className="disclaimer-box">
                      <p className="wp-text" style={{ color: TEXT_OFF_WHITE, marginBottom: 0, fontSize: '13px' }}>
                        <span className="highlight-gold">IMPORTANT NOTICE:</span> NNM Tokens are digital utility units designed for use within the NNM ecosystem. They are not securities, investment contracts, or financial instruments. Participation is voluntary and involves risk. No expectation of profit is implied.
                      </p>
                  </div>

                  {/* 1. Executive Summary */}
                  <h3 className="wp-section-title">1. Executive Summary</h3>
                  <p className="wp-text">
                    The NFT Name Market (NNM) Protocol addresses critical Web3 infrastructure gaps by introducing a decentralized ecosystem for managing and trading digital name assets. At its core, the <span className="highlight-gold">NNM Token</span> powers the ChainFace Identity Layer, bridging digital identities with verifiable blockchain presence.
                  </p>

                  {/* 2. NNM Token Utility */}
                  <h3 className="wp-section-title">2. Token Utility & Functionality</h3>
                  <p className="wp-text">
                    The NNM Token is a pure utility asset deeply integrated into the protocol. It is strictly used for:
                  </p>
                  <ul className="wp-list">
                      <li>Accessing advanced ChainFace Identity features.</li>
                      <li>Minting and acquiring digital name assets in the NNM Market.</li>
                      <li>Powering automated protocol mechanics and usage-based rewards.</li>
                  </ul>

                  {/* 3. Tokenomics */}
                  <h3 className="wp-section-title">3. Ecosystem Tokenomics</h3>
                  <div className="token-info-box">
                      <div className="row">
                          <div className="col-md-6">
                              <p className="wp-text mb-1"><span className="text-white">Total Supply:</span></p>
                              <p className="h4 highlight-gold">10,000,000,000 NNM</p>
                          </div>
                          <div className="col-md-6">
                              <p className="wp-text mb-1"><span className="text-white">Network:</span></p>
                              <p className="h4 text-white">Polygon (PoS)</p>
                          </div>
                      </div>
                  </div>

                  <h4 className="wp-sub-header">Allocation & Vesting</h4>
                  <ul className="wp-list">
                      <li><span className="highlight-gold">35% Early Network Bootstrapping:</span> Allocated to early identity layer participants.</li>
                      <li><span className="highlight-gold">25% Protocol Liquidity:</span> Reserved for DEX liquidity with a 12-month LP lock.</li>
                      <li><span className="highlight-gold">15% Community Rewards:</span> 6-Month Linear Vesting for ecosystem expansion.</li>
                      <li><span className="highlight-gold">15% Strategic Partnerships:</span> Infrastructure and global onboarding initiatives.</li>
                      <li><span className="highlight-gold">10% Core Contributors:</span> Subject to a strict 12-Month Cliff Lock (Until March 2027).</li>
                  </ul>

                  {/* 4. Burn Protocol */}
                  <h3 className="wp-section-title">4. Automated Burn Protocol</h3>
                  <p className="wp-text">
                    To ensure sustainability, the NNM ecosystem incorporates an automated deflationary mechanism directly linked to network activity.
                  </p>
                  <ul className="wp-list">
                      <li><span className="highlight-gold">50% Revenue Burn:</span> Half of all protocol revenue from minting digital names is permanently removed from circulation.</li>
                      <li>This mechanism is driven solely by real technological usage and protocol demand.</li>
                  </ul>

                  {/* 5. Legal & Disclaimer */}
                  <h3 className="wp-section-title">5. Legal Framework & Terms</h3>
                  <p className="wp-text">
                    In accordance with Section 20 of the NNM Terms of Service, users acknowledge that the NNM Token represents no equity, ownership, or financial rights. Digital asset markets are experimental and volatile.
                  </p>
                  <p className="wp-text" style={{ fontStyle: 'italic', fontSize: '13px' }}>
                    By interacting with the NNM Protocol, you confirm that you are acquiring tokens for their internal utility and not as an investment. The protocol does not guarantee market value or secondary market listings.
                  </p>

                  {/* Footer Branding */}
                  <div className="text-center mt-5 pt-4 border-top border-secondary" style={{ opacity: 0.5 }}>
                      <p className="wp-text" style={{ fontSize: '12px' }}>© 2026 NNM MARKET PROTOCOL | BUILT FOR WEB3 PRESENCE</p>
                  </div>

              </div>
          </div>
      </section>
    </main>
  );
}
