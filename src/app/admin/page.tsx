'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';

// محفظتك (المدير)
const OWNER_WALLET = "0x5f2f670df4Db14ddB4Bc1E3eCe86CA645fb01BE6".toLowerCase();

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  
  // Analytics State
  const [offersStats, setOffersStats] = useState<any[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);

  useEffect(() => {
    // التأكد من أن المتصل هو صاحب المحفظة
    if (isConnected && address && address.toLowerCase() === OWNER_WALLET) {
        setIsAdmin(true);
        fetchSettings();
        fetchAnalytics();
    } else {
        setIsAdmin(false);
    }
    setLoading(false);
  }, [address, isConnected]);

  const fetchSettings = async () => {
      // جلب الإعدادات (الصف رقم 1)
      const { data } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (data) {
          setMaintenanceMode(data.is_maintenance_mode);
          setAnnouncement(data.announcement_text || '');
      }
  };

  const fetchAnalytics = async () => {
      const { data: offers } = await supabase.from('offers').select('*').eq('status', 'active');
      if (offers) {
          setOffersStats(offers);
          // (TS Fix) إصلاح خطأ التايب سكريبت هنا
          const total = offers.reduce((acc: number, curr: any) => acc + (Number(curr.offer_price) || 0), 0);
          setTotalVolume(total);
      }
  };

  const toggleMaintenance = async () => {
      const newVal = !maintenanceMode;
      // التأكد من وجود الصف رقم 1، إذا لم يوجد ننشئه، وإلا نحدثه
      const { data: existing } = await supabase.from('app_settings').select('id').eq('id', 1).single();
      
      let error;
      if (!existing) {
          const { error: insertError } = await supabase.from('app_settings').insert([{ id: 1, is_maintenance_mode: newVal }]);
          error = insertError;
      } else {
          const { error: updateError } = await supabase.from('app_settings').update({ is_maintenance_mode: newVal }).eq('id', 1);
          error = updateError;
      }

      if (!error) {
          setMaintenanceMode(newVal);
          alert(newVal ? "🚨 SITE IS NOW CLOSED (MAINTENANCE MODE)" : "✅ SITE IS NOW LIVE");
      } else {
          console.error(error);
          alert("Error updating settings. check console.");
      }
  };

  const saveAnnouncement = async () => {
      const { data: existing } = await supabase.from('app_settings').select('id').eq('id', 1).single();
      
      if (!existing) {
         await supabase.from('app_settings').insert([{ id: 1, announcement_text: announcement }]);
      } else {
         await supabase.from('app_settings').update({ announcement_text: announcement }).eq('id', 1);
      }
      alert('Announcement Banner Updated!');
  };

  if (loading) return <div className="loading-screen">Verifying Identity...</div>;

  if (!isAdmin) {
      return (
          <div className="access-denied">
              <i className="bi bi-shield-lock-fill icon-large"></i>
              <h1>ACCESS DENIED</h1>
              <p>Only the owner wallet can view this page.</p>
          </div>
      );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1><i className="bi bi-cpu-fill"></i> NNM Command Center</h1>
      </div>

      <div className="dashboard-grid">
            
            {/* 1. EMERGENCY CONTROLS */}
            <div className="card emergency-card">
                <div className="card-header text-red">
                    <i className="bi bi-exclamation-triangle-fill"></i> Emergency Controls
                </div>
                
                {/* Kill Switch */}
                <div className="control-row">
                    <div>
                        <h3>Site Status (Kill Switch)</h3>
                        <p>If OFF, visitors will see a "Maintenance" screen.</p>
                    </div>
                    <button 
                        onClick={toggleMaintenance}
                        className={`status-btn ${maintenanceMode ? 'closed' : 'live'}`}
                    >
                        {maintenanceMode ? '⛔ SITE IS CLOSED' : '✅ SITE IS LIVE'}
                    </button>
                </div>

                {/* Announcement Banner */}
                <div className="control-section">
                    <h3><i className="bi bi-megaphone-fill text-gold"></i> Global Announcement Bar</h3>
                    <textarea 
                        rows={3}
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        placeholder="Type a message here..."
                    />
                    <div className="action-row">
                        <button onClick={saveAnnouncement} className="action-btn">Save & Publish Banner</button>
                    </div>
                </div>
            </div>

            {/* 2. ANALYTICS */}
            <div className="card analytics-card">
                <div className="card-header text-blue">
                    <i className="bi bi-graph-up-arrow"></i> Market Pulse
                </div>
                
                <div className="stats-row">
                    <div className="stat-box">
                        <div className="stat-label">Active Offers</div>
                        <div className="stat-value">{offersStats.length}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Total Bid Value</div>
                        <div className="stat-value text-gold">${totalVolume.toLocaleString()}</div>
                    </div>
                </div>

                <div className="table-container">
                    <div className="table-title">Latest Active Offers</div>
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Token ID</th>
                                    <th>Price ($)</th>
                                    <th>From</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offersStats.map((offer, i) => (
                                    <tr key={i}>
                                        <td className="text-gold font-mono">#{offer.token_id}</td>
                                        <td className="font-bold">${Number(offer.offer_price).toLocaleString()}</td>
                                        <td className="text-gray font-mono">{offer.bidder ? `${offer.bidder.substring(0,6)}...` : 'Unknown'}</td>
                                    </tr>
                                ))}
                                {offersStats.length === 0 && (
                                    <tr><td colSpan={3} style={{textAlign: 'center', padding: '20px'}}>No active offers found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
      </div>

      <style jsx>{`
        .admin-container {
            min-height: 100vh;
            background-color: #050505;
            color: #fff;
            padding: 40px 20px;
            font-family: 'Inter', sans-serif;
            padding-top: 100px; /* Space for Navbar */
        }
        .admin-header h1 {
            color: #FCD535;
            border-bottom: 1px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
            font-size: 28px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
        }
        @media (min-width: 992px) {
            .dashboard-grid { grid-template-columns: 1fr 1fr; }
        }
        
        .card {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .card-header { font-size: 20px; font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .text-red { color: #ff4d4d; }
        .text-blue { color: #38BDF8; }
        .text-gold { color: #FCD535; }
        .text-gray { color: #888; }

        /* Controls */
        .control-row {
            background: #000;
            border: 1px solid #333;
            padding: 20px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }
        .control-row h3 { margin: 0; font-size: 16px; color: #fff; }
        .control-row p { margin: 5px 0 0; font-size: 13px; color: #888; }
        
        .status-btn {
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 13px;
            border: none;
            cursor: pointer;
            transition: 0.3s;
        }
        .status-btn.live { background: #198754; color: white; }
        .status-btn.live:hover { background: #157347; }
        .status-btn.closed { background: #dc3545; color: white; animation: pulse 2s infinite; }

        textarea {
            width: 100%;
            background: #000;
            border: 1px solid #333;
            color: #ddd;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            margin-top: 10px;
        }
        textarea:focus { outline: none; border-color: #FCD535; }
        
        .action-row { text-align: right; margin-top: 15px; }
        .action-btn {
            background: #FCD535;
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
        }
        .action-btn:hover { background: #e0bc2e; }

        /* Stats */
        .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
        .stat-box {
            background: #000;
            border: 1px solid #333;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-label { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; letter-spacing: 1px; margin-bottom: 5px; }
        .stat-value { font-size: 28px; font-weight: 900; color: #fff; }

        /* Table */
        .table-container { border: 1px solid #333; border-radius: 8px; background: #000; overflow: hidden; }
        .table-title { padding: 12px; background: #111; border-bottom: 1px solid #333; font-size: 12px; font-weight: bold; color: #888; text-transform: uppercase; }
        .table-scroll { max-height: 300px; overflow-y: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        thead th { text-align: left; padding: 12px; background: #1a1a1a; color: #ccc; position: sticky; top: 0; }
        tbody td { padding: 12px; border-bottom: 1px solid #222; color: #eee; }
        tbody tr:hover { background: #111; }
        
        .font-mono { font-family: monospace; }
        .font-bold { font-weight: bold; }

        /* Loading / Access Denied */
        .loading-screen, .access-denied {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #000;
            color: #fff;
        }
        .access-denied { color: #dc3545; }
        .access-denied h1 { font-size: 32px; margin: 10px 0; }
        .icon-large { font-size: 60px; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}
