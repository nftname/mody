'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, AreaSeries, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { createClient } from '@supabase/supabase-js';

// --- إعداد اتصال Supabase ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

// --- البيانات الافتتاحية (Hardcoded Data) للظهور الفوري ---
// تم تحويل البيانات التي أرسلتها إلى صيغة يفهمها الرسم البياني فوراً
const INITIAL_HISTORY_DATA = [
  { time: 1483228800, value: 101.796397 }, { time: 1483488000, value: 104.792976 }, { time: 1483747200, value: 106.574411 },
  { time: 1484006400, value: 108.578017 }, { time: 1484265600, value: 110.661348 }, { time: 1484524800, value: 113.715277 },
  { time: 1484784000, value: 117.088432 }, { time: 1485043200, value: 118.399049 }, { time: 1485302400, value: 120.159505 },
  { time: 1485561600, value: 120.398622 }, { time: 1485820800, value: 124.751969 }, { time: 1486080000, value: 124.903443 },
  { time: 1486339200, value: 127.401676 }, { time: 1486598400, value: 130.456428 }, { time: 1486857600, value: 133.890948 },
  { time: 1487116800, value: 134.323593 }, { time: 1487376000, value: 137.930654 }, { time: 1487635200, value: 137.007261 },
  { time: 1487894400, value: 139.343220 }, { time: 1488153600, value: 143.936790 }, { time: 1488412800, value: 147.004081 },
  { time: 1488672000, value: 150.897929 }, { time: 1488931200, value: 156.105124 }, { time: 1489190400, value: 162.293560 },
  { time: 1489449600, value: 163.386555 }, { time: 1489708800, value: 164.005939 }, { time: 1489968000, value: 167.328168 },
  { time: 1490227200, value: 168.209095 }, { time: 1490486400, value: 174.048979 }, { time: 1490745600, value: 176.607319 },
  { time: 1491004800, value: 178.250022 }, { time: 1491264000, value: 179.245106 }, { time: 1491523200, value: 184.107260 },
  { time: 1491782400, value: 188.634416 }, { time: 1492041600, value: 190.478097 }, { time: 1492300800, value: 194.687743 },
  { time: 1492560000, value: 192.873734 }, { time: 1492819200, value: 194.845581 }, { time: 1493078400, value: 197.069336 },
  { time: 1493337600, value: 203.906886 }, { time: 1493596800, value: 203.871686 }, { time: 1493856000, value: 209.996925 },
  { time: 1494115200, value: 218.350555 }, { time: 1494374400, value: 218.210029 }, { time: 1494633600, value: 221.961652 },
  { time: 1494892800, value: 220.823169 }, { time: 1495152000, value: 226.595469 }, { time: 1495411200, value: 228.911734 },
  { time: 1495670400, value: 231.965169 }, { time: 1495929600, value: 231.070266 }, { time: 1496188800, value: 239.786847 },
  { time: 1496448000, value: 243.167328 }, { time: 1496707200, value: 241.672495 }, { time: 1496966400, value: 241.444485 },
  { time: 1497225600, value: 247.520792 }, { time: 1497484800, value: 251.697459 }, { time: 1497744000, value: 252.670527 },
  { time: 1498003200, value: 253.586908 }, { time: 1498262400, value: 259.652772 }, { time: 1498521600, value: 268.718443 },
  { time: 1498780800, value: 270.613283 }, { time: 1499040000, value: 280.173191 }, { time: 1499299200, value: 286.096657 },
  { time: 1499558400, value: 288.086183 }, { time: 1499817600, value: 294.511033 }, { time: 1500076800, value: 300.862193 },
  { time: 1500336000, value: 307.273022 }, { time: 1500595200, value: 313.170189 }, { time: 1500854400, value: 317.016084 },
  { time: 1501113600, value: 327.129562 }, { time: 1501372800, value: 326.916735 }, { time: 1501632000, value: 326.626427 },
  { time: 1501891200, value: 338.607161 }, { time: 1502150400, value: 347.317407 }, { time: 1502409600, value: 355.855843 },
  { time: 1502668800, value: 361.983429 }, { time: 1502928000, value: 376.387023 }, { time: 1503187200, value: 386.372838 },
  { time: 1503446400, value: 394.249446 }, { time: 1503705600, value: 394.951361 }, { time: 1503964800, value: 391.986781 },
  { time: 1504224000, value: 393.574568 }, { time: 1504483200, value: 400.230657 }, { time: 1504742400, value: 402.494721 },
  { time: 1505001600, value: 413.418202 }, { time: 1505260800, value: 427.037213 }, { time: 1505520000, value: 432.409158 },
  { time: 1505779200, value: 448.483579 }, { time: 1506038400, value: 453.922255 }, { time: 1506297600, value: 460.788997 },
  { time: 1506556800, value: 478.699554 }, { time: 1506816000, value: 491.112515 }, { time: 1507075200, value: 496.424328 },
  { time: 1507334400, value: 500.563605 }, { time: 1507593600, value: 504.427147 }, { time: 1507852800, value: 523.303708 },
  { time: 1508112000, value: 538.753985 }, { time: 1508371200, value: 544.753293 }, { time: 1508630400, value: 557.737292 },
  { time: 1508889600, value: 562.464087 }
] as any[];

