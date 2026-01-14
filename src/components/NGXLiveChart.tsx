'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, AreaSeries, ISeriesApi, UTCTimestamp } from 'lightweight-charts';

// --- إعدادات القطاعات والألوان ---
const SECTORS = [
  { key: 'All NFT Index', color: '#C0D860' },     
  { key: 'Digital Name Assets', color: '#38BDF8' }, 
  { key: 'Art NFT', color: '#7B61FF' },            
  { key: 'Gaming NFT', color: '#0ECB81' },        
  { key: 'Utility NFT', color: '#00D8D6' }         
];

// --- إعدادات الفلتر الزمني ---
const VIEW_MODES = [
    { label: '2017 - 2026', value: 'HISTORY' },
    { label: '2026 - 2030', value: 'FORECAST' }
];

// --- محرك المحاكاة ---
function generateSimulation(sectorKey: string, mode: string) {
    const data = [];
    let date = mode === 'HISTORY' ? new Date('2017-01-01') : new Date('2026-01-15');
    const endDate = mode === 'HISTORY' ? new Date('2026-01-14') : new Date('2030-12-31');
    
    let value = 100;
    let volatility = 0.05;

    if (sectorKey.includes('Name')) { value = 40; volatility = 0.07; }
    if (sectorKey.includes('Art')) { value = 80; volatility = 0.15; }
    if (sectorKey.includes('Gaming')) { value = 60; volatility = 0.10; }
    
    if (mode === 'FORECAST') value = sectorKey.includes('Name') ? 1200 : 800;

    while (date <= endDate) {
        const year = date.getFullYear();
        let trend = 1.00;

        if (mode === 'HISTORY') {
            if (year === 2017) trend = 1.015;
            if (year >= 2018 && year < 2020) trend = 0.997;
            if (year === 2020) trend = 1.008;
            if (year === 2021) trend = 1.025;
            if (year === 2022) trend = 0.982;
            if (year === 2023) trend = 0.998;
            if (year >= 2024) trend = 1.010;
        } else {
            trend = 1.006; 
        }

        const randomMove = 1 + (Math.random() - 0.5) * volatility;
        value = value * trend * randomMove;
        if (value < 10) value = 10;

        data.push({
            time: (date.getTime() / 1000) as UTCTimestamp,
            value: value
        });

        date.setDate(date.getDate() + 3);
    }
    return data;
}

