'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// تعريف البيانات (سنستخدمها لاحقاً لجميع المؤشرات)
interface NGXData {
  score: number;
  status: string;
  change24h: number;
}

interface WidgetProps {
  type?: 'sentiment' | 'cap' | 'assets'; // لنحدد نوع المؤشر لاحقاً
  title?: string;     // العنوان العلوي (مثل NGX Sentiment)
  subtitle?: string;  // العنوان الفرعي (مثل Market Mood)
}

// دالة رسم القوس (للعداد)
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
}

export default function NGXWidget({ 
  title = 'NGX Sentiment', 
  subtitle = 'Market Mood' 
}: WidgetProps) {
  const [data, setData] = useState<NGXData | null>(null);
  const [mounted, setMounted] = useState(false);

  // الألوان والستايل الزجاجي المتجاوب (Auto Dark/Light)
  // نستخدم CSS Variables أو ألوان RGBA مع Blur للشفافية
  const glassStyle = {
    background: 'rgba(11, 14, 17, 0.4)', // لون داكن شفاف جداً افتراضياً
    backdropFilter: 'blur(8px)',          // تأثير الزجاج المغبش
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.08)', // حدود خفيفة جداً
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  };

  const NEON_GREEN = '#0ecb81';

  useEffect(() => {
    setMounted(true);
    // محاكاة جلب البيانات (سنربطها بالـ API الحقيقي لاحقاً)
    const fetchData = async () => {
      try {
        const res = await fetch('/api/ngx'); 
        if (!res.ok) throw new Error('Fetch failed');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000); 
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !data) return null; 

  // ألوان المؤشرات
  const TICKER_GREEN = '#0ecb81';
  const TICKER_RED = '#f6465d';
  const needleRotation = ((data.score / 100) * 180) - 90;

  // تحديد الحالة واللون
  const currentStatus = (() => {
      if (data.score < 20) return { color: '#e53935', text: 'S.SELL' }; // اختصار الكلمات للجوال
      if (data.score < 40) return { color: '#fb8c00', text: 'SELL' };        
      if (data.score < 60) return { color: '#fdd835', text: 'NEUT' };     
      if (data.score < 80) return { color: '#7cb342', text: 'BUY' };         
      return { color: TICKER_GREEN, text: 'S.BUY' };                  
  })();

  const changeColor = data.change24h >= 0 ? TICKER_GREEN : TICKER_RED;
  const scoreStr = data.score.toFixed(1);
  const [scoreInt, scoreDec] = scoreStr.split('.');

  // رسم العداد (تم تصغيره ليتناسب مع الحجم الجديد)
  const GaugeSVG = () => {
      const radius = 80;
      const stroke = 22; // سمك الخط ليكون واضحاً في الحجم الصغير
      
      return (
        <svg viewBox="-90 -20 180 110" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" overflow="visible">
            {/* الخلفية الملونة للأقواس */}
            <path d={describeArc(0, 80, radius, 0, 36)} fill="none" stroke="#e53935" strokeWidth={stroke} opacity="0.9" />
            <path d={describeArc(0, 80, radius, 36, 72)} fill="none" stroke="#fb8c00" strokeWidth={stroke} opacity="0.9" />
            <path d={describeArc(0, 80, radius, 72, 108)} fill="none" stroke="#fdd835" strokeWidth={stroke} opacity="0.9" />
            <path d={describeArc(0, 80, radius, 108, 144)} fill="none" stroke="#7cb342" strokeWidth={stroke} opacity="0.9" />
            <path d={describeArc(0, 80, radius, 144, 180)} fill="none" stroke={TICKER_GREEN} strokeWidth={stroke} opacity="0.9" />

            {/* الإبرة */}
            <line x1="0" y1="80" x2="0" y2="10" stroke="#FFFFFF" strokeWidth="5" 
                  transform={`rotate(${needleRotation}, 0, 80)`} 
                  style={{ transition: 'transform 1.5s cubic-bezier(0.23, 1, 0.32, 1)', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }} />
            <circle cx="0" cy="80" r="10" fill="#FFFFFF" />
        </svg>
      );
  };

  return (
    <div className="ngx-widget-wrapper">
        <Link href="/ngx" className="text-decoration-none" style={{ cursor: 'pointer', display: 'block', height: '100%' }}>
        
        {/* الكبسولة الزجاجية */}
        <div className="widget-glass d-flex align-items-center justify-content-between px-2 py-1 position-relative overflow-hidden"
            style={{
                ...glassStyle,
                height: '100%', // يأخذ ارتفاع الكونتينر الأب
                width: '100%',
                borderRadius: '8px', // حواف ناعمة
            }}>
            
            {/* القسم النصي (يسار) */}
            <div className="d-flex flex-column justify-content-center h-100 flex-shrink-0" style={{ zIndex: 2, maxWidth: '55%' }}>
                
                {/* العنوان + Live */}
                <div className="d-flex align-items-center gap-1 mb-0">
                    <span className="fw-bold text-nowrap widget-title">{title}</span>
                    <span className="pulse-dot"></span>
                </div>
                <div className="widget-subtitle mb-1">{subtitle}</div>
                
                {/* الأرقام */}
                <div>
                    <div className="d-flex align-items-baseline gap-1" style={{ lineHeight: '1' }}>
                        <div className="fw-bold widget-score">
                            {scoreInt}<span style={{ fontSize: '0.6em', opacity: 0.8 }}>.{scoreDec}</span>
                        </div>
                    </div>
                    {/* التغير والحالة */}
                    <div className="d-flex align-items-center gap-1 mt-1">
                        <span className="fw-bold widget-change" style={{ color: changeColor }}>
                            {data.change24h >= 0 ? 'â–²' : 'â–¼'}
                        </span>
                        <span className="fw-bold widget-status" style={{ color: currentStatus.color }}>
                            {currentStatus.text}
                        </span>
                    </div>
                </div>
            </div>

            {/* قسم الرسم البياني (يمين) */}
            <div className="d-flex align-items-center justify-content-center flex-grow-1" style={{ zIndex: 1, height: '100%' }}>
                <div style={{ width: '100%', height: '85%', position: 'relative', transform: 'translateY(5px)' }}>
                    <GaugeSVG />
                </div>
            </div>
        </div>
        </Link>

        <style jsx global>{`
            /* التحكم في الألوان حسب وضع الجهاز (Dark/Light) */
            @media (prefers-color-scheme: light) {
                .widget-glass {
                    background: rgba(255, 255, 255, 0.6) !important;
                    border: 1px solid rgba(0, 0, 0, 0.05) !important;
                }
                .widget-title { color: #0A192F !important; }
                .widget-subtitle { color: #555 !important; }
                .widget-score { color: #0A192F !important; }
            }

            @media (prefers-color-scheme: dark) {
                .widget-glass {
                    background: rgba(11, 14, 17, 0.4) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                }
                .widget-title { color: #FCD535 !important; } /* لون ذهبي للعنوان في الدارك */
                .widget-subtitle { color: #848E9C !important; }
                .widget-score { color: #FFFFFF !important; }
            }

            /* أحجام الخطوط المصغرة (Compact Typography) */
            .widget-title { font-size: 10px; letter-spacing: 0.3px; }
            .widget-subtitle { font-size: 7px; text-transform: uppercase; }
            .widget-score { font-size: 20px; } /* تم التصغير من 39 */
            .widget-change { font-size: 8px; }
            .widget-status { font-size: 8px; letter-spacing: 0.3px; text-transform: uppercase; }

            .pulse-dot {
                width: 4px; height: 4px; background-color: #0ecb81; border-radius: 50%;
                box-shadow: 0 0 4px #0ecb81;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; }
            }

            .ngx-widget-wrapper {
                width: 100%;
                height: 100%;
                /* هذه هي النقطة السحرية: نمنع العناصر من التمدد خارج حدودها */
                min-width: 0; 
            }
        `}</style>
    </div>
  );
}
