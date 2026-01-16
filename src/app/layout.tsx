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

// محفظة المالك (المفتاح الرئيسي)
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
        // فحص حالة الصيانة
        const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (settings) {
          setIsMaintenance(settings.is_maintenance_mode);
          setMaintenanceMsg(settings.announcement_text || "Soon you will be able to enter.");
        }

        // فحص حالة الحظر (Ban Check)
        if (isConnected && address) {
          const { data: banned } = await supabase.from('banned_wallets').select('id').eq('wallet_address', address.toLowerCase()).single();
          if (banned) {
             // يمكن توجيه المستخدم لصفحة حظر أو عرض رسالة هنا
             // حالياً سنكتفي بمنعه عبر الصيانة، أو يمكن إضافة حالة isBanned منفصلة
             // لكن حسب طلبك التركيز الآن على شاشة الصيانة
          }
        }

      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    checkStatus();
  }, [pathname, isConnected, address]);

  // المنطق الأمني: السماح للمالك أو لصفحة الأدمن بالمرور
  const isAdminRoute = pathname?.startsWith('/admin');
  const isOwner = isConnected && address?.toLowerCase() === OWNER_WALLET;
  const bypass = isAdminRoute || isOwner;

  if (loading) return <div style={{background:'#F9F9F7', height:'100vh'}} />;

  // --- شاشة الصيانة (التصميم الجديد: أوف وايت + لمبة خضراء) ---
  if (isMaintenance && !bypass) {
    return (
      <div className="maintenance-container">
        <div className="maintenance-card">
            {/* اللمبة الخضراء والمؤشر */}
            <div className="status-indicator">
                <div className="pulse-green"></div>
                <span className="status-text">System Active</span>
            </div>

            {/* النصوص */}
            <h2 className="main-title">الموقع في وضع الصيانة</h2>
            <p className="sub-text">
              {maintenanceMsg}
            </p>
            <p className="coming-soon">قريباً جداً ستتمكن من الدخول</p>

            {/* المفتاح الذكي للأدمن */}
            <div className="admin-access-area">
                <button onClick={() => router.push('/admin')} className="admin-link">
                    هل أنت من المشرفين؟ (Admin Login)
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
            background-color: #F9F9F7; /* أوف وايت / عاجي */
            position: fixed;
            top: 0;
            left: 0;
            z-index: 99999;
            font-family: 'Inter', sans-serif;
          }

          .maintenance-card {
            background: #FFFFFF;
            width: 400px; /* حجم متوسط وملموم */
            max-width: 90%;
            padding: 40px 30px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.05); /* ظل ناعم جداً */
            text-align: center;
            border: 1px solid #EAEAEA;
          }

          /* المؤشر الأخضر */
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
            background-color: #22C55E; /* أخضر حي */
            border-radius: 50%;
            box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
            animation: pulse-green 2s infinite;
          }
          .status-text {
            font-size: 11px;
            color: #15803D;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* النصوص */
          .main-title {
            font-size: 22px;
            color: #1A1A1A; /* أسود هادئ */
            margin-bottom: 15px;
            font-weight: 700;
          }
          .sub-text {
            font-size: 14px;
            color: #666666; /* رمادي متوسط */
            line-height: 1.6;
            margin-bottom: 5px;
          }
          .coming-soon {
            font-size: 13px;
            color: #888;
            margin-bottom: 30px;
          }

          /* زر الأدمن */
          .admin-access-area {
            border-top: 1px solid #F0F0F0;
            padding-top: 20px;
            margin-top: 20px;
          }
          .admin-link {
            background: none;
            border: none;
            font-size: 11px;
            color: #999;
            cursor: pointer;
            text-decoration: underline;
            transition: 0.2s;
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

  // --- الموقع الطبيعي (عند الفتح) ---
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
