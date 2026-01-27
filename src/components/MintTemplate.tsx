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
        // تعديل جراحي 1: الأبعاد الجديدة للصورة المربعة
        width: '1343px',
        height: '1116px',
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
          // تعديل جراحي 2: إلغاء الفليكس المركزي للسماح بالتحكم الحر في الإحداثيات
          display: 'block', 
        }}
      >
        {/* 1. الاسم الرئيسي */}
        <h1
          style={{
            margin: '0',
            // تعديل جراحي 3: ضبط المكان بدقة ليلامس شعاع الليزر من اليمين
            position: 'absolute',
            top: '28%',     // الارتفاع المناسب لتقاطع الشعاع (20% تداخل)
            right: '25%',   // النقطة التي ينتهي عندها الاسم (عند رأس الليزر تماماً)
            
            fontSize: '88px', 
            fontWeight: '800', 
            fontStyle: 'italic',
            color: '#F2F2F2', 
            textTransform: 'uppercase',
            letterSpacing: '2px', 
            lineHeight: '1',
            textAlign: 'right', // بداية الكتابة من اليمين لليسار (خارجاً من الليزر)
            
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
            // تعديل جراحي 4: نقل الفئة إلى أقصى اليسار السفلي
            position: 'absolute',
            bottom: '100px', // فوق العبارة الأخيرة بمسافة
            left: '60px',
            
            margin: '0',
            color: '#E0E0E0', 
            fontSize: '42px',
            fontWeight: '500',
            fontFamily: "'Times New Roman', serif", 
            fontStyle: 'italic',
            letterSpacing: '6px', 
            textTransform: 'uppercase',
            textAlign: 'left',
            textShadow: '0 2px 4px rgba(0,0,0,0.9)',
          }}
        >
           {tier}
        </h2>
      </div>

      {/* 3. السطر الثالث (الختم الرسمي) */}
      <div
        style={{
          // تعديل جراحي 5: نقل العبارة إلى أقصى اليسار أسفل الفئة
          position: 'absolute',
          bottom: '40px', 
          left: '60px',
          textAlign: 'left',
          zIndex: 10,
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#FFFFFF', 
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
