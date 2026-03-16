import React, { useState } from 'react';

export default function PresalePage() {
  const [amount, setAmount] = useState('');

  return (
    <div style={{ backgroundColor: '#181A20', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <div style={{ position: 'absolute', top: '15%', left: '25%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(225, 29, 72, 0.25) 0%, rgba(24, 26, 32, 0) 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '15%', right: '25%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, rgba(24, 26, 32, 0) 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '480px', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)' }}>
        <h1 style={{ color: '#fff', textAlign: 'center', fontSize: '32px', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}>Swap LCAI Anywhere</h1>
        
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '16px', padding: '20px', margin: '24px 0 8px 0', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#9ea9a9', fontSize: '14px', fontWeight: '500' }}>You Pay</span>
            <span style={{ color: '#9ea9a9', fontSize: '14px', fontWeight: '500' }}>Balance: 0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', outline: 'none', width: '60%', fontWeight: '600' }} />
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
              LCAI ▼
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '-16px 0', position: 'relative', zIndex: 2 }}>
          <div style={{ background: '#181A20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            ⇅
          </div>
        </div>

        <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid rgba(255, 255, 255, 0.03)', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#9ea9a9', fontSize: '14px', fontWeight: '500' }}>You Get</span>
            <span style={{ color: '#9ea9a9', fontSize: '14px', fontWeight: '500' }}>Balance: 0 USDT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input type="number" placeholder="0.0" disabled style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', outline: 'none', width: '60%', fontWeight: '600' }} />
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
              USDT ▼
            </div>
          </div>
        </div>

        <button style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', color: '#fff', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 24px rgba(225, 29, 72, 0.3)' }}>
          Connect Wallet
        </button>
      </div>
    </div>
  );
}
