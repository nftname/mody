'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { getContract, defineChain, readContract } from "thirdweb";
import { client } from "@/lib/client"; 
import { CONTRACT_ADDRESS } from '@/data/config';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const mockChartData = [
  { name: 'Dec 1', price: 10 },
  { name: 'Dec 5', price: 12 },
  { name: 'Dec 10', price: 15 },
  { name: 'Dec 15', price: 14 },
  { name: 'Dec 20', price: 18 },
  { name: 'Dec 25', price: 22 },
  { name: 'Today', price: 25 },
];

const mockOffers = [
    { id: 1, bidder: '0x71C...9A21', price: '20 POL', date: '2h ago' },
    { id: 2, bidder: '0x3B2...44F1', price: '18 POL', date: '5h ago' },
    { id: 3, bidder: '0xA11...88C9', price: '15 POL', date: '1d ago' },
];

function AssetPage() {
    const params = useParams();
    const account = useActiveAccount();
    const [asset, setAsset] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [showOffers, setShowOffers] = useState(false);

    const fetchAssetData = async (tokenId: string) => {
        try {
            const contract = getContract({
                client: client,
                chain: defineChain(137),
                address: CONTRACT_ADDRESS,
            });

            const tokenURI = await readContract({
                contract,
                method: "function tokenURI(uint256) view returns (string)",
                params: [BigInt(tokenId)]
            });

            const metaRes = await fetch(resolveIPFS(tokenURI));
            const meta = metaRes.ok ? await metaRes.json() : {};
            
            const owner = await readContract({
                 contract,
                 method: "function ownerOf(uint256) view returns (address)",
                 params: [BigInt(tokenId)]
            });

            return {
                id: tokenId,
                name: meta.name || `NNM #${tokenId}`,
                description: meta.description || "",
                attributes: meta.attributes || [],
                tier: meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founder',
                price: meta.attributes?.find((a: any) => a.trait_type === 'Price')?.value || '10',
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
                   if (account && account.address.toLowerCase() === data.owner.toLowerCase()) {
                       setIsOwner(true);
                   }
                }
                setLoading(false);
            });
        }
    }, [params, account]);

    if (loading) return <div className="vh-100 bg-black text-secondary d-flex justify-content-center align-items-center">Loading...</div>;
    if (!asset) return <div className="vh-100 bg-black text-white d-flex justify-content-center align-items-center">Asset Not Found</div>;
    
    const style = getHeroStyles(asset.tier);

    return (
        <main style={{ backgroundColor: '#0b0e11', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
            <div className="container py-3">
                <div className="d-flex align-items-center gap-2 text-secondary mb-4" style={{ fontSize: '14px' }}>
                    <Link href="/market" className="text-decoration-none text-secondary hover-gold">Market</Link>
                    <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
                    <span className="text-white">{asset.name}</span>
                </div>

                <div className="row g-5">
                    <div className="col-lg-5">
                         <div className="rounded-4 d-flex justify-content-center align-items-center position-relative overflow-hidden" style={{ background: 'radial-gradient(circle, #161b22 0%, #0b0e11 100%)', border: '1px solid #2a2e35', minHeight: '500px' }}>
                            <div style={{ width: '85%', aspectRatio: '1/1', background: style.bg, border: style.border, borderRadius: '16px', boxShadow: style.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '10px', letterSpacing: '2px', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>GEN-0 #00{asset.id}</p>
                                    <h1 style={{ fontSize: '42px', fontFamily: 'serif', fontWeight: '900', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '10px 0' }}>{asset.name}</h1>
                                    <p style={{ fontSize: '10px', letterSpacing: '2px', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '10px' }}>2025 EDITION</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 rounded-3" style={{ backgroundColor: '#161b22', border: '1px solid #2a2e35' }}>
                             <div className="d-flex align-items-center gap-2 mb-3">
                                <i className="bi bi-info-circle text-gold"></i>
                                <span className="fw-bold text-white">Description</span>
                            </div>
                            <p className="text-secondary" style={{ fontSize: '14px', lineHeight: '1.6' }}>{asset.description}</p>
                            
                            <div className="mt-4 pt-3 border-top border-secondary">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-secondary small">Contract Address</span>
                                    <span className="text-gold small font-monospace">{CONTRACT_ADDRESS.slice(0,6)}...{CONTRACT_ADDRESS.slice(-4)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-secondary small">Token ID</span>
                                    <span className="text-white small">{asset.id}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-secondary small">Blockchain</span>
                                    <span className="text-white small">Polygon (POL)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-7">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h1 className="text-white fw-bold mb-1" style={{ fontSize: '32px' }}>{asset.name}</h1>
                                <div className="d-flex align-items-center gap-3">
                                    <span className="badge bg-warning text-dark">Gen-0</span>
                                    <span className="text-secondary small">Owned by <span className="text-gold">{asset.owner.slice(0,6)}...{asset.owner.slice(-4)}</span></span>
                                </div>
                            </div>
                            <div className="text-end">
                                <div className="d-flex align-items-center justify-content-end gap-2 text-danger">
                                    <i className="bi bi-caret-down-fill"></i>
                                    <span className="fw-bold">2.4%</span>
                                </div>
                                <span className="text-secondary small">24h Change</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-3 mt-4 mb-4" style={{ backgroundColor: '#161b22', border: '1px solid #2a2e35' }}>
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <span className="text-secondary small d-block mb-1">Current Price</span>
                                    <div className="d-flex align-items-baseline gap-2">
                                        <h2 className="text-white fw-bold mb-0" style={{ fontSize: '36px' }}>{asset.price} POL</h2>
                                        <span className="text-secondary small">≈ $12.50</span>
                                    </div>
                                </div>
                                <div className="col-md-6 mt-3 mt-md-0">
                                    {isOwner ? (
                                        <div className="position-relative">
                                            <button 
                                                onClick={() => setShowOffers(!showOffers)}
                                                className="btn w-100 fw-bold d-flex justify-content-between align-items-center px-4" 
                                                style={{ height: '50px', background: '#FCD535', color: '#000', border: 'none' }}
                                            >
                                                <span><i className="bi bi-list-ul me-2"></i> Manage Offers</span>
                                                <span className="badge bg-dark text-warning rounded-pill">{mockOffers.length}</span>
                                            </button>
                                            
                                            {showOffers && (
                                                <div className="position-absolute w-100 mt-2 rounded-3 overflow-hidden shadow-lg" style={{ backgroundColor: '#1e2329', border: '1px solid #2a2e35', zIndex: 10 }}>
                                                    {mockOffers.map((offer) => (
                                                        <div key={offer.id} className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
                                                            <div>
                                                                <div className="text-white fw-bold">{offer.price}</div>
                                                                <div className="text-secondary small">from {offer.bidder} • {offer.date}</div>
                                                            </div>
                                                            <div className="d-flex gap-2">
                                                                <button className="btn btn-sm btn-success rounded-circle" style={{ width: '32px', height: '32px' }}><i className="bi bi-check-lg"></i></button>
                                                                <button className="btn btn-sm btn-danger rounded-circle" style={{ width: '32px', height: '32px' }}><i className="bi bi-x-lg"></i></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <button className="btn w-50 fw-bold" style={{ height: '50px', background: '#FCD535', color: '#000', border: 'none' }}>Buy Now</button>
                                            <button className="btn w-50 fw-bold text-white" style={{ height: '50px', background: 'transparent', border: '1px solid #2a2e35' }}>Make Offer</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="text-white fw-bold mb-0">Price History</h5>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-secondary active">1M</button>
                                    <button className="btn btn-sm btn-outline-secondary">3M</button>
                                    <button className="btn btn-sm btn-outline-secondary">YTD</button>
                                </div>
                            </div>
                            <div className="rounded-3 p-3" style={{ backgroundColor: '#161b22', border: '1px solid #2a2e35', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockChartData}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#FCD535" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#FCD535" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2e35" vertical={false} />
                                        <XAxis dataKey="name" stroke="#6c757d" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6c757d" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e2329', borderColor: '#2a2e35', color: '#fff' }}
                                            itemStyle={{ color: '#FCD535' }}
                                        />
                                        <Area type="monotone" dataKey="price" stroke="#FCD535" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-md-3 col-6">
                                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#161b22', border: '1px solid #2a2e35' }}>
                                    <div className="text-secondary small mb-1">Volume</div>
                                    <div className="text-white fw-bold">2.5K POL</div>
                                </div>
                            </div>
                            <div className="col-md-3 col-6">
                                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#161b22', border: '1px solid #2a2e35' }}>
                                    <div className="text-secondary small mb-1">Royalty</div>
                                    <div className="text-white fw-bold">1%</div>
                                </div>
                            </div>
                            <div className="col-md-3 col-6">
                                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#161b22', border: '1px solid #2a2e35' }}>
                                    <div className="text-secondary small mb-1">Listed</div>
                                    <div className="text-white fw-bold">Dec 2025</div>
                                </div>
                            </div>
                            <div className="col-md-3 col-6">
                                <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#161b22', border: '1px solid #2a2e35' }}>
                                    <div className="text-secondary small mb-1">Views</div>
                                    <div className="text-white fw-bold">142</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .text-gold { color: #FCD535 !important; }
                .hover-gold:hover { color: #FCD535 !important; transition: 0.2s; }
            `}</style>
        </main>
    );
}
export default dynamicImport(() => Promise.resolve(AssetPage), { ssr: false });
