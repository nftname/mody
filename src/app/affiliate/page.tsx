'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const BRAND_GOLD = '#FCD535';
const COLOR_NAVY_BG = '#050a16'; 
const TEXT_PRIMARY = '#EAECEF';
const TEXT_MUTED = '#848E9C';
const COLORS = [BRAND_GOLD, '#FFFFFF', '#666666'];

export default function AffiliatePage() {
  const { address, isConnected } = useAccount();
  const [referralLink, setReferralLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [relationshipsCount, setRelationshipsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [ledgerPage, setLedgerPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
      setMounted(true);
      if (address) {
          const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
          setReferralLink(`${origin}/mint?ref=${address}`);
          fetchAffiliateData(address);
      }
  }, [address]);

  const fetchAffiliateData = async (wallet: string) => {
    setLoading(true);
    try {
        const res = await fetch(`/api/affiliate?wallet=${wallet.toLowerCase()}`);
        const data = await res.json();
        
        if (data.earnings) setEarnings(data.earnings);
        if (data.payouts) setPayouts(data.payouts);
        if (data.relationshipsCount !== undefined) setRelationshipsCount(data.relationshipsCount);

    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const shortAddress = (str: string) => {
      if (!str || str.length < 8) return str;
      return `${str.substring(0, 3)}...${str.substring(str.length - 3)}`;
  };

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let mintRevenue = 0;
    let royaltyRevenue = 0;
    let unpaidBalance = 0;
    let mintCount = 0;
    let royaltyCount = 0;

    earnings.forEach(item => {
        const amt = Number(item.amount) || 0;
        totalRevenue += amt;

        if (item.earnings_type === 'MINT') {
            mintRevenue += amt;
            mintCount++;
        } else if (item.earnings_type === 'ROYALTY') {
            royaltyRevenue += amt;
            royaltyCount++;
        }

        if (item.status === 'UNPAID') {
            unpaidBalance += amt;
        }
    });

    return { totalRevenue, mintRevenue, royaltyRevenue, unpaidBalance, mintCount, royaltyCount };
  }, [earnings]);

  const pieData = [
    { name: 'Mint Commission (30%)', value: stats.mintRevenue || 1 }, 
    { name: 'Trading Royalties (10%)', value: stats.royaltyRevenue }, 
  ];

  const areaChartData = [
    { name: 'Start', revenue: 0 },
    { name: 'Now', revenue: stats.totalRevenue },
  ];

  const handleClaim = async () => {
      if (stats.unpaidBalance < 50) return;
      const confirmClaim = confirm(`Request payout for ${stats.unpaidBalance.toFixed(2)} POL?`);
      if(confirmClaim) {
          try {
              const res = await fetch('/api/affiliate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'claim', wallet: address, amount: stats.unpaidBalance })
              });
              const data = await res.json();
              if(data.success) {
                  alert("Payout requested successfully! Admin will process it shortly.");
                  fetchAffiliateData(address as string);
              } else {
                  alert("Error requesting payout.");
              }
          } catch(e) {
              console.error(e);
          }
      }
  };

  const copyLink = () => {
      navigator.clipboard.writeText(referralLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const currentEarnings = earnings.slice((ledgerPage - 1) * ITEMS_PER_PAGE, ledgerPage * ITEMS_PER_PAGE);
  const currentPayouts = payouts.slice((payoutPage - 1) * ITEMS_PER_PAGE, payoutPage * ITEMS_PER_PAGE);

  if (!mounted) return null;

  return (
    <main className="affiliate-main"> 
          <title>NNM | Affiliate</title>

        <div className="twinkling-stars"></div>
        
        <div className="container pt-5 position-relative z-index-1">
            <div className="row justify-content-center text-center mb-3">
                <div className="col-lg-10">
                    <h6 className="text-uppercase tracking-widest mb-2" style={{ color: TEXT_MUTED, letterSpacing: '3px', fontSize: '11px' }}>Institutional Partner Program</h6>
                    <h1 className="fw-bold mb-2 gradient-text" style={{ fontSize: '1.7rem', letterSpacing: '-1px' }}>
                        NNM Alliance
                    </h1>
                    <p style={{ color: '#F8FAF6', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6', fontSize: '14px' }}>
                        Join the network growth. Earn <span className="gradient-text fw-bold">30% instant rewards</span> on mints, plus <span className="gradient-text fw-bold">10% lifetime royalties</span>.
                    </p>
                    {isConnected && (
                        <p style={{ color: '#e9d5ff', fontSize: '12px', marginTop: '10px' }}>Total Referred Users: <span className="fw-bold">{relationshipsCount}</span></p>
                    )}
                </div>
            </div>

            {!isConnected ? (
                <div className="d-flex justify-content-center align-items-start mt-2" style={{ minHeight: '20vh' }}>
                    <div className="py-3 px-3 rounded-4 text-center glass-panel glow-unified-purple" style={{ maxWidth: '300px', width: '90%' }}>
                        <i className="bi bi-wallet2 mb-2 d-block" style={{ fontSize: '20px', color: '#a200ff' }}></i>
                        <h3 className="text-white fw-bold mb-3" style={{ lineHeight: '1.4', fontSize: '13px' }}>Connect Wallet to Access Dashboard</h3>
                        <ConnectButton.Custom>
                            {({ openConnectModal }) => (
                                <button onClick={openConnectModal} className="btn-main-action d-inline-block mx-auto" style={{ width: '60%', padding: '8px 0', fontSize: '12px' }}>
                                    Connect Wallet
                                </button>
                            )}
                        </ConnectButton.Custom>
                    </div>
                </div>
            ) : (
                <div className="fade-in-up">
                    <div className="p-4 rounded-3 mb-5 d-flex flex-column flex-md-row align-items-center justify-content-between gap-4 glass-panel glow-unified-purple text-break">
                        <div className="d-flex align-items-center gap-3 w-100" style={{ minWidth: 0 }}>
                            <div className="icon-circle flex-shrink-0"><i className="bi bi-link-45deg"></i></div>
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                <label style={{ fontSize: '10px', textTransform: 'uppercase', color: TEXT_MUTED, letterSpacing: '1px' }}>Your Exclusive Link</label>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                    <code className="referral-code-text">
                                        {referralLink}
                                    </code>
                                </div>
                            </div>
                        </div>
                        <button onClick={copyLink} className="neon-btn flex-shrink-0">
                            <span>{isCopied ? 'COPIED' : 'COPY LINK'}</span>
                        </button>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="stat-card glass-panel h-100 position-relative glow-unified-purple">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="stat-icon"><i className="bi bi-bank"></i></div>
                                    <span className="trend-badge">Total Earned</span>
                                </div>
                                <div className="stat-value">{stats.royaltyRevenue.toFixed(2)} <span style={{fontSize: '12px'}}>POL</span></div>
                                <div className="stat-label">Lifetime Revenue</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-card glass-panel h-100 position-relative glow-unified-purple">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="stat-icon"><i className="bi bi-people"></i></div>
                                    <div className="stat-count-badge">{stats.royaltyCount} Txns</div>
                                </div>
                                <div className="stat-value">${stats.royaltyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                <div className="stat-label">Royalty Earnings (10%)</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-card glass-panel h-100 position-relative glow-unified-purple">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="stat-icon"><i className="bi bi-diamond"></i></div>
                                    <div className="stat-count-badge">{stats.mintCount} Mints</div>
                                </div>
                                <div className="stat-value">{stats.mintRevenue.toFixed(2)} <span style={{fontSize: '12px'}}>POL</span></div>
                                <div className="stat-label">Mint Commission (30%)</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-card glass-panel h-100 position-relative d-flex flex-column justify-content-between glow-unified-purple">
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="stat-icon" style={{ color: '#ff4b82' }}><i className="bi bi-wallet2"></i></div>
                                        <span className="status-dot"></span>
                                    </div>
                                    <div className="stat-value gradient-text">{stats.unpaidBalance.toFixed(2)} <span style={{fontSize: '12px', color: '#EAECEF', WebkitTextFillColor: '#EAECEF'}}>POL</span></div>
                                    <div className="stat-label">Unpaid Balance</div>
                                </div>
                                <div className="mt-3">
                                    {stats.unpaidBalance >= 50 ? (
                                        <button onClick={handleClaim} className="btn-main-action w-100">
                                            CLAIM PAYOUT <i className="bi bi-arrow-right ms-2"></i>
                                        </button>
                                    ) : (
                                        <div className="text-center">
                                            <button className="btn-main-action disabled w-100" disabled>
                                                CLAIM PAYOUT
                                            </button>
                                            <div style={{ fontSize: '9px', color: TEXT_MUTED, marginTop: '8px' }}>
                                                Minimum payout: 50 POL
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-3 mb-5">
                        <div className="col-lg-8">
                            <div className="chart-panel glass-panel h-100 glow-unified-purple">
                                <div className="panel-header">
                                    <h5 className="panel-title">Revenue Overview</h5>
                                </div>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={areaChartData}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#a200ff" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#ff4b82" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" stroke={TEXT_MUTED} fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke={TEXT_MUTED} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} POL`} />
                                            <Tooltip contentStyle={{ backgroundColor: COLOR_NAVY_BG, border: `1px solid rgba(162, 0, 255, 0.4)`, borderRadius: '8px', color: TEXT_PRIMARY }} itemStyle={{ color: '#ff4b82' }} />
                                            <Area type="monotone" dataKey="revenue" stroke="#a200ff" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="chart-panel glass-panel h-100 glow-unified-purple">
                                <div className="panel-header mb-4">
                                    <h5 className="panel-title">Earnings Source</h5>
                                </div>
                                <div style={{ height: '260px', width: '100%', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#a200ff' : '#ff4b82'} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: COLOR_NAVY_BG, border: `1px solid rgba(162, 0, 255, 0.4)`, borderRadius: '8px' }} itemStyle={{ color: '#ffffff' }} labelStyle={{ color: '#ffffff' }} cursor={{ fill: 'transparent' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: TEXT_PRIMARY }}>{stats.totalRevenue.toFixed(2)}</div>
                                        <div style={{ fontSize: '10px', color: TEXT_MUTED }}>Total Yield</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="chart-panel glass-panel glow-unified-purple mb-4">
                        <div className="panel-header mb-3">
                            <h5 className="panel-title">Transaction Ledger</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table custom-table">
                                <thead>
                                    <tr>
                                        <th>DATE</th>
                                        <th>TYPE</th>
                                        <th>WALLET</th>
                                        <th className="text-end">PROFIT</th>
                                        <th className="text-end">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} className="text-center py-4 text-secondary">Loading...</td></tr>
                                    ) : currentEarnings.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-4 text-secondary">No earnings yet.</td></tr>
                                    ) : (
                                        currentEarnings.map((item, i) => (
                                            <tr key={item.id || i} className="custom-row">
                                                <td style={{ color: TEXT_MUTED, fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </td>
                                                <td><span className="type-badge">{item.earnings_type}</span></td>
                                                <td style={{ fontFamily: 'monospace', color: '#60A5FA', whiteSpace: 'nowrap' }}>
                                                    {shortAddress(item.source_wallet)}
                                                </td>
                                                <td className="text-end" style={{ color: '#10B981', fontWeight: 'bold', whiteSpace: 'nowrap' }}>+{Number(item.amount).toFixed(2)} POL</td>
                                                <td className="text-end">
                                                    <span className={`status-badge ${item.status === 'PAID' ? 'success' : 'pending'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {earnings.length > ITEMS_PER_PAGE && (
                            <div className="d-flex justify-content-end align-items-center gap-3 mt-3 px-2">
                                <button className="btn-pagination" disabled={ledgerPage === 1} onClick={() => setLedgerPage(p => p - 1)}><i className="bi bi-chevron-left"></i></button>
                                <span style={{ fontSize: '12px', color: TEXT_MUTED }}>Page {ledgerPage}</span>
                                <button className="btn-pagination" disabled={ledgerPage * ITEMS_PER_PAGE >= earnings.length} onClick={() => setLedgerPage(p => p + 1)}><i className="bi bi-chevron-right"></i></button>
                            </div>
                        )}
                    </div>

                    <div className="chart-panel glass-panel glow-unified-purple">
                        <div className="panel-header mb-3">
                            <h5 className="panel-title">Payout History</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table custom-table">
                                <thead>
                                    <tr>
                                        <th>DATE</th>
                                        <th>TX ID</th>
                                        <th className="text-end">AMT</th>
                                        <th className="text-end">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={4} className="text-center py-4 text-secondary">Loading...</td></tr>
                                    ) : currentPayouts.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-4 text-secondary">No payouts yet.</td></tr>
                                    ) : (
                                        currentPayouts.map((item, i) => (
                                            <tr key={item.id || i} className="custom-row">
                                                <td style={{ color: TEXT_MUTED, fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </td>
                                                <td style={{ fontFamily: 'monospace', color: '#e9d5ff', whiteSpace: 'nowrap' }}>
                                                    <a href={item.tx_hash ? `https://polygonscan.com/tx/${item.tx_hash}` : '#'} target="_blank" className="text-decoration-none" style={{ color: 'inherit' }}>
                                                        {shortAddress(item.tx_hash) || 'Processing'} <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '10px' }}></i>
                                                    </a>
                                                </td>
                                                <td className="text-end" style={{ color: TEXT_PRIMARY, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{Number(item.amount).toFixed(2)} POL</td>
                                                <td className="text-end"><span className="status-badge success">{item.status}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {payouts.length > ITEMS_PER_PAGE && (
                            <div className="d-flex justify-content-end align-items-center gap-3 mt-3 px-2">
                                <button className="btn-pagination" disabled={payoutPage === 1} onClick={() => setPayoutPage(p => p - 1)}><i className="bi bi-chevron-left"></i></button>
                                <span style={{ fontSize: '12px', color: TEXT_MUTED }}>Page {payoutPage}</span>
                                <button className="btn-pagination" disabled={payoutPage * ITEMS_PER_PAGE >= payouts.length} onClick={() => setPayoutPage(p => p + 1)}><i className="bi bi-chevron-right"></i></button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        <style jsx global>{`
            .affiliate-main {
                background-color: ${COLOR_NAVY_BG};
                min-height: 100vh;
                padding-bottom: 100px;
                overflow-x: hidden;
                font-family: 'Inter', sans-serif;
                position: relative;
            }

            .twinkling-stars {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                z-index: 0;
                pointer-events: none;
                background: transparent;
            }
            .twinkling-stars::after {
                content: "";
                position: absolute;
                top: -150%; left: -150%; width: 400%; height: 400%;
                background-image: 
                    radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
                    radial-gradient(1.5px 1.5px at 100px 150px, #fff, rgba(0,0,0,0)),
                    radial-gradient(2px 2px at 200px 50px, #fff, rgba(0,0,0,0)),
                    radial-gradient(1.5px 1.5px at 300px 250px, #fff, rgba(0,0,0,0));
                background-repeat: repeat;
                background-size: 400px 400px;
                opacity: 0.5;
                animation: starsRotate 120s linear infinite, starsFlash 6s infinite alternate;
            }
            @keyframes starsRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes starsFlash { from { opacity: 0.3; } to { opacity: 0.8; filter: brightness(1.5); } }

            .z-index-1 {
                z-index: 1;
            }

            .glass-panel {
                background: rgba(14, 28, 65, 0.20);
                border: 1px solid rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            }

            .glow-unified-purple { 
                box-shadow: 0 0 15px rgba(162, 0, 255, 0.3), 0 0 40px rgba(162, 0, 255, 0.15); 
                border-color: rgba(162, 0, 255, 0.4); 
            }

            .gradient-text {
                background: linear-gradient(90deg, #a200ff 0%, #ff0055 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .neon-btn {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 75, 130, 0.25);
                padding: 10px 22px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
            }

            .neon-btn span {
                background: linear-gradient(90deg, #9b51e0 0%, #ff4b82 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-size: 13px;
                font-weight: bold;
                letter-spacing: 1px;
                font-family: sans-serif;
                white-space: nowrap;
            }

            .neon-btn:hover {
                background: rgba(255, 255, 255, 0.06);
                box-shadow: 0 0 15px rgba(255, 75, 130, 0.3);
            }

            .btn-main-action {
                background: linear-gradient(90deg, #a200ff 0%, #ff0055 100%);
                border: none;
                border-radius: 8px;
                color: white;
                font-weight: 700;
                font-size: 11px;
                padding: 10px 16px;
                cursor: pointer;
                opacity: 1;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: transform 0.2s, box-shadow 0.2s;
            }

            .btn-main-action:hover {
                transform: scale(1.02);
                box-shadow: 0 0 15px rgba(255, 0, 85, 0.4);
            }

            .btn-main-action.disabled {
                background: rgba(255, 255, 255, 0.05);
                color: #848E9C;
                cursor: not-allowed;
                box-shadow: none;
                transform: none;
            }

            .icon-circle { width: 40px; height: 40px; border-radius: 50%; background: rgba(162, 0, 255, 0.1); color: #a200ff; display: flex; align-items: center; justify-content: center; font-size: 18px; }
            .stat-card { border-radius: 12px; padding: 20px; overflow: hidden; }
            .stat-icon { color: #a200ff; font-size: 20px; }
            .stat-count-badge { font-size: 11px; color: #ff4b82; background: rgba(255, 75, 130, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 600; }
            .stat-value { font-size: 24px; font-weight: 700; color: ${TEXT_PRIMARY}; margin-bottom: 5px; font-family: 'Inter', sans-serif; }
            .stat-label { font-size: 11px; text-transform: uppercase; color: ${TEXT_MUTED}; letter-spacing: 1px; }
            .trend-badge { font-size: 10px; color: #10B981; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px; }
            .status-dot { width: 8px; height: 8px; background: #ff4b82; border-radius: 50%; box-shadow: 0 0 10px #ff4b82; }
            .chart-panel { border-radius: 12px; padding: 20px; }
            .panel-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(147, 51, 234, 0.11); padding-bottom: 15px; margin-bottom: 15px; }
            .panel-title { font-size: 14px; color: #e9d5ff; margin: 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
            
            .custom-table { margin: 0; min-width: 600px; }
            .custom-table th { background: transparent; color: #e9d5ff; font-size: 80%; font-weight: bold; letter-spacing: 1px; border-bottom: 1px solid rgba(147, 51, 234, 0.11); padding: 10px 15px; white-space: nowrap; }
            .custom-table td { background: transparent; color: ${TEXT_PRIMARY}; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.03); padding: 10px 15px; vertical-align: middle; }
            .custom-row:hover td { background-color: rgba(255,255,255,0.02); }
            
            .type-badge { font-size: 9px; padding: 3px 8px; border-radius: 4px; font-weight: bold; background: rgba(255,255,255,0.05); color: #e9d5ff; border: 1px solid rgba(147, 51, 234, 0.2); }
            .status-badge { font-size: 9px; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
            .status-badge.success { color: #10B981; background: rgba(16, 185, 129, 0.1); }
            .status-badge.pending { color: #F59E0B; background: rgba(245, 158, 11, 0.1); }
            
            .btn-pagination { background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: #848E9C; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: 0.2s; font-size: 10px;}
            .btn-pagination:hover:not(:disabled) { background: #003366; border-color: #004d99; color: #fff; }
            .btn-pagination:disabled { opacity: 0.3; cursor: not-allowed; }
            .fade-in-up { animation: fadeInUp 0.6s ease-out; }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            .referral-code-text {
                color: #e9d5ff; 
                font-size: 15px; 
                background: transparent; 
                white-space: nowrap; 
                overflow: hidden; 
                text-overflow: ellipsis; 
                display: block; 
                width: 100%; 
                line-height: 1.4;
            }

            @media (max-width: 768px) {
                .referral-code-text {
                    font-size: 13px;
                }
                .neon-btn {
                    width: 100%;
                    padding: 12px;
                }
            }
        `}</style>
    </main>
  );
}
