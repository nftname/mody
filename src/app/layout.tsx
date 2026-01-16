'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Inter } from "next/font/google";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalModal from "@/components/LegalModal";
import ContentProtection from "@/components/ContentProtection";
import { Providers } from "@/app/providers";
import AppInstallPrompt from "@/components/AppInstallPrompt";
import { useAccount } from "wagmi";

const inter = Inter({ subsets: ["latin"] });

// Owner Wallet (Master Key)
const OWNER_WALLET = "0x5f2f670df4Db14ddB4Bc1E3eCe86CA645fb01BE6".toLowerCase();

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [loading, setLoading] = useState(true);
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check Maintenance Status
        const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (settings) {
          setIsMaintenance(settings.is_maintenance_mode);
          // Default fallback in English if DB is empty
          setMaintenanceMsg(settings.announcement_text || "Our platform is currently undergoing scheduled upgrades.");
        }

        // Check Ban Status
        if (isConnected && address) {
          const { data: banned } = await supabase.from('banned_wallets').select('id').eq('wallet_address', address.toLowerCase()).single();
          if (banned) {
             // Ban logic can be handled here if needed later
          }
        }

      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    checkStatus();
  }, [pathname, isConnected, address]);

  // Security Logic: Bypass for Admin Route or Connected Owner
  const isAdminRoute = pathname?.startsWith('/admin');
  const isOwner = isConnected && address?.toLowerCase() === OWNER_WALLET;
  const bypass = isAdminRoute || isOwner;

  if (loading) return <div style={{background:'#F9F9F7', height:'100vh'}} />;

  // --- Maintenance Screen (Off-White / English / Professional) ---
  if (isMaintenance && !bypass) {
    return (
      <div className="maintenance-container">
        <div className="maintenance-card">
            {/* Green Pulse Indicator */}
            <div className="status-indicator">
                <div className="pulse-green"></div>
                <span className="status-text">SYSTEM ACTIVE</span>
            </div>

            {/* Content (English Only) */}
            <h2 className="main-title">System Under Maintenance</h2>
            <p className="sub-text">
              {maintenanceMsg}
            </p>
            <p className="coming-soon">We will be back shortly.</p>

            {/* Hidden Admin Key */}
            <div className="admin-access-area">
                <button onClick={() => router.push('/admin')} className="admin-link">
                    Admin Login
                </button>
            </div>
        </div>

        <style jsx>{`
          .maintenance-container {
            height: 100vh;
            width: 100vw;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #F9F9F7; /* Ivory / Off-White */
            position: fixed;
            top: 0;
            left: 0;
            z-index: 99999;
            font-family: 'Inter', sans-serif;
          }

          .maintenance-card {
            background: #FFFFFF;
            width: 400px;
            max-width: 90%;
            padding: 40px 30px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.05);
            text-align: center;
            border: 1px solid #EAEAEA;
          }

          /* Green Pulse */
          .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #F0FDF4;
            padding: 6px 15px;
            border-radius: 50px;
            border: 1px solid #DCFCE7;
            margin-bottom: 25px;
          }
          .pulse-green {
            width: 8px;
            height: 8px;
            background-color: #22C55E;
            border-radius: 50%;
            box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
            animation: pulse-green 2s infinite;
          }
          .status-text {
            font-size: 11px;
            color: #15803D;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* Typography */
          .main-title {
            font-size: 24px;
            color: #1A1A1A;
            margin-bottom: 15px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .sub-text {
            font-size: 15px;
            color: #666666;
            line-height: 1.6;
            margin-bottom: 10px;
          }
          .coming-soon {
            font-size: 13px;
            color: #999;
            font-weight: 500;
            margin-bottom: 30px;
          }

          /* Admin Link */
          .admin-access-area {
            border-top: 1px solid #F0F0F0;
            padding-top: 20px;
            margin-top: 20px;
          }
          .admin-link {
            background: none;
            border: none;
            font-size: 11px;
            color: #CCC;
            cursor: pointer;
            transition: 0.2s;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: bold;
          }
          .admin-link:hover {
            color: #333;
          }

          @keyframes pulse-green {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
            70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          }
        `}</style>
      </div>
    );
  }

  // --- Live Site Render ---
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <AppInstallPrompt />
      <LegalModal />
      <main className="flex-grow-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// --- Root Layout ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
          strategy="beforeInteractive" 
        />
        <Providers>
            <ContentProtection />
            <MaintenanceGuard>
                {children}
            </MaintenanceGuard>
        </Providers>
      </body>
    </html>
  );
}
