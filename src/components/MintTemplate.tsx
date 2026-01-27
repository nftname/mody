import React, { forwardRef } from 'react';

// مصفوفة الصور (كما هي تماماً)
const TIER_IMAGES: Record<string, string> = {
  IMMORTAL: '/images-mint/IMMORTAL.jpg',
  ELITE: '/images-mint/FOUNDER.jpg',
  FOUNDER: '/images-mint/ELITE.jpg',
  FOUNDERS: '/images-mint/ELITE.jpg'
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
        // الأبعاد الضخمة للمشروع (2042x1792)
        width: '2042px',
        height: '1792px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
        fontFamily: "'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif",
      }}
    >
      {/* طبقة الخلفية الأصلية */}
      <img
        src={imageSrc}
        alt={tier}
        crossOrigin="anonymous"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* منطقة المحتوى (المسرح) */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          zIndex: 10,
          display: 'block',
        }}
      >
        {/* 1. الاسم الرئيسي - أبيض ناصع، مرتفع 200 بكسل، وظلال مكثفة */}
        <h1
          style={{
            margin: '0',
            position: 'absolute',
            
            // تعديل جراحي: رفع الاسم 200 بكسل عن الموضع السابق
            top: 'calc(50% - 30px)',
            
            // الحفاظ على الإزاحة اليمينية (50px)
            left: 'calc(50% + 50px)',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            textAlign: 'center',

            fontSize: '192px', // الحجم الضخم (يوازي 200 بكسل ارتفاع تقريباً)
            fontWeight: '800',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            letterSpacing: '4px',
            lineHeight: '1',

            color: '#FFFFFF', // أبيض ناصع

            // ظلال ثلاثية لتعميق هالة البروز
            textShadow: `
              0px 10px 20px rgba(0,0,0,0.8), 
              0px 40px 80px rgba(0,0,0,0.9),
              0px 80px 150px rgba(0,0,0,1)
            `,
          }}
        >
          {name || ''}
        </h1>

        {/* 2. السطر السفلي (الفئة + العبارة) - مرفوع 200 بكسل في المنتصف */}
        <div
          style={{
            position: 'absolute',
            // تعديل جراحي: رفع السطر السفلي من 100px إلى 300px
            bottom: '300px', 
            left: '50%',
            transform: 'translateX(-50%)',

            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '60px', // المسافة الفاصلة

            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* الفئة (Tier) - مشروع NNM */}
          <h2
            style={{
              margin: '0',
              color: '#E0E0E0',
              fontSize: '56px',
              fontWeight: '600',
              fontFamily: "'Times New Roman', serif",
              fontStyle: 'italic',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              textShadow: '0 2px 4px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap',
            }}
          >
             {tier}
          </h2>

          {/* العبارة السفلية السيادية */}
          <p
            style={{
              margin: 0,
              color: '#FFFFFF',
              fontSize: '56px',
              fontWeight: '600',
              fontFamily: "'Verdana', sans-serif",
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              textShadow: '0 2px 4px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap',
            }}
          >
            GEN-0 NNM Sovereign Asset
          </p>
        </div>
      </div>
    </div>
  );
});

MintTemplate.displayName = 'MintTemplate';

export default MintTemplate;
