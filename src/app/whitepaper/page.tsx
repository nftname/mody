'use client';
import React from 'react';

// --- LIGHT THEME COLORS ---
const GOLD_ACCENT = '#B8860B'; // Darker gold for better contrast on white
const TEXT_MAIN = '#1A202C';   // Soft black for headings
const TEXT_BODY = '#4A5568';   // Slate gray for body text
const BG_MAIN = '#F7F9FA';     // Broken white (Off-white) for the background
const BG_SURFACE = '#FFFFFF';  // Pure white for cards/disclaimer boxes
const BORDER_LIGHT = 'rgba(0, 0, 0, 0.08)';

export default function WhitepaperPage() {
  return (
        <main className="whitepaper-page" style={{ 
          backgroundColor: BG_MAIN, 
          minHeight: '100vh', 
          paddingBottom: '80px', 
          fontFamily: '"Inter", "Segoe UI", sans-serif',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          overflowX: 'hidden'
        }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .whitepaper-page h1, 
        .whitepaper-page h2, 
        .whitepaper-page h3, 
        .whitepaper-page h4, 
        .whitepaper-page p, 
        .whitepaper-page li {
            margin: 0;
            padding: 0;
        }

        .wp-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 4rem 2rem;
            width: 100%;
            box-sizing: border-box;
            overflow-wrap: break-word;
        }

        @media (max-width: 768px) {
            .wp-container {
                padding: 2rem 1.2rem;
            }
            .wp-main-title {
                font-size: 1.8rem;
            }
            .wp-section-title {
                font-size: 1.35rem;
            }
            .wp-text, .wp-list li {
                font-size: 0.95rem;
            }
        }

        .wp-header {
            margin-bottom: 4rem;
            border-bottom: 1px solid ${BORDER_LIGHT};
            padding-bottom: 2rem;
        }

        .wp-main-title {
            color: ${TEXT_MAIN};
            font-size: 2.5rem;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 0.5rem;
        }

        .wp-subtitle {
            color: ${TEXT_BODY};
            font-size: 1rem;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .wp-disclaimer {
            background-color: ${BG_SURFACE};
            border-left: 3px solid ${GOLD_ACCENT};
            padding: 1.5rem;
            margin-bottom: 3rem;
            border-radius: 0 8px 8px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        .wp-disclaimer-title {
            color: ${TEXT_MAIN};
            font-size: 0.95rem;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
            letter-spacing: 0.5px;
        }

        .wp-section {
            margin-bottom: 3.5rem;
        }

        .wp-section-title { 
            color: ${TEXT_MAIN}; 
            font-weight: 700; 
            font-size: 1.6rem; 
            margin-bottom: 1.5rem;
            letter-spacing: -0.3px;
            text-transform: uppercase;
        }

        .wp-sub-title {
            color: ${TEXT_MAIN};
            font-weight: 600;
            font-size: 1.15rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }

        .wp-text { 
            color: ${TEXT_BODY}; 
            line-height: 1.8; 
            font-size: 1.05rem; 
            margin-bottom: 1.2rem; 
            font-weight: 400;
        }

        .wp-text strong {
            color: ${TEXT_MAIN};
            font-weight: 600;
        }

        .wp-list { 
            list-style: none; 
            padding-left: 0; 
            margin-top: 1rem;
            margin-bottom: 1.5rem; 
        }

        .wp-list li { 
            position: relative; 
            padding-left: 24px; 
            color: ${TEXT_BODY}; 
            margin-bottom: 0.8rem; 
            font-size: 1.05rem;
            line-height: 1.6;
            font-weight: 400;
        }

        .wp-list li strong {
            color: ${TEXT_MAIN};
            font-weight: 600;
        }

        .wp-list li::before {
            content: "";
            position: absolute;
            left: 0;
            top: 10px;
            width: 6px;
            height: 6px;
            background-color: ${GOLD_ACCENT};
            border-radius: 50%;
        }

        .wp-stats-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
            background-color: ${BG_SURFACE};
            padding: 2rem;
            border-radius: 8px;
            margin: 2rem 0;
            border: 1px solid ${BORDER_LIGHT};
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }

        @media (min-width: 768px) {
            .wp-stats-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        .wp-stat-label {
            color: ${TEXT_BODY};
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.4rem;
            font-weight: 600;
        }

        .wp-stat-value {
            color: ${TEXT_MAIN};
            font-size: 1.1rem;
            font-weight: 700;
        }

        /* Table Styles Added for Tokenomics Schedule */
       .wp-table-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin: 2rem 0;
            border-radius: 8px;
            border: 1px solid ${BORDER_LIGHT};
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
            width: 100%;
            display: block;
        }

        .wp-table {
            width: 100%;
            border-collapse: collapse;
            background-color: ${BG_SURFACE};
            min-width: 600px;
        }

        .wp-table th, .wp-table td {
            padding: 1rem 1.2rem;
            text-align: left;
            border-bottom: 1px solid ${BORDER_LIGHT};
            color: ${TEXT_BODY};
            font-size: 0.95rem;
            line-height: 1.5;
        }

        .wp-table th {
            background-color: #F8FAFC;
            color: ${TEXT_MAIN};
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.85rem;
        }

        .wp-table tr:last-child td {
            border-bottom: none;
        }

        .wp-footer {
            margin-top: 5rem;
            padding-top: 2rem;
            border-top: 1px solid ${BORDER_LIGHT};
            text-align: left;
        }

        .wp-footer-text {
            color: ${TEXT_BODY};
            font-size: 0.85rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
      `}</style>

      <div className="wp-container">
          
          <header className="wp-header">
              <h1 className="wp-main-title">Nexus Name Market (NNM)</h1>
              <h2 className="wp-subtitle">Whitepaper v2.1 — The Identity Layer & Utility Economy on Solana</h2>
          </header>

          <section className="wp-section">
              <h3 className="wp-section-title">1. Abstract</h3>
              <p className="wp-text">
                Nexus Name Market (NNM) is a decentralized identity layer designed to bridge cross-chain interaction through Digital Name Assets (DNA). Originally conceptualized on Polygon, the NNM utility token has migrated to the Solana Network to leverage high-speed infrastructure and low-latency transaction finality. While the identity registration layer (ChainFace) remains on Polygon for structural consistency, the $NNM token serves as a core utility component within the ecosystem, enabling seamless interaction across protocol functionalities.
              </p>
              <p className="wp-text">
                The NNM Protocol is designed to transform digital names into functional, verifiable, and transferable on-chain identifiers, supporting decentralized identity infrastructure across multiple blockchain environments.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">2. Core Ecosystem Components</h3>
              
              <h4 className="wp-sub-title">2.1 ChainFace Identity Profiles</h4>
              <p className="wp-text">
                ChainFace is the foundational identity layer on the Polygon network. It transforms traditional NFTs into hyper-functional Web3 IDs, enabling cross-chain payment dashboards, identity verification primitives, and persistent on-chain presence.
              </p>

              <h4 className="wp-sub-title">2.2 The NFX Global Index</h4>
              <p className="wp-text">
                The NFX Index acts as a data-driven observatory for the NFT and digital asset sector, providing aggregated insights into ecosystem activity, network behavior, and digital asset dynamics.
              </p>

              <h4 className="wp-sub-title">2.3 Conviction Rank</h4>
              <p className="wp-text">
                A sybil-resistant ranking system that prioritizes authentic user participation, rewarding long-term ecosystem engagement over artificial or manipulated activity patterns.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">3. Tokenomics ($NNM – Solana)</h3>
              <p className="wp-text">
                The $NNM token is a native SPL utility token deployed on the Solana Blockchain. It is designed exclusively for use within the NNM ecosystem and its associated protocol functionalities.
              </p>
              
              <h4 className="wp-sub-title">Core Parameters</h4>
              <div className="wp-stats-grid">
                  <div>
                      <div className="wp-stat-label">Total Supply</div>
                      <div className="wp-stat-value">1,000,000,000 $NNM</div>
                  </div>
                  <div>
                      <div className="wp-stat-label">Genesis Date</div>
                      <div className="wp-stat-value">April 22, 2026</div>
                  </div>
                  <div>
                      <div className="wp-stat-label">Presale Duration</div>
                      <div className="wp-stat-value">30 Days</div>
                  </div>
              </div>

              <h4 className="wp-sub-title">3.1 Allocation & Vesting Schedule</h4>
              <div className="wp-table-container">
                  <table className="wp-table">
                      <thead>
                          <tr>
                              <th>Category</th>
                              <th>Allocation</th>
                              <th>Total Tokens</th>
                              <th>Vesting Schedule</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td><strong>Presale Allocation</strong></td>
                              <td>30%</td>
                              <td>300,000,000</td>
                              <td>40% unlocked at TGE; remaining released linearly over 60 days</td>
                          </tr>
                          <tr>
                              <td><strong>Liquidity Pool</strong></td>
                              <td>15%</td>
                              <td>150,000,000</td>
                              <td>100% locked for 365 days post-listing</td>
                          </tr>
                          <tr>
                              <td><strong>Platform Rewards & Ecosystem</strong></td>
                              <td>34%</td>
                              <td>340,000,000</td>
                              <td>5% unlocked at TGE; remaining released linearly over 12 months</td>
                          </tr>
                          <tr>
                              <td><strong>Treasury & Growth</strong></td>
                              <td>8%</td>
                              <td>80,000,000</td>
                              <td>5% unlocked at TGE; remaining 3% released linearly over 12 months</td>
                          </tr>
                          <tr>
                              <td><strong>Team Allocation</strong></td>
                              <td>5%</td>
                              <td>50,000,000</td>
                              <td>6-month cliff; then linear vesting over 12 months</td>
                          </tr>
                          <tr>
                              <td><strong>Development Fund</strong></td>
                              <td>5%</td>
                              <td>50,000,000</td>
                              <td>6-month cliff; then linear vesting over 12 months</td>
                          </tr>
                          <tr>
                              <td><strong>Emergency Reserve</strong></td>
                              <td>3%</td>
                              <td>30,000,000</td>
                              <td>Available via multi-signature treasury wallet</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">4. Deflationary Protocol</h3>
              <p className="wp-text">
                To support long-term ecosystem sustainability and align token supply with real protocol usage, NNM implements an automated usage-based deflationary mechanism.
              </p>
              <ul className="wp-list">
                  <li><strong>10% Usage-Based Burn:</strong> 10% of all protocol revenue generated from internal platform activity (including digital name minting) is permanently removed from circulation.</li>
                  <li><strong>Dynamic Supply Adjustment:</strong> This mechanism operates continuously based on actual network activity, ensuring that token supply evolves in alignment with real usage rather than speculative demand.</li>
                  <li><strong>Protocol Integrity:</strong> The burn process is executed through predefined smart contract logic, ensuring transparency, consistency, and verifiability.</li>
              </ul>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">5. Security & Transparency</h3>
              <p className="wp-text">
                All token allocations, vesting schedules, and liquidity mechanisms are enforced through publicly verifiable smart contracts deployed on the Solana blockchain.
              </p>
              <p className="wp-text">These mechanisms ensure:</p>
              <ul className="wp-list">
                  <li>Transparent and immutable token distribution</li>
                  <li>Enforced vesting and lock-up schedules</li>
                  <li>Liquidity protection through time-locked smart contracts</li>
                  <li>Verifiable burn mechanics and on-chain activity tracking</li>
              </ul>
              <p className="wp-text">
                All relevant contract activity may be independently verified through publicly accessible blockchain explorers.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">6. Legal Notice & Disclaimer</h3>
              
              <div className="wp-disclaimer" style={{ marginBottom: '2rem', marginTop: '1.5rem' }}>
                  <div className="wp-disclaimer-title">IMPORTANT: PLEASE READ THIS SECTION CAREFULLY.</div>
              </div>

              <h4 className="wp-sub-title">6.1 No Financial Return Expectation</h4>
              <p className="wp-text">
                NNM Tokens are digital utility units designed solely for use within the NNM ecosystem and its protocol functionalities. They are not securities, investment contracts, or financial instruments. Participation in the Genesis distribution is entirely voluntary.
              </p>
              <p className="wp-text">
                By acquiring $NNM, you explicitly acknowledge that you are doing so for its intended utility within the ecosystem and <strong>NOT</strong> with any expectation of profit, capital appreciation, financial return, or speculative gain.
              </p>

              <h4 className="wp-sub-title">6.2 No Guarantees</h4>
              <p className="wp-text">The NNM Protocol does not guarantee:</p>
              <ul className="wp-list">
                  <li>Market value</li>
                  <li>Token price stability</li>
                  <li>Liquidity availability</li>
                  <li>Exchange listings</li>
                  <li>Future adoption or ecosystem growth</li>
              </ul>
              <p className="wp-text">
                All forward-looking elements are subject to change based on technical, regulatory, and market conditions.
              </p>

              <h4 className="wp-sub-title">6.3 Risk of Digital Asset Loss</h4>
              <p className="wp-text">
                The use of blockchain-based systems involves inherent and significant risks. Participation in the NNM ecosystem may result in the partial or total loss of digital assets.
              </p>
              <p className="wp-text">Risks include, but are not limited to:</p>
              <ul className="wp-list">
                  <li>Smart contract vulnerabilities</li>
                  <li>Network failures</li>
                  <li>Market volatility</li>
                  <li>Regulatory uncertainty</li>
              </ul>
              <p className="wp-text">
                Nexus Name Market, its developers, contributors, and affiliates shall not be held liable for any losses, damages, or disruptions resulting from participation in the protocol.
              </p>

              <h4 className="wp-sub-title">6.4 Compliance & User Responsibility</h4>
              <p className="wp-text">
                Participation in any token distribution event is the sole responsibility of the participant.
              </p>
              <p className="wp-text">
                Users must ensure compliance with all applicable laws and regulations in their respective jurisdictions before interacting with the NNM Protocol.
              </p>
              <p className="wp-text">
                The NNM project does not provide financial, legal, or investment advice.
              </p>

              <h4 className="wp-sub-title">6.5 Forward-Looking Statements</h4>
              <p className="wp-text">
                This document may contain forward-looking statements related to future development, integrations, and ecosystem expansion.
              </p>
              <p className="wp-text">
                Such statements are not guarantees of future performance and are subject to uncertainty, technical feasibility, and evolving market conditions.
              </p>

              <h4 className="wp-sub-title">6.6 Voluntary Participation</h4>
              <p className="wp-text">
                All participation within the NNM ecosystem is voluntary and based on engagement with experimental decentralized technologies.
              </p>
              <p className="wp-text">
                Users acknowledge full responsibility for their decisions and interactions within the protocol.
              </p>
          </section>

          <footer className="wp-footer">
              <div className="wp-footer-text">
                © 2026 Nexus Name Market (NNM). All Rights Reserved.
              </div>
          </footer>

      </div>
    </main>
  );
}
