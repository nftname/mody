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
  
  // الحالة (State)
  const [activeSector, setActiveSector] = useState(SECTORS[0]);
  const [activeViewMode, setActiveViewMode] = useState(VIEW_MODES[0]); // الوضع الافتراضي: التاريخ
  
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [seriesInstance, setSeriesInstance] = useState<ISeriesApi<"Area"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  
  const sectorRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  useClickOutside(sectorRef, () => setIsSectorOpen(false));
  useClickOutside(timeRef, () => setIsTimeOpen(false));

  // --- الموتور الجديد: الجلب من ngx_static_chart ---
  const fetchFromDB = async (sectorKey: string, mode: string) => {
    if (!seriesInstance || !chartInstance) return;
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

  // 1. تهيئة الرسم البياني (باستخدام إعدادات الكود القديم حرفياً)
  useEffect(() => {
    if (!chartContainerRef.current) return;

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
  }, []);

  // 2. تحديث البيانات عند تغيير الفلتر
  useEffect(() => {
    if (seriesInstance && chartInstance) {
        // تحديث الألوان
        seriesInstance.applyOptions({
            lineColor: activeSector.color,
            topColor: `${activeSector.color}66`, 
            bottomColor: `${activeSector.color}00`, 
        });

        // جلب البيانات الجديدة
        fetchFromDB(activeSector.key, activeViewMode.value);
    }
  }, [activeSector, activeViewMode, seriesInstance, chartInstance]);

  return (
    <div className="ngx-chart-glass mb-4">
      <div className="filters-container">
        
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
        {isLoading && (
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

      <div ref={chartContainerRef} className="chart-canvas-wrapper" style={{ position: 'relative' }}>
          {/* العلامة المائية NNM */}
          <div className="chart-watermark">NNM</div>
      </div>
      
      <div className="text-end px-2 pb-2">
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
            position: relative;
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

        @media (max-width: 768px) {
            .ngx-chart-glass { padding: 0; border: none; background: transparent; backdrop-filter: none; }
            .chart-canvas-wrapper { height: 350px !important; }
            .filters-container { padding: 5px 0px; margin-bottom: 5px; }
            .custom-select-trigger { font-size: 12px; padding: 6px 8px; }
            .sector-wrapper { flex-grow: 0; width: auto; min-width: 120px; max-width: 150px; margin-right: auto; }
            .time-wrapper { width: auto; min-width: 60px; flex-shrink: 0; }
            .chart-watermark { font-size: 14px; bottom: 12px; left: 15px; }
        }
      `}</style>
    </div>
  );
}
