'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, AreaSeries, ISeriesApi, UTCTimestamp } from 'lightweight-charts';

// --- الألوان والتفاصيل المحفوظة ---
const SECTORS = [
  { key: 'All NFT Index', color: '#C0D860' },     
  { key: 'Digital Name Assets', color: '#38BDF8' }, 
  { key: 'Art NFT', color: '#7B61FF' },            
  { key: 'Gaming NFT', color: '#0ECB81' },        
  { key: 'Utility NFT', color: '#00D8D6' }         
];

// --- مولد البيانات الوهمية (الذكاء الرياضي) ---
function generateMockData(sectorKey: string, mode: 'HISTORY' | 'FORECAST') {
    const data = [];
    let date = new Date('2017-01-01');
    let value = 100; // نقطة البداية
    let volatility = 0.05; // حدة التذبذب

    // تحديد خصائص كل قطاع ليكون مميزاً
    if (sectorKey.includes('Name')) { volatility = 0.08; value = 50; } // NAM يبدأ منخفض
    if (sectorKey.includes('Art')) { volatility = 0.12; value = 80; } // ART متذبذب جداً
    if (sectorKey.includes('Gaming')) { volatility = 0.10; value = 60; }

    const endDate = mode === 'HISTORY' ? new Date('2026-01-14') : new Date('2030-12-31');
    const startDate = mode === 'HISTORY' ? new Date('2017-01-01') : new Date('2026-01-15');

    // إذا كان توقعات، نبدأ من آخر قيمة منطقية
    if (mode === 'FORECAST') value = 1000; 

    while (date <= endDate) {
        // معادلة رياضية لمحاكاة دورات السوق (Crypto Cycles)
        // 2021 كانت قمة (Boom)، 2022/23 كانت قاع (Bust)
        const year = date.getFullYear();
        let trend = 1.002; // صعود طبيعي بسيط

        if (mode === 'HISTORY') {
            if (year === 2017) trend = 1.01; // صعود البداية
            if (year >= 2018 && year < 2020) trend = 0.998; // هبوط 2018
            if (year === 2020) trend = 1.005; // تعافي
            if (year === 2021) trend = 1.02; // قمة 2021 الجنونية (Boom)
            if (year === 2022) trend = 0.985; // انهيار 2022
            if (year === 2023) trend = 0.995; // ركود
            if (year >= 2024) trend = 1.008; // تعافي قوي (الحاضر)
        } else {
            // التوقعات للمستقبل (صعود مستمر)
            trend = 1.005; 
        }

        // إضافة عشوائية بسيطة ليكون الخط "طبيعياً" وليس مسطرة
        const randomMove = 1 + (Math.random() - 0.5) * volatility;
        value = value * trend * randomMove;

        // منع القيم السالبة
        if (value < 10) value = 10;

        // إضافة النقطة (نأخذ نقطة كل 3 أيام لنعومة الرسم)
        data.push({
            time: (date.getTime() / 1000) as UTCTimestamp,
            value: value
        });

        // زيادة التاريخ 3 أيام
        date.setDate(date.getDate() + 3);
    }
    return data;
}

