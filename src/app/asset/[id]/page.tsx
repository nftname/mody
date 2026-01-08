'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useAccount, useWriteContract, usePublicClient, useBalance, useSignTypedData } from "wagmi";
import { parseAbi, formatEther, parseEther, erc721Abi, erc20Abi } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase'; 
// @ts-ignore
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WPOL_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; 

// --- THEME & STYLES ---
const BACKGROUND_DARK = '#1E1E1E'; 
const SURFACE_DARK = '#262626';    
const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)'; 
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_MUTED = '#B0B0B0';
const OPENSEA_DESC_COLOR = '#8a939b'; 
const GOLD_SOLID = '#F0C420';
const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #B8860B 100%)';
const GOLD_TEXT_CLASS = 'gold-text-effect'; 
const GOLD_BTN_STYLE = { background: GOLD_GRADIENT, color: '#1a1200', border: 'none', fontWeight: 'bold' as const };
const OUTLINE_BTN_STYLE = { background: 'transparent', color: GOLD_SOLID, border: `1px solid ${GOLD_SOLID}`, fontWeight: 'bold' as const };

const OFFER_DURATION = 30 * 24 * 60 * 60; 
const POL_TO_USD_RATE = 0.54; 

const MARKETPLACE_ABI = parseAbi([
    "function listItem(uint256 tokenId, uint256 price) external",
    "function buyItem(uint256 tokenId) external payable",
    "function cancelListing(uint256 tokenId) external",
    "function acceptOffChainOffer(uint256 tokenId, address bidder, uint256 price, uint256 expiration, bytes calldata signature) external",
    "function listings(uint256 tokenId) view returns (address seller, uint256 price, bool exists)"
]);

const domain = { name: 'NNMMarketplace', version: '11', chainId: 137, verifyingContract: MARKETPLACE_ADDRESS as `0x${string}` } as const;
const types = { Offer: [{ name: 'bidder', type: 'address' }, { name: 'tokenId', type: 'uint256' }, { name: 'price', type: 'uint256' }, { name: 'expiration', type: 'uint256' }] } as const;

