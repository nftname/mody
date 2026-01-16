'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseAbi, formatEther, parseEther } from 'viem';
import { supabase } from '@/lib/supabase';
import { NFT_COLLECTION_ADDRESS } from '@/data/config';

// --- TYPES & INTERFACES ---
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
  isWhale: boolean; // VIP marker
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

interface AppSettings {
  id: number;
  is_maintenance_mode: boolean;
  announcement_text: string;
}

// 1. CONFIGURATION
const OWNER_WALLET = "0x5f2f670df4Db14ddB4Bc1E3eCe86CA645fb01BE6".toLowerCase();

// 2. ABIs (تم التأكد من وجود دالة السحب وتعديل الأسعار)
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

  // --- Initialization ---
  useEffect(() => {
    // التحقق الصارم من المحفظة
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
      // 1. Settings
      const { data: set } = await supabase.from('app_settings').select('*').single();
      if (set) { 
          setMaintenanceMode(set.is_maintenance_mode); 
          setAnnouncement(set.announcement_text || ''); 
      }

      // 2. Activities (Mints & Market)
      const { data: act } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
      if (act) setActivities(act as Activity[]);

      // 3. Affiliate Payouts
      const { data: pay } = await supabase.from('affiliate_payouts').select('*').order('created_at', { ascending: false });
      if (pay) setPayouts(pay as Payout[]);

      // 4. Banned Wallets (ستحتاج لإنشاء هذا الجدول في Supabase)
      const { data: bans } = await supabase.from('banned_wallets').select('*');
      if (bans) setBannedWallets(bans as BannedWallet[]);

      // Simulated Live Visitors (يمكن ربطها بـ Google Analytics لاحقاً)
      setVisitorsCount(Math.floor(Math.random() * (45 - 20 + 1) + 20)); 
  };

  // --- Advanced Filtering Logic ---
  const filteredActivities = useMemo(() => {
    let data = activities;
    const now = new Date();

    if (timeFilter === '24H') {
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        data = data.filter(a => new Date(a.created_at) >= oneDayAgo);
    } else if (timeFilter === '7D') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        data = data.filter(a => new Date(a.created_at) >= sevenDaysAgo);
    } else if (timeFilter === 'MONTH') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        data = data.filter(a => new Date(a.created_at) >= monthAgo);
    }

    if (customStartDate && customEndDate) {
        data = data.filter(a => {
            const d = new Date(a.created_at);
            return d >= new Date(customStartDate) && d <= new Date(customEndDate);
        });
    }
    
    return data;
  }, [activities, timeFilter, customStartDate, customEndDate]);

  // --- Analytics Calculation ---
  const stats = useMemo(() => {
      let totalMints = 0;
      let totalRevenue = 0;
      let marketFees = 0; // 1% estimation
      let adminMints = 0;
      
      // Breakdown
      let immortal = 0, elite = 0, founder = 0;

      filteredActivities.forEach(act => {
          const price = Number(act.price || 0);
          const isOwner = act.from_address?.toLowerCase() === OWNER_WALLET || act.to_address?.toLowerCase() === OWNER_WALLET;

          if (act.activity_type === 'Mint') {
              if (isOwner) {
                  adminMints++;
              } else {
                  totalMints++;
                  totalRevenue += price;
                  
                  if (price >= 50) immortal++;
                  else if (price >= 30) elite++;
                  else founder++;
              }
          } else if (act.activity_type === 'MarketSale') {
              // افتراض أن عمولة الماركت 1%
              marketFees += (price * 0.01);
          }
      });

      return { totalMints, totalRevenue, marketFees, adminMints, immortal, elite, founder };
  }, [filteredActivities]);

  // --- Wallet Radar (Whale Tracking) ---
  const walletRadar = useMemo(() => {
      const wallets: Record<string, WalletData> = {};
      
      filteredActivities.forEach(act => {
          const addr = act.to_address || act.from_address;
          if(!addr) return;
          
          if (!wallets[addr]) {
              wallets[addr] = { 
                  address: addr, 
                  volume: 0, 
                  txCount: 0, 
                  lastActive: act.created_at, 
                  history: [], 
                  isWhale: false 
              };
          }
          wallets[addr].volume += Number(act.price || 0);
          wallets[addr].txCount += 1;
          wallets[addr].history.push(act);
          
          // تحديد الحيتان (مثلاً أكثر من 500$ تداول)
          if(wallets[addr].volume > 500) wallets[addr].isWhale = true;
      });

      return Object.values(wallets).sort((a, b) => b.volume - a.volume);
  }, [filteredActivities]);


  // --- Actions ---
  const handleWithdraw = async () => {
      if(!confirm("⚠️ تأكيد سحب جميع الأموال من العقد الذكي إلى محفظتك؟")) return;
      try {
          await writeContractAsync({ 
              address: NFT_COLLECTION_ADDRESS as `0x${string}`, 
              abi: REGISTRY_ABI, 
              functionName: 'withdraw' 
          });
          alert("تمت عملية السحب بنجاح ✅");
          fetchBlockchainData();
      } catch(e: any) { alert("خطأ في السحب: " + (e.message || "Unknown")); }
  };

  const handleUpdatePrices = async () => {
      if(!mintPrices.immortal || !mintPrices.elite || !mintPrices.founder) return alert("يرجى ملء جميع الخانات");
      try {
          await writeContractAsync({
              address: NFT_COLLECTION_ADDRESS as `0x${string}`,
              abi: REGISTRY_ABI,
              functionName: 'setPrices',
              args: [parseEther(mintPrices.immortal), parseEther(mintPrices.elite), parseEther(mintPrices.founder)]
          });
          alert("تم تحديث الأسعار ✅");
      } catch(e) { console.error(e); }
  };

  const handleBanWallet = async () => {
      if(!banInput) return;
      const { error } = await supabase.from('banned_wallets').insert([{ wallet_address: banInput.toLowerCase(), reason: 'Admin Ban' }]);
      if(!error) {
          setBanInput('');
          fetchSupabaseData();
          alert("تم حظر المحفظة");
      }
  };

  const handleRemoveBan = async (id: number) => {
      await supabase.from('banned_wallets').delete().eq('id', id);
      fetchSupabaseData();
  };

  const markPayoutPaid = async (id: number) => {
      if(!confirm("هل قمت بتحويل الأموال يدوياً؟ سيتم تغيير الحالة إلى مدفوع.")) return;
      await supabase.from('affiliate_payouts').update({ status: 'PAID' }).eq('id', id);
      fetchSupabaseData();
  };

  const toggleMaintenance = async () => {
    const newVal = !maintenanceMode;
    await supabase.from('app_settings').upsert({ id: 1, is_maintenance_mode: newVal });
    setMaintenanceMode(newVal);
  };

  const saveAnnouncement = async () => {
    await supabase.from('app_settings').upsert({ id: 1, announcement_text: announcement });
    alert("تم حفظ الإعلان");
  };

  // --- UI RENDER ---
  if (loading) return <div className="loading-screen">Authenticating Admin...</div>;
  if (!isAdmin) return (
      <div className="access-denied">
          <i className="bi bi-shield-lock-fill icon-large"></i>
          <h1>ACCESS DENIED</h1>
          <p>This panel is restricted to the Contract Owner only.</p>
          <p className="wallet-ref">{address}</p>
          <style jsx>{`
            .access-denied { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #121212; color: #ff4d4d; }
            .wallet-ref { color: #555; font-family: monospace; margin-top: 20px; }
            .icon-large { font-size: 60px; margin-bottom: 20px; }
          `}</style>
      </div>
  );

  return (
    <div className="admin-container">
        {/* --- HEADER --- */}
        <div className="admin-header">
            <div className="header-left">
                <h1><i className="bi bi-grid-1x2-fill"></i> ADMIN CONSOLE <span className="pro-badge">PRO</span></h1>
                <div className="live-indicator">
                    <span className="dot"></span> {visitorsCount} Online Visitors
                </div>
            </div>
            
            {/* TREASURY MODULE */}
            <div className="treasury-module">
                <div className="treasury-info">
                    <span className="label">Contract Balance</span>
                    <span className="value">{parseFloat(contractBalance).toFixed(4)} POL</span>
                </div>
                <button onClick={handleWithdraw} className="withdraw-btn">
                    <i className="bi bi-box-arrow-down"></i> Siphon Funds (Withdraw)
                </button>
            </div>
        </div>

        {/* --- CONTROL BAR (FILTERS) --- */}
        <div className="control-bar">
            <div className="filter-group">
                <button className={`filter-btn ${timeFilter==='24H' ? 'active' : ''}`} onClick={()=>setTimeFilter('24H')}>24H</button>
                <button className={`filter-btn ${timeFilter==='7D' ? 'active' : ''}`} onClick={()=>setTimeFilter('7D')}>7 Days</button>
                <button className={`filter-btn ${timeFilter==='MONTH' ? 'active' : ''}`} onClick={()=>setTimeFilter('MONTH')}>Month</button>
                <button className={`filter-btn ${timeFilter==='ALL' ? 'active' : ''}`} onClick={()=>setTimeFilter('ALL')}>All Time</button>
            </div>
            <div className="date-inputs">
                <input type="date" onChange={(e)=>setCustomStartDate(e.target.value)} />
                <span className="arrow">→</span>
                <input type="date" onChange={(e)=>setCustomEndDate(e.target.value)} />
            </div>
        </div>

        {/* --- ANALYTICS GRID --- */}
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-title">Total Revenue</div>
                <div className="stat-value text-green">${stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-sub">From Mints</div>
            </div>
            <div className="stat-card">
                <div className="stat-title">Market Fees (1%)</div>
                <div className="stat-value text-gold">${stats.marketFees.toFixed(2)}</div>
                <div className="stat-sub">Trading Commission</div>
            </div>
            <div className="stat-card">
                <div className="stat-title">Mint Counts</div>
                <div className="stat-row">
                    <span className="badge-immortal">Immortal: {stats.immortal}</span>
                    <span className="badge-elite">Elite: {stats.elite}</span>
                </div>
                <div className="stat-row mt-1">
                    <span className="badge-founder">Founder: {stats.founder}</span>
                </div>
            </div>
            <div className="stat-card highlight">
                <div className="stat-title">Admin Activity</div>
                <div className="stat-value">{stats.adminMints}</div>
                <div className="stat-sub">Internal Mints (Gas Only)</div>
            </div>
        </div>

        <div className="main-layout">
            {/* --- LEFT COLUMN --- */}
            <div className="col-left">
                
                {/* 1. MINT PRICE CONTROL */}
                <div className="panel-card">
                    <div className="panel-head"><i className="bi bi-tags-fill"></i> Mint Pricing Engine</div>
                    <div className="price-inputs">
                        <div className="input-wrap">
                            <label>Immortal ($)</label>
                            <input type="number" placeholder="Current" onChange={e=>setMintPrices({...mintPrices, immortal: e.target.value})} />
                        </div>
                        <div className="input-wrap">
                            <label>Elite ($)</label>
                            <input type="number" placeholder="Current" onChange={e=>setMintPrices({...mintPrices, elite: e.target.value})} />
                        </div>
                        <div className="input-wrap">
                            <label>Founder ($)</label>
                            <input type="number" placeholder="Current" onChange={e=>setMintPrices({...mintPrices, founder: e.target.value})} />
                        </div>
                    </div>
                    <button onClick={handleUpdatePrices} className="action-btn w-100 mt-3">UPDATE CONTRACT PRICES</button>
                </div>

                {/* 2. SYSTEM OPERATIONS & BAN */}
                <div className="panel-card mt-4">
                    <div className="panel-head text-red"><i className="bi bi-shield-slash-fill"></i> Security & Ops</div>
                    
                    <div className="ops-row">
                        <span>Maintenance Mode</span>
                        <button onClick={toggleMaintenance} className={`toggle-btn ${maintenanceMode ? 'on' : 'off'}`}>
                            {maintenanceMode ? 'ACTIVE (CLOSED)' : 'INACTIVE (OPEN)'}
                        </button>
                    </div>

                    <div className="ban-section mt-3">
                        <label>Blacklist Wallet (Ban Hammer)</label>
                        <div className="d-flex gap-2">
                            <input type="text" value={banInput} onChange={e=>setBanInput(e.target.value)} placeholder="0x..." className="ban-input" />
                            <button onClick={handleBanWallet} className="ban-btn">BAN</button>
                        </div>
                        <div className="banned-list mt-2">
                            {bannedWallets.map(b => (
                                <div key={b.id} className="banned-item">
                                    <span>{b.wallet_address.substring(0,8)}...</span>
                                    <button onClick={()=>handleRemoveBan(b.id)} className="unban-btn">x</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-3">
                        <label>Global Announcement</label>
                        <textarea rows={2} value={announcement} onChange={e=>setAnnouncement(e.target.value)} className="announce-input" />
                        <button onClick={saveAnnouncement} className="mini-btn mt-1">Save</button>
                    </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN --- */}
            <div className="col-right">
                
                {/* 3. WALLET RADAR (WHALES) */}
                <div className="panel-card">
                    <div className="panel-head text-blue"><i className="bi bi-radar"></i> Market Depth (Top Wallets)</div>
                    <div className="table-responsive">
                        <table className="pro-table">
                            <thead>
                                <tr>
                                    <th>Wallet</th>
                                    <th>Vol ($)</th>
                                    <th>Tx</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {walletRadar.slice(0, 10).map((w, i) => (
                                    <tr key={i} className={w.isWhale ? 'whale-row' : ''}>
                                        <td className="font-mono">
                                            {w.address.substring(0,6)}...
                                            {w.isWhale && <i className="bi bi-stars text-gold ms-1" title="Whale"></i>}
                                        </td>
                                        <td>${w.volume.toLocaleString()}</td>
                                        <td>{w.txCount}</td>
                                        <td>{w.isWhale ? '🐋 WHALE' : 'User'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. AFFILIATE NETWORK */}
                <div className="panel-card mt-4">
                    <div className="panel-head text-purple"><i className="bi bi-diagram-3-fill"></i> Affiliate Payouts</div>
                    <div className="table-responsive" style={{maxHeight: '200px'}}>
                        <table className="pro-table">
                            <thead><tr><th>Wallet</th><th>Amt ($)</th><th>Action</th></tr></thead>
                            <tbody>
                                {payouts.filter(p=>p.status === 'PENDING').map((p, i) => (
                                    <tr key={i}>
                                        <td className="font-mono">{p.wallet_address.substring(0,6)}...</td>
                                        <td className="text-green font-bold">${p.amount}</td>
                                        <td><button onClick={()=>markPayoutPaid(p.id)} className="pay-btn">PAY</button></td>
                                    </tr>
                                ))}
                                {payouts.filter(p=>p.status === 'PENDING').length === 0 && (
                                    <tr><td colSpan={3} className="text-center text-muted">No pending payouts</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>

        {/* --- CSS STYLES --- */}
        <style jsx>{`
            /* DARK CHARCOAL THEME */
            .admin-container {
                min-height: 100vh;
                background-color: #121212; /* Very Dark Charcoal */
                color: #e0e0e0;
                font-family: 'Inter', system-ui, sans-serif;
                padding: 20px;
                padding-top: 80px;
            }

            /* Header */
            .admin-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                padding-bottom: 20px;
                border-bottom: 1px solid #333;
                margin-bottom: 25px;
            }
            .header-left h1 { margin: 0; font-size: 24px; color: #fff; letter-spacing: 1px; }
            .pro-badge { background: #FCD535; color: #000; font-size: 10px; padding: 2px 6px; border-radius: 4px; vertical-align: middle; }
            .live-indicator { font-size: 12px; color: #0ecb81; margin-top: 5px; display: flex; align-items: center; gap: 6px; }
            .dot { width: 8px; height: 8px; background: #0ecb81; border-radius: 50%; animation: pulse 2s infinite; }

            /* Treasury Module */
            .treasury-module { display: flex; align-items: center; gap: 20px; background: #1E1E1E; padding: 10px 20px; border-radius: 8px; border: 1px solid #333; }
            .treasury-info { display: flex; flex-direction: column; }
            .treasury-info .label { font-size: 10px; color: #888; text-transform: uppercase; }
            .treasury-info .value { font-size: 18px; font-weight: bold; color: #FCD535; }
            .withdraw-btn { background: #333; color: #fff; border: 1px solid #555; padding: 8px 15px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-size: 12px; display: flex; gap: 5px; align-items: center; }
            .withdraw-btn:hover { background: #FCD535; color: #000; border-color: #FCD535; }

            /* Control Bar */
            .control-bar { display: flex; justify-content: space-between; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
            .filter-group { display: flex; gap: 5px; background: #1E1E1E; padding: 5px; border-radius: 6px; }
            .filter-btn { background: transparent; border: none; color: #888; padding: 6px 15px; font-size: 13px; cursor: pointer; border-radius: 4px; }
            .filter-btn.active { background: #333; color: #fff; font-weight: bold; }
            .date-inputs { display: flex; align-items: center; gap: 10px; }
            .date-inputs input { background: #1E1E1E; border: 1px solid #333; color: #fff; padding: 5px 10px; border-radius: 4px; color-scheme: dark; }

            /* Stats Grid */
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .stat-card { background: #1E1E1E; padding: 20px; border-radius: 10px; border: 1px solid #2D2D2D; position: relative; overflow: hidden; }
            .stat-card.highlight { background: linear-gradient(145deg, #1E1E1E, #252525); border-color: #444; }
            .stat-title { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
            .stat-value { font-size: 24px; font-weight: 700; color: #fff; }
            .stat-sub { font-size: 11px; color: #666; margin-top: 5px; }
            .text-green { color: #0ecb81; } .text-gold { color: #FCD535; }
            
            .badge-immortal { color: #FCD535; font-size: 11px; margin-right: 8px; }
            .badge-elite { color: #c0c0c0; font-size: 11px; }
            .badge-founder { color: #cd7f32; font-size: 11px; }

            /* Layout Columns */
            .main-layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 25px; }
            @media (max-width: 900px) { .main-layout { grid-template-columns: 1fr; } }

            /* Panels */
            .panel-card { background: #1E1E1E; border-radius: 12px; padding: 20px; border: 1px solid #2D2D2D; height: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
            .panel-head { font-size: 14px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; color: #ccc; border-bottom: 1px solid #2D2D2D; padding-bottom: 10px; }
            .text-red { color: #ff5252; } .text-blue { color: #448aff; } .text-purple { color: #b388ff; }

            /* Inputs */
            .price-inputs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
            .input-wrap label { display: block; font-size: 10px; color: #666; margin-bottom: 4px; }
            input, textarea { width: 100%; background: #121212; border: 1px solid #333; color: #fff; padding: 8px; border-radius: 4px; font-size: 13px; }
            input:focus, textarea:focus { border-color: #FCD535; outline: none; }
            
            /* Buttons */
            .action-btn { background: #FCD535; color: #000; border: none; font-weight: bold; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; }
            .toggle-btn { width: 100%; padding: 8px; border-radius: 4px; border: none; font-weight: bold; font-size: 11px; cursor: pointer; }
            .toggle-btn.on { background: #d32f2f; color: #fff; }
            .toggle-btn.off { background: #388e3c; color: #fff; }
            
            /* Tables */
            .table-responsive { overflow-x: auto; }
            .pro-table { width: 100%; border-collapse: collapse; font-size: 12px; }
            .pro-table th { text-align: left; color: #666; font-weight: 500; padding: 8px; border-bottom: 1px solid #333; }
            .pro-table td { padding: 8px; border-bottom: 1px solid #262626; color: #ddd; }
            .whale-row { background: rgba(252, 213, 53, 0.05); }
            .font-mono { font-family: 'Roboto Mono', monospace; }
            
            .pay-btn { background: #388e3c; color: #fff; border: none; padding: 4px 12px; border-radius: 4px; font-size: 10px; cursor: pointer; }
            .ban-btn { background: #d32f2f; color: #fff; border: none; padding: 0 15px; border-radius: 4px; font-size: 11px; cursor: pointer; }
            
            .banned-item { display: flex; justify-content: space-between; font-size: 11px; font-family: monospace; background: #121212; padding: 5px; margin-top: 5px; border-radius: 4px; }
            .unban-btn { background: none; border: none; color: #666; cursor: pointer; }
            .unban-btn:hover { color: #fff; }

            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        `}</style>
    </div>
  );
}
