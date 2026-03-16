"use client";
import React, { useState } from 'react';

export default function PresalePage() {
  const [amount, setAmount] = useState('');

  return (
    <div style={{ backgroundColor: '#181A20', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif', padding: '20px' }}>
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
      `}</style>

      <div style={{ display: 'flex', width: '100%', maxWidth: '1100px', zIndex: 1, gap: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
        
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', color: '#fff' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.2' }}>
            The Future of <br/>
            <span style={{ background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Web3 Presales</span>
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
                  <span style={{ color: '#9333EA', fontSize: '12px', fontWeight: 'bold' }}>100 LCAI/$1</span>
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
                  BNB ▼
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <p style={{ color: '#9ea9a9', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>You Receive</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input type="number" placeholder="0.0" disabled style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', outline: 'none', width: '60%', fontWeight: 'bold' }} />
                <div style={{ background: 'rgba(225, 29, 72, 0.1)', padding: '6px 12px', borderRadius: '16px', color: '#E11D48', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
                  LCAI
                </div>
              </div>
            </div>

            <button style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 24px rgba(225, 29, 72, 0.3)' }}>
              Connect Wallet
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
