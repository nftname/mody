'use client';
import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';

const FullBarWidget = ({ theme }: { theme: 'dark' | 'light' }) => (
    <div className="d-flex gap-2 align-items-center justify-content-center w-100 h-100" 
         style={{ background: theme === 'light' ? '#fff' : '#111', padding: '10px' }}>
        <NGXWidget theme={theme} />
        <NGXCapWidget theme={theme} />
        <NGXVolumeWidget theme={theme} />
    </div>
);

export default function EmbedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = params?.id as string;
  const themeParam = searchParams.get('theme');
  const theme = themeParam === 'light' ? 'light' : 'dark';
  const bgColor = theme === 'light' ? '#ffffff' : 'transparent';
  const textColor = theme === 'light' ? '#666' : '#888';

  const renderWidget = () => {
    switch (id) {
      case 'ngx-sentiment': return <NGXWidget theme={theme} />;
      case 'ngx-cap': return <NGXCapWidget theme={theme} />;
      case 'ngx-volume': return <NGXVolumeWidget theme={theme} />;
      case 'ngx-full-bar': return <FullBarWidget theme={theme} />;
      default: return <div className="text-white">Widget Not Found</div>;
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: bgColor, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      <a href="https://nftnnm.com/ngx" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', transform: 'scale(0.9)' }}>
          {renderWidget()}
      </a>

      <a href="https://nftnnm.com/ngx" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', marginTop: '-5px' }}>
        <span style={{ fontSize: '9px', fontFamily: 'sans-serif', color: textColor, opacity: 0.7 }}>
            Powered by NNM Sovereign Name Assets
        </span>
      </a>

    </div>
  );
}
