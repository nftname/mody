'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useWriteContract, usePublicClient, useBalance } from "wagmi";
import { parseAbi, formatEther, parseEther, erc721Abi, erc20Abi, parseAbiItem } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';
// @ts-ignore
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WPOL_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; 
const GOLD_GRADIENT = 'linear-gradient(to bottom, #FFD700 0%, #E6BE03 25%, #B3882A 50%, #E6BE03 75%, #FFD700 100%)';

// --- STYLES & CONSTANTS (Fixed: Added Missing Constants) ---
const GOLD_BTN_STYLE = { background: '#FCD535', color: '#000', border: 'none', fontWeight: 'bold' as const };
const OUTLINE_BTN_STYLE = { background: 'transparent', color: '#FCD535', border: '1px solid #FCD535', fontWeight: 'bold' as const };

const OS_HEADER_BG = '#262b2f'; 
const OS_BODY_BG = '#202225';
const OS_BORDER = '1px solid #353840';
const OS_TEXT_MAIN = '#ffffff';
const OS_TEXT_SUB = '#8a939b';

const mockChartData = [ { name: 'Dec 1', price: 10 }, { name: 'Today', price: 12 } ];

// --- CONTRACT ABI ---
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

// --- HELPER FUNCTIONS (Fixed: Added Missing Functions) ---
const formatExpiration = (seconds: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = seconds - now;
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (3600 * 24));
    if (days > 0) return `in ${days} days`;
    const hours = Math.floor(diff / 3600);
    return `in ${hours} hours`;
};

const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
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

// --- COMPONENT: MODAL (Fixed: Added Missing Component) ---
const CustomModal = ({ isOpen, type, title, message, onClose, onGoToMarket, onSwap }: any) => {
    if (!isOpen) return null;
    let icon = <div className="spinner-border text-warning" role="status"></div>;
    let iconColor = '#FCD535';
    if (type === 'success') { icon = <i className="bi bi-check-circle-fill" style={{ fontSize: '40px', color: '#28a745' }}></i>; iconColor = '#28a745'; }
    else if (type === 'error') { icon = <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '40px', color: '#dc3545' }}></i>; iconColor = '#dc3545'; }
    
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="fade-in" style={{ backgroundColor: '#161b22', border: `1px solid ${iconColor}`, borderRadius: '16px', padding: '25px', width: '90%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 0 40px rgba(0,0,0,0.6)', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}><i className="bi bi-x-lg"></i></button>
                <div className="mb-3">{icon}</div>
                <h4 className="text-white fw-bold mb-2">{title}</h4>
                <p className="text-secondary mb-4" style={{ fontSize: '14px' }}>{message}</p>
                {type === 'success' && <button onClick={onClose} className="btn fw-bold" style={{ ...GOLD_BTN_STYLE, borderRadius: '8px', minWidth: '100px' }}>Done</button>}
                {type === 'error' && <button onClick={onClose} className="btn w-100 btn-outline-secondary">Close</button>}
            </div>
        </div>
    );
};