// --- Helpers ---
const formatCompactNumber = (num: number) => Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
const formatUSD = (pol: any) => { const val = parseFloat(pol); if(isNaN(val)) return '$0.00'; return `$${(val * POL_TO_USD_RATE).toFixed(2)}`; };
const resolveIPFS = (uri: string) => uri?.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri || '';
const formatShortTime = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s`; if (diff < 3600) return `${Math.floor(diff / 60)}m`; if (diff < 86400) return `${Math.floor(diff / 3600)}h`; return `${Math.floor(diff / 86400)}d`;
};
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

// --- Components ---
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
                {type === 'swap' && ( <a href="https://app.uniswap.org/" target="_blank" rel="noopener noreferrer" className="btn w-100 fw-bold" style={{ ...GOLD_BTN_STYLE, padding: '10px', borderRadius: '8px' }}> Swap on Uniswap <i className="bi bi-box-arrow-up-right ms-1"></i> </a> )}
                {type === 'error' && <button onClick={onClose} className="btn w-100 btn-outline-secondary" style={{ color: TEXT_PRIMARY, borderColor: BORDER_COLOR }}>Close</button>}
                {type === 'success' && <button onClick={onClose} className="btn fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '8px', minWidth: '100px' }}>Done</button>}
            </div>
        </div>
    );
};

const Accordion = ({ title, defaultOpen = false, icon, children }: any) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div style={{ borderBottom: `1px solid ${BORDER_COLOR}`, backgroundColor: 'transparent' }}>
            <button onClick={() => setIsOpen(!isOpen)} className="d-flex align-items-center justify-content-between w-100 py-3" style={{ background: 'transparent', border: 'none', color: TEXT_PRIMARY, fontWeight: '600', fontSize: '15px', paddingLeft: 0, paddingRight: 0 }}>
                <div className="d-flex align-items-center gap-3"><i className={`bi ${icon}`} style={{ color: TEXT_MUTED, fontSize: '16px' }}></i> {title}</div>
                <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: TEXT_MUTED, fontSize: '12px' }}></i>
            </button>
            {isOpen && <div className="pb-4 pt-1">{children}</div>}
        </div>
    );
};

const TraitBox = ({ type, value, percent }: any) => (
    <div className="d-flex flex-column align-items-center justify-content-center p-3 h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px', textAlign: 'center' }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>{type}</div>
        <div style={{ color: '#fff', fontWeight: '600', fontSize: '13px', marginBottom: '2px', lineHeight: '1.4' }}>{value}</div>
        <div style={{ color: TEXT_MUTED, fontSize: '10px' }}>{percent} floor</div>
    </div>
);

const mockChartData = [ { name: 'Nov', price: 8 }, { name: 'Dec', price: 10 }, { name: 'Jan', price: 12 }, { name: 'Feb', price: 11 }, { name: 'Mar', price: 15 } ];

function AssetPage() {
    const params = useParams();
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
    
    // Filter & Sort States for Orders
    const [offerSort, setOfferSort] = useState('Newest');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
    const [isFav, setIsFav] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: 'loading', title: '', message: '' });

    const rawId = params?.id;
    const tokenId = Array.isArray(rawId) ? rawId[0] : rawId;

    // --- Click Outside Handler for Dropdowns ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.dropdown-container')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (name: string) => {
        if (openDropdown === name) setOpenDropdown(null);
        else setOpenDropdown(name);
    };

    // --- Data Fetching ---
    const fetchAllData = useCallback(async () => {
        if (!tokenId || !publicClient) return;
        try {
            // 1. Asset & Listing
            const tokenURI = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'tokenURI', args: [BigInt(tokenId)] });
            const metaRes = await fetch(resolveIPFS(tokenURI));
            const meta = metaRes.ok ? await metaRes.json() : {};
            const owner = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'ownerOf', args: [BigInt(tokenId)] });
            const listingData = await publicClient.readContract({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'listings', args: [BigInt(tokenId)] });

            setAsset({
                id: tokenId,
                name: meta.name || `NNM #${tokenId}`,
                description: meta.description || "",
                tier: meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founder',
                price: listingData[2] ? formatEther(listingData[1]) : (meta.attributes?.find((a: any) => a.trait_type === 'Price')?.value || '0'),
                owner: owner,
                image: resolveIPFS(meta.image)
            });

            if (listingData[2]) setListing({ price: formatEther(listingData[1]), seller: listingData[0] });
            else setListing(null);

            setIsOwner(address?.toLowerCase() === owner.toLowerCase());
            if (address && owner.toLowerCase() === address.toLowerCase()) {
                const approvedStatus = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'isApprovedForAll', args: [address, MARKETPLACE_ADDRESS as `0x${string}`] });
                setIsApproved(approvedStatus);
            }
            
            // 2. Offers (Synced with Dashboard Logic)
            const { data: offers } = await supabase.from('offers').select('*').eq('token_id', tokenId).neq('status', 'cancelled');
            if (offers) {
                let enrichedOffers = offers.map((offer: any) => ({
                    id: offer.id,
                    bidder_address: offer.bidder_address,
                    price: offer.price,
                    expiration: offer.expiration,
                    status: offer.status,
                    signature: offer.signature, 
                    isMyOffer: address && offer.bidder_address.toLowerCase() === address.toLowerCase(),
                    created_at: offer.created_at,
                    timeLeft: formatDuration(offer.expiration)
                }));

                // Apply Sorting
                if (offerSort === 'Newest') enrichedOffers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                if (offerSort === 'High Price') enrichedOffers.sort((a, b) => b.price - a.price);
                if (offerSort === 'Low Price') enrichedOffers.sort((a, b) => a.price - b.price);
                
                setOffersList(enrichedOffers);
            }

            // 3. Activity
            const { data: actData } = await supabase.from('activities').select('*').eq('token_id', tokenId).order('created_at', { ascending: false });
            const { data: offerActData } = await supabase.from('offers').select('*').eq('token_id', tokenId).neq('status', 'cancelled').order('created_at', { ascending: false });

            const formattedActs = (actData || []).map((item: any) => ({
                type: item.activity_type,
                price: item.price,
                from: item.from_address,
                to: item.to_address,
                date: item.created_at,
                rawDate: new Date(item.created_at).getTime()
            }));

            const formattedOffers = (offerActData || []).map((item: any) => ({
                type: 'Offer',
                price: item.price,
                from: item.bidder_address,
                to: 'Market', 
                date: item.created_at,
                rawDate: new Date(item.created_at).getTime()
            }));

            const mergedActivity = [...formattedActs, ...formattedOffers].sort((a, b) => b.rawDate - a.rawDate);
            setActivityList(mergedActivity);

        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [tokenId, address, publicClient, offerSort]);

    // --- Sequential Fetching Logic ---
    const fetchMoreAssets = useCallback(async () => {
        if (!tokenId || !publicClient) return;
        const startId = BigInt(tokenId) + BigInt(1);
        const batchIds = [startId, startId + BigInt(1), startId + BigInt(2)];
        const loadedAssets: any[] = [];

        for (const nextId of batchIds) {
            try {
                const tokenURI = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'tokenURI', args: [nextId] });
                const metaRes = await fetch(resolveIPFS(tokenURI));
                const meta = metaRes.ok ? await metaRes.json() : {};
                let isListed = false;
                let price = meta.attributes?.find((a: any) => a.trait_type === 'Price')?.value || '0';
                try {
                    const listingData = await publicClient.readContract({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'listings', args: [nextId] });
                    if (listingData[2]) { isListed = true; price = formatEther(listingData[1]); }
                } catch (e) {}

                loadedAssets.push({
                    id: nextId.toString(),
                    name: meta.name || `NNM #${nextId}`,
                    image: resolveIPFS(meta.image) || '',
                    price: price,
                    isListed: isListed
                });
            } catch (e) {}
        }
        setMoreAssets(loadedAssets);
    }, [tokenId, publicClient]);

    const refreshWpolData = useCallback(async () => {
        if (address && publicClient) {
            try {
                const bal = await publicClient.readContract({ address: WPOL_ADDRESS as `0x${string}`, abi: erc20Abi, functionName: 'balanceOf', args: [address] });
                setWpolBalance(Number(formatEther(bal)));
                const allow = await publicClient.readContract({ address: WPOL_ADDRESS as `0x${string}`, abi: erc20Abi, functionName: 'allowance', args: [address, MARKETPLACE_ADDRESS as `0x${string}`] });
                setWpolAllowance(Number(formatEther(allow)));
            } catch (e) {}
        }
    }, [address, publicClient]);

    useEffect(() => { fetchAllData(); fetchMoreAssets(); }, [fetchAllData, fetchMoreAssets]);
    useEffect(() => { if (isOfferMode) refreshWpolData(); }, [isOfferMode, refreshWpolData]);

    const showModal = (type: string, title: string, message: string) => setModal({ isOpen: true, type, title, message });
    const closeModal = () => { setIsPending(false); setModal({ ...modal, isOpen: false }); if (modal.type === 'success') { fetchAllData(); setIsOfferMode(false); } };

    // --- ACTIONS ---
    const handleApprove = async () => { setIsPending(true); try { const hash = await writeContractAsync({ address: WPOL_ADDRESS as `0x${string}`, abi: erc20Abi, functionName: 'approve', args: [MARKETPLACE_ADDRESS as `0x${string}`, parseEther(offerPrice)] }); await publicClient!.waitForTransactionReceipt({ hash }); await refreshWpolData(); } catch(e) { console.error(e); setIsPending(false); } };
    
    const handleSubmitOffer = async () => {
        if (!address) return;
        setIsPending(true);
        try {
            const priceInWei = parseEther(offerPrice);
            const expiration = BigInt(Math.floor(Date.now() / 1000) + OFFER_DURATION);
            const signature = await signTypedDataAsync({ domain, types, primaryType: 'Offer', message: { bidder: address, tokenId: BigInt(tokenId), price: priceInWei, expiration } });
            await supabase.from('offers').insert([{ token_id: tokenId, bidder_address: address, price: parseFloat(offerPrice), expiration: Number(expiration), status: 'active', signature }]);
            showModal('success', 'Offer Submitted', 'Signed successfully.');
        } catch(e) { setIsPending(false); }
    };

    const handleBuy = async () => {
        if (!listing) return;
        setIsPending(true);
        try {
            const hash = await writeContractAsync({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'buyItem', args: [BigInt(tokenId)], value: parseEther(listing.price) });
            await publicClient!.waitForTransactionReceipt({ hash });
            await supabase.from('activities').insert([{ token_id: tokenId, activity_type: 'Sale', from_address: listing.seller, to_address: address, price: listing.price }]);
            showModal('success', 'Bought!', 'Asset purchased.');
        } catch(e) { setIsPending(false); }
    };

    const handleAccept = async (offer: any) => {
        setIsPending(true);
        try {
            const hash = await writeContractAsync({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'acceptOffChainOffer', args: [BigInt(tokenId), offer.bidder_address, parseEther(offer.price.toString()), BigInt(offer.expiration), offer.signature] });
            await publicClient!.waitForTransactionReceipt({ hash });
            await supabase.from('offers').update({ status: 'accepted' }).eq('id', offer.id);
            await supabase.from('activities').insert([{ token_id: tokenId, activity_type: 'Sale', from_address: address, to_address: offer.bidder_address, price: offer.price }]);
            showModal('success', 'Sold!', 'Offer accepted.');
        } catch(e) { setIsPending(false); }
    };

    const handleCancelOffer = async (id: any) => {
        try {
            await supabase.from('offers').update({ status: 'cancelled' }).eq('id', id);
            fetchAllData();
        } catch(e){}
    };

    const handleApproveNft = async () => { setIsPending(true); try { const hash = await writeContractAsync({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'setApprovalForAll', args: [MARKETPLACE_ADDRESS as `0x${string}`, true] }); await publicClient!.waitForTransactionReceipt({ hash }); setIsApproved(true); } catch (err) { console.error(err); } finally { setIsPending(false); } };
    const handleList = async () => { setIsPending(true); try { const hash = await writeContractAsync({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'listItem', args: [BigInt(tokenId), parseEther(sellPrice)] }); await publicClient!.waitForTransactionReceipt({ hash }); fetchAllData(); setIsListingMode(false); } catch (err) { console.error(err); } finally { setIsPending(false); } };

    if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center" style={{ background: BACKGROUND_DARK, color: TEXT_MUTED }}>Loading...</div>;
    if (!asset) return null;

    return (
        <main style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', paddingBottom: '100px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <CustomModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onClose={closeModal} />
            
            <div className="container-fluid" style={{ maxWidth: '1280px', paddingTop: '20px' }}>
                <div className="row g-3 g-lg-5">
                    
                    {/* LEFT COLUMN */}
                    <div className="col-lg-5">
                        <div className="rounded-4 overflow-hidden position-relative mb-3" style={{ border: `1px solid ${BORDER_COLOR}`, backgroundColor: SURFACE_DARK, aspectRatio: '1/1' }}>
                            <div className="d-flex align-items-center justify-content-end p-3 position-absolute top-0 w-100" style={{ zIndex: 2 }}>
                                <button onClick={() => setIsFav(!isFav)} className="btn p-0 border-0">
                                    <i className={`bi ${isFav ? 'bi-heart-fill text-white' : 'bi-heart text-white'}`} style={{ fontSize: '20px' }}></i>
                                </button>
                            </div>
                            <img src={asset.image} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-lg-7 pt-0">
                        <div className="mb-2">
                            <h1 className={`${GOLD_TEXT_CLASS} fw-bold mb-1`} style={{ fontSize: '32px', letterSpacing: '0.5px' }}>{asset.name}</h1>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span style={{ color: TEXT_PRIMARY, fontSize: '15px', fontWeight: '500' }}>NNM Sovereign Asset</span>
                                <span style={{ color: TEXT_MUTED, fontSize: '13px' }}>Owned by <a href="#" className="text-decoration-none" style={{ color: GOLD_SOLID }}>{asset.owner.slice(0,6)}...</a></span>
                            </div>
                            <div className="d-flex align-items-center gap-4 mb-2" style={{ color: TEXT_MUTED, fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                                <span>ERC721</span>
                                <span>POLYGON</span>
                                <span>TOKEN #{asset.id}</span>
                            </div>
                        </div>

                        {/* TABS (No Line) */}
                        <div className="mb-3">
                            <div className="d-flex" style={{ borderBottom: 'none' }}>
                                {['Details', 'Orders', 'Activity'].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className="btn mx-3 py-2 fw-bold position-relative p-0" style={{ color: activeTab === tab ? '#fff' : TEXT_MUTED, background: 'transparent', border: 'none', fontSize: '15px' }}>
                                        {tab}
                                        {activeTab === tab && <div style={{ position: 'absolute', bottom: '-1px', left: 0, width: '100%', height: '3px', backgroundColor: '#fff', borderRadius: '2px 2px 0 0' }}></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* TAB CONTENT */}
                        <div className="pt-0 mt-0">
                            {activeTab === 'Details' && (
                                <div className="fade-in">
                                    <Accordion title="Traits" icon="bi-tag" defaultOpen={true}>
                                        <div className="row g-2">
                                            <div className="col-6 col-md-4"><TraitBox type="ASSET TYPE" value="Digital Name" percent="100%" /></div>
                                            <div className="col-6 col-md-4"><TraitBox type="COLLECTION" value="Genesis - 001" percent="100%" /></div>
                                            <div className="col-6 col-md-4"><TraitBox type="GENERATION" value="Gen-0" percent="100%" /></div>
                                            <div className="col-6 col-md-4"><TraitBox type="MINT DATE" value="Dec 2025" percent="100%" /></div>
                                            <div className="col-6 col-md-4"><TraitBox type="PLATFORM" value="NNM Registry" percent="100%" /></div>
                                            <div className="col-6 col-md-4"><TraitBox type="TIER" value={asset.tier} percent="21%" /></div>
                                        </div>
                                    </Accordion>

                                    <Accordion title="Price history" icon="bi-graph-up">
                                        <div style={{ height: '200px', width: '100%' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={mockChartData}>
                                                    <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d4f936" stopOpacity={0.2}/><stop offset="95%" stopColor="#d4f936" stopOpacity={0}/></linearGradient></defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER_COLOR} vertical={false} />
                                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30,30,30,0.8)', backdropFilter: 'blur(5px)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                                    <Area type="monotone" dataKey="price" stroke="#d4f936" strokeWidth={2} fill="url(#colorPrice)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Accordion>

                                    <Accordion title={`About ${asset.name}`} icon="bi-text-left">
                                        <div style={{ color: OPENSEA_DESC_COLOR, fontSize: '16px', lineHeight: '1.6', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                                            <p className="mb-4 fw-bold text-white" style={{ fontSize: '18px' }}>GEN-0 Genesis NNM Protocol Record</p>
                                            <p className="mb-4">A singular, unreplicable digital artifact. This digital name is recorded on-chain with a verifiable creation timestamp and immutable registration data under the NNM protocol, serving as a canonical reference layer for historical name precedence within this system.</p>
                                            <p className="mb-0">It represents a Gen-0 registered digital asset and exists solely as a transferable NFT, without renewal, guarantees, utility promises, or dependency. Ownership is absolute, cryptographically secured, and fully transferable. No subscriptions. No recurring fees. No centralized control. This record establishes the earliest verifiable origin of the name as recognized by the NNM protocol permanent, time-anchored digital inscription preserved on the blockchain.</p>
                                        </div>
                                    </Accordion>

                                    <Accordion title="Blockchain details" icon="bi-grid">
                                        <div className="d-flex justify-content-between py-2" style={{ color: TEXT_MUTED, fontSize: '14px' }}><span>Contract Address</span><a href={`https://polygonscan.com/address/${NFT_COLLECTION_ADDRESS}`} target="_blank" className="text-decoration-none" style={{ color: '#2081e2' }}>{NFT_COLLECTION_ADDRESS.slice(0,6)}...{NFT_COLLECTION_ADDRESS.slice(-4)}</a></div>
                                        <div className="d-flex justify-content-between py-2" style={{ color: TEXT_MUTED, fontSize: '14px' }}><span>Token ID</span><span style={{ color: TEXT_PRIMARY }}>{tokenId}</span></div>
                                        <div className="d-flex justify-content-between py-2" style={{ color: TEXT_MUTED, fontSize: '14px' }}><span>Token Standard</span><span style={{ color: TEXT_PRIMARY }}>ERC-721</span></div>
                                        <div className="d-flex justify-content-between py-2" style={{ color: TEXT_MUTED, fontSize: '14px' }}><span>Chain</span><span style={{ color: TEXT_PRIMARY }}>Polygon</span></div>
                                    </Accordion>

                                    <Accordion title="More from this collection" icon="bi-collection">
                                        <div className="d-flex gap-3 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                                            {moreAssets.length > 0 ? moreAssets.map(item => (
                                                <Link key={item.id} href={`/asset/${item.id}`} className="text-decoration-none">
                                                    <div className="h-100 d-flex flex-column" style={{ width: '220px', backgroundColor: '#161b22', borderRadius: '10px', border: '1px solid #2d2d2d', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}>
                                                        <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative', overflow: 'hidden' }}>
                                                            {item.image ? (<img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />) : (<div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="bi bi-image text-secondary"></i></div>)}
                                                        </div>
                                                        <div className="p-3 d-flex flex-column flex-grow-1">
                                                            <div className="d-flex justify-content-between align-items-start mb-1">
                                                                <div className="text-white fw-bold text-truncate" style={{ fontSize: '14px', maxWidth: '80%' }}>{item.name}</div>
                                                                <div style={{ fontSize: '12px', color: '#cccccc' }}>#{item.id}</div>
                                                            </div>
                                                            <div className="text-white mb-2" style={{ fontSize: '13px', fontWeight: '500' }}>NNM Registry</div>
                                                            <div className="mt-auto">
                                                                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{item.isListed ? `${item.price} POL` : <span className="fw-normal" style={{ fontSize: '12px', color: '#cccccc' }}>Not Listed</span>}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )) : (
                                                <div className="text-muted text-center w-100 py-3">Loading more assets...</div>
                                            )}
                                        </div>
                                    </Accordion>
                                </div>
                            )}

                            {activeTab === 'Orders' && (
                                <div className="mt-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="position-relative dropdown-container">
                                            <button onClick={() => toggleDropdown('offerSort')} className="btn border border-secondary d-flex flex-column align-items-center justify-content-center gap-1" style={{ borderRadius: '8px', borderColor: '#333', width: '32px', height: '32px', padding: '0', backgroundColor: 'transparent' }}>
                                                <div style={{ width: '16px', height: '2px', backgroundColor: '#FFF', borderRadius: '1px' }}></div><div style={{ width: '16px', height: '2px', backgroundColor: '#FFF', borderRadius: '1px' }}></div><div style={{ width: '16px', height: '2px', backgroundColor: '#FFF', borderRadius: '1px' }}></div>
                                            </button>
                                            {openDropdown === 'offerSort' && (
                                                <div className="position-absolute mt-2 p-2 rounded-3 shadow-lg" style={{ top: '100%', left: 0, width: '180px', backgroundColor: '#1E1E1E', border: '1px solid #333', zIndex: 100 }}>
                                                    {['Newest', 'High Price', 'Low Price'].map(sort => (<button key={sort} onClick={() => { setOfferSort(sort); setOpenDropdown(null); }} className="btn w-100 text-start btn-sm text-white" style={{ backgroundColor: offerSort === sort ? '#2d2d2d' : 'transparent', fontSize: '13px' }}>{sort}</button>))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table mb-0" style={{ backgroundColor: 'transparent', color: '#fff', borderCollapse: 'separate', borderSpacing: '0' }}>
                                            <thead><tr>
                                                <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '12px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '20%' }}>Price</th>
                                                <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '12px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '15%' }}>Unit</th>
                                                <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '12px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '25%' }}>From</th>
                                                <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '12px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '20%' }}>Expiration</th>
                                                <th style={{ backgroundColor: 'transparent', borderBottom: '1px solid #2d2d2d', width: '20%' }}></th>
                                            </tr></thead>
                                            <tbody>
                                                {offersList.map((offer) => (
                                                    <tr key={offer.id}>
                                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontWeight: '600', fontSize: '13px' }}>{formatCompactNumber(offer.price)}</td>
                                                        <td style={{ backgroundColor: 'transparent', padding: '12px 0', borderBottom: '1px solid #2d2d2d', color: TEXT_MUTED, fontSize: '13px' }}>WPOL</td>
                                                        <td style={{ backgroundColor: 'transparent', padding: '12px 0', borderBottom: '1px solid #2d2d2d' }}><a href="#" style={{ color: GOLD_SOLID, textDecoration: 'none', fontSize: '13px' }}>{offer.bidder_address === address ? 'You' : offer.bidder_address.slice(0,6)}</a></td>
                                                        <td style={{ backgroundColor: 'transparent', padding: '12px 0', borderBottom: '1px solid #2d2d2d', color: TEXT_MUTED, fontSize: '13px' }}>{offer.timeLeft}</td>
                                                        <td style={{ backgroundColor: 'transparent', padding: '12px 0', borderBottom: '1px solid #2d2d2d', textAlign: 'right' }}>
                                                            {isOwner && !offer.isMyOffer && <button onClick={() => handleAccept(offer)} className="btn btn-sm btn-light fw-bold" style={{ fontSize: '11px', padding: '4px 12px' }}>Accept</button>}
                                                            {offer.isMyOffer && <button onClick={() => handleCancelOffer(offer.id)} className="btn btn-sm btn-outline-danger" style={{ fontSize: '11px', padding: '4px 12px' }}>Cancel</button>}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {offersList.length === 0 && <tr><td colSpan={5} className="text-center py-5 text-muted" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>No active offers</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Activity' && (
                                <div className="mt-4 pb-5">
                                    <div className="table-responsive">
                                        <table className="table mb-0" style={{ backgroundColor: 'transparent', color: '#fff', borderCollapse: 'separate', borderSpacing: '0', fontSize: '11px' }}>
                                            <thead><tr>
                                                <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '12%' }}>Event</th>
                                                <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '18%' }}>W/POL</th>
                                                <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '25%' }}>From</th>
                                                <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '25%' }}>To</th>
                                                <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '10%', textAlign: 'right' }}>Date</th>
                                            </tr></thead>
                                            <tbody>
                                                {activityList.map((act, index) => (
                                                    <tr key={index}>
                                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d' }}>{act.type}</td>
                                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontWeight: '600' }}>{act.price ? formatCompactNumber(act.price) : '-'}</td>
                                                        <td style={{ backgroundColor: 'transparent', color: GOLD_SOLID, padding: '12px 0', borderBottom: '1px solid #2d2d2d' }}>{act.from ? act.from.slice(0,6) : '-'}</td>
                                                        <td style={{ backgroundColor: 'transparent', color: GOLD_SOLID, padding: '12px 0', borderBottom: '1px solid #2d2d2d' }}>{act.to ? (act.to === 'Market' ? 'Market' : act.to.slice(0,6)) : '-'}</td>
                                                        <td style={{ backgroundColor: 'transparent', color: TEXT_MUTED, padding: '12px 0', borderBottom: '1px solid #2d2d2d', textAlign: 'right' }}>{formatShortTime(act.date)}</td>
                                                    </tr>
                                                ))}
                                                {activityList.length === 0 && <tr><td colSpan={5} className="text-center py-5 text-muted" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>No recent activity</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* STICKY FOOTER */}
            <div className="fixed-bottom p-3" style={{ backgroundColor: '#1E1E1E', borderTop: `1px solid ${BORDER_COLOR}`, zIndex: 100 }}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    <div className="d-flex align-items-center justify-content-between">
                       <div className="d-flex flex-column">
                           {listing ? (
                               <>
                                <span style={{ color: TEXT_MUTED, fontSize: '11px' }}>Buy price</span>
                                <div className="d-flex align-items-baseline gap-2">
                                    <span className="text-white fw-bold" style={{ fontSize: '18px' }}>{formatCompactNumber(parseFloat(listing.price))} POL</span>
                                    <span style={{ color: TEXT_MUTED, fontSize: '12px' }}>{formatUSD(listing.price)}</span>
                                </div>
                               </>
                           ) : (
                               <>
                                <span style={{ color: TEXT_MUTED, fontSize: '11px' }}>Highest Offer</span>
                                <div className="d-flex align-items-baseline gap-2">
                                    <span className="text-white fw-bold" style={{ fontSize: '18px' }}>{offersList[0] ? formatCompactNumber(offersList[0].price) : '--'} WPOL</span>
                                    <span style={{ color: TEXT_MUTED, fontSize: '12px' }}>{offersList[0] ? formatUSD(offersList[0].price) : '$0.00'}</span>
                                </div>
                               </>
                           )}
                       </div>
                       <div className="d-flex gap-2 w-50 justify-content-end">
                           {!isConnected ? (
                               <div style={{ width: '100%' }}><ConnectButton.Custom>{({ openConnectModal }) => (<button onClick={openConnectModal} className="btn w-100 fw-bold py-3" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>Connect Wallet</button>)}</ConnectButton.Custom></div>
                           ) : (
                               listing && !isOwner ? (
                                   <>
                                    <button onClick={handleBuy} className="btn fw-bold flex-grow-1" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>Buy</button>
                                    <button onClick={() => setIsOfferMode(true)} className="btn fw-bold flex-grow-1" style={{ ...OUTLINE_BTN_STYLE, borderRadius: '12px' }}>Offer</button>
                                   </>
                               ) : !isOwner ? (
                                   <button onClick={() => setIsOfferMode(true)} className="btn fw-bold w-100 py-3" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>Make Offer</button>
                               ) : (
                                   isListingMode ? (
                                     <div className="d-flex gap-2 w-100">
                                        {!isApproved ? 
                                            <button onClick={handleApproveNft} disabled={isPending} className="btn w-100 py-3 fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>Approve NFT</button>
                                            : <button onClick={handleList} disabled={isPending} className="btn w-100 py-3 fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>Confirm List</button>
                                        }
                                        <button onClick={() => setIsListingMode(false)} className="btn btn-secondary py-3 fw-bold" style={{ borderRadius: '12px' }}>Cancel</button>
                                     </div>
                                   ) : (
                                       <button onClick={() => setIsListingMode(true)} className="btn fw-bold w-100 py-3" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>List for Sale</button>
                                   )
                               )
                           )}
                       </div>
                    </div>
                </div>
            </div>

            {/* MAKE OFFER MODAL */}
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
