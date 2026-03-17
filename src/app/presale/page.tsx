"use client";
import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseAbi, parseEther, parseUnits } from 'viem';

const PRESALE_ADDRESS = "0xb03aa911B7b59d83cA62EC1e5958e9F78fd1Be72";
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

const PRESALE_ABI = parseAbi([
  "function buyWithPol() external payable",
  "function buyWithUsdt(uint256 _usdtAmount) external",
  "function tokensSold() view returns (uint256)",
  "function getLatestPolPrice() view returns (uint256)",
  "function getCurrentTier() view returns (uint256)",
  "function tiers(uint256) view returns (uint256, uint256)"
]);


const USDT_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
]);

const tokenomicsData = [
  { id: 0, name: "Pre-sale", percent: 35, amount: "3.5B", color: "#FF7EB3", offset: 0 },
  { id: 1, name: "Protocol Liquidity", percent: 25, amount: "2.5B", color: "#9333EA", offset: -35 },
  { id: 2, name: "Community Rewards", percent: 15, amount: "1.5B", color: "#3B82F6", offset: -60 },
  { id: 3, name: "Ecosystem Expansion", percent: 15, amount: "1.5B", color: "#10B981", offset: -75 },
  { id: 4, name: "Team & Advisors", percent: 10, amount: "1B", color: "#FCD34D", offset: -90 },
];

const coinPrices = {
  POL: 0.5,
  USDT: 1
};

const formatToEnglishDigits = (str: string) => {
  const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  if (typeof str === 'string') {
    for (let i = 0; i < 10; i++) {
      str = str.replace(arabicNumbers[i], i.toString());
    }

  }
  return str.replace(/[^0-9.]/g, '');
};

