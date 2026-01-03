'use client';
import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import NGXWidget from '@/components/NGXWidget';
import MarketTicker from '@/components/MarketTicker';
import Link from 'next/link';

// --- بيانات ثابتة ---
const historicalData = [
  { date: '2020', value: 150 }, { date: '2021', value: 980 },
  { date: '2022', value: 350 }, { date: '2023', value: 320 },
  { date: '2024', value: 550 }, { date: '2025', value: 890 }
];

const forecastData = [
  { year: 'Q1 25', value: 720 }, { year: 'Q3 25', value: 890 },
  { year: 'Q1 26', value: 1150 }, { year: 'Q3 26', value: 1400 },
];

const mainArticle = {
    title: "Why 'Sovereign Digital Name Assets' Are Becoming The New NFT Gold Standard",
    content: "The era of renting digital presence is over. We are entering the 'Ownership Phase'.",
    author: "Chief Market Analyst",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 border border-secondary shadow-sm" style={{ fontSize: '11px', backgroundColor: '#2B3139', color: '#E6E8EA' }}>
        <p className="fw-bold m-0">{label}</p>
        <p className="text-warning fw-bold m-0">NGX: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const SectionHeader = ({ title }: { title: string }) => (
  <div className="d-flex align-items-center mb-3 border-bottom pb-2" style={{ borderColor: '#363c45' }}>
    <div style={{ width: '4px', height: '16px', background: '#FCD535', marginRight: '10px' }}></div>
    <h3 className="fw-bold m-0 text-uppercase" style={{ fontSize: '14px', letterSpacing: '1px', color: '#E6E8EA' }}>{title}</h3>
  </div>
);

const LiveMomentumChart = () => {
    const [data, setData] = useState([{ val: 40 }, { val: 60 }, { val: 45 }, { val: 80 }]);
    return (
        <div style={{ height: '80px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <Bar dataKey="val" radius={[2, 2, 0, 0]} fill="#FCD535" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default function NGXPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="p-5 text-center text-light">Loading Analytics...</div>;

  return (
    <main style={{ backgroundColor: '#1E1F20', minHeight: '100vh', fontFamily: '"Inter", sans-serif', color: '#E6E8EA' }}>
      
      <MarketTicker />

      {/* منطقة البار العلوي الجديد - تم وضع الودجت هنا فقط */}
      <div className="bg-card-dark border-bottom border-dark py-3 px-3 shadow-sm">
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <NGXWidget theme="dark" />
                </div>
            </div>
            
            {/* العنوان والشرح - لاحظ تم حذف العمود الذي كان يحتوي على الودجت القديم */}
            <div className="row mt-4">
                <div className="col-lg-8">
                    <h1 className="fw-bold mb-2" style={{ fontSize: '1.65rem', color: '#E6E8EA' }}>
                        NGX NFT Index &mdash; The Global Benchmark <span className="text-warning">.</span>
                    </h1>
                    <p className="mb-0" style={{ fontSize: '15px', color: '#B7BDC6', maxWidth: '700px' }}>
                        The premier benchmark tracking the global NFT market.
                    </p>
                </div>
                {/* تم حذف col-lg-5 الذي كان هنا سابقاً ويسبب المشكلة */}
            </div>
        </div>
      </div>

      {/* باقي محتوى الصفحة كما هو */}
      <div className="container-fluid py-4 px-4">
        <div className="row g-4">
            <div className="col-lg-8">
                <div className="bg-card-dark p-4 mb-4 rounded-2 border border-dark shadow-sm">
                    <SectionHeader title="Market Performance" />
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#363c45" />
                                <XAxis dataKey="date" tick={{fontSize: 11}} />
                                <YAxis tick={{fontSize: 11}} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#FCD535" fill="#FCD535" fillOpacity={0.1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 {/* المقال الرئيسي */}
                 <div className="p-4 mb-4 rounded-2 text-white shadow-sm" style={{ background: '#2B3139', border: '1px solid #363c45' }}>
                    <h2 className="fw-bold text-warning mb-3 h4">{mainArticle.title}</h2>
                    <p className="lh-lg mb-3" style={{ fontSize: '15px', color: '#B7BDC6' }}>{mainArticle.content}</p>
                </div>
            </div>

            <div className="col-lg-4">
                <div className="bg-card-dark p-4 mb-4 rounded-2 border border-dark shadow-sm">
                    <SectionHeader title="Buying Pressure" />
                    <LiveMomentumChart />
                </div>
                
                <div className="bg-card-dark p-4 mb-4 rounded-2 border border-dark shadow-sm">
                    <SectionHeader title="Index Weights" />
                    <ul className="list-unstyled m-0">
                        <li className="d-flex justify-content-between py-2 border-bottom border-secondary">
                            <span>Sovereign Names</span><span className="text-warning">30%</span>
                        </li>
                        <li className="d-flex justify-content-between py-2 border-bottom border-secondary">
                            <span>GameFi</span><span>25%</span>
                        </li>
                        <li className="d-flex justify-content-between py-2 border-bottom border-secondary">
                            <span>Art</span><span>25%</span>
                        </li>
                         <li className="d-flex justify-content-between py-2">
                            <span>Infra</span><span>20%</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div> 
      </div>

      <style jsx global>{`
        .bg-card-dark { background-color: #2B3139 !important; }
        .border-dark { border-color: #363c45 !important; }
      `}</style>
    </main>
  );
}
