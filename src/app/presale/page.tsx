"use client";
import React, { useState, useEffect } from 'react';

export default function NNMPresalePage() {
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
    <div style={{ backgroundColor: '#181A20', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', position: 'relative', overflowX: 'hidden', paddingBottom: '40px' }}>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 10px rgba(225, 29, 72, 0.2); } 50% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.4); } 100% { box-shadow: 0 0 10px rgba(225, 29, 72, 0.2); } }
      `}</style>

      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vh', background: 'radial-gradient(circle, rgba(225, 29, 72, 0.15) 0%, rgba(24, 26, 32, 0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '50vw', height: '50vh', background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, rgba(24, 26, 32, 0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>

      <div style={{ paddingTop: '60px', paddingBottom: '60px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', width: '100%', maxWidth: '420px', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
          
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 0', overflow: 'hidden', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'inline-block', animation: 'marquee 20s linear infinite' }}>
              <span style={{ margin: '0 20px', fontSize: '12px', color: '#9ea9a9' }}>0x8a...3f buys 15,000 NNM</span>
              <span style={{ margin: '0 20px', fontSize: '12px', color: '#9ea9a9' }}>0x2b...1a buys 50,000 NNM</span>
              <span style={{ margin: '0 20px', fontSize: '12px', color: '#9ea9a9' }}>0x9c...7d buys 5,000 NNM</span>
              <span style={{ margin: '0 20px', fontSize: '12px', color: '#9ea9a9' }}>0x8a...3f buys 15,000 NNM</span>
              <span style={{ margin: '0 20px', fontSize: '12px', color: '#9ea9a9' }}>0x2b...1a buys 50,000 NNM</span>
            </div>
          </div>

          <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(147, 51, 234, 0.2)', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#d8b4fe' }}>● Presale Live</div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width: '16px', height: '16px', background: '#8247E5', borderRadius: '50%' }}></div> Polygon
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px', width: '60px', textAlign: 'center' }}>
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

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '16px', padding: '16px', marginBottom: '16px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9ea9a9', fontSize: '13px' }}>You Pay</span>
                <span style={{ color: '#9ea9a9', fontSize: '13px' }}>Balance: 0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', outline: 'none', width: '60%', fontWeight: '600' }} />
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold' }}>POL ▼</div>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '16px', padding: '16px', marginBottom: '24px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9ea9a9', fontSize: '13px' }}>You Get</span>
                <span style={{ color: '#9ea9a9', fontSize: '13px' }}>1 NNM = $0.0001</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input type="number" placeholder="0.0" disabled value={amount ? Number(amount) * 10000 : ''} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', outline: 'none', width: '60%', fontWeight: '600' }} />
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold' }}>NNM</div>
              </div>
            </div>

            <button onClick={() => setShowModal(true)} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', animation: 'pulseGlow 2s infinite' }}>
              Connect Wallet
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '60px 20px', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>The <span style={{ background: 'linear-gradient(90deg, #E11D48, #9333EA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NNM Protocol</span></h2>
        <p style={{ color: '#9ea9a9', fontSize: '16px', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6' }}>
          Empowering the Polygon Ecosystem with Sovereign Identity and Institutional-Grade NFT Market Intelligence. A fully operational Web3 identity layer deployed on Polygon Mainnet.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(225, 29, 72, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#E11D48', fontWeight: 'bold' }}>1</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>ChainFace Identity</h3>
            <p style={{ color: '#9ea9a9', fontSize: '14px', lineHeight: '1.6' }}>Transforming purely speculative NFTs into hyper-functional Web3 utilities via verified cross-chain payment dashboards.</p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(147, 51, 234, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#9333EA', fontWeight: 'bold' }}>2</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>The NGX Global Index</h3>
            <p style={{ color: '#9ea9a9', fontSize: '14px', lineHeight: '1.6' }}>The authoritative observatory for the NFT asset class, featuring Ecosystem Sentiment, Aggregated Volume, and Sector Market Cap.</p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#3B82F6', fontWeight: 'bold' }}>3</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Conviction Rank</h3>
            <p style={{ color: '#9ea9a9', fontSize: '14px', lineHeight: '1.6' }}>An immutable, sybil-resistant ranking system rewarding genuine community belief over artificial wash trading.</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '60px 20px', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' }}>Tokenomics & Vesting</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '250px', height: '250px', borderRadius: '50%', background: 'conic-gradient(#E11D48 0% 35%, #9333EA 35% 60%, #3B82F6 60% 75%, #10B981 75% 90%, #F59E0B 90% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '30px' }}>
              <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: '#1a1c23', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '28px', fontWeight: 'bold' }}>10B</span>
                <span style={{ fontSize: '12px', color: '#9ea9a9' }}>Total Supply</span>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%', maxWidth: '350px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#E11D48' }}></div> 35% Early Network</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#9333EA' }}></div> 25% Liquidity</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#3B82F6' }}></div> 15% Rewards</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#10B981' }}></div> 15% Partnerships</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#F59E0B' }}></div> 10% Contributors</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>Protocol Liquidity (25%)</div>
              <div style={{ fontSize: '12px', color: '#9ea9a9' }}>Locked for 12 months to ensure long-term stability.</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>Community Rewards (15%)</div>
              <div style={{ fontSize: '12px', color: '#9ea9a9' }}>6-Month Linear Vesting (16.66% monthly release).</div>
              <div style={{ fontSize: '10px', color: '#9333EA', marginTop: '6px', wordBreak: 'break-all' }}>Contract: 0xAf78a2C02D4C9e0e79Be5AaCF84379919C071ec9</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>Core Contributors (10%)</div>
              <div style={{ fontSize: '12px', color: '#9ea9a9' }}>12-Month Cliff Lock until March 15, 2027.</div>
              <div style={{ fontSize: '10px', color: '#9333EA', marginTop: '6px', wordBreak: 'break-all' }}>Contract: 0xB8945be19F938ABDe60D126104C14dA502b53778</div>
            </div>
            <div style={{ background: 'rgba(225, 29, 72, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(225, 29, 72, 0.3)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#E11D48', marginBottom: '4px' }}>Automated Burn Protocol</div>
              <div style={{ fontSize: '12px', color: '#9ea9a9' }}>50% of the protocol revenue generated from minting new digital name assets is permanently removed from circulation.</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '60px auto 20px auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', lineHeight: '1.8' }}>
          <strong>Important Notice:</strong> NNM Tokens are digital utility units designed for use within the NNM ecosystem and its protocol functionalities. They are not securities, investment contracts, or financial instruments. Participation in this optional genesis distribution is entirely voluntary and may involve the complete loss of contributed digital assets due to the experimental nature of blockchain technologies. By proceeding, you acknowledge that you are acquiring NNM Tokens solely for their potential utility within the ecosystem and not with any expectation of profit or financial return.
        </p>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1a1c23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '30px', maxWidth: '450px', width: '90%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Legal Confirmation</h3>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '24px' }}>
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: '#E11D48' }} />
              <span style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                I confirm that I have read and agree to the NNM Terms of Service and understand that NNM Tokens are digital utility tokens intended solely for use within the NNM ecosystem. I acknowledge that participation in this optional token distribution is voluntary, involves significant risk, and that I may lose the entire value of the digital assets contributed. I further confirm that I am not participating with any expectation of profit or financial return.
              </span>
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConnectWallet} disabled={!acceptedTerms} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: acceptedTerms ? 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)' : 'rgba(255,255,255,0.1)', color: acceptedTerms ? '#fff' : 'rgba(255,255,255,0.3)', cursor: acceptedTerms ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
