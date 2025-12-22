import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import dynamic from 'next/dynamic';
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Web3Provider from "@/components/Web3Provider";
import Footer from "@/components/Footer";
import LegalModal from "@/components/LegalModal";
import InstallPrompt from "@/components/InstallPrompt";

const Navbar = dynamic(() => import('@/components/Navbar'), { 
  ssr: false,
  loading: () => <div style={{ height: '80px' }} /> 
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NNM Market",
  description: "Next-Gen NFT Marketplace",
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
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

        <Web3Provider>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <InstallPrompt />
            <LegalModal />
            <main className="flex-grow-1">
              {children}
            </main>
            <Footer />
          </div>
        </Web3Provider>

        <Script
            id="tidio-script"
            src="//code.tidio.co/ytsnnw0nbbwqq2hx7wdy96jwoiguzorb.js"
            strategy="lazyOnload"
        />
      </body>
    </html>
  );
}