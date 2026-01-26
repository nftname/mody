import React, { forwardRef } from 'react';

// --- مصفوفة الصور القديمة (كما هي 100% بدون تعديل) ---
// *ملاحظة:* تأكد من أنك قمت باستبدال محتوى هذه الصور في جهازك بالصورة الزجاجية الجديدة
const TIER_IMAGES: Record<string, string> = {
  IMMORTAL: '/images-mint/IMMORTAL.jpg',
  
  // التبديل القديم الذي كان يعمل (حافظنا عليه)
  ELITE: '/images-mint/FOUNDER.jpg', 
  
  // التبديل القديم الذي كان يعمل (حافظنا عليه)
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

  // دالة لتنسيق اسم الفئة في السطر الثاني (مثال: IMMORTAL -> Immortal Edition)
  const formatTier = (t: string) => {
    if (!t) return 'Nexus Edition';
    // الحرف الأول كبير والباقي صغير
    return `${t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()} Edition`;
  };

  return (
    <div
      ref={ref}
      style={{
        // 1. الأبعاد الجديدة (بيكسل بيكسل حسب الصورة الزجاجية)
        width: '832px',
        height: '1280px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000', // خلفية سوداء للأمان
        fontFamily: "'Inter', 'Segoe UI', sans-serif", // تغيير الخط ليناسب الديجيتال
      }}
    >
      {/* طبقة الصورة */}
      <img
        src={imageSrc}
        alt={tier}
        // إضافة خاصية الأمان لمنع مشاكل التحميل
        crossOrigin="anonymous"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* طبقة النصوص (المسرح الجديد) */}
      <div
        style={{
          position: 'absolute',
          // 2. التمركز الجديد: في قلب الصندوق الزجاجي
          top: '48%', 
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '85%', // مساحة عرض كافية لعدم ملامسة الحواف
          textAlign: 'center',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* السطر الأول: الاسم (البطل المتوهج) */}
        <h1
          style={{
            margin: 0,
            padding: 0,
            color: '#FFFFFF', // أبيض ناصع
            fontSize: '85px', // حجم ضخم ومناسب للعرض الجديد
            fontWeight: '800', // سميك
            textTransform: 'uppercase',
            letterSpacing: '4px',
            lineHeight: '1.1',
            // تأثير التوهج المستقبلي (Cyan Glow)
            textShadow: `
              0 0 10px rgba(255,255,255,0.9),
              0 0 30px rgba(0, 255, 255, 0.7),
              0 0 60px rgba(0, 255, 255, 0.4)
            `,
          }}
        >
          {name || ''}
        </h1>

        {/* السطر الثاني: الفئة (التوقيع الفضي) */}
        <h2
          style={{
            margin: 0,
            marginTop: '30px', // مسافة تحت الاسم
            color: '#CCCCCC', // فضي معدني
            fontSize: '32px', // حجم أصغر
            fontWeight: '400',
            fontStyle: 'italic', // مائل (ستايل التوقيع)
            letterSpacing: '2px',
            textShadow: '0 2px 5px rgba(0,0,0,0.8)', // ظل أسود للقراءة
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
