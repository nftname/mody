import type { Metadata, Viewport } from "next"; // ط£ط¶ظپظ†ط§ Viewport
import { Inter } from "next/font/google";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalModal from "@/components/LegalModal";
import { Providers } from "@/app/providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "NNM Market",
  description: "Next-Gen NFT Marketplace",
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
              <Navbar />
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
