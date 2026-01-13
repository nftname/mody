'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, AreaSeries, ISeriesApi } from 'lightweight-charts';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

const SECTORS = [
  { key: 'All NFT Index', dbKey: 'ALL', color: '#C0D860' },     
  { key: 'Digital Name Assets', dbKey: 'NAM', color: '#38BDF8' }, 
  { key: 'Art NFT', dbKey: 'ART', color: '#7B61FF' },            
  { key: 'Gaming NFT', dbKey: 'GAM', color: '#0ECB81' },        
  { key: 'Utility NFT', dbKey: 'UTL', color: '#00D8D6' }         
];

const TIMEFRAMES = [
    { label: '1H', value: '1H', days: 1 },    
    { label: '4H', value: '4H', days: 7 },    
    { label: '1D', value: '1D', days: 30 },   
    { label: '1W', value: '1W', days: 90 },   
    { label: '1M', value: '1M', days: 180 },  
    { label: '1Y', value: '1Y', days: 365 },  
    { label: 'ALL', value: 'ALL', days: 0 }   
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
  
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [activeSector, setActiveSector] = useState(SECTORS[0].key);
  
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [seriesInstance, setSeriesInstance] = useState<ISeriesApi<"Area"> | null>(null);
  const [chartData, setChartData] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false);

  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  
  const sectorRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  useClickOutside(sectorRef, () => setIsSectorOpen(false));
  useClickOutside(timeRef, () => setIsTimeOpen(false));

  // --- 1. جلب البيانات من الداتا بيز فقط ---
  const fetchHistory = async (sectorKey: string) => {
    if (chartData.length === 0) setIsLoading(true);

    const sectorInfo = SECTORS.find(s => s.key === sectorKey);
    if (!sectorInfo) return;

    try {
        const { data: sectorData, error } = await supabase
            .from('ngx_chart_history')
            .select('timestamp, value')
            .eq('sector_key', sectorInfo.dbKey)
            .order('timestamp', { ascending: true });

        if (error) throw error;

        if (!sectorData || sectorData.length === 0) {
            setChartData([]);
            return;
        }

        const formattedData = sectorData.map((row: any) => ({
            time: Math.floor(row.timestamp / 1000), 
            value: Number(row.value)
        }));

        const uniqueData = formattedData.filter((v, i, a) => i === a.findIndex(t => t.time === v.time));
        setChartData(uniqueData);

    } catch (err) {
        console.error("Failed to fetch history:", err);
    } finally {
        setIsLoading(false);
    }
  };

  // --- 2. إعداد الشارت ---
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#B0B0B0',
        fontFamily: '"Inter", sans-serif',
        fontSize: 10, // خط أصغر قليلاً ليناسب الموبايل
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        // تفعيل التمدد والزوم (Pro Features)
        fixLeftEdge: false, 
        fixRightEdge: false,
        rightOffset: 15,
        minBarSpacing: 0.1,
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
        },
        horzLine: {
            color: 'rgba(255, 255, 255, 0.3)',
            width: 1,
            style: 3,
            labelBackgroundColor: '#242424',
        },
      },
      // تفعيل التحكم باللمس والماوس
      handleScroll: { 
          vertTouchDrag: false,
          horzTouchDrag: true, 
          pressedMouseMove: true,
          mouseWheel: true
      }, 
      handleScale: { 
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true 
      },
    });

    const newSeries = chart.addSeries(AreaSeries, {
      lineWidth: 2,
      lineColor: '#C0D860',
      topColor: 'rgba(192, 216, 96, 0.4)',
      bottomColor: 'rgba(192, 216, 96, 0.0)',
    });

    setChartInstance(chart);
    setSeriesInstance(newSeries);

    const handleResize = () => {
      if (chartContainerRef.current) {
        const isMobile = window.innerWidth <= 768;
        // تقليل الارتفاع في الموبايل لترك مساحة للتاريخ
        chart.applyOptions({ 
            width: chartContainerRef.current.clientWidth,
            height: isMobile ? 320 : 400 
        });
      }
    };
    
    handleResize(); // نداء فوري لضبط الحجم
    window.addEventListener('resize', handleResize);
    fetchHistory(SECTORS[0].key);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // --- 3. إعادة الجلب ---
  useEffect(() => {
    setChartData([]); 
    fetchHistory(activeSector);
  }, [activeSector]);

  // --- 4. المنطق الذكي للتاريخ والفلترة ---
  useEffect(() => {
    if (seriesInstance && chartInstance && chartData.length > 0) {
        const currentSector = SECTORS.find(s => s.key === activeSector);
        if (!currentSector) return;

        seriesInstance.applyOptions({
            lineColor: currentSector.color,
            topColor: `${currentSector.color}66`, 
            bottomColor: `${currentSector.color}00`, 
        });

        // *** تنسيق التواريخ الذكي (Smart Formatting) ***
        chartInstance.applyOptions({
            timeScale: {
                tickMarkFormatter: (time: number) => {
                    const date = new Date(time * 1000);
                    // 1. فريمات الساعة: عرض الوقت
                    if (['1H', '4H'].includes(activeTimeframe)) {
                        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                    }
                    // 2. فريمات السنة والكل: عرض الشهر والسنة (لإظهار السنة كما طلبت)
                    if (['1M', '1Y', 'ALL'].includes(activeTimeframe)) {
                         return `${date.toLocaleString('en-US', { month: 'short' })} '${date.getFullYear().toString().slice(-2)}`;
                    }
                    // 3. الباقي: يوم وشهر
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
            },
            localization: {
                timeFormatter: (timestamp: number) => {
                     return new Date(timestamp * 1000).toLocaleString('en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit', hour12: false 
                    }); 
                }
            }
        });

        const tf = TIMEFRAMES.find(t => t.value === activeTimeframe);
        let filteredData = chartData;

        if (tf && tf.days > 0) {
            const cutoffTime = Math.floor(Date.now() / 1000) - (tf.days * 24 * 60 * 60);
            filteredData = chartData.filter((d: any) => d.time >= cutoffTime);
        }

        seriesInstance.setData(filteredData);
        chartInstance.timeScale().fitContent();
    }
  }, [chartData, activeTimeframe, seriesInstance, chartInstance, activeSector]);

  // --- 5. تحديث تلقائي ---
  useEffect(() => {
      const interval = setInterval(() => {
          fetchHistory(activeSector);
      }, 60000); 
      return () => clearInterval(interval);
  }, [activeSector]);

  const currentColor = SECTORS.find(s => s.key === activeSector)?.color;
  const currentTimeframeLabel = TIMEFRAMES.find(t => t.value === activeTimeframe)?.label;

  return (
    <div className="ngx-chart-glass mb-4">
      <div className="filters-container">
        
        {/* Sector Dropdown */}
        <div className="filter-wrapper sector-wrapper" ref={sectorRef}>
           <div 
             className={`custom-select-trigger ${isSectorOpen ? 'open' : ''}`} 
             onClick={() => setIsSectorOpen(!isSectorOpen)}
             style={{ color: currentColor }}
           >
              <span className="text-truncate">{activeSector}</span>
              <span className="arrow">▼</span>
           </div>
           
           {isSectorOpen && (
             <div className="custom-options">
               {SECTORS.map((s) => (
                 <div 
                    key={s.key} 
                    className={`custom-option ${activeSector === s.key ? 'selected' : ''}`}
                    onClick={() => {
                        setActiveSector(s.key);
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

        {/* Live Indicator */}
        <div className="live-indicator-wrapper d-flex align-items-center">
            {isLoading && chartData.length === 0 ? (
                <div className="loading-indicator">
                    <span className="spinner"></span> Syncing...
                </div>
            ) : (
                <div className="live-pulse" style={{ fontSize: '9px', color: '#0ecb81', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#0ecb81', borderRadius: '50%', boxShadow: '0 0 5px #0ecb81' }}></span>
                    LIVE DATA
                </div>
            )}
        </div>

        {/* Timeframe Dropdown */}
        <div className="filter-wrapper time-wrapper ms-2" ref={timeRef}>
            <div 
             className={`custom-select-trigger time-trigger ${isTimeOpen ? 'open' : ''}`} 
             onClick={() => setIsTimeOpen(!isTimeOpen)}
            >
              <span>{currentTimeframeLabel}</span>
              <span className="arrow ms-1">▼</span>
           </div>
           
           {isTimeOpen && (
             <div className="custom-options time-options">
               {TIMEFRAMES.map((tf) => (
                 <div 
                    key={tf.value} 
                    className={`custom-option ${activeTimeframe === tf.value ? 'selected' : ''}`}
                    onClick={() => {
                        setActiveTimeframe(tf.value);
                        setIsTimeOpen(false);
                    }}
                 >
                    {tf.label}
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      <div ref={chartContainerRef} className="chart-canvas-wrapper" />
      
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
            /* إضافة مهمة لحل مشكلة اختفاء التواريخ في الموبايل */
            display: flex;
            flex-direction: column;
        }
        .chart-canvas-wrapper { 
            width: 100%; 
            height: 400px;
            /* نعطي مساحة في الأسفل للتواريخ */
            padding-bottom: 5px; 
        }
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
        .sector-wrapper { width: auto; min-width: 200px; max-width: 280px; }
        .time-wrapper { width: auto; min-width: 70px; }
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
        .custom-option:hover { color: var(--hover-color, #fff); background: rgba(255, 255, 255, 0.05); }
        .custom-option.selected { background: rgba(255, 255, 255, 0.08); color: #fff; font-weight: 600; }
        
        @media (max-width: 768px) {
            .ngx-chart-glass { padding: 0; border: none; background: transparent; backdrop-filter: none; }
            .chart-canvas-wrapper { height: 320px !important; } /* ارتفاع مناسب للموبايل */
            .filters-container { padding: 5px 0px; margin-bottom: 5px; }
            .custom-select-trigger { font-size: 12px; padding: 6px 8px; }
            .sector-wrapper { flex-grow: 0; width: 55%; max-width: 190px; margin-right: auto; }
            .time-wrapper { width: auto; min-width: 60px; flex-shrink: 0; }
        }
      `}</style>
    </div>
  );
}
