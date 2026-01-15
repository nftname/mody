'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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

// محفظة المالك التي يُسمح لها برؤية الموقع أثناء الصيانة
const OWNER_WALLET = "0x5f2f670df4Db14ddB4Bc1E3eCe86CA645fb01BE6".toLowerCase();

// --- مكون الحراسة (يجمع التصميم والمنطق) ---
function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const { data } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (data) {
          setIsMaintenance(data.is_maintenance_mode);
          setMaintenanceMsg(data.announcement_text || "We are currently upgrading our platform.");
        }
      } catch (e) {
        console.error("Maintenance Check Error:", e);
      } finally {
        setLoading(false);
      }
    };
    checkMaintenance();
  }, [pathname]);

  // المنطق: هل أنت في صفحة الأدمن؟ أو هل أنت المالك ومتصل بمحفظتك؟
  const isAdminPage = pathname?.startsWith('/admin');
  const isOwnerConnected = isConnected && address?.toLowerCase() === OWNER_WALLET;
  const shouldBypass = isAdminPage || isOwnerConnected;

  // شاشة تحميل لحظية
  if (loading) return null;

  // --- الحالة 1: الموقع في صيانة وأنت لست الأدمن (إظهار الستارة بالتصميم الاحترافي) ---
  if (isMaintenance && !shouldBypass) {
    return (
      <div className="maintenance-wrapper">
        <div className="glow-effect"></div>
        <div className="content-card">
            <div className="icon-gold">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            
            <h1 className="title-text">SYSTEM UPGRADE</h1>
            <div className="divider-gold"></div>
            
            <p className="message-text">
              {maintenanceMsg}
            </p>

            <div className="status-badge">
              <span className="pulse-dot"></span> ACCESS RESTRICTED
            </div>

            {/* تنبيه صغير للأدمن فقط */}
            {!isConnected && (
               <div className="admin-hint">
                 Admin? Connect Wallet to enter.
               </div>
            )}

            <div className="footer-copyright">
              NNM MARKETPLACE &copy; 2026
            </div>
        </div>

        <style jsx>{`
          .maintenance-wrapper {
            height: 100vh;
            width: 100vw;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at center, #2c2c2c 0%, #121212 100%);
            position: fixed;
            top: 0;
            left: 0;
            z-index: 99999;
          }
          .glow-effect {
            position: absolute;
            width: 50vw;
            height: 50vw;
            background: radial-gradient(circle, rgba(252, 213, 53, 0.03) 0%, transparent 60%);
            border-radius: 50%;
            pointer-events: none;
          }
          .content-card {
            position: relative;
            z-index: 10;
            text-align: center;
            max-width: 600px;
            width: 90%;
            padding: 50px 30px;
            background: rgba(30, 30, 30, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-top: 1px solid rgba(252, 213, 53, 0.2);
            border-radius: 24px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          }
          .icon-gold {
            font-size: 50px;
            color: #FCD535;
            margin-bottom: 25px;
            text-shadow: 0 0 20px rgba(252, 213, 53, 0.4);
          }
          .title-text {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 3px;
            color: #ffffff;
            margin: 0;
            text-transform: uppercase;
          }
          .divider-gold {
            height: 3px;
            width: 60px;
            background: #FCD535;
            margin: 20px auto;
            border-radius: 2px;
          }
          .message-text {
            font-size: 16px;
            line-height: 1.7;
            color: #b0b0b0;
            margin-bottom: 35px;
            font-family: monospace;
          }
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 10px 25px;
            background: rgba(252, 213, 53, 0.05);
            border: 1px solid rgba(252, 213, 53, 0.3);
            border-radius: 50px;
            font-size: 11px;
            font-weight: bold;
            color: #FCD535;
            letter-spacing: 2px;
          }
          .pulse-dot {
            width: 6px;
            height: 6px;
            background: #FCD535;
            border-radius: 50%;
            box-shadow: 0 0 10px #FCD535;
            animation: pulse 2s infinite;
          }
          .footer-copyright {
            margin-top: 40px;
            font-size: 10px;
            color: #555;
            letter-spacing: 1px;
          }
          .admin-hint {
            margin-top: 20px;
            font-size: 10px;
            color: #444;
          }
          @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // --- الحالة 2: الموقع مفتوح أو أنت الأدمن (عرض الموقع الطبيعي) ---
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

// --- الهيكل الرئيسي ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
        <meta name="theme-color" content="#0b1220" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
          strategy="beforeInteractive" 
        />

        <Providers>
            <ContentProtection />
            {/* تم وضع MaintenanceGuard داخل البروفايدرز ليعمل مع المحفظة */}
            <MaintenanceGuard>
                {children}
            </MaintenanceGuard>
        </Providers>

        <Script
            id="tidio-script"
            src="//code.tidio.co/ytsnnw0nbbwqq2hx7wdy96jwoiguzorb.js"
            strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
