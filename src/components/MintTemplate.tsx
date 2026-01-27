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
        // الأبعاد الضخمة (2042x1792)
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
        {/* 1. الاسم الرئيسي - التعديل الجراحي للذهب */}
        <h1
          style={{
            margin: '0',
            position: 'absolute',
            // الإحداثيات كما استقررنا عليها (منخفضة ومزاحة لليمين)
            top: 'calc(50% + 70px)',
            left: 'calc(50% + 50px)',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            textAlign: 'center',

            fontSize: '192px',
            fontWeight: '800',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            letterSpacing: '4px',
            lineHeight: '1',

            // --- بداية حقن كود الذهب الجراحي ---

            // 1. جعل لون النص الأساسي شفافاً ليظهر التدرج خلفه
            color: 'transparent',

            // 2. إنشاء التدرج الذهبي المعدني (مستخلص من الصورة الأصلية)
            // يبدأ ببرونز داكن، يمر بذهب غني، ثم لمعة بيضاء ساطعة في الوسط، ويعود للداكن
            backgroundImage: 'linear-gradient(135deg, #8A6E2F 0%, #D4AF37 25%, #FFFACD 50%, #D4AF37 75%, #5A3F11 100%)',

            // 3. قص الخلفية المتدرجة لتظهر فقط داخل حدود النص
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',

            // 4. تعديل الظلال لتناسب الذهب (إزالة الحافة البيضاء وإضافة عمق داكن "يطفو" فوق الطاولة)
            textShadow: `
              0px 10px 20px rgba(0,0,0,0.7),   // ظل متوسط النعومة للعمق
              0px 30px 60px rgba(0,0,0,0.9)    // ظل واسع جداً وداكن ليعطي إحساس الطفو فوق السطح المظلم
            `,

            // --- نهاية حقن كود الذهب الجراحي ---
          }}
        >
          {name || ''}
        </h1>

        {/* 2. السطر السفلي الموحد (الفئة + العبارة) - في المنتصف */}
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',

            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '60px',

            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* الفئة (Tier) */}
          <h2
            style={{
              margin: '0',
              color: '#E0E0E0',
              fontSize: '56px',
              fontWeight: '600',
              fontFamily: "'Times New Roman', serif",
              fontStyle: 'italic',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              textShadow: '0 2px 4px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap',
            }}
          >
             {tier}
          </h2>

          {/* العبارة السفلية */}
          <p
            style={{
              margin: 0,
              color: '#FFFFFF',
              fontSize: '56px',
              fontWeight: '600',
              fontFamily: "'Verdana', sans-serif",
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              textShadow: '0 2px 4px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap',
            }}
          >
            GEN-0 NNM Sovereign Asset
          </p>
        </div>
      </div>
    </div>
  );
});

MintTemplate.displayName = 'MintTemplate';

export default MintTemplate;
