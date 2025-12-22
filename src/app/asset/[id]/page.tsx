'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '@/data/config';
import ABI from '@/data/abi.json';

const RICH_GOLD_GRADIENT_CSS = 'linear-gradient(to bottom, #FFD700 0%, #E6BE03 25%, #B3882A 50%, #E6BE03 75%, #FFD700 100%)';

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
            return { 
                bg: 'linear-gradient(135deg, #001f24 0%, #003840 100%)', 
                border: '1px solid rgba(0, 128, 128, 0.4)', 
                shadow: 'none', 
                textColor: RICH_GOLD_GRADIENT_CSS, 
                labelColor: '#fff' 
            };
    }
};

export default function AssetPage() {
    const params = useParams();
    const [asset, setAsset] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const { address, isConnected } = useAccount();
    const { open } = useWeb3Modal();
    const [showBidModal, setShowBidModal] = useState(false);

    useEffect(() => {
        const fetchAssetOnChain = async () => {
            if (!params.id) return;
            const id = Array.isArray(params.id) ? params.id[0] : params.id;
            
            try {
                const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com');
                const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
                
                const tokenURI = await contract.tokenURI(id);
                const ownerAddress = await contract.ownerOf(id);

                if (address && ownerAddress.toLowerCase() === address.toLowerCase()) {
                    setIsOwner(true);
                } else {
                    setIsOwner(false);
                }
                
                const gatewayURI = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
                const metaRes = await fetch(gatewayURI);
                const meta = await metaRes.json();
                
                const tier = meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value || 'founders';
                const year = meta.attributes?.find((a: any) => a.trait_type === 'Mint Date')?.value || '2025';

                setAsset({
                    id: id,
                    name: meta.name,
                    tier: tier,
                    year: year,
                    floor: "0", 
                    volume: "0",
                    owner: ownerAddress
                });
            } catch (error) {
                console.error("Asset Fetch Error:", error);
                setAsset(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAssetOnChain();
    }, [params, address]);

    if (loading) return (
        <div className="vh-100 d-flex flex-column justify-content-center align-items-center" style={{backgroundColor: '#0d1117'}}>
            <div className="spinner-border text-warning mb-3" role="status"></div>
            <div className="text-secondary" style={{letterSpacing: '2px'}}>LOADING ASSET DATA...</div>
        </div>
    );

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
                                    <p style={{ fontSize: '10px', letterSpacing: '2px', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GEN-0 #{asset.id.toString().padStart(4, '0')} GENESIS</p>
                                    <h1 style={{ fontSize: '48px', fontFamily: 'serif', fontWeight: '900', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{asset.name}</h1>
                                    <p style={{ fontSize: '10px', letterSpacing: '2px', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OWNED & MINTED - {asset.year}</p>
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
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h2 className="text-white fw-bold font-serif m-0">{asset.name}</h2>
                                {isOwner && <span className="badge bg-warning text-dark">YOU OWN THIS</span>}
                            </div>
                            <p className="small text-secondary mb-4">Tier: <span style={{ color: style.labelColor }}>{asset.tier.toUpperCase()}</span></p>
                            
                            <div className="p-3 bg-black rounded border border-secondary mb-4">
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="small text-secondary">Asset Status</span>
                                    <span className="text-white small fw-bold">{isOwner ? 'In Wallet' : 'Not Listed'}</span>
                                </div>

                                {isOwner ? (
                                    // OWNER VIEW CONTROLS
                                    <div className="d-flex flex-column gap-2">
                                        <button className="btn btn-warning w-100 fw-bold py-2">
                                            <i className="bi bi-tag-fill me-2"></i> List For Sale
                                        </button>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-outline-light w-50 fw-bold" style={{fontSize: '14px'}}>
                                                <i className="bi bi-send me-1"></i> Transfer
                                            </button>
                                            <button className="btn btn-outline-secondary w-50 fw-bold" style={{fontSize: '14px'}}>
                                                <i className="bi bi-gift me-1"></i> Gift
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // PUBLIC VIEW CONTROLS
                                    <div className="d-flex gap-2 mt-3">
                                        <button className="btn btn-warning w-100 fw-bold" disabled onClick={() => !isConnected && open()}>
                                            Not Listed
                                        </button>
                                        <button className="btn btn-outline-light w-100 fw-bold" onClick={() => isConnected && setShowBidModal(true)}>
                                            Make Offer
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="row g-2 text-center">
                                <div className="col-4 p-2 border border-secondary rounded"><div className="small text-secondary">Owner</div><div className="text-white small">{asset.owner.slice(0,6)}...</div></div>
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
