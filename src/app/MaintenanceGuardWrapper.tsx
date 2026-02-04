'use client';

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalModal from "@/components/LegalModal";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const OWNER_WALLET = (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || "").toLowerCase();
const CACHE_TIME = 60000;

export default function MaintenanceGuardWrapper({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(0);
  
  const pathname = usePathname();

  const fetchSettings = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastCheck < CACHE_TIME) return;

    try {
      const { data: settings } = await supabase
        .from('app_settings')
        .select('is_maintenance_mode, announcement_text')
        .eq('id', 1)
        .single();

      if (settings) {
        setIsMaintenance(settings.is_maintenance_mode);
        setMaintenanceMsg(settings.announcement_text || "Our platform is currently undergoing scheduled upgrades.");
        setLastCheck(now);
      }
    } catch (e) {
      console.error("Critical Security Check Failed");
    } finally {
      setLoading(false);
    }
  }, [lastCheck]);

  useEffect(() => {
    fetchSettings();
  }, [pathname, fetchSettings]);

  useEffect(() => {
    const checkBanned = async () => {
      if (isConnected && address) {
        try {
          const { data: banned } = await supabase
            .from('banned_wallets')
            .select('id')
            .eq('wallet_address', address.toLowerCase())
            .single();
          
          if (banned) {
            window.location.href = '/403';
          }
        } catch (e) {}
      }
    };
    checkBanned();
  }, [isConnected, address]);

  const isOwner = isConnected && address?.toLowerCase() === OWNER_WALLET;

  if (loading) {
    return <div style={{background:'#F9F9F7', height:'100vh'}} />;
  }

  if (isMaintenance && !isOwner) {
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
            <div className="wallet-connect-area">
                <ConnectButton 
                  showBalance={false}
                  chainStatus="none"
                  accountStatus={{
                    smallScreen: 'avatar',
                    largeScreen: 'full'
                  }}
                />
            </div>
        </div>
        <style jsx>{`
          .maintenance-container {
            height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center;
            background-color: #F9F9F7; position: fixed; top: 0; left: 0; z-index: 9999; font-family: 'Inter', sans-serif;
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
          .wallet-connect-area { 
            border-top: 1px solid #F5F5F5; 
            padding-top: 20px;
            display: flex;
            justify-content: center;
          }
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
      <LegalModal />
      <main className="flex-grow-1">{children}</main>
      <Footer />
    </div>
  );
}
