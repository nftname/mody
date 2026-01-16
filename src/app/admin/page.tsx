'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseAbi, formatEther, parseEther } from 'viem';
import { supabase } from '@/lib/supabase';
import { NFT_COLLECTION_ADDRESS } from '@/data/config';

// --- TYPES & INTERFACES (Engine Logic) ---
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

interface BannedWallet {
  id: number;
  wallet_address: string;
  reason?: string;
  created_at: string;
}

// 1. CONFIGURATION (Core)
const OWNER_WALLET = "0x5f2f670df4Db14ddB4Bc1E3eCe86CA645fb01BE6".toLowerCase();

// 2. ABIs
const REGISTRY_ABI = parseAbi([
  "function setPrices(uint256 _immortal, uint256 _elite, uint256 _founder) external",
  "function withdraw() external"
]);

export default function AdminPage() {
  // --- ENGINE: Blockchain Hooks ---
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  // --- ENGINE: States ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [contractBalance, setContractBalance] = useState('0');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [visitorsCount, setVisitorsCount] = useState(0);
  
  // Settings & Financials
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [mintPrices, setMintPrices] = useState({ immortal: '', elite: '', founder: '' });

  // Affiliate & Ban System
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [bannedWallets, setBannedWallets] = useState<BannedWallet[]>([]);
  const [banInput, setBanInput] = useState('');

  // Filtering System
  const [timeFilter, setTimeFilter] = useState<'ALL' | '24H' | '7D' | 'MONTH'>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // --- ENGINE: Initialization ---
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

  // --- ENGINE: Fetchers ---
  const fetchBlockchainData = async () => {
      if(!publicClient) return;
      try {
          const bal = await publicClient.getBalance({ address: NFT_COLLECTION_ADDRESS as `0x${string}` });
          setContractBalance(formatEther(bal));
      } catch (e) { console.error("Contract Read Error:", e); }
  };

  const fetchSupabaseData = async () => {
      // Settings
      const { data: set } = await supabase.from('app_settings').select('*').single();
      if (set) { 
          setMaintenanceMode(set.is_maintenance_mode); 
          setAnnouncement(set.announcement_text || ''); 
      }
      // Activities
      const { data: act } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
      if (act) setActivities(act as Activity[]);
      // Payouts
      const { data: pay } = await supabase.from('affiliate_payouts').select('*').order('created_at', { ascending: false });
      if (pay) setPayouts(pay as Payout[]);
      // Bans
      const { data: bans } = await supabase.from('banned_wallets').select('*');
      if (bans) setBannedWallets(bans as BannedWallet[]);

      setVisitorsCount(Math.floor(Math.random() * (45 - 20 + 1) + 20)); 
  };

  // --- ENGINE: Logic & Calculations ---
  const filteredActivities = useMemo(() => {
    let data = activities;
    const now = new Date();
    if (timeFilter === '24H') data = data.filter(a => new Date(a.created_at) >= new Date(now.getTime() - 24 * 3600 * 1000));
    else if (timeFilter === '7D') data = data.filter(a => new Date(a.created_at) >= new Date(now.getTime() - 7 * 24 * 3600 * 1000));
    else if (timeFilter === 'MONTH') data = data.filter(a => new Date(a.created_at) >= new Date(now.getTime() - 30 * 24 * 3600 * 1000));
    
    if (customStartDate && customEndDate) {
        data = data.filter(a => {
            const d = new Date(a.created_at);
            return d >= new Date(customStartDate) && d <= new Date(customEndDate);
        });
    }
    return data;
  }, [activities, timeFilter, customStartDate, customEndDate]);

  const stats = useMemo(() => {
      let totalMints = 0, totalRevenue = 0, marketFees = 0, adminMints = 0;
      let immortal = 0, elite = 0, founder = 0;

      filteredActivities.forEach(act => {
          const price = Number(act.price || 0);
          const isOwner = act.from_address?.toLowerCase() === OWNER_WALLET || act.to_address?.toLowerCase() === OWNER_WALLET;
          if (act.activity_type === 'Mint') {
              if (isOwner) adminMints++;
              else {
                  totalMints++;
                  totalRevenue += price;
                  if (price >= 50) immortal++; else if (price >= 30) elite++; else founder++;
              }
          } else if (act.activity_type === 'MarketSale') {
              marketFees += (price * 0.01);
          }
      });
      return { totalMints, totalRevenue, marketFees, adminMints, immortal, elite, founder };
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

  // --- ENGINE: Actions ---
  const handleSiteStatus = async (shouldClose: boolean) => {
    await supabase.from('app_settings').upsert({ id: 1, is_maintenance_mode: shouldClose });
    setMaintenanceMode(shouldClose);
  };

  const saveAnnouncement = async () => {
    await supabase.from('app_settings').upsert({ id: 1, announcement_text: announcement });
    alert("Message Updated ✅");
  };

  const handleWithdraw = async () => {
      if(!confirm("⚠️ Confirm Funds Withdrawal?")) return;
      try {
          await writeContractAsync({ 
              address: NFT_COLLECTION_ADDRESS as `0x${string}`, 
              abi: REGISTRY_ABI, 
              functionName: 'withdraw' 
          });
          alert("Withdrawal Initiated ✅");
      } catch(e) { console.error(e); }
  };

  const handleUpdatePrices = async () => {
      if(!mintPrices.immortal) return;
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

  const handleRemoveBan = async (id: number) => {
      await supabase.from('banned_wallets').delete().eq('id', id);
      fetchSupabaseData();
  };

  const markPayoutPaid = async (id: number) => {
      await supabase.from('affiliate_payouts').update({ status: 'PAID' }).eq('id', id);
      fetchSupabaseData();
  };

  // --- UI RENDER ---
  if (loading) return <div className="loading">Authenticating Admin...</div>;
  if (!isAdmin) return (
    <div className="denied">
        <h1>ACCESS DENIED</h1>
        <p>Wallet: {address}</p>
        <style jsx>{`
            .denied { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #121212; color: #ff4d4d; }
        `}</style>
    </div>
  );

  return (
    <div className="admin-container">
        
        {/* 1. TOP HEADER & TREASURY */}
        <div className="admin-header">
            <div className="brand">
                <h1>ADMIN CONSOLE <span className="badge-pro">PRO</span></h1>
                <div className="online-status"><span className="dot"></span> {visitorsCount} Visitors Online</div>
            </div>
            <div className="treasury-box">
                <div className="info">
                    <span className="label">Contract Balance</span>
                    <span className="val">{parseFloat(contractBalance).toFixed(4)} POL</span>
                </div>
                <button onClick={handleWithdraw} className="withdraw-btn">
                    <i className="bi bi-safe-fill"></i> Siphon Funds
                </button>
            </div>
        </div>

        {/* 2. SITE STATUS CONTROL (NEW: Standard Size, Below Header) */}
        <div className="status-bar">
            <div className="status-group">
                <span className="label-sm">SITE STATUS:</span>
                <button 
                    onClick={() => handleSiteStatus(false)} 
                    className={`std-btn green ${!maintenanceMode ? 'active' : ''}`}
                >
                    <i className="bi bi-check-circle"></i> OPEN
                </button>
                <button 
                    onClick={() => handleSiteStatus(true)} 
                    className={`std-btn red ${maintenanceMode ? 'active' : ''}`}
                >
                    <i className="bi bi-x-circle"></i> CLOSE
                </button>
            </div>
            <div className="sep"></div>
            <div className="announce-group">
                <input 
                    type="text" 
                    value={announcement} 
                    onChange={e => setAnnouncement(e.target.value)}
                    placeholder="Announcement Message..." 
                />
                <button onClick={saveAnnouncement} className="save-btn">UPDATE</button>
            </div>
        </div>

        {/* 3. FILTER BAR */}
        <div className="filter-bar">
            <div className="time-filters">
                {['24H', '7D', 'MONTH', 'ALL'].map((f) => (
                    <button key={f} className={timeFilter === f ? 'active' : ''} onClick={() => setTimeFilter(f as any)}>{f}</button>
                ))}
            </div>
            <div className="date-range">
                <input type="date" onChange={e => setCustomStartDate(e.target.value)} />
                <span>to</span>
                <input type="date" onChange={e => setCustomEndDate(e.target.value)} />
            </div>
        </div>

        {/* 4. ANALYTICS STATS */}
        <div className="stats-deck">
            <div className="card">
                <span className="title">Total Revenue</span>
                <span className="value green">${stats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="card">
                <span className="title">Market Fees (1%)</span>
                <span className="value gold">${stats.marketFees.toFixed(2)}</span>
            </div>
            <div className="card">
                <span className="title">Mint Activity</span>
                <div className="sub-stats">
                    <span className="i">Immortal: {stats.immortal}</span>
                    <span className="e">Elite: {stats.elite}</span>
                    <span className="f">Founder: {stats.founder}</span>
                </div>
            </div>
            <div className="card highlight">
                <span className="title">Admin Mints</span>
                <span className="value">{stats.adminMints}</span>
                <span className="sub">Gas Only</span>
            </div>
        </div>

        {/* 5. MAIN GRID */}
        <div className="main-grid">
            
            {/* LEFT: Management */}
            <div className="col-left">
                {/* Pricing */}
                <div className="panel">
                    <h3>Mint Pricing ($)</h3>
                    <div className="inputs-3">
                        <input type="number" placeholder="Immortal" onChange={e=>setMintPrices({...mintPrices, immortal: e.target.value})} />
                        <input type="number" placeholder="Elite" onChange={e=>setMintPrices({...mintPrices, elite: e.target.value})} />
                        <input type="number" placeholder="Founder" onChange={e=>setMintPrices({...mintPrices, founder: e.target.value})} />
                    </div>
                    <button onClick={handleUpdatePrices} className="action-btn">UPDATE PRICES</button>
                </div>

                {/* Ban Hammer */}
                <div className="panel mt-20">
                    <h3 className="red-text">Ban Wallet</h3>
                    <div className="ban-row">
                        <input value={banInput} onChange={e=>setBanInput(e.target.value)} placeholder="0x..." />
                        <button onClick={handleBanWallet}>BAN</button>
                    </div>
                    <div className="ban-list">
                        {bannedWallets.map(b => (
                            <div key={b.id} className="ban-item">
                                <span>{b.wallet_address.substring(0,10)}...</span>
                                <span onClick={()=>handleRemoveBan(b.id)} className="del">×</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Intelligence */}
            <div className="col-right">
                {/* Whale Radar */}
                <div className="panel">
                    <h3>Whale Radar</h3>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Wallet</th><th>Vol</th><th>Tx</th></tr></thead>
                            <tbody>
                                {walletRadar.slice(0, 8).map((w, i) => (
                                    <tr key={i} className={w.isWhale ? 'whale' : ''}>
                                        <td className="mono">{w.address.substring(0,6)}... {w.isWhale && '🐋'}</td>
                                        <td>${w.volume}</td>
                                        <td>{w.txCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Affiliate */}
                <div className="panel mt-20">
                    <h3>Affiliate Payouts</h3>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Wallet</th><th>Amt</th><th>Action</th></tr></thead>
                            <tbody>
                                {payouts.filter(p=>p.status === 'PENDING').map((p, i) => (
                                    <tr key={i}>
                                        <td className="mono">{p.wallet_address.substring(0,6)}...</td>
                                        <td className="green-text">${p.amount}</td>
                                        <td><button onClick={()=>markPayoutPaid(p.id)} className="pay-btn">PAY</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {/* STYLES */}
        <style jsx>{`
            .admin-container { background: #121212; color: #ddd; min-height: 100vh; padding: 20px; font-family: sans-serif; }
            .badge-pro { background: #FCD535; color: #000; padding: 2px 6px; font-size: 10px; border-radius: 4px; }
            
            /* HEADER */
            .admin-header { display: flex; justify-content: space-between; align-items: end; border-bottom: 1px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
            .brand h1 { font-size: 22px; color: #fff; margin: 0; }
            .online-status { font-size: 12px; color: #0ecb81; margin-top: 5px; display: flex; align-items: center; gap: 6px; }
            .dot { width: 8px; height: 8px; background: #0ecb81; border-radius: 50%; animation: pulse 2s infinite; }
            
            .treasury-box { background: #1E1E1E; display: flex; align-items: center; gap: 15px; padding: 8px 15px; border-radius: 6px; border: 1px solid #333; }
            .treasury-box .info { display: flex; flex-direction: column; }
            .treasury-box .label { font-size: 10px; color: #888; }
            .treasury-box .val { font-size: 14px; color: #FCD535; font-weight: bold; }
            .withdraw-btn { background: #333; color: #fff; border: 1px solid #555; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px; display: flex; align-items: center; gap: 5px; }
            .withdraw-btn:hover { background: #FCD535; color: #000; }

            /* STATUS BAR (Standard Size) */
            .status-bar { display: flex; align-items: center; background: #1a1a1a; padding: 10px 15px; border-radius: 6px; margin-bottom: 25px; border: 1px solid #333; gap: 15px; }
            .status-group { display: flex; align-items: center; gap: 10px; }
            .label-sm { font-size: 11px; font-weight: bold; color: #888; letter-spacing: 0.5px; }
            
            .std-btn { padding: 6px 14px; font-size: 11px; font-weight: bold; border-radius: 4px; border: none; cursor: pointer; opacity: 0.3; transition: 0.2s; color: #fff; display: flex; align-items: center; gap: 5px; background: #333; }
            .std-btn.green.active { background: #00e676; color: #000; opacity: 1; box-shadow: 0 0 8px rgba(0,230,118,0.2); }
            .std-btn.red.active { background: #ff1744; color: #fff; opacity: 1; box-shadow: 0 0 8px rgba(255,23,68,0.2); }
            
            .sep { width: 1px; height: 20px; background: #333; }
            
            .announce-group { flex: 1; display: flex; gap: 8px; }
            .announce-group input { flex: 1; background: #111; border: 1px solid #333; padding: 6px 10px; color: #fff; border-radius: 4px; font-size: 12px; }
            .save-btn { background: #333; color: #fff; border: none; padding: 0 12px; font-size: 11px; font-weight: bold; cursor: pointer; border-radius: 4px; }
            .save-btn:hover { background: #FCD535; color: #000; }

            /* FILTERS & STATS */
            .filter-bar { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .time-filters button { background: transparent; border: none; color: #666; padding: 5px 10px; cursor: pointer; font-size: 12px; }
            .time-filters button.active { color: #fff; border-bottom: 2px solid #FCD535; }
            .date-range input { background: #1E1E1E; border: 1px solid #333; color: #fff; padding: 4px; color-scheme: dark; font-size: 12px; }
            
            .stats-deck { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px; }
            .card { background: #1E1E1E; padding: 15px; border-radius: 6px; border: 1px solid #2a2a2a; }
            .card.highlight { background: linear-gradient(145deg, #1E1E1E, #252525); border-color: #555; }
            .card .title { display: block; font-size: 10px; color: #777; margin-bottom: 5px; text-transform: uppercase; }
            .card .value { font-size: 18px; font-weight: bold; display: block; }
            .green { color: #00e676; } .gold { color: #FCD535; }
            .sub-stats span { display: block; font-size: 11px; margin-top: 2px; }
            .i { color: #FCD535; } .e { color: #aaa; } .f { color: #cd7f32; }

            /* MAIN GRID */
            .main-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; }
            .panel { background: #1E1E1E; padding: 15px; border-radius: 6px; border: 1px solid #2a2a2a; }
            .panel h3 { font-size: 12px; color: #ccc; margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
            .inputs-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px; }
            input { width: 100%; background: #121212; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 4px; font-size: 12px; }
            .action-btn { width: 100%; background: #FCD535; color: #000; border: none; padding: 8px; font-weight: bold; cursor: pointer; border-radius: 4px; font-size: 11px; }
            .mt-20 { margin-top: 20px; }
            
            .ban-row { display: flex; gap: 5px; margin-bottom: 10px; }
            .ban-row button { background: #d32f2f; color: #fff; border: none; padding: 0 15px; cursor: pointer; border-radius: 4px; font-size: 11px; }
            .ban-list { max-height: 100px; overflow-y: auto; }
            .ban-item { display: flex; justify-content: space-between; font-family: monospace; font-size: 11px; padding: 4px; border-bottom: 1px solid #222; }
            .del { color: #666; cursor: pointer; } .del:hover { color: #fff; }
            
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { text-align: left; color: #666; padding: 5px; }
            td { padding: 5px; border-bottom: 1px solid #2a2a2a; }
            .whale { background: rgba(252, 213, 53, 0.05); }
            .mono { font-family: monospace; }
            .green-text { color: #00e676; }
            .pay-btn { background: #333; color: #fff; border: none; padding: 2px 8px; font-size: 10px; cursor: pointer; border-radius: 2px; }
            .red-text { color: #ff5252; }
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
            @media (max-width: 900px) { .main-layout { grid-template-columns: 1fr; } .status-bar { flex-direction: column; align-items: stretch; } }
        `}</style>
    </div>
  );
}
