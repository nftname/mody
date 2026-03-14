"use client";

export default function PresalePage() {
  const copyContract = () => {
    navigator.clipboard.writeText("0x264D75F04b135e58E2d5cC8A6B9c1371dAc3ad81");
    alert("Contract Copied!");
  };

  return (
    <div className="presale-theme">
      <header className="header">
        <div className="header-left">
          <div className="logo-circle"></div>
          <div className="brand-name">NNM</div>
          <div className="contract-box">
            0x264...ad81
            <span className="copy-icon" onClick={copyContract}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </span>
          </div>
          <div className="badges">
            <span className="badge">SolidProof</span>
            <span className="badge">CertiK</span>
            <span className="badge">CMC</span>
            <span className="badge">CG</span>
          </div>
        </div>
        <div className="header-right">
          <div className="glass-box">
            <span className="box-label">Your Balance</span>
            <span className="box-value">0 NNM ($0.00)</span>
          </div>
          <div className="glass-box">
            <span className="box-label">Current Price</span>
            <span className="box-value">$0.0001</span>
          </div>
        </div>
      </header>

      <nav className="nav-bar">
        <a href="#about">About</a>
        <a href="#tokenomics">Tokenomics</a>
        <a href="#roadmap">Roadmap</a>
        <a href="#security">Security</a>
      </nav>

      <main className="container">
        <div className="left-col">
          <section id="about" className="panel">
            <h2 className="panel-title">NNM Protocol: Next ENS on Polygon</h2>
            <div className="text-content">
              <p style={{ marginBottom: '12px' }}>NNM Protocol represents a next-generation decentralized infrastructure natively engineered for the Polygon ecosystem. Recognizing the fragmentation in current Web3 market structures, NNM introduces a unified, sovereign Digital Identity Layer.</p>
              <p>Built upon the proprietary ChainFace Identity Primitive, NNM transforms purely speculative assets into hyper-functional Web3 utilities via verified cross-chain payment dashboards, backed by the NGX Global Index.</p>
            </div>
          </section>

          <section id="tokenomics" className="panel">
            <h2 className="panel-title">Tokenomics</h2>
            <div className="tokenomics-wrapper">
              <div className="donut-chart"><div className="donut-hole"></div></div>
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color"><div className="color-box" style={{ background: 'var(--accent-blue)' }}></div> Genesis Sale</div>
                  <div>35%</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color"><div className="color-box" style={{ background: '#089981' }}></div> DEX Liquidity Pool</div>
                  <div>25%</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color"><div className="color-box" style={{ background: '#F23645' }}></div> Marketing & Partners</div>
                  <div>15%</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color"><div className="color-box" style={{ background: '#8BA1BE' }}></div> Ecosystem Rewards</div>
                  <div>15%</div>
                </div>
                <div className="legend-item">
                  <div className="legend-color"><div className="color-box" style={{ background: '#FCD535' }}></div> Team & Dev</div>
                  <div>10%</div>
                </div>
              </div>
            </div>
          </section>

          <section id="roadmap" className="panel">
            <h2 className="panel-title">Deployment Roadmap</h2>
            <div className="roadmap-timeline">
              <div className="roadmap-item active">
                <div className="roadmap-date">March 15, 2026</div>
                <div className="roadmap-title">Genesis Sale Activation</div>
                <div className="roadmap-desc">Deployment of the EIP-712 Marketplace and Sovereign Registry. Exclusive internal presale opens for early adopters.</div>
                <svg className="animated-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
              </div>

              <div className="roadmap-item">
                <div className="roadmap-date">April 5, 2026</div>
                <div className="roadmap-title">Public Trading & Liquidity Lock</div>
                <div className="roadmap-desc">Genesis Sale concludes. Liquidity is securely locked on decentralized exchanges with initial market making deployed.</div>
                <svg className="animated-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
              </div>

              <div className="roadmap-item" style={{ borderLeftColor: 'transparent' }}>
                <div className="roadmap-date">May 1, 2026</div>
                <div className="roadmap-title">Burn Mechanism & Global Scale</div>
                <div className="roadmap-desc">Activation of the automated weekly 50% revenue buyback and burn protocol. Tier-1 influencer marketing campaigns commence.</div>
              </div>
            </div>
          </section>

          <section id="security" className="panel">
            <h2 className="panel-title">Institutional Grade Security</h2>
            <div className="text-content">
              <p>Smart contracts deployed on Polygon Mainnet have been developed following strict ERC-20 and ERC-721 standards. Comprehensive audits and KYC verification processes are executed to ensure absolute protection of the ecosystem and investor funds.</p>
            </div>
          </section>
        </div>

        <div className="right-col">
          <div className="panel presale-box">
            <div className="presale-header">
              <span className="presale-badge">Genesis Sale Live</span>
              <h2 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Buy NNM Token</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>1 NNM = $0.0001</p>
            </div>

            <div className="presale-timer">
              <div className="time-block"><div className="time-val">12</div><div className="time-label">Days</div></div>
              <div className="time-block"><div className="time-val">04</div><div className="time-label">Hours</div></div>
              <div className="time-block"><div className="time-val">45</div><div className="time-label">Mins</div></div>
              <div className="time-block"><div className="time-val">10</div><div className="time-label">Secs</div></div>
            </div>

            <div className="progress-wrapper">
              <div className="progress-stats" style={{ marginBottom: '8px' }}>
                <span>Raised: $227,500</span>
                <span>Target: $350,000</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>

            <div className="buy-input-group">
              <input type="number" className="buy-input" placeholder="0.0" />
              <div className="currency-tag">POL</div>
            </div>

            <button className="buy-btn">Connect Wallet</button>
          </div>
        </div>
      </main>
    </div>
  );
}
