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
        // الأبعاد الثابتة للصورة المربعة
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
          display: 'block', 
        }}
      >
        {/* 1. الاسم الرئيسي */}
        <h1
          style={{
            margin: '0',
            position: 'absolute',
            
            // تعديل جراحي 1: النزول بالاسم لأسفل (36%) ليظهر شعاع الليزر من فوقه
            top: '36%',     
            
            // تعديل جراحي 2: إزاحة لليمين (15%) ليلامس الحرف الأخير شعاع الليزر
            right: '15%',   
            
            // تعديل جراحي 3: تكبير الخط بنسبة 20% (من 88px إلى 106px)
            fontSize: '106px', 
            
            fontWeight: '800', 
            fontStyle: 'italic',
            color: '#F2F2F2', 
            textTransform: 'uppercase',
            letterSpacing: '2px', 
            lineHeight: '1',
            textAlign: 'right', // المحاذاة لليمين ضرورية ليتمدد الاسم باتجاه اليسار
            
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
            position: 'absolute',
            bottom: '100px', 
            // تعديل جراحي 4: إزاحة عن اليسار لتفادي القص (من 60px إلى 100px)
            left: '100px',
            
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
          position: 'absolute',
          bottom: '40px', 
          // تعديل جراحي 5: إزاحة عن اليسار لتطابق الفئة (100px)
          left: '100px',
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
