'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useActiveAccount, TransactionButton } from "thirdweb/react";
import { getContract, readContract } from "thirdweb";
import { 
    createListing, 
    buyFromListing, 
    getAllValidListings 
} from "thirdweb/extensions/marketplace";
import { client } from "@/lib/client"; 
// تأكد من أنك أنشأت ملف config.ts كما طلبت منك
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS, NETWORK_CHAIN } from '@/data/config';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RICH_GOLD_GRADIENT_CSS = 'linear-gradient(to bottom, #FFD700 0%, #E6BE03 25%, #B3882A 50%, #E6BE03 75%, #FFD700 100%)';
const GOLD_BTN_STYLE = { background: '#FCD535', color: '#000', border: 'none', fontWeight: 'bold' as const };

const getHeroStyles = (tier: string) => {
    switch(tier?.toLowerCase()) {
        case 'immortal': return { bg: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 100%)', border: '1px solid rgba(252, 213, 53, 0.5)', shadow: '0 0 80px rgba(252, 213, 53, 0.15), inset 0 0 40px rgba(0,0,0,0.8)', textColor: RICH_GOLD_GRADIENT_CSS, labelColor: '#FCD535' };
        case 'elite': return { bg: 'linear-gradient(135deg, #2b0505 0%, #4a0a0a 100%)', border: '1px solid rgba(255, 50, 50, 0.5)', shadow: '0 0 80px rgba(255, 50, 50, 0.2), inset 0 0 40px rgba(0,0,0,0.8)', textColor: RICH_GOLD_GRADIENT_CSS, labelColor: '#FCD535' };
        case 'founder': 
        case 'founders': return { bg: 'linear-gradient(135deg, #001f24 0%, #003840 100%)', border: '1px solid rgba(0, 128, 128, 0.4)', shadow: '0 0 60px rgba(0, 100, 100, 0.15), inset 0 0 40px rgba(0,0,0,0.9)', textColor: RICH_GOLD_GRADIENT_CSS, labelColor: '#4db6ac' };
        default: return { bg: '#000', border: '1px solid #333', shadow: 'none', textColor: '#fff', labelColor: '#fff' };
    }
};

const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
};

const mockChartData = [
  { name: 'Dec 1', price: 10 },
  { name: 'Today', price: 12 },
];

const marketplaceContract = getContract({ client, chain: NETWORK_CHAIN, address: MARKETPLACE_ADDRESS });
const nftContract = getContract({ client, chain: NETWORK_CHAIN, address: NFT_COLLECTION_ADDRESS });

