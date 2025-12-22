'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAssetById, Asset } from '@/data/assets';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

export const dynamic = 'force-dynamic';

const FOX_PATH = "M29.77 8.35C29.08 7.37 26.69 3.69 26.69 3.69L22.25 11.23L16.03 2.19L9.67 11.23L5.35 3.69C5.35 3.69 2.97 7.37 2.27 8.35C2.19 8.46 2.13 8.6 2.13 8.76C2.07 10.33 1.83 17.15 1.83 17.15L9.58 24.32L15.93 30.2L16.03 30.29L16.12 30.2L22.47 24.32L30.21 17.15C30.21 17.15 29.98 10.33 29.91 8.76C29.91 8.6 29.86 8.46 29.77 8.35ZM11.16 19.34L7.56 12.87L11.53 14.86L13.88 16.82L11.16 19.34ZM16.03 23.33L12.44 19.34L15.06 16.92L16.03 23.33ZM16.03 23.33L17.03 16.92L19.61 19.34L16.03 23.33ZM20.89 19.34L18.17 16.82L20.52 14.86L24.49 12.87L20.89 19.34Z";
const RICH_GOLD_GRADIENT_CSS = 'linear-gradient(to bottom, #FFD700 0%, #E6BE03 25%, #B3882A 50%, #E6BE03 75%, #FFD700 100%)';
const RICH_GOLD_SOLID = '#E6BE03'; 

const GoldIcon = ({ icon, isCustomSVG = false }: { icon: string, isCustomSVG?: boolean }) => {
    if (isCustomSVG) {
        return (
            <svg viewBox="0 0 32 32" width="24" height="24" style={{ marginBottom: '6px' }}>
                <defs>
                    <linearGradient id="goldGradientIconAsset" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="25%" stopColor="#E6BE03" />
                        <stop offset="50%" stopColor="#B3882A" />
                        <stop offset="75%" stopColor="#E6BE03" />
                        <stop offset="100%" stopColor="#FFD700" />
                    </linearGradient>
                </defs>
                <path d={icon} fill="url(#goldGradientIconAsset)" />
            </svg>
        );
    }
    return <i className={`bi ${icon}`} style={{ fontSize: '24px', marginBottom: '6px', color: RICH_GOLD_SOLID }}></i>;
};

const getHeroStyles = (tier: string) => {
    switch(tier?.toLowerCase()) {
        case 'immortal': 
            return {
                bg: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 100%)', 
                border: '1px solid rgba(252, 213, 53, 0.5)',
                shadow: '0 0 80px rgba(252, 213, 53, 0.15), inset 0 0 40px rgba(0,0,0,0.8)',
                textColor: RICH_GOLD_GRADIENT_CSS,
                labelColor: '#FCD535'
            };
        case 'elite': 
            return {
                bg: 'linear-gradient(135deg, #2b0505 0%, #4a0a0a 100%)',
                border: '1px solid rgba(255, 50, 50, 0.5)',
                shadow: '0 0 80px rgba(255, 50, 50, 0.2), inset 0 0 40px rgba(0,0,0,0.8)',
                textColor: RICH_GOLD_GRADIENT_CSS,
                labelColor: '#FCD535'
            };
        case 'founders': 
            return {
                bg: 'linear-gradient(135deg, #001f24 0%, #003840 100%)', 
                border: '1px solid rgba(0, 128, 128, 0.4)', 
                shadow: '0 0 60px rgba(0, 100, 100, 0.15), inset 0 0 40px rgba(0,0,0,0.9)',
                textColor: RICH_GOLD_GRADIENT_CSS, 
                labelColor: '#4db6ac' 
            };
        default: 
            return { bg: '#000', border: '1px solid #333', shadow: 'none', textColor: '#fff', labelColor: '#fff' };
    }
};

const GoldBrandItem = ({ label, icon, isCustom = false }: { label: string, icon: string, isCustom?: boolean }) => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ padding: '0 10px', flex: 1 }}>
            <GoldIcon icon={icon} isCustomSVG={isCustom} />
            <span style={{ fontSize: '13px', fontWeight: '800', background: RICH_GOLD_GRADIENT_CSS, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{label}</span>
        </div>
    );
};

