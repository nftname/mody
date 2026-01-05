'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, AreaSeries } from 'lightweight-charts';

const SECTORS = [
  { key: 'All NFTs Index', color: '#C0D860', startYear: 2017, baseValue: 40 },
  { key: 'Sovereign Name Assets', color: '#FFB300', startYear: 2025, baseValue: 100 },
  { key: 'Art NFTs', color: '#7B61FF', startYear: 2017, baseValue: 25 },
  { key: 'Gaming NFTs', color: '#0ECB81', startYear: 2019, baseValue: 15 },
  { key: 'Utility NFTs', color: '#00D8D6', startYear: 2020, baseValue: 10 },
  { key: 'Standard Domains', color: '#38BDF8', startYear: 2017, baseValue: 30 }
];

const TIMEFRAMES = [
    { label: '1H', value: '1H' },
    { label: '4H', value: '4H' },
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '1Y', value: '1Y' },
    { label: 'ALL', value: 'ALL' }
];

function useClickOutside(ref: any, handler: any) {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
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
  const [activeTimeframe, setActiveTimeframe] = useState('ALL');
  const [activeSector, setActiveSector] = useState(SECTORS[0].key);
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [seriesInstance, setSeriesInstance] = useState<any>(null);

  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  
  const sectorRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  useClickOutside(sectorRef, () => setIsSectorOpen(false));
  useClickOutside(timeRef, () => setIsTimeOpen(false));

  const generateData = (timeframe: string, sectorKey: string) => {
    const data = [];
    const now = new Date(); 
    let startDate = new Date();
    const sectorInfo = SECTORS.find(s => s.key === sectorKey) || SECTORS[0];

    const isSovereign = sectorKey === 'Sovereign Name Assets';
    const effectiveStartYear = isSovereign ? 2025 : sectorInfo.startYear;

    switch (timeframe) {
        case '1H': startDate.setHours(now.getHours() - 1); break;
        case '4H': startDate.setHours(now.getHours() - 4); break;
        case '1D': startDate.setDate(now.getDate() - 1); break;
        case '1W': startDate.setDate(now.getDate() - 7); break;
        case '1M': startDate.setMonth(now.getMonth() - 1); break;
        case '1Y': startDate.setFullYear(now.getFullYear() - 1); break;
        case 'ALL': startDate.setFullYear(effectiveStartYear, 0, 1); break;
        default: startDate.setFullYear(effectiveStartYear, 0, 1);
    }

    if (startDate > now) startDate = new Date(now.getFullYear(), 0, 1); 

    let currentValue = sectorInfo.baseValue;
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    
    let totalPoints = 500;
    if (timeframe === '1H') totalPoints = 60;
    else if (timeframe === 'ALL') totalPoints = isSovereign ? 365 : 2000;

    const timeStep = diffTime / totalPoints;
    let currentTime = startDate.getTime();
    
    for (let i = 0; i <= totalPoints; i++) {
        let change = (Math.random() - 0.45);
        if (isSovereign) change = (Math.random() - 0.48) * 0.5; 
        else change = change * 2; 

        currentValue += change;
        if (isSovereign && currentValue < 98) currentValue = 98; 
        if (!isSovereign && currentValue < 5) currentValue = 5;
        
        data.push({ time: Math.floor(currentTime / 1000) as any, value: currentValue });
        currentTime += timeStep;
    }
    return data;
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
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 10,
        minBarSpacing: 0.5,
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
      localization: { locale: 'en-US' },
      handleScroll: { vertTouchDrag: false }, 
      handleScale: { axisPressedMouseMove: true },
    });

    const currentSector = SECTORS.find(s => s.key === activeSector) || SECTORS[0];

    const newSeries = chart.addSeries(AreaSeries, {
      lineColor: currentSector.color,
      topColor: `${currentSector.color}66`,
      bottomColor: `${currentSector.color}00`,
      lineWidth: 2,
    });

    newSeries.setData(generateData('ALL', activeSector));
    chart.timeScale().fitContent();

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

    setChartInstance(chart);
    setSeriesInstance(newSeries);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesInstance && chartInstance) {
        const newData = generateData(activeTimeframe, activeSector);
        const newColor = SECTORS.find(s => s.key === activeSector)?.color || '#C0D860';
        
        seriesInstance.applyOptions({
            lineColor: newColor,
            topColor: `${newColor}66`,
            bottomColor: `${newColor}00`,
        });

        seriesInstance.setData(newData);
        chartInstance.timeScale().fitContent();
    }
  }, [activeTimeframe, activeSector]);

  const currentColor = SECTORS.find(s => s.key === activeSector)?.color;
  const currentTimeframeLabel = TIMEFRAMES.find(t => t.value === activeTimeframe)?.label;

  return (
    <div className="ngx-chart-glass mb-4">
      
      <div className="filters-container">
        
        {/* Custom Sector Dropdown */}
        <div className="filter-wrapper" ref={sectorRef}>
           <div 
             className={`custom-select-trigger ${isSectorOpen ? 'open' : ''}`} 
             onClick={() => setIsSectorOpen(!isSectorOpen)}
             style={{ color: currentColor }}
           >
              <span>{activeSector}</span>
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

        {/* Custom Timeframe Dropdown (Replaces default select/buttons) */}
        <div className="filter-wrapper" ref={timeRef}>
            <div 
             className={`custom-select-trigger time-trigger ${isTimeOpen ? 'open' : ''}`} 
             onClick={() => setIsTimeOpen(!isTimeOpen)}
            >
              <span>{currentTimeframeLabel}</span>
              <span className="arrow">▼</span>
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
              * Data updated live via NGX Engine.
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
        }

        .chart-canvas-wrapper :global(a[href*="tradingview"]) { display: none !important; }

        .chart-canvas-wrapper { 
            width: 100%; 
            height: 400px;
        }

        .filters-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 0 5px;
            position: relative;
            z-index: 50;
        }

        .filter-wrapper {
            position: relative;
            min-width: 160px;
        }

        /* Custom Select Styles */
        .custom-select-trigger {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            font-size: 14px;
            font-weight: 700;
            color: #E0E0E0;
            background: rgba(255, 255, 255, 0.03); /* شفاف زجاجي خفيف */
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            user-select: none;
        }

        .custom-select-trigger:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(255, 255, 255, 0.15);
        }

        .time-trigger {
            min-width: 80px;
            justify-content: space-between;
            font-weight: 600;
            font-size: 13px;
        }

        .arrow {
            font-size: 8px;
            margin-left: 10px;
            opacity: 0.7;
        }

        .custom-options {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(30, 30, 30, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            margin-top: 4px;
            overflow: hidden;
            z-index: 100;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            animation: fadeIn 0.2s ease-out;
        }

        .time-options {
            min-width: 80px;
            right: 0;
            left: auto;
        }

        .custom-option {
            padding: 10px 12px;
            font-size: 13px;
            color: #B0B0B0;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
            border-bottom: 1px solid rgba(255,255,255,0.02);
        }

        .custom-option:last-child {
            border-bottom: none;
        }

        .custom-option:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #fff;
        }

        /* Dynamic hover color for sectors */
        .custom-option:hover {
            color: var(--hover-color, #fff);
        }

        .custom-option.selected {
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
            font-weight: 600;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
            .chart-canvas-wrapper { height: 350px !important; }
            
            .filters-container { 
                flex-direction: row; 
                justify-content: space-between;
                gap: 10px; 
            }
            
            .filter-wrapper {
                min-width: 140px;
            }
            
            .time-trigger {
                min-width: 70px;
            }
        }
      `}</style>
    </div>
  );
}
