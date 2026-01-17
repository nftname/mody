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
  
  // Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  
  // Pricing
  const [mintPrices, setMintPrices] = useState({ immortal: '', elite: '', founder: '' });

  // Management
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [bannedWallets, setBannedWallets] = useState<BannedWallet[]>([]);
  const [banInput, setBanInput] = useState('');

  // --- Filter States ---
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

      // 3. Payouts
      const { data: pay } = await supabase.from('affiliate_payouts').select('*').order('created_at', { ascending: false });
      if (pay) setPayouts(pay as Payout[]);

      // 4. Bans
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
            <div className="treasury-box">
                <span className="val">{parseFloat(contractBalance).toFixed(4)} POL</span>
                <button onClick={handleWithdraw} className="withdraw-btn">
                    <i className="bi bi-download"></i>
                </button>
            </div>
        </div>

        {/* SITE CONTROL */}
        <div className="control-panel">
            <div className="status-toggle">
                <button onClick={() => handleSiteStatus(false)} className={`status-btn open ${!maintenanceMode ? 'active' : ''}`}>OPEN</button>
                <button onClick={() => handleSiteStatus(true)} className={`status-btn close ${maintenanceMode ? 'active' : ''}`}>CLOSE</button>
            </div>
            <div className="announcement-box">
                <input value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Alert Msg..." />
                <button onClick={saveAnnouncement}>SAVE</button>
            </div>
        </div>

        {/* NEW FILTER SYSTEM */}
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

        {/* REVENUE STATS (3 Columns Mobile) */}
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

        {/* MINT COUNTS (3 Columns Mobile - Real Data) */}
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

        {/* PRICING (3 Columns Mobile) */}
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
                <div className="panel-label">Payouts</div>
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

        {/* CSS STYLES (Fixed Mobile Grid) */}
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

            /* Control */
            .control-panel { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
            .status-toggle { display: flex; }
            .status-btn { border: none; padding: 8px 15px; font-weight: bold; font-size: 11px; cursor: pointer; opacity: 0.4; color: #fff; background: #333; flex: 1; }
            .status-btn.open.active { background: #00e676; color: #000; opacity: 1; }
            .status-btn.close.active { background: #ff1744; color: #fff; opacity: 1; }
            .announcement-box { flex: 1; display: flex; gap: 5px; min-width: 200px; }
            .announcement-box input { flex: 1; background: #111; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 4px; font-size: 12px; }
            .announcement-box button { background: #333; color: #fff; border: none; padding: 0 10px; border-radius: 4px; font-size: 10px; font-weight: bold; }

            /* Filter System */
            .filter-system { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; background: #1a1a1a; padding: 10px; border-radius: 6px; }
            .filter-select { background: #111; color: #fff; border: 1px solid #333; padding: 5px; border-radius: 4px; font-size: 11px; }
            .date-group { display: flex; align-items: center; gap: 5px; }
            .date-input { background: #111; color: #fff; border: 1px solid #333; padding: 4px; border-radius: 4px; font-size: 11px; width: 85px; }
            .search-btn { background: #FCD535; color: #000; border: none; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 11px; cursor: pointer; margin-left: auto; }

            /* Compact Grid (FORCE 3-COLS Mobile) */
            .compact-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; }
            .compact-card { background: #1E1E1E; padding: 10px 5px; border-radius: 4px; border: 1px solid #333; text-align: center; }
            .c-val { display: block; font-size: 14px; font-weight: bold; color: #fff; }
            .c-label { display: block; font-size: 9px; color: #888; margin-top: 3px; text-transform: uppercase; }
            .green { color: #00e676; } .gold { color: #FCD535; } .white { color: #fff; }
            .mt-2 { margin-top: 5px; } .mt-20 { margin-top: 20px; }

            /* Panels */
            .panel { background: #1E1E1E; padding: 10px; border-radius: 4px; border: 1px solid #333; }
            .panel-label { font-size: 10px; color: #aaa; margin-bottom: 8px; text-transform: uppercase; }
            
            /* Inputs Row (FORCE 3-COLS Mobile) */
            .inputs-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 8px; }
            .inputs-row input { width: 100%; background: #111; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 4px; font-size: 12px; text-align: center; }
            .action-btn { width: 100%; background: #FCD535; color: #000; border: none; padding: 8px; font-weight: bold; font-size: 11px; border-radius: 4px; }

            .ban-row { display: flex; gap: 5px; }
            .ban-row input { flex: 1; background: #111; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 4px; font-size: 12px; }
            .btn-red { background: #d32f2f; color: #fff; border: none; padding: 0 15px; border-radius: 4px; font-size: 11px; font-weight: bold; }

            /* Tables */
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

