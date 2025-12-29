'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useParams } from 'next/navigation';
// استخدام النظام اليدوي useSendTransaction
import { useActiveAccount, ConnectButton, useSendTransaction } from "thirdweb/react";
import { prepareContractCall, toWei, toTokens, getContract, readContract, NATIVE_TOKEN_ADDRESS } from "thirdweb";
import { createWallet, walletConnect } from "thirdweb/wallets"; 
import { 
    createListing, 
    buyFromListing, 
    getAllValidListings,
    cancelListing,
    makeOffer,
    acceptOffer, 
    getAllValidOffers 
} from "thirdweb/extensions/marketplace";
import { setApprovalForAll, isApprovedForAll } from "thirdweb/extensions/erc721";
import { balanceOf } from "thirdweb/extensions/erc20";
import { client } from "@/lib/client"; 
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS, NETWORK_CHAIN } from '@/data/config';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- WALLET CONFIG ---
const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  walletConnect(),
];

// --- CONSTANTS ---
const WPOL_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; 
const THEME_BG = '#0d1117'; 
const CARD_BG = '#161b22';
const BTN_GRADIENT = 'linear-gradient(135deg, #FBF5B7 0%, #BF953F 25%, #AA771C 50%, #BF953F 75%, #FBF5B7 100%)';

const mockChartData = [
  { name: 'Dec 1', price: 10 },
  { name: 'Dec 10', price: 12 },
  { name: 'Dec 20', price: 11 },
  { name: 'Today', price: 14 },
];

// --- HELPER FUNCTIONS ---
const getHeroStyles = (tier: string) => {
    switch(tier?.toLowerCase()) {
        case 'immortal': return { bg: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '1px solid #FCD535', textColor: '#FCD535', shadow: '0 0 30px rgba(252, 213, 53, 0.15)' };
        case 'elite': return { bg: 'linear-gradient(135deg, #1a0505 0%, #2a0a0a 100%)', border: '1px solid #ff4d4d', textColor: '#ff4d4d', shadow: '0 0 30px rgba(255, 77, 77, 0.15)' };
        default: return { bg: '#161b22', border: '1px solid #333', textColor: '#ffffff', shadow: 'none' };
    }
};

const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
};

