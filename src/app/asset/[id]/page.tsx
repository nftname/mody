'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useWriteContract, usePublicClient, useBalance } from "wagmi";
import { parseAbi, formatEther, parseEther, erc721Abi, erc20Abi } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';
// استيراد ملف الاتصال بـ Supabase
import { supabase } from '@/lib/supabase'; 
// @ts-ignore
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WPOL_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; 
const GOLD_GRADIENT = 'linear-gradient(to bottom, #FFD700 0%, #E6BE03 25%, #B3882A 50%, #E6BE03 75%, #FFD700 100%)';
const GOLD_BTN_STYLE = { background: '#FCD535', color: '#000', border: 'none', fontWeight: 'bold' as const };
const OUTLINE_BTN_STYLE = { background: 'transparent', color: '#FCD535', border: '1px solid #FCD535', fontWeight: 'bold' as const };

// مدة العرض (30 يوم)
const OFFER_DURATION = 30 * 24 * 60 * 60; 

// ABI مختصر للتعامل مع الماركت (للشراء والبيع فقط)
const MARKETPLACE_ABI = parseAbi([
    "function listItem(uint256 tokenId, uint256 price) external",
    "function buyItem(uint256 tokenId) external payable",
    "function cancelListing(uint256 tokenId) external",
    "function listings(uint256 tokenId) view returns (address seller, uint256 price, bool exists)"
]);

