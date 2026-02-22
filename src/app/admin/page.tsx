'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useWriteContract, usePublicClient, useSendTransaction } from 'wagmi';
import { parseAbi, formatEther, parseEther } from 'viem';
import { NFT_COLLECTION_ADDRESS } from '@/data/config';

const OWNER_WALLET = (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || "").toLowerCase();

const REGISTRY_ABI = parseAbi([
  "function setPrices(uint256 _immortal, uint256 _elite, uint256 _founder) external",
  "function withdraw() external"
]);

const BG_DARK = '#181A20';
const PANEL_BG = '#1E2329';
const BORDER_COLOR = '#2B3139';
const BRAND_GOLD = '#FCD535';
const TEXT_PRIMARY = '#EAECEF';
const TEXT_MUTED = '#848E9C';

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contractBalance, setContractBalance] = useState('0');
  
  const [activities, setActivities] = useState<any[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [bans, setBans] = useState<any[]>([]);
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [banInput, setBanInput] = useState('');
  
  const [mintPrices, setMintPrices] = useState({ immortal: '', elite: '', founder: '' });

  const [filterType, setFilterType] = useState('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  const [affStart, setAffStart] = useState('');
  const [affEnd, setAffEnd] = useState('');
  const [affWallet, setAffWallet] = useState('');

  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  useEffect(() => {
    if (isConnected && address && address.toLowerCase() === OWNER_WALLET) {
      setIsAdmin(true);
      fetchContractData();
      fetchDashboardData();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [address, isConnected, filterType, affStart, affEnd, affWallet]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
  };

  const fetchContractData = async () => {
    if (!publicClient) return;
    try {
      const bal = await publicClient.getBalance({ address: NFT_COLLECTION_ADDRESS as `0x${string}` });
      setContractBalance(formatEther(bal));
    } catch (e) {}
  };

  const fetchDashboardData = async () => {
    let url = '/api/admin?';
    
    if (filterType === '24H') {
      const start = new Date(Date.now() - 86400000).toISOString();
      url += `start=${start}&`;
    } else if (filterType === 'CUSTOM' && customStart && customEnd) {
      const start = new Date(customStart).toISOString();
      const end = new Date(customEnd).setHours(23, 59, 59);
      url += `start=${start}&end=${new Date(end).toISOString()}&`;
    }

    if (affStart && affEnd) {
      const aStart = new Date(affStart).toISOString();
      const aEnd = new Date(affEnd).setHours(23, 59, 59);
      url += `affStart=${aStart}&affEnd=${new Date(aEnd).toISOString()}&`;
    }
    if (affWallet) {
      url += `affWallet=${affWallet}&`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.settings) {
        setMaintenanceMode(data.settings.is_maintenance_mode);
        setAnnouncement(data.settings.announcement_text || '');
      }
      setActivities(data.activities);
      setPendingPayouts(data.pendingPayouts);
      setPayoutHistory(data.payoutHistory);
      setBans(data.bans);
    } catch (e) {}
    setLoading(false);
  };

  const execPost = async (action: string, payload: any) => {
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    fetchDashboardData();
  };

  const handleUpdateAnnouncement = () => {
    execPost('update_settings', { announcement_text: announcement });
    showToast('Announcement updated');
  };

  const handleToggleSite = (status: boolean) => {
    execPost('update_settings', { is_maintenance_mode: status });
    showToast(status ? 'Site is now CLOSED' : 'Site is now LIVE');
  };

  const handleBan = () => { 
    if (banInput) { 
      execPost('ban_wallet', { wallet: banInput }); 
      setBanInput(''); 
      showToast('Wallet banned');
    } 
  };

  const handleUnban = (wallet: string) => {
    execPost('unban_wallet', { wallet });
    showToast('Wallet unbanned');
  };

  const handleWithdraw = async () => {
    try {
      await writeContractAsync({
        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
        abi: REGISTRY_ABI,
        functionName: 'withdraw'
      });
      showToast('Withdrawal transaction sent');
    } catch (e: any) {
      showToast(e.shortMessage || 'Withdrawal failed', 'error');
    }
  };

  const handleUpdatePrices = async () => {
    if (!mintPrices.immortal || !mintPrices.elite || !mintPrices.founder) return;
    try {
      await writeContractAsync({
        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
        abi: REGISTRY_ABI,
        functionName: 'setPrices',
        args: [parseEther(mintPrices.immortal), parseEther(mintPrices.elite), parseEther(mintPrices.founder)]
      });
      showToast('Prices update sent');
    } catch (e: any) {
      showToast(e.shortMessage || 'Update failed', 'error');
    }
  };

  const handlePayAffiliate = async (payoutId: number, wallet: string, amount: string) => {
    try {
      if (!address) {
        showToast('Please connect admin wallet', 'error');
        return;
      }
      const hash = await sendTransactionAsync({
        to: wallet as `0x${string}`,
        value: parseEther(amount.toString())
      });
      if (hash) {
        await execPost('mark_paid', { id: payoutId, hash });
        showToast('Payment successful');
      }
    } catch (e: any) {
      showToast(e.shortMessage || 'Payment failed', 'error');
    }
  };

  const handleDeletePayout = (payoutId: number) => {
    execPost('delete_payout', { id: payoutId });
    showToast('Payout deleted', 'error');
  };

  const visitors = useMemo(() => {
    const oneDayAgo = Date.now() - 86400000;
    const uniqueOff = new Set();
    const uniqueOn = new Set();
    let count24 = 0;

    activities.forEach(act => {
      const addr = act.from_address;
      if (!addr) {
        uniqueOff.add(act.id);
      } else {
        uniqueOn.add(addr);
      }
      if (new Date(act.created_at).getTime() > oneDayAgo) count24++;
    });

    return { off: uniqueOff.size, on: uniqueOn.size, total: uniqueOff.size + uniqueOn.size, last24: count24 };
  }, [activities]);

  const stats = useMemo(() => {
    let immortal = 0, elite = 0, founder = 0, market = 0, total = 0;

    activities.forEach(act => {
      const price = Number(act.price || 0);
      if (act.activity_type === 'Mint') {
        if (price >= 15) immortal++;
        else if (price >= 10) elite++;
        else if (price >= 5) founder++;
        total += price;
      } else if (act.activity_type === 'MarketSale') {
        market += price;
        total += price;
      }
    });

    return { immortal, elite, founder, market, total };
  }, [activities]);

  const affiliateStats = useMemo(() => {
    let totalPaid = 0;
    payoutHistory.forEach(p => {
      if (p.status === 'PAID') totalPaid += Number(p.amount || 0);
    });
    return { totalPaid };
  }, [payoutHistory]);

  const whales = useMemo(() => {
    const w: Record<string, any> = {};
    activities.forEach(act => {
      const addr = act.to_address || act.from_address;
      if (!addr || addr.toLowerCase() === OWNER_WALLET) return;
      if (!w[addr]) w[addr] = { address: addr, vol: 0, tx: 0, last: act.created_at };
      w[addr].vol += Number(act.price || 0);
      w[addr].tx += 1;
      if (new Date(act.created_at) > new Date(w[addr].last)) w[addr].last = act.created_at;
    });
    return Object.values(w).sort((a, b) => b.vol - a.vol).slice(0, 10);
  }, [activities]);

  const applyCustomFilter = () => {
    if (customStart && customEnd) {
      setFilterType('CUSTOM');
      fetchDashboardData();
      setShowCustomDate(false);
    }
  };

  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <div style={{ background: BG_DARK, color: TEXT_PRIMARY, minHeight: '100vh', padding: '100px 20px 40px', fontFamily: 'sans-serif' }}>
      
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: '15px', marginBottom: '20px', fontSize: '13px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
                onClick={() => handleToggleSite(false)} 
                style={{ background: !maintenanceMode ? '#00C851' : 'transparent', color: !maintenanceMode ? '#000' : TEXT_MUTED, border: `1px solid ${!maintenanceMode ? '#00C851' : BORDER_COLOR}`, padding: '4px 12px', borderRadius: '15px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                LIVE
            </button>
            <button 
                onClick={() => handleToggleSite(true)} 
                style={{ background: maintenanceMode ? '#ff4444' : 'transparent', color: maintenanceMode ? '#fff' : TEXT_MUTED, border: `1px solid ${maintenanceMode ? '#ff4444' : BORDER_COLOR}`, padding: '4px 12px', borderRadius: '15px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                CLOSED
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: PANEL_BG, padding: '4px 10px', borderRadius: '6px', border: `1px solid ${BORDER_COLOR}` }}>
             <span style={{ color: BRAND_GOLD, fontWeight: 'bold' }}>{contractBalance} POL</span>
             <button 
                onClick={handleWithdraw}
                style={{ background: 'transparent', border: `1px solid ${BRAND_GOLD}`, color: BRAND_GOLD, padding: '2px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                WITHDRAW
             </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', color: TEXT_MUTED }}>
          <span>OFF: <strong style={{color: TEXT_PRIMARY}}>{visitors.off}</strong></span>
          <span>ON: <strong style={{color: TEXT_PRIMARY}}>{visitors.on}</strong></span>
          <span>TOTAL: <strong style={{color: TEXT_PRIMARY}}>{visitors.total}</strong></span>
          <span>24H: <strong style={{color: TEXT_PRIMARY}}>{visitors.last24}</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input 
          value={announcement} 
          onChange={e => setAnnouncement(e.target.value)} 
          placeholder="System Announcement..." 
          style={{ flexGrow: 1, background: PANEL_BG, border: `1px solid ${BORDER_COLOR}`, color: TEXT_PRIMARY, padding: '10px', outline: 'none', borderRadius: '4px' }} 
        />
        <button className="glass-btn" onClick={handleUpdateAnnouncement}>UPDATE MSG</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div className="stat-box"><div>IMMORTAL</div><span>{stats.immortal}</span></div>
        <div className="stat-box"><div>ELITE</div><span>{stats.elite}</span></div>
        <div className="stat-box"><div>FOUNDER</div><span>{stats.founder}</span></div>
        <div className="stat-box"><div>MARKET VOL</div><span>${stats.market.toFixed(2)}</span></div>
        <div className="stat-box"><div>GRAND TOTAL</div><span style={{ color: BRAND_GOLD }}>${stats.total.toFixed(2)}</span></div>
        
        <div className="stat-box" style={{ position: 'relative' }}>
          <div>FILTER</div>
          <select 
            value={filterType} 
            onChange={(e) => {
              if(e.target.value === 'CUSTOM') setShowCustomDate(true);
              else { setShowCustomDate(false); setFilterType(e.target.value); }
            }}
            className="dark-select"
          >
            <option value="ALL">ALL TIME</option>
            <option value="24H">DAILY (24H)</option>
            <option value="CUSTOM">CUSTOM...</option>
          </select>

          {showCustomDate && (
            <div style={{ position: 'absolute', top: '100%', right: 0, background: PANEL_BG, border: `1px solid ${BORDER_COLOR}`, padding: '10px', zIndex: 10, marginTop: '5px', borderRadius: '4px', width: '200px' }}>
              <input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} className="dark-date"/>
              <input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} className="dark-date" style={{ marginBottom: '10px' }}/>
              <button className="glass-btn" style={{ width:'100%', padding:'5px' }} onClick={applyCustomFilter}>APPLY</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        <input type="number" placeholder="Immortal $" onChange={e=>setMintPrices({...mintPrices, immortal: e.target.value})} className="price-input" />
        <input type="number" placeholder="Elite $" onChange={e=>setMintPrices({...mintPrices, elite: e.target.value})} className="price-input" />
        <input type="number" placeholder="Founder $" onChange={e=>setMintPrices({...mintPrices, founder: e.target.value})} className="price-input" />
        <button className="glass-btn" onClick={handleUpdatePrices}>UPDATE CONTRACT</button>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ color: TEXT_MUTED, fontSize: '12px', textTransform: 'uppercase', margin: 0 }}>Pending Affiliate Payouts</h4>
        </div>
        <table className="admin-table">
          <thead><tr><th>WALLET</th><th>AMOUNT</th><th>ACTION</th></tr></thead>
          <tbody>
            {pendingPayouts.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace' }}>{p.wallet_address}</td>
                <td style={{ color: '#00C851', fontWeight: 'bold' }}>${p.amount}</td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="glass-btn" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handlePayAffiliate(p.id, p.wallet_address, p.amount)}>PAY NOW</button>
                    <button className="glass-btn" style={{ padding: '4px 10px', fontSize: '11px', color: '#ff4444', borderColor: 'rgba(255,68,68,0.3)' }} onClick={() => handleDeletePayout(p.id)}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingPayouts.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>No pending payouts</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '40px', padding: '20px', background: PANEL_BG, borderRadius: '6px', border: `1px solid ${BORDER_COLOR}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 style={{ color: TEXT_MUTED, fontSize: '12px', textTransform: 'uppercase', margin: 0 }}>Affiliate History & Analysis</h4>
          <span style={{ color: BRAND_GOLD, fontSize: '14px', fontWeight: 'bold' }}>Total Paid: ${affiliateStats.totalPaid.toFixed(2)}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
          <input type="date" value={affStart} onChange={e=>setAffStart(e.target.value)} className="dark-date" style={{ width: 'auto' }} />
          <span style={{ color: TEXT_MUTED }}>-</span>
          <input type="date" value={affEnd} onChange={e=>setAffEnd(e.target.value)} className="dark-date" style={{ width: 'auto' }} />
          <input type="text" value={affWallet} onChange={e=>setAffWallet(e.target.value)} placeholder="Filter by Wallet..." className="price-input" style={{ maxWidth: '300px' }} />
          <button className="glass-btn" onClick={() => { setAffStart(''); setAffEnd(''); setAffWallet(''); }}>CLEAR</button>
        </div>

        <table className="admin-table" style={{ background: BG_DARK }}>
          <thead><tr><th>WALLET</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
          <tbody>
            {payoutHistory.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace' }}>{p.wallet_address}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td style={{ color: BRAND_GOLD }}>${p.amount}</td>
                <td><span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(0, 200, 81, 0.1)', color: '#00C851' }}>{p.status}</span></td>
              </tr>
            ))}
            {payoutHistory.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No records found</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h4 style={{ color: TEXT_MUTED, fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase' }}>Banned Wallets</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input value={banInput} onChange={e=>setBanInput(e.target.value)} placeholder="0x..." className="price-input" style={{ maxWidth: '300px' }} />
          <button className="glass-btn" onClick={handleBan}>BAN WALLET</button>
        </div>
        <table className="admin-table">
          <thead><tr><th>WALLET</th><th>DATE</th><th>ACTION</th></tr></thead>
          <tbody>
            {bans.map(b => (
              <tr key={b.id}>
                <td style={{ fontFamily: 'monospace' }}>{b.wallet_address}</td>
                <td>{new Date(b.created_at).toLocaleDateString()}</td>
                <td><button className="glass-btn" style={{ padding: '4px 10px', fontSize: '11px', color: '#ff4444', borderColor: 'rgba(255,68,68,0.3)' }} onClick={() => handleUnban(b.wallet_address)}>UNBAN</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h4 style={{ color: TEXT_MUTED, fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase' }}>Whale Tracker</h4>
        <table className="admin-table">
          <thead><tr><th>WALLET</th><th>TOTAL SPENT</th><th>TX COUNT</th><th>LAST ACTIVE</th></tr></thead>
          <tbody>
            {whales.map((w, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'monospace' }}>{w.address}</td>
                <td style={{ color: BRAND_GOLD, fontWeight: 'bold' }}>${w.vol.toFixed(2)}</td>
                <td>{w.tx}</td>
                <td>{new Date(w.last).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .glass-btn { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: ${TEXT_PRIMARY}; padding: 10px 20px; cursor: pointer; transition: 0.2s; font-size: 12px; border-radius: 4px; }
        .glass-btn:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
        .stat-box { background: ${PANEL_BG}; border: 1px solid ${BORDER_COLOR}; padding: 15px; text-align: center; border-radius: 6px; }
        .stat-box div { font-size: 10px; color: ${TEXT_MUTED}; margin-bottom: 5px; font-weight: bold; }
        .stat-box span { font-size: 18px; color: ${TEXT_PRIMARY}; font-weight: bold; }
        .price-input { flex-grow: 1; background: ${PANEL_BG}; border: 1px solid ${BORDER_COLOR}; color: ${TEXT_PRIMARY}; padding: 10px; outline: none; text-align: center; border-radius: 4px; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 12px; background: ${PANEL_BG}; border-radius: 6px; overflow: hidden; }
        .admin-table th { text-align: left; padding: 12px 15px; color: ${TEXT_MUTED}; border-bottom: 1px solid ${BORDER_COLOR}; font-weight: bold; }
        .admin-table td { padding: 12px 15px; border-bottom: 1px solid ${BORDER_COLOR}; color: ${TEXT_PRIMARY}; }
        .admin-table tr:last-child td { border-bottom: none; }
        
        .dark-select { background: transparent; color: ${TEXT_PRIMARY}; border: none; outline: none; margin-top: 5px; cursor: pointer; width: 100%; color-scheme: dark; }
        .dark-date { display: block; margin-bottom: 5px; background: ${BG_DARK}; color: ${TEXT_PRIMARY}; border: 1px solid ${BORDER_COLOR}; padding: 8px; width: 100%; color-scheme: dark; border-radius: 4px; outline: none; }
        
        .toast-notification { position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 8px; font-size: 13px; font-weight: bold; z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.5); animation: slideIn 0.3s ease-out; }
        .toast-notification.success { background: rgba(0, 200, 81, 0.9); color: #fff; border: 1px solid #00C851; }
        .toast-notification.error { background: rgba(255, 68, 68, 0.9); color: #fff; border: 1px solid #ff4444; }
        
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
