import React, { forwardRef } from 'react';

// --- مصفوفة الصور (نفس الكود القديم السليم الذي يعمل معك) ---
// *ملاحظة:* تأكد من أنك قمت بوضع الصورة الجديدة (العريضة) في هذه الملفات الثلاثة
const TIER_IMAGES: Record<string, string> = {
  IMMORTAL: '/images-mint/IMMORTAL.jpg',
  
  // حافظت على التبديل كما طلبت لأنه الكود "السليم" لديك
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
        // 1. الأبعاد الصحيحة (Landscape) بيكسل بيكسل حسب الصورة الأصلية
        width: '1280px',
        height: '832px', 
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
        fontFamily: "'Inter', 'Segoe UI', sans-serif", // خط عصري ونظيف
      }}
    >
      {/* طبقة الصورة الخلفية */}
      <img
        src={imageSrc}
        alt={tier}
        // خاصية الأمان لمنع الكراش (هام جداً)
        crossOrigin="anonymous"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // يضمن تغطية المساحة بالكامل
        }}
      />

      {/* منطقة الكتابة (المسرح) */}
      <div
        style={{
          position: 'absolute',
          // التمركز الدقيق في منتصف الصورة العريضة
          top: '50%', 
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%', // مساحة واسعة للكتابة
          textAlign: 'center',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* السطر الأول: الاسم (البطل) */}
        <h1
          style={{
            margin: 0,
            padding: 0,
            color: '#FFFFFF', 
            // تكبير الخط لأن الصورة أصبحت عريضة وواسعة
            fontSize: '110px', 
            fontWeight: '800', 
            textTransform: 'uppercase',
            letterSpacing: '5px',
            lineHeight: '1',
            // توهج هادئ وأنيق (Classy Glow) وليس مشعاً بقوة
            textShadow: `
              0 0 15px rgba(255, 255, 255, 0.6),
              0 0 30px rgba(0, 255, 255, 0.4)
            `,
          }}
        >
          {name || ''}
        </h1>

        {/* السطر الثاني: الفئة فقط (بدون Edition) */}
        <h2
          style={{
            margin: 0,
            marginTop: '25px', // مسافة بسيطة تحت الاسم
            color: '#D0D0D0', // فضي هادئ
            fontSize: '32px', // حجم متناسق
            fontWeight: '400',
            fontStyle: 'italic', // خط مائل
            letterSpacing: '3px',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)', // ظل للقراءة
            textTransform: 'uppercase', // جعل الفئة حروف كبيرة لتتناسق مع التصميم
          }}
        >
           {/* عرض اسم الفئة كما هو (IMMORTAL, ELITE...) */}
           {tier}
        </h2>
      </div>
    </div>
  );
});

MintTemplate.displayName = 'MintTemplate';

export default MintTemplate;
