import { Inter } from "next/font/google";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Providers } from "@/app/providers";
import MaintenanceGuardWrapper from "./MaintenanceGuardWrapper";

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
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" strategy="beforeInteractive" />
        <Providers>
            <MaintenanceGuardWrapper>
                {children}
            </MaintenanceGuardWrapper>
        </Providers>
      </body>
    </html>
  );
}
