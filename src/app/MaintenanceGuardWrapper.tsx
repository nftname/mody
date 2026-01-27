
'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalModal from "@/components/LegalModal";
import AppInstallPrompt from "@/components/AppInstallPrompt";
import { useAccount } from "wagmi";

const OWNER_WALLET = (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || "").toLowerCase();

export default function MaintenanceGuardWrapper({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [loading, setLoading] = useState(true);
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (settings) {
          setIsMaintenance(settings.is_maintenance_mode);
          setMaintenanceMsg(settings.announcement_text || "Our platform is currently undergoing scheduled upgrades.");
        }
        if (isConnected && address) {
          const { data: banned } = await supabase.from('banned_wallets').select('id').eq('wallet_address', address.toLowerCase()).single();
          if (banned) { console.log("Wallet is banned:", address); }
        }
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    checkStatus();
  }, [pathname, isConnected, address]);

  const isAdminRoute = pathname?.startsWith('/admin');
  const isOwner = isConnected && address?.toLowerCase() === OWNER_WALLET;
  const bypass = isAdminRoute || isOwner;

  if (loading) return <div style={{background:'#F9F9F7', height:'100vh'}} />;

  if (isMaintenance && !bypass) {
    return (
      <div className="maintenance-container">
        <div className="maintenance-card">
            <div className="status-indicator">
                <div className="pulse-green"></div>
                <span className="status-text">SYSTEM ACTIVE</span>
            </div>
            <h2 className="main-title">System Under Maintenance</h2>
            <p className="sub-text">{maintenanceMsg}</p>
            <p className="coming-soon">We will be back shortly.</p>
            <div className="admin-access-area">
                <button onClick={() => router.push('/admin')} className="admin-link">Admin Login</button>
            </div>
        </div>
        <style jsx>{`
          .maintenance-container {
            height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center;
            background-color: #F9F9F7; position: fixed; top: 0; left: 0; z-index: 99999; font-family: 'Inter', sans-serif;
          }
          .maintenance-card {
            background: #FFFFFF; width: 420px; max-width: 90%; padding: 45px 30px;
            border-radius: 16px; box-shadow: 0 4px 30px rgba(0,0,0,0.03); text-align: center; border: 1px solid #EAEAEA;
          }
          .status-indicator {
            display: inline-flex; align-items: center; gap: 6px; background: #F0FDF4;
            padding: 5px 12px; border-radius: 50px; border: 1px solid #DCFCE7; margin-bottom: 20px;
          }
          .pulse-green {
            width: 6px; height: 6px; background-color: #22C55E; border-radius: 50%;
            animation: pulse-green 2s infinite;
          }
          .status-text { font-size: 10px; color: #15803D; font-weight: 700; text-transform: uppercase; }
          .main-title { font-size: 20px; color: #2D2D2D; margin-bottom: 12px; font-weight: 700; }
          .sub-text { font-size: 14px; color: #555555; line-height: 1.5; margin-bottom: 8px; }
          .coming-soon { font-size: 12px; color: #999999; margin-bottom: 25px; }
          .admin-access-area { border-top: 1px solid #F5F5F5; padding-top: 15px; }
          .admin-link { background: none; border: none; font-size: 10px; color: #CCC; cursor: pointer; text-transform: uppercase; }
          @keyframes pulse-green {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
            70% { box-shadow: 0 0 0 5px rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <AppInstallPrompt />
      <LegalModal />
      <main className="flex-grow-1">{children}</main>
      <Footer />
    </div>
  );
}
