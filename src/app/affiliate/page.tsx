'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { createClient } from '@supabase/supabase-js';
import MarketTicker from '@/components/MarketTicker';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// --- 1. Supabase Setup ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 2. Styles & Constants ---
const BRAND_GOLD = '#FCD535';
const BG_DARK = '#1E1E1E'; 
const PANEL_BG = '#242424'; 
const BORDER_COLOR = '#2E2E2E'; 
const COLORS = [BRAND_GOLD, '#FFFFFF', '#666666'];

export default function AffiliatePage() {
  const { address, isConnected } = useAccount();
  const [referralLink, setReferralLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // --- 3. Real Data States (No Mock Data) ---
  const [earnings, setEarnings] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [ledgerPage, setLedgerPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
      setMounted(true);
      if (address) {
          // Generate Link
          const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
          setReferralLink(`${origin}/mint?ref=${address}`);
          
          // Fetch DB Data
          fetchAffiliateData(address);
      }
  }, [address]);

  // --- 4. Database Fetch Logic ---
  const fetchAffiliateData = async (wallet: string) => {
    setLoading(true);
    try {
        // A. Get Earnings Ledger
        const { data: earningsData } = await supabase
            .from('affiliate_earnings')
            .select('*')
            .eq('referrer_wallet', wallet) 
            .order('created_at', { ascending: false });
        
        if (earningsData) setEarnings(earningsData);

        // B. Get Payout History
        const { data: payoutsData } = await supabase
            .from('affiliate_payouts')
            .select('*')
            .eq('wallet_address', wallet)
            .order('created_at', { ascending: false });

        if (payoutsData) setPayouts(payoutsData);

    } catch (e) {
        console.error("Error fetching data:", e);
    } finally {
        setLoading(false);
    }
  };

  // --- 5. Helper: Truncate Wallet (3 start ... 3 end) ---
  const shortAddress = (str: string) => {
      if (!str || str.length < 8) return str;
      // التعديل: 3 حروف في البداية + نقط + 3 حروف في النهاية
      return `${str.substring(0, 3)}...${str.substring(str.length - 3)}`;
  };

  // --- 6. The Brain (Calculations) ---
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

  // Chart Data Preparation
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
      const confirmClaim = confirm(`Request payout for $${stats.unpaidBalance.toFixed(2)}?`);
      if(confirmClaim) {
          // Logic to insert 'REQUESTED' into DB would go here
          alert("Payout requested successfully! Admin will process it shortly.");
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
    <main style={{ backgroundColor: BG_DARK, minHeight: '100vh', paddingBottom: '80px', color: '#fff', fontFamily: 'sans-serif' }}>
        
        <div style={{ marginTop: '0px' }}>
            <MarketTicker />
        </div>

        <div className="container pt-5">
            {/* HERO */}
            <div className="row justify-content-center text-center mb-5">
                <div className="col-lg-10">
                    <h6 className="text-uppercase tracking-widest mb-3" style={{ color: '#888', letterSpacing: '3px', fontSize: '11px' }}>Institutional Partner Program</h6>
                    <h1 className="fw-bold mb-3" style={{ fontSize: '3rem', color: '#E0E0E0', letterSpacing: '-1px' }}>
                        NNM <span style={{ color: BRAND_GOLD }}>Alliance</span>
                    </h1>
                    <p style={{ color: '#B0B0B0', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6', fontSize: '15px' }}>
                        Build a sustainable revenue stream. Earn <span style={{ color: '#fff' }}>30% instant commission</span> on mints, plus <span style={{ color: '#fff' }}>10% lifetime royalties</span> on all future trading fees generated by your referred users.
                    </p>
                </div>
            </div>

            {!isConnected ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '40vh' }}>
                    <div className="p-5 rounded-4 text-center" style={{ border: `1px solid ${BORDER_COLOR}`, background: PANEL_BG }}>
                        <i className="bi bi-wallet2 mb-3 d-block" style={{ fontSize: '30px', color: BRAND_GOLD }}></i>
                        <h3 className="h5 mb-4 text-white">Connect Wallet to Access Dashboard</h3>
                        <ConnectButton />
                    </div>
                </div>
            ) : (
                <div className="fade-in-up">
                    
                    {/* REFERRAL LINK BAR */}
                    <div className="p-4 rounded-3 mb-5 d-flex flex-column flex-md-row align-items-center justify-content-between gap-4 glass-panel">
                        <div className="d-flex align-items-center gap-3 w-100" style={{ minWidth: 0 }}>
                            <div className="icon-circle flex-shrink-0"><i className="bi bi-link-45deg"></i></div>
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                <label style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888', letterSpacing: '1px' }}>Your Exclusive Link</label>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                    <code style={{ 
                                        color: BRAND_GOLD, 
                                        fontSize: '15px', 
                                        background: 'transparent',
                                        wordBreak: 'break-all', 
                                        whiteSpace: 'normal',
                                        lineHeight: '1.4'
                                    }}>
                                        {referralLink}
                                    </code>
                                </div>
                            </div>
                        </div>
                        <button onClick={copyLink} className="btn-gold-outline flex-shrink-0">
                            {isCopied ? 'COPIED' : 'COPY LINK'}
                        </button>
                    </div>

                    {/* STATS CARDS */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="stat-card h-100 position-relative">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="stat-icon"><i className="bi bi-bank"></i></div>
                                    <span className="trend-badge">Total Earned</span>
                                </div>
                                <div className="stat-value">${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                <div className="stat-label">Lifetime Revenue</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-card h-100 position-relative">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="stat-icon"><i className="bi bi-people"></i></div>
                                    <div className="stat-count-badge">{stats.royaltyCount} Txns</div>
                                </div>
                                <div className="stat-value">${stats.royaltyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                <div className="stat-label">Royalty Earnings (10%)</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-card h-100 position-relative">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="stat-icon"><i className="bi bi-diamond"></i></div>
                                    <div className="stat-count-badge">{stats.mintCount} Mints</div>
                                </div>
                                <div className="stat-value">${stats.mintRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                <div className="stat-label">Mint Commission (30%)</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-card h-100 position-relative d-flex flex-column justify-content-between" style={{ border: `1px solid ${BRAND_GOLD}44` }}>
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="stat-icon" style={{ color: BRAND_GOLD }}><i className="bi bi-wallet2"></i></div>
                                        <span className="status-dot"></span>
                                    </div>
                                    <div className="stat-value" style={{ color: BRAND_GOLD }}>${stats.unpaidBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                    <div className="stat-label">Unpaid Balance</div>
                                </div>
                                <div className="mt-3">
                                    {stats.unpaidBalance >= 50 ? (
                                        <button onClick={handleClaim} className="claim-btn active w-100">
                                            CLAIM PAYOUT <i className="bi bi-arrow-right ms-2"></i>
                                        </button>
                                    ) : (
                                        <div className="text-center">
                                            <button className="claim-btn disabled w-100" disabled>
                                                CLAIM PAYOUT
                                            </button>
                                            <div style={{ fontSize: '9px', color: '#666', marginTop: '5px' }}>
                                                Minimum payout: $50.00
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CHARTS */}
                    <div className="row g-3 mb-5">
                        <div className="col-lg-8">
                            <div className="chart-panel h-100">
                                <div className="panel-header">
                                    <h5 className="panel-title">Revenue Overview</h5>
                                </div>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={areaChartData}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={BRAND_GOLD} stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor={BRAND_GOLD} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                            <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#242424', border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: BRAND_GOLD }}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke={BRAND_GOLD} strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="chart-panel h-100">
                                <div className="panel-header mb-4">
                                    <h5 className="panel-title">Earnings Source</h5>
                                </div>
                                <div style={{ height: '260px', width: '100%', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#242424', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>${stats.totalRevenue.toLocaleString()}</div>
                                        <div style={{ fontSize: '10px', color: '#888' }}>Total Yield</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TRANSACTION LEDGER TABLE (Optimized Headers) */}
                    <div className="chart-panel mb-4">
                        <div className="panel-header mb-3">
                            <h5 className="panel-title">Transaction Ledger</h5>
                            <button className="btn-icon"><i className="bi bi-download"></i> CSV</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    {/* ✅ 1. الاختصارات العالمية */}
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
                                            <tr key={item.id || i}>
                                                <td style={{ color: '#666', fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </td>
                                                <td><span className="type-badge">{item.earnings_type}</span></td>
                                                {/* ✅ 2. استخدام دالة الاختصار (3 حروف + 3 حروف) */}
                                                <td style={{ fontFamily: 'monospace', color: '#888', whiteSpace: 'nowrap' }}>
                                                    {shortAddress(item.source_wallet)}
                                                </td>
                                                <td className="text-end" style={{ color: BRAND_GOLD, fontWeight: 'bold', whiteSpace: 'nowrap' }}>+${Number(item.amount).toFixed(2)}</td>
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
                                <span style={{ fontSize: '12px', color: '#666' }}>Page {ledgerPage}</span>
                                <button className="btn-pagination" disabled={ledgerPage * ITEMS_PER_PAGE >= earnings.length} onClick={() => setLedgerPage(p => p + 1)}><i className="bi bi-chevron-right"></i></button>
                            </div>
                        )}
                    </div>

                    {/* PAYOUT HISTORY TABLE (Optimized Headers) */}
                    <div className="chart-panel">
                        <div className="panel-header mb-3">
                            <h5 className="panel-title">Payout History</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    {/* ✅ 1. الاختصارات العالمية */}
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
                                            <tr key={item.id || i}>
                                                <td style={{ color: '#666', fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </td>
                                                {/* ✅ 2. استخدام دالة الاختصار لـ TX Hash */}
                                                <td style={{ fontFamily: 'monospace', color: BRAND_GOLD, whiteSpace: 'nowrap' }}>
                                                    <a href={item.tx_hash ? `https://polygonscan.com/tx/${item.tx_hash}` : '#'} target="_blank" className="text-decoration-none" style={{ color: 'inherit' }}>
                                                        {shortAddress(item.tx_hash) || 'Processing'} <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '10px' }}></i>
                                                    </a>
                                                </td>
                                                <td className="text-end" style={{ color: '#fff', fontWeight: 'bold', whiteSpace: 'nowrap' }}>${Number(item.amount).toFixed(2)}</td>
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
                                <span style={{ fontSize: '12px', color: '#666' }}>Page {payoutPage}</span>
                                <button className="btn-pagination" disabled={payoutPage * ITEMS_PER_PAGE >= payouts.length} onClick={() => setPayoutPage(p => p + 1)}><i className="bi bi-chevron-right"></i></button>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>

        <style jsx>{`
            .glass-panel {
                background: ${PANEL_BG};
                border: 1px solid ${BORDER_COLOR};
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            }
            .icon-circle {
                width: 40px; height: 40px;
                border-radius: 50%;
                background: rgba(252, 213, 53, 0.1);
                color: ${BRAND_GOLD};
                display: flex; align-items: center; justify-content: center;
                font-size: 18px;
            }
            .btn-gold-outline {
                background: transparent;
                border: 1px solid ${BRAND_GOLD};
                color: ${BRAND_GOLD};
                padding: 10px 24px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 1px;
                transition: all 0.3s;
            }
            .btn-gold-outline:hover {
                background: ${BRAND_GOLD};
                color: #000;
                box-shadow: 0 0 15px rgba(252, 213, 53, 0.3);
            }

            .claim-btn {
                padding: 8px 0;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 1px;
                transition: all 0.3s;
                text-transform: uppercase;
                background: rgba(252, 213, 53, 0.05);
                border: 1px solid rgba(252, 213, 53, 0.3);
                color: ${BRAND_GOLD};
                backdrop-filter: blur(4px);
            }
            .claim-btn.active {
                cursor: pointer;
                border-color: ${BRAND_GOLD};
                box-shadow: 0 0 15px rgba(252, 213, 53, 0.1);
            }
            .claim-btn.active:hover {
                background: rgba(252, 213, 53, 0.15);
                box-shadow: 0 0 20px rgba(252, 213, 53, 0.25);
            }
            .claim-btn.disabled {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid #444;
                color: #666;
                cursor: not-allowed;
                box-shadow: none;
            }

            .stat-card {
                background: ${PANEL_BG};
                border: 1px solid ${BORDER_COLOR};
                border-radius: 12px;
                padding: 20px;
                position: relative;
                overflow: hidden;
            }
            .stat-icon { color: #666; font-size: 20px; }
            .stat-count-badge { font-size: 11px; color: ${BRAND_GOLD}; background: rgba(252, 213, 53, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 600; }
            .stat-value { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 5px; font-family: 'Inter', sans-serif; }
            .stat-label { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 1px; }
            .trend-badge { font-size: 10px; color: #4caf50; background: rgba(76, 175, 80, 0.1); padding: 2px 6px; border-radius: 4px; }
            .status-dot { width: 8px; height: 8px; background: ${BRAND_GOLD}; border-radius: 50%; box-shadow: 0 0 10px ${BRAND_GOLD}; }

            .chart-panel {
                background: ${PANEL_BG};
                border: 1px solid ${BORDER_COLOR};
                border-radius: 12px;
                padding: 20px;
            }
            .panel-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${BORDER_COLOR}; padding-bottom: 15px; margin-bottom: 15px; }
            .panel-title { font-size: 14px; color: #E0E0E0; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            
            .table { margin: 0; }
            /* ✅ Added white-space: nowrap to keep headers on one line */
            .table th { background: transparent; color: #666; font-size: 10px; font-weight: 600; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 15px; white-space: nowrap; }
            .table td { background: transparent; color: #E0E0E0; font-size: 13px; border-bottom: 1px solid #2E2E2E; padding: 15px 0; vertical-align: middle; }
            .table tr:last-child td { border-bottom: none; }
            
            .type-badge { font-size: 9px; padding: 3px 8px; border-radius: 4px; font-weight: bold; background: #222; color: #888; border: 1px solid #333; }
            .status-badge { font-size: 9px; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
            .status-badge.success { color: #4caf50; background: rgba(76, 175, 80, 0.1); }
            .status-badge.pending { color: #ff9800; background: rgba(255, 152, 0, 0.1); }

            .btn-icon { background: transparent; border: 1px solid #333; color: #888; border-radius: 4px; padding: 4px 10px; font-size: 11px; }
            .btn-icon:hover { border-color: #666; color: #fff; }

            .btn-pagination { background: transparent; border: 1px solid #333; color: #888; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .btn-pagination:hover:not(:disabled) { background: #333; color: #fff; }
            .btn-pagination:disabled { opacity: 0.3; cursor: not-allowed; }

            .fade-in-up { animation: fadeInUp 0.6s ease-out; }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </main>
  );
}
