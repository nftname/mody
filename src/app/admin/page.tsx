'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';

// ✅ تم وضع محفظتك هنا لتكون أنت المدير الوحيد
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
    // التأكد من أن المتصل هو صاحب المحفظة المحددة
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
      // قراءة الإعدادات من الصف رقم 1
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
          alert(newVal ? "🚨 SITE IS NOW CLOSED (MAINTENANCE MODE)" : "✅ SITE IS NOW LIVE");
      }
  };

  const saveAnnouncement = async () => {
      await supabase.from('app_settings').update({ announcement_text: announcement }).eq('id', 1);
      alert('Announcement Banner Updated!');
  };

  if (loading) return <div className="p-10 text-white bg-black h-screen">Verifying Identity...</div>;

  if (!isAdmin) {
      return (
          <div className="flex h-screen items-center justify-center bg-black text-red-600 font-bold text-3xl flex-col gap-4">
              <i className="bi bi-shield-lock-fill text-6xl"></i>
              <span>ACCESS DENIED</span>
              <span className="text-sm text-gray-500">Only the owner wallet can view this page.</span>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#FCD535] mb-8 border-b border-gray-800 pb-4 flex items-center gap-3">
            <i className="bi bi-cpu-fill"></i> NNM Command Center
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. EMERGENCY CONTROLS (التحكم بالطوارئ) */}
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-2xl">
                <h2 className="text-xl font-bold mb-6 text-red-500 flex items-center gap-2">
                    <i className="bi bi-exclamation-triangle-fill"></i> Emergency Controls
                </h2>
                
                {/* Kill Switch */}
                <div className="flex items-center justify-between mb-8 p-5 bg-black rounded-lg border border-gray-800">
                    <div>
                        <h3 className="font-bold text-white text-lg">Site Status (Kill Switch)</h3>
                        <p className="text-sm text-gray-400 mt-1">If OFF, visitors will see a "Maintenance" screen.</p>
                    </div>
                    <button 
                        onClick={toggleMaintenance}
                        className={`px-6 py-3 rounded-lg font-bold text-sm tracking-wider transition-all shadow-lg ${maintenanceMode ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                    >
                        {maintenanceMode ? '⛔ SITE IS CLOSED' : '✅ SITE IS LIVE'}
                    </button>
                </div>

                {/* Announcement Banner */}
                <div className="mb-2">
                    <h3 className="font-bold mb-3 text-white flex items-center gap-2">
                        <i className="bi bi-megaphone-fill text-[#FCD535]"></i> Global Announcement Bar
                    </h3>
                    <textarea 
                        className="w-full bg-black border border-gray-700 p-3 rounded-lg text-sm text-gray-300 focus:border-[#FCD535] outline-none transition-colors"
                        rows={3}
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        placeholder="Type a message here to show it at the top of the website immediately..."
                    />
                    <div className="flex justify-end mt-3">
                        <button onClick={saveAnnouncement} className="bg-[#FCD535] hover:bg-[#e0bc2e] text-black px-6 py-2 rounded font-bold text-sm transition-all">
                            Save & Publish Banner
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. ANALYTICS (التحليل) */}
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-2xl">
                <h2 className="text-xl font-bold mb-6 text-blue-400 flex items-center gap-2">
                    <i className="bi bi-graph-up-arrow"></i> Market Pulse
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black p-5 rounded-lg border border-gray-800 text-center">
                        <div className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Active Offers</div>
                        <div className="text-3xl font-black text-white">{offersStats.length}</div>
                    </div>
                    <div className="bg-black p-5 rounded-lg border border-gray-800 text-center">
                        <div className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Total Bid Value</div>
                        <div className="text-3xl font-black text-[#FCD535]">${totalVolume.toLocaleString()}</div>
                    </div>
                </div>

                <div className="overflow-hidden border border-gray-800 rounded-lg bg-black">
                    <div className="p-3 bg-gray-900 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Latest Active Offers
                    </div>
                    <div className="overflow-auto max-h-[300px]">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-800 text-gray-300 sticky top-0">
                                <tr>
                                    <th className="p-3">Token ID</th>
                                    <th className="p-3">Price ($)</th>
                                    <th className="p-3">From</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offersStats.map((offer, i) => (
                                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                                        <td className="p-3 text-[#FCD535] font-mono">#{offer.token_id}</td>
                                        <td className="p-3 text-white font-bold">${Number(offer.offer_price).toLocaleString()}</td>
                                        <td className="p-3 text-gray-500 font-mono truncate max-w-[100px]">{offer.bidder}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
