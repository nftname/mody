'use client';
import Link from 'next/link';
import React from 'react';

const GoldenCheckBadge = () => (
  <svg width="18" height="18" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '6px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
    <defs>
      <linearGradient id="goldBadgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
    <circle cx="21" cy="21" r="20" fill="url(#goldBadgeGradient)" stroke="#ffffff" strokeWidth="3" />
    <path d="M12 21l6 6 12-12" stroke="#000000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FiveStars = () => (
  <div style={{ display: 'flex', gap: '3px', marginTop: '6px', justifyContent: 'center' }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#F0C420" stroke="#B8860B" strokeWidth="1">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ))}
  </div>
);

export default function DemoProfilePage() {
  return (
    <main style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Satoshi:wght@700;900&display=swap');

        .hero-banner-wrapper {
          width: 100%;
          height: 30vh;
          min-height: 180px;
          max-height: 380px;
          position: relative;
          background-color: #000;
          overflow: hidden;
        }

        .hero-banner-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          background-color: #000;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.25));
          pointer-events: none;
        }

        .identity-card-container {
          position: absolute;
          bottom: -60px;
          left: 5%;
          width: 240px;
          height: 130px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.35);
          border: 2px solid rgba(255,255,255,0.6);
          background: #111 url('/images/chainface-card-bg.jpg') center/cover no-repeat;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-content {
          text-align: center;
          color: white;
        }

        .card-name-row {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-name {
          font-family: 'Satoshi', sans-serif;
          font-size: 20px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 5px rgba(0,0,0,0.6);
        }

        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 90px;
        }

        @media (max-width: 768px) {
          .hero-banner-wrapper {
            height: 26vh;
          }
          .identity-card-container {
            left: 50%;
            transform: translateX(-50%);
            bottom: -55px;
          }
        }
      `}</style>

      <div className="hero-banner-wrapper">
        <img src="/images/your-chainface.jpg" alt="ChainFace Cover" className="hero-banner-img" />
        <div className="hero-overlay"></div>

        <div className="identity-card-container">
          <div className="card-content">
            <div className="card-name-row">
              <span className="card-name">ALEXANDER</span>
              <GoldenCheckBadge />
            </div>
            <FiveStars />
          </div>
        </div>
      </div>

      <div className="page-container">
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', padding: '0 20px' }}>
          <h2 style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 700, fontSize: '22px', color: '#4A148C' }}>
            Welcome to my sovereign territory on Web3.
          </h2>
          <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.5 }}>
            No intermediaries, no noise—just direct value and absolute ownership.
          </p>
        </div>
      </div>
    </main>
  );
}