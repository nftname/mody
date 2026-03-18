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
    flex: 1,
    minWidth: '280px',
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(15px)',
    borderRadius: '16px',
    padding: '24px',
    borderLeft: '1px solid rgba(255,255,255,0.05)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  return (
    <div style={{ backgroundColor: '#050a16', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      
      <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '40px' }}>
        <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>
          My <span style={{ background: 'linear-gradient(90deg, #9333EA 0%, #E11D48 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Portfolio</span>
        </h1>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%', maxWidth: '1200px', marginBottom: '50px' }}>
        
        <div style={{ ...cardStyle, borderTop: '2px solid transparent', borderImage: 'linear-gradient(90deg, #3B82F6, #9333EA) 1', boxShadow: '0 -5px 20px rgba(59, 130, 246, 0.1)' }}>
          <span style={{ color: '#9ea9a9', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Invested & Allocation</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto' }}>
            <span style={{ color: '#10B981', fontSize: '18px', fontWeight: 'bold' }}>${presaleData.investedUsd.toLocaleString()}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo-coyn-nnm.png" alt="NNM" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
              <span style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {presaleData.tokensBought.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, borderTop: '2px solid transparent', borderImage: 'linear-gradient(90deg, #9333EA, #E11D48) 1', boxShadow: '0 -5px 20px rgba(147, 51, 234, 0.1)' }}>
          <span style={{ color: '#9ea9a9', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Conviction Rewards</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
            <img src="/logo-coyn-nnm.png" alt="NNM" style={{ width: '32px', height: '32px', borderRadius: '50%', filter: 'grayscale(30%)' }} />
            <span style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {isLoading ? '...' : rewardsBalance.toLocaleString()}
            </span>
          </div>
        </div>

        <div style={{ ...cardStyle, borderTop: '2px solid transparent', borderImage: 'linear-gradient(90deg, #E11D48, #F59E0B) 1', boxShadow: '0 -5px 20px rgba(225, 29, 72, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#9ea9a9', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Listing Value</span>
            {isPresaleEnded && (
              <button style={{ background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                Claim Now
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
            <span style={{ color: '#10B981', fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace' }}>
              ${totalValueAtListing.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>@ $0.001</span>
          </div>
        </div>

      </div>

      <div style={{ width: '100%', maxWidth: '1000px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Presale Transaction History</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
              <tr>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: 'normal', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: 'normal', textTransform: 'uppercase' }}>Invested (USD)</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: 'normal', textTransform: 'uppercase' }}>Tokens Bought</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: 'normal', textTransform: 'uppercase', textAlign: 'right' }}>Transaction</th>
              </tr>
            </thead>
            <tbody>
              {presaleData.history.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    No transactions found yet.
                  </td>
                </tr>
              ) : (
                presaleData.history.map((tx, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '16px 24px', color: '#f8fafc', fontSize: '13px' }}>
                      {new Date(tx.created_at).toLocaleString()}
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
