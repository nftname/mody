
import React, { forwardRef } from 'react';

// تأكد أن الصور موجودة في مجلد public/images-mint بنفس هذه الأسماء
const TIER_IMAGES: Record<string, string> = {
  IMMORTAL: '/images-mint/IMMORTAL.jpg',
  ELITE: '/images-mint/ELITE.jpg',
  FOUNDER: '/images-mint/FOUNDER.jpg' // أو FOUNDERS.jpg حسب اسم الملف لديك
};

interface MintTemplateProps {
  name: string;
  tier: string;
}

const MintTemplate = forwardRef<HTMLDivElement, MintTemplateProps>(({ name, tier }, ref) => {
  const imageSrc = TIER_IMAGES[tier] || TIER_IMAGES.ELITE;

  return (
    <div
      ref={ref}
      style={{
        width: '1080px', // دقة عالية ثابتة
        height: '1080px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      {/* صورة الخلفية */}
      <img
        src={imageSrc}
        alt={tier}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* طبقة الاسم */}
      <div
        style={{
          position: 'absolute',
          top: '35%', // عدل هذه النسبة لرفع أو خفض الاسم
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontFamily: "'Cinzel', serif", // أو اسم الخط الخاص بك في الموقع
            fontSize: '130px', // حجم خط كبير وواضح
            fontWeight: 'bold',
            color: '#FCD535', // اللون الذهبي
            textTransform: 'uppercase',
            margin: 0,
            textShadow: '4px 4px 10px rgba(0,0,0,0.8)', // ظل قوي للوضوح
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
