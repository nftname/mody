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
// تم حذف سطر استيراد الحماية للسماح بالنسخ
// import ContentProtection from "@/components/ContentProtection"; 
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

        // Check Ban Status (تم استرجاع هذا الجزء الذي اختفى سابقاً)
        if (isConnected && address) {
          const { data: banned } = await supabase.from('banned_wallets').select('id').eq('wallet_address', address.toLowerCase()).single();
          if (banned) {
             // Future Ban Logic: You can redirect to a ban page here if needed
             // currently we just check, but don't block based on ban yet in this specific guard
             console.log("Wallet is banned:", address);
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
            width: 420px;
            max-width: 90%;
            padding: 45px 30px;
            border-radius: 16px;
            box-shadow: 0 4px 30px rgba(0,0,0,0.03);
            text-align: center;
            border: 1px solid #EAEAEA;
          }

          /* Green Pulse */
          .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #F0FDF4;
            padding: 5px 12px;
            border-radius: 50px;
            border: 1px solid #DCFCE7;
            margin-bottom: 20px;
          }
          .pulse-green {
            width: 6px;
            height: 6px;
            background-color: #22C55E;
            border-radius: 50%;
            box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
            animation: pulse-green 2s infinite;
          }
          .status-text {
            font-size: 10px;
            color: #15803D;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* Typography */
          .main-title {
            font-size: 20px;
            color: #2D2D2D;
            margin-bottom: 12px;
            font-weight: 700;
            letter-spacing: -0.3px;
          }
          .sub-text {
            font-size: 14px;
            color: #555555;
            line-height: 1.5;
            margin-bottom: 8px;
            max-width: 90%;
            margin-left: auto;
            margin-right: auto;
          }
          .coming-soon {
            font-size: 12px;
            color: #999999;
            font-weight: 400;
            margin-bottom: 25px;
          }

          /* Admin Link */
          .admin-access-area {
            border-top: 1px solid #F5F5F5;
            padding-top: 15px;
            margin-top: 10px;
          }
          .admin-link {
            background: none;
            border: none;
            font-size: 10px;
            color: #CCC;
            cursor: pointer;
            transition: 0.2s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          }
          .admin-link:hover {
            color: #555;
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
        {/* Viewport will be set dynamically via script below */}
      </head>
      <body className={inter.className}>
        {/* Dynamic Viewport Controller - Must run before anything else */}
        <Script 
          id="dynamic-viewport"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function setViewport() {
                  var existingViewport = document.querySelector('meta[name="viewport"]');
                  if (existingViewport) {
                    existingViewport.remove();
                  }
                  
                  var viewport = document.createElement('meta');
                  viewport.name = 'viewport';
                  
                  // Check if device is desktop (screen width > 1024px)
                  var isDesktop = window.innerWidth > 1024;
                  
                  if (isDesktop) {
                    // Desktop: Fixed width viewport for zoom scaling behavior
                    viewport.content = 'width=1440';
                  } else {
                    // Mobile: Standard responsive viewport
                    viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1';
                  }
                  
                  document.head.appendChild(viewport);
                }
                
                // Set viewport immediately
                setViewport();
                
                // Update viewport on window resize (with debounce)
                var resizeTimer;
                window.addEventListener('resize', function() {
                  clearTimeout(resizeTimer);
                  resizeTimer = setTimeout(setViewport, 250);
                });
              })();
            `
          }}
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
          strategy="beforeInteractive" 
        />
        <Providers>
            {/* تم إزالة ContentProtection من هنا */}
            <MaintenanceGuard>
                {children}
            </MaintenanceGuard>
        </Providers>
      </body>
    </html>
  );
}