const SECTORS = [
  { key: 'All NFT Index', color: '#C0D860' },     
  { key: 'Digital Name Assets', color: '#38BDF8' }, 
  { key: 'Art NFT', color: '#7B61FF' },            
  { key: 'Gaming NFT', color: '#0ECB81' },        
  { key: 'Utility NFT', color: '#00D8D6' }         
];

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
  const watermarkRef = useRef<HTMLDivElement>(null); 
  
  // الحالة
  const [activeSector, setActiveSector] = useState(SECTORS[0]);
  const [activeViewMode, setActiveViewMode] = useState(VIEW_MODES[0]); 
  
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [seriesInstance, setSeriesInstance] = useState<ISeriesApi<"Area"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChartBroken, setIsChartBroken] = useState(false); 

  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  
  const sectorRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  // [تعديل هام] تهيئة الذاكرة بالبيانات الموجودة لدينا مسبقاً
  const dataCache = useRef<Record<string, any[]>>({
      'All NFT Index_HISTORY': INITIAL_HISTORY_DATA
  });

  useClickOutside(sectorRef, () => setIsSectorOpen(false));
  useClickOutside(timeRef, () => setIsTimeOpen(false));

  // --- التحميل المسبق لباقي البيانات في الخلفية ---
  useEffect(() => {
    const prefetchAllData = async () => {
        const { data } = await supabase
            .from('ngx_static_chart')
            .select('sector_key, mode, timestamp, value')
            .order('timestamp', { ascending: true });

        if (data) {
            data.forEach((item: any) => {
                const key = `${item.sector_key}_${item.mode}`;
                // لا نكتب فوق البيانات الافتتاحية إذا كانت موجودة بالفعل لضمان السرعة
                if (!dataCache.current[key]) dataCache.current[key] = [];
                
                dataCache.current[key].push({
                    time: Number(item.timestamp) as UTCTimestamp,
                    value: Number(item.value)
                });
            });

            Object.keys(dataCache.current).forEach(key => {
                 // تنظيف البيانات
                 if(key !== 'All NFT Index_HISTORY') { // نستثني البيانات الثابتة من إعادة المعالجة
                     const unique = Array.from(new Map(dataCache.current[key].map(i => [i.time, i])).values());
                     dataCache.current[key] = unique.sort((a, b) => (a.time as number) - (b.time as number));
                 }
            });
        }
    };
    
    // تأخير بسيط جداً في الخلفية
    setTimeout(prefetchAllData, 100);
  }, []);

  const fetchFromDB = async (sectorKey: string, mode: string) => {
    if (!seriesInstance || !chartInstance || isChartBroken) return;
    
    const cacheKey = `${sectorKey}_${mode}`;

    // الفحص في الذاكرة (سيجد البيانات الافتتاحية فوراً)
    if (dataCache.current[cacheKey]) {
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
            const uniqueData = Array.from(new Map(data.map(item => [item['timestamp'], item])).values());
            const formattedData = uniqueData.map((d: any) => ({
                time: Number(d.timestamp) as UTCTimestamp,
                value: Number(d.value)
            }));

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

  // نظام الحماية
  useEffect(() => {
    const checkIntegrity = () => {
        const watermark = watermarkRef.current;
        if (!watermark || watermark.innerText !== 'NNM' || getComputedStyle(watermark).display === 'none' || getComputedStyle(watermark).visibility === 'hidden' || getComputedStyle(watermark).opacity === '0') {
            setIsChartBroken(true);
            if (seriesInstance) seriesInstance.setData([]); 
            if (chartInstance) chartInstance.applyOptions({ layout: { textColor: 'transparent' }, grid: { vertLines: { visible: false }, horzLines: { visible: false } } });
        }
    };
    const intervalId = setInterval(checkIntegrity, 1000);
    const timeoutId = setTimeout(checkIntegrity, 2000);
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.removedNodes) {
                mutation.removedNodes.forEach((node) => {
                    if (node === watermarkRef.current) checkIntegrity();
                });
            }
            if (mutation.target === watermarkRef.current) checkIntegrity();
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

  // تهيئة الرسم البياني
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
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 10, 
        minBarSpacing: 0.5,
        tickMarkFormatter: (time: number, tickMarkType: any, locale: any) => {
            const date = new Date(time * 1000);
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

    // --- [تعديل جوهري] تعيين البيانات فوراً عند الإنشاء ---
    // هذا يضمن ظهور الرسم فوراً بدون انتظار useEffect آخر
    if (activeSector.key === 'All NFT Index' && activeViewMode.value === 'HISTORY') {
        newSeries.setData(INITIAL_HISTORY_DATA);
        chart.timeScale().fitContent();
    }

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

  // تحديث البيانات عند تغيير الفلتر
  useEffect(() => {
    if (seriesInstance && chartInstance && !isChartBroken) {
        seriesInstance.applyOptions({
            lineColor: activeSector.color,
            topColor: `${activeSector.color}66`, 
            bottomColor: `${activeSector.color}00`, 
        });
        
        // إذا كنا في الصفحة الرئيسية (HISTORY) لا تعيد التحميل، البيانات موجودة
        // سيقوم fetchFromDB بفحص الكاش ويجده ممتلئاً ويعود فوراً
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

        {isLoading && !isChartBroken && (
            <div className="loading-indicator">
                <span className="spinner"></span> Updating...
            </div>
        )}

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
            .chart-watermark { 
                font-size: 14px; 
                bottom: 40px; 
                left: 15px; 
            }
        }
      `}</style>
    </div>
  );
}
