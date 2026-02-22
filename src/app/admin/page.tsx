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

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contractBalance, setContractBalance] = useState('0');
  
  const [activities, setActivities] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [bans, setBans] = useState<any[]>([]);
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [banInput, setBanInput] = useState('');
  
  const [mintPrices, setMintPrices] = useState({ immortal: '', elite: '', founder: '' });

  const [filterType, setFilterType] = useState('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  useEffect(() => {
    if (isConnected && address && address.toLowerCase() === OWNER_WALLET) {
      setIsAdmin(true);
      fetchContractData();
      fetchDashboardData();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [address, isConnected, filterType]);

  const fetchContractData = async () => {
    if (!publicClient) return;
    try {
      const bal = await publicClient.getBalance({ address: NFT_COLLECTION_ADDRESS as `0x${string}` });
      setContractBalance(formatEther(bal));
    } catch (e) {}
  };

  const fetchDashboardData = async () => {
    let url = '/api/admin';
    
    if (filterType === '24H') {
      const start = new Date(Date.now() - 86400000).toISOString();
      url += `?start=${start}`;
    } else if (filterType === 'CUSTOM' && customStart && customEnd) {
      const start = new Date(customStart).toISOString();
      const end = new Date(customEnd).setHours(23, 59, 59);
      url += `?start=${start}&end=${new Date(end).toISOString()}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      
      setSettings(data.settings);
      setActivities(data.activities);
      setPayouts(data.payouts);
      setBans(data.bans);
    } catch (e) {}
    setLoading(false);
  };

  const setSettings = (settings: any) => {
    if (settings) {
      setMaintenanceMode(settings.is_maintenance_mode);
      setAnnouncement(settings.announcement_text || '');
    }
  };

  const execPost = async (action: string, payload: any) => {
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    fetchDashboardData();
  };

  const handleUpdateAnnouncement = () => execPost('update_settings', { announcement_text: announcement });
  const handleToggleSite = (status: boolean) => execPost('update_settings', { is_maintenance_mode: status });
  const handleBan = () => { if (banInput) { execPost('ban_wallet', { wallet: banInput }); setBanInput(''); } };
  const handleUnban = (wallet: string) => execPost('unban_wallet', { wallet });

  const handleUpdatePrices = async () => {
    if (!mintPrices.immortal || !mintPrices.elite || !mintPrices.founder) return;
    try {
      await writeContractAsync({
        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
        abi: REGISTRY_ABI,
        functionName: 'setPrices',
        args: [parseEther(mintPrices.immortal), parseEther(mintPrices.elite), parseEther(mintPrices.founder)]
      });
    } catch (e) {}
  };

  const handlePayAffiliate = async (payoutId: number, wallet: string, amount: string) => {
    try {
      const hash = await sendTransactionAsync({
        to: wallet as `0x${string}`,
        value: parseEther(amount.toString())
      });
      if (hash) {
        await execPost('mark_paid', { id: payoutId, hash });
      }
    } catch (e) {}
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

    return {
      off: uniqueOff.size,
      on: uniqueOn.size,
      total: uniqueOff.size + uniqueOn.size,
      last24: count24
    };
  }, [activities]);

  const stats = useMemo(() => {
    let immortal = 0, elite = 0, founder = 0, market = 0, total = 0;

    activities.forEach(act => {
      const price = Number(act.price || 0);
      if (act.activity_type === 'Mint') {
        if (price >= 50) immortal++;
        else if (price >= 30) elite++;
        else if (price > 0) founder++;
        total += price;
      } else if (act.activity_type === 'MarketSale') {
        market += price;
        total += price;
      }
    });

    return { immortal, elite, founder, market, total };
  }, [activities]);

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
    <div style={{ background: '#0a0a0a', color: '#e0e0e0', minHeight: '100vh', padding: '100px 20px 40px', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '15px', marginBottom: '20px', fontSize: '13px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ color: maintenanceMode ? '#ff4444' : '#00C851' }}>{maintenanceMode ? 'CLOSED' : 'LIVE'}</span>
          <span style={{ color: '#FCD535' }}>{contractBalance} POL</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>OFF: {visitors.off}</span>
          <span>ON: {visitors.on}</span>
          <span>TOTAL: {visitors.total}</span>
          <span>24H: {visitors.last24}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input 
          value={announcement} 
          onChange={e => setAnnouncement(e.target.value)} 
          placeholder="System Announcement..." 
          style={{ flexGrow: 1, background: '#111', border: '1px solid #222', color: '#fff', padding: '10px', outline: 'none' }} 
        />
        <button className="glass-btn" onClick={handleUpdateAnnouncement}>UPDATE MSG</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div className="stat-box"><div>IMMORTAL</div><span>{stats.immortal}</span></div>
        <div className="stat-box"><div>ELITE</div><span>{stats.elite}</span></div>
        <div className="stat-box"><div>FOUNDER</div><span>{stats.founder}</span></div>
        <div className="stat-box"><div>MARKET VOL</div><span>${stats.market.toFixed(2)}</span></div>
        <div className="stat-box"><div>GRAND TOTAL</div><span style={{ color: '#FCD535' }}>${stats.total.toFixed(2)}</span></div>
        
        <div className="stat-box" style={{ position: 'relative' }}>
          <div>FILTER</div>
          <select 
            value={filterType} 
            onChange={(e) => {
              if(e.target.value === 'CUSTOM') setShowCustomDate(true);
              else { setShowCustomDate(false); setFilterType(e.target.value); }
            }}
            style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', marginTop: '5px', cursor: 'pointer' }}
          >
            <option value="ALL" style={{background:'#111'}}>ALL TIME</option>
            <option value="24H" style={{background:'#111'}}>DAILY (24H)</option>
            <option value="CUSTOM" style={{background:'#111'}}>CUSTOM...</option>
          </select>

          {showCustomDate && (
            <div style={{ position: 'absolute', top: '100%', right: 0, background: '#111', border: '1px solid #333', padding: '10px', zIndex: 10, marginTop: '5px' }}>
              <input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} style={{ display:'block', marginBottom:'5px', background:'#222', color:'#fff', border:'none', padding:'5px' }}/>
              <input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} style={{ display:'block', marginBottom:'10px', background:'#222', color:'#fff', border:'none', padding:'5px' }}/>
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
        <h4 style={{ color: '#666', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase' }}>Affiliate Payouts</h4>
        <table className="admin-table">
          <thead><tr><th>WALLET</th><th>AMOUNT</th><th>ACTION</th></tr></thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace' }}>{p.wallet_address}</td>
                <td style={{ color: '#00C851' }}>${p.amount}</td>
                <td><button className="glass-btn" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handlePayAffiliate(p.id, p.wallet_address, p.amount)}>PAY NOW</button></td>
              </tr>
            ))}
            {payouts.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center' }}>No pending payouts</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h4 style={{ color: '#666', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase' }}>Banned Wallets</h4>
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
                <td><button className="glass-btn" style={{ padding: '4px 10px', fontSize: '11px', color: '#ff4444' }} onClick={() => handleUnban(b.wallet_address)}>UNBAN</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h4 style={{ color: '#666', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase' }}>Whale Tracker</h4>
        <table className="admin-table">
          <thead><tr><th>WALLET</th><th>TOTAL SPENT</th><th>TX COUNT</th><th>LAST ACTIVE</th></tr></thead>
          <tbody>
            {whales.map((w, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'monospace' }}>{w.address}</td>
                <td style={{ color: '#FCD535' }}>${w.vol.toFixed(2)}</td>
                <td>{w.tx}</td>
                <td>{new Date(w.last).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .glass-btn { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: #ccc; padding: 10px 20px; cursor: pointer; transition: 0.2s; font-size: 12px; }
        .glass-btn:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
        .stat-box { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 15px; text-align: center; }
        .stat-box div { font-size: 10px; color: #666; margin-bottom: 5px; }
        .stat-box span { font-size: 18px; color: #fff; }
        .price-input { flex-grow: 1; background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 10px; outline: none; text-align: center; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .admin-table th { text-align: left; padding: 10px; color: #666; border-bottom: 1px solid #222; font-weight: normal; }
        .admin-table td { padding: 10px; border-bottom: 1px solid #1a1a1a; color: #aaa; }
      `}</style>
    </div>
  );
}
