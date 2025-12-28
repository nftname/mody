'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useActiveAccount, TransactionButton, useConnectModal } from "thirdweb/react";
import { getContract, readContract, NATIVE_TOKEN_ADDRESS } from "thirdweb";
import { createWallet, walletConnect } from "thirdweb/wallets"; 
import { 
    createListing, 
    buyFromListing, 
    getAllValidListings,
    cancelListing,
    makeOffer 
} from "thirdweb/extensions/marketplace";
import { setApprovalForAll, isApprovedForAll } from "thirdweb/extensions/erc721";
import { balanceOf } from "thirdweb/extensions/erc20";
import { client } from "@/lib/client"; 
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS, NETWORK_CHAIN } from '@/data/config';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- WALLET CONFIGURATION (Strict Mode) ---
const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  walletConnect(),
];

// --- CONSTANTS ---
const WPOL_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; // Polygon Wrapped Token
const RICH_GOLD_GRADIENT_CSS = 'linear-gradient(to bottom, #FFD700 0%, #E6BE03 25%, #B3882A 50%, #E6BE03 75%, #FFD700 100%)';
const GOLD_BTN_STYLE = { background: '#FCD535', color: '#000', border: 'none', fontWeight: 'bold' as const };
const OUTLINE_BTN_STYLE = { background: 'transparent', color: '#FCD535', border: '1px solid #FCD535', fontWeight: 'bold' as const };

