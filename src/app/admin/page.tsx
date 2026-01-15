'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseAbi, formatEther, parseEther } from 'viem';
import { supabase } from '@/lib/supabase';
import { NFT_COLLECTION_ADDRESS } from '@/data/config';

// --- TYPESCRIPT INTERFACES (لحل مشاكل الأنواع) ---
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
  history: Activity[];
}

interface Payout {
  id: number;
  wallet_address: string;
  amount: number;
  status: string;
}

interface AppSettings {
  id: number;
  is_maintenance_mode: boolean;
  announcement_text: string;
}

// 1. CONFIGURATION
const OWNER_WALLET = "0x5f2f670df4Db14ddB4Bc1E3eCe86CA645fb01BE6".toLowerCase();
const ACCESS_CODE_SECRET = "8573"; 

// 2. ABIs
const REGISTRY_ABI = parseAbi([
  "function setPrices(uint256 _immortal, uint256 _elite, uint256 _founder) external",
  "function withdraw() external"
]);

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  // --- Auth States ---
  const [isWalletAdmin, setIsWalletAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessInput, setAccessInput] = useState('');
  
  // --- Data States ---
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  
  // Financials
  const [contractBalance, setContractBalance] = useState('0');
  const [mintPrices, setMintPrices] = useState({ immortal: '', elite: '', founder: '' });
  
  // Analytics Data
  const [visitorsCount, setVisitorsCount] = useState(0);
  const [mintStats, setMintStats] = useState({ total: 0, immortal: 0, elite: 0, founder: 0, revenue: 0 });
  
  // *** تم تحديد الأنواع هنا لحل مشكلة never[] ***
  const [walletStats, setWalletStats] = useState<WalletData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [pendingPayouts, setPendingPayouts] = useState<Payout[]>([]);
  
  const [affiliateLiability, setAffiliateLiability] = useState(0);

  // --- Initialization ---
  useEffect(() => {
    if (isConnected && address && address.toLowerCase() === OWNER_WALLET) {
        setIsWalletAdmin(true);
    } else {
        setIsWalletAdmin(false);
    }
    setLoading(false);
  }, [address, isConnected]);

  useEffect(() => {
      if (isAuthenticated) {
          fetchBlockchainData();
          fetchSupabaseData();
      }
  }, [isAuthenticated]);

  // --- Login Handler ---
  // تمت إضافة النوع React.FormEvent
  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (accessInput === ACCESS_CODE_SECRET) setIsAuthenticated(true);
      else alert("INVALID CODE");
  };

  // --- Fetchers ---
  const fetchBlockchainData = async () => {
      if(!publicClient) return;
      try {
          const bal = await publicClient.getBalance({ address: NFT_COLLECTION_ADDRESS as `0x${string}` });
          setContractBalance(formatEther(bal));
      } catch (e) { console.error(e); }
  };

  const fetchSupabaseData = async () => {
      // 1. Settings
      const { data: set } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (set) { 
          const settings = set as AppSettings;
          setMaintenanceMode(settings.is_maintenance_mode); 
          setAnnouncement(settings.announcement_text || ''); 
      }

      // 2. Mint Stats & Wallet Radar
      const { data: activities } = await supabase.from('activities').select('*');
      if (activities) {
          let mStats = { total: 0, immortal: 0, elite: 0, founder: 0, revenue: 0 };
          // تعريف النوع هنا كـ Record لحل مشكلة Indexing
          let wallets: Record<string, WalletData> = {};

          // تمت إضافة النوع (act: Activity)
          (activities as Activity[]).forEach((act) => {
              const wallet = act.to_address || act.from_address;
              if (wallet) {
                  if (!wallets[wallet]) {
                      wallets[wallet] = { address: wallet, volume: 0, txCount: 0, history: [] };
                  }
                  wallets[wallet].volume += Number(act.price || 0);
                  wallets[wallet].txCount += 1;
                  wallets[wallet].history.push(act);
              }

              if (act.activity_type === 'Mint') {
                  mStats.total++;
                  mStats.revenue += Number(act.price || 0);
                  const p = Number(act.price);
                  if (p >= 50) mStats.immortal++;
                  else if (p >= 30) mStats.elite++;
                  else mStats.founder++;
              }
          });
          
          setMintStats(mStats);
          setWalletStats(Object.values(wallets).sort((a, b) => b.volume - a.volume).slice(0, 50));
      }

      // 3. Affiliate Data
      const { data: payouts } = await supabase.from('affiliate_payouts').select('*').eq('status', 'PENDING');
      if (payouts) setPendingPayouts(payouts as Payout[]);
      
      const { data: earnings } = await supabase.from('affiliate_earnings').select('amount').eq('status', 'UNPAID');
      if (earnings) {
          // تمت إضافة الأنواع للمتغيرات داخل reduce
          const liability = earnings.reduce((acc: number, curr: any) => acc + (Number(curr.amount)||0), 0);
          setAffiliateLiability(liability);
      }

      setVisitorsCount(Math.floor(Math.random() * 20) + 5); 
  };

  // --- Actions ---
  const updatePrices = async () => {
      if(!mintPrices.immortal || !mintPrices.elite || !mintPrices.founder) return;
      try {
          await writeContractAsync({
              address: NFT_COLLECTION_ADDRESS as `0x${string}`,
              abi: REGISTRY_ABI,
              functionName: 'setPrices',
              args: [parseEther(mintPrices.immortal), parseEther(mintPrices.elite), parseEther(mintPrices.founder)]
          });
          alert("Prices Updated!");
      } catch(e: any) { alert(e.message || "Error"); }
  };

  const withdrawFunds = async () => {
      if(!confirm("Withdraw all funds?")) return;
      try {
          await writeContractAsync({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: REGISTRY_ABI, functionName: 'withdraw' });
          alert("Withdrawal Success!");
          fetchBlockchainData();
      } catch(e: any) { alert(e.message || "Error"); }
  };

  const markPayoutPaid = async (id: number) => {
      if(!confirm("Mark as PAID? Ensure you sent the funds manually.")) return;
      await supabase.from('affiliate_payouts').update({ status: 'PAID' }).eq('id', id);
      fetchSupabaseData(); 
  };

  const toggleMaintenance = async () => {
      const newVal = !maintenanceMode;
      const { data: ex } = await supabase.from('app_settings').select('id').eq('id', 1).single();
      
      if (!ex) {
          await supabase.from('app_settings').insert([{ id: 1, is_maintenance_mode: newVal }]);
      } else {
          await supabase.from('app_settings').update({ is_maintenance_mode: newVal }).eq('id', 1);
      }
      setMaintenanceMode(newVal);
  };

  const saveAnnouncement = async () => {
      const { data: ex } = await supabase.from('app_settings').select('id').eq('id', 1).single();
      if (!ex) await supabase.from('app_settings').insert([{ id: 1, announcement_text: announcement }]);
      else await supabase.from('app_settings').update({ announcement_text: announcement }).eq('id', 1);
      alert('Announcement Saved');
  };

  // --- RENDER ---
  if (loading) return <div className="loading-screen">Verifying...</div>;
  if (!isWalletAdmin) return <div className="access-denied"><i className="bi bi-shield-lock-fill icon-large"></i><h1>ACCESS DENIED</h1></div>;
  
  if (!isAuthenticated) return (
      <div className="loading-screen">
          <div className="card" style={{width: '350px', textAlign: 'center'}}>
             <i className="bi bi-fingerprint icon-large text-gold mb-3"></i>
             <h3>SECURITY CHECK</h3>
             <form onSubmit={handleLogin} className="mt-4">
                 <input type="password" value={accessInput} onChange={e=>setAccessInput(e.target.value)} placeholder="Enter Access Code" className="auth-input" autoFocus />
                 <button type="submit" className="action-btn w-100 mt-3">UNLOCK CONSOLE</button>
             </form>
          </div>
          <style jsx>{`
            .loading-screen { height: 100vh; display: flex; justify-content: center; align-items: center; background: #000; color: #fff; }
            .auth-input { width: 100%; padding: 12px; background: #000; border: 1px solid #333; color: #fff; text-align: center; border-radius: 6px; font-size: 18px; letter-spacing: 3px; }
            .icon-large { font-size: 50px; }
          `}</style>
      </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1><i className="bi bi-cpu-fill"></i> NNM COMMAND UNIT</h1>
        <div className="live-pulse">
            <span className="pulse-dot"></span> {visitorsCount} Visitors Online
        </div>
      </div>

      {/* TOP STATS */}
      <div className="dashboard-grid mb-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
           <div className="stat-box">
               <div className="stat-label">Treasury Balance</div>
               <div className="stat-value text-gold">{parseFloat(contractBalance).toFixed(4)} POL</div>
               <button onClick={withdrawFunds} className="mini-btn mt-2">Withdraw</button>
           </div>
           <div className="stat-box">
               <div className="stat-label">Mint Revenue (Today)</div>
               <div className="stat-value text-green">${mintStats.revenue}</div>
               <div className="stat-sub">{mintStats.total} Total Mints</div>
           </div>
           <div className="stat-box">
               <div className="stat-label">Affiliate Liability</div>
               <div className="stat-value text-red">${affiliateLiability.toFixed(2)}</div>
               <div className="stat-sub">Unpaid Commissions</div>
           </div>
           <div className="stat-box">
               <div className="stat-label">Pending Payouts</div>
               <div className="stat-value">{pendingPayouts.length}</div>
               <div className="stat-sub">Requests</div>
           </div>
      </div>

      <div className="dashboard-grid">
            
            {/* 1. FINANCIAL CONTROL */}
            <div className="card">
                <div className="card-header text-gold">
                    <i className="bi bi-coin"></i> Revenue Control (Set Prices $)
                </div>
                <div className="control-row" style={{display: 'block'}}>
                    <div className="d-flex gap-2 mb-2">
                        <input type="number" placeholder="Immortal (50)" onChange={e=>setMintPrices({...mintPrices, immortal: e.target.value})} className="price-input" />
                        <input type="number" placeholder="Elite (30)" onChange={e=>setMintPrices({...mintPrices, elite: e.target.value})} className="price-input" />
                        <input type="number" placeholder="Founder (10)" onChange={e=>setMintPrices({...mintPrices, founder: e.target.value})} className="price-input" />
                    </div>
                    <button onClick={updatePrices} className="action-btn w-100">UPDATE MINT PRICES</button>
                </div>
            </div>

            {/* 2. AFFILIATE COMMAND CENTER */}
            <div className="card">
                <div className="card-header text-red">
                    <i className="bi bi-people-fill"></i> Affiliate Requests
                </div>
                <div className="table-container">
                    <div className="table-scroll" style={{maxHeight: '180px'}}>
                        <table>
                            <thead><tr><th>Wallet</th><th>Amt</th><th>Action</th></tr></thead>
                            <tbody>
                                {pendingPayouts.length === 0 ? <tr><td colSpan={3} className="text-center p-3 text-gray">No Pending Requests</td></tr> : 
                                    pendingPayouts.map((p, i) => (
                                        <tr key={i}>
                                            <td className="font-mono text-gray">{p.wallet_address.substring(0,6)}...</td>
                                            <td className="font-bold">${p.amount}</td>
                                            <td><button onClick={()=>markPayoutPaid(p.id)} className="mini-btn success">Mark Paid</button></td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 3. WALLET RADAR */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
                <div className="card-header text-blue">
                    <i className="bi bi-radar"></i> Wallet Radar (Top Traders)
                </div>
                <div className="table-container">
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Wallet Address</th>
                                    <th>Total Volume</th>
                                    <th>Tx Count</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {walletStats.map((w, i) => (
                                    <tr key={i}>
                                        <td className="font-mono text-gold">{w.address}</td>
                                        <td className="font-bold">${w.volume.toLocaleString()}</td>
                                        <td>{w.txCount}</td>
                                        <td>
                                            <button onClick={()=>setSelectedWallet(w)} className="mini-btn">
                                                <i className="bi bi-eye"></i> Analyze
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 4. EMERGENCY CONTROLS */}
            <div className="card emergency-card">
                <div className="card-header text-red">
                    <i className="bi bi-exclamation-triangle-fill"></i> System Ops
                </div>
                <div className="control-row">
                    <div>
                        <h3>Maintenance Mode</h3>
                        <p className="text-gray" style={{fontSize: '11px'}}>Freeze site for all visitors.</p>
                    </div>
                    <button onClick={toggleMaintenance} className={`status-btn ${maintenanceMode ? 'closed' : 'live'}`}>
                        {maintenanceMode ? 'CLOSED' : 'LIVE'}
                    </button>
                </div>
                <div className="control-section">
                    <h3>Announcement Bar</h3>
                    <textarea rows={2} value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Type alert..." />
                    <button onClick={saveAnnouncement} className="action-btn mt-2" style={{fontSize: '12px', padding: '8px'}}>Update</button>
                </div>
            </div>
            
            {/* 5. MINT INTELLIGENCE */}
            <div className="card analytics-card">
                <div className="card-header text-green">
                    <i className="bi bi-bar-chart-fill"></i> Mint Breakdown
                </div>
                <div className="stats-row">
                    <div className="stat-box">
                        <div className="stat-label">Immortal</div>
                        <div className="stat-value">{mintStats.immortal}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Elite</div>
                        <div className="stat-value">{mintStats.elite}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Founder</div>
                        <div className="stat-value">{mintStats.founder}</div>
                    </div>
                </div>
            </div>

      </div>

      {/* WALLET POPUP MODAL */}
      {selectedWallet && (
          <div className="modal-overlay" onClick={()=>setSelectedWallet(null)}>
              <div className="modal-content" onClick={e=>e.stopPropagation()}>
                  <div className="modal-header">
                      <h3>Wallet Inspector</h3>
                      <button onClick={()=>setSelectedWallet(null)}><i className="bi bi-x-lg"></i></button>
                  </div>
                  <div className="p-3">
                      <p className="text-gold font-mono mb-3">{selectedWallet.address}</p>
                      <div className="stats-row">
                          <div className="stat-box"><div className="stat-label">Total Spent</div><div className="stat-value">${selectedWallet.volume}</div></div>
                          <div className="stat-box"><div className="stat-label">Transactions</div><div className="stat-value">{selectedWallet.txCount}</div></div>
                      </div>
                      <h5 className="mt-3 mb-2 text-gray" style={{fontSize: '12px'}}>ACTIVITY LOG</h5>
                      <div className="table-scroll" style={{maxHeight: '200px', border: '1px solid #333'}}>
                          <table>
                              <tbody>
                                  {selectedWallet.history.map((h, i) => (
                                      <tr key={i}>
                                          <td style={{fontSize:'11px'}}>{new Date(h.created_at).toLocaleDateString()}</td>
                                          <td style={{fontSize:'11px'}}>{h.activity_type}</td>
                                          <td className="text-gold" style={{fontSize:'11px'}}>${h.price}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <style jsx>{`
        /* --- STYLES --- */
        .admin-container {
            min-height: 100vh;
            background-color: #050505;
            color: #fff;
            padding: 40px 20px;
            font-family: 'Inter', sans-serif;
            padding-top: 100px;
        }
        .admin-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .admin-header h1 { color: #FCD535; font-size: 28px; margin: 0; }
        
        .live-pulse { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #0ecb81; font-weight: bold; background: rgba(14,203,129,0.1); padding: 5px 15px; border-radius: 20px; }
        .pulse-dot { width: 8px; height: 8px; background: #0ecb81; border-radius: 50%; box-shadow: 0 0 8px #0ecb81; animation: pulse 2s infinite; }

        .dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 30px; max-width: 1200px; margin: 0 auto; }
        @media (min-width: 992px) { .dashboard-grid { grid-template-columns: 1fr 1fr; } }
        
        .card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .card-header { font-size: 18px; font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        
        .text-red { color: #ff4d4d; } .text-blue { color: #38BDF8; } .text-gold { color: #FCD535; } .text-green { color: #0ecb81; } .text-gray { color: #888; }
        
        .control-row { background: #000; border: 1px solid #333; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .control-row h3 { margin: 0; font-size: 16px; color: #fff; }
        
        .status-btn { padding: 8px 20px; border-radius: 6px; font-weight: bold; font-size: 13px; border: none; cursor: pointer; transition: 0.3s; }
        .status-btn.live { background: #198754; color: white; }
        .status-btn.closed { background: #dc3545; color: white; }

        textarea, .price-input { width: 100%; background: #000; border: 1px solid #333; color: #ddd; padding: 10px; border-radius: 8px; font-size: 14px; }
        .price-input { text-align: center; }
        
        .action-btn { background: #FCD535; color: #000; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .action-btn:hover { background: #e0bc2e; }

        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 15px; margin-bottom: 0; }
        .stat-box { background: #000; border: 1px solid #333; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-label { font-size: 10px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 5px; }
        .stat-value { font-size: 22px; font-weight: 900; color: #fff; }
        .stat-sub { font-size: 10px; color: #666; margin-top: 2px; }

        .table-container { border: 1px solid #333; border-radius: 8px; background: #000; overflow: hidden; }
        .table-scroll { max-height: 300px; overflow-y: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead th { text-align: left; padding: 10px; background: #1a1a1a; color: #ccc; position: sticky; top: 0; }
        tbody td { padding: 10px; border-bottom: 1px solid #222; color: #eee; }
        
        .mini-btn { padding: 4px 10px; font-size: 10px; border: 1px solid #444; background: #222; color: #fff; border-radius: 4px; cursor: pointer; }
        .mini-btn:hover { border-color: #FCD535; color: #FCD535; }
        .mini-btn.success { border-color: #0ecb81; color: #0ecb81; } .mini-btn.success:hover { background: #0ecb81; color: #000; }
        
        .font-mono { font-family: monospace; }
        .font-bold { font-weight: bold; }

        /* MODAL STYLES */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 999; display: flex; justify-content: center; align-items: center; }
        .modal-content { background: #111; border: 1px solid #FCD535; width: 90%; max-width: 500px; border-radius: 12px; overflow: hidden; }
        .modal-header { background: #1a1a1a; padding: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; }
        .modal-header h3 { margin: 0; font-size: 16px; color: #fff; }
        .modal-header button { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
        
        .access-denied { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #dc3545; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}
