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
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
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
                grid-template-columns: 1fr 1fr;
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
            font-size: 1.2rem;
            font-weight: 700;
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
              <h1 className="wp-main-title">NNM Protocol</h1>
              <h2 className="wp-subtitle">Whitepaper v1.0 — March 2026</h2>
          </header>

          <div className="wp-disclaimer">
              <div className="wp-disclaimer-title">Important Disclaimer</div>
              <p className="wp-text" style={{ fontSize: '0.95rem', marginBottom: 0 }}>
                The information contained in this document is for informational purposes only.
                The NNM Token is a digital utility token designed exclusively for use within the NNM ecosystem.
                NNM Tokens are not securities, investment contracts, shares, or financial instruments.
                Participation in any token distribution is voluntary and at the user's own risk. Digital asset markets are highly volatile and experimental. No expectation of profit or financial return is implied or guaranteed.
              </p>
          </div>

          <section className="wp-section">
              <h3 className="wp-section-title">1. Executive Summary</h3>
              <p className="wp-text">
                The internet is rapidly evolving toward decentralized ownership and digital identity. However, a major infrastructure gap still exists: portable, user-owned identity and naming systems within Web3 ecosystems.
              </p>
              <p className="wp-text">
                The NNM Protocol (NFT Name Market) introduces a decentralized marketplace and identity infrastructure where users can mint, own, trade, and utilize rare digital name NFTs across Web3 environments.
              </p>
              <p className="wp-text">
                At the center of the ecosystem is the ChainFace Identity Layer, which transforms digital name ownership into a usable identity and payment interface.
              </p>
              <p className="wp-text">
                The NNM Token powers internal protocol operations, including marketplace activity, identity services, and ecosystem functionality.
                The NNM Protocol aims to create a global market for scarce digital names while enabling a new layer of decentralized digital identity.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">2. The Problem</h3>
              <p className="wp-text">
                Despite the rapid growth of blockchain technology, the Web3 ecosystem still faces major limitations related to identity, usability, and digital presence.
                Current blockchain interactions rely heavily on complex wallet addresses that are difficult to remember, share, or brand.
              </p>
              <p className="wp-text">This creates several problems:</p>
              <ul className="wp-list">
                  <li>Wallet addresses are long and unintuitive.</li>
                  <li>Users lack recognizable digital identities.</li>
                  <li>Payment interactions are difficult to simplify.</li>
                  <li>Digital names remain fragmented across multiple platforms.</li>
              </ul>
              <p className="wp-text">
                Existing naming systems partially address these issues, but they often lack market liquidity, integrated identity tools, or flexible ecosystem functionality.
                The Web3 ecosystem requires a unified infrastructure where digital names become functional identity assets.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">3. The NNM Solution</h3>
              <p className="wp-text">
                The NNM Protocol introduces a decentralized marketplace and identity framework where digital names function as scarce digital assets.
              </p>
              <p className="wp-text">Through NNM, users can:</p>
              <ul className="wp-list">
                  <li>Mint unique digital name NFTs</li>
                  <li>Exchange digital names in a global peer-to-peer environment</li>
                  <li>Build portable Web3 identities</li>
                  <li>Create payment-ready digital profiles</li>
              </ul>
              <p className="wp-text">
                This transforms a simple name into a functional Web3 identity layer.
              </p>
              <p className="wp-text">The protocol integrates:</p>
              <ul className="wp-list">
                  <li>Digital name ownership</li>
                  <li>Identity profiles</li>
                  <li>Ecosystem accessibility</li>
                  <li>Blockchain payment capabilities</li>
              </ul>
              <p className="wp-text">
                The goal is to transform Web3 naming into a global digital asset category.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">4. ChainFace Identity Layer</h3>
              <p className="wp-text">
                The ChainFace Identity Layer acts as the functional interface connecting digital names with real blockchain activity.
                ChainFace allows users to transform NFT name ownership into a fully usable Web3 identity profile.
              </p>
              <p className="wp-text">Each ChainFace identity can include:</p>
              <ul className="wp-list">
                  <li>A unique digital name NFT</li>
                  <li>A public Web3 identity profile</li>
                  <li>On-chain payment receiving capabilities</li>
                  <li>Social and ecosystem integrations</li>
              </ul>
              <p className="wp-text">
                This transforms digital names into operational Web3 identities, not just static assets.
                Users can share their ChainFace identity as a single destination for digital interaction across decentralized environments.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">5. NNM Token Utility</h3>
              <p className="wp-text">
                The NNM Token functions strictly as a utility token within the protocol.
                It enables core ecosystem interactions including:
              </p>
              <ul className="wp-list">
                  <li>Accessing premium ChainFace identity features</li>
                  <li>Marketplace transaction mechanics</li>
                  <li>Protocol-level functionality and automation</li>
                  <li>Participation in ecosystem tools and services</li>
              </ul>
              <p className="wp-text">
                The token is designed purely for platform functionality, not as a financial instrument.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">6. Tokenomics</h3>
              <p className="wp-text">
                The NNM ecosystem operates with a fixed maximum supply.
              </p>
              
              <div className="wp-stats-grid">
                  <div>
                      <div className="wp-stat-label">Total Supply</div>
                      <div className="wp-stat-value">10,000,000,000 NNM Tokens</div>
                  </div>
                  <div>
                      <div className="wp-stat-label">Network</div>
                      <div className="wp-stat-value">Polygon (PoS)</div>
                  </div>
              </div>

              <h4 className="wp-sub-title">Allocation Structure</h4>
              <ul className="wp-list">
                  <li><strong>35% — Early Network Bootstrapping:</strong> Allocated to early participants who contribute to identity layer adoption and protocol expansion.</li>
                  <li><strong>25% — Protocol Liquidity:</strong> Reserved for decentralized exchange liquidity pools to support marketplace accessibility. Liquidity is subject to a 12-month lock period.</li>
                  <li><strong>15% — Community Rewards:</strong> Allocated for ecosystem incentives, adoption programs, and community growth. Distributed via 6-month linear vesting.</li>
                  <li><strong>15% — Strategic Partnerships:</strong> Reserved for infrastructure partners, ecosystem integrations, and global onboarding initiatives.</li>
                  <li><strong>10% — Core Contributors:</strong> Allocated to protocol developers and early contributors. Subject to a 12-month cliff lock, unlocking in March 2027.</li>
              </ul>

              <h4 className="wp-sub-title">6.1 Genesis Allocation & Phased Network Access</h4>
              <p className="wp-text">
                To ensure a robust and well-tested network environment prior to full public deployment, the NNM Protocol utilizes a phased early access model for the Genesis Allocation. During this bootstrapping period, early participants who assist in stress-testing the smart contracts, establishing the ChainFace identity layer, and providing initial network activity receive subsidized access to NNM utility units.
              </p>
              <p className="wp-text">The phased access reflects the progressive stability of the network:</p>
              <ul className="wp-list">
                  <li><strong>Early Tester Phase ($0.0001 per NNM):</strong> A heavily subsidized rate recognizing the maximum contribution to beta testing and early network validation.</li>
                  <li><strong>Current Beta Access ($0.0002 per NNM):</strong> An adjusted rate reflecting increased network stability and continued early adoption efforts.</li>
                  <li><strong>Network Launch Phase ($0.001 per NNM):</strong> The standard utility baseline rate established for full network functionality upon mainnet maturity.</li>
              </ul>
              <p className="wp-text">
                This structured access is designed strictly to incentivize active platform testing and early network bootstrapping, and is not structured to provide speculative financial returns.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">7. Automated Network Security</h3>
              <p className="wp-text">
                The NNM Protocol incorporates a security and sustainability model tied to network activity.
                A portion of protocol-generated utility fees is permanently removed from circulation.
              </p>
              <p className="wp-text">
                <strong>Specifically:</strong> 50% of protocol fees generated from digital name minting is programmatically burned to prevent network spam and ensure smart contract sustainability.
              </p>
              <p className="wp-text">
                This mechanism ensures that network operations are connected directly to real usage and efficiency.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">8. Marketplace Infrastructure</h3>
              <p className="wp-text">
                The NNM Marketplace functions as a decentralized peer-to-peer exchange environment for digital name NFTs.
              </p>
              <p className="wp-text">Users can:</p>
              <ul className="wp-list">
                  <li>Mint rare digital names</li>
                  <li>Transfer and acquire names globally</li>
                  <li>Discover trending digital identities</li>
                  <li>Participate in the growing digital name economy</li>
              </ul>
              <p className="wp-text">
                The marketplace introduces broad accessibility to digital names, transforming them into transferable Web3 assets.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">9. Ecosystem Growth Strategy</h3>
              <p className="wp-text">
                The NNM Protocol focuses on long-term adoption through multiple ecosystem growth vectors:
              </p>
              <ul className="wp-list">
                  <li>Web3 identity adoption through ChainFace profiles</li>
                  <li>Marketplace expansion for digital name assets</li>
                  <li>Strategic partnerships with decentralized platforms</li>
                  <li>Community-driven ecosystem participation</li>
              </ul>
              <p className="wp-text">
                The protocol is designed to grow organically as digital identity becomes a fundamental layer of the decentralized internet.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">10. Development Roadmap</h3>
              
              <h4 className="wp-sub-title">Phase 1 — Protocol Launch (Q1 2026)</h4>
              <ul className="wp-list">
                  <li>NNM protocol deployment</li>
                  <li>Genesis digital name minting</li>
                  <li>Initial marketplace launch</li>
              </ul>

              <h4 className="wp-sub-title">Phase 2 — Identity Layer Expansion (Q2 2026)</h4>
              <ul className="wp-list">
                  <li>ChainFace identity system release</li>
                  <li>Payment profile functionality</li>
                  <li>Enhanced marketplace tools</li>
              </ul>

              <h4 className="wp-sub-title">Phase 3 — Ecosystem Liquidity (Q3 2026)</h4>
              <ul className="wp-list">
                  <li>Decentralized exchange liquidity deployment</li>
                  <li>Ecosystem onboarding initiatives</li>
                  <li>Protocol analytics layer development</li>
              </ul>

              <h4 className="wp-sub-title">Phase 4 — Global Expansion (Q4 2026)</h4>
              <ul className="wp-list">
                  <li>Cross-chain exploration</li>
                  <li>Ecosystem integrations</li>
                  <li>Global digital identity adoption initiatives</li>
              </ul>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">11. Legal Framework</h3>
              <p className="wp-text">
                The NNM Protocol operates as a decentralized software platform.
                The NNM Token is designed solely as a digital utility unit within the ecosystem.
              </p>
              <p className="wp-text">The token does not represent:</p>
              <ul className="wp-list">
                  <li>Ownership rights</li>
                  <li>Equity participation</li>
                  <li>Profit entitlement</li>
                  <li>Dividend distribution</li>
              </ul>
              <p className="wp-text">
                Participation in token distributions, genesis distributions, or ecosystem allocations is entirely voluntary and conducted at the user's sole risk.
                Funds contributed during any genesis phase are considered payments for future access to software utility, not investments in a common enterprise.
              </p>
          </section>

          <section className="wp-section">
              <h3 className="wp-section-title">12. Risk Disclosure</h3>
              <p className="wp-text">
                Users should be aware that blockchain technology and digital assets are experimental and may involve significant risks.
              </p>
              <p className="wp-text">These risks include but are not limited to:</p>
              <ul className="wp-list">
                  <li>Technological vulnerabilities</li>
                  <li>Market volatility</li>
                  <li>Regulatory uncertainty</li>
                  <li>Liquidity limitations</li>
              </ul>
              <p className="wp-text">
                Digital assets may lose all value or become illiquid. Participants should only interact with the protocol if they fully understand these risks.
              </p>
          </section>

          <section className="wp-section" style={{ marginTop: '4rem' }}>
              <h3 className="wp-section-title">Conclusion</h3>
              <p className="wp-text">
                The NNM Protocol introduces a new category within the decentralized ecosystem: tradable digital name identities.
              </p>
              <p className="wp-text">
                By combining NFT ownership, identity infrastructure, and marketplace accessibility, NNM aims to build the foundation for a future where digital names become essential components of online presence.
              </p>
              <p className="wp-text">
                As Web3 continues to evolve, decentralized identity systems will become a fundamental pillar of the internet. NNM is positioned to play a key role in shaping that future.
              </p>
          </section>

          <footer className="wp-footer">
              <div className="wp-footer-text">
                © 2026 NNM PROTOCOL | WHITEPAPER V1.0
              </div>
          </footer>

      </div>
    </main>
  );
}
