import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Providers } from "@/app/providers";
// استيراد المكون الجديد الذي أنشأناه
import MaintenanceGuard from "@/components/MaintenanceGuard";

const inter = Inter({ subsets: ["latin"] });

// ✅ هنا الميتاداتا التي تحل المشكلة
export const metadata: Metadata = {
  metadataBase: new URL('https://www.nftnnm.com'),
  title: "NNM Marketplace",
  description: "Digital Name Assets Marketplace",
  openGraph: {
    title: "NNM Marketplace",
    description: "Digital Name Assets Marketplace",
    url: 'https://www.nftnnm.com',
    siteName: 'NNM Marketplace',
    locale: 'en_US',
    type: 'website',
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
          strategy="beforeInteractive" 
        />
        <Providers>
            {/* استدعاء المكون الجديد */}
            <MaintenanceGuard>
                {children}
            </MaintenanceGuard>
        </Providers>
      </body>
    </html>
  );
}
