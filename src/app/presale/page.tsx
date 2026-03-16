"use client";
import React, { useState } from 'react';

const tokenomicsData = [
  { id: 0, name: "Early Network Bootstrapping", percent: 35, amount: "3.5B", color: "#E11D48", offset: 0 },
  { id: 1, name: "Protocol Liquidity", percent: 25, amount: "2.5B", color: "#9333EA", offset: -35 },
  { id: 2, name: "Community & Ecosystem Rewards", percent: 15, amount: "1.5B", color: "#3B82F6", offset: -60 },
  { id: 3, name: "Ecosystem Expansion", percent: 15, amount: "1.5B", color: "#10B981", offset: -75 },
  { id: 4, name: "Core Contributors", percent: 10, amount: "1B", color: "#F59E0B", offset: -90 },
];

export default function PresalePage() {
  const [amount, setAmount] = useState('');
  const [activeSegment, setActiveSegment] = useState<number | null>(null);

  return (
    <div style={{ backgroundColor: '#181A20', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      {/* Background Glow Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(225, 29, 72, 0.2) 0%, rgba(24, 26, 32, 0) 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, rgba(24, 26, 32, 0) 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker {
          display: flex;
          width: 200%;
          animation: marquee 20s linear infinite;
        }
        .ticker-item {
          white-space: nowrap;
          margin-right: 20px;
          font-size: 12px;
          color: #9ea9a9;
        }
        .ticker-item span {
          color: #E11D48;
          font-weight: bold;
        }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .chart-segment {
          transition: all 0.3s ease-out;
          cursor: pointer;
        }
        .chart-segment:hover, .chart-segment.active {
          stroke-width: 6;
          filter: drop-shadow(0px 0px 8px rgba(255,255,255,0.4));
        }
        .legend-item {
          transition: all 0.3s ease;
          opacity: 0.7;
        }
        .legend-item:hover, .legend-item.active {
          opacity: 1;
          transform: translateY(-2px);
          background: rgba(255,255,255,0.05);
        }
      `}</style>

      {/* --- SECTION 1: HEADER & PRESALE BOX (UNCHANGED) --- */}
      <div style={{ display: 'flex', width: '100%', maxWidth: '1100px', zIndex: 1, gap: '40px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '80px' }}>
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', color: '#fff' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.2' }}>
            The NNM Protocol <br/>
            <span style={{ background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Web3 Identity coin Presales</span>
          </h1>
          <p style={{ color: '#9ea9a9', fontSize: '18px', maxWidth: '400px', lineHeight: '1.6' }}>
            Join the most exclusive token launch. Secure your allocation before the public listing.
          </p>
        </div>

        <div style={{ flex: '1', minWidth: '350px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '420px', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#9ea9a9', fontSize: '12px', marginBottom: '4px' }}>Stage Raised</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>$44,636</span>
                  <span style={{ color: '#9ea9a9', fontSize: '12px' }}>/ $163,000</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', position: 'relative' }}>
                <p style={{ color: '#9ea9a9', fontSize: '12px', marginBottom: '4px' }}>Listing Price</p>
                <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>$0.1</span>
                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', transform: 'rotate(8deg)', background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>+900%</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#9ea9a9', fontSize: '12px' }}>Stage 1</span>
              <span style={{ color: '#9ea9a9', fontSize: '12px' }}>27%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '27%', background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', borderRadius: '10px' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
               <div>
                  <span style={{ color: '#9ea9a9', fontSize: '12px' }}>Current Price: </span>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>$0.0100</span>
               </div>
               <div>
                  <span style={{ color: '#9ea9a9', fontSize: '12px' }}>Rate: </span>
                  <span style={{ color: '#9333EA', fontSize: '12px', fontWeight: 'bold' }}>100 NNM/$1</span>
               </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '8px', marginBottom: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="ticker">
                 <div className="ticker-item">0x6f...1ff8 buys <span>0.001 ETH</span></div>
                 <div className="ticker-item">0x39...9d1d buys <span>0.010 BNB</span></div>
                 <div className="ticker-item">0x9a...2b4c buys <span>0.050 ETH</span></div>
                 <div className="ticker-item">0x1f...8x9p buys <span>100 USDT</span></div>
                 <div className="ticker-item">0x6f...1ff8 buys <span>0.001 ETH</span></div>
                 <div className="ticker-item">0x39...9d1d buys <span>0.010 BNB</span></div>
                 <div className="ticker-item">0x9a...2b4c buys <span>0.050 ETH</span></div>
                 <div className="ticker-item">0x1f...8x9p buys <span>100 USDT</span></div>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '16px', padding: '16px', marginBottom: '12px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <span style={{ color: '#9ea9a9', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>You Pay</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['$10', '$50', '$100'].map(val => (
                     <button key={val} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: '12px', cursor: 'pointer' }}>{val}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', outline: 'none', width: '60%', fontWeight: 'bold' }} />
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
                  POL ▼
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <p style={{ color: '#9ea9a9', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>You Receive</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input type="number" placeholder="0.0" disabled style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', outline: 'none', width: '60%', fontWeight: 'bold' }} />
                <div style={{ background: 'rgba(225, 29, 72, 0.1)', padding: '6px 12px', borderRadius: '16px', color: '#E11D48', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
                  NNM
                </div>
              </div>
            </div>

            <button style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 24px rgba(225, 29, 72, 0.3)' }}>
              Connect Wallet
            </button>

          </div>
        </div>
      </div>

      {/* --- SECTION 2: TOKENOMICS & VESTING (NEW) --- */}
      <div style={{ width: '100%', maxWidth: '1100px', zIndex: 1 }}>
        <h2 style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px' }}>
          NNM <span style={{ background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tokenomics</span>
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
          
          {/* Left Container: Interactive Donut Chart */}
          <div style={{ flex: '1', minWidth: '350px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Legends */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
              {tokenomicsData.map((item) => (
                <div 
                  key={item.id}
                  className={`legend-item ${activeSegment === item.id ? 'active' : ''}`}
                  onMouseEnter={() => setActiveSegment(item.id)}
                  onMouseLeave={() => setActiveSegment(null)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.03)' }}
                >
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                  <span style={{ fontSize: '11px', color: '#fff', fontWeight: '500' }}>{item.name} <span style={{ color: '#9ea9a9' }}>{item.percent}%</span></span>
                </div>
              ))}
            </div>

            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '280px', height: '280px' }}>
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
              
              {/* Center Text */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', transition: 'all 0.3s ease' }}>
                  {activeSegment !== null ? tokenomicsData[activeSegment].amount : '10B'}
                </div>
                <div style={{ fontSize: '12px', color: '#9ea9a9', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {activeSegment !== null ? 'NNM' : 'Total Supply'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Container: Token Details */}
          <div style={{ flex: '1', minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* General Info */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '12px' }}>
                <span style={{ color: '#9ea9a9', fontSize: '13px' }}>Genesis Token Price</span>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>$0.0001 per NNM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '12px' }}>
                <span style={{ color: '#9ea9a9', fontSize: '13px' }}>Max Allocation (Hardcap)</span>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>3.5B NNM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '12px' }}>
                <span style={{ color: '#9ea9a9', fontSize: '13px' }}>Accepted Payments</span>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>POL, USDT (Polygon)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ea9a9', fontSize: '13px' }}>Genesis Contract</span>
                <span style={{ color: '#E11D48', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>0xb03...Be72</span>
              </div>
            </div>

            {/* Vesting Specs */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '24px', backdropFilter: 'blur(20px)' }}>
              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Vesting & Locks</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: '#9333EA', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Protocol Liquidity (25%)</div>
                <div style={{ color: '#9ea9a9', fontSize: '12px' }}>Locked for 12 months to ensure ecosystem stability.</div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: '#3B82F6', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Community Rewards (15%)</div>
                <div style={{ color: '#9ea9a9', fontSize: '12px' }}>6-Month Linear Vesting (16.66% monthly release).</div>
              </div>

              <div>
                <div style={{ color: '#F59E0B', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Core Contributors (10%)</div>
                <div style={{ color: '#9ea9a9', fontSize: '12px' }}>12-Month Cliff Lock (100% locked until Mar 15, 2027).</div>
              </div>
            </div>

            {/* Burn Mechanism */}
            <div style={{ background: 'rgba(225, 29, 72, 0.05)', border: '1px solid rgba(225, 29, 72, 0.2)', borderRadius: '24px', padding: '20px', backdropFilter: 'blur(20px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#E11D48', fontSize: '18px' }}>🔥</span>
                <span style={{ color: '#E11D48', fontSize: '14px', fontWeight: 'bold' }}>Automated Burn Protocol</span>
              </div>
              <p style={{ color: '#9ea9a9', fontSize: '12px', lineHeight: '1.6' }}>
                50% of protocol revenue generated from minting new digital name assets is permanently removed from circulation to support long-term ecosystem sustainability.
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
