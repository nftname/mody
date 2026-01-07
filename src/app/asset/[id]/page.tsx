'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useWriteContract, usePublicClient, useBalance, useSignTypedData } from "wagmi";
import { parseAbi, formatEther, parseEther, erc721Abi, erc20Abi } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase'; 
// @ts-ignore
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WPOL_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; 
const BACKGROUND_DARK = '#1E1E1E';
const SURFACE_DARK = '#242424';
const BORDER_COLOR = '#2E2E2E';
const TEXT_PRIMARY = '#E0E0E0';
const TEXT_MUTED = '#B0B0B0';
const GOLD_SOLID = '#F0C420';
const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #B8860B 100%)';
const GOLD_BTN_STYLE = { background: GOLD_GRADIENT, color: '#1a1200', border: 'none', fontWeight: 'bold' as const };
const OUTLINE_BTN_STYLE = { background: 'transparent', color: GOLD_SOLID, border: `1px solid ${GOLD_SOLID}`, fontWeight: 'bold' as const };

const OFFER_DURATION = 30 * 24 * 60 * 60; 

const MARKETPLACE_ABI = parseAbi([
    "function listItem(uint256 tokenId, uint256 price) external",
    "function buyItem(uint256 tokenId) external payable",
    "function cancelListing(uint256 tokenId) external",
    "function acceptOffChainOffer(uint256 tokenId, address bidder, uint256 price, uint256 expiration, bytes calldata signature) external",
    "function listings(uint256 tokenId) view returns (address seller, uint256 price, bool exists)"
]);

const domain = {
    name: 'NNMMarketplace',
    version: '11',
    chainId: 137, 
    verifyingContract: MARKETPLACE_ADDRESS as `0x${string}`,
} as const;

const types = {
    Offer: [
        { name: 'bidder', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'price', type: 'uint256' },
        { name: 'expiration', type: 'uint256' },
    ],
} as const;

const formatDuration = (expirationTimestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const seconds = expirationTimestamp - now;
    if (seconds <= 0) return "Expired";
    const days = Math.floor(seconds / (3600 * 24));
    if (days > 0) return `${days}d`; 
    const hours = Math.floor(seconds / 3600);
    if (hours > 0) return `${hours}h`; 
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
};

const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
};

