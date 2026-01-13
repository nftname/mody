'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, AreaSeries, ISeriesApi } from 'lightweight-charts';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SECTORS = [
  { key: 'All NFT Index', dbKey: 'ALL', color: '#C0D860' },     
  { key: 'Digital Name Assets', dbKey: 'NAM', color: '#38BDF8' }, 
  { key: 'Art NFT', dbKey: 'ART', color: '#7B61FF' },            
  { key: 'Gaming NFT', dbKey: 'GAM', color: '#0ECB81' },        
  { key: 'Utility NFT', dbKey: 'UTL', color: '#00D8D6' }         
];

const TIMEFRAMES = [
    { label: '1D', value: '1D', days: 30 },   
    { label: '1W', value: '1W', days: 90 },   
    { label: '1M', value: '1M', days: 180 },  
    { label: '1Y', value: '1Y', days: 365 },  
    { label: 'ALL', value: 'ALL', days: 0 }   
];

export default function NGXLiveChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [activeSector, setActiveSector] = useState(SECTORS[0].key);
  
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [seriesInstance, setSeriesInstance] = useState<ISeriesApi<"Area"> | null>(null);
  const [chartData, setChartData] = useState<any[]>([]); 
  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  // Fetch Data directly from the new Clean Table
  const fetchHistory = async (sectorKey: string) => {
    const sectorInfo = SECTORS.find(s => s.key === sectorKey);
    if (!sectorInfo) return;

    const { data, error } = await supabase
        .from('ngx_volume_index')
        .select('timestamp, index_value')
        .eq('sector_key', sectorInfo.dbKey)
        .order('timestamp', { ascending: true }); // Get chronological order

    if (!error && data) {
        const formattedData = data.map((d: any) => ({
            time: Number(d.timestamp),
            value: Number(d.index_value)
        }));
        // Remove Duplicates if any
        const uniqueData = formattedData.filter((v, i, a) => i === a.findIndex(t => t.time === v.time));
        setChartData(uniqueData);
    }
  };

  // Initial Setup
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#B0B0B0', fontFamily: 'Inter' },
      grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(255, 255, 255, 0.05)' } },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: { borderColor: 'rgba(255, 255, 255, 0.1)', timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.1)', visible: true },
      crosshair: { mode: CrosshairMode.Normal }
    });

    const newSeries = chart.addSeries(AreaSeries, {
      lineWidth: 2, lineColor: '#C0D860',
      topColor: 'rgba(192, 216, 96, 0.4)', bottomColor: 'rgba(192, 216, 96, 0.0)',
    });

    setChartInstance(chart);
    setSeriesInstance(newSeries);
    fetchHistory(activeSector);

    const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current?.clientWidth || 0 });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Handle Sector Change
  useEffect(() => {
    fetchHistory(activeSector);
  }, [activeSector]);

  // Handle Data & Timeframe Update
  useEffect(() => {
    if (!seriesInstance || !chartInstance || chartData.length === 0) return;

    const currentSector = SECTORS.find(s => s.key === activeSector);
    if (currentSector) {
        seriesInstance.applyOptions({
            lineColor: currentSector.color,
            topColor: `${currentSector.color}66`, 
            bottomColor: `${currentSector.color}00`, 
        });
    }

    const tf = TIMEFRAMES.find(t => t.value === activeTimeframe);
    let filteredData = chartData;
    if (tf && tf.days > 0) {
        const cutoff = Math.floor(Date.now() / 1000) - (tf.days * 86400);
        filteredData = chartData.filter(d => d.time >= cutoff);
    }

    seriesInstance.setData(filteredData);
    chartInstance.timeScale().fitContent();

  }, [chartData, activeTimeframe, seriesInstance, chartInstance, activeSector]);

  return (
    <div className="ngx-chart-glass mb-4">
      <div className="filters-container">
        {/* Sector Filter */}
        <div className="filter-wrapper" style={{minWidth: '200px'}}>
           <div className="custom-select-trigger" onClick={() => setIsSectorOpen(!isSectorOpen)}>
              {activeSector} ▼
           </div>
           {isSectorOpen && (
             <div className="custom-options">
               {SECTORS.map(s => (
                 <div key={s.key} className="custom-option" onClick={() => { setActiveSector(s.key); setIsSectorOpen(false); }}>
                    {s.key}
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Timeframe Filter */}
        <div className="filter-wrapper">
            <div className="custom-select-trigger" onClick={() => setIsTimeOpen(!isTimeOpen)}>
              {activeTimeframe} ▼
           </div>
           {isTimeOpen && (
             <div className="custom-options">
               {TIMEFRAMES.map(tf => (
                 <div key={tf.value} className="custom-option" onClick={() => { setActiveTimeframe(tf.value); setIsTimeOpen(false); }}>
                    {tf.label}
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      <div ref={chartContainerRef} className="chart-canvas-wrapper" />
      
      <div className="text-end px-2 pb-2">
          <small className="text-muted" style={{ fontSize: '10px' }}>* NGX Volume Index (Base 100)</small>
      </div>

      <style jsx>{`
        .ngx-chart-glass {
            background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px;
        }
        .filters-container { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .custom-select-trigger {
            cursor: pointer; padding: 6px 12px; background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; color: #E0E0E0; font-size: 13px;
        }
        .custom-options {
            position: absolute; top: 100%; left: 0; min-width: 100%; z-index: 100;
            background: #1e1e1e; border: 1px solid #333; margin-top: 4px;
        }
        .custom-option { padding: 8px; cursor: pointer; color: #B0B0B0; font-size: 12px; }
        .custom-option:hover { background: #333; color: #fff; }
        .filter-wrapper { position: relative; }
      `}</style>
    </div>
  );
}
