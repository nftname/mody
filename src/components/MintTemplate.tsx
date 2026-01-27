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
        {/* 1. الاسم الرئيسي - في المنتصف */}
        <h1
          style={{
            margin: '0',
            position: 'absolute',
            top: 'calc(50% - 30px)',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%', 
            textAlign: 'center', 
            
            fontSize: '192px', 
            fontWeight: '800', 
            fontStyle: 'italic',
            color: '#F2F2F2', 
            textTransform: 'uppercase',
            letterSpacing: '4px',
            lineHeight: '1',
            
            textShadow: `
              0 2px 0 #ccc,
              0 5px 15px rgba(0,0,0,0.6),
              0 10px 30px rgba(0,0,0,0.5)
            `,
          }}
        >
          {name || ''}
        </h1>

        {/* 2. السطر السفلي الموحد (الفئة + العبارة) */}
        <div
          style={{
            position: 'absolute',
            // تعديل جراحي 1: الرفع للأعلى 20 بيكسل (كان 80 أصبح 100)
            bottom: '100px', 
            
            // تعديل جراحي 2: التوسيط في منتصف الشاشة
            left: '50%',
            transform: 'translateX(-50%)',
            
            display: 'flex', 
            alignItems: 'baseline', 
            justifyContent: 'center',
            
            // تعديل جراحي 3: المسافة الفاصلة بين الكلمتين
            gap: '60px', 
            
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* الفئة (Tier) - نوع خطها الخاص Times New Roman */}
          <h2
            style={{
              margin: '0',
              color: '#E0E0E0', 
              // تعديل جراحي 4: توحيد الحجم (56px)
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

          {/* العبارة السفلية - نوع خطها الخاص Verdana */}
          <p
            style={{
              margin: 0,
              color: '#FFFFFF', 
              // تعديل جراحي 4: توحيد الحجم (56px)
              fontSize: '56px', 
              fontWeight: '600', 
              fontFamily: "'Verdana', sans-serif", // الحفاظ على نوع الخط المختلف
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
