'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';

const OWNER_WALLET = "0x5f2f670df4Db14ddB4Bc1E3eCe86CA645fb01BE6".toLowerCase();

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [offersStats, setOffersStats] = useState<any[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);

  useEffect(() => {
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
          const total = offers.reduce((acc, curr) => acc + (Number(curr.offer_price) || 0), 0);
          setTotalVolume(total);
      }
  };

  const toggleMaintenance = async () => {
      const newVal = !maintenanceMode;
      const { error } = await supabase.from('app_settings').update({ is_maintenance_mode: newVal }).eq('id', 1);
      if (!error) {
          setMaintenanceMode(newVal);
          alert(newVal ? "🚨 SITE IS NOW CLOSED" : "✅ SITE IS NOW LIVE");
      }
  };

  const saveAnnouncement = async () => {
      await supabase.from('app_settings').update({ announcement_text: announcement }).eq('id', 1);
      alert('Announcement Updated!');
  };

  if (loading) return <div style={{padding: '40px', background: '#000', color: '#fff', height: '100vh'}}>Verifying...</div>;

  if (!isAdmin) {
      return (
          <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#ff0000', fontWeight: 'bold'}}>
              ACCESS DENIED
          </div>
      );
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#050505', color: '#fff', padding: '40px', fontFamily: 'sans-serif'}}>
      <div style={{maxWidth: '1100px', margin: '0 auto'}}>
        <h1 style={{fontSize: '24px', fontWeight: 'bold', color: '#FCD535', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '20px'}}>
            🛡️ NNM Command Center
        </h1>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px'}}>
            
            {/* 1. EMERGENCY CONTROLS */}
            <div style={{background: '#1a1a1a', padding: '25px', borderRadius: '15px', border: '1px solid #333'}}>
                <h2 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#ff4444'}}>🚨 Emergency Controls</h2>
                
                <div style={{background: '#000', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                    <div>
                        <h3 style={{margin: 0, fontSize: '14px'}}>Kill Switch</h3>
                        <p style={{margin: '5px 0 0', fontSize: '11px', color: '#888'}}>Stop all visitors access.</p>
                    </div>
                    <button 
                        onClick={toggleMaintenance}
                        style={{
                            padding: '10px 20px', 
                            borderRadius: '8px', 
                            border: 'none', 
                            fontWeight: 'bold', 
                            cursor: 'pointer',
                            backgroundColor: maintenanceMode ? '#ff4444' : '#00c853',
                            color: '#fff'
                        }}
                    >
                        {maintenanceMode ? '⛔ CLOSED' : '✅ LIVE'}
                    </button>
                </div>

                <div>
                    <h3 style={{fontSize: '14px', marginBottom: '10px'}}>Announcement Bar</h3>
                    <textarea 
                        style={{width: '100%', background: '#000', border: '1px solid #333', borderRadius: '8px', padding: '10px', color: '#fff', outline: 'none'}}
                        rows={3}
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                    />
                    <button onClick={saveAnnouncement} style={{marginTop: '15px', width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: '#FCD535', fontWeight: 'bold', cursor: 'pointer'}}>
                        Save Changes
                    </button>
                </div>
            </div>

            {/* 2. ANALYTICS */}
            <div style={{background: '#1a1a1a', padding: '25px', borderRadius: '15px', border: '1px solid #333'}}>
                <h2 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#448aff'}}>📊 Market Pulse</h2>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                    <div style={{background: '#000', padding: '15px', borderRadius: '10px', textAlign: 'center'}}>
                        <div style={{fontSize: '11px', color: '#888'}}>Offers</div>
                        <div style={{fontSize: '24px', fontWeight: 'bold'}}>{offersStats.length}</div>
                    </div>
                    <div style={{background: '#000', padding: '15px', borderRadius: '10px', textAlign: 'center'}}>
                        <div style={{fontSize: '11px', color: '#888'}}>Total Value</div>
                        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#FCD535'}}>${totalVolume}</div>
                    </div>
                </div>

                <div style={{background: '#000', borderRadius: '10px', overflow: 'hidden'}}>
                    <table style={{width: '100%', fontSize: '12px', borderCollapse: 'collapse'}}>
                        <thead style={{background: '#222'}}>
                            <tr>
                                <th style={{padding: '10px'}}>ID</th>
                                <th style={{padding: '10px'}}>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offersStats.map((offer, i) => (
                                <tr key={i} style={{borderBottom: '1px solid #111'}}>
                                    <td style={{padding: '10px', color: '#FCD535'}}>#{offer.token_id}</td>
                                    <td style={{padding: '10px'}}>${offer.offer_price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
