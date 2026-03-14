"use client";

import React from 'react';

export default function PresalePage() {
  
  // دالة نسخ العقد الذكي
  const copyContract = () => {
    const address = "0x264D75F04b135e58E2d5cC8A6B9c1371dAc3ad81";
    navigator.clipboard.writeText(address);
    alert("Contract Address Copied!");
  };

  return (
    <div className="nnm-presale-container">
      {/* هنا نضع التنسيقات (CSS) داخل الصفحة مباشرة 
          ليكون كل شيء في مكان واحد كما طلبت
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        .nnm-presale-container {
          --bg-main: #181A20;
          --bg-panel: #1E2329;
          --border-color: #2B3139;
          --text-main: #EAEAEA;
          --text-muted: #8BA1BE;
          --accent-blue: #00E5FF;
          --accent-blue-glow: rgba(0, 229, 255, 0.2);
          background-color: var(--bg-main);
          color: var(--text-main);
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* الهيدر الرفيع والاحترافي */
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 24px;
          height: 60px;
          background-color: rgba(24, 26, 32, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
        }

        .header-left { display: flex; align-items: center; gap: 12px; }
        .logo-circle { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-blue), #0055ff); }
        .brand-name { font-size: 18px; font-weight: 700; color: #fff; }
        
        .contract-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #14151a;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          font-family: monospace;
          font-size: 11px;
          color: var(--text-muted);
        }

        .copy-icon { cursor: pointer; color: var(--accent-blue); display: flex; align-items: center; }
        
        .badges { display: flex; gap: 5px; margin-left: 5px; }
        .badge { background: #23282f; border: 1px solid #363c45; padding: 2px 5px; border-radius: 4px; font-size: 9px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }

        .header-right { display: flex; gap: 10px; }
        .glass-box {
          background: rgba(30, 35, 41, 0.4);
          border: 1px solid var(--border-color);
          padding: 4px 12px;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 100px;
        }
        .box-label { font-size: 9px; color: var(--text-muted); text-transform: uppercase; }
        .box-value { font-size: 13px; font-weight: 600; color: #fff; }

        /* شريط التنقل */
        .nav-bar {
          position: sticky;
          top: 60px;
          z-index: 99;
          display: flex;
          gap: 25px;
          padding: 0 30px;
          height: 45px;
          align-items: center;
          background-color: var(--bg-main);
          border-bottom: 1px solid var(--border-color);
          font-size: 13px;
          color: var(--text-muted);
        }
        .nav-bar a { transition: 0.3s; cursor: pointer; }
        .nav-bar a:hover { color: var(--accent-blue); }

        /* تقسيم الصفحة */
        .main-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          max-width: 1300px;
          margin: 25px auto;
          padding: 0 20px;
        }

        .panel {
          background: var(--bg-panel);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .panel-title { font-size: 17px; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; color: #fff; }
        .panel-title::before { content: ''; width: 3px; height: 14px; background: var(--accent-blue); border-radius: 2px; }

        /* الاقتصاديات */
        .tokenomics-content { display: flex; align-items: center; gap: 40px; }
        .chart-circle {
          width: 140px; height: 140px; border-radius: 50%;
          background: conic-gradient(var(--accent-blue) 0% 35%, #089981 35% 60%, #F23645 60% 75%, #8BA1BE 75% 90%, #FCD535 90% 100%);
          display: flex; align-items: center; justify-content: center;
        }
        .chart-hole { width: 90px; height: 90px; background: var(--bg-panel); border-radius: 50%; }

        /* خارطة الطريق والأسهم المتحركة */
        .roadmap-list { margin-top: 10px; }
        .roadmap-step {
          border-left: 2px solid var(--border-color);
          padding: 0 0 25px 20px;
          position: relative;
        }
        .roadmap-step.active::before { content: ''; position: absolute; left: -6px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--accent-blue); box-shadow: 0 0 8px var(--accent-blue); }
        .roadmap-step:not(.active)::before { content: ''; position: absolute; left: -6px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--border-color); }
        
        .step-date { font-size: 11px; color: var(--accent-blue); font-weight: 700; margin-bottom: 3px; }
        .step-title { font-size: 14px; font-weight: 600; color: #fff; }

        .glow-arrow {
          width: 18px; height: 18px; position: absolute; left: -10px; bottom: 5px;
          color: var(--accent-blue); opacity: 0;
          animation: slideDownGlow 2s infinite ease-in-out;
        }

        @keyframes slideDownGlow {
          0% { transform: translateY(-10px); opacity: 0; }
          50% { opacity: 1; filter: drop-shadow(0 0 5px var(--accent-blue)); }
          100% { transform: translateY(10px); opacity: 0; }
        }

        /* صندوق الشراء (اليمين) */
        .presale-card {
          border: 1px solid var(--accent-blue);
          box-shadow: 0 0 15px var(--accent-blue-glow);
          position: sticky;
          top: 125px;
        }
        .presale-timer { display: flex; justify-content: center; gap: 8px; margin: 15px 0; }
        .time-box { background: #14151a; border: 1px solid var(--border-color); padding: 6px; border-radius: 6px; text-align: center; min-width: 50px; }
        .time-num { font-size: 16px; font-weight: 800; }
        .time-txt { font-size: 9px; color: var(--text-muted); text-transform: uppercase; }

        .progress-bar { height: 6px; background: #14151a; border-radius: 3px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; width: 65%; background: var(--accent-blue); box-shadow: 0 0 8px var(--accent-blue); }

        .input-area { background: #14151a; border: 1px solid var(--border-color); border-radius: 6px; display: flex; padding: 3px; margin-bottom: 12px; }
        .input-area input { flex: 1; background: transparent; border: none; color: #fff; padding: 8px; outline: none; font-size: 15px; }
        .currency-label { background: var(--bg-panel); padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 13px; }

        .action-btn {
          width: 100%; background: var(--accent-blue); color: #000; border: none; padding: 12px; border-radius: 6px;
          font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .action-btn:hover { box-shadow: 0 0 12px var(--accent-blue); transform: translateY(-1px); }

        @media (max-width: 900px) {
          .main-content { grid-template-columns: 1fr; }
          .header-right { display: none; }
        }
      ` }} />

      {/* الهيدر الرفيع */}
      <header className="header">
        <div className="header-left">
          <div className="logo-circle"></div>
          <div className="brand-name">NNM</div>
          <div className="contract-box">
            0x264...ad81
            <div className="copy-icon" onClick={copyContract}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </div>
          </div>
          <div className="badges">
            <div className="badge">SolidProof</div>
            <div className="badge">CertiK</div>
            <div className="badge">CMC</div>
            <div className="badge">CG</div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="glass-box">
            <span className="box-label">Your Balance</span>
            <span className="box-value">0 NNM ($0.00)</span>
          </div>
          <div className="glass-box">
            <span className="box-label">Presale Price</span>
            <span className="box-value">$0.0001</span>
          </div>
        </div>
      </header>

      {/* التنقل السلس */}
      <nav className="nav-bar">
        <a onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>Overview</a>
        <a href="#tokenomics">Tokenomics</a>
        <a href="#roadmap">Roadmap</a>
        <a href="#security">Security</a>
      </nav>

      {/* المحتوى الرئيسي */}
      <main className="main-content">
        <div className="left-side">
          <section id="overview" className="panel">
            <h2 className="panel-title">NNM Protocol: Redefining Identity</h2>
            <div style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '13.5px' }}>
              <p>NNM Protocol is a sovereign identity layer built on Polygon, transforming static digital assets into functional Web3 utilities with integrated payment dashboards and global index data.</p>
            </div>
          </section>

          <section id="tokenomics" className="panel">
            <h2 className="panel-title">Token Economics</h2>
            <div className="tokenomics-content">
              <div className="chart-circle"><div className="chart-hole"></div></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--accent-blue)' }}>● Genesis Sale</span>
                  <span>35%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#089981' }}>● DEX Liquidity Pool</span>
                  <span>25%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#F23645' }}>● Marketing & PR</span>
                  <span>15%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#8BA1BE' }}>● Team & Reserve</span>
                  <span>25%</span>
                </div>
              </div>
            </div>
          </section>

          <section id="roadmap" className="panel">
            <h2 className="panel-title">Deployment Roadmap</h2>
            <div className="roadmap-list">
              <div className="roadmap-step active">
                <div className="step-date">March 15, 2026</div>
                <div className="step-title">Genesis Sale Activation</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>Opening exclusive early-bird utility credit acquisition.</div>
                <svg className="glow-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
              </div>

              <div className="roadmap-step">
                <div className="step-date">April 5, 2026</div>
                <div className="step-title">Public Trading & DEX Launch</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>Conclusion of presale and initial liquidity locking.</div>
                <svg className="glow-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
              </div>

              <div className="roadmap-step" style={{ borderLeftColor: 'transparent' }}>
                <div className="step-date">May 1, 2026</div>
                <div className="step-title">Burn Protocol Activation</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>Initiation of the automated weekly 50% revenue buyback.</div>
              </div>
            </div>
          </section>
        </div>

        {/* صندوق الشراء الجانبي */}
        <div className="right-side">
          <div className="panel presale-card">
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-blue)', display: 'inline-block', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>Live Event</div>
              <h3 style={{ margin: '10px 0 5px', color: '#fff' }}>Buy $NNM Token</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Secure your early entry price</p>
            </div>

            <div className="presale-timer">
              <div className="time-box"><div className="time-num">11</div><div className="time-txt">Days</div></div>
              <div className="time-box"><div className="time-num">23</div><div className="time-txt">Hrs</div></div>
              <div className="time-box"><div className="time-num">45</div><div className="time-txt">Min</div></div>
            </div>

            <div style={{ margin: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Progress: 65%</span>
                <span style={{ color: 'var(--accent-blue)' }}>$227k / $350k</span>
              </div>
              <div className="progress-bar"><div className="progress-fill"></div></div>
            </div>

            <div className="input-area">
              <input type="number" placeholder="0.0" />
              <div className="currency-label">POL</div>
            </div>

            <button className="action-btn">Connect Wallet</button>
            <p style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', marginTop: '12px' }}>* Minimum purchase: 10 POL</p>
          </div>
        </div>
      </main>
    </div>
  );
}
