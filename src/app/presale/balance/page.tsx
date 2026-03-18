'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function BalancePage() {
  const { address, isConnected } = useAccount();
  
  const [presaleData, setPresaleData] = useState({ investedUsd: 0, tokensBought: 0, history: [] as any[] });
  const [rewardsBalance, setRewardsBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const isPresaleEnded = false; 
  const listingPrice = 0.001;

  useEffect(() => {
    if (!address) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const presaleRes = await fetch(`/api/presale?wallet=${address}`);
        const presaleJson = await presaleRes.json();
        if (presaleJson.success) {
          setPresaleData({
            investedUsd: presaleJson.totalInvestedUsd,
            tokensBought: presaleJson.totalTokensBought,
            history: presaleJson.history
          });
        }

        const rewardsRes = await fetch('/api/dashboard', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ action: 'getConviction', address }) 
        });
        const rewardsJson = await rewardsRes.json();
        if (!rewardsJson.error && rewardsJson.wallet) {
          setRewardsBalance(Number(rewardsJson.wallet.claimable_nnm) || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [address]);

  const totalNnmBalance = presaleData.tokensBought + rewardsBalance;
  const totalValueAtListing = totalNnmBalance * listingPrice;

  if (!isConnected) {
    return (
      <div style={{ backgroundColor: '#050a16', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <h2 style={{ marginBottom: '16px' }}>Connect Your Wallet</h2>
        </div>
      </div>
    );
  }

  const cardStyle = {
    flex: '1',
    minWidth: '0',
    background: 'rgba(147, 51, 234, 0.05)', 
    border: '1px solid rgba(147, 51, 234, 0.11)', 
    boxShadow: '0 0 30px rgba(147, 51, 234, 0.11)', 
    borderRadius: '20px',
    backdropFilter: 'blur(15px)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    overflow: 'hidden'
  };

  const labelStyle = { color: '#9ea9a9', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
  const valueStyle = { color: '#f8fafc', fontSize: '18px', fontWeight: '500', fontFamily: 'monospace' };

  return (
    <div style={{ backgroundColor: '#050a16', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '15px', width: '100%', maxWidth: '1000px', marginBottom: '40px', justifyContent: 'center' }}>
        
        <div style={cardStyle}>
          <div style={{ display: 'flex' }}>
            <span style={{ ...labelStyle, width: '40%' }}>Invested (USD)</span>
            <span style={labelStyle}>Total NNM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
            <span style={{ ...valueStyle, color: '#10B981', width: '40%' }}>${presaleData.investedUsd.toLocaleString()}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src="/logo-coyn-nnm.png" alt="" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
              <span style={valueStyle}>{presaleData.tokensBought.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', width: '100%' }}>
            <span id="rewards-label" style={labelStyle}>Conviction Rewards</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto', paddingLeft: '45px' }}>
             <img src="/logo-coyn-nnm.png" alt="" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
             <span style={valueStyle}>{isLoading ? '...' : rewardsBalance.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ ...cardStyle, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <span style={labelStyle}>Est. Listing Value (@ $0.001)</span>
            <span style={{ ...valueStyle, color: '#10B981', fontSize: '26px' }}>
              ${totalValueAtListing.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', width: '35%' }}>
            <span style={{ color: '#9ea9a9', fontSize: '10px', fontWeight: 'bold' }}>Available at TGE</span>
            <button 
              disabled={!isPresaleEnded}
              style={{ 
                width: '100%',
                background: isPresaleEnded ? 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)' : 'rgba(255,255,255,0.05)', 
                border: isPresaleEnded ? 'none' : '1px solid rgba(255,255,255,0.1)', 
                color: isPresaleEnded ? '#fff' : '#64748b', 
                padding: '8px 0', 
                borderRadius: '8px', 
                fontSize: '11px', 
                fontWeight: 'bold', 
                cursor: isPresaleEnded ? 'pointer' : 'not-allowed',
                boxShadow: isPresaleEnded ? '0 4px 15px rgba(225, 29, 72, 0.3)' : 'none',
                whiteSpace: 'nowrap'
              }}>
              Claim
            </button>
          </div>
        </div>

      </div>

      <div style={{ width: '100%', maxWidth: '1000px', background: 'rgba(147, 51, 234, 0.03)', border: '1px solid rgba(147, 51, 234, 0.1)', borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{ color: '#f8fafc', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Presale Transaction History</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
              <tr>
                <th style={{ padding: '16px 24px', color: '#9ea9a9', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '16px 24px', color: '#9ea9a9', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Invested (USD)</th>
                <th style={{ padding: '16px 24px', color: '#9ea9a9', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Tokens Bought</th>
                <th style={{ padding: '16px 24px', color: '#9ea9a9', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'right' }}>Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {presaleData.history.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    No transactions found yet.
                  </td>
                </tr>
              ) : (
                presaleData.history.map((tx, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '16px 24px', color: '#f8fafc', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {new Date(tx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} 
                      <span style={{ color: '#9ea9a9', marginLeft: '6px', fontSize: '11px' }}>
                        {new Date(tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#10B981', fontSize: '13px', fontWeight: 'bold' }}>
                      ${Number(tx.amount_usd).toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>
                      {Number(tx.tokens_bought).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <a href={`https://polygonscan.com/tx/${tx.tx_hash}`} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', fontSize: '13px', textDecoration: 'none' }}>
                        {tx.tx_hash.slice(0, 6)}...{tx.tx_hash.slice(-4)}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
