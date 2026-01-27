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
        // تعديل جراحي 1: الأبعاد الجديدة الضخمة (2042x1792)
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
        {/* 1. الاسم الرئيسي - في السنتر تماماً */}
        <h1
          style={{
            margin: '0',
            position: 'absolute',
            
            // تعديل جراحي 2: السنتر العمودي (48% ليكون في الوسط بصرياً مع مراعاة الفئة تحته)
            top: '48%',
            // السنتر الأفقي باستخدام الترحيل 50%
            left: '50%',
            transform: 'translate(-50%, -50%)',
            
            width: '100%', // لضمان التوسيط
            
            // تعديل جراحي 3: زيادة الحجم 20% (من 106px إلى 128px)
            fontSize: '128px', 
            
            fontWeight: '800', 
            fontStyle: 'italic',
            color: '#F2F2F2', 
            textTransform: 'uppercase',
            letterSpacing: '4px', // زيادة التباعد قليلاً للفخامة
            lineHeight: '1',
            textAlign: 'center', // توسيط النص
            
            textShadow: `
              0 2px 0 #ccc,
              0 5px 10px rgba(0,0,0,0.6),
              0 10px 20px rgba(0,0,0,0.5)
            `,
          }}
        >
          {name || ''}
        </h1>

        {/* 2. اسم الفئة - تحت الاسم بمسافة جيدة */}
        <h2
          style={{
            position: 'absolute',
            // تعديل جراحي 4: الموقع تحت الاسم (عند 58% من الارتفاع)
            top: '58%', 
            left: '50%',
            transform: 'translateX(-50%)',
            
            width: '100%',
            margin: '0',
            
            color: '#E0E0E0', 
            fontSize: '48px', // حجم متناسق مع الضخامة الجديدة
            fontWeight: '500',
            fontFamily: "'Times New Roman', serif", 
            fontStyle: 'italic',
            letterSpacing: '8px', 
            textTransform: 'uppercase',
            textAlign: 'center', // توسيط
            textShadow: '0 2px 4px rgba(0,0,0,0.9)',
          }}
        >
           {tier}
        </h2>
      </div>

      {/* 3. السطر الثالث (الختم الرسمي) - أسفل المنتصف */}
      <div
        style={{
          position: 'absolute',
          // تعديل جراحي 5: أسفل الصورة في المنتصف
          bottom: '80px', 
          left: '50%',
          transform: 'translateX(-50%)',
          
          width: '100%',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#FFFFFF', 
            fontSize: '36px', // تكبير طفيف ليناسب حجم الصورة العملاق
            fontWeight: '600', 
            fontStyle: 'italic', 
            textTransform: 'uppercase',
            letterSpacing: '4px',
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