export default function AssetPage() {
    const params = useParams();
    const [asset, setAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);
    const { address, isConnected } = useAccount();
    const { open } = useWeb3Modal();
    const { data: balanceData } = useBalance({ address });
    const [showBidModal, setShowBidModal] = useState(false);
    const [bidAmount, setBidAmount] = useState('');

    useEffect(() => {
        if (params.id) {
            const id = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);
            const found = getAssetById(id);
            if (found) {
                setAsset(found);
                document.title = `${found.name.toUpperCase()} - Market`;
            }
            setLoading(false);
        }
    }, [params]);

    if (loading) return <div className="vh-100 bg-black text-secondary d-flex justify-content-center align-items-center">Loading...</div>;
    if (!asset) return <div className="vh-100 bg-black text-white d-flex justify-content-center align-items-center">Asset Not Found</div>;
    
    const style = getHeroStyles(asset.tier);

    return (
        <main style={{ backgroundColor: '#0d1117', minHeight: '100vh', paddingBottom: '50px' }}>
            <div className="container py-2" style={{ borderBottom: '1px solid #1c2128' }}>
                <div className="d-flex align-items-center gap-2 text-white" style={{ fontSize: '14px' }}>
                    <Link href="/market" className="text-white text-decoration-none">MARKET</Link>
                    <span className="text-secondary">/</span>
                    <span style={{ color: '#FCD535' }}>{asset.name.toUpperCase()}</span>
                    <div className="ms-auto px-3 bg-dark border border-secondary rounded">ID {asset.id}</div>
                </div>
            </div>

            <div className="container mt-4">
                <div className="row g-4">
                    <div className="col-lg-7">
                        <div className="p-5 mb-3 rounded-4 d-flex justify-content-center align-items-center" style={{ background: 'radial-gradient(circle, #161b22 0%, #0d1117 100%)', border: '1px solid #1c2128', minHeight: '400px' }}>
                            <div style={{ width: '350px', height: '200px', background: style.bg, border: style.border, borderRadius: '16px', boxShadow: style.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <div style={{ textAlign: 'center', zIndex: 2 }}>
                                    <p style={{ fontSize: '10px', letterSpacing: '2px', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GEN-0 #00{asset.id} GENESIS</p>
                                    <h1 style={{ fontSize: '48px', fontFamily: 'serif', fontWeight: '900', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{asset.name}</h1>
                                    <p style={{ fontSize: '10px', letterSpacing: '2px', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OWNED & MINTED - 2025</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-dark rounded-3 border border-secondary">
                            <h5 className="text-white fw-bold">Asset Significance</h5>
                            <p className="text-secondary">A singular, unreplicable digital artifact — timeless, unparalleled, and supremely rare. Ownership verified and sealed through NNM.</p>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="p-4 bg-dark rounded-3 border border-secondary sticky-top" style={{ top: '20px' }}>
                            <div className="d-flex justify-content-between">
                                <h2 className="text-white fw-bold font-serif">{asset.name}</h2>
                                <span className="px-2 border border-warning text-warning rounded small">GEN-0</span>
                            </div>
                            <p className="small text-secondary mb-4">Tier: <span style={{ color: style.labelColor }}>{asset.tier.toUpperCase()}</span></p>
                            
                            <div className="p-3 bg-black rounded border border-secondary mb-4">
                                <span className="small text-secondary">Current Price</span>
                                <h3 className="text-white fw-bold">{asset.floor} POL</h3>
                                <div className="d-flex gap-2 mt-3">
                                    <button className="btn btn-warning w-100 fw-bold" onClick={() => !isConnected && open()}>Buy Now</button>
                                    <button className="btn btn-outline-light w-100 fw-bold" onClick={() => isConnected && setShowBidModal(true)}>Make Offer</button>
                                </div>
                            </div>
                            
                            <div className="row g-2 text-center">
                                <div className="col-4 p-2 border border-secondary rounded"><div className="small text-secondary">Volume</div><div className="text-white small">{asset.volume}</div></div>
                                <div className="col-4 p-2 border border-secondary rounded"><div className="small text-secondary">Royalty</div><div className="text-white small">1%</div></div>
                                <div className="col-4 p-2 border border-secondary rounded"><div className="small text-secondary">Items</div><div className="text-white small">1/1</div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