// --- COMPONENT: OPENSEA STYLE OFFERS ACCORDION ---
const OffersAccordion = ({ offers, isLoading, userAddress, ownerAddress, onAccept, onCancel }: any) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="rounded-3 overflow-hidden mt-4" style={{ border: OS_BORDER }}>
            <div onClick={() => setIsOpen(!isOpen)} className="d-flex align-items-center justify-content-between p-3 select-none" style={{ backgroundColor: OS_HEADER_BG, cursor: 'pointer', borderBottom: isOpen ? OS_BORDER : 'none' }}>
                <div className="d-flex align-items-center gap-2 fw-bold text-white"><i className="bi bi-tag-fill"></i> Offers</div>
                <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'} text-white`}></i>
            </div>
            {isOpen && (
                <div style={{ backgroundColor: OS_BODY_BG }}>
                    {isLoading ? (
                        <div className="p-5 text-center" style={{ color: OS_TEXT_SUB }}>Loading offers...</div>
                    ) : offers.length === 0 ? (
                        <div className="p-5 text-center d-flex flex-column align-items-center" style={{ color: OS_TEXT_SUB }}>
                            <i className="bi bi-inbox fs-1 mb-3 opacity-50"></i><span>No offers yet</span>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table mb-0" style={{ fontSize: '14px', color: OS_TEXT_MAIN }}>
                                <thead>
                                    <tr>
                                        <th className="py-3 ps-4 fw-normal" style={{ color: OS_TEXT_SUB, borderBottom: OS_BORDER }}>Price</th>
                                        <th className="py-3 fw-normal" style={{ color: OS_TEXT_SUB, borderBottom: OS_BORDER }}>USD Price</th>
                                        <th className="py-3 fw-normal" style={{ color: OS_TEXT_SUB, borderBottom: OS_BORDER }}>Expiration</th>
                                        <th className="py-3 fw-normal" style={{ color: OS_TEXT_SUB, borderBottom: OS_BORDER }}>From</th>
                                        <th className="py-3 pe-4 text-end fw-normal" style={{ color: OS_TEXT_SUB, borderBottom: OS_BORDER }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {offers.map((offer: any, idx: number) => {
                                        const isMyOffer = userAddress && offer.bidder.toLowerCase() === userAddress.toLowerCase();
                                        const isOwner = userAddress && ownerAddress && userAddress.toLowerCase() === ownerAddress.toLowerCase();
                                        return (
                                            <tr key={idx} style={{ borderBottom: idx === offers.length - 1 ? 'none' : '1px solid #2a2e35' }}>
                                                <td className="ps-4 py-3 fw-bold align-middle">{parseFloat(offer.price).toFixed(2)} WPOL</td>
                                                <td className="py-3 align-middle" style={{ color: OS_TEXT_SUB }}>${(parseFloat(offer.price) * 0.50).toFixed(2)}</td>
                                                <td className="py-3 align-middle" style={{ color: OS_TEXT_SUB }}>{formatExpiration(offer.expiration)}</td>
                                                <td className="py-3 align-middle fw-bold"><span style={{ color: '#FCD535' }}>{isMyOffer ? 'you' : `${offer.bidder.slice(0,6)}...${offer.bidder.slice(-4)}`}</span></td>
                                                <td className="pe-4 py-3 text-end align-middle">
                                                    {isOwner ? (
                                                        <button onClick={() => onAccept(offer.bidder)} className="btn btn-sm fw-bold px-3" style={GOLD_BTN_STYLE}>Accept</button>
                                                    ) : isMyOffer ? (
                                                        <button onClick={onCancel} className="btn btn-sm btn-outline-danger px-3">Cancel</button>
                                                    ) : (<span style={{ color: OS_TEXT_SUB }}>Active</span>)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- MAIN PAGE ---
function AssetPage() {
    const params = useParams();
    const { address, isConnected } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const { data: polBalanceData } = useBalance({ address });

    const [asset, setAsset] = useState<any | null>(null);
    const [listing, setListing] = useState<any | null>(null);
    const [offersList, setOffersList] = useState<any[]>([]);
    
    const [pageLoading, setPageLoading] = useState(true);
    const [offersLoading, setOffersLoading] = useState(true);
    const [txLoading, setTxLoading] = useState(false);

    const [sellPrice, setSellPrice] = useState('10');
    const [offerPrice, setOfferPrice] = useState('');
    const [isListingMode, setIsListingMode] = useState(false);
    const [isOfferMode, setIsOfferMode] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '' });

    const [wpolBalance, setWpolBalance] = useState<number>(0);
    const [wpolAllowance, setWpolAllowance] = useState<number>(0);

    const rawId = params?.id;
    const tokenId = Array.isArray(rawId) ? rawId[0] : rawId;

    // --- DATA FETCHING ---
    const fetchAssetAndListing = useCallback(async () => {
        if (!tokenId || !publicClient) return;
        try {
            const owner = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'ownerOf', args: [BigInt(tokenId)] });
            let meta = { name: `Item #${tokenId}`, description: "No description." };
            try {
                const uri = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: erc721Abi, functionName: 'tokenURI', args: [BigInt(tokenId)] });
                const res = await fetch(resolveIPFS(uri));
                if (res.ok) meta = await res.json();
            } catch (e) { /* ignore meta fail */ }

            setAsset({ id: tokenId, name: meta.name, description: meta.description, owner: owner, tier: 'Founder' });

            try {
                const listData = await publicClient.readContract({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'listings', args: [BigInt(tokenId)] });
                if (listData[2]) setListing({ seller: listData[0], pricePerToken: formatEther(listData[1]) });
                else setListing(null);
            } catch (e) { setListing(null); }

        } catch (e) { console.error("Asset Fetch Error", e); }
        finally { setPageLoading(false); }
    }, [tokenId, publicClient]);

    const fetchOffers = useCallback(async () => {
        if (!tokenId || !publicClient) return;
        setOffersLoading(true);
        try {
            const logs = await publicClient.getLogs({ 
                address: MARKETPLACE_ADDRESS as `0x${string}`, 
                event: parseAbiItem('event OfferMade(address indexed bidder, uint256 indexed tokenId, uint256 price)'),
                fromBlock: 'earliest' 
            });

            const uniqueBidders = new Set<string>();
            logs.forEach((log: any) => {
                const logId = log.args.tokenId ? log.args.tokenId.toString() : null;
                if (logId === tokenId.toString()) uniqueBidders.add(log.args.bidder);
            });

            const activeOffers = [];
            for (const bidder of Array.from(uniqueBidders)) {
                try {
                    const offerData = await publicClient.readContract({
                        address: MARKETPLACE_ADDRESS as `0x${string}`,
                        abi: MARKETPLACE_ABI,
                        functionName: 'offers',
                        args: [BigInt(tokenId), bidder as `0x${string}`]
                    });
                    const [ , price, expiration] = offerData;
                    
                    // Fixed: BigInt(0) instead of 0n for compatibility
                    if (price > BigInt(0) && expiration > BigInt(Math.floor(Date.now()/1000))) {
                        activeOffers.push({ bidder: bidder, price: formatEther(price), expiration: Number(expiration) });
                    }
                } catch (e) { /* invalid offer */ }
            }
            activeOffers.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            setOffersList(activeOffers);
        } catch (e) { console.error("Offers Error", e); } 
        finally { setOffersLoading(false); }
    }, [tokenId, publicClient]);

    const checkWpol = async () => {
        if (!address || !publicClient) return;
        const bal = await publicClient.readContract({ address: WPOL_ADDRESS as `0x${string}`, abi: erc20Abi, functionName: 'balanceOf', args: [address] });
        const all = await publicClient.readContract({ address: WPOL_ADDRESS as `0x${string}`, abi: erc20Abi, functionName: 'allowance', args: [address, MARKETPLACE_ADDRESS as `0x${string}`] });
        setWpolBalance(Number(formatEther(bal)));
        setWpolAllowance(Number(formatEther(all)));
    };

    useEffect(() => {
        if (tokenId && publicClient) { fetchAssetAndListing(); fetchOffers(); }
    }, [tokenId, publicClient, fetchAssetAndListing, fetchOffers]);

    useEffect(() => { if (address) checkWpol(); }, [address]);

    const handleAction = async (actionName: string, fn: () => Promise<any>) => {
        if(!address) return;
        setTxLoading(true);
        setModal({ isOpen: true, type: 'loading', title: actionName, message: 'Confirm transaction in wallet...' });
        try {
            const hash = await fn();
            await publicClient?.waitForTransactionReceipt({ hash });
            setModal({ isOpen: true, type: 'success', title: 'Complete', message: 'Transaction successful!' });
            await fetchAssetAndListing();
            await fetchOffers();
            await checkWpol();
            setIsListingMode(false);
            setIsOfferMode(false);
        } catch (e: any) {
            setModal({ isOpen: true, type: 'error', title: 'Failed', message: e.message?.slice(0, 100) || 'Error' });
        } finally {
            setTxLoading(false);
        }
    };

    if (pageLoading) return <div className="vh-100 bg-black text-secondary d-flex align-items-center justify-content-center">Loading Asset...</div>;
    if (!asset) return <div className="vh-100 bg-black text-white d-flex align-items-center justify-content-center">Asset Not Found</div>;

    const isOwner = address && asset.owner.toLowerCase() === address.toLowerCase();
    const style = getHeroStyles(asset.tier || 'Founder');

    return (
        <main style={{ backgroundColor: '#0b0e11', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '100px' }}>
            <CustomModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({...modal, isOpen: false})} />
            
            <div className="container py-4">
                <div className="row g-5">
                    <div className="col-lg-5">
                        <div className="rounded-4 overflow-hidden position-relative d-flex align-items-center justify-content-center" style={{ aspectRatio: '1/1', background: style.bg, border: style.border, boxShadow: style.shadow }}>
                            <div className="text-center z-2">
                                <h1 style={{ fontSize: '42px', fontWeight: '900', background: style.textColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{asset.name}</h1>
                                <span className="badge bg-dark border border-secondary mt-2">ID: #{asset.id}</span>
                            </div>
                        </div>
                        <div className="rounded-3 overflow-hidden mt-4" style={{ border: OS_BORDER, backgroundColor: '#000' }}>
                            <div className="p-3 d-flex align-items-center gap-2 fw-bold text-white" style={{ backgroundColor: OS_HEADER_BG, borderBottom: OS_BORDER }}><i className="bi bi-justify-left"></i> Description</div>
                            <div className="p-3" style={{ fontSize: '15px', lineHeight: '1.6', backgroundColor: OS_BODY_BG, color: OS_TEXT_SUB }}>{asset.description}</div>
                        </div>
                    </div>

                    <div className="col-lg-7">
                        <div className="d-flex justify-content-between mb-2"><Link href="/market" className="text-decoration-none" style={{ color: '#FCD535' }}>Nexus Name Market</Link></div>
                        <h1 className="text-white fw-bold mb-4">{asset.name}</h1>

                        <div className="rounded-4 p-4" style={{ border: OS_BORDER, backgroundColor: OS_BODY_BG }}>
                            <div className="small mb-1" style={{ color: OS_TEXT_SUB }}>Current Price</div>
                            <h2 className="text-white fw-bold mb-4">{listing ? `${listing.pricePerToken} POL` : 'Not Listed'}</h2>
                            {!isConnected ? ( <div className="d-grid"><ConnectButton /></div> ) : (
                                <div className="d-flex flex-column gap-3">
                                    {listing ? (
                                        isOwner ? (
                                            <button onClick={() => handleAction('Cancel Listing', () => writeContractAsync({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'cancelListing', args: [BigInt(tokenId)] }))} disabled={txLoading} className="btn w-100 fw-bold py-3" style={GOLD_BTN_STYLE}>{txLoading ? 'Processing...' : 'Cancel Listing'}</button>
                                        ) : (
                                            <div className="d-flex gap-3">
                                                <button onClick={() => handleAction('Buy Item', () => writeContractAsync({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'buyItem', args: [BigInt(tokenId)], value: parseEther(listing.pricePerToken) }))} disabled={txLoading} className="btn fw-bold w-50 py-3" style={GOLD_BTN_STYLE}>Buy Now</button>
                                                <button onClick={() => setIsOfferMode(!isOfferMode)} className="btn fw-bold w-50 py-3 text-white" style={{ border: '1px solid white' }}>Make Offer</button>
                                            </div>
                                        )
                                    ) : (
                                        isOwner ? (
                                            !isListingMode ? (
                                                <button onClick={() => setIsListingMode(true)} className="btn w-100 fw-bold py-3" style={GOLD_BTN_STYLE}>List for Sale</button>
                                            ) : (
                                                <div className="d-flex gap-2">
                                                    <input type="number" className="form-control bg-black text-white border-secondary" placeholder="Price (POL)" onChange={e => setSellPrice(e.target.value)} />
                                                    <button onClick={() => handleAction('List Item', () => writeContractAsync({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'listItem', args: [BigInt(tokenId), parseEther(sellPrice)] }))} disabled={txLoading} className="btn fw-bold" style={GOLD_BTN_STYLE}>Confirm</button>
                                                </div>
                                            )
                                        ) : (
                                            <button onClick={() => setIsOfferMode(!isOfferMode)} className="btn w-100 fw-bold py-3 text-white" style={{ border: '1px solid white' }}>Make Offer</button>
                                        )
                                    )}
                                    {isOfferMode && (
                                        <div className="p-3 rounded bg-black border border-secondary">
                                            <div className="d-flex justify-content-between text-secondary small mb-2"><span>Balance: {wpolBalance.toFixed(2)} WPOL</span><span>Allowance: {wpolAllowance.toFixed(2)}</span></div>
                                            <input type="number" className="form-control bg-dark text-white mb-2" placeholder="Amount (WPOL)" onChange={e => setOfferPrice(e.target.value)} />
                                            {wpolAllowance < Number(offerPrice) ? (
                                                <button onClick={() => handleAction('Approve WPOL', () => writeContractAsync({ address: WPOL_ADDRESS as `0x${string}`, abi: erc20Abi, functionName: 'approve', args: [MARKETPLACE_ADDRESS as `0x${string}`, parseEther(offerPrice)] }))} disabled={txLoading} className="btn btn-warning w-100">Approve WPOL</button>
                                            ) : (
                                                // Fixed: BigInt(604800) instead of 604800n
                                                <button onClick={() => handleAction('Make Offer', () => writeContractAsync({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'makeOffer', args: [BigInt(tokenId), parseEther(offerPrice), BigInt(604800)] }))} disabled={txLoading} className="btn btn-success w-100">Confirm Offer</button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="rounded-3 overflow-hidden mt-4" style={{ border: OS_BORDER, backgroundColor: '#000' }}>
                            <div className="p-3 fw-bold text-white" style={{ backgroundColor: OS_HEADER_BG, borderBottom: OS_BORDER }}><i className="bi bi-graph-up-arrow"></i> Price History</div>
                            <div style={{ height: '200px', backgroundColor: OS_BODY_BG }} className="p-2">
                                <ResponsiveContainer width="100%" height="100%"><AreaChart data={mockChartData}><Area type="monotone" dataKey="price" stroke="#FCD535" fill="#FCD535" fillOpacity={0.1} /></AreaChart></ResponsiveContainer>
                            </div>
                        </div>

                        <OffersAccordion 
                            offers={offersList}
                            isLoading={offersLoading}
                            userAddress={address}
                            ownerAddress={asset.owner}
                            onAccept={(bidder: string) => handleAction('Accept Offer', () => writeContractAsync({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'acceptOffer', args: [BigInt(tokenId), bidder as `0x${string}`] }))}
                            onCancel={() => handleAction('Cancel Offer', () => writeContractAsync({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKETPLACE_ABI, functionName: 'cancelOffer', args: [BigInt(tokenId)] }))}
                        />
                    </div>
                </div>
            </div>
            <style jsx global>{` input::placeholder { color: #888; } `}</style>
        </main>
    );
}

export default dynamicImport(() => Promise.resolve(AssetPage), { ssr: false });