// --- Smart Countdown Formatter (نفس الكود الخاص بك بالضبط) ---
const formatDuration = (expirationTimestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const seconds = expirationTimestamp - now;

    if (seconds <= 0) return "Expired";
    
    const days = Math.floor(seconds / (3600 * 24));
    if (days > 0) return `${days}d`; 
    
    const hours = Math.floor(seconds / 3600);
    if (hours > 0) return `${hours}h`; 
    
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m`; 
    
    return `${seconds}s`;
};

// Helper: معالجة صور IPFS
const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
};

// مكون النافذة المنبثقة (Modal)
const CustomModal = ({ isOpen, type, title, message, onClose, onSwap }: any) => {
    if (!isOpen) return null;
    let icon = <div className="spinner-border text-warning" role="status"></div>;
    let iconColor = '#FCD535';

    if (type === 'success') { icon = <i className="bi bi-check-circle-fill" style={{ fontSize: '40px', color: '#28a745' }}></i>; iconColor = '#28a745'; }
    else if (type === 'error') { icon = <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '40px', color: '#dc3545' }}></i>; iconColor = '#dc3545'; }
    else if (type === 'swap') { icon = <i className="bi bi-wallet2" style={{ fontSize: '40px', color: '#FCD535' }}></i>; }

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="fade-in" style={{ backgroundColor: '#161b22', border: `1px solid ${iconColor}`, borderRadius: '16px', padding: '25px', width: '90%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 0 40px rgba(0,0,0,0.6)', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}><i className="bi bi-x-lg"></i></button>
                <div className="mb-3">{icon}</div>
                <h4 className="text-white fw-bold mb-2">{title}</h4>
                <p className="text-secondary mb-4" style={{ fontSize: '14px' }}>{message}</p>
                {type === 'swap' && (
                     <a href="https://app.uniswap.org/" target="_blank" rel="noopener noreferrer" className="btn w-100 fw-bold" style={{ background: GOLD_GRADIENT, border: 'none', color: '#000', padding: '10px', borderRadius: '8px' }}>
                        Swap on Uniswap <i className="bi bi-box-arrow-up-right ms-1"></i>
                    </a>
                )}
                {type === 'error' && <button onClick={onClose} className="btn w-100 btn-outline-secondary">Close</button>}
                {type === 'success' && <button onClick={onClose} className="btn fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '8px', minWidth: '100px' }}>Done</button>}
            </div>
        </div>
    );
};

const getHeroStyles = (tier: string) => {
    switch(tier?.toLowerCase()) {
        case 'immortal': return { bg: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 100%)', border: '1px solid rgba(252, 213, 53, 0.5)', shadow: '0 0 80px rgba(252, 213, 53, 0.15), inset 0 0 40px rgba(0,0,0,0.8)', textColor: GOLD_GRADIENT };
        case 'elite': return { bg: 'linear-gradient(135deg, #2b0505 0%, #4a0a0a 100%)', border: '1px solid rgba(255, 50, 50, 0.5)', shadow: '0 0 80px rgba(255, 50, 50, 0.2), inset 0 0 40px rgba(0,0,0,0.8)', textColor: GOLD_GRADIENT };
        case 'founder': return { bg: 'linear-gradient(135deg, #001f24 0%, #003840 100%)', border: '1px solid rgba(0, 128, 128, 0.4)', shadow: '0 0 60px rgba(0, 100, 100, 0.15), inset 0 0 40px rgba(0,0,0,0.9)', textColor: GOLD_GRADIENT };
        default: return { bg: '#000', border: '1px solid #333', shadow: 'none', textColor: '#fff' };
    }
};

const mockChartData = [ { name: 'Dec 1', price: 10 }, { name: 'Today', price: 12 } ];

// --- المكون الرئيسي ---
function AssetPage() {
    const params = useParams();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const { data: polBalanceData } = useBalance({ address });
    
    // States
    const [asset, setAsset] = useState<any | null>(null);
    const [listing, setListing] = useState<any | null>(null);
    const [offersList, setOffersList] = useState<any[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isListingMode, setIsListingMode] = useState(false);
    const [sellPrice, setSellPrice] = useState('10');
    
    const [isOfferMode, setIsOfferMode] = useState(false);
    const [offerPrice, setOfferPrice] = useState('');
    const [wpolBalance, setWpolBalance] = useState<number>(0);
    
    const [currentPage, setCurrentPage] = useState(1);
    const offersPerPage = 5;
    const [sortDesc, setSortDesc] = useState(true);

    const [modal, setModal] = useState({ isOpen: false, type: 'loading', title: '', message: '' });
    
    const rawId = params?.id;
    const tokenId = Array.isArray(rawId) ? rawId[0] : rawId;

    // 1. جلب بيانات الأصل (Blockchain)
    const fetchAssetData = useCallback(async () => {
        if (!tokenId || !publicClient) return;
        try {
            const tokenURI = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'tokenURI', args: [BigInt(tokenId)] });
            const metaRes = await fetch(resolveIPFS(tokenURI));
            const meta = metaRes.ok ? await metaRes.json() : {};
            const owner = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'ownerOf', args: [BigInt(tokenId)] });

            setAsset({
                id: tokenId,
                name: meta.name || `NNM #${tokenId}`,
                description: meta.description || "",
                tier: meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founder',
                price: meta.attributes?.find((a: any) => a.trait_type === 'Price')?.value || '10',
                owner: owner
            });

            if (address && owner.toLowerCase() === address.toLowerCase()) {
                setIsOwner(true);
                const approvedStatus = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'isApprovedForAll', args: [address, MARKETPLACE_ADDRESS as `0x${string}`] });
                setIsApproved(approvedStatus);
            } else {
                setIsOwner(false);
            }
        } catch (error) { console.error("Asset Error:", error); }
    }, [tokenId, address, publicClient]);

    // 2. التحقق من البيع (Blockchain)
    const checkListing = useCallback(async () => {
        if (!tokenId || !publicClient) return;
        try {
            const listingData = await publicClient.readContract({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'listings', args: [BigInt(tokenId)] });
            if (listingData[2] === true) {
                setListing({
                    id: tokenId,
                    seller: listingData[0],
                    pricePerToken: formatEther(listingData[1]),
                    currency: "POL"
                });
            } else {
                setListing(null);
            }
        } catch (e) { console.error("Listing Error", e); }
    }, [tokenId, publicClient]);

    // 3. جلب العروض (Supabase - بديل البلوكشين البطيء)
    const fetchOffers = useCallback(async () => {
        if (!tokenId) return;
        try {
            const { data, error } = await supabase
                .from('offers')
                .select('*')
                .eq('token_id', tokenId)
                .neq('status', 'cancelled') 
                .order('price', { ascending: false });

            if (error) throw error;

            if (data) {
                const formattedOffers = data.map((offer: any) => ({
                    id: offer.id,
                    bidder: offer.bidder_address,
                    price: offer.price.toString(),
                    expiration: offer.expiration, // سيتم تنسيقه لاحقاً
                    status: offer.status,
                    isMyOffer: address && offer.bidder_address.toLowerCase() === address.toLowerCase()
                }));
                setOffersList(formattedOffers);
            }
        } catch (e) { console.error("Supabase Error:", e); }
    }, [tokenId, address]);

    // التحقق من الرصيد
    const refreshWpolData = useCallback(async () => {
        if (address && publicClient) {
            try {
                const balanceBigInt = await publicClient.readContract({ address: WPOL_ADDRESS as `0x${string}`, abi: erc20Abi, functionName: 'balanceOf', args: [address] });
                setWpolBalance(Number(formatEther(balanceBigInt)));
            } catch (e) { console.error("WPOL Error", e); }
        }
    }, [address, publicClient]);

    useEffect(() => {
        if (tokenId && publicClient) {
            Promise.all([fetchAssetData(), checkListing(), fetchOffers()]).then(() => setLoading(false));
        }
    }, [tokenId, address, fetchAssetData, checkListing, fetchOffers, publicClient]);

    useEffect(() => {
        if (isOfferMode && address) refreshWpolData();
    }, [isOfferMode, address, refreshWpolData]);

    const showModal = (type: string, title: string, message: string) => setModal({ isOpen: true, type, title, message });
    const closeModal = () => { setIsPending(false); setModal({ ...modal, isOpen: false }); if (modal.type === 'success') { fetchOffers(); checkListing(); setIsListingMode(false); setIsOfferMode(false); setOfferPrice(''); } };

    // --- العمليات (Actions) ---

    // تقديم عرض (Database)
    const handleSubmitOffer = async () => {
        if (!address) return showModal('error', 'Connect Wallet', 'Please connect your wallet first.');
        if (!offerPrice) return;

        setIsPending(true);
        showModal('loading', 'Checking Wallet...', 'Verifying WPOL balance...');

        // التحقق من الرصيد
        if (wpolBalance < parseFloat(offerPrice)) {
            showModal('swap', 'Insufficient Funds', 'You do not have enough WPOL. Please swap POL to WPOL first.');
            setIsPending(false);
            return;
        }

        try {
            // الحفظ في Supabase
            const { error } = await supabase
                .from('offers')
                .insert([
                    {
                        token_id: tokenId,
                        bidder_address: address,
                        price: parseFloat(offerPrice),
                        expiration: Math.floor(Date.now() / 1000) + OFFER_DURATION, // استخدام مدة 30 يوم
                        status: 'active'
                    }
                ]);

            if (error) throw error;
            showModal('success', 'Offer Submitted!', 'Your offer is now live.');
        } catch (err: any) {
            console.error(err);
            showModal('error', 'Error', 'Failed to submit offer.');
        } finally {
            setIsPending(false);
        }
    };

    // قبول العرض
    const handleAcceptOffer = async (offerId: number) => {
        if (!isOwner) return;
        setIsPending(true);
        showModal('loading', 'Processing...', 'Closing deal...');
        try {
            const { error } = await supabase
                .from('offers')
                .update({ status: 'accepted' })
                .eq('id', offerId);
            if (error) throw error;
            showModal('success', 'Offer Accepted!', 'Deal closed successfully.');
        } catch (err) {
            showModal('error', 'Error', 'Failed to accept offer.');
        } finally {
            setIsPending(false);
        }
    };

    // إلغاء العرض
    const handleCancelOffer = async (offerId: number) => {
        setIsPending(true);
        try {
            const { error } = await supabase
                .from('offers')
                .update({ status: 'cancelled' })
                .eq('id', offerId);
            if(error) throw error;
            await fetchOffers();
            setIsPending(false);
        } catch(e) { console.error(e); setIsPending(false); }
    };

    // الشراء (On-Chain)
    const handleBuy = async () => {
        if (!listing) return;
        const priceNeeded = parseFloat(listing.pricePerToken);
        const currentPol = polBalanceData ? parseFloat(polBalanceData.formatted) : 0;
        if (currentPol < priceNeeded) return showModal('swap', 'Insufficient POL', 'You need more POL.');

        setIsPending(true);
        showModal('loading', 'Buying Asset', 'Confirm in wallet...');
        try {
            const hash = await writeContractAsync({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKETPLACE_ABI,
                functionName: 'buyItem',
                args: [BigInt(tokenId)],
                value: parseEther(listing.pricePerToken)
            });
            await publicClient!.waitForTransactionReceipt({ hash });
            showModal('success', 'Success!', 'Asset purchased.');
        } catch (err: any) {
            showModal('error', 'Failed', err.message?.slice(0, 100));
            setIsPending(false);
        }
    };

    // عرض للبيع (On-Chain)
    const handleList = async () => {
        setIsPending(true);
        showModal('loading', 'Listing Asset', 'Confirm in wallet...');
        try {
            const hash = await writeContractAsync({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKETPLACE_ABI,
                functionName: 'listItem',
                args: [BigInt(tokenId), parseEther(sellPrice)]
            });
            await publicClient!.waitForTransactionReceipt({ hash });
            showModal('success', 'Success!', 'Listed successfully.');
        } catch (err: any) {
            showModal('error', 'Failed', err.message?.slice(0, 100));
            setIsPending(false);
        }
    };

    // الموافقة (On-Chain)
    const handleApproveNft = async () => {
        setIsPending(true);
        showModal('loading', 'Approving Market', 'Confirm in wallet...');
        try {
            const hash = await writeContractAsync({
                address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                abi: erc721Abi,
                functionName: 'setApprovalForAll',
                args: [MARKETPLACE_ADDRESS as `0x${string}`, true]
            });
            await publicClient!.waitForTransactionReceipt({ hash });
            setIsApproved(true);
            showModal('success', 'Approved!', 'Now you can list.');
        } catch (err: any) {
            showModal('error', 'Failed', err.message?.slice(0, 100));
            setIsPending(false);
        }
    };

    // إلغاء البيع (On-Chain)
    const handleCancelList = async () => {
        setIsPending(true);
        showModal('loading', 'Cancelling...', 'Confirm in wallet...');
        try {
            const hash = await writeContractAsync({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKETPLACE_ABI,
                functionName: 'cancelListing',
                args: [BigInt(tokenId)]
            });
            await publicClient!.waitForTransactionReceipt({ hash });
            showModal('success', 'Success!', 'Listing cancelled.');
        } catch (err: any) {
            showModal('error', 'Failed', err.message?.slice(0, 100));
            setIsPending(false);
        }
    };

    const toggleSort = () => setSortDesc(!sortDesc);
    const sortedOffers = useMemo(() => {
        let sortable = [...offersList];
        sortable.sort((a, b) => {
            const pA = parseFloat(a.price);
            const pB = parseFloat(b.price);
            return sortDesc ? pB - pA : pA - pB;
        });
        return sortable;
    }, [offersList, sortDesc]);

    const indexOfLastOffer = currentPage * offersPerPage;
    const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
    const currentOffers = sortedOffers.slice(indexOfFirstOffer, indexOfLastOffer);
    const totalPages = Math.ceil(offersList.length / offersPerPage);

    if (loading) return <div className="vh-100 bg-black text-secondary d-flex justify-content-center align-items-center">Loading Asset...</div>;
    if (!asset) return <div className="vh-100 bg-black text-white d-flex justify-content-center align-items-center">Asset Not Found</div>;
    
    const style = getHeroStyles(asset.tier);

    return (
        <main style={{ backgroundColor: '#0b0e11', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
            <CustomModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onClose={closeModal} onSwap={() => window.open('https://app.uniswap.org/', '_blank')} />
            
            <div className="container py-3">
                <div className="d-flex align-items-center gap-2 text-secondary mb-4" style={{ fontSize: '14px' }}>
                    <Link href="/market" className="text-decoration-none text-secondary hover-gold">Market</Link>
                    <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
                    <span className="text-white">{asset.name}</span>
                </div>

                <div className="row g-5">
                    {/* الصورة (يسار) */}
                    <div className="col-lg-5">
                         <div className="rounded-4 d-flex justify-content-center align-items-center position-relative overflow-hidden" style={{ background: 'radial-gradient(circle, #161b22 0%, #0b0e11 100%)', border: '1px solid #2a2e35', minHeight: '500px' }}>
                            <div style={{ width: '85%', aspectRatio: '1/1', background: style.bg, border: style.border, borderRadius: '16px', boxShadow: style.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '10px', letterSpacing: '2px', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>GEN-0 #00{asset.id}</p>
                                    <h1 style={{ fontSize: '42px', fontFamily: 'serif', fontWeight: '900', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '10px 0' }}>{asset.name}</h1>
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

                    {/* البيانات (يمين) */}
                    <div className="col-lg-7">
                        <h1 className="text-white fw-bold mb-1" style={{ fontSize: '32px' }}>{asset.name}</h1>
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <span className="badge bg-warning text-dark">Gen-0</span>
                            <span className="text-secondary small">Owned by <span className="text-gold">{asset.owner.slice(0,6)}...{asset.owner.slice(-4)}</span></span>
                        </div>

                        {/* لوحة التحكم */}
                        <div className="p-4 rounded-3 mt-4 mb-4" style={{ backgroundColor: '#161b22', border: '1px solid #2a2e35' }}>
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <span className="text-secondary small d-block mb-1">Current Price</span>
                                    <div className="d-flex align-items-baseline gap-2">
                                        <h2 className="text-white fw-bold mb-0" style={{ fontSize: '36px' }}>
                                            {listing ? `${listing.pricePerToken} POL` : `${asset.price} POL`}
                                        </h2>
                                        {!listing && <span className="text-secondary small">â‰ˆ $12.50</span>}
                                    </div>
                                </div>
                                <div className="col-md-6 mt-3 mt-md-0">
                                    {!isConnected ? (
                                        <div style={{ width: '100%', height: '50px' }}><ConnectButton /></div>
                                    ) : (
                                        listing ? (
                                            !isOwner ? (
                                                <div className="d-flex gap-2">
                                                    <button onClick={handleBuy} disabled={isPending} className="btn fw-bold flex-grow-1" style={{ ...GOLD_BTN_STYLE, height: '50px' }}>Buy Now</button>
                                                    <button onClick={() => setIsOfferMode(true)} className="btn fw-bold flex-grow-1" style={{ ...OUTLINE_BTN_STYLE, height: '50px' }}>Make Offer</button>
                                                </div>
                                            ) : (
                                                <button onClick={handleCancelList} disabled={isPending} className="btn w-100 fw-bold" style={{ ...GOLD_BTN_STYLE, height: '50px' }}>Cancel Listing</button>
                                            )
                                        ) : (
                                            isOwner ? (
                                                !isListingMode ? (
                                                    <button onClick={() => setIsListingMode(true)} className="btn w-100 fw-bold" style={{ ...GOLD_BTN_STYLE, height: '50px' }}>List for Sale</button>
                                                ) : (
                                                    <div className="d-flex flex-column gap-2">
                                                        <input type="number" className="form-control bg-dark text-white border-secondary" placeholder="Price (POL)" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
                                                        <div className="d-flex gap-2">
                                                            {!isApproved ? (
                                                                <button onClick={handleApproveNft} disabled={isPending} className="btn fw-bold flex-grow-1" style={{ ...GOLD_BTN_STYLE, backgroundColor: '#fff', color: '#000' }}>Approve NFT</button>
                                                            ) : (
                                                                <button onClick={handleList} disabled={isPending} className="btn fw-bold flex-grow-1" style={GOLD_BTN_STYLE}>Confirm List</button>
                                                            )}
                                                            <button onClick={() => setIsListingMode(false)} className="btn btn-outline-secondary">Cancel</button>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="d-flex gap-2">
                                                    <button className="btn w-50 fw-bold disabled" style={{ height: '50px', background: '#333', color: '#888', border: 'none' }}>Not Listed</button>
                                                    <button onClick={() => setIsOfferMode(true)} className="btn w-50 fw-bold text-white" style={{ height: '50px', background: 'transparent', border: '1px solid #2a2e35' }}>Make Offer</button>
                                                </div>
                                            )
                                        )
                                    )}
                                </div>
                            </div>
                            
                            {/* إدخال العرض */}
                            {isOfferMode && (
                                <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
                                    <div className="d-flex justify-content-between text-secondary small mb-2">
                                        <span>Balance: {wpolBalance.toFixed(2)} WPOL</span>
                                    </div>
                                    <input type="number" className="form-control bg-dark text-white border-secondary mb-2" placeholder="Amount (WPOL)" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
                                    <div className="d-flex gap-2">
                                        <button onClick={handleSubmitOffer} disabled={isPending} className="btn fw-bold flex-grow-1" style={GOLD_BTN_STYLE}>{isPending ? 'Saving...' : 'Confirm Offer'}</button>
                                        <button onClick={() => setIsOfferMode(false)} className="btn btn-outline-secondary">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chart (نفسه لم يتغير) */}
                        <div className="mb-4">
                            <h5 className="text-white fw-bold mb-3">Price History</h5>
                            <div className="rounded-3 p-3" style={{ backgroundColor: '#161b22', border: '1px solid #2a2e35', height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockChartData}>
                                        <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FCD535" stopOpacity={0.3}/><stop offset="95%" stopColor="#FCD535" stopOpacity={0}/></linearGradient></defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2e35" vertical={false} />
                                        <XAxis dataKey="name" stroke="#6c757d" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6c757d" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e2329', borderColor: '#2a2e35', color: '#fff' }} />
                                        <Area type="monotone" dataKey="price" stroke="#FCD535" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* جدول العروض (Supabase) */}
                        <div className="mb-5">
                            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-secondary">
                                <i className="bi bi-list-ul text-gold"></i>
                                <h5 className="text-white fw-bold mb-0">Offers</h5>
                                <button onClick={fetchOffers} className="btn btn-sm btn-outline-secondary border-0 ms-auto"><i className="bi bi-arrow-clockwise"></i></button>
                            </div>
                            <div className="rounded-3 overflow-hidden" style={{ border: '1px solid #333', backgroundColor: '#161b22' }}>
                                <div className="table-responsive">
                                    <table className="table mb-0 text-white" style={{ backgroundColor: 'transparent' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #333' }}>
                                                <th onClick={toggleSort} className="fw-normal py-3 ps-3 text-secondary" style={{ cursor: 'pointer' }}>Price <i className="bi bi-arrow-down-up"></i></th>
                                                <th className="fw-normal py-3 text-secondary">From</th>
                                                <th className="fw-normal py-3 text-secondary">Expires</th>
                                                <th className="fw-normal py-3 text-end pe-3 text-secondary">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentOffers.length > 0 ? (
                                                currentOffers.map((offer, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #2a2e35' }}>
                                                        <td className="ps-3 fw-bold text-white">{parseFloat(offer.price).toFixed(2)} WPOL</td>
                                                        <td className="text-gold">{offer.isMyOffer ? 'You' : `${offer.bidder.slice(0,4)}...${offer.bidder.slice(-4)}`}</td>
                                                        <td className="text-secondary">{formatDuration(offer.expiration)}</td>
                                                        <td className="text-end pe-3">
                                                            {offer.status === 'accepted' ? (
                                                                <span className="badge bg-success">Accepted</span>
                                                            ) : (
                                                                <>
                                                                    {isOwner && (
                                                                        <button onClick={() => handleAcceptOffer(offer.id)} disabled={isPending} className="btn btn-sm" style={GOLD_BTN_STYLE}>Accept</button>
                                                                    )}
                                                                    {offer.isMyOffer && (
                                                                        <button onClick={() => handleCancelOffer(offer.id)} disabled={isPending} className="btn btn-sm btn-outline-danger">Cancel</button>
                                                                    )}
                                                                    {!isOwner && !offer.isMyOffer && <span className="text-secondary">-</span>}
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-5 text-secondary">No offers yet</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {offersList.length > offersPerPage && (
                                    <div className="d-flex justify-content-center p-3 gap-3">
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-sm btn-outline-secondary"><i className="bi bi-chevron-left"></i></button>
                                        <span className="text-secondary small">Page {currentPage} of {totalPages}</span>
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn btn-sm btn-outline-secondary"><i className="bi bi-chevron-right"></i></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{` .text-gold { color: #FCD535 !important; } .hover-gold:hover { color: #FCD535 !important; transition: 0.2s; } `}</style>
        </main>
    );
}

export default dynamicImport(() => Promise.resolve(AssetPage), { ssr: false });