export default function PresalePage() {
  const [amount, setAmount] = useState<string>('');
  const [selectedCoin, setSelectedCoin] = useState<'POL' | 'USDT'>('POL');
  const [showModal, setShowModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 5, minutes: 30, seconds: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fomoData, setFomoData] = useState({ raised: 1250000, percentage: 35.7 });
  const [tickerItems, setTickerItems] = useState<{addr: string, amt: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: tokensSold } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PRESALE_ABI,
    functionName: 'tokensSold',
    query: { refetchInterval: 15000 }
  });

  const { data: usdtAllowance } = useReadContract({
    address: USDT_ADDRESS as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, PRESALE_ADDRESS as `0x${string}`],
    query: { enabled: !!address }
  });
  const { data: rawPolPrice } = useReadContract({
    address: PRESALE_ADDRESS,
    abi: PRESALE_ABI,
    functionName: 'getLatestPolPrice',
    query: { refetchInterval: 30000 } 
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

  const livePolPriceUsd = rawPolPrice ? Number(rawPolPrice) / 1e8 : 0.5;
  const liveTokensPerUsd = tierData ? Number(tierData[0]) : 10000;
  const currentPriceUsd = liveTokensPerUsd > 0 ? 1 / liveTokensPerUsd : 0.0001;

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

  useEffect(() => {
    const baseRaised = 125000;
    const target = 1050000;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const elapsedSinceStartOfDay = now.getTime() - startOfDay;
    const dailyBoost = (elapsedSinceStartOfDay / 86400000) * 150000;
    
    const realSoldUsd = tokensSold ? Number(tokensSold) / 1e18 * 0.0001 : 0;
    const currentRaised = baseRaised + dailyBoost + realSoldUsd;
    
    setFomoData({
      raised: currentRaised,
      percentage: (currentRaised / target) * 100
    });

    const generateTicker = () => {
      const items = [];
      const chars = 'abcdef0123456789';
      for(let i = 0; i < 15; i++) {
        const addr = '0x' + chars[Math.floor(Math.random()*16)] + chars[Math.floor(Math.random()*16)] + '...' + chars[Math.floor(Math.random()*16)] + chars[Math.floor(Math.random()*16)];
        const amt = Math.floor(Math.random() * 90000) + 10000;
        items.push({ addr, amt: amt.toLocaleString() });
      }
      setTickerItems(items);
    };
    generateTicker();
  }, [tokensSold]);

  const handleQuickAmount = (val: string) => {
    setAmount(val);
    setSelectedCoin('USDT');
  };

  const handleCoinSelect = (coin: 'POL' | 'USDT') => {
    setSelectedCoin(coin);
    setIsDropdownOpen(false);  
  const usdValue = selectedCoin === 'POL' ? Number(amount) * livePolPriceUsd : Number(amount);
  const calculatedNNM = amount && Number(amount) > 0 ? new Intl.NumberFormat('en-US').format(Math.floor(usdValue * liveTokensPerUsd)) : '';
  };

  const handlePayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatToEnglishDigits(e.target.value));
  };

  const handleReceiveAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nnmValue = formatToEnglishDigits(e.target.value);
    if (!nnmValue || Number(nnmValue) === 0) {
      setAmount('');
      return;
    }
    const usdRequired = Number(nnmValue) / liveTokensPerUsd;
    const payRequired = selectedCoin === 'POL' ? usdRequired / livePolPriceUsd : usdRequired;

    setAmount(parseFloat(payRequired.toFixed(4)).toString());
  };


  const handleConnectWallet = () => {
    if (!isConnected) {
      alert("Please connect your wallet using the dApp header.");
      return;
    }
    setShowModal(true);
  };

  const executeBuy = async () => {
    if (!amount || Number(amount) <= 0) return;
    setIsProcessing(true);
    try {
      if (selectedCoin === 'POL') {
        await writeContractAsync({
          address: PRESALE_ADDRESS,
          abi: PRESALE_ABI,
          functionName: 'buyWithPol',
          value: parseEther(amount)
        });
      } else if (selectedCoin === 'USDT') {
        const usdtAmount = parseUnits(amount.toString(), 6);
        if (!usdtAllowance || usdtAllowance < usdtAmount) {
          await writeContractAsync({
            address: USDT_ADDRESS,
            abi: USDT_ABI,
            functionName: 'approve',
            args: [PRESALE_ADDRESS, usdtAmount]
          });
        }
        await writeContractAsync({
          address: PRESALE_ADDRESS,
          abi: PRESALE_ABI,
          functionName: 'buyWithUsdt',
          args: [usdtAmount]
        });
      }
      setShowModal(false);
      setAmount('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const usdValue = selectedCoin === 'POL' ? Number(amount) * livePolPriceUsd : Number(amount);
  const calculatedNNM = amount && Number(amount) > 0 ? Math.floor(usdValue * liveTokensPerUsd).toString() : '';

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
      
      <div style={{ position: 'absolute', top: '0', left: '0', width: '100vw', height: '100vh', background: 'radial-gradient(circle at 10% 10%, rgba(225, 29, 72, 0.12) 0%, rgba(167, 139, 250, 0) 60%)', filter: 'blur(120px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', top: '30%', left: '20%', width: '100vw', height: '100vh', background: 'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.1) 0%, rgba(109, 40, 217, 0) 70%)', filter: 'blur(150px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '0', right: '0', width: '100vw', height: '100vh', background: 'radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0) 60%)', filter: 'blur(120px)', zIndex: 0, pointerEvents: 'none' }}></div>

      <div style={{ position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(225, 29, 72, 0.11) 0%, rgba(24, 26, 32, 0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(147, 51, 234, 0.11) 0%, rgba(24, 26, 32, 0) 70%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker { display: flex; width: max-content; animation: marquee 20s linear infinite; }
        .ticker-item { white-space: nowrap; margin-right: 20px; font-size: 11px; color: #fff; }
        .ticker-item span { color: #10B981; font-weight: bold; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 10px rgba(225, 29, 72, 0.2); } 50% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.4); } 100% { box-shadow: 0 0 10px rgba(225, 29, 72, 0.2); } }
        .chart-segment { transition: all 0.3s ease-out; cursor: pointer; }
        .chart-segment:hover, .chart-segment.active { stroke-width: 6; filter: drop-shadow(0px 0px 8px rgba(255,255,255,0.4)); }
        .legend-item { transition: all 0.3s ease; opacity: 0.7; }
        .legend-item:hover, .legend-item.active { opacity: 1; transform: translateY(-2px); background: rgba(255,255,255,0.05); }
        @keyframes pulseDot { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
      `}</style>

      <div style={{ display: 'flex', width: '100%', maxWidth: '1200px', zIndex: 1, gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '60px', marginTop: '20px' }}>
<div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', color: '#fff', paddingLeft: '10px', marginTop: '120px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '-15px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <img 
              src="/logo-coyn-nnm.png" 
              alt="NNM Logo" 
              style={{ width: '110px', height: '110px', borderRadius: '20px', border: '1px solid rgba(147, 51, 234, 0.2)', boxShadow: '0 0 20px rgba(147, 51, 234, 0.2)', objectFit: 'contain' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>NNM</span>
                <span style={{ fontSize: '12px', color: '#9ea9a9', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Coin</span>
              </div>
<div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '10px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)', marginLeft: '-12px' }}>
                <img src="/icons/matic.svg" alt="Polygon" style={{ width: '16px', height: '16px' }} />
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>Polygon</span>
                <span style={{ color: '#9ea9a9', fontSize: '13px', fontFamily: 'monospace' }}>0x5e64...2609</span>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button 
                    onClick={() => { navigator.clipboard.writeText('0x5e6447c273300ac357c6713cb31a256345132609'); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                  {copied && <span style={{ position: 'absolute', left: '100%', marginLeft: '8px', background: '#10B981', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>Copied!</span>}
                </div>
              </div>
            </div>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.2' }}>
            The NNM Protocol <br/>
            <span style={{ background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Web3 Identity coin Presales</span>
          </h1>
          <p style={{ color: '#9ea9a9', fontSize: '15px', maxWidth: '550px', lineHeight: '1.6' }}>
            Empowering the Polygon Ecosystem with Sovereign Identity and Institutional-Grade NFT Market Intelligence. A fully operational Web3 identity layer deployed on Polygon Mainnet. Join the most exclusive token launch. Secure your allocation before the public listing.
          </p>
          
        </div>

        <div style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ ...saTeContainerStyle, background: 'rgba(147, 51, 234, 0.11)', padding: '24px', width: '100%', maxWidth: '440px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#10B981', borderRadius: '50%', animation: 'pulseDot 1.5s infinite' }}></span>
                Presale Live
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 'bold' }}>
                <img src="/icons/matic.svg" alt="Polygon" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /> Polygon
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(225, 29, 72, 0.2) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px 6px', width: '65px', textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{value.toString().padStart(2, '0')}</div>
                  <div style={{ fontSize: '9px', color: '#9ea9a9', textTransform: 'uppercase' }}>{unit}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '12px' }}>
                <span style={{ color: '#9ea9a9' }}>Raised: <strong style={{ color: '#fff' }}>${fomoData.raised.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong></span>
                <span style={{ color: '#9ea9a9' }}>Target: <strong style={{ color: '#fff' }}>$1,050,000</strong></span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{ width: `${Math.min(fomoData.percentage, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #F43F5E 0%, #9333EA 100%)', borderRadius: '6px', transition: 'width 1s ease' }}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
               <div>
                  <span style={{ color: '#9ea9a9', fontSize: '11px' }}>Current Price: </span>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>${currentPriceUsd.toFixed(4)}</span>
               </div>
               <div>
                  <span style={{ color: '#9ea9a9', fontSize: '11px' }}>Rate: </span>
                  <span style={{ color: '#9333EA', fontSize: '11px', fontWeight: 'bold' }}>{liveTokensPerUsd.toLocaleString('en-US')} NNM/$1</span>
               </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 0', overflow: 'hidden', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px', borderRadius: '10px' }}>
              <div className="ticker" style={{ animationDuration: '15s' }}>
                {tickerItems.map((item, idx) => (
                  <span key={idx} className="ticker-item">{item.addr} buys <span>{item.amt} NNM</span></span>
                ))}
                {tickerItems.map((item, idx) => (
                  <span key={`dup-${idx}`} className="ticker-item">{item.addr} buys <span>{item.amt} NNM</span></span>
                ))}
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
                <input 
                  type="text" 
                  placeholder="0.0" 
                  value={amount} 
                  onChange={handlePayAmountChange} 
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', outline: 'none', width: '40%', fontWeight: 'bold' }} 
                />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                  <img src="/icons/usdt.svg" alt="USDT" style={{ width: '20px', height: '20px', objectFit: 'contain', opacity: 1 }} />
                  <img src="/icons/matic.svg" alt="POL" style={{ width: '20px', height: '20px', objectFit: 'contain', opacity: 1 }} />
                  
                  <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', marginLeft: '4px', minWidth: '75px', justifyContent: 'center' }}>
                    {selectedCoin} ▼
                  </div>

                  {isDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', background: '#0b1426', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 50, boxShadow: '0 4px 15px rgba(0,0,0,0.5)', width: '100px' }}>
                      {(['POL', 'USDT'] as const).map((coin) => (
                        <div 
                          key={coin} 
                          onClick={() => handleCoinSelect(coin)}
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
                <input 
                  type="text" 
                  placeholder="0" 
                  value={calculatedNNM} 
                  onChange={handleReceiveAmountChange} 
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', outline: 'none', width: '60%', fontWeight: 'bold' }} 
                />
                <div style={{ background: 'rgba(225, 29, 72, 0.1)', padding: '6px 10px', borderRadius: '12px', color: '#E11D48', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
                  <img src="/logo-coyn-nnm.png" alt="NNM" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ color: '#fff', fontSize: '12px' }}>NNM</span>
                </div>
              </div>
            </div>

            <button 
              onClick={isConnected ? executeBuy : () => alert("Please connect your wallet using the dApp header.")} 
              disabled={isProcessing}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(90deg, #E11D48 0%, #9333EA 100%)', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', animation: 'pulseGlow 2s infinite', opacity: isProcessing ? 0.7 : 1 }}>
              {isProcessing ? "Processing..." : (isConnected ? "Buy Now" : "Connect Wallet")}
            </button>
          </div>
          
          <p style={{ width: '100%', maxWidth: '440px', marginTop: '16px', marginBottom: '60px', fontSize: '9px', color: '#64748b', fontStyle: 'italic', textAlign: 'center', lineHeight: '1.5' }}>
            By connecting your wallet, I confirm that I have read and agree to the NNM Terms of Service and understand that NNM Tokens are digital utility tokens intended solely for use within the NNM ecosystem. I acknowledge that participation in this optional token distribution is voluntary, involves significant risk, and that I may lose the entire value of the digital assets contributed. I further confirm that I am not participating with any expectation of profit or financial return.
          </p>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', width: '100%', maxWidth: '1200px', zIndex: 1, marginBottom: '60px' }}>
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

      <div style={{ width: '100%', maxWidth: '1200px', zIndex: 1, marginBottom: '40px' }}>
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
            
            <div style={{ background: 'rgba(252, 211, 77, 0.05)', border: '1px solid rgba(252, 211, 77, 0.15)', borderRadius: '20px', padding: '16px', backdropFilter: 'blur(20px)', marginTop: '60px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#FCD34D', fontSize: '18px' }}>🔥</span>
                <span style={{ color: '#FCD34D', fontSize: '16px', fontWeight: 'bold' }}>Automated Burn Protocol</span>
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
                <a href="https://polygonscan.com/token/0x5e6447c273300ac357c6713cb31a256345132609?a=0xb03aa911B7b59d83cA62EC1e5958e9F78fd1Be72" target="_blank" rel="noreferrer" style={{ color: '#8247E5', fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace', textDecoration: 'none' }}>0x5e64...2609</a>
              </div>
            </div>

            <div style={{ flex: 1, ...saTeContainerStyle, padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#FF7EB3', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Pre-sale Contract (35%)</div>
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
                <div style={{ color: '#FCD34D', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Team & Advisors (10%)</div>
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
        <p style={{ fontSize: '9px', fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
          <strong>Important Notice:</strong> NNM Tokens are digital utility units designed for use within the NNM ecosystem and its protocol functionalities. They are not securities, investment contracts, or financial instruments. Participation in this optional genesis distribution is entirely voluntary and may involve the complete loss of contributed digital assets due to the experimental nature of blockchain technologies. By proceeding, you acknowledge that you are acquiring NNM Tokens solely for their potential utility within the ecosystem and not with any expectation of profit or financial return.
        </p>
      </div>
    </div>
  );
}