const CustomModal = ({ isOpen, type, title, message, onClose, onSwap }: any) => {
    if (!isOpen) return null;
    let icon = <div className="spinner-border" style={{ color: GOLD_SOLID }} role="status"></div>;
    let iconColor = GOLD_SOLID;

    if (type === 'success') { icon = <i className="bi bi-check-circle-fill" style={{ fontSize: '40px', color: '#28a745' }}></i>; iconColor = '#28a745'; }
    else if (type === 'error') { icon = <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '40px', color: '#dc3545' }}></i>; iconColor = '#dc3545'; }
    else if (type === 'swap') { icon = <i className="bi bi-wallet2" style={{ fontSize: '40px', color: GOLD_SOLID }}></i>; }

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="fade-in" style={{ backgroundColor: SURFACE_DARK, border: `1px solid ${iconColor}`, borderRadius: '16px', padding: '25px', width: '90%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 0 40px rgba(0,0,0,0.6)', position: 'relative', color: TEXT_PRIMARY }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', color: TEXT_MUTED, fontSize: '20px', cursor: 'pointer' }}><i className="bi bi-x-lg"></i></button>
                <div className="mb-3">{icon}</div>
                <h4 className="fw-bold mb-2" style={{ color: TEXT_PRIMARY }}>{title}</h4>
                <p className="mb-4" style={{ fontSize: '14px', color: TEXT_MUTED }}>{message}</p>
                {type === 'swap' && (
                     <a href="https://app.uniswap.org/" target="_blank" rel="noopener noreferrer" className="btn w-100 fw-bold" style={{ ...GOLD_BTN_STYLE, padding: '10px', borderRadius: '8px' }}>
                        Swap on Uniswap <i className="bi bi-box-arrow-up-right ms-1"></i>
                    </a>
                )}
                {type === 'error' && <button onClick={onClose} className="btn w-100 btn-outline-secondary" style={{ color: TEXT_PRIMARY, borderColor: BORDER_COLOR }}>Close</button>}
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

function AssetPage() {
    const params = useParams();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const { signTypedDataAsync } = useSignTypedData(); 
    const publicClient = usePublicClient();
    const { data: polBalanceData } = useBalance({ address });
    
    // States
    const [asset, setAsset] = useState<any | null>(null);
    const [listing, setListing] = useState<any | null>(null);
    const [offersList, setOffersList] = useState<any[]>([]);
    
    // Real Stats from DB
    const [totalVolume, setTotalVolume] = useState('0');
    const [lastSalePrice, setLastSalePrice] = useState('---');
    
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isListingMode, setIsListingMode] = useState(false);
    const [sellPrice, setSellPrice] = useState('10');
    
    const [isOfferMode, setIsOfferMode] = useState(false);
    const [offerPrice, setOfferPrice] = useState('');
    const [wpolBalance, setWpolBalance] = useState<number>(0);
    const [wpolAllowance, setWpolAllowance] = useState<number>(0);
    
    const [currentPage, setCurrentPage] = useState(1);
    const offersPerPage = 5;
    const [sortDesc, setSortDesc] = useState(true);

    const [modal, setModal] = useState({ isOpen: false, type: 'loading', title: '', message: '' });
    
    const rawId = params?.id;
    const tokenId = Array.isArray(rawId) ? rawId[0] : rawId;

    // 1. Fetch Asset Data
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

    // 2. Check Listings (On-Chain)
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

    // 3. Fetch Data from Supabase (Offers + Activity Stats)
    const fetchSupabaseData = useCallback(async () => {
        if (!tokenId) return;
        try {
            // A. Fetch Offers
            const { data: offers, error: offersError } = await supabase
                .from('offers')
                .select('*')
                .eq('token_id', tokenId)
                .neq('status', 'cancelled') 
                .order('price', { ascending: false });

            if (offers) {
                const formattedOffers = offers.map((offer: any) => ({
                    id: offer.id,
                    bidder: offer.bidder_address,
                    price: offer.price.toString(),
                    expiration: offer.expiration,
                    status: offer.status,
                    signature: offer.signature, 
                    isMyOffer: address && offer.bidder_address.toLowerCase() === address.toLowerCase()
                }));
                setOffersList(formattedOffers);
            }

            // B. Fetch Activity for Stats (Volume & Last Sale)
            const { data: activities } = await supabase
                .from('activities')
                .select('price, created_at')
                .eq('token_id', tokenId)
                .eq('activity_type', 'Sale')
                .order('created_at', { ascending: false });

            if (activities && activities.length > 0) {
                // Calculate Volume
                const volume = activities.reduce((acc, curr) => acc + Number(curr.price), 0);
                setTotalVolume(volume.toFixed(2));
                // Set Last Sale
                setLastSalePrice(`${activities[0].price} POL`);
            } else {
                setTotalVolume('0');
                setLastSalePrice('---');
            }

        } catch (e) { console.error("Supabase Error:", e); }
    }, [tokenId, address]);

    // Check WPOL Balance & Allowance
    const refreshWpolData = useCallback(async () => {
        if (address && publicClient) {
            try {
                const balanceBigInt = await publicClient.readContract({ address: WPOL_ADDRESS as `0x${string}`, abi: erc20Abi, functionName: 'balanceOf', args: [address] });
                setWpolBalance(Number(formatEther(balanceBigInt)));
                
                const allowanceBigInt = await publicClient.readContract({ address: WPOL_ADDRESS as `0x${string}`, abi: erc20Abi, functionName: 'allowance', args: [address, MARKETPLACE_ADDRESS as `0x${string}`] });
                setWpolAllowance(Number(formatEther(allowanceBigInt)));
            } catch (e) { console.error("WPOL Error", e); }
        }
    }, [address, publicClient]);

    useEffect(() => {
        if (tokenId && publicClient) {
            Promise.all([fetchAssetData(), checkListing(), fetchSupabaseData()]).then(() => setLoading(false));
        }
    }, [tokenId, address, fetchAssetData, checkListing, fetchSupabaseData, publicClient]);

    useEffect(() => {
        if (isOfferMode && address) refreshWpolData();
    }, [isOfferMode, address, refreshWpolData]);

    const showModal = (type: string, title: string, message: string) => setModal({ isOpen: true, type, title, message });
    const closeModal = () => { setIsPending(false); setModal({ ...modal, isOpen: false }); if (modal.type === 'success') { fetchSupabaseData(); checkListing(); setIsListingMode(false); setIsOfferMode(false); setOfferPrice(''); } };

    // --- ACTIONS ---

    // 1. APPROVE WPOL (On-Chain Transaction)
    const handleApprove = async () => {
        if (!offerPrice) return;
        setIsPending(true);
        showModal('loading', 'Approving WPOL', 'Please confirm in wallet...');
        try {
            const hash = await writeContractAsync({
                address: WPOL_ADDRESS as `0x${string}`,
                abi: erc20Abi,
                functionName: 'approve',
                args: [MARKETPLACE_ADDRESS as `0x${string}`, parseEther(offerPrice)] 
            });
            await publicClient!.waitForTransactionReceipt({ hash });
            await refreshWpolData();
            showModal('success', 'Approved!', 'Now you can sign the offer for free.');
        } catch (err: any) {
            showModal('error', 'Failed', err.message?.slice(0, 100));
            setIsPending(false);
        }
    };

    // 2. MAKE OFFER (Off-Chain Signature - Free)
    const handleSubmitOffer = async () => {
        if (!address) return showModal('error', 'Connect Wallet', 'Please connect your wallet first.');
        if (!offerPrice) return;

        setIsPending(true);
        showModal('loading', 'Signing Offer...', 'Please sign the message in your wallet (Free).');

        if (wpolBalance < parseFloat(offerPrice)) {
            showModal('swap', 'Insufficient Funds', 'You do not have enough WPOL.');
            setIsPending(false);
            return;
        }

        try {
            const priceInWei = parseEther(offerPrice);
            const expiration = BigInt(Math.floor(Date.now() / 1000) + OFFER_DURATION);
            
            const signature = await signTypedDataAsync({
                domain,
                types,
                primaryType: 'Offer',
                message: {
                    bidder: address,
                    tokenId: BigInt(tokenId),
                    price: priceInWei,
                    expiration: expiration,
                },
            });

            const { error } = await supabase
                .from('offers')
                .insert([
                    {
                        token_id: tokenId,
                        bidder_address: address,
                        price: parseFloat(offerPrice),
                        expiration: Number(expiration),
                        status: 'active',
                        signature: signature 
                    }
                ]);

            if (error) throw error;
            showModal('success', 'Offer Submitted!', 'Your offer is live (Gas-free).');
        } catch (err: any) {
            console.error(err);
            showModal('error', 'Error', 'Failed to submit offer.');
        } finally {
            setIsPending(false);
        }
    };

    // 3. ACCEPT OFFER (On-Chain Transaction using Signature)
    const handleAcceptOffer = async (offer: any) => {
        if (!isOwner) return;
        setIsPending(true);
        showModal('loading', 'Accepting Offer', 'Confirm transaction to sell...');

        try {
            if (!offer.signature) throw new Error("Signature missing");

            const hash = await writeContractAsync({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKETPLACE_ABI,
                functionName: 'acceptOffChainOffer',
                args: [
                    BigInt(tokenId),
                    offer.bidder as `0x${string}`,
                    parseEther(offer.price),
                    BigInt(offer.expiration),
                    offer.signature as `0x${string}`
                ]
            });

            await publicClient!.waitForTransactionReceipt({ hash });

            await supabase.from('offers').update({ status: 'accepted' }).eq('id', offer.id);
            
            await supabase.from('activities').insert([
                {
                    token_id: tokenId,
                    activity_type: 'Sale',
                    from_address: address,
                    to_address: offer.bidder, 
                    price: offer.price,
                    created_at: new Date().toISOString()
                }
            ]);

            showModal('success', 'Sold!', 'Offer accepted and asset transferred.');
        } catch (err: any) {
            console.error(err);
            showModal('error', 'Failed', err.message?.slice(0, 100) || "Transaction failed.");
            setIsPending(false);
        }
    };

    // 4. CANCEL OFFER (Soft Cancel - Database Only - Free)
    const handleCancelOffer = async (offerId: number) => {
        setIsPending(true);
        try {
            const { error } = await supabase
                .from('offers')
                .update({ status: 'cancelled' })
                .eq('id', offerId);
            if(error) throw error;
            await fetchSupabaseData();
            setIsPending(false);
        } catch(e) { console.error(e); setIsPending(false); }
    };

    // Standard Buy/List Functions (On-Chain)
    const handleBuy = async () => {
        if (!listing) return;
        const currentPol = polBalanceData ? parseFloat(polBalanceData.formatted) : 0;
        if (currentPol < parseFloat(listing.pricePerToken)) return showModal('swap', 'Insufficient POL', 'Need more POL.');

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

            await supabase.from('activities').insert([
                {
                    token_id: tokenId,
                    activity_type: 'Sale',
                    from_address: listing.seller,
                    to_address: address, 
                    price: listing.pricePerToken,
                    created_at: new Date().toISOString()
                }
            ]);

            showModal('success', 'Success!', 'Asset purchased.');
        } catch (err: any) {
            showModal('error', 'Failed', err.message?.slice(0, 100));
            setIsPending(false);
        }
    };

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
    const targetAmount = Number(offerPrice) || 0;
    const hasAllowance = wpolAllowance >= targetAmount;

    if (loading) return <div className="vh-100" style={{ backgroundColor: BACKGROUND_DARK, color: TEXT_MUTED }}><div className="d-flex justify-content-center align-items-center h-100">Loading Asset...</div></div>;
    if (!asset) return <div className="vh-100" style={{ backgroundColor: BACKGROUND_DARK, color: TEXT_PRIMARY }}><div className="d-flex justify-content-center align-items-center h-100">Asset Not Found</div></div>;
    
    const style = getHeroStyles(asset.tier);

    return (
        <main style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif', color: TEXT_PRIMARY }}>
            <CustomModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onClose={closeModal} onSwap={() => window.open('https://app.uniswap.org/', '_blank')} />
            
            <div className="container py-3">
                <div className="d-flex align-items-center gap-2 mb-4" style={{ fontSize: '14px', color: TEXT_MUTED }}>
                    <Link href="/market" className="text-decoration-none hover-gold" style={{ color: TEXT_MUTED }}>Market</Link>
                    <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
                    <span style={{ color: TEXT_PRIMARY }}>{asset.name}</span>
                </div>

                <div className="row g-5">
                    {/* الصورة (يسار) */}
                    <div className="col-lg-5">
                         <div className="rounded-4 d-flex justify-content-center align-items-center position-relative overflow-hidden" style={{ background: 'radial-gradient(circle, #2a2a2a 0%, #1E1E1E 100%)', border: `1px solid ${BORDER_COLOR}`, minHeight: '500px' }}>
                            <div style={{ width: '85%', aspectRatio: '1/1', background: style.bg, border: style.border, borderRadius: '16px', boxShadow: style.shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '10px', letterSpacing: '2px', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>GEN-0 #00{asset.id}</p>
                                    <h1 style={{ fontSize: '42px', fontFamily: 'serif', fontWeight: '900', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '10px 0' }}>{asset.name}</h1>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 p-4 rounded-3" style={{ backgroundColor: SURFACE_DARK, border: `1px solid ${BORDER_COLOR}`, color: TEXT_PRIMARY }}>
                             <div className="d-flex align-items-center gap-2 mb-3">
                                <i className="bi bi-info-circle text-gold"></i>
                                <span className="fw-bold" style={{ color: TEXT_PRIMARY }}>Description</span>
                            </div>
                            <p style={{ fontSize: '14px', lineHeight: '1.6', color: TEXT_MUTED }}>{asset.description}</p>
                        </div>
                    </div>

                    {/* البيانات (يمين) */}
                    <div className="col-lg-7">
                        <h1 className="fw-bold mb-1" style={{ fontSize: '32px', color: TEXT_PRIMARY }}>{asset.name}</h1>
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <span className="badge" style={{ background: GOLD_GRADIENT, color: '#1a1200', border: 'none' }}>Gen-0</span>
                            <span className="small" style={{ color: TEXT_MUTED }}>Owned by <span className="text-gold">{asset.owner.slice(0,6)}...{asset.owner.slice(-4)}</span></span>
                        </div>

                        {/* لوحة التحكم */}
                        <div className="p-4 rounded-3 mt-4 mb-4" style={{ backgroundColor: SURFACE_DARK, border: `1px solid ${BORDER_COLOR}` }}>
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <span className="small d-block mb-1" style={{ color: TEXT_MUTED }}>Current Price</span>
                                    <div className="d-flex align-items-baseline gap-2">
                                        <h2 className="fw-bold mb-0" style={{ fontSize: '36px', color: TEXT_PRIMARY }}>
                                            {listing ? `${listing.pricePerToken} POL` : `${asset.price} POL`}
                                        </h2>
                                        {!listing && <span className="small" style={{ color: TEXT_MUTED }}>≈ $12.50</span>}
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
                                                        <input type="number" className="form-control" style={{ background: BACKGROUND_DARK, color: TEXT_PRIMARY, borderColor: BORDER_COLOR }} placeholder="Price (POL)" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
                                                        <div className="d-flex gap-2">
                                                            {!isApproved ? (
                                                                <button onClick={handleApproveNft} disabled={isPending} className="btn fw-bold flex-grow-1" style={GOLD_BTN_STYLE}>Approve NFT</button>
                                                            ) : (
                                                                <button onClick={handleList} disabled={isPending} className="btn fw-bold flex-grow-1" style={GOLD_BTN_STYLE}>Confirm List</button>
                                                            )}
                                                            <button onClick={() => setIsListingMode(false)} className="btn btn-outline-secondary" style={{ color: TEXT_PRIMARY, borderColor: BORDER_COLOR }}>Cancel</button>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="d-flex gap-2">
                                                    <button className="btn w-50 fw-bold disabled" style={{ height: '50px', background: BORDER_COLOR, color: TEXT_MUTED, border: 'none' }}>Not Listed</button>
                                                    <button onClick={() => setIsOfferMode(true)} className="btn w-50 fw-bold" style={{ height: '50px', background: 'transparent', border: `1px solid ${BORDER_COLOR}`, color: TEXT_PRIMARY }}>Make Offer</button>
                                                </div>
                                            )
                                        )
                                    )}
                                </div>
                            </div>
                            
                            {/* إدخال العرض (OpenSea Style) */}
                            {isOfferMode && (
                                <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
                                    <div className="d-flex justify-content-between small mb-2" style={{ color: TEXT_MUTED }}>
                                        <span>Balance: {wpolBalance.toFixed(2)} WPOL</span>
                                        <span>Allowance: {wpolAllowance.toFixed(2)} WPOL</span>
                                    </div>
                                    <input type="number" className="form-control mb-2" style={{ background: BACKGROUND_DARK, color: TEXT_PRIMARY, borderColor: BORDER_COLOR }} placeholder="Amount (WPOL)" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
                                    <div className="d-flex gap-2">
                                        {!hasAllowance ? (
                                            <button onClick={handleApprove} disabled={isPending} className="btn fw-bold flex-grow-1" style={GOLD_BTN_STYLE}>{isPending ? 'Approving...' : 'Approve WPOL First'}</button>
                                        ) : (
                                            <button onClick={handleSubmitOffer} disabled={isPending} className="btn fw-bold flex-grow-1" style={GOLD_BTN_STYLE}>{isPending ? 'Signing...' : 'Sign Offer (Free)'}</button>
                                        )}
                                        <button onClick={() => setIsOfferMode(false)} className="btn btn-outline-secondary" style={{ color: TEXT_PRIMARY, borderColor: BORDER_COLOR }}>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stats Row (Volume & Last Sale) - UPDATED TO SHOW DB DATA */}
                        <div className="d-flex gap-4 mb-4 p-3 rounded-3" style={{ backgroundColor: SURFACE_DARK, border: `1px solid ${BORDER_COLOR}` }}>
                            <div>
                                <div className="small text-muted mb-1">Total Volume</div>
                                <div className="fw-bold text-white fs-5">{totalVolume} POL</div>
                            </div>
                            <div className="vr bg-secondary opacity-25"></div>
                            <div>
                                <div className="small text-muted mb-1">Last Sale</div>
                                <div className="fw-bold text-white fs-5">{lastSalePrice}</div>
                            </div>
                        </div>

                        {/* Chart (نفسه) */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-3" style={{ color: TEXT_PRIMARY }}>Price History</h5>
                            <div className="rounded-3 p-3" style={{ backgroundColor: SURFACE_DARK, border: `1px solid ${BORDER_COLOR}`, height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockChartData}>
                                        <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GOLD_SOLID} stopOpacity={0.35}/><stop offset="95%" stopColor={GOLD_SOLID} stopOpacity={0}/></linearGradient></defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} vertical={false} />
                                        <XAxis dataKey="name" stroke={TEXT_MUTED} fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke={TEXT_MUTED} fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                                        <Tooltip contentStyle={{ backgroundColor: SURFACE_DARK, borderColor: BORDER_COLOR, color: TEXT_PRIMARY }} />
                                        <Area type="monotone" dataKey="price" stroke={GOLD_SOLID} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* جدول العروض */}
                        <div className="mb-5">
                            <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                <i className="bi bi-list-ul text-gold"></i>
                                <h5 className="fw-bold mb-0" style={{ color: TEXT_PRIMARY }}>Offers</h5>
                                <button onClick={fetchSupabaseData} className="btn btn-sm border-0 ms-auto" style={{ color: TEXT_MUTED }}><i className="bi bi-arrow-clockwise"></i></button>
                            </div>
                            <div className="rounded-3 overflow-hidden" style={{ border: `1px solid ${BORDER_COLOR}`, backgroundColor: SURFACE_DARK }}>
                                <div className="table-responsive">
                                    <table className="table mb-0" style={{ backgroundColor: 'transparent', color: TEXT_PRIMARY }}>
                                        <thead>
                                            <tr style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                                <th onClick={toggleSort} className="fw-normal py-3 ps-3" style={{ cursor: 'pointer', color: TEXT_MUTED }}>Price <i className="bi bi-arrow-down-up"></i></th>
                                                <th className="fw-normal py-3" style={{ color: TEXT_MUTED }}>From</th>
                                                <th className="fw-normal py-3" style={{ color: TEXT_MUTED }}>Expires</th>
                                                <th className="fw-normal py-3 text-end pe-3" style={{ color: TEXT_MUTED }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentOffers.length > 0 ? (
                                                currentOffers.map((offer, index) => (
                                                    <tr key={index} style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                                        <td className="ps-3 fw-bold" style={{ color: TEXT_PRIMARY }}>{parseFloat(offer.price).toFixed(2)} WPOL</td>
                                                        <td className="text-gold">{offer.isMyOffer ? 'You' : `${offer.bidder.slice(0,4)}...${offer.bidder.slice(-4)}`}</td>
                                                        <td style={{ color: TEXT_MUTED }}>{formatDuration(offer.expiration)}</td>
                                                        <td className="text-end pe-3" style={{ color: TEXT_PRIMARY }}>
                                                            {offer.status === 'accepted' ? (
                                                                <span className="badge bg-success">Accepted</span>
                                                            ) : (
                                                                <>
                                                                    {isOwner && (
                                                                        <button onClick={() => handleAcceptOffer(offer)} disabled={isPending} className="btn btn-sm" style={GOLD_BTN_STYLE}>Accept</button>
                                                                    )}
                                                                    {offer.isMyOffer && (
                                                                        <button onClick={() => handleCancelOffer(offer.id)} disabled={isPending} className="btn btn-sm btn-outline-danger">Cancel</button>
                                                                    )}
                                                                    {!isOwner && !offer.isMyOffer && <span style={{ color: TEXT_MUTED }}>-</span>}
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-5" style={{ color: TEXT_MUTED }}>No offers yet</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {offersList.length > offersPerPage && (
                                    <div className="d-flex justify-content-center p-3 gap-3">
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-sm btn-outline-secondary" style={{ color: TEXT_PRIMARY, borderColor: BORDER_COLOR }}><i className="bi bi-chevron-left"></i></button>
                                        <span className="small" style={{ color: TEXT_MUTED }}>Page {currentPage} of {totalPages}</span>
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn btn-sm btn-outline-secondary" style={{ color: TEXT_PRIMARY, borderColor: BORDER_COLOR }}><i className="bi bi-chevron-right"></i></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{` .text-gold { color: ${GOLD_SOLID} !important; } .hover-gold:hover { color: ${GOLD_SOLID} !important; transition: 0.2s; } `}</style>
        </main>
    );
}

export default dynamicImport(() => Promise.resolve(AssetPage), { ssr: false });
