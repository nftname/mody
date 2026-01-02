'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useWriteContract, usePublicClient, useBalance } from "wagmi";
import { parseAbi, formatEther, parseEther, erc721Abi, erc20Abi } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';
// @ts-ignore
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WPOL_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; 
const GOLD_GRADIENT = 'linear-gradient(to bottom, #FFD700 0%, #E6BE03 25%, #B3882A 50%, #E6BE03 75%, #FFD700 100%)';

// Styles
const GOLD_BTN_STYLE = { background: '#FCD535', color: '#000', border: 'none', fontWeight: 'bold' as const };
const OUTLINE_BTN_STYLE = { background: 'transparent', color: '#FCD535', border: '1px solid #FCD535', fontWeight: 'bold' as const };

const MARKETPLACE_ABI = parseAbi([
    "function listItem(uint256 tokenId, uint256 price) external",
    "function buyItem(uint256 tokenId) external payable",
    "function cancelListing(uint256 tokenId) external",
    "function makeOffer(uint256 tokenId, uint256 price, uint256 duration) external",
    "function cancelOffer(uint256 tokenId) external",
    "function acceptOffer(uint256 tokenId, address bidder) external",
    "function listings(uint256 tokenId) view returns (address seller, uint256 price, bool exists)",
    "function offers(uint256 tokenId, address bidder) view returns (address bidder, uint256 price, uint256 expiration)"
]);

// EVENT ABI (JSON Format - More Robust)
const EVENT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "bidder", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "OfferMade",
    "type": "event"
  }
];

const formatDuration = (seconds: number) => {
    if (seconds <= 0) return "Expired";
    const days = Math.floor(seconds / (3600 * 24));
    if (days > 0) return `${days}d`;
    const hours = Math.floor(seconds / 3600);
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
};

const CustomModal = ({ isOpen, type, title, message, onClose, onGoToMarket, onSwap }: any) => {
    if (!isOpen) return null;

    let icon = <div className="spinner-border text-warning" role="status"></div>;
    let iconColor = '#FCD535';

    if (type === 'success') {
        icon = <i className="bi bi-check-circle-fill" style={{ fontSize: '40px', color: '#28a745' }}></i>;
        iconColor = '#28a745';
    } else if (type === 'error') {
        icon = <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '40px', color: '#dc3545' }}></i>;
        iconColor = '#dc3545';
    } else if (type === 'swap') {
        icon = <i className="bi bi-wallet2" style={{ fontSize: '40px', color: '#FCD535' }}></i>;
    }

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
                
                {type === 'error' && (
                    <button onClick={onClose} className="btn w-100 btn-outline-secondary">Close</button>
                )}
                 {type === 'success' && (
                    <div className="d-flex gap-2 justify-content-center">
                        <button onClick={onClose} className="btn fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '8px', minWidth: '100px' }}>Done</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const getHeroStyles = (tier: string) => {
    switch(tier?.toLowerCase()) {
        case 'immortal': return { bg: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 100%)', border: '1px solid rgba(252, 213, 53, 0.5)', shadow: '0 0 80px rgba(252, 213, 53, 0.15), inset 0 0 40px rgba(0,0,0,0.8)', textColor: GOLD_GRADIENT, labelColor: '#FCD535' };
        case 'elite': return { bg: 'linear-gradient(135deg, #2b0505 0%, #4a0a0a 100%)', border: '1px solid rgba(255, 50, 50, 0.5)', shadow: '0 0 80px rgba(255, 50, 50, 0.2), inset 0 0 40px rgba(0,0,0,0.8)', textColor: GOLD_GRADIENT, labelColor: '#FCD535' };
        case 'founder': 
        case 'founders': return { bg: 'linear-gradient(135deg, #001f24 0%, #003840 100%)', border: '1px solid rgba(0, 128, 128, 0.4)', shadow: '0 0 60px rgba(0, 100, 100, 0.15), inset 0 0 40px rgba(0,0,0,0.9)', textColor: GOLD_GRADIENT, labelColor: '#4db6ac' };
        default: return { bg: '#000', border: '1px solid #333', shadow: 'none', textColor: '#fff', labelColor: '#fff' };
    }
};

const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
};

