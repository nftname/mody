'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { getContract, defineChain, readContract } from "thirdweb";
import { client } from "@/lib/client"; 
import { CONTRACT_ADDRESS } from '@/data/config';

// دوال مساعدة للتصميم (نفس الدوال القديمة)
const RICH_GOLD_GRADIENT_CSS = 'linear-gradient(to bottom, #FFD700 0%, #E6BE03 25%, #B3882A 50%, #E6BE03 75%, #FFD700 100%)';
const RICH_GOLD_SOLID = '#E6BE03'; 

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
        case 'founder': 
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

const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
};

function AssetPage() {
    const params = useParams();
    const account = useActiveAccount();
    const [asset, setAsset] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // دالة لجلب بيانات الأصل من البلوكشين مباشرة
    const fetchAssetData = async (tokenId: string) => {
        try {
            const contract = getContract({
                client: client,
                chain: defineChain(137),
                address: CONTRACT_ADDRESS,
            });

            // جلب الرابط الوصفي
            const tokenURI = await readContract({
                contract,
                method: "function tokenURI(uint256) view returns (string)",
                params: [BigInt(tokenId)]
            });

            const metaRes = await fetch(resolveIPFS(tokenURI));
            const meta = metaRes.ok ? await metaRes.json() : {};
            
            // جلب المالك
            const owner = await readContract({
                 contract,
                 method: "function ownerOf(uint256) view returns (address)",
                 params: [BigInt(tokenId)]
            });

            return {
                id: tokenId,
                name: meta.name || `NNM #${tokenId}`,
                tier: meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founder',
                floor: meta.attributes?.find((a: any) => a.trait_type === 'Price')?.value || 'N/A',
                volume: '0', 
                owner: owner
            };

        } catch (error) {
            console.error("Failed to fetch asset", error);
            return null;
        }
    };

    useEffect(() => {
        if (params.id) {
            const id = Array.isArray(params.id) ? params.id[0] : params.id;
            fetchAssetData(id).then((data) => {
                if (data) {
                   setAsset(data);
                   document.title = `${data.name.toUpperCase()} - Market`;
                }
                setLoading(false);
            });
        }
    }, [params]);

    if (loading) return <div className="vh-100 bg-black text-secondary d-flex justify-content-center align-items-center">Loading Asset...</div>;
    if (!asset) return <div className="vh-100 bg-black text-white d-flex justify-content-center align-items-center">Asset Not Found</div>;
    
    const style = getHeroStyles(asset.tier);

    return (
        <main style={{ backgroundColor: '#0d1117', minHeight: '100vh', paddingBottom: '50px' }}>
            <div className="container py-2" style={{ borderBottom: '1px solid #1c2128' }}>
                <div className="d-flex align-items-center gap-2 text-white" style={{ fontSize: '14px' }}>
                    <Link href="/dashboard" className="text-white text-decoration-none">DASHBOARD</Link>
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
                                <span className="small text-secondary">Owner</span>
                                <div className="text-white font-monospace small">{asset.owner}</div>
                                <div className="d-flex gap-2 mt-3">
                                    <button className="btn btn-warning w-100 fw-bold" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Owned Asset</button>
                                </div>
                            </div>
                            
                            <div className="row g-2 text-center">
                                <div className="col-4 p-2 border border-secondary rounded"><div className="small text-secondary">Volume</div><div className="text-white small">--</div></div>
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
export default dynamicImport(() => Promise.resolve(AssetPage), { ssr: false });
