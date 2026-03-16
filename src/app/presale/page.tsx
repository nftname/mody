'use client';

import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const THEME = {
  bgMain: '#0B0E14',
  glassBg: 'rgba(24, 26, 32, 0.4)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  textMain: '#F3F4F6',
  textMuted: '#9CA3AF',
  accentCyan: '#00E5FF',
  accentPurple: '#B200FF',
  goldMain: '#FCD535',
};

export default function PresalePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [currency, setCurrency] = useState('POL');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const TOKEN_ADDRESS = "0x5E6447C273300AC357C6713Cb31a256345132609";
  const PRESALE_ADDRESS = "0xb03aa911B7b59d83cA62EC1e5958e9F78fd1Be72";

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="presale-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .presale-wrapper {
          background-color: ${THEME.bgMain};
          color: ${THEME.textMain};
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
          padding-bottom: 100px;
        }

        /* Ambient Glow Effects (   */
        .ambient-glow-cyan {
          position: absolute;
          top: 10%;
          left: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, ${THEME.accentCyan} 0%, transparent 70%);
          opacity: 0.08;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }
        .ambient-glow-purple {
          position: absolute;
          top: 40%;
          right: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, ${THEME.accentPurple} 0%, transparent 70%);
          opacity: 0.08;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }

        .container-fluid-custom {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
          position: relative;
          z-index: 1;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }
        @media (min-width: 1024px) {
          .main-grid { grid-template-columns: 1.8fr 1.2fr; }
        }

        /* Glassmorphism Panels */
        .glass-panel {
          background: ${THEME.glassBg};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid ${THEME.glassBorder};
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        /* Typography */
        h1, h2, h3 { margin: 0; padding: 0; font-weight: 600; letter-spacing: -0.5px; }
        .text-body { font-size: 16px; line-height: 1.8; color: ${THEME.textMuted}; font-weight: 300; }
        .highlight { color: ${THEME.textMain}; font-weight: 500; }
        .gold-text { color: ${THEME.goldMain}; }

        /* Important Notice Box */
        .notice-box {
          border-left: 3px solid #EF4444;
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%);
          padding: 24px;
          border-radius: 0 12px 12px 0;
          margin-bottom: 40px;
        }
        .notice-title {
          color: #EF4444;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        /* Tokenomics Data rows */
        .data-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid ${THEME.glassBorder};
        }
        .data-row:last-child { border-bottom: none; }
        
        /* Copy Button */
        .copy-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid ${THEME.glassBorder};
          border-radius: 6px;
          padding: 6px 12px;
          color: ${THEME.textMuted};
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: 0.2s;
          font-family: monospace;
        }
        .copy-btn:hover { background: rgba(255,255,255,0.1); color: ${THEME.textMain}; }

        /* --- Right Column (Sticky Presale Box) --- */
        .sticky-wrapper {
          position: sticky;
          top: 100px;
        }
        
        .presale-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(0, 229, 255, 0.2);
          box-shadow: 0 0 40px rgba(0, 229, 255, 0.05);
        }
        .presale-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 4px;
          background: linear-gradient(90deg, ${THEME.accentCyan}, ${THEME.accentPurple});
        }

        .floating-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          display: block;
          animation: float 6s ease-in-out infinite;
          filter: drop-shadow(0 0 15px rgba(252, 213, 53, 0.3));
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }

        .timer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin: 24px 0;
        }
        .timer-box {
          background: rgba(0,0,0,0.4);
          border: 1px solid ${THEME.glassBorder};
          border-radius: 8px;
          padding: 12px 0;
          text-align: center;
        }
        .timer-val { font-size: 24px; font-weight: 700; color: ${THEME.textMain}; }
        .timer-lbl { font-size: 11px; color: ${THEME.textMuted}; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

        .progress-container { margin: 24px 0; }
        .progress-bar-bg {
          height: 8px;
          background: rgba(0,0,0,0.5);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 12px;
        }
        .progress-fill {
          height: 100%;
          width: 45%; /* Dummy dynamic value */
          background: linear-gradient(90deg, ${THEME.accentCyan}, #0099ff);
          box-shadow: 0 0 10px ${THEME.accentCyan};
          border-radius: 4px;
        }

        .input-group {
          background: rgba(0,0,0,0.3);
          border: 1px solid ${THEME.glassBorder};
          border-radius: 12px;
          display: flex;
          padding: 6px;
          margin-bottom: 24px;
          transition: border-color 0.3s;
        }
        .input-group:focus-within { border-color: ${THEME.accentCyan}; }
        .input-field {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 20px;
          font-weight: 600;
          padding: 12px 16px;
          outline: none;
        }
        .currency-selector {
          background: ${THEME.glassBg};
          border: 1px solid ${THEME.glassBorder};
          border-radius: 8px;
          color: #fff;
          padding: 0 16px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        .main-action-btn {
          width: 100%;
          background: linear-gradient(90deg, ${THEME.accentCyan}, #0099ff);
          color: #000;
          border: none;
          padding: 18px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .main-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 229, 255, 0.3);
        }

        /* --- Legal Modal --- */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-content {
          background: #12151C;
          border: 1px solid ${THEME.glassBorder};
          border-radius: 20px;
          width: 100%;
          max-width: 550px;
          padding: 40px;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        .modal-close {
          position: absolute;
          top: 20px; right: 20px;
          background: transparent; border: none;
          color: ${THEME.textMuted}; font-size: 24px; cursor: pointer;
        }
        .checkbox-container {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin: 32px 0;
          background: rgba(255,255,255,0.03);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid ${THEME.glassBorder};
          cursor: pointer;
        }
        .checkbox-custom {
          width: 24px; height: 24px;
          accent-color: ${THEME.accentCyan};
          cursor: pointer;
          margin-top: 4px;
        }
        .modal-proceed-btn {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: 0.3s;
        }
        .btn-disabled { background: #2B3139; color: #6B7280; cursor: not-allowed; }
        .btn-active { background: ${THEME.goldMain}; color: #000; box-shadow: 0 0 15px rgba(252, 213, 53, 0.3); }
      `}} />

      <div className="ambient-glow-cyan"></div>
      <div className="ambient-glow-purple"></div>

      <div className="container-fluid-custom">
        <div className="main-grid">
          
          {/* Left Column: Information & Tokenomics */}
          <div className="content-col">
            
            <div className="notice-box">
              <div className="notice-title">Important Notice</div>
              <p className="text-body" style={{ color: '#F3F4F6', fontSize: '14.5px', marginBottom: '12px' }}>
                NNM Tokens are digital utility units designed for use within the NNM ecosystem and its protocol functionalities. They are not securities, investment contracts, or financial instruments.
              </p>
              <p className="text-body" style={{ color: '#F3F4F6', fontSize: '14.5px', marginBottom: '12px' }}>
                Participation in this optional genesis distribution is entirely voluntary and may involve the complete loss of contributed digital assets due to the experimental nature of blockchain technologies.
              </p>
              <p className="text-body" style={{ color: '#F3F4F6', fontSize: '14.5px', margin: 0 }}>
                By proceeding, you acknowledge that you are acquiring NNM Tokens solely for their potential utility within the ecosystem and not with any expectation of profit or financial return.
              </p>
            </div>

            <div className="glass-panel">
              <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Ecosystem Tokenomics & Vesting</h2>
              <p className="text-body mb-4">
                The NNM Token is the core utility asset powering the ChainFace Identity Layer and the NNM Name Market ecosystem — a decentralized infrastructure designed to enable verifiable digital identities and tradable Web3 name assets.
              </p>
              <p className="text-body mb-4">
                All token allocations are enforced through publicly verifiable smart contracts deployed on-chain to ensure transparency, auditability, and long-term ecosystem integrity.
              </p>

              <div className="data-row" style={{ marginTop: '32px' }}>
                <span className="text-body highlight">Total Supply</span>
                <span className="gold-text" style={{ fontSize: '20px', fontWeight: '700' }}>10,000,000,000 NNM</span>
              </div>
              <div className="data-row">
                <span className="text-body highlight">Token Contract</span>
                <button className="copy-btn" onClick={() => copyToClipboard(TOKEN_ADDRESS, 'token')}>
                  {TOKEN_ADDRESS.slice(0, 6)}...{TOKEN_ADDRESS.slice(-4)}
                  <i className={`bi ${copiedAddress === 'token' ? 'bi-check2 text-success' : 'bi-copy'}`}></i>
                </button>
              </div>
            </div>

            <div className="glass-panel">
              <h3 style={{ fontSize: '22px', marginBottom: '20px', color: THEME.accentCyan }}>Genesis Sale Parameters</h3>
              <div className="data-row"><span className="text-body highlight">Genesis Token Price</span><span className="text-body highlight">$0.0001 per NNM</span></div>
              <div className="data-row"><span className="text-body highlight">Maximum Allocation</span><span className="text-body highlight">3,500,000,000 NNM</span></div>
              <div className="data-row"><span className="text-body highlight">Minimum Contribution</span><span className="text-body highlight">$5</span></div>
              <div className="data-row"><span className="text-body highlight">Accepted Payments</span><span className="text-body highlight">POL / USDT (Polygon)</span></div>
              
              <div className="data-row" style={{ marginTop: '16px' }}>
                <span className="text-body highlight">Genesis Contract</span>
                <button className="copy-btn" onClick={() => copyToClipboard(PRESALE_ADDRESS, 'presale')}>
                  {PRESALE_ADDRESS.slice(0, 6)}...{PRESALE_ADDRESS.slice(-4)}
                  <i className={`bi ${copiedAddress === 'presale' ? 'bi-check2 text-success' : 'bi-copy'}`}></i>
                </button>
              </div>
            </div>

            <div className="glass-panel">
              <h3 style={{ fontSize: '22px', marginBottom: '20px' }}>Allocations & Security Protocols</h3>
              
              <div style={{ marginBottom: '32px' }}>
                <h4 className="highlight" style={{ fontSize: '18px', marginBottom: '8px' }}>1. Protocol Liquidity (25%)</h4>
                <p className="text-body">Reserved to establish decentralized liquidity across major DEXs. LP tokens will remain locked for 12 months using independently verifiable third-party smart contracts.</p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 className="highlight" style={{ fontSize: '18px', marginBottom: '8px' }}>2. Community Rewards (15%)</h4>
                <p className="text-body">6-Month Linear Vesting (16.66% monthly release). Contract audited and locked via PinkSale.</p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 className="highlight" style={{ fontSize: '18px', marginBottom: '8px' }}>3. Core Contributors (10%)</h4>
                <p className="text-body">12-Month Cliff Lock. 100% of contributor tokens remain locked until March 15, 2027 to prevent supply pressure.</p>
              </div>

              <div>
                <h4 className="highlight" style={{ fontSize: '18px', marginBottom: '8px', color: '#EF4444' }}>Automated Burn Protocol</h4>
                <p className="text-body">50% of the protocol revenue generated from minting new digital name assets is permanently removed from circulation, functioning as an automated usage-based supply reduction.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Buying Panel */}
          <div className="buy-col">
            <div className="sticky-wrapper">
              <div className="glass-panel presale-card">
                
                <img src="/1logo-nnm.svg" alt="NNM Logo" className="floating-logo" />
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ background: 'rgba(0, 229, 255, 0.1)', color: THEME.accentCyan, display: 'inline-block', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Genesis Event Live</div>
                  <h2 style={{ fontSize: '32px', margin: '16px 0 8px' }}>Buy $NNM</h2>
                  <p className="text-body">1 NNM = $0.0001</p>
                </div>

                <div className="timer-grid">
                  <div className="timer-box"><div className="timer-val">11</div><div className="timer-lbl">Days</div></div>
                  <div className="timer-box"><div className="timer-val">23</div><div className="timer-lbl">Hrs</div></div>
                  <div className="timer-box"><div className="timer-val">45</div><div className="timer-lbl">Min</div></div>
                  <div className="timer-box"><div className="timer-val">12</div><div className="timer-lbl">Sec</div></div>
                </div>

                <div className="progress-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span className="text-body">Phase 1 Progress</span>
                    <span className="highlight">45%</span>
                  </div>
                  <div className="progress-bar-bg"><div className="progress-fill"></div></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px' }}>
                    <span className="text-body">$157,500 Raised</span>
                    <span className="text-body">Target: $350,000</span>
                  </div>
                </div>

                <div className="input-group">
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="0.0" 
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                  />
                  <select className="currency-selector" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="POL">POL</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>

                <button className="main-action-btn" onClick={() => setIsModalOpen(true)}>
                  Contribute Now
                </button>
                
                <p style={{ textAlign: 'center', fontSize: '12px', color: THEME.textMuted, marginTop: '20px' }}>
                  <i className="bi bi-shield-check" style={{ marginRight: '6px' }}></i>
                  Smart Contracts Audited & Verified
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Legal & Terms Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            
            <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#fff' }}>Terms of Participation</h3>
            <p className="text-body" style={{ fontSize: '14px' }}>
              Before accessing the Web3 payment gateway, you must read and accept the protocol terms.
            </p>

            <label className="checkbox-container">
              <input 
                type="checkbox" 
                className="checkbox-custom" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span className="text-body" style={{ fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>
                I confirm that I have read and agree to the NNM Terms of Service and understand that NNM Tokens are digital utility tokens intended solely for use within the NNM ecosystem. I acknowledge that participation in this optional token distribution is voluntary, involves significant risk, and that I may lose the entire value of the digital assets contributed. I further confirm that I am not participating with any expectation of profit or financial return.
              </span>
            </label>

            {/* RainbowKit Connect Custom Logic inside Modal */}
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;

                if (!termsAccepted) {
                  return (
                    <button className="modal-proceed-btn btn-disabled" disabled>
                      Accept Terms to Proceed
                    </button>
                  );
                }

                if (!connected) {
                  return (
                    <button 
                      className="modal-proceed-btn btn-active" 
                      onClick={() => {
                        setIsModalOpen(false); 
                        openConnectModal();    
                      }}
                    >
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button className="modal-proceed-btn" style={{ background: '#EF4444', color: '#fff' }} onClick={openConnectModal}>
                      Wrong Network (Switch to Polygon)
                    </button>
                  );
                }

                return (
                  <button 
                    className="modal-proceed-btn btn-active"
                    onClick={() => {
                      setIsModalOpen(false);
                      alert('Trigger Smart Contract Buy Function Here!');
                    }}
                  >
                    Confirm & Pay {payAmount || '0'} {currency}
                  </button>
                );
              }}
            </ConnectButton.Custom>

          </div>
        </div>
      )}
    </div>
  );
}