const mockChartData = [ { name: 'Dec 1', price: 10 }, { name: 'Today', price: 12 } ];

function AssetPage() {
    const params = useParams();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    
    const { data: polBalanceData } = useBalance({ address });

    const [asset, setAsset] = useState<any | null>(null);
    const [listing, setListing] = useState<any | null>(null);
    const [offersList, setOffersList] = useState<any[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isPending, setIsPending] = useState(false);
    
    const [sellPrice, setSellPrice] = useState('10');
    const [offerPrice, setOfferPrice] = useState('');
    const [isListingMode, setIsListingMode] = useState(false);
    const [isOfferMode, setIsOfferMode] = useState(false);
    
    const [wpolBalance, setWpolBalance] = useState<number>(0);
    const [wpolAllowance, setWpolAllowance] = useState<number>(0);
    
    const [currentPage, setCurrentPage] = useState(1);
    const offersPerPage = 5;
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const [modal, setModal] = useState({ isOpen: false, type: 'loading', title: '', message: '' });

    const rawId = params?.id;
    const tokenId = Array.isArray(rawId) ? rawId[0] : rawId;

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
        } catch (error) { console.error("Failed to fetch asset", error); }
    }, [tokenId, address, publicClient]);

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
        } catch (e) { console.error("Market Error", e); }
    }, [tokenId, publicClient]);

    // --- ENHANCED OFFERS FETCHER (Using JSON ABI) ---
    const fetchOffers = useCallback(async () => {
        if (!tokenId || !publicClient) return;
        try {
            const uniqueBidders = new Set<string>();

            // 1. Always check current user
            if (address) uniqueBidders.add(address);

            // 2. Fetch History using robust JSON ABI
            try {
                const logs = await publicClient.getContractEvents({ 
                    address: MARKETPLACE_ADDRESS as `0x${string}`, 
                    abi: EVENT_ABI, 
                    eventName: 'OfferMade', 
                    args: { tokenId: BigInt(tokenId) }, 
                    fromBlock: 'earliest' 
                });
                
                logs.forEach((log: any) => {
                    if (log.args && log.args.bidder) uniqueBidders.add(log.args.bidder);
                });
            } catch (err) {
                console.warn("Event fetch warning:", err);
            }

            const offerPromises = Array.from(uniqueBidders).map(async (bidder) => {
                try {
                    const offerData = await publicClient.readContract({ 
                        address: MARKETPLACE_ADDRESS as `0x${string}`, 
                        abi: MARKETPLACE_ABI, 
                        functionName: 'offers', 
                        args: [BigInt(tokenId), bidder as `0x${string}`]
                    });
                    return { bidder, offerData };
                } catch {
                    return null;
                }
            });

            const results = await Promise.all(offerPromises);
            const validOffers = [];
            const nowInSeconds = BigInt(Math.floor(Date.now() / 1000));
            
            for (const res of results) {
                if (res && res.offerData) {
                    const [ , price, expiration] = res.offerData; 
                    if (price > BigInt(0) && expiration > nowInSeconds) {
                        validOffers.push({
                            bidder: res.bidder as `0x${string}`,
                            price: formatEther(price),
                            expiration: Number(expiration),
                            totalPrice: price
                        });
                    }
                }
            }
            
            validOffers.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            setOffersList(validOffers);

        } catch (e) {
            console.warn("Offers System Error:", e);
        }
    }, [tokenId, publicClient, address]);

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
            Promise.all([fetchAssetData(), checkListing(), fetchOffers()]).then(() => setLoading(false));
        }
    }, [tokenId, address, fetchAssetData, checkListing, fetchOffers, publicClient]);

    useEffect(() => {
        if (isOfferMode && address) refreshWpolData();
    }, [isOfferMode, address, refreshWpolData]);

    const showModal = (type: string, title: string, message: string) => setModal({ isOpen: true, type, title, message });
    
    const closeModal = () => {
        setIsPending(false); 
        setModal({ ...modal, isOpen: false });
        if (modal.type === 'success') {
             fetchOffers(); refreshWpolData(); checkListing(); fetchAssetData();
             setIsListingMode(false);
             setIsOfferMode(false);
             setOfferPrice('');
        }
    };
    
    const goToMarket = () => { closeModal(); router.push('/market'); };

    const handleTx = async (action: string, fn: () => Promise<void>, onSuccess?: () => void) => {
        if (!publicClient || !address) {
            showModal('error', 'Connection Error', 'Please connect your wallet.');
            return;
        }
        setIsPending(true);
        showModal('loading', action, 'Confirm transaction in wallet...');
        try {
            await fn();
            fetchOffers(); refreshWpolData(); checkListing(); fetchAssetData();
            
            if (onSuccess) {
                onSuccess();
            } else {
                 setModal({ isOpen: true, type: 'success', title: 'Complete!', message: 'Transaction confirmed on blockchain.' });
            }
        } catch (err: any) {
            console.error(err);
            showModal('error', 'Failed', err.message?.slice(0, 100) || "Transaction failed or rejected.");
            setIsPending(false);
        }
    };

    const handleBuy = () => {
        if (!listing) return;
        const priceNeeded = parseFloat(listing.pricePerToken);
        const currentPol = polBalanceData ? parseFloat(polBalanceData.formatted) : 0;

        if (currentPol < priceNeeded) {
            showModal('swap', 'Insufficient POL', 'You need more POL to buy this item.');
            return;
        }

        handleTx('Buying Asset', async () => {
            const hash = await writeContractAsync({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKETPLACE_ABI,
                functionName: 'buyItem',
                args: [BigInt(tokenId)],
                value: parseEther(listing.pricePerToken)
            });
            await publicClient!.waitForTransactionReceipt({ hash });
        });
    };

    const handleApprove = () => handleTx('Approving WPOL', async () => {
        if (!offerPrice) throw new Error("Enter a price first");
        const hash = await writeContractAsync({
            address: WPOL_ADDRESS as `0x${string}`,
            abi: erc20Abi,
            functionName: 'approve',
            args: [MARKETPLACE_ADDRESS as `0x${string}`, parseEther(offerPrice)]
        });
        await publicClient!.waitForTransactionReceipt({ hash });
    }, async () => {
        await refreshWpolData();
        setModal({ isOpen: false, type: '', title: '', message: '' }); 
        setIsPending(false); 
    });

    const handleOffer = () => {
        if (!offerPrice) return;
        
        const priceNeeded = parseFloat(offerPrice);
        if (wpolBalance < priceNeeded) {
            showModal('swap', 'Insufficient WPOL', 'Swap POL to WPOL to make an offer.');
            return;
        }

        if (wpolAllowance < priceNeeded) {
             showModal('error', 'Approval Needed', 'Please approve WPOL first.');
             return;
        }

        handleTx('Sending Offer', async () => {
            const duration = BigInt(180 * 24 * 60 * 60); 
            const hash = await writeContractAsync({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKETPLACE_ABI,
                functionName: 'makeOffer',
                args: [BigInt(tokenId), parseEther(offerPrice), duration]
            });
            await publicClient!.waitForTransactionReceipt({ hash });
        });
    };

    const handleList = () => handleTx('Listing Asset', async () => {
        const hash = await writeContractAsync({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'listItem',
            args: [BigInt(tokenId), parseEther(sellPrice)]
        });
        await publicClient!.waitForTransactionReceipt({ hash });
    });

    const handleApproveNft = () => handleTx('Approving Market', async () => {
        const hash = await writeContractAsync({
            address: NFT_COLLECTION_ADDRESS as `0x${string}`,
            abi: erc721Abi,
            functionName: 'setApprovalForAll',
            args: [MARKETPLACE_ADDRESS as `0x${string}`, true]
        });
        await publicClient!.waitForTransactionReceipt({ hash });
    }, () => {
        setIsApproved(true);
        setModal({ isOpen: false, type: '', title: '', message: '' }); 
        setIsPending(false); 
    });

    const handleCancelList = () => handleTx('Cancelling Listing', async () => {
        const hash = await writeContractAsync({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'cancelListing',
            args: [BigInt(tokenId)]
        });
        await publicClient!.waitForTransactionReceipt({ hash });
    });

    const handleAcceptOffer = (bidder: string) => handleTx('Accepting Offer', async () => {
        const hash = await writeContractAsync({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'acceptOffer',
            args: [BigInt(tokenId), bidder as `0x${string}`]
        });
        await publicClient!.waitForTransactionReceipt({ hash });
    });

    const handleCancelOffer = () => handleTx('Cancelling Offer', async () => {
        const hash = await writeContractAsync({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'cancelOffer',
            args: [BigInt(tokenId)]
        });
        await publicClient!.waitForTransactionReceipt({ hash });
    });

    const handleRecheckBalance = async () => {
        if (!address) return;
        await refreshWpolData();
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedOffers = useMemo(() => {
        let sortable = [...offersList];
        if (sortConfig !== null) {
            sortable.sort((a, b) => {
                if (sortConfig.key === 'price') {
                    return sortConfig.direction === 'asc' 
                        ? parseFloat(a.price) - parseFloat(b.price) 
                        : parseFloat(b.price) - parseFloat(a.price);
                }
                if (sortConfig.key === 'expiration') {
                    return sortConfig.direction === 'asc' 
                        ? a.expiration - b.expiration 
                        : b.expiration - a.expiration;
                }
                return 0;
            });
        }
        return sortable;
    }, [offersList, sortConfig]);

    if (loading) return <div className="vh-100 bg-black text-secondary d-flex justify-content-center align-items-center">Loading Asset...</div>;
    if (!asset) return <div className="vh-100 bg-black text-white d-flex justify-content-center align-items-center">Asset Not Found</div>;
    
    const style = getHeroStyles(asset.tier);
    const targetAmount = Number(offerPrice) || 0;
    const hasFunds = wpolBalance >= targetAmount;
    const hasAllowance = hasFunds && wpolAllowance >= targetAmount;

    const indexOfLastOffer = currentPage * offersPerPage;
    const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
    const currentOffers = sortedOffers.slice(indexOfFirstOffer, indexOfLastOffer);
    const totalPages = Math.ceil(offersList.length / offersPerPage);

    return (
        <main style={{ backgroundColor: '#0b0e11', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
            <CustomModal 
                isOpen={modal.isOpen} 
                type={modal.type} 
                title={modal.title} 
                message={modal.message} 
                onClose={closeModal} 
                onGoToMarket={modal.title.includes('Success') ? goToMarket : undefined} 
                onSwap={() => window.open('https://app.uniswap.org/', '_blank')}
            />
            <div className="container py-3">
                <div className="d-flex align-items-center gap-2 text-secondary mb-4" style={{ fontSize: '14px' }}>
                    <Link href="/market" className="text-decoration-none text-secondary hover-gold">Market</Link>
                    <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
                    <span className="text-white">{asset.name}</span>
                </div>
                <div className="row g-5">
                    {/* Left Column: Image */}
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

                    {/* Right Column */}
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

                        {/* Price & Action Buttons */}
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
                                        <div style={{ width: '100%', height: '50px' }}>
                                            <ConnectButton.Custom>
                                                {({ openConnectModal }) => (
                                                    <button onClick={openConnectModal} className="btn w-100 fw-bold" style={{ ...GOLD_BTN_STYLE, height: '100%' }}>Connect to Buy</button>
                                                )}
                                            </ConnectButton.Custom>
                                        </div>
                                    ) : (
                                        listing ? (
                                            !isOwner ? (
                                                !isOfferMode ? (
                                                    <div className="d-flex gap-2">
                                                        <button onClick={handleBuy} disabled={isPending} className="btn fw-bold flex-grow-1" style={{ ...GOLD_BTN_STYLE, height: '50px' }}>{isPending ? 'Processing...' : 'Buy Now'}</button>
                                                        <button onClick={() => setIsOfferMode(true)} className="btn fw-bold flex-grow-1" style={{ ...OUTLINE_BTN_STYLE, height: '50px' }}>Make Offer</button>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex flex-column gap-2">
                                                        <div className="d-flex justify-content-between text-secondary small">
                                                            <span>Balance: {wpolBalance.toFixed(2)} WPOL</span>
                                                            <span>Required: {targetAmount} WPOL</span>
                                                        </div>
                                                        <input type="number" className="form-control bg-dark text-white border-secondary" placeholder="Offer Price (POL)" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
                                                        {!hasFunds ? (
                                                            <div className="text-center mt-1"><span className="text-danger small d-block mb-2">Insufficient WPOL Balance</span><button onClick={handleRecheckBalance} className="btn btn-sm btn-outline-warning w-100">Check Balance Again</button></div>
                                                        ) : (
                                                            <div className="d-flex gap-2">
                                                                {!hasAllowance ? (
                                                                    <button onClick={handleApprove} disabled={isPending} className="btn fw-bold flex-grow-1" style={{ ...GOLD_BTN_STYLE }}>{isPending ? 'Wait...' : '1. Approve WPOL'}</button>
                                                                ) : (
                                                                    <button onClick={handleOffer} disabled={isPending} className="btn fw-bold flex-grow-1" style={{ ...GOLD_BTN_STYLE }}>{isPending ? 'Processing...' : '2. Confirm Offer'}</button>
                                                                )}
                                                                <button onClick={() => setIsOfferMode(false)} className="btn btn-outline-secondary">Cancel</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            ) : (
                                                <button onClick={handleCancelList} disabled={isPending} className="btn w-100 fw-bold" style={{ ...GOLD_BTN_STYLE, background: '#333', color: '#fff', border: '1px solid #555', height: '50px' }}>{isPending ? 'Processing...' : 'Cancel Listing'}</button>
                                            )
                                        ) : (
                                            isOwner ? (
                                                !isListingMode ? (
                                                    <div className="d-flex flex-column gap-2">
                                                        <button onClick={() => setIsListingMode(true)} className="btn w-100 fw-bold" style={{ ...GOLD_BTN_STYLE, height: '50px' }}>List for Sale</button>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex flex-column gap-2">
                                                        <input type="number" className="form-control bg-dark text-white border-secondary" placeholder="Price (POL)" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
                                                        <div className="d-flex gap-2">
                                                            {!isApproved ? (
                                                                <button onClick={handleApproveNft} disabled={isPending} className="btn fw-bold flex-grow-1" style={{ ...GOLD_BTN_STYLE }}>{isPending ? 'Wait...' : '1. Approve'}</button>
                                                            ) : (
                                                                <button onClick={handleList} disabled={isPending} className="btn fw-bold flex-grow-1" style={{ ...GOLD_BTN_STYLE }}>{isPending ? 'Processing...' : '2. Confirm'}</button>
                                                            )}
                                                            <button onClick={() => setIsListingMode(false)} className="btn btn-outline-secondary">Cancel</button>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="d-flex gap-2"><button className="btn w-50 fw-bold disabled" style={{ height: '50px', background: '#333', color: '#888', border: 'none' }}>Not Listed</button><button className="btn w-50 fw-bold text-white disabled" style={{ height: '50px', background: 'transparent', border: '1px solid #2a2e35' }}>Make Offer</button></div>
                                            )
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
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

                        {/* Offers Table */}
                        <div className="mb-5">
                            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-secondary">
                                <i className="bi bi-list-ul text-gold"></i>
                                <h5 className="text-white fw-bold mb-0">Offers</h5>
                                <button onClick={fetchOffers} className="btn btn-sm btn-outline-secondary border-0 ms-auto" title="Refresh Offers"><i className="bi bi-arrow-clockwise"></i></button>
                            </div>
                            <div className="rounded-3 overflow-hidden" style={{ border: '1px solid #333', backgroundColor: '#161b22' }}>
                                <div className="table-responsive">
                                    <table className="table mb-0 text-white" style={{ backgroundColor: 'transparent' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #333' }}>
                                                <th onClick={() => handleSort('price')} className="fw-normal py-3 ps-3 text-secondary" style={{ border: 'none', fontSize: '13px', background: 'transparent', cursor: 'pointer' }}>Price <i className="bi bi-arrow-down-up ms-1" style={{ fontSize: '10px' }}></i></th>
                                                <th className="fw-normal py-3 text-secondary" style={{ border: 'none', fontSize: '13px', background: 'transparent' }}>From</th>
                                                <th onClick={() => handleSort('expiration')} className="fw-normal py-3 text-secondary" style={{ border: 'none', fontSize: '13px', background: 'transparent', cursor: 'pointer' }}>Expires <i className="bi bi-arrow-down-up ms-1" style={{ fontSize: '10px' }}></i></th>
                                                <th className="fw-normal py-3 text-end pe-3 text-secondary" style={{ border: 'none', fontSize: '13px', background: 'transparent' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentOffers && currentOffers.length > 0 ? (
                                                currentOffers.map((offer, index) => {
                                                    const isMyOffer = address && offer.bidder.toLowerCase() === address.toLowerCase();
                                                    const timeRemaining = Number(offer.expiration) - Math.floor(Date.now() / 1000);
                                                    
                                                    const shortAddress = offer.bidder ? `${offer.bidder.slice(0,4)}...${offer.bidder.slice(-4)}` : 'Unknown';

                                                    return (
                                                        <tr key={index} style={{ borderBottom: '1px solid #2a2e35', background: 'transparent' }}>
                                                            <td className="ps-3 fw-bold text-white" style={{ border: 'none', verticalAlign: 'middle', background: 'transparent' }}>
                                                                {parseFloat(offer.price).toFixed(2)} WPOL
                                                            </td>
                                                            <td className="text-gold" style={{ border: 'none', verticalAlign: 'middle', fontSize: '13px', background: 'transparent' }}>
                                                                {isMyOffer ? 'You' : shortAddress}
                                                            </td>
                                                            <td className="text-secondary" style={{ border: 'none', verticalAlign: 'middle', fontSize: '12px', background: 'transparent' }}>
                                                                {formatDuration(timeRemaining)}
                                                            </td>
                                                            <td className="text-end pe-3" style={{ border: 'none', verticalAlign: 'middle', padding: '10px 5px', background: 'transparent' }}>
                                                                {isOwner ? (
                                                                    <button onClick={() => handleAcceptOffer(offer.bidder)} disabled={isPending} className="btn btn-sm" style={{ background: GOLD_GRADIENT, color: '#000', fontWeight: 'bold', fontSize: '12px', borderRadius: '6px', border: 'none' }}>
                                                                        {isPending ? '...' : 'Accept'}
                                                                    </button>
                                                                ) : isMyOffer ? (
                                                                     <button onClick={handleCancelOffer} disabled={isPending} className="btn btn-sm btn-outline-danger" style={{ fontSize: '12px', borderRadius: '6px' }}>
                                                                        Cancel
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-secondary" style={{ fontSize: '11px' }}>-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-5 text-secondary" style={{ border: 'none', background: 'transparent' }}>
                                                        <i className="bi bi-inbox fs-3 d-block mb-2 opacity-50"></i>
                                                        No active offers yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {offersList.length > offersPerPage && (
                                    <div className="d-flex justify-content-center align-items-center p-3 gap-3 border-top border-secondary border-opacity-25">
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                            disabled={currentPage === 1}
                                            className="btn btn-sm btn-outline-secondary border-0"
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                        <span className="text-secondary small">Page {currentPage} of {totalPages}</span>
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                            disabled={currentPage === totalPages}
                                            className="btn btn-sm btn-outline-secondary border-0"
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
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
