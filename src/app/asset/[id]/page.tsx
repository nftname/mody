'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useActiveAccount, TransactionButton, useConnectModal } from "thirdweb/react";
import { getContract, readContract, prepareContractCall, toWei, toTokens, NATIVE_TOKEN_ADDRESS } from "thirdweb";
import { createWallet, walletConnect } from "thirdweb/wallets"; 
import { 
    createListing, 
    buyFromListing, 
    getAllValidListings,
    cancelListing,
    makeOffer,
    getAllValidOffers 
} from "thirdweb/extensions/marketplace";
import { setApprovalForAll, isApprovedForAll } from "thirdweb/extensions/erc721";
import { balanceOf } from "thirdweb/extensions/erc20";
import { client } from "@/lib/client"; 
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS, NETWORK_CHAIN } from '@/data/config';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- CONFIGURATION ---
const WPOL_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; 

// --- VISUAL IDENTITY (Matches Mint Page) ---
const THEME_BG = '#0d1117';     
const CARD_BG = '#161b22';      
const GOLD_GRADIENT = 'linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)';

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  walletConnect(),
];

// --- STYLED MODAL ---
const CustomModal = ({ isOpen, type, title, message, actionBtn, onClose }: any) => {
    if (!isOpen) return null;
    return (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', 
            zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' 
        }}>
            <div style={{ 
                width: '100%', maxWidth: '420px', backgroundColor: CARD_BG, 
                border: '1px solid #333', borderRadius: '20px', padding: '30px', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)', textAlign: 'center', position: 'relative' 
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#666', fontSize: '24px', cursor: 'pointer', zIndex: 10 }}>
                    <i className="bi bi-x-lg"></i>
                </button>

                <div className="fade-in">
                    {type === 'success' && <div className="mb-3"><i className="bi bi-check-circle-fill text-success" style={{fontSize: '3.5rem'}}></i></div>}
                    {type === 'error' && <div className="mb-3"><i className="bi bi-exclamation-triangle-fill text-danger" style={{fontSize: '3.5rem'}}></i></div>}
                    {type === 'info' && <div className="mb-3"><i className="bi bi-info-circle-fill text-warning" style={{fontSize: '3.5rem', color: '#FCD535'}}></i></div>}
                    
                    <h3 className="text-white fw-bold mb-3" style={{ fontSize: '22px' }}>{title}</h3>
                    <p className="text-secondary mb-4" style={{ fontSize: '15px', lineHeight: '1.6' }}>{message}</p>
                    
                    {actionBtn ? actionBtn : (
                        <button onClick={onClose} className="btn w-100 fw-bold py-3" style={{ backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '8px' }}>
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- HELPER STYLES ---
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

const mockChartData = [ { name: 'Dec 1', price: 10 }, { name: 'Today', price: 12 } ];

// --- CONTRACTS ---
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
    const [offersList, setOffersList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    
    // UI State
    const [sellPrice, setSellPrice] = useState('10');
    const [offerPrice, setOfferPrice] = useState('');
    const [isListingMode, setIsListingMode] = useState(false);
    const [isOfferMode, setIsOfferMode] = useState(false);
    
    // Modal State
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', actionBtn: null as any });
    
    // Wallet Logic State
    const [wpolBalance, setWpolBalance] = useState<number>(0);
    const [wpolAllowance, setWpolAllowance] = useState<number>(0);

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
                description: meta.description || "No description provided.",
                tier: meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founder',
                price: meta.attributes?.find((a: any) => a.trait_type === 'Price')?.value || '10',
                owner: owner
            });

            if (account && owner.toLowerCase() === account.address.toLowerCase()) {
                setIsOwner(true);
                const approvedStatus = await isApprovedForAll({ contract: nftContract, owner: account.address, operator: MARKETPLACE_ADDRESS });
                setIsApproved(approvedStatus);
            }
            
            // FIXED: Fetch all offers first, then filter manually (API fix)
            const allOffers = await getAllValidOffers({ contract: marketplaceContract });
            const validOffers = allOffers.filter(o => 
                o.assetContractAddress.toLowerCase() === NFT_COLLECTION_ADDRESS.toLowerCase() && 
                o.tokenId.toString() === tokenId.toString()
            );
            setOffersList(validOffers);

        } catch (error) { console.error("Data Error", error); }
    };

    const checkListing = async () => {
        if (!tokenId) return;
        try {
            const listings = await getAllValidListings({ contract: marketplaceContract, start: 0, count: BigInt(100) });
            const foundListing = listings.find(l => l.asset.id.toString() === tokenId.toString());
            setListing(foundListing || null);
        } catch (e) { console.error("Market Error", e); }
    };

    // --- SMART BALANCE CHECK ---
    const refreshBalances = useCallback(async () => {
        if (account) {
            try {
                // 1. Check WPOL Balance
                const wpolBal = await balanceOf({ contract: wpolContract, address: account.address });
                setWpolBalance(Number(toTokens(wpolBal, 18)));

                // 2. Check Allowance
                const allow = await readContract({
                    contract: wpolContract,
                    method: "function allowance(address, address) view returns (uint256)",
                    params: [account.address, MARKETPLACE_ADDRESS]
                });
                setWpolAllowance(Number(toTokens(allow, 18)));
            } catch (e) { console.error("Balance Error", e); }
        }
    }, [account]);

    useEffect(() => {
        if (tokenId) { Promise.all([fetchAssetData(), checkListing()]).then(() => setLoading(false)); }
    }, [tokenId, account]);

    useEffect(() => {
        if (isOfferMode && account) refreshBalances();
    }, [isOfferMode, account, refreshBalances]);

    // --- ACTIONS ---
    const handleConnect = () => {
        connect({ client, wallets });
    };

    const closeModal = () => {
        setModal({ ...modal, isOpen: false });
        if (modal.type === 'success') window.location.reload();
    };

    // --- LOGIC: CHECK FUNDS BEFORE OFFER ---
    const handlePreOfferCheck = () => {
        if (!offerPrice) return;
        const price = parseFloat(offerPrice);
        
        // Scenario 1: Has enough WPOL -> Good to go
        if (wpolBalance >= price) {
            // Check Allowance is handled in UI render logic
            return;
        }

        // Scenario 2: Doesn't have WPOL
        setModal({
            isOpen: true,
            type: 'info',
            title: 'Action Required: Swap to WPOL',
            message: `Offers require WPOL (Wrapped POL). You currently have ${wpolBalance.toFixed(2)} WPOL. Please go to your wallet app (MetaMask/Trust) and SWAP your POL to WPOL (1:1 ratio). It takes seconds!`,
            actionBtn: (
                <button 
                    onClick={() => { refreshBalances(); setModal({...modal, isOpen: false}); }} 
                    className="btn w-100 fw-bold py-3" 
                    style={{ background: GOLD_GRADIENT, border: 'none', color: '#000', borderRadius: '8px' }}
                >
                    I Swapped - Refresh Balance
                </button>
            )
        });
    };

    if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center text-secondary" style={{ backgroundColor: THEME_BG }}>Loading...</div>;
    if (!asset) return <div className="vh-100 d-flex justify-content-center align-items-center text-white" style={{ backgroundColor: THEME_BG }}>Asset Not Found</div>;
    
    const style = getHeroStyles(asset.tier);
    const targetAmount = offerPrice ? Number(offerPrice) : 0;
    const hasEnoughWPOL = wpolBalance >= targetAmount;
    const needsApproval = hasEnoughWPOL && wpolAllowance < targetAmount;

    return (
        <main style={{ backgroundColor: THEME_BG, minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
            
            <CustomModal 
                isOpen={modal.isOpen} 
                type={modal.type} 
                title={modal.title} 
                message={modal.message} 
                actionBtn={modal.actionBtn}
                onClose={closeModal} 
            />

            <div className="container py-4">
                <div className="d-flex align-items-center gap-2 text-secondary mb-4" style={{ fontSize: '14px' }}>
                    <Link href="/market" className="text-decoration-none text-secondary">Market</Link>
                    <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
                    <span className="text-white">{asset.name}</span>
                </div>

                <div className="row g-5">
                    {/* LEFT: Image */}
                    <div className="col-lg-5">
                         <div className="rounded-4 d-flex justify-content-center align-items-center position-relative overflow-hidden" 
                              style={{ background: CARD_BG, border: `1px solid #333`, minHeight: '500px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
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

                    {/* RIGHT: Actions */}
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
                                <button onClick={handleConnect} className="btn w-100 fw-bold" style={{ background: GOLD_GRADIENT, height: '50px', border: 'none', color: '#000', borderRadius: '10px' }}>
                                    Connect Wallet
                                </button>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {listing ? (
                                        !isOwner ? (
                                            !isOfferMode ? (
                                                <div className="d-flex gap-3">
                                                    <TransactionButton
                                                        transaction={async () => {
                                                            if(!listing) throw new Error("No Listing");
                                                            return buyFromListing({ contract: marketplaceContract, listingId: listing.id, recipient: account?.address || "", quantity: BigInt(1) });
                                                        }}
                                                        onTransactionConfirmed={() => setModal({isOpen: true, type: 'success', title: 'Success', message: 'Asset Purchased Successfully!', actionBtn: null})}
                                                        style={{ background: GOLD_GRADIENT, color: '#000', fontWeight: 'bold', flex: 1, height: '50px', border: 'none', borderRadius: '10px' }}
                                                    >
                                                        Buy Now
                                                    </TransactionButton>
                                                    <button onClick={() => setIsOfferMode(true)} className="btn fw-bold flex-grow-1 text-white" style={{ background: 'transparent', border: '1px solid #FCD535', height: '50px', borderRadius: '10px' }}>
                                                        Make Offer
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-4 rounded-3" style={{ backgroundColor: '#0d1117', border: '1px solid #333' }}>
                                                    <div className="d-flex justify-content-between text-secondary small mb-2">
                                                        <span>My Balance: {wpolBalance.toFixed(2)} WPOL</span>
                                                        <span>Offer Amount</span>
                                                    </div>
                                                    <input 
                                                        type="number" 
                                                        className="form-control bg-dark text-white border-secondary mb-3" 
                                                        placeholder="Enter Amount (WPOL)" 
                                                        value={offerPrice} 
                                                        onChange={(e) => setOfferPrice(e.target.value)} 
                                                        style={{ height: '50px', fontSize: '18px' }}
                                                    />
                                                    
                                                    {!hasEnoughWPOL ? (
                                                        <button 
                                                            onClick={handlePreOfferCheck}
                                                            className="btn w-100 fw-bold py-3" 
                                                            style={{ background: GOLD_GRADIENT, border: 'none', color: '#000', borderRadius: '8px' }}
                                                        >
                                                            Check & Continue
                                                        </button>
                                                    ) : needsApproval ? (
                                                        <TransactionButton
                                                            transaction={() => prepareContractCall({
                                                                contract: wpolContract,
                                                                method: "function approve(address, uint256)",
                                                                params: [MARKETPLACE_ADDRESS, toWei((Number(offerPrice) * 100).toString())]
                                                            })}
                                                            onTransactionConfirmed={() => refreshBalances()}
                                                            style={{ width: '100%', background: GOLD_GRADIENT, color: '#000', fontWeight: 'bold', borderRadius: '8px', height: '50px' }}
                                                        >
                                                            Approve WPOL
                                                        </TransactionButton>
                                                    ) : (
                                                        <TransactionButton
                                                            transaction={async () => {
                                                                if (!offerPrice || !tokenId) throw new Error("Data Missing");
                                                                return makeOffer({ contract: marketplaceContract, assetContractAddress: NFT_COLLECTION_ADDRESS, tokenId: BigInt(tokenId), totalOffer: offerPrice, currencyContractAddress: WPOL_ADDRESS, offerExpiresAt: new Date(Date.now() + 3 * 86400000) });
                                                            }}
                                                            onTransactionConfirmed={() => setModal({isOpen: true, type: 'success', title: 'Offer Sent', message: 'Your offer has been submitted.', actionBtn: null})}
                                                            style={{ width: '100%', background: GOLD_GRADIENT, color: '#000', fontWeight: 'bold', borderRadius: '8px', height: '50px' }}
                                                        >
                                                            Confirm Offer
                                                        </TransactionButton>
                                                    )}
                                                    
                                                    <button onClick={() => setIsOfferMode(false)} className="btn btn-link text-secondary w-100 text-decoration-none mt-2">Cancel</button>
                                                </div>
                                            )
                                        ) : (
                                            <TransactionButton transaction={() => cancelListing({ contract: marketplaceContract, listingId: listing.id })} style={{ width: '100%', background: '#333', color: '#fff', height: '50px', borderRadius: '10px' }}>Cancel Listing</TransactionButton>
                                        )
                                    ) : (
                                        isOwner ? (
                                            !isListingMode ? (
                                                <button onClick={() => setIsListingMode(true)} className="btn w-100 fw-bold" style={{ background: GOLD_GRADIENT, height: '50px', border: 'none', color: '#000', borderRadius: '10px' }}>List Item</button>
                                            ) : (
                                                <div className="d-flex flex-column gap-2">
                                                    <input type="number" className="form-control bg-dark text-white" placeholder="Price (POL)" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} style={{ height: '50px' }} />
                                                    <div className="d-flex gap-2">
                                                    {!isApproved ? (
                                                        <TransactionButton transaction={() => setApprovalForAll({ contract: nftContract, operator: MARKETPLACE_ADDRESS, approved: true })} onTransactionConfirmed={() => setIsApproved(true)} style={{ flex: 1, background: '#fff', color: '#000', height: '50px', borderRadius: '10px' }}>Approve Market</TransactionButton>
                                                    ) : (
                                                        <TransactionButton 
                                                            transaction={() => {
                                                                if (!tokenId) throw new Error("No Token");
                                                                return createListing({ contract: marketplaceContract, assetContractAddress: NFT_COLLECTION_ADDRESS, tokenId: BigInt(tokenId), pricePerToken: sellPrice, currencyContractAddress: NATIVE_TOKEN_ADDRESS });
                                                            }}
                                                            onTransactionConfirmed={() => setModal({isOpen: true, type: 'success', title: 'Listed', message: 'Asset Listed Successfully', actionBtn: null})}
                                                            style={{ flex: 1, background: GOLD_GRADIENT, color: '#000', height: '50px', borderRadius: '10px' }}
                                                        >
                                                            Confirm
                                                        </TransactionButton>
                                                    )}
                                                    <button onClick={() => setIsListingMode(false)} className="btn btn-outline-secondary" style={{ height: '50px', borderRadius: '10px' }}>Cancel</button>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <button disabled className="btn w-100 disabled" style={{ background: '#333', color: '#666', height: '50px', borderRadius: '10px' }}>Not Listed</button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* OFFERS TABLE (Matches Mint Identity) */}
                        <div className="mb-5">
                            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-secondary">
                                <i className="bi bi-list-ul" style={{ color: '#FCD535' }}></i>
                                <h5 className="text-white fw-bold mb-0">Offers</h5>
                            </div>
                            <div className="rounded-3 overflow-hidden" style={{ border: '1px solid #333' }}>
                                <table className="table table-dark table-hover mb-0" style={{ backgroundColor: CARD_BG }}>
                                    <thead>
                                        <tr>
                                            <th className="text-secondary fw-normal py-3 ps-3">Price</th>
                                            <th className="text-secondary fw-normal py-3">From</th>
                                            <th className="text-secondary fw-normal py-3 text-end pe-3">Expiration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {offersList.length > 0 ? (
                                            offersList.map((offer, index) => (
                                                <tr key={index}>
                                                    <td className="ps-3 fw-bold text-white">{toTokens(offer.totalOfferAmount, 18)} WPOL</td>
                                                    <td style={{ color: '#FCD535' }}>{offer.offeror.slice(0,6)}...{offer.offeror.slice(-4)}</td>
                                                    <td className="text-end pe-3 text-secondary">{new Date(Number(offer.expirationTimestamp) * 1000).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="text-center py-5 text-secondary">
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
                .fade-in { animation: fadeIn 0.4s ease-in; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .btn:focus { box-shadow: none; }
                input:focus { border-color: #FCD535 !important; box-shadow: none; }
            `}</style>
        </main>
    );
}
export default dynamicImport(() => Promise.resolve(AssetPage), { ssr: false });