// --- CUSTOM MODAL (UPDATED UI) ---
const CustomModal = ({ isOpen, type, title, message, onClose, onGoToMarket }: any) => {
    if (!isOpen) return null;

    let icon = <div className="spinner-border text-dark" role="status" style={{ width: '3rem', height: '3rem' }}></div>;
    let btnText = "Processing...";
    let btnStyle = { ...GOLD_BTN_STYLE, background: 'linear-gradient(180deg, #FFD700 0%, #FDB931 100%)' }; // Gold Bar Style
    
    if (type === 'success') {
        icon = <i className="bi bi-check-circle-fill" style={{ fontSize: '50px', color: '#28a745' }}></i>;
        btnText = "Stay Here";
        btnStyle = { background: '#333', color: '#fff', border: 'none', fontWeight: 'bold' as const };
    } else if (type === 'error') {
        icon = <i className="bi bi-info-circle-fill" style={{ fontSize: '50px', color: '#FCD535' }}></i>;
        btnText = "Try Again";
    }

    return (
        // Overlay: Closes modal on click outside
        <div onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
        }}>
            // Modal Content: Stops click propagation
            <div onClick={(e) => e.stopPropagation()} style={{
                backgroundColor: '#111', 
                border: '1px solid #FCD535', // Gold Border
                boxShadow: '0 0 20px rgba(252, 213, 53, 0.2)', // Soft Gold Glow
                borderRadius: '20px',
                padding: '30px', width: '90%', maxWidth: '400px', textAlign: 'center',
                position: 'relative', cursor: 'default'
            }}>
                {/* Close Button (X) */}
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#666', fontSize: '24px', cursor: 'pointer' }}>
                    <i className="bi bi-x"></i>
                </button>

                <div className="mb-3">{icon}</div>
                <h3 className="text-white fw-bold mb-2">{title}</h3>
                <p className="text-secondary mb-4" style={{ fontSize: '15px' }}>{message}</p>
                
                {type !== 'loading' && (
                    <div className="d-flex gap-2">
                        <button onClick={onClose} className="btn fw-bold flex-grow-1" style={{ ...btnStyle, padding: '12px', borderRadius: '12px' }}>
                            {btnText}
                        </button>
                        {type === 'success' && onGoToMarket && (
                            <button onClick={onGoToMarket} className="btn fw-bold flex-grow-1" style={{ background: 'linear-gradient(90deg, #FFD700 0%, #FDB931 100%)', border: 'none', color: '#000', padding: '12px', borderRadius: '12px' }}>
                                Go to Market <i className="bi bi-arrow-right ms-1"></i>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- STYLES HELPER ---
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

const mockChartData = [ { name: 'Dec 1', price: 10 }, { name: 'Today', price: 12 } ];

// --- CONTRACT INITIALIZATION ---
const marketplaceContract = getContract({ client, chain: NETWORK_CHAIN, address: MARKETPLACE_ADDRESS });
const nftContract = getContract({ client, chain: NETWORK_CHAIN, address: NFT_COLLECTION_ADDRESS });
const wpolContract = getContract({ client, chain: NETWORK_CHAIN, address: WPOL_ADDRESS });

function AssetPage() {
    const params = useParams();
    const router = useRouter();
    const account = useActiveAccount();
    const { connect } = useConnectModal();
    
    // Data State
    const [asset, setAsset] = useState<any | null>(null);
    const [listing, setListing] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    
    // UI State
    const [sellPrice, setSellPrice] = useState('10');
    const [offerPrice, setOfferPrice] = useState('');
    const [isListingMode, setIsListingMode] = useState(false);
    const [isOfferMode, setIsOfferMode] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: 'loading', title: '', message: '' });

    const rawId = params?.id;
    const tokenId = Array.isArray(rawId) ? rawId[0] : rawId;

    // --- FETCH DATA ---
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
                const approvedStatus = await isApprovedForAll({ contract: nftContract, owner: account.address, operator: MARKETPLACE_ADDRESS });
                setIsApproved(approvedStatus);
            }
        } catch (error) { console.error("Failed to fetch asset", error); }
    };

    const checkListing = async () => {
        if (!tokenId) return;
        try {
            const listings = await getAllValidListings({ contract: marketplaceContract, start: 0, count: BigInt(100) });
            const foundListing = listings.find(l => l.asset.id.toString() === tokenId.toString());
            setListing(foundListing || null);
        } catch (e) { console.error("Market Error", e); }
    };

    useEffect(() => {
        if (tokenId) { Promise.all([fetchAssetData(), checkListing()]).then(() => setLoading(false)); }
    }, [tokenId, account]);

    // --- HELPERS ---
    const showModal = (type: string, title: string, message: string) => setModal({ isOpen: true, type, title, message });
    const closeModal = () => {
        setModal({ ...modal, isOpen: false });
        // Reload page only on success to reflect changes
        if (modal.type === 'success') window.location.reload();
    };
    const goToMarket = () => {
        setModal({ ...modal, isOpen: false });
        router.push('/market');
    };
    
    // --- HANDLE CONNECT (STRICT WALLETS) ---
    const handleConnect = () => {
        connect({ client, wallets });
    };

    if (loading) return <div className="vh-100 bg-black text-secondary d-flex justify-content-center align-items-center">Loading Asset...</div>;
    if (!asset) return <div className="vh-100 bg-black text-white d-flex justify-content-center align-items-center">Asset Not Found</div>;
    
    const style = getHeroStyles(asset.tier);

    return (
        <main style={{ backgroundColor: '#0b0e11', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
            
            <CustomModal 
                isOpen={modal.isOpen} 
                type={modal.type} 
                title={modal.title} 
                message={modal.message} 
                onClose={closeModal}
                onGoToMarket={modal.title.includes('Listed') ? goToMarket : undefined}
            />

            <div className="container py-3">
                <div className="d-flex align-items-center gap-2 text-secondary mb-4" style={{ fontSize: '14px' }}>
                    <Link href="/market" className="text-decoration-none text-secondary hover-gold">Market</Link>
                    <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
                    <span className="text-white">{asset.name}</span>
                </div>

                <div className="row g-5">
                    {/* Left Column (Image) */}
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
                        </div>
                    </div>

                    {/* Right Column (Actions) */}
                    <div className="col-lg-7">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h1 className="text-white fw-bold mb-1" style={{ fontSize: '32px' }}>{asset.name}</h1>
                                <div className="d-flex align-items-center gap-3">
                                    <span className="badge bg-warning text-dark">Gen-0</span>
                                    <span className="text-secondary small">Owned by <span className="text-gold">{asset.owner.slice(0,6)}...{asset.owner.slice(-4)}</span></span>
                                </div>
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
                                    
                                    {/* --- ACTION BUTTONS LOGIC --- */}
                                    
                                    {/* A. VISITOR (Not Connected) */}
                                    {!account ? (
                                        <button onClick={handleConnect} className="btn w-100 fw-bold" style={{ ...GOLD_BTN_STYLE, height: '50px' }}>
                                            Connect Wallet to Buy
                                        </button>
                                    ) : (
                                        // B. CONNECTED USER
                                        listing ? (
                                            !isOwner ? (
                                                // BUYER VIEW
                                                !isOfferMode ? (
                                                    <div className="d-flex gap-2">
                                                        <TransactionButton
                                                            transaction={() => buyFromListing({
                                                                contract: marketplaceContract,
                                                                listingId: listing.id,
                                                                recipient: account?.address || "",
                                                                quantity: BigInt(1),
                                                            })}
                                                            onTransactionConfirmed={() => showModal('success', 'Purchase Successful!', 'You have successfully purchased this asset.')}
                                                            onError={(e) => showModal('error', 'Transaction Info', 'Check wallet balance.')}
                                                            style={{ ...GOLD_BTN_STYLE, flex: 1, height: '50px' }}
                                                        >
                                                            Buy Now
                                                        </TransactionButton>
                                                        <button 
                                                            onClick={() => setIsOfferMode(true)} 
                                                            className="btn fw-bold flex-grow-1" 
                                                            style={{ ...OUTLINE_BTN_STYLE, height: '50px' }}
                                                        >
                                                            Make Offer
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // MAKE OFFER (SMART WRAP LOGIC)
                                                    <div className="d-flex flex-column gap-2">
                                                        <input 
                                                            type="number" 
                                                            className="form-control bg-dark text-white border-secondary" 
                                                            placeholder="Offer Price (POL)" 
                                                            value={offerPrice} 
                                                            onChange={(e) => setOfferPrice(e.target.value)} 
                                                        />
                                                        <div className="d-flex gap-2">
                                                            <TransactionButton
                                                                transaction={async () => {
                                                                    if (!offerPrice || !tokenId) throw new Error("Missing Parameters");
                                                                    
                                                                    // UPDATED: Correct Thirdweb V5 Parameters
                                                                    return makeOffer({
                                                                        contract: marketplaceContract,
                                                                        assetContractAddress: NFT_COLLECTION_ADDRESS,
                                                                        tokenId: BigInt(tokenId),
                                                                        totalOffer: offerPrice, 
                                                                        currencyContractAddress: WPOL_ADDRESS,
                                                                        offerExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 Days
                                                                    });
                                                                }}
                                                                onTransactionConfirmed={() => {
                                                                    showModal('success', 'Offer Sent!', 'Your offer has been submitted successfully.');
                                                                    setIsOfferMode(false);
                                                                }}
                                                                onError={(e) => {
                                                                    console.error(e);
                                                                    // More informative error message
                                                                    showModal('error', 'Offer Failed', 'Swap Failed or Insufficient POL for Gas. Please ensure you have enough POL and try wrapping manually.');
                                                                }}
                                                                style={{ ...GOLD_BTN_STYLE, flex: 1 }}
                                                            >
                                                                Confirm Offer
                                                            </TransactionButton>
                                                            <button onClick={() => setIsOfferMode(false)} className="btn btn-outline-secondary">Cancel</button>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                // OWNER VIEW: Cancel Listing
                                                <TransactionButton
                                                    transaction={() => cancelListing({ contract: marketplaceContract, listingId: listing.id })}
                                                    onTransactionConfirmed={() => showModal('success', 'Listing Cancelled', 'Your asset has been removed from the market.')}
                                                    onError={(e) => showModal('error', 'Cancellation Info', 'Failed to cancel listing.')}
                                                    style={{ ...GOLD_BTN_STYLE, width: '100%', height: '50px', background: '#333', color: '#fff', border: '1px solid #555' }}
                                                >
                                                    Cancel Listing
                                                </TransactionButton>
                                            )
                                        ) : (
                                            // C. NOT LISTED (Owner Only)
                                            isOwner ? (
                                                !isListingMode ? (
                                                    <button onClick={() => setIsListingMode(true)} className="btn w-100 fw-bold" style={{ ...GOLD_BTN_STYLE, height: '50px' }}>
                                                        List for Sale
                                                    </button>
                                                ) : (
                                                    <div className="d-flex flex-column gap-2">
                                                        <input type="number" className="form-control bg-dark text-white border-secondary" placeholder="Price (POL)" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
                                                        <div className="d-flex gap-2">
                                                            {!isApproved ? (
                                                                <TransactionButton
                                                                    transaction={() => setApprovalForAll({ contract: nftContract, operator: MARKETPLACE_ADDRESS, approved: true })}
                                                                    onTransactionConfirmed={() => { showModal('success', 'Market Approved', 'Your wallet is now ready.'); setIsApproved(true); }}
                                                                    onError={(e) => showModal('error', 'Approval Info', 'Approval cancelled.')}
                                                                    style={{ ...GOLD_BTN_STYLE, flex: 1, backgroundColor: '#fff', color: '#000' }}
                                                                >
                                                                    1. Approve Market
                                                                </TransactionButton>
                                                            ) : (
                                                                <TransactionButton
                                                                    transaction={() => {
                                                                        if (!tokenId) throw new Error("Invalid Token ID");
                                                                        const start = new Date();
                                                                        const end = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000); 
                                                                        return createListing({
                                                                            contract: marketplaceContract,
                                                                            assetContractAddress: NFT_COLLECTION_ADDRESS,
                                                                            tokenId: BigInt(tokenId),
                                                                            pricePerToken: sellPrice,
                                                                            currencyContractAddress: NATIVE_TOKEN_ADDRESS,
                                                                            startTimestamp: start,
                                                                            endTimestamp: end
                                                                        });
                                                                    }}
                                                                    onTransactionConfirmed={() => showModal('success', 'Asset Listed!', `Your asset is now listed for ${sellPrice} POL.`)}
                                                                    onError={(e) => { console.error(e); showModal('error', 'Listing Info', 'Process interrupted.'); }}
                                                                    style={{ ...GOLD_BTN_STYLE, flex: 1 }}
                                                                >
                                                                    2. Confirm List
                                                                </TransactionButton>
                                                            )}
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
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h5 className="text-white fw-bold mb-3">Price History</h5>
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
                                        <Tooltip contentStyle={{ backgroundColor: '#1e2329', borderColor: '#2a2e35', color: '#fff' }} />
                                        <Area type="monotone" dataKey="price" stroke="#FCD535" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                                    </AreaChart>
                                </ResponsiveContainer>
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