function AssetPage() {
    const params = useParams();
    const account = useActiveAccount();
    
    const [asset, setAsset] = useState<any | null>(null);
    const [listing, setListing] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    
    const [sellPrice, setSellPrice] = useState('10');
    const [isListingMode, setIsListingMode] = useState(false);

    // FIX: Ensure tokenId is strictly a string
    const rawId = params?.id;
    const tokenId = Array.isArray(rawId) ? rawId[0] : rawId;

    const fetchAssetData = async () => {
        if (!tokenId) return;

        try {
            const tokenURI = await readContract({ contract: nftContract, method: "function tokenURI(uint256) view returns (string)", params: [BigInt(tokenId)] });
            const metaRes = await fetch(resolveIPFS(tokenURI));
            const meta = metaRes.ok ? await metaRes.json() : {};
            
            const owner = await readContract({ contract: nftContract, method: "function ownerOf(uint256) view returns (address)", params: [BigInt(tokenId)] });

            setAsset({
                id: tokenId,
                name: meta.name || `NNM #${tokenId}`,
                description: meta.description || "",
                tier: meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founder',
                price: meta.attributes?.find((a: any) => a.trait_type === 'Price')?.value || '10',
                owner: owner
            });

            if (account && owner.toLowerCase() === account.address.toLowerCase()) {
                setIsOwner(true);
            }

        } catch (error) {
            console.error("Failed to fetch asset", error);
        }
    };

    const checkListing = async () => {
        if (!tokenId) return;
        try {
            // FIX: Updated syntax for getAllValidListings
            const listings = await getAllValidListings({ 
                contract: marketplaceContract, 
                start: 0, 
                count: BigInt(100) 
            });
            const foundListing = listings.find(l => l.asset.id.toString() === tokenId.toString());
            setListing(foundListing || null);
        } catch (e) { console.error("Market Error", e); }
    };

    useEffect(() => {
        if (tokenId) {
            Promise.all([fetchAssetData(), checkListing()]).then(() => {
                setLoading(false);
            });
        }
    }, [tokenId, account]);

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
                                    {/* FIX: Using NFT_COLLECTION_ADDRESS instead of undefined CONTRACT_ADDRESS */}
                                    <span className="text-gold small font-monospace">{NFT_COLLECTION_ADDRESS.slice(0,6)}...{NFT_COLLECTION_ADDRESS.slice(-4)}</span>
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
                                        <h2 className="text-white fw-bold mb-0" style={{ fontSize: '36px' }}>
                                            {listing ? `${listing.currencyValuePerToken.displayValue} ${listing.currencyValuePerToken.symbol}` : `${asset.price} POL`}
                                        </h2>
                                        {!listing && <span className="text-secondary small">≈ $12.50</span>}
                                    </div>
                                </div>
                                <div className="col-md-6 mt-3 mt-md-0">
                                    {listing ? (
                                        !isOwner ? (
                                            <TransactionButton
                                                transaction={() => buyFromListing({
                                                    contract: marketplaceContract,
                                                    listingId: listing.id,
                                                    recipient: account?.address || "",
                                                    quantity: BigInt(1), // FIX: Use BigInt(1) instead of 1n
                                                })}
                                                onTransactionConfirmed={() => { alert("Purchased Successfully!"); window.location.reload(); }}
                                                onError={(e) => alert(e.message)}
                                                style={{ ...GOLD_BTN_STYLE, width: '100%', height: '50px' }}
                                            >
                                                Buy Now
                                            </TransactionButton>
                                        ) : (
                                            <div className="text-warning text-center small p-2 border border-warning rounded"><i className="bi bi-info-circle"></i> You are selling this item.</div>
                                        )
                                    ) : (
                                        isOwner ? (
                                            !isListingMode ? (
                                                <button onClick={() => setIsListingMode(true)} className="btn w-100 fw-bold" style={{ ...GOLD_BTN_STYLE, height: '50px' }}>
                                                    List for Sale
                                                </button>
                                            ) : (
                                                <div className="d-flex flex-column gap-2">
                                                    <input type="number" className="form-control bg-dark text-white border-secondary" placeholder="Price (POL)" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
                                                    <div className="d-flex gap-2">
                                                        <TransactionButton
                                                            transaction={() => {
                                                                if (!tokenId) throw new Error("Invalid Token ID");
                                                                return createListing({
                                                                    contract: marketplaceContract,
                                                                    assetContractAddress: NFT_COLLECTION_ADDRESS,
                                                                    tokenId: BigInt(tokenId),
                                                                    pricePerToken: sellPrice,
                                                                    currencyContractAddress: "0x0000000000000000000000000000000000000000"
                                                                });
                                                            }}
                                                            onTransactionConfirmed={() => { alert("Listed Successfully!"); window.location.reload(); }}
                                                            style={{ ...GOLD_BTN_STYLE, flex: 1 }}
                                                        >
                                                            Confirm
                                                        </TransactionButton>
                                                        <button onClick={() => setIsListingMode(false)} className="btn btn-outline-secondary">Cancel</button>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <div className="d-flex gap-2">
                                                <button className="btn w-50 fw-bold disabled" style={{ height: '50px', background: '#333', color: '#888', border: 'none' }}>Not Listed</button>
                                                <button className="btn w-50 fw-bold text-white disabled" style={{ height: '50px', background: 'transparent', border: '1px solid #2a2e35' }}>Make Offer</button>
                                            </div>
                                        )
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
