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
const BACKGROUND_DARK = '#121212'; // OpenSea Dark Background
const SURFACE_DARK = '#1b1b1b'; 
const BORDER_COLOR = '#353840'; 
const TEXT_PRIMARY = '#FFFFFF'; 
const TEXT_MUTED = '#8a939b'; 
const GOLD_SOLID = '#F0C420';
const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #B8860B 100%)';
const GOLD_BTN_STYLE = { background: GOLD_GRADIENT, color: '#1a1200', border: 'none', fontWeight: 'bold' as const };
const OUTLINE_BTN_STYLE = { background: 'transparent', color: '#FFF', border: `1px solid ${BORDER_COLOR}`, fontWeight: 'bold' as const };

const OFFER_DURATION = 30 * 24 * 60 * 60; 
const POL_TO_USD_RATE = 0.54; // Mock Exchange Rate

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

// --- Helper Functions ---
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

const formatCompactNumber = (num: number) => {
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 2
    }).format(num);
};

const formatUSD = (polAmount: any) => {
    const val = parseFloat(polAmount);
    if (isNaN(val)) return '$0.00';
    return `$${(val * POL_TO_USD_RATE).toFixed(2)}`;
};

const formatShortTime = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
};

// --- Reusable UI Components (Defined here to keep file structure clean) ---
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

const Accordion = ({ title, defaultOpen = false, icon, children }: any) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', backgroundColor: SURFACE_DARK }}>
            <button onClick={() => setIsOpen(!isOpen)} className="d-flex align-items-center justify-content-between w-100 px-3 py-3" style={{ background: 'transparent', border: 'none', color: TEXT_PRIMARY, fontWeight: '700', fontSize: '15px' }}>
                <div className="d-flex align-items-center gap-3"><i className={`bi ${icon}`} style={{ color: TEXT_MUTED, fontSize: '18px' }}></i> {title}</div>
                <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: TEXT_MUTED }}></i>
            </button>
            {isOpen && <div className="p-0 border-top" style={{ borderColor: BORDER_COLOR, backgroundColor: BACKGROUND_DARK }}>
                <div className="p-3">{children}</div>
            </div>}
        </div>
    );
};

