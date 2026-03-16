"use client";
import React, { useState, useEffect } from 'react';

const tokenomicsData = [
  { id: 0, name: "Pre-sale", percent: 35, amount: "3.5B", color: "#E11D48", offset: 0 },
  { id: 1, name: "Protocol Liquidity", percent: 25, amount: "2.5B", color: "#9333EA", offset: -35 },
  { id: 2, name: "Community Rewards", percent: 15, amount: "1.5B", color: "#3B82F6", offset: -60 },
  { id: 3, name: "Ecosystem Expansion", percent: 15, amount: "1.5B", color: "#10B981", offset: -75 },
  { id: 4, name: "Team & Advisors", percent: 10, amount: "1B", color: "#F59E0B", offset: -90 },
];

// Mock API prices for background calculation (will be replaced by your Smart Contract API later)
const coinPrices = {
  POL: 0.5,
  USDT: 1,
  ETH: 3000
};

export default function PresalePage() {
  const [amount, setAmount] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<'POL' | 'USDT' | 'ETH'>('POL');
  const [showModal, setShowModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 5, minutes: 30, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConnectWallet = () => {
    if (acceptedTerms) {
      setShowModal(false);
      alert("Connecting to Web3...");
    }
  };

  const handleQuickAmount = (val: string) => {
    setAmount(val);
    setSelectedCoin('USDT');
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCoinSelect = (coin: 'POL' | 'USDT' | 'ETH') => {
    setSelectedCoin(coin);
    setIsDropdownOpen(false);
  };

  const calculatedNNM = amount ? (Number(amount) * coinPrices[selectedCoin] / 0.0001).toFixed(0) : '';

  // Unified Sa'te Style with enhanced glow
  const saTeContainerStyle = {
    background: 'rgba(147, 51, 234, 0.05)', 
    border: '1px solid rgba(147, 51, 234, 0.11)', 
    boxShadow: '0 0 30px rgba(147, 51, 234, 0.11)', 
    borderRadius: '20px',
    backdropFilter: 'blur(15px)',
  };

  return (
    <div style={{ 
      backgroundColor: '#050a16', 
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'49\' viewBox=\'0 0 28 49\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg id=\'hexagons\' fill=\'none\' stroke=\'rgba(255,255,255,0.01)\' stroke-width=\'1\'%3E%3Cpath d=\'M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.65V49h-2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      backgroundSize: '84px 147px',
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      position: 'relative', 
      overflowX: 'hidden', 
      fontFamily: 'sans-serif', 
      padding: '20px 10px' 
    }}>
      
      {/* PROFESSIONAL WEB3 AURORA BACKGROUND GLOWS */}
      {/* Top Left Deep Magenta Glow */}
      <div style={{ position: 'absolute', top: '0', left: '0', width: '100vw', height: '100vh', background: 'radial-gradient(circle at 10% 10%, rgba(225, 29, 72, 0.12) 0%, rgba(167, 139, 250, 0) 60%)', filter: 'blur(120px)', zIndex: 0, pointerEvents: 'none' }}></div>
      {/* Center Deep Purple Glow */}
      <div style={{ position: 'absolute', top: '30%', left: '20%', width: '100vw', height: '100vh', background: 'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.1) 0%, rgba(109, 40, 217, 0) 70%)', filter: 'blur(150px)', zIndex: 0, pointerEvents: 'none' }}></div>
      {/* Bottom Right Royal Blue Glow */}
      <div style={{ position: 'absolute', bottom: '0', right: '0', width: '100vw', height: '100vh', background: 'radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0) 60%)', filter: 'blur(120px)', zIndex: 0, pointerEvents: 'none' }}></div>

      
      {/* Background Glows (Sa'te) */}
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(225, 29, 72, 0.11) 0%, rgba(24, 26, 32, 0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(147, 51, 234, 0.11) 0%, rgba(24, 26, 32, 0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker { display: flex; width: 200%; animation: marquee 20s linear infinite; }
        .ticker-item { white-space: nowrap; margin-right: 20px; font-size: 11px; color: #fff; }
        .ticker-item span { color: #E11D48; font-weight: bold; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 10px rgba(225, 29, 72, 0.2); } 50% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.4); } 100% { box-shadow: 0 0 10px rgba(225, 29, 72, 0.2); } }
        .chart-segment { transition: all 0.3s ease-out; cursor: pointer; }
        .chart-segment:hover, .chart-segment.active { stroke-width: 6; filter: drop-shadow(0px 0px 8px rgba(255,255,255,0.4)); }
        .legend-item { transition: all 0.3s ease; opacity: 0.7; }
        .legend-item:hover, .legend-item.active { opacity: 1; transform: translateY(-2px); background: rgba(255,255,255,0.05); }
        @keyframes pulseDot { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
      `}</style>

      {/* PRESALE BOX SECTION */}
      <div style={{ display: 'flex', width: '100%', maxWidth: '900px', zIndex: 1, gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '60px', marginTop: '20px' }}>
        <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', color: '#fff' }}>
          {/* Header Logo (128x128) aligned with the top of the right box - Margin increased by 200% (20px -> 60px) */}
          <div style={{ marginBottom: '60px' }}>
            <img 
              src="/logo-coyn-nnm.png" 
              alt="NNM Logo" 
              style={{ width: '128px', height: '128px', borderRadius: '20px', border: '1px solid rgba(147, 51, 234, 0.2)', boxShadow: '0 0 20px rgba(147, 51, 234, 0.2)', objectFit: 'contain' }} 
            />
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.2' }}>
            The NNM Protocol <br/>
            <span style={{ background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Web3 Identity coin Presales</span>
          </h1>
          <p style={{ color: '#9ea9a9', fontSize: '15px', maxWidth: '350px', lineHeight: '1.6' }}>
            Empowering the Polygon Ecosystem with Sovereign Identity and Institutional-Grade NFT Market Intelligence. A fully operational Web3 identity layer deployed on Polygon Mainnet. Join the most exclusive token launch. Secure your allocation before the public listing.
          </p>
        </div>

        <div style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ ...saTeContainerStyle, background: 'rgba(147, 51, 234, 0.11)', padding: '20px', width: '100%', maxWidth: '380px' }}>

            {/* Header: Presale Live & Polygon Logo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', animation: 'pulseDot 1.5s infinite' }}></span>
                Presale Live
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                <img src="/icons/matic.svg" alt="Polygon" style={{ width: '14px', height: '14px', objectFit: 'contain' }} /> Polygon
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px', width: '50px', textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{value.toString().padStart(2, '0')}</div>
                  <div style={{ fontSize: '9px', color: '#9ea9a9', textTransform: 'uppercase' }}>{unit}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                <span style={{ color: '#9ea9a9' }}>Raised: <strong style={{ color: '#fff' }}>$1,250,000</strong></span>
                <span style={{ color: '#9ea9a9' }}>Target: <strong style={{ color: '#fff' }}>$3,500,000</strong></span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '35%', height: '100%', background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', borderRadius: '4px' }}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
               <div>
                  <span style={{ color: '#9ea9a9', fontSize: '11px' }}>Current Price: </span>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>$0.0100</span>
               </div>
               <div>
                  <span style={{ color: '#9ea9a9', fontSize: '11px' }}>Rate: </span>
                  <span style={{ color: '#9333EA', fontSize: '11px', fontWeight: 'bold' }}>100 NNM/$1</span>
               </div>
            </div>

            {/* TICKER MOVED HERE - Speed increased to 10s */}
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 0', overflow: 'hidden', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px', borderRadius: '10px' }}>
              <div className="ticker" style={{ animationDuration: '03s' }}>
                <span className="ticker-item">0x8a...3f buys <span>15,000 NNM</span></span>
                <span className="ticker-item">0x2b...1a buys <span>50,000 NNM</span></span>
                <span className="ticker-item">0x9c...7d buys <span>5,000 NNM</span></span>
                <span className="ticker-item">0x8a...3f buys <span>15,000 NNM</span></span>
                <span className="ticker-item">0x2b...1a buys <span>50,000 NNM</span></span>
                {/* Repeated for seamless scroll */}
                <span className="ticker-item">0x8a...3f buys <span>15,000 NNM</span></span>
                <span className="ticker-item">0x2b...1a buys <span>50,000 NNM</span></span>
                <span className="ticker-item">0x9c...7d buys <span>5,000 NNM</span></span>
                <span className="ticker-item">0x8a...3f buys <span>15,000 NNM</span></span>
                <span className="ticker-item">0x2b...1a buys <span>50,000 NNM</span></span>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '14px', padding: '14px', marginBottom: '12px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                <span style={{ color: '#9ea9a9', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>You Pay</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['10', '50', '100', '1000'].map(val => (
                     <button key={val} onClick={() => handleQuickAmount(val)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '9px', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer' }}>${val}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', outline: 'none', width: '40%', fontWeight: 'bold' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                  <img src="/icons/eth.svg" alt="ETH" style={{ width: '20px', height: '20px', objectFit: 'contain', opacity: 1 }} />
                  <img src="/icons/usdt.svg" alt="USDT" style={{ width: '20px', height: '20px', objectFit: 'contain', opacity: 1 }} />
                  <img src="/icons/matic.svg" alt="POL" style={{ width: '20px', height: '20px', objectFit: 'contain', opacity: 1 }} />
                  
                  <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', marginLeft: '4px', minWidth: '75px', justifyContent: 'center' }}>
                    {selectedCoin} ▼
                  </div>

                  {isDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', background: '#0b1426', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 50, boxShadow: '0 4px 15px rgba(0,0,0,0.5)', width: '100px' }}>
                      {['POL', 'USDT', 'ETH'].map((coin) => (
                        <div 
                          key={coin} 
                          onClick={() => handleCoinSelect(coin as 'POL' | 'USDT' | 'ETH')}
                          style={{ padding: '10px', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: selectedCoin === coin ? 'rgba(147, 51, 234, 0.3)' : 'transparent' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = selectedCoin === coin ? 'rgba(147, 51, 234, 0.3)' : 'transparent'}
                        >
                          {coin}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '14px', padding: '14px', marginBottom: '16px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <p style={{ color: '#9ea9a9', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>You Receive</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input type="number" placeholder="0.0" disabled value={calculatedNNM} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', outline: 'none', width: '60%', fontWeight: 'bold' }} />
                <div style={{ background: 'rgba(225, 29, 72, 0.1)', padding: '6px 10px', borderRadius: '12px', color: '#E11D48', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
                  {/* NNM Logo 24px and White text */}
                  <img src="/logo-coyn-nnm.png" alt="NNM" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ color: '#fff', fontSize: '12px' }}>NNM</span>
                </div>
              </div>
            </div>

            <button onClick={() => alert("Connecting to Web3...")} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', color: '#fff', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', animation: 'pulseGlow 2s infinite' }}>
              Connect Wallet
            </button>
          </div>
          
          {/* DISCLAIMER TEXT - Right beneath the box with large bottom margin */}
          <p style={{ width: '100%', maxWidth: '380px', marginTop: '16px', marginBottom: '60px', fontSize: '11px', color: '#64748b', fontStyle: 'italic', textAlign: 'center', lineHeight: '1.5' }}>
            By connecting your wallet, I confirm that I have read and agree to the NNM Terms of Service and understand that NNM Tokens are digital utility tokens intended solely for use within the NNM ecosystem. I acknowledge that participation in this optional token distribution is voluntary, involves significant risk, and that I may lose the entire value of the digital assets contributed. I further confirm that I am not participating with any expectation of profit or financial return.
          </p>
        </div>

      </div>

      {/* 3 CARDS SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', width: '100%', maxWidth: '900px', zIndex: 1, marginBottom: '60px' }}>
        <div style={{ ...saTeContainerStyle, padding: '30px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>1</div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>ChainFace Identity</h3>
          <p style={{ color: '#9ea9a9', fontSize: '13px', lineHeight: '1.6' }}>Transforming purely speculative NFTs into hyper-functional Web3 utilities via verified cross-chain payment dashboards.</p>
        </div>
        <div style={{ ...saTeContainerStyle, padding: '30px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>2</div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>The NGX Global Index</h3>
          <p style={{ color: '#9ea9a9', fontSize: '13px', lineHeight: '1.6' }}>The authoritative observatory for the NFT asset class, featuring Ecosystem Sentiment, Aggregated Volume, and Sector Market Cap.</p>
        </div>
        <div style={{ ...saTeContainerStyle, padding: '30px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>3</div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>Conviction Rank</h3>
          <p style={{ color: '#9ea9a9', fontSize: '13px', lineHeight: '1.6' }}>An immutable, sybil-resistant ranking system rewarding genuine community belief over artificial wash trading.</p>
        </div>
      </div>

      {/* TOKENOMICS SECTION */}
      <div style={{ width: '100%', maxWidth: '900px', zIndex: 1, marginBottom: '40px' }}>
        <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', textAlign: 'left', marginBottom: '30px' }}>
          NNM <span style={{ background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tokenomics</span>
        </h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'stretch' }}>
          
          <div style={{ flex: '1', minWidth: '300px', ...saTeContainerStyle, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '30px' }}>
              {tokenomicsData.map((item) => (
                <div 
                  key={item.id}
                  className={`legend-item ${activeSegment === item.id ? 'active' : ''}`}
                  onMouseEnter={() => setActiveSegment(item.id)}
                  onMouseLeave={() => setActiveSegment(null)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                  <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>{item.name} <span style={{ color: '#fff', marginLeft: '4px' }}>{item.percent}%</span></span>
                </div>
              ))}
            </div>

            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <svg viewBox="0 0 32 32" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', overflow: 'visible' }}>
                {tokenomicsData.map((item) => (
                  <circle
                    key={item.id}
                    className={`chart-segment ${activeSegment === item.id ? 'active' : ''}`}
                    r="15.91549430918954"
                    cx="16"
                    cy="16"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={activeSegment === item.id ? "5.5" : "4"}
                    strokeDasharray={`${item.percent} ${100 - item.percent}`}
                    strokeDashoffset={item.offset}
                    onMouseEnter={() => setActiveSegment(item.id)}
                    onMouseLeave={() => setActiveSegment(null)}
                  />
                ))}
              </svg>
              
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', transition: 'all 0.3s ease' }}>
                  {activeSegment !== null ? tokenomicsData[activeSegment].amount : '10B'}
                </div>
                <div style={{ fontSize: '12px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
                  {activeSegment !== null ? 'NNM' : 'TOTAL SUPPLY'}
                </div>
              </div>
            </div>
            
            <div style={{ background: 'rgba(225, 29, 72, 0.05)', border: '1px solid rgba(225, 29, 72, 0.15)', borderRadius: '20px', padding: '16px', backdropFilter: 'blur(20px)', marginTop: '60px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#E11D48', fontSize: '18px' }}>🔥</span>
                <span style={{ color: '#E11D48', fontSize: '16px', fontWeight: 'bold' }}>Automated Burn Protocol</span>
              </div>
              <p style={{ color: '#9ea9a9', fontSize: '13px', lineHeight: '1.5' }}>
                50% of protocol revenue generated from minting new digital name assets is permanently removed from circulation.
              </p>
            </div>
          </div>

          <div style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ flex: 1, ...saTeContainerStyle, padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '12px' }}>
                <span style={{ color: '#9ea9a9', fontSize: '14px' }}>Total Supply</span>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>10 Billion</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '12px' }}>
                <span style={{ color: '#9ea9a9', fontSize: '14px' }}>Genesis Price</span>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>$0.0001 per NNM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '12px' }}>
                <span style={{ color: '#9ea9a9', fontSize: '14px' }}>Chain</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src="/icons/matic.svg" alt="Polygon" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>Polygon</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ea9a9', fontSize: '14px' }}>Contract</span>
                <a href="https://polygonscan.com/token/0x5e6447c273300ac357c6713cb31a256345132609?a=0xb03aa911B7b59d83cA62EC1e5958e9F78fd1Be72" target="_blank" rel="noreferrer" style={{ color: '#E11D48', fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace', textDecoration: 'none' }}>0x5e64...2609</a>
              </div>
            </div>

            <div style={{ flex: 1, ...saTeContainerStyle, padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: '#E11D48', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Pre-sale Contract (35%)</div>
                <div style={{ color: '#9ea9a9', fontSize: '13px', lineHeight: '1.4' }}>Allocated to early participants who contribute to identity layer adoption and protocol expansion. 50% of initial utility contributions are programmatically allocated to initialize ecosystem liquidity.</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: '#9333EA', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Protocol Liquidity (25%)</div>
                <div style={{ color: '#9ea9a9', fontSize: '13px' }}>Locked for 12 months to ensure ecosystem stability.</div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: '#3B82F6', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Community Rewards (15%)</div>
                <div style={{ color: '#9ea9a9', fontSize: '13px', marginBottom: '4px' }}>6-Month Linear Vesting (16.66% monthly release).</div>
                <a href="https://www.pinksale.finance/pinklock/polygon/record/1007818" target="_blank" rel="noreferrer" style={{ color: '#3B82F6', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                  View Here <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                </a>
              </div>

              <div>
                <div style={{ color: '#F59E0B', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Team & Advisors (10%)</div>
                <div style={{ color: '#9ea9a9', fontSize: '13px', marginBottom: '4px' }}>12-Month Cliff Lock (100% locked until Mar 15, 2027).</div>
                <a href="https://www.pinksale.finance/pinklock/polygon/record/1007817" target="_blank" rel="noreferrer" style={{ color: '#3B82F6', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                  View Here <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
          <strong>Important Notice:</strong> NNM Tokens are digital utility units designed for use within the NNM ecosystem and its protocol functionalities. They are not securities, investment contracts, or financial instruments. Participation in this optional genesis distribution is entirely voluntary and may involve the complete loss of contributed digital assets due to the experimental nature of blockchain technologies. By proceeding, you acknowledge that you are acquiring NNM Tokens solely for their potential utility within the ecosystem and not with any expectation of profit or financial return.
        </p>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1a1c23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', maxWidth: '450px', width: '90%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Legal Confirmation</h3>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '24px' }}>
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: '#E11D48', cursor: 'pointer' }} />
              <span style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                I confirm that I have read and agree to the NNM Terms of Service and understand that NNM Tokens are digital utility tokens intended solely for use within the NNM ecosystem. I acknowledge that participation in this optional token distribution is voluntary, involves significant risk, and that I may lose the entire value of the digital assets contributed. I further confirm that I am not participating with any expectation of profit or financial return.
              </span>
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Cancel</button>
              <button onClick={handleConnectWallet} disabled={!acceptedTerms} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: acceptedTerms ? 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)' : 'rgba(255,255,255,0.1)', color: acceptedTerms ? '#fff' : 'rgba(255,255,255,0.3)', cursor: acceptedTerms ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: 'bold' }}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
