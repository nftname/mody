import React, { forwardRef } from 'react';

// تأكد أن الصورة الجديدة وضعتها في المجلد العام بهذا الاسم بالضبط
const FRAME_IMAGE = '/images-mint/mint.PNG';

interface MintTemplateProps {
  name: string;
  tier: string;
}

const MintTemplate = forwardRef<HTMLDivElement, MintTemplateProps>(({ name, tier }, ref) => {
  
  // تنسيق الاسم (حروف كبيرة دائماً)
  const displayName = name ? name.toUpperCase() : '';
  
  // تنسيق الفئة: الحرف الأول كبير والباقي صغير + كلمة Edition
  // مثال: IMMORTAL -> Immortal Edition
  const formatTier = (t: string) => {
    if (!t) return 'Nexus Edition';
    return `${t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()} Edition`;
  };

  return (
    <div
      ref={ref}
      style={{
        // الأبعاد الدقيقة كما طلبت
        width: '832px',
        height: '1280px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000', 
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* 1. الخلفية الموحدة (الزجاج والكريستال) */}
      <img
        src={FRAME_IMAGE}
        alt="NNM Future Glass"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      {/* 2. حاوية النصوص (في قلب الصندوق الزجاجي) */}
      <div
        style={{
          position: 'absolute',
          // الإحداثيات الدقيقة للتوسط
          top: '48%', // أعلى قليلاً من المنتصف الهندسي لتعويض منظور الأرضية
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%', // عرض آمن لعدم ملامسة حواف الزجاج
          textAlign: 'center',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* أ. الاسم (البطل المتوهج) */}
        <h1
          style={{
            margin: 0,
            padding: 0,
            color: '#FFFFFF', // أبيض أساسي
            fontSize: '80px', // حجم ضخم (تم ضبطه ليناسب عرض 832)
            fontWeight: '800', // سميك
            textTransform: 'uppercase',
            letterSpacing: '3px', // تباعد للأحرف يزيد الفخامة
            lineHeight: '1.2',
            // خلطة التوهج (أبيض -> سماوي -> أزرق عميق)
            textShadow: `
              0 0 5px #FFFFFF,
              0 0 20px #00FFFF,
              0 0 40px #00FFFF,
              0 0 80px #0088FF
            `,
          }}
        >
          {displayName}
        </h1>

        {/* ب. الفئة (التوقيع الرفيع) */}
        <h2
          style={{
            margin: 0,
            marginTop: '20px', // المسافة بين الاسم والفئة
            color: '#E0E0E0', // رمادي فاتح جداً (فضي)
            fontSize: '32px', // حجم متوسط
            fontWeight: '300', // خط رفيع
            fontStyle: 'italic', // مائل (ستايل التوقيع)
            fontFamily: "'Playfair Display', serif", // يفضل خط سيريف للتوقيع إن وجد، أو اتركه للخط الافتراضي
            letterSpacing: '2px',
            opacity: 0.9,
            // توهج خفيف جداً لضمان القراءة
            textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
          }}
        >
           — {formatTier(tier)} —
        </h2>
      </div>
    </div>
  );
});

MintTemplate.displayName = 'MintTemplate';

export default MintTemplate;