const TraitBox = ({ type, value, percent }: any) => (
    <div className="d-flex flex-column align-items-center justify-content-center p-2 h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px', textAlign: 'center' }}>
        <div style={{ color: TEXT_MUTED, fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>{type}</div>
        <div style={{ color: '#fff', fontWeight: '600', fontSize: '13px', marginBottom: '2px', lineHeight: '1.2' }}>{value}</div>
        <div style={{ color: TEXT_MUTED, fontSize: '10px' }}>{percent} floor</div>
    </div>
);

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
    const [activityList, setActivityList] = useState<any[]>([]);
    const [moreAssets, setMoreAssets] = useState<any[]>([]);
    
    // UI States
    const [activeTab, setActiveTab] = useState('Details');
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
                owner: owner,
                image: resolveIPFS(meta.image) // Added for OpenSea Layout
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

    // 3. Fetch Data from Supabase (Offers + Activity)
    const fetchSupabaseData = useCallback(async () => {
        if (!tokenId) return;
        try {
            // A. Fetch Offers
            const { data: offers } = await supabase
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
                    isMyOffer: address && offer.bidder_address.toLowerCase() === address.toLowerCase(),
                    created_at: offer.created_at // Added for date calculation
                }));
                setOffersList(formattedOffers);
            }

            // B. Fetch Activity
            const { data: activities } = await supabase
                .from('activities')
                .select('*') // Select all for full activity log
                .eq('token_id', tokenId)
                .order('created_at', { ascending: false });

            if (activities) {
                setActivityList(activities); // Store for Activity Tab
            }

            // C. Mock More Collection
            setMoreAssets([
                { id: 96, image: 'https://gateway.pinata.cloud/ipfs/bafkreiazhoyzkbenhbvjlltd6izwonwz3xikljtrrksual5ttzs4nyzbuu' },
                { id: 97, image: 'https://gateway.pinata.cloud/ipfs/bafkreiagc35ykldllvd2knqcnei2ctmkps66byvjinlr7hmkgkdx5mhxqi' },
                { id: 98, image: 'https://gateway.pinata.cloud/ipfs/bafkreib7mz6rnwk3ig7ft6ne5iuajlywkttv4zvjp5bbk7ssd5kaykjbsm' }
            ]);

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

    // --- ACTIONS (Original Logic) ---

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

    const targetAmount = Number(offerPrice) || 0;
    const hasAllowance = wpolAllowance >= targetAmount;

    if (loading) return <div className="vh-100" style={{ backgroundColor: BACKGROUND_DARK, color: TEXT_MUTED }}><div className="d-flex justify-content-center align-items-center h-100">Loading Asset...</div></div>;
    if (!asset) return <div className="vh-100" style={{ backgroundColor: BACKGROUND_DARK, color: TEXT_PRIMARY }}><div className="d-flex justify-content-center align-items-center h-100">Asset Not Found</div></div>;
    
    return (
        <main style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', paddingBottom: '100px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <CustomModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onClose={closeModal} onSwap={() => window.open('https://app.uniswap.org/', '_blank')} />
            
            <div className="container-fluid" style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '20px' }}>
                <div className="row g-4">
                    
                    {/* LEFT COLUMN: IMAGE & DESCRIPTION */}
                    <div className="col-lg-5">
                        <div className="rounded-3 overflow-hidden position-relative mb-4" style={{ border: `1px solid ${BORDER_COLOR}`, backgroundColor: SURFACE_DARK, aspectRatio: '1/1' }}>
                            <div className="d-flex align-items-center justify-content-between p-3 position-absolute top-0 w-100" style={{ zIndex: 2 }}>
                                <div className="d-flex gap-2">
                                    <span style={{ fontSize: '18px', color: '#FFF' }}><i className="bi bi-polygon"></i></span>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn p-0" style={{ color: TEXT_MUTED }}><i className="bi bi-heart"></i></button>
                                </div>
                            </div>
                            <img src={asset.image} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        {/* DESKTOP ACCORDIONS (Hidden on mobile if needed, but per request keeping visible) */}
                        <div className="d-none d-lg-block">
                            <Accordion title="Description" icon="bi-text-left" defaultOpen={true}>
                                <div style={{ color: TEXT_MUTED, fontSize: '14px', lineHeight: '1.6' }}>
                                    <p className="mb-2"><strong>About Value</strong></p>
                                    <p className="mb-3">GEN-0 Genesis — NNM Protocol Record</p>
                                    <p>{asset.description}</p>
                                </div>
                            </Accordion>
                            <Accordion title="Traits" icon="bi-tag" defaultOpen={true}>
                                <div className="row g-2">
                                    <div className="col-4"><TraitBox type="ASSET TYPE" value="Digital Name" percent="100%" /></div>
                                    <div className="col-4"><TraitBox type="COLLECTION" value="Genesis - 001" percent="100%" /></div>
                                    <div className="col-4"><TraitBox type="GENERATION" value="Gen-0" percent="100%" /></div>
                                    <div className="col-4"><TraitBox type="MINT DATE" value="Dec 2025" percent="100%" /></div>
                                    <div className="col-4"><TraitBox type="PLATFORM" value="NNM Registry" percent="100%" /></div>
                                    <div className="col-4"><TraitBox type="TIER" value={asset.tier} percent="21%" /></div>
                                </div>
                            </Accordion>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: DETAILS & ACTIONS */}
                    <div className="col-lg-7">
                        {/* HEADER */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <Link href="/collection/nnm" className="text-decoration-none" style={{ color: '#FCD535', fontSize: '16px', fontWeight: '500' }}>NNM Sovereign Asset</Link>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-dark btn-sm rounded-circle" style={{ width: '32px', height: '32px', border: `1px solid ${BORDER_COLOR}` }}><i className="bi bi-share"></i></button>
                                    <button className="btn btn-dark btn-sm rounded-circle" style={{ width: '32px', height: '32px', border: `1px solid ${BORDER_COLOR}` }}><i className="bi bi-three-dots"></i></button>
                                </div>
                            </div>
                            <h1 className="fw-bold mb-3 gold-text-effect" style={{ fontSize: '32px', letterSpacing: '0.5px', background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{asset.name}</h1>
                            <div className="d-flex align-items-center gap-3 text-white small mb-4">
                                <span className="d-flex align-items-center gap-1"><i className="bi bi-person-circle"></i> Owned by <span style={{ color: '#FCD535' }}>{asset.owner.slice(0,6)}...{asset.owner.slice(-4)}</span></span>
                                <span className="d-flex align-items-center gap-1"><i className="bi bi-eye"></i> 12 views</span>
                                <span className="d-flex align-items-center gap-1"><i className="bi bi-heart"></i> 3 favorites</span>
                            </div>
                            
                            {/* BADGES */}
                            <div className="d-flex gap-3 mb-4 p-3 rounded-3" style={{ border: `1px solid ${BORDER_COLOR}`, background: 'rgba(255,255,255,0.02)' }}>
                                <div className="d-flex align-items-center gap-2" style={{ color: TEXT_MUTED, fontSize: '12px', fontWeight: '600' }}>
                                    <span>ERC721</span> <div className="vr"></div> <span>POLYGON</span> <div className="vr"></div> <span>TOKEN #{asset.id}</span>
                                </div>
                            </div>

                            {/* PRICE SECTION (Desktop Action) */}
                            <div className="p-4 rounded-3 mb-4" style={{ backgroundColor: SURFACE_DARK, border: `1px solid ${BORDER_COLOR}` }}>
                                <div style={{ color: TEXT_MUTED, fontSize: '13px', marginBottom: '8px' }}>Current price</div>
                                <div className="d-flex align-items-baseline gap-3 mb-3">
                                    <h2 className="text-white fw-bold m-0" style={{ fontSize: '30px' }}>{listing ? listing.price : asset.price} POL</h2>
                                    <span style={{ color: TEXT_MUTED, fontSize: '14px' }}>{formatUSD(listing ? listing.price : asset.price)}</span>
                                </div>
                                {listing && !isOwner && (
                                    <div className="d-flex gap-2">
                                        <button onClick={handleBuy} className="btn w-50 py-3 fw-bold" style={{ background: GOLD_GRADIENT, border: 'none', color: '#000', borderRadius: '10px' }}>Buy now</button>
                                        <button onClick={() => setIsOfferMode(true)} className="btn w-50 py-3 fw-bold" style={{ background: '#353840', border: '1px solid #353840', color: '#fff', borderRadius: '10px' }}>Make offer</button>
                                    </div>
                                )}
                                {!listing && !isOwner && (
                                    <button onClick={() => setIsOfferMode(true)} className="btn w-100 py-3 fw-bold" style={{ background: '#353840', border: '1px solid #353840', color: '#fff', borderRadius: '10px' }}>Make offer</button>
                                )}
                                {isOwner && (
                                    <button className="btn w-100 py-3 fw-bold" style={{ background: '#353840', border: '1px solid #353840', color: '#fff', borderRadius: '10px' }}>List for sale</button>
                                )}
                            </div>
                        </div>

                        {/* ACCORDIONS (Right Side / Mobile Order) */}
                        <Accordion title="Price History" icon="bi-graph-up" defaultOpen={true}>
                            <div style={{ height: '200px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockChartData}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#d4f936" stopOpacity={0.2}/><stop offset="95%" stopColor="#d4f936" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="name" hide />
                                        <YAxis orientation="right" tick={{fontSize: 10, fill: '#666'}} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                        <Area type="monotone" dataKey="price" stroke="#d4f936" strokeWidth={2} fill="url(#colorPrice)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Accordion>

                        {/* TABS (Details, Orders, Activity) */}
                        <div className="mt-4 rounded-3 overflow-hidden" style={{ border: `1px solid ${BORDER_COLOR}`, backgroundColor: SURFACE_DARK }}>
                            <div className="d-flex border-bottom" style={{ borderColor: BORDER_COLOR }}>
                                {['Details', 'Orders', 'Activity'].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className="btn px-4 py-3 fw-bold" style={{ color: activeTab === tab ? '#fff' : TEXT_MUTED, borderBottom: activeTab === tab ? '2px solid #FCD535' : 'none', borderRadius: 0, fontSize: '14px' }}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="p-0">
                                {activeTab === 'Details' && (
                                    <div className="p-3">
                                        <div className="d-flex justify-content-between py-2 border-bottom" style={{ borderColor: '#333' }}>
                                            <span style={{ color: TEXT_MUTED }}>Contract Address</span>
                                            <a href={`https://polygonscan.com/address/${NFT_COLLECTION_ADDRESS}`} target="_blank" className="text-decoration-none" style={{ color: '#FCD535' }}>{NFT_COLLECTION_ADDRESS.slice(0,6)}...{NFT_COLLECTION_ADDRESS.slice(-4)}</a>
                                        </div>
                                        <div className="d-flex justify-content-between py-2 border-bottom" style={{ borderColor: '#333' }}>
                                            <span style={{ color: TEXT_MUTED }}>Token ID</span>
                                            <a href={`https://polygonscan.com/token/${NFT_COLLECTION_ADDRESS}?a=${tokenId}`} target="_blank" className="text-decoration-none" style={{ color: '#FCD535' }}>{tokenId}</a>
                                        </div>
                                        <div className="d-flex justify-content-between py-2 border-bottom" style={{ borderColor: '#333' }}>
                                            <span style={{ color: TEXT_MUTED }}>Token Standard</span>
                                            <span style={{ color: '#fff' }}>ERC-721</span>
                                        </div>
                                        <div className="d-flex justify-content-between py-2">
                                            <span style={{ color: TEXT_MUTED }}>Chain</span>
                                            <span style={{ color: '#fff' }}>Polygon</span>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'Orders' && (
                                    <div className="table-responsive">
                                        <table className="table mb-0" style={{ color: '#fff', fontSize: '13px' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ background: 'transparent', color: TEXT_MUTED, borderBottom: `1px solid ${BORDER_COLOR}`, padding: '12px' }}>Price (W/POL)</th>
                                                    <th style={{ background: 'transparent', color: TEXT_MUTED, borderBottom: `1px solid ${BORDER_COLOR}`, padding: '12px' }}>USD</th>
                                                    <th style={{ background: 'transparent', color: TEXT_MUTED, borderBottom: `1px solid ${BORDER_COLOR}`, padding: '12px' }}>Expiration</th>
                                                    <th style={{ background: 'transparent', color: TEXT_MUTED, borderBottom: `1px solid ${BORDER_COLOR}`, padding: '12px' }}>From</th>
                                                    <th style={{ background: 'transparent', borderBottom: `1px solid ${BORDER_COLOR}` }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {offersList.length === 0 ? <tr><td colSpan={5} className="text-center py-4 text-muted">No offers yet</td></tr> : offersList.map((offer) => (
                                                    <tr key={offer.id}>
                                                        <td style={{ background: 'transparent', padding: '12px', borderBottom: `1px solid ${BORDER_COLOR}`, fontWeight: '600' }}>{formatCompactNumber(offer.price)}</td>
                                                        <td style={{ background: 'transparent', padding: '12px', borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_MUTED }}>{formatUSD(offer.price)}</td>
                                                        <td style={{ background: 'transparent', padding: '12px', borderBottom: `1px solid ${BORDER_COLOR}` }}>{formatShortTime(new Date(new Date(offer.created_at).getTime() + offer.expiration * 1000).toISOString())}</td>
                                                        <td style={{ background: 'transparent', padding: '12px', borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                                            <a href={`https://polygonscan.com/address/${offer.bidder_address}`} target="_blank" style={{ color: GOLD_SOLID, textDecoration: 'none' }}>
                                                                {offer.bidder_address === address ? 'You' : offer.bidder_address.slice(0,6)}
                                                            </a>
                                                        </td>
                                                        <td style={{ background: 'transparent', padding: '12px', borderBottom: `1px solid ${BORDER_COLOR}`, textAlign: 'right' }}>
                                                            {isOwner && <button onClick={() => handleAcceptOffer(offer)} className="btn btn-sm btn-light fw-bold">Accept</button>}
                                                            {offer.isMyOffer && <button onClick={() => handleCancelOffer(offer.id)} className="btn btn-sm btn-outline-danger">Cancel</button>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {activeTab === 'Activity' && (
                                    <div className="table-responsive">
                                        <table className="table mb-0" style={{ color: '#fff', fontSize: '13px' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ background: 'transparent', color: TEXT_MUTED, borderBottom: `1px solid ${BORDER_COLOR}`, padding: '12px' }}>Event</th>
                                                    <th style={{ background: 'transparent', color: TEXT_MUTED, borderBottom: `1px solid ${BORDER_COLOR}`, padding: '12px' }}>Price</th>
                                                    <th style={{ background: 'transparent', color: TEXT_MUTED, borderBottom: `1px solid ${BORDER_COLOR}`, padding: '12px' }}>From</th>
                                                    <th style={{ background: 'transparent', color: TEXT_MUTED, borderBottom: `1px solid ${BORDER_COLOR}`, padding: '12px' }}>To</th>
                                                    <th style={{ background: 'transparent', color: TEXT_MUTED, borderBottom: `1px solid ${BORDER_COLOR}`, padding: '12px', textAlign: 'right' }}>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activityList.length === 0 ? <tr><td colSpan={5} className="text-center py-4 text-muted">No activity yet</td></tr> : activityList.map((act) => (
                                                    <tr key={act.id}>
                                                        <td style={{ background: 'transparent', padding: '12px', borderBottom: `1px solid ${BORDER_COLOR}` }}>{act.activity_type}</td>
                                                        <td style={{ background: 'transparent', padding: '12px', borderBottom: `1px solid ${BORDER_COLOR}`, fontWeight: '600' }}>{act.price > 0 ? formatCompactNumber(act.price) : '-'}</td>
                                                        <td style={{ background: 'transparent', padding: '12px', borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                                            <a href={`https://polygonscan.com/address/${act.from_address}`} target="_blank" style={{color: GOLD_SOLID, textDecoration: 'none'}}>{act.from_address.slice(0,6)}</a>
                                                        </td>
                                                        <td style={{ background: 'transparent', padding: '12px', borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                                            <a href={`https://polygonscan.com/address/${act.to_address}`} target="_blank" style={{color: GOLD_SOLID, textDecoration: 'none'}}>{act.to_address.slice(0,6)}</a>
                                                        </td>
                                                        <td style={{ background: 'transparent', padding: '12px', borderBottom: `1px solid ${BORDER_COLOR}`, textAlign: 'right', color: TEXT_MUTED }}>{formatShortTime(act.created_at)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* More From Collection */}
                        <Accordion title="More from this collection" icon="bi-collection">
                            <div className="d-flex gap-3 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                                {moreAssets.map(item => (
                                    <Link key={item.id} href={`/asset/${item.id}`} className="text-decoration-none" style={{ minWidth: '140px' }}>
                                        <div className="rounded-3 overflow-hidden" style={{ border: `1px solid ${BORDER_COLOR}`, backgroundColor: SURFACE_DARK }}>
                                            <div style={{ aspectRatio: '1/1' }}><img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                                            <div className="p-2 text-center">
                                                <div className="text-white fw-bold small">NNM #{item.id}</div>
                                                <div style={{ fontSize: '10px', color: TEXT_MUTED }}>Not listed</div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </Accordion>
                    </div>
                </div>
            </div>

            {/* STICKY FOOTER ACTION (Mobile) */}
            <div className="fixed-bottom p-3 d-lg-none" style={{ backgroundColor: SURFACE_DARK, borderTop: `1px solid ${BORDER_COLOR}`, zIndex: 100 }}>
                {isConnected ? (
                    listing && !isOwner ? (
                        <div className="d-flex gap-2">
                            <button onClick={handleBuy} className="btn w-50 py-3 fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>Buy for {formatCompactNumber(parseFloat(listing.price))} POL</button>
                            <button onClick={() => setIsOfferMode(true)} className="btn w-50 py-3 fw-bold" style={{ ...OUTLINE_BTN_STYLE, borderRadius: '12px' }}>Offer</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsOfferMode(true)} className="btn w-100 py-3 fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>
                            {isOwner ? 'List / Actions' : 'Make Offer'}
                        </button>
                    )
                ) : (
                    <div style={{ width: '100%' }}><ConnectButton.Custom>{({ openConnectModal }) => (<button onClick={openConnectModal} className="btn w-100 py-3 fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>Connect Wallet</button>)}</ConnectButton.Custom></div>
                )}
            </div>

            {/* OFFER MODAL */}
            {isOfferMode && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div className="w-100 p-4 rounded-top-4 fade-in" style={{ backgroundColor: SURFACE_DARK, borderTop: `1px solid ${BORDER_COLOR}`, maxWidth: '600px', animation: 'slideUp 0.3s' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="text-white m-0 fw-bold">Make an offer</h5>
                            <button onClick={() => setIsOfferMode(false)} className="btn btn-close btn-close-white"></button>
                        </div>
                        <div className="mb-4 text-center">
                            <div style={{ color: TEXT_MUTED, fontSize: '13px', marginBottom: '5px' }}>Balance: {wpolBalance.toFixed(2)} WPOL</div>
                            <div className="d-flex align-items-center border rounded-3 overflow-hidden p-2" style={{ borderColor: BORDER_COLOR, backgroundColor: BACKGROUND_DARK }}>
                                <input type="number" className="form-control border-0 bg-transparent text-white p-2" style={{ fontSize: '24px', fontWeight: 'bold' }} placeholder="0.00" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
                                <span className="text-white fw-bold px-3">WPOL</span>
                            </div>
                            <div className="text-end mt-2" style={{ color: TEXT_MUTED, fontSize: '12px' }}>Total: {formatUSD(offerPrice)}</div>
                        </div>
                        <div className="d-flex gap-2">
                            {wpolAllowance < parseFloat(offerPrice || '0') ? (
                                <button onClick={handleApprove} disabled={isPending} className="btn w-100 py-3 fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>{isPending ? 'Approving...' : 'Approve WPOL'}</button>
                            ) : (
                                <button onClick={handleSubmitOffer} disabled={isPending} className="btn w-100 py-3 fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>{isPending ? 'Signing...' : 'Submit Offer'}</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .gold-text-effect { background: linear-gradient(to bottom, #FCD535, #B3882A); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                .fade-in { animation: fadeIn 0.3s; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </main>
    );
}

export default dynamicImport(() => Promise.resolve(AssetPage), { ssr: false });
