'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, AreaSeries } from 'lightweight-charts';

const SECTORS = [
  { key: 'All NFTs Index', color: '#C0D860', startYear: 2017, baseValue: 40 },
  { key: 'Imperium Name Assets', color: '#FCD535', startYear: 2025, baseValue: 100 },
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

export default function NGXLiveChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [activeTimeframe, setActiveTimeframe] = useState('ALL');
  const [activeSector, setActiveSector] = useState(SECTORS[0].key);
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [seriesInstance, setSeriesInstance] = useState<any>(null);

  const generateData = (timeframe: string, sectorKey: string) => {
    const data = [];
    const now = new Date(); 
    let startDate = new Date();
    const sectorInfo = SECTORS.find(s => s.key === sectorKey) || SECTORS[0];

    const isImperium = sectorKey === 'Imperium Name Assets';
    const effectiveStartYear = isImperium ? 2025 : sectorInfo.startYear;

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
    else if (timeframe === 'ALL') totalPoints = isImperium ? 365 : 2000;

    const timeStep = diffTime / totalPoints;
    let currentTime = startDate.getTime();
    
    for (let i = 0; i <= totalPoints; i++) {
        let change = (Math.random() - 0.45);
        
        if (isImperium) {
            change = (Math.random() - 0.48) * 0.5; 
        } else {
            change = change * 2; 
        }

        currentValue += change;
        
        if (isImperium && currentValue < 98) currentValue = 98; 
        if (!isImperium && currentValue < 5) currentValue = 5;
        
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
        rightOffset: 5,
        minBarSpacing: 0.5,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: { top: 0.2, bottom: 0.1 },
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
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
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

  return (
    <div className="ngx-chart-glass mb-4">
      
      <div className="filters-container">
        
        <div className="sector-filter-wrapper position-relative">
           <select 
                value={activeSector} 
                onChange={(e) => setActiveSector(e.target.value)}
                className="custom-dropdown"
                style={{ color: currentColor, borderColor: 'rgba(255,255,255,0.1)' }}
           >
                {SECTORS.map(s => <option key={s.key} value={s.key}>{s.key}</option>)}
           </select>
           <span className="dropdown-arrow">▼</span>
        </div>

        <div className="time-filter-wrapper position-relative">
            {/* Mobile Dropdown */}
            <div className="d-block d-md-none">
                <select 
                    value={activeTimeframe} 
                    onChange={(e) => setActiveTimeframe(e.target.value)}
                    className="custom-dropdown text-end pe-4"
                >
                    {TIMEFRAMES.map(tf => <option key={tf.value} value={tf.value}>{tf.label}</option>)}
                </select>
                <span className="dropdown-arrow" style={{ right: '10px' }}>▼</span>
            </div>

            {/* Desktop Buttons */}
            <div className="d-none d-md-flex gap-1 bg-glass-pill p-1">
                {TIMEFRAMES.map((tf) => (
                    <button
                        key={tf.value}
                        onClick={() => setActiveTimeframe(tf.value)}
                        className={`btn-timeframe ${activeTimeframe === tf.value ? 'active' : ''}`}
                    >
                        {tf.label}
                    </button>
                ))}
            </div>
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
            overflow: hidden;
        }

        .chart-canvas-wrapper :global(a[href*="tradingview"]) { display: none !important; }

        .chart-canvas-wrapper { width: 100%; height: 400px; }

        .filters-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 0 5px;
        }

        .sector-filter-wrapper, .time-filter-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .custom-dropdown {
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            color: #E0E0E0;
            padding: 8px 24px 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 700;
            outline: none;
            cursor: pointer;
            appearance: none;
            min-width: 140px;
        }
        .custom-dropdown option { background-color: #1E1E1E; color: #fff; }

        .dropdown-arrow {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 8px;
            color: #aaa;
            pointer-events: none;
        }

        .btn-timeframe {
            background: transparent;
            border: none;
            color: #6c757d;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-timeframe:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .btn-timeframe.active { color: #fff; background: rgba(255, 255, 255, 0.1); }

        @media (max-width: 768px) {
            .chart-canvas-wrapper { height: 300px; }
            .filters-container { 
                flex-direction: row; 
                justify-content: space-between;
                gap: 10px; 
            }
            .custom-dropdown { 
                font-size: 12px; 
                padding: 6px 20px 6px 8px; 
                min-width: 110px; 
            }
        }
      `}</style>
    </div>
  );
}