// --- دالة إغلاق القوائم ---
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
  
  const [activeSector, setActiveSector] = useState(SECTORS[0]);
  const [activeViewMode, setActiveViewMode] = useState(VIEW_MODES[0]);
  
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [seriesInstance, setSeriesInstance] = useState<ISeriesApi<"Area"> | null>(null);

  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const sectorRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  useClickOutside(sectorRef, () => setIsSectorOpen(false));
  useClickOutside(timeRef, () => setIsTimeOpen(false));

  // 1. تهيئة الرسم البياني
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#B0B0B0', fontFamily: '"Inter", sans-serif', fontSize: 11 },
      grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(255, 255, 255, 0.05)' } },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        visible: true, timeVisible: true, secondsVisible: false,
        barSpacing: 6, minBarSpacing: 0.5,
        // تم إزالة bottomOffset لحل مشكلة الخطأ الأحمر
      },
      rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.1)', visible: true, scaleMargins: { top: 0.2, bottom: 0.2 } },
      crosshair: { mode: CrosshairMode.Normal },
      localization: { locale: 'en-US' },
      handleScroll: { vertTouchDrag: false }, 
      handleScale: { axisPressedMouseMove: true },
    });

    const newSeries = chart.addSeries(AreaSeries, {
      lineWidth: 2,
      lineColor: activeSector.color,
      topColor: `${activeSector.color}66`,
      bottomColor: `${activeSector.color}00`,
      priceLineVisible: false,
    });

    setChartInstance(chart);
    setSeriesInstance(newSeries);

    const handleResize = () => {
      if (chartContainerRef.current) {
         const isMobile = window.innerWidth <= 768;
         chart.applyOptions({ 
             width: chartContainerRef.current.clientWidth,
             height: isMobile ? 350 : 400 
         });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, []);

  // 2. تحديث البيانات
  useEffect(() => {
      if (!seriesInstance || !chartInstance) return;

      seriesInstance.applyOptions({
          lineColor: activeSector.color,
          topColor: `${activeSector.color}66`,
          bottomColor: `${activeSector.color}00`,
      });

      const data = generateSimulation(activeSector.key, activeViewMode.value);
      seriesInstance.setData(data);
      chartInstance.timeScale().fitContent();

  }, [activeSector, activeViewMode, seriesInstance, chartInstance]);

  return (
    <div className="ngx-chart-glass mb-4">
      <div className="filters-container">
        
        {/* فلتر القطاعات */}
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
                    onClick={() => { setActiveSector(s); setIsSectorOpen(false); }}
                    style={{ '--hover-color': s.color } as React.CSSProperties}
                 >
                    {s.key}
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* فلتر الزمن (يمين) */}
        <div className="filter-wrapper time-wrapper" ref={timeRef} style={{ minWidth: '110px' }}>
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
                    onClick={() => { setActiveViewMode(mode); setIsTimeOpen(false); }}
                 >
                    {mode.label}
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      <div ref={chartContainerRef} className="chart-canvas-wrapper">
          {/* العلامة المائية NNM: أبيض بنسبة 80% */}
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
        .filter-wrapper { position: relative; }
        .sector-wrapper { width: auto; min-width: 140px; max-width: 180px; } 
        
        .custom-select-trigger {
            display: flex; justify-content: space-between; align-items: center;
            padding: 6px 10px; font-size: 12px; font-weight: 700;
            color: #E0E0E0; background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px;
            cursor: pointer; transition: all 0.3s ease; user-select: none; white-space: nowrap;
        }
        .custom-select-trigger:hover { background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.15); }
        .arrow { font-size: 8px; opacity: 0.7; }
        .custom-options {
            position: absolute; top: 100%; left: 0; min-width: 100%;
            background: rgba(30, 30, 30, 0.95); backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px;
            margin-top: 4px; overflow: hidden; z-index: 100;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .time-options { right: 0; left: auto; }
        .custom-option {
            padding: 8px 10px; font-size: 11px; color: #B0B0B0; cursor: pointer;
            transition: background 0.2s, color 0.2s; border-bottom: 1px solid rgba(255,255,255,0.02);
            text-align: left; white-space: nowrap;
        }
        .custom-option:last-child { border-bottom: none; }
        .custom-option:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
        .custom-option:hover { color: var(--hover-color, #fff); }
        .custom-option.selected { background: rgba(255, 255, 255, 0.08); color: #fff; font-weight: 600; }

        /* العلامة المائية: لون أبيض بنسبة 80% */
        .chart-watermark {
            position: absolute;
            bottom: 35px;
            left: 20px;
            font-size: 20px;
            font-weight: 900;
            font-style: italic;
            color: rgba(255, 255, 255, 0.8); /* تم التعديل هنا لنسبة 80% */
            pointer-events: none;
            z-index: 10;
            user-select: none;
            letter-spacing: 1px;
        }

        @media (max-width: 768px) {
            .ngx-chart-glass { padding: 0; border: none; background: transparent; backdrop-filter: none; }
            .chart-canvas-wrapper { height: 350px !important; }
            .filters-container { padding: 5px 0px; margin-bottom: 5px; }
            .custom-select-trigger { font-size: 11px; padding: 6px 8px; }
            .sector-wrapper { flex-grow: 0; width: auto; min-width: 120px; max-width: 150px; margin-right: auto; }
            .chart-watermark { font-size: 16px; bottom: 30px; left: 15px; }
        }
      `}</style>
    </div>
  );
}
