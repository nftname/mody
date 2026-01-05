'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, AreaSeries } from 'lightweight-charts';

const TIMEFRAMES = ['1H', '4H', '1D', '1W', '1M', '1Y', 'ALL'];
const SECTORS = [
  { key: 'All Index', color: '#C0D860' },     // أخضر مصفر
  { key: 'Name Assets', color: '#FCD535' },   // ذهبي ملكي
  { key: 'GameFi', color: '#0ECB81' },        // أخضر نيون
  { key: 'Art', color: '#7B61FF' },           // أرجواني
  { key: 'Land', color: '#F5841F' }           // برتقالي
];

export default function NGXLiveChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [activeTimeframe, setActiveTimeframe] = useState('ALL');
  const [activeSector, setActiveSector] = useState(SECTORS[0].key);
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [seriesInstance, setSeriesInstance] = useState<any>(null);

  // دالة توليد البيانات بذكاء حسب القطاع والتاريخ
  const generateData = (timeframe: string, sector: string) => {
    let data = [];
    const now = new Date();
    let date = new Date();
    
    // منطق التاريخ: Name Assets يبدأ من 2025، الباقي من 2017
    const startYear = sector === 'Name Assets' ? 2025 : 2017;
    date.setFullYear(startYear, 0, 1);
    
    let value = sector === 'Name Assets' ? 100 : 20; // قيمة بداية مختلفة
    
    // حساب عدد النقاط التقريبي
    let points = timeframe === '1H' ? 60 : timeframe === 'ALL' ? (sector === 'Name Assets' ? 365 : 2500) : 500;

    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.45) * 2; 
      value += change;
      if (value < 5) value = 5;

      // تقديم الوقت
      if (timeframe === 'ALL') date.setDate(date.getDate() + 1);
      else if (timeframe === '1M' || timeframe === '1Y') date.setDate(date.getDate() + 1);
      else date.setMinutes(date.getMinutes() + 1);

      // التوقف عند تاريخ اليوم
      if (date > now) break;

      const time = date.getTime() / 1000;
      data.push({ time: time as any, value: value });
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
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
            color: 'rgba(255, 255, 255, 0.2)',
            width: 1,
            style: 3,
            labelBackgroundColor: '#242424',
        },
        horzLine: {
            color: 'rgba(255, 255, 255, 0.2)',
            width: 1,
            style: 3,
            labelBackgroundColor: '#242424',
        },
      },
      localization: {
        locale: 'en-US', // إجبار اللغة الإنجليزية
      },
      handleScroll: false, // منع تداخل السكرول في الجوال
      handleScale: false,
    });

    const currentSectorColor = SECTORS.find(s => s.key === activeSector)?.color || '#C0D860';

    const newSeries = chart.addSeries(AreaSeries, {
      lineColor: currentSectorColor, // لون الخط ديناميكي
      topColor: `${currentSectorColor}66`, // شفافية 40%
      bottomColor: `${currentSectorColor}00`, // شفافية 0%
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

  // تحديث البيانات والألوان عند التغيير
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

  return (
    <div className="ngx-chart-glass mb-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 px-2 pt-2 gap-3">
        
        {/* Sector Filter */}
        <div className="d-flex gap-2 align-items-center">
           <span className="text-muted small fw-bold">SECTOR:</span>
           <div className="sector-selector">
              <select 
                value={activeSector} 
                onChange={(e) => setActiveSector(e.target.value)}
                className="glass-select"
                style={{ color: SECTORS.find(s => s.key === activeSector)?.color }}
              >
                {SECTORS.map(s => <option key={s.key} value={s.key}>{s.key}</option>)}
              </select>
           </div>
        </div>

        {/* Timeframe Filter */}
        <div className="d-flex gap-1 bg-glass-pill p-1 flex-wrap justify-content-end">
            {TIMEFRAMES.map((tf) => (
                <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`btn-timeframe ${activeTimeframe === tf ? 'active' : ''}`}
                >
                    {tf}
                </button>
            ))}
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

        /* إخفاء شعار TradingView */
        .chart-canvas-wrapper :global(a[href*="tradingview"]) {
            display: none !important;
        }

        .chart-canvas-wrapper {
            width: 100%;
            height: 400px;
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

        .btn-timeframe:hover {
            color: #fff;
            background: rgba(255,255,255,0.05);
        }

        .btn-timeframe.active {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
        }

        .glass-select {
            background: transparent;
            border: none;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            outline: none;
        }
        .glass-select option {
            background-color: #1E1E1E;
            color: #fff;
        }

        @media (max-width: 768px) {
            .chart-canvas-wrapper {
                height: 280px;
            }
        }
      `}</style>
    </div>
  );
}
