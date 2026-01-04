'use client';

import dynamic from 'next/dynamic';

const ClientNavbar = dynamic(() => import('./Navbar'), {
  ssr: false,
  loading: () => <div style={{ height: '80px' }} />
});

export default ClientNavbar;
