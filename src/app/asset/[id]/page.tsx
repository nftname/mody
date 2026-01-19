'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
const OPENSEA_DESC_COLOR = '#E5E8EB'; 
const GOLD_SOLID = '#F0C420';
const GOLD_GRADIENT = 'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #B8860B 100%)';
const GOLD_TEXT_CLASS = 'gold-text-effect'; 
const GOLD_BTN_STYLE = { background: GOLD_GRADIENT, color: '#1a1200', border: 'none', fontWeight: 'bold' as const };
const OUTLINE_BTN_STYLE = { background: 'transparent', color: GOLD_SOLID, border: `1px solid ${GOLD_SOLID}`, fontWeight: 'bold' as const };

const GLASS_BTN_STYLE = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${GOLD_SOLID}`,
    color: GOLD_SOLID,
    backdropFilter: 'blur(5px)',
    borderRadius: '12px',
    fontWeight: 'bold' as const,
    fontSize: '16px',
    padding: '12px',
    width: '100%',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
};

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

const formatCompactNumber = (num: number) => Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
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
            <button onClick={() => setIsOpen(!isOpen)} className="d-flex align-items-center justify-content-between w-100 py-3 px-3" style={{ background: 'transparent', border: 'none', color: TEXT_PRIMARY, fontWeight: '600', fontSize: '15px' }}>
                <div className="d-flex align-items-center gap-3">
                    <i className={`bi ${icon}`} style={{ color: TEXT_MUTED, fontSize: '16px', paddingLeft: '4px' }}></i> 
                    {title}
                </div>
                <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: TEXT_MUTED, fontSize: '12px', paddingRight: '4px' }}></i>
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
    
    const [asset, setAsset] = useState<any | null>(null);
    const [listing, setListing] = useState<any | null>(null);
    const [offersList, setOffersList] = useState<any[]>([]);
    const [activityList, setActivityList] = useState<any[]>([]);
    const [moreAssets, setMoreAssets] = useState<any[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set()); // FAVORITES STATE

    const [offerSort, setOfferSort] = useState('Newest');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('Details');
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isListingMode, setIsListingMode] = useState(false);
    const [sellPrice, setSellPrice] = useState('10');
    const [isOfferMode, setIsOfferMode] = useState(false);
    const [offerStep, setOfferStep] = useState<'select' | 'input'>('select');
    const [offerPrice, setOfferPrice] = useState('');
    const [wpolBalance, setWpolBalance] = useState<number>(0);
    const [wpolAllowance, setWpolAllowance] = useState<number>(0);
    
    const [modal, setModal] = useState({ isOpen: false, type: 'loading', title: '', message: '' });

    const rawId = params?.id;
    const tokenId = Array.isArray(rawId) ? rawId[0] : rawId;
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOfferMode && offerStep === 'input' && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOfferMode, offerStep]);

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

    // --- FAVORITES LOGIC ---
    const fetchFavorites = async () => {
        if (!address) return;
        try {
            const { data, error } = await supabase.from('favorites').select('token_id').eq('wallet_address', address);
            if (error) throw error;
            // ✅ Surgical Fix 1: Added (item: any)
            if (data) setFavoriteIds(new Set(data.map((item: any) => item.token_id)));
        } catch (e) { console.error("Error fetching favorites", e); }
    };

    const handleToggleFavorite = async (e: React.MouseEvent, targetTokenId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!address) return; 

        const newFavs = new Set(favoriteIds);
        const isFav = newFavs.has(targetTokenId);

        if (isFav) newFavs.delete(targetTokenId);
        else newFavs.add(targetTokenId);

        setFavoriteIds(newFavs);

        try {
            if (isFav) {
                await supabase.from('favorites').delete().match({ wallet_address: address, token_id: targetTokenId });
            } else {
                await supabase.from('favorites').insert({ wallet_address: address, token_id: targetTokenId });
            }
        } catch (error) {
            console.error("Error toggling favorite", error);
            fetchFavorites(); 
        }
    };

    const fetchAllData = useCallback(async () => {
        if (!tokenId || !publicClient) return;
        try {
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
                image: resolveIPFS(meta.image),
                mintDate: meta.attributes?.find((a: any) => a.trait_type === 'Mint Date')?.value
            });

            if (listingData[2]) setListing({ price: formatEther(listingData[1]), seller: listingData[0] });
            else setListing(null);

            setIsOwner(address?.toLowerCase() === owner.toLowerCase());
            if (address && owner.toLowerCase() === address.toLowerCase()) {
                const approvedStatus = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'isApprovedForAll', args: [address, MARKETPLACE_ADDRESS as `0x${string}`] });
                setIsApproved(approvedStatus);
            }
            
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
                // ✅ Surgical Fix 2: Added (a: any, b: any) to all sorts to prevent implicit any errors
                if (offerSort === 'Newest') enrichedOffers.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                if (offerSort === 'High Price') enrichedOffers.sort((a: any, b: any) => b.price - a.price);
                if (offerSort === 'Low Price') enrichedOffers.sort((a: any, b: any) => a.price - b.price);
                setOffersList(enrichedOffers);
            }

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

    useEffect(() => { 
        fetchAllData(); 
        fetchMoreAssets();
        if (isConnected && address) fetchFavorites();
    }, [fetchAllData, fetchMoreAssets, address, isConnected]);
    
    useEffect(() => { if (isOfferMode) refreshWpolData(); }, [isOfferMode, refreshWpolData]);

    const showModal = (type: string, title: string, message: string) => setModal({ isOpen: true, type, title, message });
    const closeModal = () => { setIsPending(false); setModal({ ...modal, isOpen: false }); if (modal.type === 'success') { fetchAllData(); setIsOfferMode(false); } };

    const handleApprove = async () => { setIsPending(true); try { const hash = await writeContractAsync({ address: WPOL_ADDRESS as `0x${string}`, abi: erc20Abi, functionName: 'approve', args: [MARKETPLACE_ADDRESS as `0x${string}`, parseEther(offerPrice)] }); await publicClient!.waitForTransactionReceipt({ hash }); await refreshWpolData(); } catch(e) { console.error(e); setIsPending(false); } };
    
    const handleSubmitOffer = async () => {
        if (!address) return;
        if (wpolBalance < parseFloat(offerPrice || '0')) return;
        setIsPending(true);
        try {
            const priceInWei = parseEther(offerPrice);
            const expiration = BigInt(Math.floor(Date.now() / 1000) + OFFER_DURATION);
            const signature = await signTypedDataAsync({ domain, types, primaryType: 'Offer', message: { bidder: address, tokenId: BigInt(tokenId), price: priceInWei, expiration } });
            await supabase.from('offers').insert([{ token_id: tokenId, bidder_address: address, price: parseFloat(offerPrice), expiration: Number(expiration), status: 'active', signature }]);
            setIsOfferMode(false); 
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
    
    // Cancel Listing Function
    const handleCancelListing = async () => {
        setIsPending(true);
        try {
            const hash = await writeContractAsync({ 
                address: MARKETPLACE_ADDRESS as `0x${string}`, 
                abi: MARKETPLACE_ABI, 
                functionName: 'cancelListing', 
                args: [BigInt(tokenId)] 
            });
            await publicClient!.waitForTransactionReceipt({ hash });
            fetchAllData();
        } catch (e) { console.error(e); } finally { setIsPending(false); }
    };

    const openOfferModal = () => {
        setOfferStep(listing ? 'select' : 'input');
        setIsOfferMode(true);
        setOfferPrice('');
    };

    // Shared Button Component
    const RenderActionButtons = ({ mobile = false }) => {
        const btnClass = mobile ? "btn w-100 fw-bold py-2" : "btn w-100 fw-bold py-3";
        const containerStyle = mobile ? { width: '65%', maxWidth: '500px' } : { width: '100%' };

        if (!isConnected) {
            return (
                <div style={containerStyle}>
                    <ConnectButton.Custom>
                        {({ openConnectModal }) => (
                            <button onClick={openConnectModal} className={btnClass} style={{ ...GLASS_BTN_STYLE, width: '100%', maxWidth: 'none', fontSize: '16px' }}>
                                Make Offer
                            </button>
                        )}
                    </ConnectButton.Custom>
                </div>
            );
        }

        if (isOwner) {
            if (isListingMode) {
                return (
                    <div className="d-flex gap-2 w-100 justify-content-center" style={{maxWidth: mobile ? '600px' : '100%'}}>
                        {!isApproved ? 
                            <button onClick={handleApproveNft} disabled={isPending} className="btn py-2 fw-bold flex-grow-1" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px', fontSize: '16px' }}>Approve NFT</button>
                            : <button onClick={handleList} disabled={isPending} className="btn py-2 fw-bold flex-grow-1" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px', fontSize: '16px' }}>Confirm List</button>
                        }
                        <button onClick={() => setIsListingMode(false)} className="btn btn-secondary py-2 fw-bold flex-grow-1" style={{ borderRadius: '12px', fontSize: '16px' }}>Cancel</button>
                    </div>
                );
            }
            // Logic Fix: Show Cancel Listing if already listed
            if (listing) {
                return <button onClick={handleCancelListing} disabled={isPending} className={btnClass} style={{ ...OUTLINE_BTN_STYLE, borderRadius: '12px', width: mobile ? '65%' : '100%', maxWidth: mobile ? '500px' : 'none', fontSize: '16px' }}>Cancel Listing</button>;
            }
            return <button onClick={() => setIsListingMode(true)} className={btnClass} style={{ ...GOLD_BTN_STYLE, borderRadius: '12px', width: mobile ? '65%' : '100%', maxWidth: mobile ? '500px' : 'none', fontSize: '16px' }}>List for Sale</button>;
        }

        return (
            <button onClick={openOfferModal} style={mobile ? GLASS_BTN_STYLE : { ...GLASS_BTN_STYLE, width: '100%', maxWidth: 'none' }}>
                Make Offer
            </button>
        );
    };

    if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center" style={{ background: BACKGROUND_DARK, color: TEXT_MUTED }}>Loading...</div>;
    if (!asset) return null;

    const hasEnoughBalance = wpolBalance >= parseFloat(offerPrice || '0');
    const isMainFav = favoriteIds.has(asset.id);

    return (
        <main style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', paddingBottom: '100px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <CustomModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onClose={closeModal} />
            
            <div className="container-fluid" style={{ maxWidth: '1280px', paddingTop: '20px' }}>
                <div className="row g-3 g-lg-5">
                    
                    <div className="col-lg-5">
                        <div className="rounded-4 overflow-hidden position-relative mb-3" style={{ border: `1px solid ${BORDER_COLOR}`, backgroundColor: SURFACE_DARK, aspectRatio: '1/1' }}>
                            {/* FAVORITE BUTTON (MAIN IMAGE) */}
                            <div className="d-flex align-items-center justify-content-end p-3 position-absolute top-0 w-100" style={{ zIndex: 2 }}>
                                <button onClick={(e) => handleToggleFavorite(e, asset.id)} className="btn p-0 border-0">
                                    <i className={`bi ${isMainFav ? 'bi-heart-fill' : 'bi-heart'}`} style={{ fontSize: '24px', color: isMainFav ? '#FFFFFF' : '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}></i>
                                </button>
                            </div>
                            <img src={asset.image} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        {/* DESKTOP BUTTON LOCATION (Left Column, Under Image) */}
                        <div className="d-none d-lg-block mt-4">
                            <RenderActionButtons mobile={false} />
                        </div>
                    </div>

                    <div className="col-lg-7 pt-0">
                        <div className="mb-2">
                            <h1 className={`${GOLD_TEXT_CLASS} fw-bold mb-3`} style={{ fontSize: '32px', letterSpacing: '0.5px' }}>{asset.name}</h1>
                            
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <span style={{ color: TEXT_PRIMARY, fontSize: '15px', fontWeight: '500' }}>NNM Sovereign Asset</span>
                                <span style={{ color: TEXT_MUTED, fontSize: '13px' }}>
                                    Owned by <Link href={`/profile/${asset.owner}`} className="text-decoration-none" style={{ color: GOLD_SOLID }}>
                                        {asset.owner.slice(0,6)}...{asset.owner.slice(-4)}
                                    </Link>
                                </span>
                            </div>
                            
                            <div className="d-flex align-items-center gap-4 mb-2" style={{ color: TEXT_MUTED, fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                                <span>ERC721</span>
                                <span>POLYGON</span>
                                <span>TOKEN #{asset.id}</span>
                            </div>
                        </div>

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

                        <div className="pt-0 mt-0">
                            <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '12px', overflow: 'hidden', backgroundColor: SURFACE_DARK }}>
                                {activeTab === 'Details' && (
                                    <div className="fade-in">
                                        <Accordion title="Traits" icon="bi-tag" defaultOpen={true}>
                                            <div className="row g-2 px-3">
                                                <div className="col-6 col-md-4"><TraitBox type="ASSET TYPE" value="Digital Name" percent="100%" /></div>
                                                <div className="col-6 col-md-4"><TraitBox type="COLLECTION" value="Genesis - 001" percent="100%" /></div>
                                                <div className="col-6 col-md-4"><TraitBox type="GENERATION" value="Gen-0" percent="100%" /></div>
                                                <div className="col-6 col-md-4"><TraitBox type="MINT DATE" value={asset.mintDate || 'Unknown'} percent="100%" /></div>
                                                <div className="col-6 col-md-4"><TraitBox type="PLATFORM" value="NNM Registry" percent="100%" /></div>
                                                <div className="col-6 col-md-4"><TraitBox type="TIER" value={asset.tier} percent="21%" /></div>
                                            </div>
                                        </Accordion>

                                        <Accordion title="Price history" icon="bi-graph-up">
                                            <div style={{ height: '200px', width: '100%' }} className="px-3">
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
                                            <div className="px-3" style={{ color: OPENSEA_DESC_COLOR, fontSize: '16px', lineHeight: '1.6', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                                                <div className="mb-4" style={{ fontSize: '16px', fontWeight: '600', color: OPENSEA_DESC_COLOR }}>
                                                    GEN-0 Genesis — NNM Protocol Record
                                                </div>
                                                <p className="mb-4">
                                                    A singular, unreplicable digital artifact. This digital name is recorded on-chain with a verifiable creation timestamp and immutable registration data under the NNM protocol, serving as a canonical reference layer for historical name precedence within this system.
                                                </p>
                                                <p className="mb-0">
                                                    It represents a Gen-0 registered digital asset and exists solely as a transferable NFT, without renewal, guarantees, utility promises, or dependency. Ownership is absolute, cryptographically secured, and fully transferable. No subscriptions. No recurring fees. No centralized control. This record establishes the earliest verifiable origin of the name as recognized by the NNM protocol — a permanent, time-anchored digital inscription preserved on the blockchain.
                                                </p>
                                            </div>
                                        </Accordion>

                                        <Accordion title="Blockchain details" icon="bi-grid">
                                            <div className="px-3">
                                                <div className="d-flex justify-content-between py-2" style={{ color: TEXT_MUTED, fontSize: '14px' }}><span>Contract Address</span><a href={`https://polygonscan.com/address/${NFT_COLLECTION_ADDRESS}`} target="_blank" className="text-decoration-none" style={{ color: '#2081e2' }}>{NFT_COLLECTION_ADDRESS.slice(0,6)}...{NFT_COLLECTION_ADDRESS.slice(-4)}</a></div>
                                                <div className="d-flex justify-content-between py-2" style={{ color: TEXT_MUTED, fontSize: '14px' }}><span>Token ID</span><span style={{ color: TEXT_PRIMARY }}>{tokenId}</span></div>
                                                <div className="d-flex justify-content-between py-2" style={{ color: TEXT_MUTED, fontSize: '14px' }}><span>Token Standard</span><span style={{ color: TEXT_PRIMARY }}>ERC-721</span></div>
                                                <div className="d-flex justify-content-between py-2" style={{ color: TEXT_MUTED, fontSize: '14px' }}><span>Chain</span><span style={{ color: TEXT_PRIMARY }}>Polygon</span></div>
                                            </div>
                                        </Accordion>

                                        <Accordion title="More from this collection" icon="bi-collection">
                                            <div className="d-flex gap-3 overflow-auto pb-3 px-3" style={{ scrollbarWidth: 'none' }}>
                                                {moreAssets.length > 0 ? moreAssets.map(item => {
                                                    const isItemFav = favoriteIds.has(item.id);
                                                    return (
                                                        <Link key={item.id} href={`/asset/${item.id}`} className="text-decoration-none">
                                                            <div className="h-100 d-flex flex-column" style={{ width: '220px', backgroundColor: '#161b22', borderRadius: '10px', border: '1px solid #2d2d2d', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}>
                                                                <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative', overflow: 'hidden' }}>
                                                                    {/* FAVORITE BUTTON (MORE ASSETS) */}
                                                                    <button 
                                                                        onClick={(e) => handleToggleFavorite(e, item.id)} 
                                                                        className="btn position-absolute top-0 end-0 m-2 p-0 border-0 bg-transparent" 
                                                                        style={{ zIndex: 10 }}
                                                                    >
                                                                        <i className={`bi ${isItemFav ? 'bi-heart-fill' : 'bi-heart'}`} style={{ color: isItemFav ? '#FFFFFF' : 'white', fontSize: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}></i>
                                                                    </button>
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
                                                    );
                                                }) : (
                                                    <div className="text-muted text-center w-100 py-3">Loading more assets...</div>
                                                )}
                                            </div>
                                        </Accordion>
                                    </div>
                                )}

                                {activeTab === 'Orders' && (
                                    <div className="p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <div className="position-relative dropdown-container">
                                                <button onClick={() => toggleDropdown('offerSort')} className="btn d-flex align-items-center gap-2" style={{ border: 'none', background: 'transparent', color: '#fff', fontSize: '14px' }}>
                                                    Sort by <i className="bi bi-chevron-down" style={{ fontSize: '11px' }}></i>
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
                                                    <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '12px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '20%' }}>WPOL</th>
                                                    <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '12px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '25%' }}>From</th>
                                                    <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '12px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '25%' }}>To</th>
                                                    <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '12px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '20%' }}>Exp</th>
                                                    <th style={{ backgroundColor: 'transparent', borderBottom: '1px solid #2d2d2d', width: '10%' }}></th>
                                                </tr></thead>
                                                <tbody>
                                                    {offersList.length === 0 ? (
                                                        <tr><td colSpan={5} className="text-center py-5 text-muted" style={{ borderBottom: `1px solid ${BORDER_COLOR}`, backgroundColor: 'transparent' }}>No active offers</td></tr>
                                                    ) : (
                                                        offersList.map((offer) => (
                                                            <tr key={offer.id}>
                                                                <td className="align-middle" style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontWeight: '600', fontSize: '13px' }}>{formatCompactNumber(offer.price)}</td>
                                                                <td className="align-middle" style={{ backgroundColor: 'transparent', padding: '12px 0', borderBottom: '1px solid #2d2d2d' }}><Link href={`/profile/${offer.bidder_address}`} style={{ color: GOLD_SOLID, textDecoration: 'none', fontSize: '13px' }}>{offer.bidder_address === address ? 'You' : offer.bidder_address.slice(0,6)}</Link></td>
                                                                <td className="align-middle" style={{ backgroundColor: 'transparent', padding: '12px 0', borderBottom: '1px solid #2d2d2d' }}><Link href={`/profile/${asset.owner}`} style={{ color: GOLD_SOLID, textDecoration: 'none', fontSize: '13px' }}>{asset?.owner === address ? 'You' : (asset?.owner ? asset.owner.slice(0,6) : '-')}</Link></td>
                                                                <td className="align-middle" style={{ backgroundColor: 'transparent', padding: '12px 0', borderBottom: '1px solid #2d2d2d', color: TEXT_MUTED, fontSize: '13px' }}>{offer.timeLeft}</td>
                                                                <td className="align-middle" style={{ backgroundColor: 'transparent', padding: '12px 0', borderBottom: '1px solid #2d2d2d', textAlign: 'right' }}>
                                                                    {isOwner && !offer.isMyOffer && <button onClick={() => handleAccept(offer)} className="btn btn-sm btn-light fw-bold" style={{ fontSize: '11px', padding: '4px 12px' }}>Accept</button>}
                                                                    {offer.isMyOffer && <button onClick={() => handleCancelOffer(offer.id)} className="btn btn-sm fw-bold" style={{ fontSize: '11px', padding: '4px 12px', background: 'rgba(240, 196, 32, 0.1)', border: `1px solid ${GOLD_SOLID}`, color: GOLD_SOLID, backdropFilter: 'blur(4px)', borderRadius: '8px' }}>Cancel</button>}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'Activity' && (
                                    <div className="p-3 pb-5">
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
                                                            <td className="align-middle" style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d' }}>{act.type}</td>
                                                            <td className="align-middle" style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontWeight: '600' }}>{act.price ? formatCompactNumber(act.price) : '-'}</td>
                                                            <td className="align-middle" style={{ backgroundColor: 'transparent', color: GOLD_SOLID, padding: '12px 0', borderBottom: '1px solid #2d2d2d' }}>
                                                                {act.from ? <Link href={`/profile/${act.from}`} style={{color: GOLD_SOLID, textDecoration: 'none'}}>{act.from.slice(0,6)}</Link> : '-'}
                                                            </td>
                                                            <td className="align-middle" style={{ backgroundColor: 'transparent', color: GOLD_SOLID, padding: '12px 0', borderBottom: '1px solid #2d2d2d' }}>
                                                                {act.to ? (act.to === 'Market' ? 'Market' : <Link href={`/profile/${act.to}`} style={{color: GOLD_SOLID, textDecoration: 'none'}}>{act.to.slice(0,6)}</Link>) : '-'}
                                                            </td>
                                                            <td className="align-middle" style={{ backgroundColor: 'transparent', color: TEXT_MUTED, padding: '12px 0', borderBottom: '1px solid #2d2d2d', textAlign: 'right' }}>{formatShortTime(act.date)}</td>
                                                        </tr>
                                                    ))}
                                                    {activityList.length === 0 && <tr><td colSpan={5} className="text-center py-5 text-muted" style={{ borderBottom: `1px solid ${BORDER_COLOR}`, backgroundColor: 'transparent' }}>No recent activity</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE FIXED BOTTOM BAR (Hidden on Desktop) */}
            <div className="fixed-bottom p-2 d-lg-none" style={{ backgroundColor: '#1E1E1E', borderTop: `1px solid ${BORDER_COLOR}`, zIndex: 100 }}>
                <div className="container d-flex justify-content-center" style={{ maxWidth: '1200px' }}>
                    <RenderActionButtons mobile={true} />
                </div>
            </div>

            {isOfferMode && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="fade-in" style={{ backgroundColor: SURFACE_DARK, border: `1px solid ${GOLD_SOLID}`, borderRadius: '16px', padding: '25px', width: '90%', maxWidth: '380px', boxShadow: '0 0 40px rgba(0,0,0,0.6)', position: 'relative', color: TEXT_PRIMARY }}>
                        <button onClick={() => setIsOfferMode(false)} style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', color: TEXT_MUTED, fontSize: '20px', cursor: 'pointer' }}><i className="bi bi-x-lg"></i></button>
                        <h4 className="fw-bold mb-4 text-center" style={{ color: TEXT_PRIMARY }}>{offerStep === 'select' ? 'Select Option' : 'Make an offer'}</h4>

                        {offerStep === 'select' && (
                            <div className="d-flex flex-column gap-3">
                                <button onClick={handleBuy} disabled={isPending} className="btn w-100 py-3 fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px', fontSize: '16px' }}>
                                    Buy for {formatCompactNumber(parseFloat(listing.price))} POL
                                </button>
                                <button onClick={() => setOfferStep('input')} className="btn w-100 py-3 fw-bold" style={{ ...OUTLINE_BTN_STYLE, borderRadius: '12px', fontSize: '16px' }}>
                                    Make a different offer
                                </button>
                            </div>
                        )}

                        {offerStep === 'input' && (
                            <>
                                {listing && <button onClick={() => setOfferStep('select')} className="btn btn-link text-white text-decoration-none mb-2 p-0"><i className="bi bi-arrow-left me-2"></i>Back</button>}
                                <div className="mb-4 text-center">
                                    <div style={{ color: TEXT_MUTED, fontSize: '13px', marginBottom: '8px' }}>Balance: {wpolBalance.toFixed(1)} WPOL</div>
                                    <div className="d-flex align-items-center justify-content-center border rounded-3 overflow-hidden p-2" style={{ borderColor: BORDER_COLOR, backgroundColor: BACKGROUND_DARK }}>
                                        <input 
                                            ref={inputRef}
                                            autoFocus
                                            type="number" 
                                            className="form-control border-0 bg-transparent text-white p-0 text-end" 
                                            style={{ fontSize: '24px', fontWeight: 'bold', width: '100px', boxShadow: 'none' }} 
                                            placeholder="0" 
                                            value={offerPrice} 
                                            onChange={(e) => setOfferPrice(e.target.value)} 
                                        />
                                        <span className="text-white fw-bold ps-2" style={{ fontSize: '20px' }}>WPOL</span>
                                    </div>
                                    {!hasEnoughBalance && offerPrice && <div className="text-danger mt-2" style={{fontSize: '12px'}}>Insufficient WPOL balance</div>}
                                </div>
                                <div className="d-flex gap-2">
                                    {wpolAllowance < parseFloat(offerPrice || '0') ? (
                                        <button onClick={handleApprove} disabled={isPending || !hasEnoughBalance || !offerPrice} className="btn w-100 py-3 fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>{isPending ? 'Approving...' : 'Approve WPOL'}</button>
                                    ) : (
                                        <button onClick={handleSubmitOffer} disabled={isPending || !hasEnoughBalance || !offerPrice} className="btn w-100 py-3 fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '12px' }}>{isPending ? 'Signing...' : 'Submit Offer'}</button>
                                    )}
                                </div>
                            </>
                        )}
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
