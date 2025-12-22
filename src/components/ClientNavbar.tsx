'use client';

import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('./Navbar'), {
  ssr: false,
  loading: () => <div style={{ height: '80px' }} />
});

export default Navbar;
