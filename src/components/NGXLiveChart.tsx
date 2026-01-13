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

// تعديل منطق الأيام ليكون الفارق واضحاً بين الفلاتر
const TIMEFRAMES = [
    { label: '1H', value: '1H', days: 1 },      // عرض يوم واحد (بيانات ساعية)
    { label: '4H', value: '4H', days: 7 },      // عرض أسبوع (بيانات ساعية)
    { label: '1D', value: '1D', days: 30 },     // عرض شهر (بيانات 4 ساعات)
    { label: '1W', value: '1W', days: 90 },     // عرض ربع سنة (بيانات يومية)
    { label: '1M', value: '1M', days: 365 },    // عرض سنة (بيانات يومية)
    { label: 'ALL', value: 'ALL', days: 0 }     // عرض كل التاريخ (بيانات يومية)
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
  
  const [activeTimeframe, setActiveTimeframe] = useState('1D'); // الافتراضي 1 شهر
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

  const fetchHistory = async (sectorKey: string) => {
    setIsLoading(true);
    const sectorInfo = SECTORS.find(s => s.key === sectorKey);
    if (!sectorInfo) return;

    try {
        const { data: sectorData, error } = await supabase
            .from('ngx_volume_index')
            .select('timestamp, index_value')
            .eq('sector_key', sectorInfo.dbKey)
            .order('timestamp', { ascending: true }); 

        if (error) throw error;

        const formattedData = sectorData.map((row: any) => ({
            time: Number(row.timestamp),
            value: Number(row.index_value)
        }));

        const uniqueData = formattedData.filter((v, i, a) => i === a.findIndex(t => t.time === v.time));
        setChartData(uniqueData);

    } catch (err) {
        console.error("Failed to fetch history:", err);
    } finally {
        setIsLoading(false);
    }
  };

  const fetchLiveUpdate = async () => {
      await fetchHistory(activeSector);
  };

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
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 6,
        minBarSpacing: 0.5,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        visible: true,
        scaleMargins: { top: 0.2, bottom: 0.1 },
      },
      crosshair: { mode: CrosshairMode.Normal },
      localization: { locale: 'en-US' },
      handleScroll: { vertTouchDrag: false }, 
      handleScale: { axisPressedMouseMove: true },
    });

    const newSeries = chart.addSeries(AreaSeries, {
      lineWidth: 2,
      lineColor: '#C0D860',
      topColor: 'rgba(192, 216, 96, 0.4)',
      bottomColor: 'rgba(192, 216, 96, 0.0)',
      priceLineVisible: false,
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

    fetchHistory(SECTORS[0].key);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    fetchHistory(activeSector);
  }, [activeSector]);

  useEffect(() => {
    if (seriesInstance && chartInstance && chartData.length > 0) {
        const currentSector = SECTORS.find(s => s.key === activeSector);
        if (!currentSector) return;

        seriesInstance.applyOptions({
            lineColor: currentSector.color,
            topColor: `${currentSector.color}66`, 
            bottomColor: `${currentSector.color}00`, 
        });

        // 1. تحديد نوع الفلترة (Resolution) بناءً على الفترة الزمنية
        // هذا هو "السر" لجعل الفلاتر تختلف عن بعضها
        let resolution = 1; // الافتراضي: كل الساعات (1H, 4H)
        
        if (activeTimeframe === '1D') {
             // عند عرض شهر، خذ نقطة كل 4 ساعات لتخفيف الرسم قليلاً
             resolution = 4; 
        } else if (['1W', '1M', 'ALL'].includes(activeTimeframe)) {
             // عند عرض سنوات أو شهور طويلة، خذ نقطة واحدة في اليوم (كل 24 ساعة)
             // هذا يجعل الرسم ناعماً جداً وواضحاً للمدى الطويل
             resolution = 24; 
        }

        const tf = TIMEFRAMES.find(t => t.value === activeTimeframe);
        let filteredData = chartData;

        // تطبيق فلترة الوقت (قص التاريخ)
        if (tf && tf.days > 0) {
            const cutoffTime = Math.floor(Date.now() / 1000) - (tf.days * 24 * 60 * 60);
            filteredData = chartData.filter((d: any) => d.time >= cutoffTime);
        }

        // تطبيق فلترة الكثافة (Resolution Sampling)
        if (resolution > 1) {
            filteredData = filteredData.filter((_, index) => index % resolution === 0);
        }

        // ضبط محور الوقت بناءً على الفلتر
        const isIntraday = ['1H', '4H'].includes(activeTimeframe);
        chartInstance.applyOptions({
            timeScale: {
                tickMarkFormatter: (time: number) => {
                    const date = new Date(time * 1000);
                    if (isIntraday) {
                        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    }
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: activeTimeframe === 'ALL' ? '2-digit' : undefined });
                }
            }
        });

        seriesInstance.setData(filteredData);
        chartInstance.timeScale().fitContent();
    }
  }, [chartData, activeTimeframe, seriesInstance, chartInstance, activeSector]);

  useEffect(() => {
      const interval = setInterval(() => {
          fetchLiveUpdate();
      }, 60000); 

      return () => clearInterval(interval);
  }, [activeSector]);

  const currentColor = SECTORS.find(s => s.key === activeSector)?.color;
  const currentTimeframeLabel = TIMEFRAMES.find(t => t.value === activeTimeframe)?.label;

  return (
    <div className="ngx-chart-glass mb-4">
      <div className="filters-container">
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

        <div className="live-indicator-wrapper d-flex align-items-center">
            {isLoading ? (
                <div className="loading-indicator">
                    <span className="spinner"></span> Syncing...
                </div>
            ) : (
                <div className="live-pulse" style={{ fontSize: '9px', color: '#0ecb81', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#0ecb81', borderRadius: '50%', boxShadow: '0 0 5px #0ecb81' }}></span>
                    LIVE INDEX
                </div>
            )}
        </div>

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

      <div ref={chartContainerRef} className="chart-canvas-wrapper">
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
        
        /* ضبط العرض لتجنب التداخل */
        .sector-wrapper { width: auto; min-width: 150px; max-width: 200px; } 
        
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
        .custom-option:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
        .custom-option:hover { color: var(--hover-color, #fff); }
        .custom-option.selected { background: rgba(255, 255, 255, 0.08); color: #fff; font-weight: 600; }

        .chart-watermark {
            position: absolute;
            bottom: 15px;
            left: 20px;
            font-size: 28px;
            font-weight: 800;
            font-style: italic;
            color: rgba(255, 255, 255, 0.15);
            pointer-events: none;
            z-index: 10;
            user-select: none;
        }

        @media (max-width: 768px) {
            .ngx-chart-glass { padding: 0; border: none; background: transparent; backdrop-filter: none; }
            .chart-canvas-wrapper { height: 350px !important; }
            .filters-container { padding: 5px 0px; margin-bottom: 5px; }
            .custom-select-trigger { font-size: 12px; padding: 6px 8px; }
            .sector-wrapper { flex-grow: 0; width: auto; min-width: 130px; max-width: 180px; margin-right: auto; }
            .time-wrapper { width: auto; min-width: 60px; flex-shrink: 0; }
            .chart-watermark { font-size: 20px; bottom: 10px; left: 15px; }
        }
      `}</style>
    </div>
  );
}
