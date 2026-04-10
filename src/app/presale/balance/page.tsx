'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function BalancePage() {
  const { address, isConnected } = useAccount();
  
  const [presaleData, setPresaleData] = useState({ investedUsd: 0, tokensBought: 0, history: [] as any[] });
  const [rewardsBalance, setRewardsBalance] = useState<number>(0);
  const [socialPoints, setSocialPoints] = useState<number>(0);
  const [ecosystemPoints, setEcosystemPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const isPresaleEnded = false; 
  const listingPrice = 0.005;

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

        const rewardsRes = await fetch('/api/campaign', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ action: 'getConviction', address }) 
        });
        const rewardsJson = await rewardsRes.json();
        if (!rewardsJson.error) {
          setRewardsBalance(rewardsJson.wallet?.claimable_nnm ? Number(rewardsJson.wallet.claimable_nnm) : 0);
          setSocialPoints(rewardsJson.social_points || 0);
          setEcosystemPoints(rewardsJson.ecosystem_points || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [address]);

  const totalNnmBalance = presaleData.tokensBought + rewardsBalance + socialPoints + ecosystemPoints;
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

  const labelStyle = { color: '#9ea9a9', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
  const valueStyle = { color: '#f8fafc', fontSize: '18px', fontWeight: '500', fontFamily: 'monospace' };

  return (
    <div style={{ backgroundColor: '#050a16', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 20px', fontFamily: 'sans-serif' }}>
      
      <style>{`
        .static-neon-btn {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 75, 130, 0.25);
            padding: 8.5px 18px;
            border-radius: 30px;
            backdrop-filter: blur(10px);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
        }
        .static-neon-btn span {
            background: linear-gradient(90deg, #9b51e0 0%, #ff4b82 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: bold;
            font-size: 12px;
        }
        .static-neon-btn:hover {
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 20px rgba(255, 75, 130, 0.4);
        }

        @media (max-width: 767px) {
            .mobile-full-width {
                flex-wrap: nowrap !important;
                gap: 6px !important;
                width: 100% !important;
                padding: 0 !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            .mobile-full-width > a {
                flex: 1 !important;
                display: flex !important;
                min-width: 0 !important;
            }
            .static-neon-btn {
                width: 100% !important;
                padding: 8.5px 0 !important;
            }
            .static-neon-btn span {
                font-size: 10px !important;
                letter-spacing: -0.5px !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }
        }
      `}</style>

      <div className="mobile-full-width" style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '15px', justifyContent: 'flex-start', marginBottom: '60px', flexWrap: 'wrap' }}>
          <Link href="/Rewards" style={{ textDecoration: 'none' }}>
              <button className="static-neon-btn">
                  <span>Rewards</span>
              </button>
          </Link>
          <Link href="/presale" style={{ textDecoration: 'none' }}>
              <button className="static-neon-btn">
                  <span>$ NNM Utility</span>
              </button>
          </Link>
          <Link href="/join" style={{ textDecoration: 'none' }}>
              <button className="static-neon-btn">
                  <span>Join Socials</span>
              </button>
          </Link>
      </div>

      <div style={{ 
          width: '100%', 
          maxWidth: '1000px', 
          marginBottom: '40px', 
          background: 'rgba(147, 51, 234, 0.05)', 
          border: '1px solid rgba(147, 51, 234, 0.11)', 
          boxShadow: '0 0 30px rgba(147, 51, 234, 0.11)', 
          borderRadius: '10px',
          backdropFilter: 'blur(15px)',
          overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto', padding: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ ...labelStyle, padding: '0 16px 16px 16px' }}>Presale Allocated</th>
                <th style={{ ...labelStyle, padding: '0 16px 16px 16px' }}>Conviction</th>
                <th style={{ ...labelStyle, padding: '0 16px 16px 16px' }}>Social Points</th>
                <th style={{ ...labelStyle, padding: '0 16px 16px 16px' }}>Ecosystem</th>
                <th style={{ ...labelStyle, padding: '0 16px 16px 16px' }}>Total Value (@ $0.005)</th>
                <th style={{ ...labelStyle, padding: '0 16px 16px 16px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/logo-coyn-nnm.png" alt="NNM" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    <span style={valueStyle}>{isLoading ? '...' : presaleData.tokensBought.toLocaleString()}</span>
                  </div>
                </td>
                <td style={{ padding: '0 16px' }}>
                  <span style={valueStyle}>{isLoading ? '...' : rewardsBalance.toLocaleString()}</span>
                </td>
                <td style={{ padding: '0 16px' }}>
                  <span style={valueStyle}>{isLoading ? '...' : socialPoints.toLocaleString()}</span>
                </td>
                <td style={{ padding: '0 16px' }}>
                  <span style={valueStyle}>{isLoading ? '...' : ecosystemPoints.toLocaleString()}</span>
                </td>
                <td style={{ padding: '0 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ ...valueStyle, fontSize: '20px', fontWeight: 'normal' }}>{isLoading ? '...' : totalNnmBalance.toLocaleString()}</span>
                    <span style={{ color: '#10B981', fontSize: '13px', fontWeight: 'normal', marginTop: '4px' }}>
                      ≈ ${totalValueAtListing.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '0 16px', textAlign: 'center', verticalAlign: 'middle' }}>
                  <button 
                    disabled={!isPresaleEnded}
                    style={{ 
                      minWidth: '120px',
                      background: 'linear-gradient(90deg, #a200ff 0%, #ff0055 100%)', 
                      border: 'none', 
                      color: 'white', 
                      padding: '8px 16px', 
                      borderRadius: '8px', 
                      fontSize: '11px', 
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      cursor: isPresaleEnded ? 'pointer' : 'not-allowed',
                      opacity: isPresaleEnded ? 1 : 0.6,
                      whiteSpace: 'nowrap'
                    }}>
                    {isPresaleEnded ? 'Claim Tokens' : 'Locked 🔒'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1000px', background: 'rgba(147, 51, 234, 0.03)', border: '1px solid rgba(147, 51, 234, 0.1)', borderRadius: '10px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{ color: '#f8fafc', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Participation History</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
              <tr>
                <th style={{ padding: '16px 24px', color: '#9ea9a9', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '16px 24px', color: '#9ea9a9', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Contribution (USD)</th>
                <th style={{ padding: '16px 24px', color: '#9ea9a9', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>NNM Allocated</th>
                <th style={{ padding: '16px 24px', color: '#9ea9a9', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'right' }}>Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {presaleData.history.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    No activity found yet.
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
