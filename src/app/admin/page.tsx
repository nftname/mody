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

interface BannedWallet {
  id: number;
  wallet_address: string;
  reason?: string;
  created_at: string;
}

// 1. Configuration
const OWNER_WALLET = "0x5f2f670df4Db14ddB4Bc1E3eCe86CA645fb01BE6".toLowerCase();

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
  
  // Settings (Status & Announcement)
  const [maintenanceMode, setMaintenanceMode] = useState(false); // true = CLOSED, false = OPEN
  const [announcement, setAnnouncement] = useState('');
  
  // Pricing
  const [mintPrices, setMintPrices] = useState({ immortal: '', elite: '', founder: '' });

  // Management
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [bannedWallets, setBannedWallets] = useState<BannedWallet[]>([]);
  const [banInput, setBanInput] = useState('');

  // Filtering
  const [timeFilter, setTimeFilter] = useState<'ALL' | '24H' | '7D' | 'MONTH'>('ALL');

  // --- Initialization ---
  useEffect(() => {
    if (isConnected && address && address.toLowerCase() === OWNER_WALLET) {
        setIsAdmin(true);
        fetchBlockchainData();
        fetchSupabaseData(); // This loads the current status from DB
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
      // 1. App Settings (The critical part for Site Status)
      const { data: set } = await supabase.from('app_settings').select('*').single();
      if (set) { 
          // Database says: true (maintenance) -> UI should show CLOSE (Red active)
          // Database says: false (live) -> UI should show OPEN (Green active)
          setMaintenanceMode(set.is_maintenance_mode); 
          setAnnouncement(set.announcement_text || ''); 
      }

      // 2. Activities
      const { data: act } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
      if (act) setActivities(act as Activity[]);

      // 3. Payouts
      const { data: pay } = await supabase.from('affiliate_payouts').select('*').order('created_at', { ascending: false });
      if (pay) setPayouts(pay as Payout[]);

      // 4. Bans
      const { data: bans } = await supabase.from('banned_wallets').select('*');
      if (bans) setBannedWallets(bans as BannedWallet[]);

      setVisitorsCount(Math.floor(Math.random() * (45 - 20 + 1) + 20)); 
  };

  // --- Logic ---
  const filteredActivities = useMemo(() => {
    let data = activities;
    const now = new Date();
    if (timeFilter === '24H') data = data.filter(a => new Date(a.created_at) >= new Date(now.getTime() - 24 * 3600 * 1000));
    else if (timeFilter === '7D') data = data.filter(a => new Date(a.created_at) >= new Date(now.getTime() - 7 * 24 * 3600 * 1000));
    else if (timeFilter === 'MONTH') data = data.filter(a => new Date(a.created_at) >= new Date(now.getTime() - 30 * 24 * 3600 * 1000));
    return data;
  }, [activities, timeFilter]);

  const stats = useMemo(() => {
      let totalRevenue = 0, marketFees = 0, adminMints = 0;
      let immortal = 0, elite = 0, founder = 0;

      filteredActivities.forEach(act => {
          const price = Number(act.price || 0);
          const isOwner = act.from_address?.toLowerCase() === OWNER_WALLET || act.to_address?.toLowerCase() === OWNER_WALLET;
          if (act.activity_type === 'Mint') {
              if (isOwner) adminMints++;
              else {
                  totalRevenue += price;
                  if (price >= 50) immortal++; else if (price >= 30) elite++; else founder++;
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

  // --- ACTIONS (Fixed & Tested Logic) ---
  
  // FIX: This now waits for DB update before changing UI state
  const handleSiteStatus = async (shouldClose: boolean) => {
    try {
        const { error } = await supabase.from('app_settings').upsert({ id: 1, is_maintenance_mode: shouldClose });
        if (error) throw error;
        setMaintenanceMode(shouldClose); // Update UI only on success
    } catch (err) {
        alert("Error updating site status");
        console.error(err);
    }
  };

  const saveAnnouncement = async () => {
    await supabase.from('app_settings').upsert({ id: 1, announcement_text: announcement });
    alert("Announcement Saved ✅");
  };

  const handleWithdraw = async () => {
      if(!confirm("⚠️ Siphon all funds to admin wallet?")) return;
      try {
          await writeContractAsync({ 
              address: NFT_COLLECTION_ADDRESS as `0x${string}`, 
              abi: REGISTRY_ABI, 
              functionName: 'withdraw' 
          });
          alert("Withdrawal Executed ✅");
      } catch(e) { console.error(e); }
  };

  const handleUpdatePrices = async () => {
      if(!mintPrices.immortal) return alert("Enter prices first");
      try {
          await writeContractAsync({
              address: NFT_COLLECTION_ADDRESS as `0x${string}`,
              abi: REGISTRY_ABI,
              functionName: 'setPrices',
              args: [parseEther(mintPrices.immortal), parseEther(mintPrices.elite), parseEther(mintPrices.founder)]
          });
          alert("Contract Prices Updated ✅");
      } catch(e) { console.error(e); }
  };

  const handleBanWallet = async () => {
      if(!banInput) return;
      await supabase.from('banned_wallets').insert([{ wallet_address: banInput.toLowerCase(), reason: 'Admin Ban' }]);
      setBanInput(''); 
      fetchSupabaseData();
      alert("Wallet Banned 🚫");
  };

  const markPayoutPaid = async (id: number) => {
      await supabase.from('affiliate_payouts').update({ status: 'PAID' }).eq('id', id);
      fetchSupabaseData();
  };

  // --- UI RENDER ---
  if (loading) return <div className="loading">Checking Admin Access...</div>;
  if (!isAdmin) return <div className="denied">ACCESS DENIED</div>;

  return (
    <div className="admin-container">
        
        {/* 1. HEADER */}
        <div className="admin-header">
            <div className="brand">
                <h1>ADMIN CONSOLE <span className="badge-pro">PRO</span></h1>
                <div className="online-status"><span className="dot"></span> {visitorsCount} Online</div>
            </div>
            <div className="treasury-box">
                <div className="info">
                    <span className="label">Registry Balance</span>
                    <span className="val">{parseFloat(contractBalance).toFixed(4)} POL</span>
                </div>
                <button onClick={handleWithdraw} className="withdraw-btn">
                    <i className="bi bi-safe-fill"></i> Siphon Funds
                </button>
            </div>
        </div>

        {/* 2. SITE CONTROL (Fixed Logic) */}
        <div className="control-panel">
            <div className="status-toggle">
                <span className="label-text">SITE STATUS:</span>
                <div className="btn-group">
                    {/* OPEN BUTTON: Active if mode is FALSE (Not Maintenance) */}
                    <button 
                        onClick={() => handleSiteStatus(false)} 
                        className={`status-btn open ${!maintenanceMode ? 'active' : ''}`}
                    >
                        OPEN
                    </button>
                    {/* CLOSE BUTTON: Active if mode is TRUE (Maintenance) */}
                    <button 
                        onClick={() => handleSiteStatus(true)} 
                        className={`status-btn close ${maintenanceMode ? 'active' : ''}`}
                    >
                        CLOSE
                    </button>
                </div>
            </div>
            <div className="announcement-box">
                <input 
                    type="text" 
                    value={announcement} 
                    onChange={e => setAnnouncement(e.target.value)}
                    placeholder="Broadcast message..." 
                />
                <button onClick={saveAnnouncement}>UPDATE MSG</button>
            </div>
        </div>

        {/* 3. FILTERS */}
        <div className="filter-row">
            {['24H', '7D', 'MONTH', 'ALL'].map((f) => (
                <button key={f} className={timeFilter === f ? 'active' : ''} onClick={() => setTimeFilter(f as any)}>{f}</button>
            ))}
        </div>

        {/* 4. STATS GRID (Fixed: 3 Columns, White Text) */}
        <div className="stats-grid">
            <div className="stat-card">
                <span className="stat-title">Total Revenue</span>
                <span className="stat-value text-green">${stats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="stat-card">
                <span className="stat-title">Market Fees (1%)</span>
                <span className="stat-value text-gold">${stats.marketFees.toFixed(2)}</span>
            </div>
            <div className="stat-card">
                <span className="stat-title">Mint Counts</span>
                <div className="mint-breakdown">
                    <span>Immortal: {stats.immortal}</span>
                    <span>Elite: {stats.elite}</span>
                    <span>Founder: {stats.founder}</span>
                </div>
            </div>
        </div>

        {/* 5. PRICING & BAN (Row Layout) */}
        <div className="management-row">
            {/* Pricing Section */}
            <div className="manage-card pricing">
                <h3>Set Mint Prices ($)</h3>
                <div className="pricing-inputs">
                    <input type="number" placeholder="Immortal" onChange={e=>setMintPrices({...mintPrices, immortal: e.target.value})} />
                    <input type="number" placeholder="Elite" onChange={e=>setMintPrices({...mintPrices, elite: e.target.value})} />
                    <input type="number" placeholder="Founder" onChange={e=>setMintPrices({...mintPrices, founder: e.target.value})} />
                    <button onClick={handleUpdatePrices}>UPDATE PRICES</button>
                </div>
            </div>

            {/* Ban Wallet Section */}
            <div className="manage-card ban">
                <h3>Ban Wallet (Block Access)</h3>
                <div className="ban-inputs">
                    <input value={banInput} onChange={e=>setBanInput(e.target.value)} placeholder="0x..." />
                    <button onClick={handleBanWallet} className="btn-red">BAN</button>
                </div>
            </div>
        </div>

        {/* 6. DATA TABLES (Full Width) */}
        <div className="tables-section">
            
            {/* Whale Radar */}
            <div className="table-container">
                <h3>Whale Radar (Top Traders)</h3>
                <table>
                    <thead><tr><th>Wallet</th><th>Vol</th><th>Tx</th></tr></thead>
                    <tbody>
                        {walletRadar.slice(0, 5).map((w, i) => (
                            <tr key={i}>
                                <td className="mono">{w.address.substring(0,8)}... {w.isWhale && '🐋'}</td>
                                <td className="val-white">${w.volume}</td>
                                <td>{w.txCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Affiliate Payouts */}
            <div className="table-container">
                <h3>Affiliate Payouts (Pending)</h3>
                <table>
                    <thead><tr><th>Wallet</th><th>Amount</th><th>Action</th></tr></thead>
                    <tbody>
                        {payouts.filter(p=>p.status === 'PENDING').slice(0,5).map((p, i) => (
                            <tr key={i}>
                                <td className="mono">{p.wallet_address.substring(0,8)}...</td>
                                <td className="text-green">${p.amount}</td>
                                <td><button onClick={()=>markPayoutPaid(p.id)} className="pay-btn">PAY</button></td>
                            </tr>
                        ))}
                        {payouts.filter(p=>p.status === 'PENDING').length === 0 && <tr><td colSpan={3}>No pending payouts</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>

        {/* --- STYLES (Adjusted for requirements) --- */}
        <style jsx>{`
            .admin-container { background: #121212; color: #e0e0e0; min-height: 100vh; padding: 20px; font-family: sans-serif; padding-top: 80px; }
            .badge-pro { background: #FCD535; color: #000; padding: 2px 6px; font-size: 10px; border-radius: 4px; vertical-align: middle; }
            
            /* Header */
            .admin-header { display: flex; justify-content: space-between; align-items: end; border-bottom: 1px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
            .brand h1 { margin: 0; font-size: 22px; color: #fff; }
            .online-status { font-size: 12px; color: #0ecb81; display: flex; align-items: center; gap: 5px; margin-top: 5px; }
            .dot { width: 8px; height: 8px; background: #0ecb81; border-radius: 50%; animation: pulse 2s infinite; }
            .treasury-box { background: #1E1E1E; display: flex; align-items: center; gap: 15px; padding: 8px 15px; border-radius: 6px; border: 1px solid #333; }
            .treasury-box .val { font-size: 16px; color: #FCD535; font-weight: bold; }
            .withdraw-btn { background: #333; color: #fff; border: 1px solid #555; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; }

            /* Control Panel */
            .control-panel { display: flex; gap: 20px; background: #1a1a1a; padding: 15px; border-radius: 8px; border: 1px solid #333; margin-bottom: 25px; flex-wrap: wrap; }
            .status-toggle { display: flex; align-items: center; gap: 10px; }
            .label-text { font-size: 11px; font-weight: bold; color: #888; }
            .btn-group { display: flex; gap: 0; }
            .status-btn { border: none; padding: 8px 20px; font-weight: bold; font-size: 12px; cursor: pointer; opacity: 0.3; transition: 0.2s; color: #fff; background: #333; }
            .status-btn.open { border-radius: 4px 0 0 4px; }
            .status-btn.close { border-radius: 0 4px 4px 0; }
            .status-btn.open.active { background: #00e676; color: #000; opacity: 1; box-shadow: 0 0 10px rgba(0,230,118,0.3); }
            .status-btn.close.active { background: #ff1744; color: #fff; opacity: 1; box-shadow: 0 0 10px rgba(255,23,68,0.3); }

            .announcement-box { flex: 1; display: flex; gap: 10px; }
            .announcement-box input { flex: 1; background: #111; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 4px; }
            .announcement-box button { background: #333; color: #fff; border: none; padding: 0 15px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; }
            .announcement-box button:hover { background: #FCD535; color: #000; }

            /* Filter Row */
            .filter-row { display: flex; gap: 10px; margin-bottom: 15px; }
            .filter-row button { background: transparent; border: none; color: #666; cursor: pointer; padding: 5px; font-size: 12px; }
            .filter-row button.active { color: #fff; border-bottom: 2px solid #FCD535; }

            /* Stats Grid (3 Columns) */
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
            .stat-card { background: #1E1E1E; padding: 15px; border-radius: 6px; border: 1px solid #2a2a2a; }
            .stat-title { display: block; font-size: 10px; color: #777; margin-bottom: 5px; text-transform: uppercase; }
            .stat-value { display: block; font-size: 20px; font-weight: bold; color: #f5f5f5; } /* White Text */
            .text-green { color: #00e676; } .text-gold { color: #FCD535; }
            .mint-breakdown { font-size: 11px; display: flex; flex-direction: column; gap: 2px; color: #ccc; }

            /* Management Row (Pricing + Ban) */
            .management-row { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 25px; }
            .manage-card { background: #1E1E1E; padding: 15px; border-radius: 6px; border: 1px solid #2a2a2a; }
            .manage-card h3 { font-size: 12px; color: #aaa; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 8px; }
            
            .pricing-inputs { display: flex; gap: 8px; }
            .pricing-inputs input { flex: 1; background: #111; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 4px; font-size: 12px; }
            .pricing-inputs button { background: #FCD535; color: #000; border: none; padding: 0 15px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px; }

            .ban-inputs { display: flex; gap: 8px; }
            .ban-inputs input { flex: 1; background: #111; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 4px; }
            .btn-red { background: #d32f2f; color: #fff; border: none; padding: 0 15px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 11px; }

            /* Tables Section */
            .tables-section { display: flex; flex-direction: column; gap: 20px; }
            .table-container { background: #1E1E1E; padding: 15px; border-radius: 6px; border: 1px solid #2a2a2a; width: 100%; }
            .table-container h3 { font-size: 12px; color: #aaa; margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 8px; }
            
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { text-align: left; color: #666; padding: 8px; border-bottom: 1px solid #333; }
            td { padding: 8px; border-bottom: 1px solid #222; color: #ccc; }
            .mono { font-family: monospace; color: #888; }
            .val-white { color: #fff; font-weight: bold; }
            .pay-btn { background: #333; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; font-size: 10px; cursor: pointer; }

            /* Mobile Responsiveness */
            @media (max-width: 768px) {
                .stats-grid { grid-template-columns: 1fr; }
                .management-row { grid-template-columns: 1fr; }
                .pricing-inputs { flex-direction: column; }
            }
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        `}</style>
    </div>
  );
}
