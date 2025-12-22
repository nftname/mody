'use client';

import dynamic from 'next/dynamic';
import Footer from '@/components/Footer';
import LegalModal from '@/components/LegalModal';
import InstallPrompt from '@/components/InstallPrompt';
// Import web3modal setup to ensure it's initialized
import '@/lib/web3modal';

// Load Navbar only on client-side to avoid SSR issues with Web3Modal
const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <InstallPrompt />
      <LegalModal />
      <main className="flex-grow-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
