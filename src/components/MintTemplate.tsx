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
        {/* 1. الاسم الرئيسي - الإعدادات السابقة كما هي (مرتفع 200px، أبيض، ظلال كثيفة) */}
        <h1
          style={{
            margin: '0',
            position: 'absolute',
            top: 'calc(50% - 30px)',
            left: 'calc(50% + 50px)',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            textAlign: 'center',

            fontSize: '192px',
            fontWeight: '800',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            letterSpacing: '4px',
            lineHeight: '1',

            color: '#FFFFFF',

            textShadow: `
              0px 10px 20px rgba(0,0,0,0.8), 
              0px 40px 80px rgba(0,0,0,0.9),
              0px 80px 150px rgba(0,0,0,1)
            `,
          }}
        >
          {name || ''}
        </h1>

        {/* 2. السطر السفلي (الفئة + العبارة) - التعديلات الجديدة */}
        <div
          style={{
            position: 'absolute',
            // تعديل جراحي 1: الرفع 100px إضافية (أصبح 400px من الأسفل)
            bottom: '400px', 
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
          {/* الفئة (Tier) */}
          <h2
            style={{
              margin: '0',
              color: '#E0E0E0',
              // تعديل جراحي 2: زيادة الحجم 20% (أصبح 68px)
              fontSize: '68px', 
              fontWeight: '600',
              fontFamily: "'Times New Roman', serif",
              fontStyle: 'italic',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              // تعديل جراحي 3: ظلال كثيفة لمقاومة إضاءة الطاولة
              textShadow: '0px 5px 10px rgba(0,0,0,1), 0px 10px 25px rgba(0,0,0,0.8)',
              whiteSpace: 'nowrap',
            }}
          >
             {tier}
          </h2>

          {/* العبارة السفلية */}
          <p
            style={{
              margin: 0,
              color: '#FFFFFF',
              // تعديل جراحي 2: زيادة الحجم 20% (أصبح 68px)
              fontSize: '68px', 
              fontWeight: '600',
              fontFamily: "'Verdana', sans-serif",
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              // تعديل جراحي 3: ظلال كثيفة لمقاومة إضاءة الطاولة
              textShadow: '0px 5px 10px rgba(0,0,0,1), 0px 10px 25px rgba(0,0,0,0.8)',
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
