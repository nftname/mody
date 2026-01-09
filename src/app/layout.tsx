import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalModal from "@/components/LegalModal";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import SiteController from "@/components/SiteController"; 
import { Providers } from "@/app/providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  // هام جداً: ضع رابط موقعك الأصلي هنا بدلاً من الرابط الافتراضي
  metadataBase: new URL('https://www.YOUR-REAL-DOMAIN.com'), 

  title: "NNM Market",
  description: "Next-Gen NFT Marketplace & Global Index",
  
  // إعدادات النشر على فيسبوك (Open Graph)
  openGraph: {
    title: "NNM Market",
    description: "The Global Benchmark for NFT Market Assets",
    url: '/',
    siteName: 'NNM Market',
    images: [
      {
        url: '/icons/icon.svg', // سيأخذ أيقونة الموقع كصورة مؤقتة للمشاركة
        width: 1200,
        height: 630,
        alt: 'NNM Market Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // إعدادات النشر على تويتر
  twitter: {
    card: 'summary_large_image',
    title: "NNM Market",
    description: "Next-Gen NFT Marketplace & Global Index",
    images: ['/icons/icon.svg'],
  },

  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/icons/icon.svg'],
    apple: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body className={inter.className}>
        
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
          strategy="beforeInteractive" 
        />

        <Providers>
            <div className="d-flex flex-column min-vh-100">
              <SiteController />
              
              <Navbar />
              <PWAInstallPrompt />
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
