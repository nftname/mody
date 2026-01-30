import { Inter } from "next/font/google";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Providers } from "@/app/providers";
import MaintenanceGuardWrapper from "./MaintenanceGuardWrapper";
import PWAInstallBanner from "@/components/PWAInstallBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'NNM | Digital Name Assets',
  description: 'The definitive marketplace for NFT Digital Identity. Secure your immutable priority on the blockchain. True ownership. Non-custodial.',
  openGraph: {
    title: 'NNM | Digital Name Assets',
    description: 'The definitive marketplace for NFT Digital Identity.',
    url: 'https://nnm.market',
    siteName: 'NNM Market',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NNM | Digital Name Assets',
    site: '@nnmmarket',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#F0C420" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NNM" />
        <meta name="application-name" content="NNM Market" />
        <meta name="msapplication-TileColor" content="#F0C420" />
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" strategy="beforeInteractive" />
        <Script id="pwa-register" strategy="afterInteractive">
          {`
            // Register Service Worker only
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js?v=2')
                  .then(function(registration) {
                    console.log('✅ PWA ServiceWorker registered');
                  })
                  .catch(function(err) {
                    console.log('❌ PWA ServiceWorker failed:', err);
                  });
              });
            }

            window.addEventListener('appinstalled', () => {
              console.log('✅ PWA installed!');
            });
          `}
        </Script>
        <PWAInstallBanner />
        <Providers>
            <MaintenanceGuardWrapper>
                {children}
            </MaintenanceGuardWrapper>
        </Providers>
      </body>
    </html>
  );
}