export default function NGXLiveChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // التحكم اليدوي للتصوير
  const [activeSector, setActiveSector] = useState(SECTORS[0]);
  const [viewMode, setViewMode] = useState<'HISTORY' | 'FORECAST'>('HISTORY');

  const [chartInstance, setChartInstance] = useState<any>(null);
  const [seriesInstance, setSeriesInstance] = useState<ISeriesApi<"Area"> | null>(null);

  // تهيئة الرسم البياني (نفس الستايل بالضبط)
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
      },
      rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.1)', visible: true, scaleMargins: { top: 0.2, bottom: 0.1 } },
      crosshair: { mode: CrosshairMode.Normal },
      localization: { locale: 'en-US' },
    });

    const newSeries = chart.addSeries(AreaSeries, {
      lineWidth: 2,
      lineColor: activeSector.color, // اللون المتغير
      topColor: `${activeSector.color}66`, // نفس التنسيق
      bottomColor: `${activeSector.color}00`,
      priceLineVisible: false,
    });

    setChartInstance(chart);
    setSeriesInstance(newSeries);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, []);

  // تحديث الرسم عند ضغط الأزرار
  useEffect(() => {
      if (!seriesInstance || !chartInstance) return;

      // 1. تحديث اللون
      seriesInstance.applyOptions({
          lineColor: activeSector.color,
          topColor: `${activeSector.color}66`,
          bottomColor: `${activeSector.color}00`,
      });

      // 2. توليد البيانات الجديدة
      const data = generateMockData(activeSector.key, viewMode);
      seriesInstance.setData(data);
      chartInstance.timeScale().fitContent();

  }, [activeSector, viewMode, seriesInstance, chartInstance]);

  return (
    <div className="ngx-chart-glass mb-4">
      
      {/* --- لوحة تحكم مؤقتة للتصوير (لن تظهر في الصورة إذا قصصتها) --- */}
      <div style={{ marginBottom: '10px', padding: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{color:'white', fontSize:'12px'}}>اختر للتصوير:</span>
          {SECTORS.map(s => (
              <button 
                key={s.key} 
                onClick={() => setActiveSector(s)}
                style={{
                    background: activeSector.key === s.key ? s.color : '#333',
                    color: activeSector.key === s.key ? 'black' : 'white',
                    border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer'
                }}
              >
                  {s.key}
              </button>
          ))}
          <div style={{width: '1px', background: '#555'}}></div>
          <button onClick={() => setViewMode('HISTORY')} style={{ background: viewMode === 'HISTORY' ? 'white' : '#333', color: viewMode === 'HISTORY' ? 'black' : 'white', border:'none', padding:'4px 8px', borderRadius:'4px', fontSize:'10px' }}>التاريخ (2017-2026)</button>
          <button onClick={() => setViewMode('FORECAST')} style={{ background: viewMode === 'FORECAST' ? 'white' : '#333', color: viewMode === 'FORECAST' ? 'black' : 'white', border:'none', padding:'4px 8px', borderRadius:'4px', fontSize:'10px' }}>توقعات (2030)</button>
      </div>

      {/* --- نفس الهيدر القديم --- */}
      <div className="filters-container">
        <div className="filter-wrapper sector-wrapper">
           <div className="custom-select-trigger" style={{ color: activeSector.color }}>
              <span className="text-truncate">{activeSector.key}</span>
              <span className="arrow">▼</span>
           </div>
        </div>

        <div className="live-indicator-wrapper d-flex align-items-center">
            <div className="live-pulse" style={{ fontSize: '9px', color: '#0ecb81', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', background: '#0ecb81', borderRadius: '50%', boxShadow: '0 0 5px #0ecb81' }}></span>
                LIVE INDEX
            </div>
        </div>

        <div className="filter-wrapper time-wrapper ms-2">
            <div className="custom-select-trigger time-trigger">
              <span>{viewMode === 'HISTORY' ? 'ALL' : '2030'}</span>
              <span className="arrow ms-1">▼</span>
           </div>
        </div>
      </div>

      <div ref={chartContainerRef} className="chart-canvas-wrapper">
          {/* العلامة المائية: NNM بنفس التنسيق المعتمد */}
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
        .chart-canvas-wrapper { width: 100%; height: 400px; position: relative; }
        .filters-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 10px; position: relative; z-index: 50; }
        .custom-select-trigger { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; font-size: 13px; font-weight: 700; color: #E0E0E0; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; user-select: none; white-space: nowrap; }
        .arrow { font-size: 8px; opacity: 0.7; }
        
        /* العلامة المائية المحسنة */
        .chart-watermark {
            position: absolute;
            bottom: 20px; left: 20px;
            font-size: 26px; font-weight: 900; font-style: italic;
            color: rgba(255, 255, 255, 0.45);
            pointer-events: none; z-index: 10; user-select: none; letter-spacing: 1px;
        }
        @media (max-width: 768px) {
            .ngx-chart-glass { padding: 0; border: none; background: transparent; backdrop-filter: none; }
            .chart-canvas-wrapper { height: 350px !important; }
            .filters-container { padding: 5px 0px; margin-bottom: 5px; }
            .custom-select-trigger { font-size: 12px; padding: 6px 8px; }
            .chart-watermark { font-size: 19px; bottom: 15px; left: 15px; }
        }
      `}</style>
    </div>
  );
}
