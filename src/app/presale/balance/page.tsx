
'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { parseAbi } from 'viem';

// --- Constants & ABIs ---
const PRESALE_ADDRESS = "0xb03aa911B7b59d83cA62EC1e5958e9F78fd1Be72";

const PRESALE_ABI = parseAbi([
  "function purchases(address) view returns (uint256 totalTokens, uint256 firstClaimed)",
  "function getCurrentTier() view returns (uint256)",
  "function tiers(uint256) view returns (uint256, uint256)"
]);

export default function BalancePage() {
  const { address, isConnected } = useAccount();
  
  // --- States ---
  const [rewardsBalance, setRewardsBalance] = useState<number>(0);
  const [isLoadingRewards, setIsLoadingRewards] = useState<boolean>(true);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]); // سيتم ملؤه من الـ API الخاص بك
  
  // مفتاح التحكم في ظهور زر المطالبة (يتغير إلى true عند انتهاء البريسيل)
  const isPresaleEnded = false; 

  // --- Blockchain Data Fetching ---
  const { data: purchaseData } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PRESALE_ABI,
    functionName: 'purchases',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: currentTierIndex } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PRESALE_ABI,
    functionName: 'getCurrentTier',
  });

  const { data: tierData } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PRESALE_ABI,
    functionName: 'tiers',
    args: [currentTierIndex ?? BigInt(0)],
    query: { enabled: currentTierIndex !== undefined }
  });

  // --- Calculations ---
  const boughtBalance = purchaseData ? Number(purchaseData[0]) / 1e18 : 0;
  const liveTokensPerUsd = tierData ? Number(tierData[0]) : 10000;
  const currentPriceUsd = liveTokensPerUsd > 0 ? 1 / liveTokensPerUsd : 0.0001;

  const totalNnmBalance = boughtBalance + rewardsBalance;
  const totalValueUsd = totalNnmBalance * currentPriceUsd;

  // --- Secure API Fetching (Rewards & History) ---
  useEffect(() => {
    if (!address) return;

    const fetchSecureData = async () => {
      setIsLoadingRewards(true);
      try {
        // 1. Fetch Rewards from your secure Dashboard API
        const res = await fetch('/api/dashboard', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ action: 'getConviction', address }) 
        });
        const { wallet, error } = await res.json();
        
        if (!error && wallet) {
          setRewardsBalance(Number(wallet.claimable_nnm) || 0);
        }

        // 2. Fetch Transaction History (Mocked here, replace with your DB call)
        // You can create another action in your API like 'getPresaleHistory'
        const mockHistory = [
          // { date: '2026-03-20T10:30:00Z', amountUsd: 50, hash: '0x123...abc' }
        ];
        setTransactionHistory(mockHistory);

      } catch (e) {
        console.error("Failed to fetch secure data", e);
      } finally {
        setIsLoadingRewards(false);
      }
    };

    fetchSecureData();
  }, [address]);

  // --- UI Components ---
  if (!isConnected) {
    return (
      <div style={{ backgroundColor: '#050a16', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <h2 style={{ marginBottom: '16px' }}>Connect Your Wallet</h2>
          <p style={{ color: '#9ea9a9' }}>Please connect your wallet to view your presale balance and rewards.</p>
        </div>
      </div>
    );
  }

  // ستايل المستطيلات العلوية (زجاجي مع إضاءة خفيفة)
  const cardStyle = {
    flex: 1,
    minWidth: '280px',
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(15px)',
    borderRadius: '16px',
    padding: '24px',
    borderTop: '2px solid transparent', // سيتم تلوينه في كل كارت
    borderLeft: '1px solid rgba(255,255,255,0.05)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  };

  return (
    <div style={{ 
      backgroundColor: '#050a16', // كحلي غامق سادة
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '40px 20px',
      fontFamily: 'sans-serif'
    }}>
      
      {/* العنوان */}
      <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '40px' }}>
        <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>
          My <span style={{ background: 'linear-gradient(90deg, #9333EA 0%, #E11D48 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Portfolio</span>
        </h1>
        <p style={{ color: '#9ea9a9', fontSize: '14px' }}>Overview of your presale allocations and ecosystem rewards.</p>
      </div>

      {/* الثلاث مستطيلات العلوية */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%', maxWidth: '1200px', marginBottom: '50px' }}>
        
        {/* 1. Presale Allocation */}
        <div style={{ ...cardStyle, borderImage: 'linear-gradient(90deg, #3B82F6, #9333EA) 1', boxShadow: '0 -5px 20px rgba(59, 130, 246, 0.1)' }}>
          <span style={{ color: '#9ea9a9', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Presale Allocation</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
            <img src="/logo-coyn-nnm.png" alt="NNM" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <span style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {boughtBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 2. Conviction Rewards */}
        <div style={{ ...cardStyle, borderImage: 'linear-gradient(90deg, #9333EA, #E11D48) 1', boxShadow: '0 -5px 20px rgba(147, 51, 234, 0.1)' }}>
          <span style={{ color: '#9ea9a9', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Conviction Rewards</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
            <img src="/logo-coyn-nnm.png" alt="NNM" style={{ width: '32px', height: '32px', borderRadius: '50%', filter: 'grayscale(30%)' }} />
            <span style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {isLoadingRewards ? '...' : rewardsBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 3. Total Value & Claim */}
        <div style={{ ...cardStyle, borderImage: 'linear-gradient(90deg, #E11D48, #F59E0B) 1', boxShadow: '0 -5px 20px rgba(225, 29, 72, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#9ea9a9', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total USD Value</span>
            {/* الزر المخفي */}
            {isPresaleEnded && (
              <button style={{ background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(225, 29, 72, 0.3)' }}>
                Claim Now
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
            <span style={{ color: '#10B981', fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace' }}>
              ${totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>Approx.</span>
          </div>
        </div>

      </div>

      {/* جدول المعاملات (يأخذ 80% من الشاشة تقريباً) */}
      <div style={{ width: '100%', maxWidth: '1000px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="bi bi-clock-history" style={{ color: '#9333EA', fontSize: '18px' }}></i>
          <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Presale Transaction History</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
              <tr>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: 'normal', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: 'normal', textTransform: 'uppercase' }}>Amount (USD)</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: 'normal', textTransform: 'uppercase', textAlign: 'right' }}>Transaction</th>
              </tr>
            </thead>
            <tbody>
              {transactionHistory.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    No transactions found yet.
                  </td>
                </tr>
              ) : (
                transactionHistory.map((tx, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '16px 24px', color: '#f8fafc', fontSize: '13px' }}>
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#10B981', fontSize: '13px', fontWeight: 'bold' }}>
                      ${tx.amountUsd.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <a 
                        href={`https://polygonscan.com/tx/${tx.hash}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: '#3B82F6', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
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
