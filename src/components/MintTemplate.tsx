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
        // استخدام خط عريض وقوي للمستقبل
        fontFamily: "'Arial Black', 'Impact', sans-serif", 
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
        {/* 1. الاسم الرئيسي (المستقبل المتوهج) */}
        <h1
          style={{
            margin: '0',
            // حجم كبير لكن مضبوط
            fontSize: '100px', 
            // خط سميك جداً
            fontWeight: '900', 
            color: '#FFFFFF', // قلب الحرف أبيض
            textTransform: 'uppercase',
            // تباعد أحرف واسع جداً ليعطي طابع الديجيتال والفضاء
            letterSpacing: '12px', 
            lineHeight: '1',
            position: 'relative',
            top: '-25px', // رفعناه قليلاً لترك مكان للأسطر تحته
            
            // سحر المستقبل: توهج ليزري سماوي قوي + ظل أسود للعمق
            textShadow: `
              0 0 10px rgba(0, 255, 255, 0.8),
              0 0 30px rgba(0, 255, 255, 0.6),
              0 0 60px rgba(0, 100, 255, 0.4),
              4px 4px 0px rgba(0,0,0,0.5) 
            `,
            // إضافة حدود دقيقة للحرف لزيادة الحدة
            WebkitTextStroke: '1px rgba(255,255,255,0.8)',
          }}
        >
          {name || ''}
        </h1>

        {/* 2. اسم الفئة */}
        <h2
          style={{
            margin: '15px 0 0 0',
            color: '#E0E0E0', 
            fontSize: '30px',
            fontWeight: '500',
            // نعود لخط مائل كلاسيكي هنا للتباين
            fontFamily: "'Times New Roman', serif", 
            fontStyle: 'italic',
            letterSpacing: '5px',
            textTransform: 'uppercase',
            textShadow: '0 2px 4px rgba(0,0,0,1)',
          }}
        >
           {tier}
        </h2>
      </div>

      {/* 3. السطر الثالث (الختم الرسمي - تم الرفع وتغيير اللون) */}
      <div
        style={{
          position: 'absolute',
          // تم الرفع للأعلى (كان 14% والآن 28% ليكون عند مكان الماوس)
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
            // تم تغيير اللون للأبيض كما طلبت
            color: '#FFFFFF', 
            fontSize: '16px', 
            fontWeight: '600', 
            fontStyle: 'italic', 
            textTransform: 'uppercase',
            letterSpacing: '3px',
            // توهج خفيف جداً للأبيض
            textShadow: '0 0 8px rgba(255,255,255,0.5)',
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
