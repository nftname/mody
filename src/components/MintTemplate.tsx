import React, { forwardRef } from 'react';

// مصفوفة الصور الأصلية للمشروع
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
        // الأبعاد الكلية للمسرح (2042x1792)
        width: '2042px',
        height: '1792px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
        fontFamily: "'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif",
      }}
    >
      {/* طبقة الخلفية الفاخرة */}
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
        {/* 1. الاسم الرئيسي - حجم متزن (154px) لضمان المساحات الجانبية */}
        <h1
          style={{
            margin: '0',
            position: 'absolute',
            
            // الموقع المرتفع مع الإزاحة لليمين (50px)
            top: 'calc(50% - 30px)',
            left: 'calc(50% + 50px)',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            textAlign: 'center',

            fontSize: '187px', // الحجم الجديد لضمان التوازن وعدم ملاصقة الأطراف
            fontWeight: '800',
            fontStyle: 'italic',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '4px',
            lineHeight: '1',

            // ظلال مكثفة لتعميق هالة الطفو
            textShadow: `
              0px 10px 20px rgba(0,0,0,0.8), 
              0px 40px 80px rgba(0,0,0,0.9),
              0px 80px 150px rgba(0,0,0,1)
            `,
          }}
        >
          {name || ''}
        </h1>

        {/* 2. السطر السفلي الموحد - حجم 53px وموقع مرتفع (420px) */}
        <div
          style={{
            position: 'absolute',
            // الرفع الإضافي 20 بكسل عن الموضع السابق
            bottom: '420px', 
            left: '50%',
            transform: 'translateX(-50%)',

            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '60px',

            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* الفئة (Tier) - خط Times New Roman */}
          <h2
            style={{
              margin: '0',
              color: '#E0E0E0',
              fontSize: '60px', // الحجم الموحد الجديد
              fontWeight: '600',
              fontFamily: "'Times New Roman', serif",
              fontStyle: 'italic',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              textShadow: '0px 5px 15px rgba(0,0,0,1), 0px 10px 30px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap',
            }}
          >
             {tier}
          </h2>

          {/* العبارة السفلية السيادية - خط Verdana */}
          <p
            style={{
              margin: 0,
              color: '#FFFFFF',
              fontSize: '60px', // الحجم الموحد الجديد
              fontWeight: '600',
              fontFamily: "'Verdana', sans-serif",
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              textShadow: '0px 5px 15px rgba(0,0,0,1), 0px 10px 30px rgba(0,0,0,0.9)',
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
