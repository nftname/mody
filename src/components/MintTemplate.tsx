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
        // الأبعاد والخصائص كما هي
        width: '1280px',
        height: '832px',
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', 
          // تعديل جراحي 1: إضافة مساحة سفلية لرفع المحتوى للأعلى ليقابل شعاع الليزر
          paddingBottom: '80px', 
          // تعديل جراحي 2: إزاحة المحتوى بالكامل قليلاً لليمين ليتماشى مع مصدر الليزر
          paddingLeft: '35px', 
        }}
      >
        {/* 1. الاسم الرئيسي */}
        <h1
          style={{
            margin: '0',
            fontSize: '88px', // الحجم كما هو (مناسب لليزر)
            fontWeight: '800', 
            fontStyle: 'italic',
            color: '#F2F2F2', 
            textTransform: 'uppercase',
            letterSpacing: '2px', 
            lineHeight: '1',
            position: 'relative',
            // تعديل جراحي 3: رفع الاسم للأعلى أكثر ليدخل فيه الليزر بنسبة 20%
            top: '-30px', 
            
            textShadow: `
              0 2px 0 #ccc,
              0 5px 10px rgba(0,0,0,0.6),
              0 10px 20px rgba(0,0,0,0.5)
            `,
          }}
        >
          {name || ''}
        </h1>

        {/* 2. اسم الفئة */}
        <h2
          style={{
            // تعديل جراحي 4: زيادة المسافة بنسبة 100% (من 15px إلى 30px)
            margin: '30px 0 0 0',
            color: '#E0E0E0', 
            // تعديل جراحي 5: زيادة الحجم بنسبة 50% (من 28px إلى 42px)
            fontSize: '42px',
            fontWeight: '500',
            fontFamily: "'Times New Roman', serif", 
            fontStyle: 'italic',
            letterSpacing: '6px', 
            textTransform: 'uppercase',
            textShadow: '0 2px 4px rgba(0,0,0,0.9)',
          }}
        >
           {tier}
        </h2>
      </div>

      {/* 3. السطر الثالث (الختم الرسمي) */}
      <div
        style={{
          position: 'absolute',
          // تعديل جراحي 6: إنزاله للأسفل لزيادة البعد عن الفئة (من 26% إلى 15%)
          bottom: '15%', 
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '100%',
          zIndex: 10,
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#FFFFFF', 
            // تعديل جراحي 7: زيادة الحجم بنسبة 100% (من 16px إلى 32px)
            fontSize: '32px', 
            fontWeight: '600', 
            fontStyle: 'italic', 
            textTransform: 'uppercase',
            letterSpacing: '3px',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            fontFamily: "'Verdana', sans-serif", 
          }}
        >
          GEN-0 NNM Sovereign Asset
        </p>
      </div>
    </div>
  );
});

MintTemplate.displayName = 'MintTemplate';

export default MintTemplate;
