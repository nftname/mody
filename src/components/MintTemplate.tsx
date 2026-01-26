import React, { forwardRef } from 'react';

// مصفوفة الصور (كما هي)
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
        // الأبعاد بالعرض (Landscape)
        width: '1280px',
        height: '832px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
        // نستخدم خطوط النظام النظيفة جداً للفخامة
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
        }}
      >
        {/* 1. الاسم الرئيسي (كريستال أبيض فخم) */}
        <h1
          style={{
            margin: '0',
            // حجم كبير وواضح
            fontSize: '110px', 
            // سميك ليعطي هيبة
            fontWeight: '800', 
            // مائل كما طلبت (لمسة الشياكة)
            fontStyle: 'italic',
            color: '#FFFFFF', 
            textTransform: 'uppercase',
            // تباعد أحرف متوازن (ليس واسعاً جداً ولا ضيقاً)
            letterSpacing: '2px', 
            lineHeight: '1',
            position: 'relative',
            top: '-20px', 
            
            // السر هنا: ظل أسود عميق يرفع الكلمة عن الخلفية بدلاً من تشويشها بالضوء
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
            margin: '15px 0 0 0',
            color: '#E0E0E0', 
            fontSize: '28px',
            fontWeight: '500',
            fontFamily: "'Times New Roman', serif", 
            fontStyle: 'italic',
            letterSpacing: '6px', // تباعد واسع للفئة
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
          // الموقع المعدل (مكان الماوس)
          bottom: '26%', 
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
            fontSize: '16px', 
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