// --- MODAL COMPONENT ---
const CustomModal = ({ isOpen, type, title, message, actionBtn, secondaryBtn, onClose }: any) => {
    if (!isOpen) return null;
    const isSuccess = type === 'success';
    const borderStyle = isSuccess ? '1px solid #FCD535' : '1px solid #333';
    const iconColor = isSuccess ? '#FCD535' : (type === 'error' ? '#dc3545' : '#FCD535');

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
            <div style={{
                backgroundColor: CARD_BG, 
                border: borderStyle,
                borderRadius: '20px',
                padding: '30px', width: '100%', maxWidth: '420px', textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)', position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#666', fontSize: '24px', cursor: 'pointer', zIndex: 10 }}>
                    <i className="bi bi-x-lg"></i>
                </button>

                <div className="mb-3">
                    {isSuccess ? 
                        <i className="bi bi-check-circle-fill" style={{fontSize: '3.5rem', color: iconColor}}></i> : 
                        <i className="bi bi-info-circle-fill" style={{fontSize: '3.5rem', color: iconColor}}></i>
                    }
                </div>

                <h4 className="text-white fw-bold mb-3" style={{ fontSize: '22px' }}>{title}</h4>
                <p className="text-secondary mb-4" style={{ fontSize: '15px', lineHeight: '1.6' }}>{message}</p>
                
                <div className="d-flex flex-column gap-2">
                    {actionBtn}
                    {secondaryBtn}
                    {!actionBtn && !secondaryBtn && (
                        <button onClick={onClose} className="btn w-100 fw-bold py-3" style={{ background: isSuccess ? BTN_GRADIENT : '#333', color: isSuccess ? '#000' : '#fff', border: '1px solid #555', borderRadius: '8px' }}>
                            {isSuccess ? 'Continue' : 'Close'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- CONTRACTS ---
const marketplaceContract = getContract({ client, chain: NETWORK_CHAIN, address: MARKETPLACE_ADDRESS });
const nftContract = getContract({ client, chain: NETWORK_CHAIN, address: NFT_COLLECTION_ADDRESS });
const wpolContract = getContract({ client, chain: NETWORK_CHAIN, address: WPOL_ADDRESS });

function AssetPage() {
    const params = useParams();
    const account = useActiveAccount();
    
    // --- MANUAL TRANSACTION HOOK ---
    const { mutate: sendTx, isPending } = useSendTransaction();

    // State
    const [asset, setAsset] = useState<any | null>(null);
    const [listing, setListing] = useState<any | null>(null);
    const [offersList, setOffersList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Logic
    const [isOwner, setIsOwner] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    
    // Inputs
    const [sellPrice, setSellPrice] = useState('10');
    const [offerPrice, setOfferPrice] = useState('');
    const [isListingMode, setIsListingMode] = useState(false);
    const [isOfferMode, setIsOfferMode] = useState(false);
    
    // Wallet Logic
    const [wpolBalance, setWpolBalance] = useState<number>(0);
    const [wpolAllowance, setWpolAllowance] = useState<number>(0);
    
    const [modal, setModal] = useState({ isOpen: false, type: 'loading', title: '', message: '', actionBtn: null as any, secondaryBtn: null as any });

    const rawId = params?.id;
    const tokenId = Array.isArray(rawId) ? rawId[0] : rawId;

    // --- 1. FETCH ASSET ---
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
        } catch (error) { console.error("Asset fetch error:", error); }
    };

    // --- 2. FETCH OFFERS (WITH DEDUPLICATION) ---
    // هذا الجزء هو الذي يحل مشكلة تكرار الأسماء
    const fetchOffers = async () => {
        if (!tokenId) return;
        try {
            const allOffers = await getAllValidOffers({ contract: marketplaceContract });
            if (allOffers && Array.isArray(allOffers)) {
                // 1. الفلترة حسب الرمز
                const tokenOffers = allOffers.filter(o => 
                    o.assetContractAddress.toLowerCase() === NFT_COLLECTION_ADDRESS.toLowerCase() && 
                    o.tokenId.toString() === tokenId.toString()
                );

                // 2. إزالة التكرار (يأخذ أحدث عرض لكل شخص فقط)
                const uniqueOffersMap = new Map();
                tokenOffers.forEach(offer => {
                    const address = offer.offerorAddress;
                    // إذا لم يكن موجوداً أو إذا كان العرض الحالي أحدث (ID أكبر)
                    if (!uniqueOffersMap.has(address) || Number(offer.id) > Number(uniqueOffersMap.get(address).id)) {
                        uniqueOffersMap.set(address, offer);
                    }
                });

                // 3. تحويل Map إلى مصفوفة وترتيبها
                const cleanedOffers = Array.from(uniqueOffersMap.values())
                    .sort((a: any, b: any) => Number(b.id) - Number(a.id));

                setOffersList(cleanedOffers);
            } else {
                setOffersList([]);
            }
        } catch (e) {
            console.warn("Offers fetch warning:", e);
            setOffersList([]); 
        }
    };

    // --- 3. CHECK LISTING (ANTI-DUPLICATE) ---
    const checkListing = async () => {
        if (!tokenId) return;
        try {
            const listings = await getAllValidListings({ contract: marketplaceContract, start: 0, count: BigInt(100) });
            const foundListing = listings
                .filter(l => l.asset.id.toString() === tokenId.toString())
                .sort((a, b) => Number(b.id) - Number(a.id))[0];
            setListing(foundListing || null);
        } catch (e) { console.error("Market Error", e); }
    };

    // --- 4. WALLET DATA ---
    const refreshWpolData = useCallback(async () => {
        if (account) {
            try {
                const balanceBigInt = await balanceOf({ contract: wpolContract, address: account.address });
                setWpolBalance(Number(toTokens(balanceBigInt, 18)));
                const allowanceBigInt = await readContract({
                    contract: wpolContract,
                    method: "function allowance(address, address) view returns (uint256)",
                    params: [account.address, MARKETPLACE_ADDRESS]
                });
                setWpolAllowance(Number(toTokens(allowanceBigInt, 18)));
            } catch (e) { console.error("WPOL Error", e); }
        }
    }, [account]);

    useEffect(() => {
        if (tokenId) {
            setLoading(true);
            Promise.all([fetchAssetData(), checkListing(), fetchOffers()])
                .then(() => setLoading(false))
                .catch(() => setLoading(false));
        }
    }, [tokenId, account]);

    useEffect(() => {
        if (!account || !isOfferMode) return;
        refreshWpolData();
        const interval = setInterval(refreshWpolData, 5000);
        return () => clearInterval(interval);
    }, [isOfferMode, account, refreshWpolData]);

    const closeModal = () => {
        setModal({ ...modal, isOpen: false });
        if (modal.type === 'success') {
            fetchOffers(); 
            fetchAssetData(); 
            checkListing();
        }
    };

    // --- HANDLERS (MANUAL EXECUTION) ---
    const executeTx = (txPromise: Promise<any>, successMsg: string) => {
        txPromise.then((tx) => {
            sendTx(tx, {
                onSuccess: () => {
                    setModal({ isOpen: true, type: 'success', title: 'Success', message: successMsg, actionBtn: null, secondaryBtn: null });
                    fetchAssetData();
                    fetchOffers();
                    checkListing();
                    refreshWpolData();
                    setIsListingMode(false);
                    setIsOfferMode(false);
                },
                onError: (err) => {
                    setModal({ isOpen: true, type: 'error', title: 'Failed', message: err.message, actionBtn: null, secondaryBtn: null });
                }
            });
        }).catch((err) => {
            console.error("Tx Prep Failed", err);
        });
    };

    const handleBuy = () => {
        if (!listing || !account) return;
        const tx = buyFromListing({ contract: marketplaceContract, listingId: listing.id, recipient: account.address, quantity: BigInt(1) });
        executeTx(Promise.resolve(tx), "Asset Purchased Successfully!");
    };

    const handleApprove = () => {
        if (!offerPrice) return;
        const tx = prepareContractCall({ contract: wpolContract, method: "function approve(address, uint256)", params: [MARKETPLACE_ADDRESS, toWei(offerPrice.toString())] });
        executeTx(Promise.resolve(tx), "WPOL Approved successfully!");
    };

    const handleOffer = () => {
        if (!offerPrice || !tokenId) return;
        const tx = makeOffer({
            contract: marketplaceContract,
            assetContractAddress: NFT_COLLECTION_ADDRESS,
            tokenId: BigInt(tokenId),
            totalOffer: offerPrice,
            currencyContractAddress: WPOL_ADDRESS,
            offerExpiresAt: new Date(Date.now() + 3 * 86400000)
        });
        executeTx(Promise.resolve(tx), "Offer Sent Successfully!");
    };

    const handleList = () => {
        if (!tokenId || !sellPrice) return;
        const tx = createListing({ contract: marketplaceContract, assetContractAddress: NFT_COLLECTION_ADDRESS, tokenId: BigInt(tokenId), pricePerToken: sellPrice, currencyContractAddress: NATIVE_TOKEN_ADDRESS });
        executeTx(Promise.resolve(tx), "Asset Listed Successfully!");
    };

    const handleApproveNft = () => {
        const tx = setApprovalForAll({ contract: nftContract, operator: MARKETPLACE_ADDRESS, approved: true });
        executeTx(Promise.resolve(tx), "NFT Approved for Listing!");
    };

    const handleCancelList = () => {
        if (!listing) return;
        const tx = cancelListing({ contract: marketplaceContract, listingId: listing.id });
        executeTx(Promise.resolve(tx), "Listing Cancelled!");
    };

    const handleAcceptOffer = (offerId: bigint) => {
        const tx = acceptOffer({ contract: marketplaceContract, offerId: offerId });
        executeTx(Promise.resolve(tx), "Offer Accepted! Asset Sold.");
    };

    const handleRecheckBalance = async () => {
        if (!account) return;
        await refreshWpolData();
        setModal({ ...modal, isOpen: false }); 
    };

    const handlePreOfferCheck = () => {
        const target = Number(offerPrice);
        if (wpolBalance >= target) return; 

        setModal({
            isOpen: true,
            type: 'info',
            title: 'Insufficient WPOL',
            message: `You need ${target} WPOL but have ${wpolBalance.toFixed(2)}. Please swap POL to WPOL in your wallet.`,
            actionBtn: null,
            secondaryBtn: (
                <button onClick={handleRecheckBalance} className="btn w-100 fw-bold py-3" style={{ background: BTN_GRADIENT, border: 'none', color: '#000', borderRadius: '8px' }}>
                    I Swapped - Check Balance
                </button>
            )
        });
    };

    if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center text-secondary" style={{ backgroundColor: THEME_BG }}>Loading...</div>;
    if (!asset) return <div className="vh-100 d-flex justify-content-center align-items-center text-white" style={{ backgroundColor: THEME_BG }}>Asset Not Found</div>;
    
    const style = getHeroStyles(asset.tier);
    const targetAmount = offerPrice ? Number(offerPrice) : 0;
    const hasEnoughWPOL = wpolBalance >= targetAmount;
    const hasAllowance = hasEnoughWPOL && wpolAllowance >= targetAmount && targetAmount > 0;

    return (
        <main style={{ backgroundColor: THEME_BG, minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
            <CustomModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} actionBtn={modal.actionBtn} secondaryBtn={modal.secondaryBtn} onClose={closeModal} />

            <div className="container py-4">
                <div className="d-flex align-items-center gap-2 text-secondary mb-4" style={{ fontSize: '14px' }}>
                    <Link href="/market" className="text-decoration-none text-secondary">Market</Link>
                    <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
                    <span className="text-white">{asset.name}</span>
                </div>

                <div className="row g-5">
                    {/* LEFT COLUMN */}
                    <div className="col-lg-5">
                         <div className="rounded-4 d-flex justify-content-center align-items-center position-relative overflow-hidden" 
                              style={{ background: CARD_BG, border: '1px solid #333', minHeight: '500px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                            <div style={{ width: '85%', aspectRatio: '1/1', background: style.bg, border: style.border, borderRadius: '16px', boxShadow: style.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '10px', color: style.textColor, marginBottom: '10px' }}>GEN-0 #00{asset.id}</p>
                                    <h1 style={{ fontSize: '42px', fontFamily: 'serif', fontWeight: '900', color: style.textColor, margin: '10px 0' }}>{asset.name}</h1>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 p-4 rounded-3" style={{ backgroundColor: CARD_BG, border: '1px solid #333' }}>
                             <div className="d-flex align-items-center gap-2 mb-3">
                                <i className="bi bi-info-circle" style={{ color: '#FCD535' }}></i>
                                <span className="fw-bold text-white">Description</span>
                            </div>
                            <p className="text-secondary" style={{ fontSize: '14px', lineHeight: '1.6' }}>{asset.description}</p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-lg-7">
                        <div className="mb-3">
                            <h1 className="text-white fw-bold mb-1" style={{ fontSize: '32px' }}>{asset.name}</h1>
                            <span className="text-secondary small">Owned by <span style={{ color: '#FCD535' }}>{asset.owner.slice(0,6)}...{asset.owner.slice(-4)}</span></span>
                        </div>

                        <div className="p-4 rounded-3 mt-3 mb-4" style={{ backgroundColor: CARD_BG, border: '1px solid #333' }}>
                            <div className="text-secondary small mb-1">Current Price</div>
                            <h2 className="text-white fw-bold mb-4" style={{ fontSize: '30px' }}>
                                {listing ? `${listing.currencyValuePerToken.displayValue} ${listing.currencyValuePerToken.symbol}` : `${asset.price} POL`}
                            </h2>

                            {!account ? (
                                <div style={{ width: '100%', height: '50px' }}>
                                    {/* زر الاتصال الرسمي الآمن */}
                                    <ConnectButton 
                                        client={client} 
                                        wallets={wallets}
                                        connectButton={{
                                            style: { width: '100%', height: '50px', background: BTN_GRADIENT, color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '10px', fontSize: '16px' },
                                            label: "Connect Wallet"
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {listing ? (
                                        !isOwner ? (
                                            !isOfferMode ? (
                                                <div className="d-flex gap-3">
                                                    <button onClick={handleBuy} disabled={isPending} className="btn w-100 fw-bold" style={{ background: BTN_GRADIENT, color: '#000', height: '50px', borderRadius: '10px', flex: 1, border: 'none' }}>
                                                        {isPending ? 'Processing...' : 'Buy Now'}
                                                    </button>
                                                    <button onClick={() => setIsOfferMode(true)} className="btn fw-bold flex-grow-1 text-white" style={{ background: 'transparent', border: '1px solid #FCD535', height: '50px', borderRadius: '10px' }}>
                                                        Make Offer
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-4 rounded-3" style={{ backgroundColor: '#0d1117', border: '1px solid #333' }}>
                                                    <div className="d-flex justify-content-between text-secondary small mb-2">
                                                        <span>Balance: {wpolBalance.toFixed(2)} WPOL</span>
                                                        <span>Required: {targetAmount} WPOL</span>
                                                    </div>
                                                    <input 
                                                        type="number" 
                                                        className="form-control bg-dark text-white border-secondary mb-3" 
                                                        placeholder="Enter Offer Amount" 
                                                        value={offerPrice} 
                                                        onChange={(e) => setOfferPrice(e.target.value)}
                                                        style={{ height: '50px', fontSize: '18px' }}
                                                    />
                                                    
                                                    {!hasEnoughWPOL ? (
                                                        <button onClick={handlePreOfferCheck} className="btn w-100 fw-bold py-3" style={{ background: BTN_GRADIENT, border: 'none', color: '#000', borderRadius: '8px' }}>
                                                            Check Balance
                                                        </button>
                                                    ) : !hasAllowance ? (
                                                        <button onClick={handleApprove} disabled={isPending} className="btn w-100 fw-bold" style={{ background: BTN_GRADIENT, color: '#000', border: 'none', fontWeight: 'bold', borderRadius: '8px', height: '50px' }}>
                                                            {isPending ? 'Approving...' : 'Step 1: Approve WPOL'}
                                                        </button>
                                                    ) : (
                                                        <button onClick={handleOffer} disabled={isPending} className="btn w-100 fw-bold" style={{ background: BTN_GRADIENT, color: '#000', border: 'none', fontWeight: 'bold', borderRadius: '8px', height: '50px' }}>
                                                            {isPending ? 'Sending...' : 'Step 2: Confirm Offer'}
                                                        </button>
                                                    )}
                                                    <button onClick={() => setIsOfferMode(false)} className="btn btn-link text-secondary w-100 text-decoration-none mt-2">Cancel</button>
                                                </div>
                                            )
                                        ) : (
                                            <button onClick={handleCancelList} disabled={isPending} className="btn w-100" style={{ background: '#333', color: '#fff', borderRadius: '10px', height: '50px' }}>
                                                {isPending ? 'Cancelling...' : 'Cancel Listing'}
                                            </button>
                                        )
                                    ) : (
                                        isOwner ? (
                                            !isListingMode ? (
                                                <button onClick={() => setIsListingMode(true)} className="btn w-100 fw-bold text-dark" style={{ background: BTN_GRADIENT, height: '50px', borderRadius: '10px' }}>List Item</button>
                                            ) : (
                                                <div className="d-flex flex-column gap-2">
                                                    <input type="number" className="form-control bg-dark text-white" placeholder="Price (POL)" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} style={{ height: '50px' }} />
                                                    <div className="d-flex gap-2">
                                                    {!isApproved ? (
                                                        <button onClick={handleApproveNft} disabled={isPending} className="btn" style={{ flex: 1, background: '#fff', color: '#000', borderRadius: '10px', height: '50px' }}>
                                                            {isPending ? 'Approving...' : 'Approve'}
                                                        </button>
                                                    ) : (
                                                        <button onClick={handleList} disabled={isPending} className="btn" style={{ flex: 1, background: BTN_GRADIENT, color: '#000', borderRadius: '10px', height: '50px' }}>
                                                            {isPending ? 'Listing...' : 'Confirm'}
                                                        </button>
                                                    )}
                                                    <button onClick={() => setIsListingMode(false)} className="btn btn-outline-secondary" style={{ borderRadius: '10px', height: '50px' }}>Cancel</button>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <button disabled className="btn w-100 disabled" style={{ background: '#333', color: '#666', borderRadius: '10px', height: '50px' }}>Not Listed</button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* CHART */}
                        <div className="mb-4">
                            <h5 className="text-white fw-bold mb-3">Price History</h5>
                            <div className="rounded-3 p-3" style={{ backgroundColor: CARD_BG, border: '1px solid #333', height: '250px' }}>
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

                        {/* OFFERS TABLE (CLEANED) */}
                        <div className="mb-5">
                            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-secondary">
                                <i className="bi bi-list-ul" style={{ color: '#FCD535' }}></i>
                                <h5 className="text-white fw-bold mb-0">Offers</h5>
                            </div>
                            <div className="rounded-3 overflow-auto" style={{ border: '1px solid #333', backgroundColor: CARD_BG }}>
                                <table className="table mb-0" style={{ width: '100%', backgroundColor: 'transparent' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #333' }}>
                                            <th className="fw-normal py-3 ps-3" style={{ border: 'none', color: '#888', fontSize: '13px', background: 'transparent' }}>Price</th>
                                            <th className="fw-normal py-3" style={{ border: 'none', color: '#888', fontSize: '13px', background: 'transparent' }}>From</th>
                                            <th className="fw-normal py-3 text-end pe-3" style={{ border: 'none', color: '#888', fontSize: '13px', background: 'transparent' }}>Date</th>
                                            {isOwner && <th className="fw-normal py-3 text-center" style={{ border: 'none', color: '#888', fontSize: '13px', background: 'transparent' }}>Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {offersList && offersList.length > 0 ? (
                                            offersList.map((offer, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #333', background: 'transparent' }}>
                                                    <td className="ps-3 fw-bold text-white" style={{ border: 'none', verticalAlign: 'middle', background: 'transparent' }}>
                                                        {offer.currencyValue ? offer.currencyValue.displayValue : (offer.totalPrice ? toTokens(offer.totalPrice, 18) : '0')} WPOL
                                                    </td>
                                                    <td style={{ color: '#FCD535', border: 'none', verticalAlign: 'middle', fontSize: '13px', background: 'transparent' }}>
                                                        {offer.offerorAddress ? `${offer.offerorAddress.slice(0,4)}..${offer.offerorAddress.slice(-4)}` : 'Unknown'}
                                                    </td>
                                                    <td className="text-end pe-3 text-secondary" style={{ border: 'none', verticalAlign: 'middle', whiteSpace: 'nowrap', fontSize: '11px', background: 'transparent' }}>
                                                        {offer.endTimeInSeconds ? new Date(Number(offer.endTimeInSeconds || 0) * 1000).toLocaleDateString('en-US') : '-'}
                                                    </td>
                                                    {isOwner && (
                                                        <td className="text-center" style={{ border: 'none', verticalAlign: 'middle', padding: '10px 5px', background: 'transparent' }}>
                                                            <button 
                                                                onClick={() => handleAcceptOffer(offer.id)}
                                                                disabled={isPending}
                                                                className="btn"
                                                                style={{ background: BTN_GRADIENT, color: '#000', fontWeight: 'bold', padding: '4px 10px', fontSize: '12px', borderRadius: '6px', border: 'none', minWidth: '60px', height: '32px' }}
                                                            >
                                                                {isPending ? '...' : 'Accept'}
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={isOwner ? 4 : 3} className="text-center py-5 text-secondary" style={{ border: 'none', background: 'transparent' }}>
                                                    <i className="bi bi-inbox fs-3 d-block mb-2 opacity-50"></i>
                                                    No active offers yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .btn:focus { box-shadow: none; }
                input:focus { border-color: #FCD535 !important; box-shadow: none; }
                table, tr, td, th { background-color: transparent !important; }
            `}</style>
        </main>
    );
}
export default dynamicImport(() => Promise.resolve(AssetPage), { ssr: false });

