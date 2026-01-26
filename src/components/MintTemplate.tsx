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
        // الأبعاد بالعرض (Landscape)
        width: '1280px',
        height: '832px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
        // استخدام خط Montserrat أو Inter للفخامة
        fontFamily: "'Montserrat', 'Inter', sans-serif", 
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
          justifyContent: 'center', // توسيط عمودي للعناصر
        }}
      >
        {/* 1. الاسم الرئيسي (البطل - نسخة الشياكة) */}
        <h1
          style={{
            margin: '0',
            // تم تقليل الحجم 20% (من 110 إلى 90)
            fontSize: '90px', 
            // تم تقليل العرض (من 800 إلى 700)
            fontWeight: '700', 
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '6px', // زيادة المسافات للفخامة
            lineHeight: '1',
            position: 'relative',
            top: '-15px', // رفع الاسم قليلاً لإعطاء مساحة للأسطر تحته
            // بدلاً من التوهج القوي، نستخدم ظلاً "معدنياً" أنيقاً
            textShadow: `
              0 2px 4px rgba(0,0,0,0.5), 
              0 0 20px rgba(200, 200, 255, 0.3)
            `,
            // فلتر لزيادة حدة النص
            filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.4))',
          }}
        >
          {name || ''}
        </h1>

        {/* 2. اسم الفئة (تحت الاسم مباشرة) */}
        <h2
          style={{
            margin: '20px 0 0 0',
            color: '#D0D0D0', // فضي هادئ
            fontSize: '28px',
            fontWeight: '400',
            fontStyle: 'italic',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            opacity: 0.9,
          }}
        >
           {tier}
        </h2>
      </div>

      {/* 3. السطر الثالث (الختم الرسمي - في الأسفل) */}
      <div
        style={{
          position: 'absolute',
          bottom: '14%', // الموضع المقدر لمكان الماوس (أسفل الزجاج)
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
            // لون ذهبي "شامبانيا" هادئ يتماشى مع Sovereign Asset
            color: '#D4AF37', 
            fontSize: '18px', // حجم صغير ورسمي
            fontWeight: '600', // خط ثقيل قليلاً
            fontStyle: 'italic', // مائل كما طلبت
            textTransform: 'uppercase',
            letterSpacing: '3px', // تباعد لسهولة القراءة والفخامة
            // تأثير حفر خفيف
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            fontFamily: "'Cinzel', 'Times New Roman', serif", // خط كلاسيكي للختم
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
