"use client";
import React, { useState, useEffect } from 'react';

const tokenomicsData = [
  { id: 0, name: "Pre-sale", percent: 35, amount: "3.5B", color: "#E11D48", offset: 0 },
  { id: 1, name: "Protocol Liquidity", percent: 25, amount: "2.5B", color: "#9333EA", offset: -35 },
  { id: 2, name: "Community Rewards", percent: 15, amount: "1.5B", color: "#3B82F6", offset: -60 },
  { id: 3, name: "Ecosystem Expansion", percent: 15, amount: "1.5B", color: "#10B981", offset: -75 },
  { id: 4, name: "Team & Advisors", percent: 10, amount: "1B", color: "#F59E0B", offset: -90 },
];

export default function PresalePage() {
  const [amount, setAmount] = useState('');
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

  return (
    <div style={{ backgroundColor: '#181A20', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflowX: 'hidden', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(225, 29, 72, 0.15) 0%, rgba(24, 26, 32, 0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, rgba(24, 26, 32, 0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker { display: flex; width: 200%; animation: marquee 20s linear infinite; }
        .ticker-item { white-space: nowrap; margin-right: 20px; font-size: 12px; color: #9ea9a9; }
        .ticker-item span { color: #E11D48; font-weight: bold; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 10px rgba(225, 29, 72, 0.2); } 50% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.4); } 100% { box-shadow: 0 0 10px rgba(225, 29, 72, 0.2); } }
        .chart-segment { transition: all 0.3s ease-out; cursor: pointer; }
        .chart-segment:hover, .chart-segment.active { stroke-width: 6; filter: drop-shadow(0px 0px 8px rgba(255,255,255,0.4)); }
        .legend-item { transition: all 0.3s ease; opacity: 0.7; }
        .legend-item:hover, .legend-item.active { opacity: 1; transform: translateY(-2px); background: rgba(255,255,255,0.05); }
      `}</style>

      <div style={{ display: 'flex', width: '100%', maxWidth: '1200px', zIndex: 1, gap: '40px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '80px' }}>
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', color: '#fff' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.2' }}>
            The NNM Protocol <br/>
            <span style={{ background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Web3 Identity coin Presales</span>
          </h1>
          <p style={{ color: '#9ea9a9', fontSize: '18px', maxWidth: '400px', lineHeight: '1.6' }}>
            Empowering the Polygon Ecosystem with Sovereign Identity and Institutional-Grade NFT Market Intelligence. A fully operational Web3 identity layer deployed on Polygon Mainnet. Join the most exclusive token launch. Secure your allocation before the public listing.
          </p>
        </div>

        <div style={{ flex: '1', minWidth: '350px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '420px', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)' }}>
            
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 0', overflow: 'hidden', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px', borderRadius: '12px' }}>
              <div className="ticker">
                <span className="ticker-item">0x8a...3f buys <span>15,000 NNM</span></span>
                <span className="ticker-item">0x2b...1a buys <span>50,000 NNM</span></span>
                <span className="ticker-item">0x9c...7d buys <span>5,000 NNM</span></span>
                <span className="ticker-item">0x8a...3f buys <span>15,000 NNM</span></span>
                <span className="ticker-item">0x2b...1a buys <span>50,000 NNM</span></span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(147, 51, 234, 0.2)', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#d8b4fe' }}>● Presale Live</div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                <div style={{ width: '16px', height: '16px', background: '#8247E5', borderRadius: '50%' }}></div> Polygon
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px', width: '60px', textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{value.toString().padStart(2, '0')}</div>
                  <div style={{ fontSize: '10px', color: '#9ea9a9', textTransform: 'uppercase' }}>{unit}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                <span style={{ color: '#9ea9a9' }}>Raised: <strong style={{ color: '#fff' }}>$1,250,000</strong></span>
                <span style={{ color: '#9ea9a9' }}>Target: <strong style={{ color: '#fff' }}>$3,500,000</strong></span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '35%', height: '100%', background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', borderRadius: '4px' }}></div>
              </div>
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
                <input type="number" placeholder="0.0" disabled value={amount ? Number(amount) * 10000 : ''} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', outline: 'none', width: '60%', fontWeight: 'bold' }} />
                <div style={{ background: 'rgba(225, 29, 72, 0.1)', padding: '6px 12px', borderRadius: '16px', color: '#E11D48', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
                  NNM
                </div>
              </div>
            </div>

            <button onClick={() => setShowModal(true)} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', animation: 'pulseGlow 2s infinite' }}>
              Connect Wallet
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1400px', zIndex: 1, marginBottom: '60px' }}>
        <h2 style={{ color: '#fff', fontSize: '48px', fontWeight: 'bold', textAlign: 'center', marginBottom: '50px' }}>
          NNM <span style={{ background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tokenomics</span>
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
          
          <div style={{ flex: '1', minWidth: '450px', background: 'rgba(147, 51, 234, 0.05)', border: '1px solid rgba(147, 51, 234, 0.15)', boxShadow: '0 0 30px rgba(147, 51, 234, 0.1)', borderRadius: '24px', padding: '50px', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginBottom: '60px' }}>
              {tokenomicsData.map((item) => (
                <div 
                  key={item.id}
                  className={`legend-item ${activeSegment === item.id ? 'active' : ''}`}
                  onMouseEnter={() => setActiveSegment(item.id)}
                  onMouseLeave={() => setActiveSegment(null)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '25px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: item.color }}></div>
                  <span style={{ fontSize: '22px', color: '#fff', fontWeight: 'bold' }}>{item.name} <span style={{ color: '#fff', marginLeft: '8px' }}>{item.percent}%</span></span>
                </div>
              ))}
            </div>

            <div style={{ position: 'relative', width: '380px', height: '380px', marginTop: '40px' }}>
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
                <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#fff', transition: 'all 0.3s ease' }}>
                  {activeSegment !== null ? tokenomicsData[activeSegment].amount : '10B'}
                </div>
                <div style={{ fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px' }}>
                  {activeSegment !== null ? 'NNM' : 'Total Supply'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: '1', minWidth: '450px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ background: 'rgba(147, 51, 234, 0.05)', border: '1px solid rgba(147, 51, 234, 0.15)', boxShadow: '0 0 30px rgba(147, 51, 234, 0.1)', borderRadius: '24px', padding: '40px', backdropFilter: 'blur(20px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '20px' }}>
                <span style={{ color: '#9ea9a9', fontSize: '24px' }}>Total Supply</span>
                <span style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>10 Billion</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '20px' }}>
                <span style={{ color: '#9ea9a9', fontSize: '24px' }}>Genesis Price</span>
                <span style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>$0.0001 per NNM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '20px' }}>
                <span style={{ color: '#9ea9a9', fontSize: '24px' }}>Chain</span>
                <span style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>Polygon</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ea9a9', fontSize: '24px' }}>Contract</span>
                <a href="https://polygonscan.com/address/0xb03aa911B7b59d83cA62EC1e5958e9F78fd1Be72" target="_blank" rel="noreferrer" style={{ color: '#E11D48', fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', textDecoration: 'none' }}>0xb03...Be72</a>
              </div>
            </div>

            <div style={{ background: 'rgba(147, 51, 234, 0.05)', border: '1px solid rgba(147, 51, 234, 0.15)', boxShadow: '0 0 30px rgba(147, 51, 234, 0.1)', borderRadius: '24px', padding: '40px', backdropFilter: 'blur(20px)' }}>
              <h3 style={{ color: '#fff', fontSize: '30px', fontWeight: 'bold', marginBottom: '30px' }}>Vesting & Locks</h3>
              
              <div style={{ marginBottom: '30px' }}>
                <div style={{ color: '#9333EA', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Protocol Liquidity (25%)</div>
                <div style={{ color: '#9ea9a9', fontSize: '20px' }}>Locked for 12 months to ensure ecosystem stability.</div>
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <div style={{ color: '#3B82F6', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Community Rewards (15%)</div>
                <div style={{ color: '#9ea9a9', fontSize: '20px' }}>6-Month Linear Vesting (16.66% monthly release).</div>
                <div style={{ color: '#1e3a8a', fontSize: '18px', marginTop: '8px', wordBreak: 'break-all', fontWeight: 'bold' }}>https://www.pinksale.finance/pinklock/polygon/record/1007818</div>
              </div>

              <div>
                <div style={{ color: '#F59E0B', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Team & Advisors (10%)</div>
                <div style={{ color: '#9ea9a9', fontSize: '20px' }}>12-Month Cliff Lock (100% locked until Mar 15, 2027).</div>
                <div style={{ color: '#1e3a8a', fontSize: '18px', marginTop: '8px', wordBreak: 'break-all', fontWeight: 'bold' }}>https://www.pinksale.finance/pinklock/polygon/record/1007817</div>
              </div>
            </div>

            <div style={{ background: 'rgba(225, 29, 72, 0.05)', border: '1px solid rgba(225, 29, 72, 0.2)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(20px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ color: '#E11D48', fontSize: '24px' }}>🔥</span>
                <span style={{ color: '#E11D48', fontSize: '24px', fontWeight: 'bold' }}>Automated Burn Protocol</span>
              </div>
              <p style={{ color: '#9ea9a9', fontSize: '18px', lineHeight: '1.6' }}>
                50% of protocol revenue generated from minting new digital name assets is permanently removed from circulation.
              </p>
            </div>

          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '40px auto 20px auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '15px', fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', lineHeight: '1.8' }}>
          <strong>Important Notice:</strong> NNM Tokens are digital utility units designed for use within the NNM ecosystem and its protocol functionalities. They are not securities, investment contracts, or financial instruments. Participation in this optional genesis distribution is entirely voluntary and may involve the complete loss of contributed digital assets due to the experimental nature of blockchain technologies. By proceeding, you acknowledge that you are acquiring NNM Tokens solely for their potential utility within the ecosystem and not with any expectation of profit or financial return.
        </p>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1a1c23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '30px', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Legal Confirmation</h3>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '30px' }}>
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ marginTop: '6px', width: '20px', height: '20px', accentColor: '#E11D48', cursor: 'pointer' }} />
              <span style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6' }}>
                I confirm that I have read and agree to the NNM Terms of Service and understand that NNM Tokens are digital utility tokens intended solely for use within the NNM ecosystem. I acknowledge that participation in this optional token distribution is voluntary, involves significant risk, and that I may lose the entire value of the digital assets contributed. I further confirm that I am not participating with any expectation of profit or financial return.
              </span>
            </label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>Cancel</button>
              <button onClick={handleConnectWallet} disabled={!acceptedTerms} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: 'none', background: acceptedTerms ? 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)' : 'rgba(255,255,255,0.1)', color: acceptedTerms ? '#fff' : 'rgba(255,255,255,0.3)', cursor: acceptedTerms ? 'pointer' : 'not-allowed', fontSize: '16px', fontWeight: 'bold' }}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
