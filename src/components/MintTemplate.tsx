import React, { forwardRef } from 'react';

// Ensure filenames match exactly what is in public/images-mint/
const TIER_IMAGES: Record<string, string> = {
  IMMORTAL: '/images-mint/IMMORTAL.jpg',
  ELITE: '/images-mint/ELITE.jpg', 
  // Map both keys to the same image to prevent errors
  FOUNDER: '/images-mint/FOUNDER.jpg',
  FOUNDERS: '/images-mint/FOUNDER.jpg' 
};

interface MintTemplateProps {
  name: string;
  tier: string;
}

const MintTemplate = forwardRef<HTMLDivElement, MintTemplateProps>(({ name, tier }, ref) => {
  const upperTier = tier ? tier.toUpperCase() : 'ELITE';
  const imageSrc = TIER_IMAGES[upperTier] || TIER_IMAGES.ELITE;

  return (
    <div
      ref={ref}
      style={{
        width: '1080px',
        height: '1080px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      <img
        src={imageSrc}
        alt={tier}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '35%', 
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '130px',
            fontWeight: 'bold',
            color: '#FCD535',
            textTransform: 'uppercase',
            margin: 0,
            textShadow: '4px 4px 10px rgba(0,0,0,0.8)',
            letterSpacing: '5px',
          }}
        >
          {name || ''}
        </h1>
      </div>
    </div>
  );
});

MintTemplate.displayName = 'MintTemplate';

export default MintTemplate;
