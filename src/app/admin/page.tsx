'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseAbi, formatEther, parseEther } from 'viem';
import { supabase } from '@/lib/supabase';
import { NFT_COLLECTION_ADDRESS } from '@/data/config';

// --- Types ---
interface Activity {
  created_at: string;
  activity_type: string;
  price: number | string;
  to_address?: string;
  from_address?: string;
}

interface WalletData {
  address: string;
  volume: number;
  txCount: number;
  lastActive: string;
  isWhale: boolean;
  history: Activity[];
}

interface Payout {
  id: number;
  wallet_address: string;
  amount: number;
  status: string;
  created_at: string;
}

// [NEW] NNM Log Type
interface NNMLog {
  id: number;
  wallet_address: string;
  amount_nnm: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
  error_reason?: string;
  created_at: string;
  tx_hash?: string;
}

interface BannedWallet {
  id: number;
  wallet_address: string;
  reason?: string;
  created_at: string;
}

// 1. Configuration
const OWNER_WALLET = (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || "").toLowerCase();

// 2. ABIs
const REGISTRY_ABI = parseAbi([
  "function setPrices(uint256 _immortal, uint256 _elite, uint256 _founder) external",
  "function withdraw() external"
]);

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  // --- States ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data
  const [contractBalance, setContractBalance] = useState('0');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [visitorsCount, setVisitorsCount] = useState(0);
  
  // Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  
  // Pricing
  const [mintPrices, setMintPrices] = useState({ immortal: '', elite: '', founder: '' });

  // Management
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [nnmLogs, setNnmLogs] = useState<NNMLog[]>([]); // [NEW] Logs State
  const [bannedWallets, setBannedWallets] = useState<BannedWallet[]>([]);
  const [banInput, setBanInput] = useState('');

  // --- [NEW] NNM Payout Controls States ---
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [payoutInterval, setPayoutInterval] = useState(24);
  const [isPayoutActive, setIsPayoutActive] = useState(true);
  
  // --- [NEW] Smart Log Table States ---
  const [showLogs, setShowLogs] = useState(false); // Accordion Toggle
  const [logFilter, setLogFilter] = useState('ALL'); // Filters

  // --- Filter States (General) ---
  const [filterType, setFilterType] = useState('ALL'); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeFilter, setActiveFilter] = useState({ type: 'ALL', start: '', end: '' });

  // --- Initialization ---
  useEffect(() => {
    if (isConnected && address && address.toLowerCase() === OWNER_WALLET) {
        setIsAdmin(true);
        fetchBlockchainData();
        fetchSupabaseData();
    } else {
        setIsAdmin(false);
    }
    setLoading(false);
  }, [address, isConnected]);

  // --- Fetchers ---
  const fetchBlockchainData = async () => {
      if(!publicClient) return;
      try {
          const bal = await publicClient.getBalance({ address: NFT_COLLECTION_ADDRESS as `0x${string}` });
          setContractBalance(formatEther(bal));
      } catch (e) { console.error("Contract Read Error:", e); }
  };

  const fetchSupabaseData = async () => {
      // 1. Settings (Read Existing)
      const { data: set, error } = await supabase.from('app_settings').select('*').single();
      if (!error && set) { 
          setMaintenanceMode(set.is_maintenance_mode); 
          setAnnouncement(set.announcement_text || ''); 
      }

      // 2. Activities
      const { data: act } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
      if (act) setActivities(act as Activity[]);

      // 3. Payouts (Old System)
      const { data: pay } = await supabase.from('affiliate_payouts').select('*').order('created_at', { ascending: false });
      if (pay) setPayouts(pay as Payout[]);

      // 4. [NEW] NNM Logs
      const { data: logs } = await supabase.from('nnm_payout_logs').select('*').order('created_at', { ascending: false });
      if (logs) setNnmLogs(logs as NNMLog[]);

      // 5. Bans
      const { data: bans } = await supabase.from('banned_wallets').select('*');
      if (bans) setBannedWallets(bans as BannedWallet[]);
      
      // Visitor Logic (Estimate)
      if (act) {
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          const activeWallets = new Set(act.filter((a: any) => new Date(a.created_at) > oneHourAgo).map((a:any) => a.from_address));
          setVisitorsCount(activeWallets.size > 0 ? activeWallets.size : 1);
      }
  };

  // --- Filter Logic ---
  const applyFilter = () => {
      setActiveFilter({ type: filterType, start: startDate, end: endDate });
  };

  const filteredActivities = useMemo(() => {
    let data = activities;
    const now = new Date();
    const { type, start, end } = activeFilter;

    if (start && end) {
        const s = new Date(start);
        const e = new Date(end);
        e.setHours(23, 59, 59);
        data = data.filter(a => {
            const d = new Date(a.created_at);
            return d >= s && d <= e;
        });
    } else {
        let cutoff = 0;
        if (type === '1H') cutoff = 60 * 60 * 1000;
        else if (type === '24H') cutoff = 24 * 60 * 60 * 1000;
        else if (type === '7D') cutoff = 7 * 24 * 60 * 60 * 1000;
        else if (type === 'MONTH') cutoff = 30 * 24 * 60 * 60 * 1000;
        else if (type === 'YEAR') cutoff = 365 * 24 * 60 * 60 * 1000;

        if (cutoff > 0) {
            data = data.filter(a => new Date(a.created_at) >= new Date(now.getTime() - cutoff));
        }
    }
    return data;
  }, [activities, activeFilter]);

  // [NEW] NNM Log Filtering
  const filteredLogs = useMemo(() => {
      let data = nnmLogs;
      const now = new Date();
      if (logFilter === 'TODAY') {
          data = data.filter(l => new Date(l.created_at).toDateString() === now.toDateString());
      } else if (logFilter === '7D') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          data = data.filter(l => new Date(l.created_at) >= sevenDaysAgo);
      }
      return data;
  }, [nnmLogs, logFilter]);

  const logStats = useMemo(() => {
      return {
          failed: nnmLogs.filter(l => l.status === 'FAILED').length,
          pending: nnmLogs.filter(l => l.status === 'PENDING').length
      };
  }, [nnmLogs]);

  // --- Real Stats Calculation ---
  const stats = useMemo(() => {
      let totalRevenue = 0, marketFees = 0, adminMints = 0;
      let immortal = 0, elite = 0, founder = 0;

      filteredActivities.forEach(act => {
          const price = Number(act.price || 0);
          const isOwner = act.from_address?.toLowerCase() === OWNER_WALLET || act.to_address?.toLowerCase() === OWNER_WALLET;
          
          if (act.activity_type === 'Mint') {
              if (isOwner) {
                  adminMints++;
              } else {
                  totalRevenue += price;
                  // تصنيف حقيقي بناءً على السعر المدفوع
                  if (price >= 50) immortal++; 
                  else if (price >= 30) elite++; 
                  else founder++;
              }
          } else if (act.activity_type === 'MarketSale') {
              marketFees += (price * 0.01);
          }
      });
      return { totalRevenue, marketFees, adminMints, immortal, elite, founder };
  }, [filteredActivities]);

  const walletRadar = useMemo(() => {
      const wallets: Record<string, WalletData> = {};
      filteredActivities.forEach(act => {
          const addr = act.to_address || act.from_address;
          if(!addr) return;
          if (!wallets[addr]) wallets[addr] = { address: addr, volume: 0, txCount: 0, lastActive: act.created_at, history: [], isWhale: false };
          wallets[addr].volume += Number(act.price || 0);
          wallets[addr].txCount += 1;
          if(wallets[addr].volume > 500) wallets[addr].isWhale = true;
      });
      return Object.values(wallets).sort((a, b) => b.volume - a.volume);
  }, [filteredActivities]);

  // --- ACTIONS ---
  
  // FIX: Use UPDATE instead of UPSERT to respect existing table
  const handleSiteStatus = async (shouldClose: boolean) => {
    try {
        // نستخدم update فقط للسطر رقم 1 الموجود بالفعل
        const { error } = await supabase
            .from('app_settings')
            .update({ is_maintenance_mode: shouldClose })
            .eq('id', 1);

        if (error) throw error;
        setMaintenanceMode(shouldClose);
    } catch (err: any) {
        alert("Error updating: " + err.message);
        console.error(err);
    }
  };

  const saveAnnouncement = async () => {
    const { error } = await supabase
        .from('app_settings')
        .update({ announcement_text: announcement })
        .eq('id', 1);
    
    if(error) alert("Error saving msg"); else alert("Saved ✅");
  };

  const handleWithdraw = async () => {
      if(!confirm("Withdraw funds?")) return;
      try {
          await writeContractAsync({ 
              address: NFT_COLLECTION_ADDRESS as `0x${string}`, 
              abi: REGISTRY_ABI, 
              functionName: 'withdraw' 
          });
          alert("Tx Sent ✅");
      } catch(e) { console.error(e); }
  };

  const handleUpdatePrices = async () => {
      if(!mintPrices.immortal) return alert("Enter prices");
      try {
          await writeContractAsync({
              address: NFT_COLLECTION_ADDRESS as `0x${string}`,
              abi: REGISTRY_ABI,
              functionName: 'setPrices',
              args: [parseEther(mintPrices.immortal), parseEther(mintPrices.elite), parseEther(mintPrices.founder)]
          });
          alert("Prices Updated ✅");
      } catch(e) { console.error(e); }
  };

  const handleBanWallet = async () => {
      if(!banInput) return;
      await supabase.from('banned_wallets').insert([{ wallet_address: banInput.toLowerCase(), reason: 'Admin Ban' }]);
      setBanInput(''); fetchSupabaseData();
  };

  const markPayoutPaid = async (id: number) => {
      await supabase.from('affiliate_payouts').update({ status: 'PAID' }).eq('id', id);
      fetchSupabaseData();
  };

  // --- New NNM Handlers (Updated Logic) ---
  const handleExecuteNNM = async () => {
      if (!confirm("⚠️ CAUTION: Are you sure you want to execute the NNM Batch Payout?\nThis will send funds to all wallets marked as PENDING.")) return;
      
      // Simple security prompt to prevent accidental clicks
      const userPrompt = prompt("To confirm, type: 123");
      if (userPrompt !== '123') return alert("Operation Cancelled.");

      alert("Processing in background... Please wait.");

      try {
          // 1. Call the Expert Script
          const res = await fetch('/api/admin/execute-payouts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
          });

          const data = await res.json();

          if (data.success) {
              alert(`✅ Success!\nProcessed: ${data.processed} transactions.`);
              // 2. Refresh the table immediately to show new status
              fetchSupabaseData(); 
          } else {
              alert(`❌ Error during execution:\n${data.error || 'Unknown Error'}`);
          }

      } catch (e: any) {
          console.error(e);
          alert("Failed to connect to the server.");
      }
  };

  const handleStopNNM = () => {
      setIsPayoutActive(false);
      alert("NNM Payout Stopped");
  };

  const selectTimeInterval = (hours: number) => {
      setPayoutInterval(hours);
      setShowTimeSelector(false);
  };

  // [NEW] Log Actions
  const handleRetryAll = async () => {
      if (!confirm("Retry ALL failed transactions?")) return;
      const { error } = await supabase.from('nnm_payout_logs').update({ status: 'PENDING', error_reason: null }).eq('status', 'FAILED');
      if (error) alert(error.message); else { alert("Queued for retry"); fetchSupabaseData(); }
  };

  const handleRetryLog = async (id: number) => {
      await supabase.from('nnm_payout_logs').update({ status: 'PENDING', error_reason: null }).eq('id', id);
      fetchSupabaseData();
  };

  const handleRejectLog = async (id: number) => {
      if(!confirm("Reject forever?")) return;
      await supabase.from('nnm_payout_logs').update({ status: 'REJECTED' }).eq('id', id);
      fetchSupabaseData();
  };

  const handleClearFailed = async () => {
      if(!confirm("Clear rejected logs?")) return;
      await supabase.from('nnm_payout_logs').delete().eq('status', 'REJECTED');
      fetchSupabaseData();
  };

  // --- UI RENDER ---
  if (loading) return <div className="loading">Auth...</div>;
  if (!isAdmin) return <div className="denied">DENIED</div>;

  return (
    <div className="admin-container">
        
        {/* HEADER */}
        <div className="admin-header">
            <div className="brand">
                <h1>ADMIN <span className="badge-pro">PRO</span></h1>
                <div className="online-status"><span className="dot"></span> {visitorsCount} Active</div>
            </div>

            {/* RESTORED: Site Control Buttons (Moved to Header) */}
            <div className="header-controls">
                <button 
                    onClick={() => handleSiteStatus(false)} 
                    className={`status-pill-btn ${!maintenanceMode ? 'live' : 'dim'}`}
                    title="Open Site for Users"
                >
                    LIVE
                </button>
                <button 
                    onClick={() => handleSiteStatus(true)} 
                    className={`status-pill-btn ${maintenanceMode ? 'closed' : 'dim'}`}
                    title="Close Site (Maintenance)"
                >
                    CLOSED
                </button>
            </div>

            <div className="treasury-box">
                <span className="val">{parseFloat(contractBalance).toFixed(4)} POL</span>
                <button onClick={handleWithdraw} className="withdraw-btn">
                    <i className="bi bi-download"></i>
                </button>
            </div>
        </div>

        {/* --- [NEW] NNM PAYOUT CONTROL CENTER --- */}
        <div className="panel nnm-section">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="panel-label" style={{marginBottom:0, color:'#000'}}>NNM PAYOUT ENGINE</div>
                <div className="interval-badge">{payoutInterval}H Interval</div>
            </div>
            
            <div className="payout-controls">
                <button onClick={handleExecuteNNM} className="payout-btn green"><span>صرف</span><i className="bi bi-play-fill"></i></button>
                <button onClick={handleStopNNM} className="payout-btn red"><span>إيقاف</span><i className="bi bi-stop-fill"></i></button>
                <button onClick={() => setShowTimeSelector(!showTimeSelector)} className="payout-btn blue"><span>توقيت</span><i className="bi bi-clock"></i></button>
            </div>

            {/* Time Selector */}
            {showTimeSelector && (
                <div className="time-grid mt-2">
                    {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
                        <button key={hour} onClick={() => selectTimeInterval(hour)} className={`time-cell ${payoutInterval === hour ? 'active' : ''}`}>{hour}H</button>
                    ))}
                </div>
            )}

            {/* Logs Trigger */}
            <div className="logs-trigger" onClick={() => setShowLogs(!showLogs)}>
                <div className="status-summary">
                    {logStats.failed > 0 && <span className="badge-status failed">🔴 {logStats.failed} FAILED</span>}
                    {logStats.pending > 0 && <span className="badge-status pending">🟡 {logStats.pending} PENDING</span>}
                    {logStats.failed === 0 && logStats.pending === 0 && <span className="badge-status clean">🟢 System Clean</span>}
                </div>
                <i className={`bi bi-chevron-${showLogs ? 'up' : 'down'}`}></i>
            </div>

            {/* Collapsible Log Table */}
            {showLogs && (
                <div className="smart-logs-container fade-in">
                    <div className="logs-toolbar">
                        <div className="filters">
                            <button onClick={() => setLogFilter('TODAY')} className={logFilter === 'TODAY' ? 'active' : ''}>Today</button>
                            <button onClick={() => setLogFilter('7D')} className={logFilter === '7D' ? 'active' : ''}>7D</button>
                            <button onClick={() => setLogFilter('ALL')} className={logFilter === 'ALL' ? 'active' : ''}>All</button>
                        </div>
                        <div className="actions">
                            {logStats.failed > 0 && (
                                <button onClick={handleRetryAll} className="retry-all-btn"><i className="bi bi-arrow-repeat"></i> Retry All</button>
                            )}
                            <button onClick={handleClearFailed} className="clear-btn" title="Clear Rejected"><i className="bi bi-trash"></i></button>
                        </div>
                    </div>

                    <div className="logs-table-wrapper">
                        <table className="logs-table">
                            <thead>
                                <tr><th>Time</th><th>Wallet</th><th>NNM</th><th>Status</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr><td colSpan={5} style={{textAlign:'center', padding:'20px', color:'#666'}}>No logs found.</td></tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className={`row-${log.status.toLowerCase()}`}>
                                            <td style={{fontSize:'10px', color:'#888'}}>{new Date(log.created_at).toLocaleTimeString()}</td>
                                            <td className="mono" style={{color:'#fff'}}>{log.wallet_address.substring(0,4)}...</td>
                                            <td style={{fontWeight:'bold', color:'#FCD535'}}>{log.amount_nnm}</td>
                                            <td><span className={`status-pill ${log.status.toLowerCase()}`}>{log.status}</span></td>
                                            <td>
                                                {log.status === 'FAILED' ? (
                                                    <div className="btn-group">
                                                        <button onClick={() => handleRetryLog(log.id)} className="icon-btn retry"><i className="bi bi-arrow-clockwise"></i></button>
                                                        <button onClick={() => handleRejectLog(log.id)} className="icon-btn reject"><i className="bi bi-x-lg"></i></button>
                                                    </div>
                                                ) : log.error_reason ? <span className="error-msg">{log.error_reason}</span> : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
        {/* -------------------------------------- */}

        {/* SITE CONTROL (Announcement Only - Buttons moved to Header) */}
        <div className="control-panel mt-20">
            <div className="announcement-box w-100">
                <input value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Alert Msg..." />
                <button onClick={saveAnnouncement}>SAVE MSG</button>
            </div>
        </div>

        {/* FILTER SYSTEM */}
        <div className="filter-system">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                <option value="ALL">All Time</option>
                <option value="1H">Last Hour</option>
                <option value="24H">Last 24H</option>
                <option value="7D">Last 7 Days</option>
                <option value="MONTH">Last Month</option>
                <option value="YEAR">Last Year</option>
            </select>
            
            <div className="date-group">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="date-input" />
                <span className="arrow">→</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="date-input" />
            </div>
            
            <button onClick={applyFilter} className="search-btn">
                <i className="bi bi-search"></i>
            </button>
        </div>

        {/* REVENUE STATS */}
        <div className="compact-grid">
            <div className="compact-card">
                <span className="c-val green">${stats.totalRevenue.toLocaleString()}</span>
                <span className="c-label">Revenue</span>
            </div>
            <div className="compact-card">
                <span className="c-val gold">${stats.marketFees.toFixed(2)}</span>
                <span className="c-label">Fees</span>
            </div>
            <div className="compact-card">
                <span className="c-val">{stats.adminMints}</span>
                <span className="c-label">Admins</span>
            </div>
        </div>

        {/* MINT COUNTS */}
        <div className="compact-grid mt-2">
            <div className="compact-card">
                <span className="c-val white">{stats.immortal}</span>
                <span className="c-label">Immortal</span>
            </div>
            <div className="compact-card">
                <span className="c-val white">{stats.elite}</span>
                <span className="c-label">Elite</span>
            </div>
            <div className="compact-card">
                <span className="c-val white">{stats.founder}</span>
                <span className="c-label">Founder</span>
            </div>
        </div>

        {/* PRICING */}
        <div className="panel mt-20">
            <div className="panel-label">Set Mint Prices ($)</div>
            <div className="inputs-row">
                <input type="number" placeholder="Immort" onChange={e=>setMintPrices({...mintPrices, immortal: e.target.value})} />
                <input type="number" placeholder="Elite" onChange={e=>setMintPrices({...mintPrices, elite: e.target.value})} />
                <input type="number" placeholder="Found" onChange={e=>setMintPrices({...mintPrices, founder: e.target.value})} />
            </div>
            <button onClick={handleUpdatePrices} className="action-btn">UPDATE PRICES</button>
        </div>

        {/* BAN WALLET */}
        <div className="panel mt-20">
            <div className="panel-label">Ban Wallet</div>
            <div className="ban-row">
                <input value={banInput} onChange={e=>setBanInput(e.target.value)} placeholder="0x..." />
                <button onClick={handleBanWallet} className="btn-red">BAN</button>
            </div>
        </div>

        {/* TABLES */}
        <div className="tables-section">
            <div className="table-container">
                <div className="panel-label">Whale Radar</div>
                <table>
                    <thead><tr><th>Wallet</th><th>Vol</th><th>Tx</th></tr></thead>
                    <tbody>
                        {walletRadar.slice(0, 5).map((w, i) => (
                            <tr key={i}>
                                <td className="mono">{w.address.substring(0,4)}..{w.address.substring(38)}</td>
                                <td className="white">${w.volume}</td>
                                <td>{w.txCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-container">
                <div className="panel-label">Payouts (Legacy)</div>
                <table>
                    <thead><tr><th>Wallet</th><th>$</th><th>Act</th></tr></thead>
                    <tbody>
                        {payouts.filter(p=>p.status === 'PENDING').slice(0,5).map((p, i) => (
                            <tr key={i}>
                                <td className="mono">{p.wallet_address.substring(0,4)}..</td>
                                <td className="green">${p.amount}</td>
                                <td><button onClick={()=>markPayoutPaid(p.id)} className="pay-btn">OK</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* CSS STYLES */}
        <style jsx>{`
            .admin-container { background: #121212; color: #eee; min-height: 100vh; padding: 15px; font-family: sans-serif; padding-top: 80px; }
            .badge-pro { background: #FCD535; color: #000; padding: 1px 4px; font-size: 9px; border-radius: 3px; }
            
            /* Header */
            .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px; }
            .brand h1 { margin: 0; font-size: 18px; color: #fff; }
            .online-status { font-size: 10px; color: #0ecb81; display: flex; align-items: center; gap: 4px; }
            .dot { width: 6px; height: 6px; background: #0ecb81; border-radius: 50%; }
            .treasury-box { background: #1E1E1E; display: flex; align-items: center; gap: 10px; padding: 5px 10px; border-radius: 4px; border: 1px solid #333; }
            .treasury-box .val { font-size: 13px; color: #FCD535; font-weight: bold; }
            .withdraw-btn { background: #333; color: #fff; border: 1px solid #555; padding: 4px 8px; border-radius: 3px; cursor: pointer; }

            /* Header Controls Styles */
            .header-controls { display: flex; gap: 5px; background: #000; padding: 3px; border-radius: 20px; border: 1px solid #333; margin: 0 15px; }
            .status-pill-btn { border: none; padding: 4px 12px; border-radius: 15px; font-size: 10px; font-weight: bold; cursor: pointer; transition: 0.2s; color: #666; background: transparent; }
            .status-pill-btn.live { background: #00e676; color: #000; box-shadow: 0 0 5px rgba(0,230,118,0.5); }
            .status-pill-btn.closed { background: #ff1744; color: #fff; box-shadow: 0 0 5px rgba(255,23,68,0.5); }
            .status-pill-btn.dim { opacity: 0.5; }
            .status-pill-btn.dim:hover { opacity: 1; color: #fff; }
            
            /* Full width announcement box */
            .announcement-box.w-100 { width: 100%; display: flex; gap: 5px; }
            .announcement-box.w-100 input { flex-grow: 1; }

            /* NNM Section Styles */
            .nnm-section { border: 1px solid #FCD535; background: #FCD535 !important; border-radius: 8px; overflow: hidden; padding: 0 !important; margin-bottom: 20px; }
            .nnm-section .panel-label { padding: 10px 15px; font-weight: bold; background: #FCD535; color: #000; }
            .interval-badge { margin-right: 15px; font-size: 11px; font-weight: bold; color: #000; background: rgba(255,255,255,0.3); padding: 2px 6px; border-radius: 4px; }
            
            .payout-controls { display: flex; gap: 1px; background: #000; padding-bottom: 1px; }
            .payout-btn { flex: 1; border: none; padding: 15px; font-weight: bold; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: 0.2s; color: #fff; }
            .payout-btn.green { background: #1b5e20; } .payout-btn.green:hover { background: #2e7d32; }
            .payout-btn.red { background: #b71c1c; } .payout-btn.red:hover { background: #c62828; }
            .payout-btn.blue { background: #0d47a1; } .payout-btn.blue:hover { background: #1565c0; }

            /* Time Grid */
            .time-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; background: #000; padding: 10px; }
            .time-cell { background: #222; border: 1px solid #333; color: #888; padding: 8px 0; font-size: 12px; cursor: pointer; text-align: center; }
            .time-cell.active { background: #FCD535; color: #000; font-weight: bold; }

            /* Logs Trigger */
            .logs-trigger { background: #222; padding: 8px 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #333; transition: 0.2s; }
            .logs-trigger:hover { background: #2a2a2a; }
            .status-summary { display: flex; gap: 10px; }
            .badge-status { font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
            .badge-status.failed { background: rgba(255, 23, 68, 0.2); color: #ff1744; border: 1px solid #ff1744; }
            .badge-status.pending { background: rgba(255, 214, 0, 0.2); color: #ffd600; border: 1px solid #ffd600; }
            .badge-status.clean { color: #00e676; }

            /* Logs Container */
            .smart-logs-container { background: #111; border-top: 1px solid #333; max-height: 400px; overflow-y: auto; }
            .logs-toolbar { display: flex; justify-content: space-between; padding: 10px; background: #161616; border-bottom: 1px solid #222; position: sticky; top: 0; z-index: 5; }
            .filters button { background: transparent; border: 1px solid #444; color: #888; padding: 4px 10px; border-radius: 20px; font-size: 10px; margin-right: 5px; cursor: pointer; }
            .filters button.active { background: #FCD535; color: #000; border-color: #FCD535; }
            
            .retry-all-btn { background: #e65100; color: #fff; border: none; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; }
            .clear-btn { background: transparent; border: none; color: #666; cursor: pointer; } .clear-btn:hover { color: #d32f2f; }

            /* Logs Table */
            .logs-table-wrapper { padding: 0; }
            .logs-table { width: 100%; font-size: 11px; border-collapse: collapse; }
            .logs-table th { text-align: left; padding: 8px 10px; color: #666; background: #1a1a1a; font-weight: normal; border-bottom: 1px solid #333; }
            .logs-table td { padding: 8px 10px; border-bottom: 1px solid #222; vertical-align: middle; }
            
            /* Status Pills */
            .status-pill { padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .status-pill.pending { background: rgba(255, 214, 0, 0.1); color: #ffd600; }
            .status-pill.completed { background: rgba(0, 230, 118, 0.1); color: #00e676; }
            .status-pill.failed { background: rgba(255, 23, 68, 0.1); color: #ff1744; }
            .status-pill.rejected { background: #333; color: #888; }
            
            /* Error Cell Actions */
            .error-cell { display: flex; flex-direction: column; gap: 4px; }
            .error-msg { color: #ff1744; font-size: 10px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .btn-group { display: flex; gap: 5px; }
            .icon-btn { border: none; width: 20px; height: 20px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
            .icon-btn.retry { background: #333; color: #ffd600; }
            .icon-btn.reject { background: #333; color: #ff1744; }

            /* General */
            .compact-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; }
            .compact-card { background: #1E1E1E; padding: 10px 5px; border-radius: 4px; border: 1px solid #333; text-align: center; }
            .c-val { display: block; font-size: 14px; font-weight: bold; color: #fff; }
            .c-label { display: block; font-size: 9px; color: #888; margin-top: 3px; text-transform: uppercase; }
            .green { color: #00e676; } .gold { color: #FCD535; } .white { color: #fff; }
            .mt-20 { margin-top: 20px; } .mt-2 { margin-top: 2px; }
            .panel { background: #1E1E1E; padding: 10px; border-radius: 4px; border: 1px solid #333; }
            .panel-label { font-size: 10px; color: #aaa; margin-bottom: 8px; text-transform: uppercase; }
            .inputs-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 8px; }
            .inputs-row input { width: 100%; background: #111; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 4px; font-size: 12px; text-align: center; }
            .action-btn { width: 100%; background: #FCD535; color: #000; border: none; padding: 8px; font-weight: bold; font-size: 11px; border-radius: 4px; }
            .ban-row { display: flex; gap: 5px; }
            .ban-row input { flex: 1; background: #111; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 4px; font-size: 12px; }
            .btn-red { background: #d32f2f; color: #fff; border: none; padding: 0 15px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .tables-section { display: grid; gap: 15px; margin-top: 20px; }
            .table-container { background: #1E1E1E; padding: 10px; border-radius: 4px; border: 1px solid #333; }
            table { width: 100%; font-size: 11px; border-collapse: collapse; }
            th { text-align: left; color: #666; padding: 4px; }
            td { padding: 4px; border-bottom: 1px solid #222; color: #ccc; }
            .mono { font-family: monospace; color: #888; }
            .pay-btn { background: #333; color: #fff; border: none; padding: 2px 6px; border-radius: 2px; font-size: 9px; }

            @media (min-width: 768px) {
                .compact-grid { gap: 15px; }
                .compact-card { padding: 15px; }
                .compact-grid, .inputs-row { grid-template-columns: repeat(3, 1fr); }
            }
        `}</style>
    </div>
  );
}
