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
        // الأبعاد الضخمة (2042x1792)
        width: '2042px',
        height: '1792px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
        fontFamily: "'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif",
      }}
    >
      {/* طبقة الخلفية */}
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
        {/* 1. الاسم الرئيسي - العودة للأبيض وزيادة الظلال والخفض للأسفل */}
        <h1
          style={{
            margin: '0',
            position: 'absolute',
            
            // تعديل جراحي 1: خفض الاسم 100 بكسل إضافية (من +70 إلى +170)
            top: 'calc(50% + 170px)',
            
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

            // تعديل جراحي 2: العودة للون الأبيض الناصع
            color: '#FFFFFF',

            // تعديل جراحي 3: زيادة كثافة الظلال لتعميق هالة الطفو
            textShadow: `
              0px 10px 20px rgba(0,0,0,0.8),   // ظل قريب للملمس
              0px 30px 60px rgba(0,0,0,0.9),   // ظل متوسط للعمق
              0px 60px 120px rgba(0,0,0,1)     // هالة سوداء كثيفة جداً في الخلفية
            `,
          }}
        >
          {name || ''}
        </h1>

        {/* 2. السطر السفلي الموحد (الفئة + العبارة) - في المنتصف */}
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
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

          {/* العبارة السفلية */}
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
