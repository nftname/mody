
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';

// فترات الزمن
const TIMEFRAMES = ['1H', '4H', '1D', '1W', '1M', '1Y', 'ALL'];
// القطاعات
const SECTORS = ['All Index', 'Name Assets', 'GameFi', 'Art', 'Land'];

export default function NGXLiveChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [activeTimeframe, setActiveTimeframe] = useState('ALL');
  const [activeSector, setActiveSector] = useState('All Index');
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [seriesInstance, setSeriesInstance] = useState<any>(null);

  // دالة توليد بيانات وهمية (مؤقتاً) لمحاكاة الشكل
  // Generate dummy data based on timeframe logic
  const generateData = (timeframe: string) => {
    let data = [];
    let date = new Date();
    date.setFullYear(2017, 0, 1); // Start from 2017
    let value = 20;
    
    // Adjust points count based on timeframe (simulation)
    let points = timeframe === '1H' ? 60 : timeframe === 'ALL' ? 2000 : 500;
    
    for (let i = 0; i < points; i++) {
      // Random walk logic
      const change = (Math.random() - 0.48) * 2; 
      value += change;
      if (value < 5) value = 5; // Minimum floor

      // Advance time
      if (timeframe === 'ALL') date.setDate(date.getDate() + 1);
      else date.setMinutes(date.getMinutes() + 1);

      // Format date string (YYYY-MM-DD for daily, timestamp for intraday)
      const time = date.getTime() / 1000; 
      
      data.push({ time: time as any, value: value });
    }
    return data;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. إعداد الرسم البياني بستايل "زجاجي ونظيف"
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' }, // خلفية شفافة
        textColor: '#B0B0B0',
        fontFamily: '"Inter", sans-serif',
      },
      grid: {
        vertLines: { visible: false }, // إخفاء الخطوط الطولية
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' }, // خطوط عرضية خفيفة جداً
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
            color: 'rgba(14, 203, 129, 0.5)',
            width: 1,
            style: 3,
            labelBackgroundColor: '#0ecb81',
        },
        horzLine: {
            color: 'rgba(14, 203, 129, 0.5)',
            width: 1,
            style: 3,
            labelBackgroundColor: '#0ecb81',
        },
      },
    });

    // 2. إعداد السلسلة اللونية (Area Series) - أبيض مع أخضر خفيف
    const newSeries = chart.addAreaSeries({
      lineColor: '#FFFFFF', // الخط العلوي أبيض
      topColor: 'rgba(14, 203, 129, 0.4)', // أخضر خفيف جداً من الأعلى (مثل الفوليوم)
      bottomColor: 'rgba(14, 203, 129, 0.0)', // يتلاشى للشفافية
      lineWidth: 2,
    });

    // تحميل البيانات الأولية
    newSeries.setData(generateData('ALL'));

    // ضبط التحجيم
    chart.timeScale().fitContent();

    // Responsive Resize
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    setChartInstance(chart);
    setSeriesInstance(newSeries);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // تحديث البيانات عند تغيير الفلاتر
  useEffect(() => {
    if (seriesInstance) {
        // هنا مستقبلاً سنستدعي الـ API الحقيقي بناءً على الفلتر
        const newData = generateData(activeTimeframe);
        seriesInstance.setData(newData);
        if (chartInstance) chartInstance.timeScale().fitContent();
    }
  }, [activeTimeframe, activeSector]);

  return (
    <div className="ngx-chart-glass mb-5">
      
      {/* HEADER & FILTERS */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 px-2 pt-2">
        
        {/* Sector Filter (Dropdown Style) */}
        <div className="d-flex gap-2 align-items-center mb-2 mb-md-0">
           <span className="text-muted small fw-bold">SECTOR:</span>
           <div className="sector-selector">
              <select 
                value={activeSector} 
                onChange={(e) => setActiveSector(e.target.value)}
                className="glass-select"
              >
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
           </div>
        </div>

        {/* Timeframe Filter (Minimal Text) */}
        <div className="d-flex gap-1 bg-glass-pill p-1">
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

      {/* CHART CONTAINER */}
      <div ref={chartContainerRef} className="chart-canvas-wrapper" />
      
      {/* DISCLAIMER */}
      <div className="text-end px-2 pb-2">
          <small className="text-muted fst-italic" style={{ fontSize: '10px' }}>
              * Data updated live via NGX Engine. Past performance is not indicative of future results.
          </small>
      </div>

      <style jsx>{`
        .ngx-chart-glass {
            background: rgba(255, 255, 255, 0.02); /* زجاجي خفيف جداً */
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05); /* إطار شبه مخفي */
            border-radius: 8px;
            padding: 15px;
            width: 100%;
            position: relative;
            overflow: hidden;
        }

        .chart-canvas-wrapper {
            width: 100%;
            height: 400px;
        }

        /* Timeframe Buttons Style */
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
            color: #0ecb81; /* الأخضر المستخدم في الفوليوم */
            background: rgba(14, 203, 129, 0.1);
        }

        /* Sector Select Style */
        .glass-select {
            background: transparent;
            color: #E0E0E0;
            border: none;
            font-size: 13px;
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
                height: 250px; /* أقصر قليلاً في الجوال */
            }
        }
      `}</style>
    </div>
  );
}
