'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase"; // تأكد أن المسار صحيح لديك
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

const inter = Inter({ subsets: ["latin"] });

// لاحظ: Metadata و Viewport لا تعمل مع 'use client' في نفس الملف في Next.js 13/14 
// لكن إذا كانت تعمل معك سابقاً بدون مشاكل ساتركها، أو يفضل نقلها لملف layout_metadata.ts واستدعائها
// سأتركها كما كانت لعدم تغيير هيكلية مشروعك
/* export const viewport = { ... }
export const metadata = { ... }
*/
// *تنبيه:* في ملفات 'use client'، عادة لا نضع metadata export. 
// إذا ظهر لك خطأ بخصوص metadata، احذف الـ export metadata من هنا وضعها في page.tsx أو ملف layout.js منفصل.
// سأركز الآن على كود الـ RootLayout الوظيفي.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // --- 1. متغيرات الحالة للصيانة ---
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // --- 2. التحقق من حالة الموقع عند التحميل ---
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const { data } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (data) {
          setIsMaintenance(data.is_maintenance_mode);
          setMaintenanceMsg(data.announcement_text || "We are currently upgrading our platform to Next-Gen Standards.");
        }
      } catch (e) {
        console.error("Maintenance Check Error:", e);
      } finally {
        setLoading(false);
      }
    };
    checkMaintenance();
  }, [pathname]);

  // --- 3. استثناء صفحة الأدمن من الصيانة ---
  const isAdminPage = pathname?.startsWith('/admin');

  // --- 4. شاشة التحميل (لتجنب الوميض) ---
  if (loading) {
    return (
      <html lang="en">
        <body style={{ backgroundColor: '#121212', margin: 0 }}></body>
      </html>
    );
  }

  // --- 5. شاشة الصيانة (التصميم الفحمي والذهبي) ---
  if (isMaintenance && !isAdminPage) {
    return (
      <html lang="en">
        <head>
           {/* نحتاج أيقونات بوتستراب هنا لأنها خارج التدفق العادي */}
           <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
        </head>
        <body className={inter.className}>
          <div className="maintenance-wrapper">
            <div className="glow-effect"></div>
            <div className="content-card">
               <div className="icon-gold">
                 <i className="bi bi-shield-lock-fill"></i>
               </div>
               
               <h1 className="title-text">SYSTEM UPGRADE</h1>
               <div className="divider-gold"></div>
               
               {/* الرسالة القادمة من الداتابيز */}
               <p className="message-text">
                 {maintenanceMsg}
               </p>

               <div className="status-badge">
                 <span className="pulse-dot"></span> ACCESS RESTRICTED
               </div>

               <div className="footer-copyright">
                 NNM MARKETPLACE &copy; 2026
               </div>
            </div>
          </div>

          <style jsx global>{`
            body { margin: 0; background-color: #121212; color: #e0e0e0; overflow: hidden; }
            
            /* الخلفية الفحمية مع تدرج بسيط */
            .maintenance-wrapper {
              height: 100vh;
              width: 100vw;
              display: flex;
              align-items: center;
              justify-content: center;
              background: radial-gradient(circle at center, #2c2c2c 0%, #121212 100%);
              position: relative;
            }

            /* تأثير التوهج الخلفي */
            .glow-effect {
              position: absolute;
              width: 50vw;
              height: 50vw;
              background: radial-gradient(circle, rgba(252, 213, 53, 0.03) 0%, transparent 60%);
              border-radius: 50%;
              pointer-events: none;
            }

            /* البطاقة الوسطية */
            .content-card {
              position: relative;
              z-index: 10;
              text-align: center;
              max-width: 600px;
              width: 90%;
              padding: 50px 30px;
              background: rgba(30, 30, 30, 0.6); /* رمادي شفاف */
              backdrop-filter: blur(12px);
              border: 1px solid rgba(255, 255, 255, 0.05);
              border-top: 1px solid rgba(252, 213, 53, 0.2); /* خط ذهبي خفيف من الأعلى */
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
              color: #b0b0b0; /* أبيض مكسور / رمادي فاتح */
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

            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
          `}</style>
        </body>
      </html>
    );
  }

  // --- 6. الوضع الطبيعي للموقع (الكود الأصلي الخاص بك) ---
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
        {/* ملاحظة: themeColor يجب التعامل معه عبر viewport export إذا لم يكن use client، 
            ولكن هنا سنتركه ليعمل المتصفح بشكل افتراضي أو يمكنك إضافته كـ meta tag يدوياً */}
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
            <div className="d-flex flex-column min-vh-100">
              <Navbar />
              <AppInstallPrompt />
              <LegalModal />
              <main className="flex-grow-1">
                {children}
              </main>
              <Footer />
            </div>
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
