'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, AreaSeries, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { createClient } from '@supabase/supabase-js';

// --- إعداد اتصال Supabase ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

const SECTORS = [
  { key: 'All NFT Index', color: '#C0D860' },     
  { key: 'Digital Name Assets', color: '#38BDF8' }, 
  { key: 'Art NFT', color: '#7B61FF' },            
  { key: 'Gaming NFT', color: '#0ECB81' },        
  { key: 'Utility NFT', color: '#00D8D6' }         
];

// --- الفلاتر الجديدة المطلوبة ---
const VIEW_MODES = [
    { label: '2017 - 2026', value: 'HISTORY' },
    { label: '2026 - 2030', value: 'FORECAST' }
];

function useClickOutside(ref: any, handler: any) {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export default function NGXLiveChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null); // مرجع للعلامة المائية للحماية
  
  // الحالة (State)
  const [activeSector, setActiveSector] = useState(SECTORS[0]);
  const [activeViewMode, setActiveViewMode] = useState(VIEW_MODES[0]); 
  
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [seriesInstance, setSeriesInstance] = useState<ISeriesApi<"Area"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChartBroken, setIsChartBroken] = useState(false); // حالة لكسر الرسم البياني عند التلاعب

  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  
  const sectorRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  // [تعديل 1: إضافة مرجع الذاكرة المؤقتة]
  // هذا المتغير سيحفظ البيانات ولن يمسحها عند إعادة الرسم
  const dataCache = useRef<Record<string, any[]>>({});

  useClickOutside(sectorRef, () => setIsSectorOpen(false));
  useClickOutside(timeRef, () => setIsTimeOpen(false));

  // --- الموتور الجديد: الجلب من ngx_static_chart ---
  const fetchFromDB = async (sectorKey: string, mode: string) => {
    if (!seriesInstance || !chartInstance || isChartBroken) return; // لا تجلب بيانات إذا كان الرسم مكسوراً
    
    // [تعديل 2: الفحص في الذاكرة أولاً]
    const cacheKey = `${sectorKey}_${mode}`;
    if (dataCache.current[cacheKey]) {
        // إذا البيانات موجودة، استخدمها فوراً ولا تتصل بالسيرفر
        seriesInstance.setData(dataCache.current[cacheKey]);
        chartInstance.timeScale().fitContent();
        return; 
    }

    setIsLoading(true);

    try {
        const { data, error } = await supabase
            .from('ngx_static_chart')
            .select('timestamp, value')
            .eq('sector_key', sectorKey)
            .eq('mode', mode)
            .order('timestamp', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
            // إزالة التكرار (Cleaning)
            const uniqueData = Array.from(new Map(data.map(item => [item['timestamp'], item])).values());
            
            const formattedData = uniqueData.map((d: any) => ({
                time: Number(d.timestamp) as UTCTimestamp,
                value: Number(d.value)
            }));

            // [تعديل 3: حفظ البيانات في الذاكرة للمستقبل]
            dataCache.current[cacheKey] = formattedData;

            seriesInstance.setData(formattedData);
            chartInstance.timeScale().fitContent();
        } else {
            seriesInstance.setData([]);
        }

    } catch (err) {
        console.error("Failed to fetch chart data:", err);
    } finally {
        setIsLoading(false);
    }
  };

  // --- نظام الحماية (Security System) ---
  useEffect(() => {
    // دالة التحقق من سلامة العلامة المائية
    const checkIntegrity = () => {
        const watermark = watermarkRef.current;
        // شروط الحماية: يجب أن يكون العنصر موجوداً، ويحتوي على النص الصحيح، ويكون مرئياً
        if (!watermark || watermark.innerText !== 'NNM' || getComputedStyle(watermark).display === 'none' || getComputedStyle(watermark).visibility === 'hidden' || getComputedStyle(watermark).opacity === '0') {
            // إذا تم التلاعب، اكسر الرسم البياني
            setIsChartBroken(true);
            if (seriesInstance) seriesInstance.setData([]); // مسح البيانات
            if (chartInstance) chartInstance.applyOptions({ layout: { textColor: 'transparent' }, grid: { vertLines: { visible: false }, horzLines: { visible: false } } }); // إخفاء المحاور والشبكة
        }
    };

    // تشغيل التحقق بشكل دوري كل ثانية
    const intervalId = setInterval(checkIntegrity, 1000);

    // تحقق أولي بعد وقت قصير لضمان التحميل
    const timeoutId = setTimeout(checkIntegrity, 2000);
    
    // مراقب التغييرات في الـ DOM (MutationObserver) لحماية أقوى
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.removedNodes) {
                mutation.removedNodes.forEach((node) => {
                    if (node === watermarkRef.current) {
                        checkIntegrity(); // تحقق فوراً عند الحذف
                    }
                });
            }
            if (mutation.target === watermarkRef.current) {
                 checkIntegrity(); // تحقق عند تعديل خصائص العنصر
            }
        });
    });
    
    if (chartContainerRef.current && watermarkRef.current) {
        observer.observe(chartContainerRef.current, { childList: true, subtree: true });
        observer.observe(watermarkRef.current, { attributes: true, attributeFilter: ['style', 'class'] });
    }


    return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        observer.disconnect();
    };
  }, [chartInstance, seriesInstance]);


  // 1. تهيئة الرسم البياني (باستخدام إعدادات الكود القديم حرفياً)
  useEffect(() => {
    if (!chartContainerRef.current || isChartBroken) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#B0B0B0',
        fontFamily: '"Inter", sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      
      // --- هنا السر: إعدادات الوقت من الكود القديم لضمان عمل الجوال ---
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        // هذه الإعدادات هي التي تضبط الجوال
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 10, 
        minBarSpacing: 0.5,
        
        // تنسيق التاريخ (تم تعديله ليظهر السنة لأننا نعرض تاريخاً طويلاً)
        tickMarkFormatter: (time: number, tickMarkType: any, locale: any) => {
            const date = new Date(time * 1000);
            // يظهر: Jan '24
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: { top: 0.2, bottom: 0.2 },
        visible: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
            color: 'rgba(255, 255, 255, 0.3)',
            width: 1,
            style: 3,
            labelBackgroundColor: '#242424',
            labelVisible: true,
        },
        horzLine: {
            color: 'rgba(255, 255, 255, 0.3)',
            width: 1,
            style: 3,
            labelBackgroundColor: '#242424',
            labelVisible: true,
        },
      },
      localization: { 
          locale: 'en-US',
      },
      handleScroll: { vertTouchDrag: false }, 
      handleScale: { axisPressedMouseMove: true },
    });

    const newSeries = chart.addSeries(AreaSeries, {
      lineWidth: 2,
      lineColor: activeSector.color,
      topColor: `${activeSector.color}66`, 
      bottomColor: `${activeSector.color}00`,
    });

    setChartInstance(chart);
    setSeriesInstance(newSeries);

    const handleResize = () => {
      if (chartContainerRef.current) {
        const isMobile = window.innerWidth <= 768;
        const newHeight = isMobile ? 350 : 400; 
        chart.applyOptions({ 
            width: chartContainerRef.current.clientWidth,
            height: newHeight 
        });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [isChartBroken]);

  // 2. تحديث البيانات عند تغيير الفلتر
  useEffect(() => {
    if (seriesInstance && chartInstance && !isChartBroken) {
        // تحديث الألوان
        seriesInstance.applyOptions({
            lineColor: activeSector.color,
            topColor: `${activeSector.color}66`, 
            bottomColor: `${activeSector.color}00`, 
        });

        // جلب البيانات الجديدة
        fetchFromDB(activeSector.key, activeViewMode.value);
    }
  }, [activeSector, activeViewMode, seriesInstance, chartInstance, isChartBroken]);

  return (
    <div className="ngx-chart-glass mb-4" style={{ position: 'relative' }}>
      {isChartBroken && (
          <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              background: 'rgba(0,0,0,0.8)', color: 'red', fontWeight: 'bold', zIndex: 100,
              flexDirection: 'column', textAlign: 'center', padding: '20px'
          }}>
              <div>⚠️ Security Violation Detected ⚠️</div>
              <div style={{ fontSize: '12px', marginTop: '10px', color: '#ccc' }}>chart disabled due to tampering.</div>
          </div>
      )}
      <div className="filters-container" style={{ opacity: isChartBroken ? 0.2 : 1, pointerEvents: isChartBroken ? 'none' : 'auto' }}>
        
        {/* Sector Filter */}
        <div className="filter-wrapper sector-wrapper" ref={sectorRef}>
           <div 
             className={`custom-select-trigger ${isSectorOpen ? 'open' : ''}`} 
             onClick={() => setIsSectorOpen(!isSectorOpen)}
             style={{ color: activeSector.color }}
           >
              <span className="text-truncate">{activeSector.key}</span>
              <span className="arrow">▼</span>
           </div>
           
           {isSectorOpen && (
             <div className="custom-options">
               {SECTORS.map((s) => (
                 <div 
                    key={s.key} 
                    className={`custom-option ${activeSector.key === s.key ? 'selected' : ''}`}
                    onClick={() => {
                        setActiveSector(s);
                        setIsSectorOpen(false);
                    }}
                    style={{ '--hover-color': s.color } as React.CSSProperties}
                 >
                    {s.key}
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Loading Indicator (بسيط كما في الكود القديم) */}
        {isLoading && !isChartBroken && (
            <div className="loading-indicator">
                <span className="spinner"></span> Updating...
            </div>
        )}

        {/* View Mode Filter (New) */}
        <div className="filter-wrapper time-wrapper ms-2" ref={timeRef} style={{ minWidth: '110px' }}>
            <div 
             className={`custom-select-trigger time-trigger ${isTimeOpen ? 'open' : ''}`} 
             onClick={() => setIsTimeOpen(!isTimeOpen)}
            >
              <span>{activeViewMode.label}</span>
              <span className="arrow ms-1">▼</span>
           </div>
           
           {isTimeOpen && (
             <div className="custom-options time-options" style={{ minWidth: '100%' }}>
               {VIEW_MODES.map((mode) => (
                 <div 
                    key={mode.value} 
                    className={`custom-option ${activeViewMode.value === mode.value ? 'selected' : ''}`}
                    onClick={() => {
                        setActiveViewMode(mode);
                        setIsTimeOpen(false);
                    }}
                 >
                    {mode.label}
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      <div ref={chartContainerRef} className="chart-canvas-wrapper" style={{ position: 'relative', opacity: isChartBroken ? 0.2 : 1 }}>
          {/* العلامة المائية NNM - مربوطة بمرجع للحماية */}
          <div ref={watermarkRef} className="chart-watermark" style={{ userSelect: 'none', pointerEvents: 'none' }}>NNM</div>
      </div>
      
      <div className="text-end px-2 pb-2" style={{ opacity: isChartBroken ? 0.2 : 1 }}>
          <small className="text-muted fst-italic" style={{ fontSize: '10px' }}>
              * Powered by NGX Engine Volume Index.
          </small>
      </div>

      <style jsx>{`
        .ngx-chart-glass {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 15px;
            width: 100%;
            /* position: relative;  <-- moved to inline style for safety box */
            min-height: 400px;
            overflow: hidden;
        }
        .chart-canvas-wrapper :global(a[href*="tradingview"]) { display: none !important; }
        .chart-canvas-wrapper { width: 100%; height: 400px; position: relative; }
        .filters-container {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 15px; padding: 0 10px; position: relative; z-index: 50;
        }
        .loading-indicator { font-size: 10px; color: #666; display: flex; align-items: center; gap: 5px; }
        .spinner {
            width: 8px; height: 8px; border: 1px solid #666;
            border-top-color: transparent; border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .filter-wrapper { position: relative; }
        .sector-wrapper { width: auto; min-width: 140px; max-width: 180px; } 
        
        .custom-select-trigger {
            display: flex; justify-content: space-between; align-items: center;
            padding: 6px 12px; font-size: 13px; font-weight: 700;
            color: #E0E0E0; background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px;
            cursor: pointer; transition: all 0.3s ease; user-select: none; white-space: nowrap;
        }
        .custom-select-trigger:hover { background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.15); }
        .time-trigger { justify-content: center; font-weight: 600; }
        .arrow { font-size: 8px; opacity: 0.7; }
        .custom-options {
            position: absolute; top: 100%; left: 0; min-width: 100%;
            background: rgba(30, 30, 30, 0.95); backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px;
            margin-top: 4px; overflow: hidden; z-index: 100;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .time-options { right: 0; left: auto; width: 100%; }
        .custom-option {
            padding: 8px 10px; font-size: 12px; color: #B0B0B0; cursor: pointer;
            transition: background 0.2s, color 0.2s; border-bottom: 1px solid rgba(255,255,255,0.02);
            text-align: left; white-space: nowrap;
        }
        .time-options .custom-option { text-align: center; }
        .custom-option:last-child { border-bottom: none; }
        .custom-option:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
        .custom-option:hover { color: var(--hover-color, #fff); }
        .custom-option.selected { background: rgba(255, 255, 255, 0.08); color: #fff; font-weight: 600; }

        /* تنسيق العلامة المائية الافتراضي (للكمبيوتر) */
        .chart-watermark {
            position: absolute;
            bottom: 35px;
            left: 20px;
            font-size: 20px;
            font-weight: 900;
            font-style: italic;
            color: rgba(255, 255, 255, 0.8);
            pointer-events: none;
            z-index: 10;
            user-select: none;
            letter-spacing: 1px;
        }

        /* --- التعديل المطلوب: رفع العلامة المائية في الجوال --- */
        @media (max-width: 768px) {
            .ngx-chart-glass { padding: 0; border: none; background: transparent; backdrop-filter: none; }
            .chart-canvas-wrapper { height: 350px !important; }
            .filters-container { padding: 5px 0px; margin-bottom: 5px; }
            .custom-select-trigger { font-size: 12px; padding: 6px 8px; }
            .sector-wrapper { flex-grow: 0; width: auto; min-width: 120px; max-width: 150px; margin-right: auto; }
            .time-wrapper { width: auto; min-width: 60px; flex-shrink: 0; }
            /* تم رفع العلامة المائية هنا لتكون فوق خط التاريخ */
            .chart-watermark { 
                font-size: 14px; 
                bottom: 40px; /* <-- تم التعديل لرفعها فوق الخط */
                left: 15px; 
            }
        }
      `}</style>
    </div>
  );
}
