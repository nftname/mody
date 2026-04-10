import { Inter } from "next/font/google";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Providers } from "@/app/providers";
import MaintenanceGuardWrapper from "./MaintenanceGuardWrapper";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import PresenceTracker from "@/components/PresenceTracker";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://nftnnm.com'),
  title: 'NNM | Digital Name Assets',
  description: 'The definitive marketplace for NFT Digital Identity. Secure your immutable priority on the blockchain. True ownership. Non-custodial.',
  openGraph: {
    title: 'NNM | Digital Name Assets',
    description: 'The definitive marketplace for NFT Digital Identity.',
    url: 'https://nftnnm.com',
    siteName: 'NNM Market',
    images: [{ url: '/logo-square.jpg', width: 300, height: 300 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'NNM | Digital Name Assets',
    site: '@nnmmarket',
    images: ['/logo-square.jpg'],
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
        <link rel="preconnect" href="https://cigztdxswhkkyootcywr.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pulse.walletconnect.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.web3modal.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://polygon-bor.publicnode.com" crossOrigin="anonymous" />
        
        <link rel="preload" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" as="style" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" media="print" id="bs-icons" suppressHydrationWarning />
        <link rel="preload" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css" as="style" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css" media="print" id="fa-icons" suppressHydrationWarning />
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "document.getElementById('bs-icons').media='all'; document.getElementById('fa-icons').media='all';" }} />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NNM" />
        <meta name="application-name" content="NNM Market" />
        <meta name="msapplication-TileColor" content="#F0C420" />
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} strategy="beforeInteractive" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-NQY65DTMFD" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NQY65DTMFD');
          `}
        </Script>

        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
        <Script id="sw-unregister" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                  console.log('Old ServiceWorker unregistered');
                }
              });
            }
          `}
        </Script>
        <Script id="pwa-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
                  .then(function(registration) {
                    console.log('PWA ServiceWorker registered');
                  })
                  .catch(function(err) {
                    console.log('PWA ServiceWorker failed:', err);
                  });
              });
            }

            window.addEventListener('appinstalled', () => {
              console.log('PWA installed!');
            });
          `}
        </Script>
        <PWAInstallBanner />
        <Providers>
            <PresenceTracker />
            <MaintenanceGuardWrapper>
                {children}
            </MaintenanceGuardWrapper>
        </Providers>
      </body>
    </html>
  );
}
