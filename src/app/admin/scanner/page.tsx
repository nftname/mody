'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAccount, usePublicClient } from "wagmi";
import { parseAbi, formatEther } from 'viem';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase';

// --- ABIs ---
const MARKET_ABI = parseAbi([
    "function getAllListings() view returns (uint256[] tokenIds, uint256[] prices, address[] sellers)"
]);

const REGISTRY_ABI = parseAbi([
    "function totalSupply() view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)"
]);

// --- STYLES ---
const GOLD_COLOR = '#FCD535';
const SURFACE_DARK = '#1E1E1E';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.1)';

export default function AdminScannerPage() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    
    // --- States ---
    const [viewMode, setViewMode] = useState<'internal' | 'external'>('internal');
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    
    const [allAssets, setAllAssets] = useState<any[]>([]);
    const [internalWallets, setInternalWallets] = useState<string[]>([]);
    
    // Pagination
    const ITEMS_PER_PAGE = 20;
    const [currentPage, setCurrentPage] = useState(1);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState('newest'); 
    const [lengthFilter, setLengthFilter] = useState('All'); 

    // --- 1. Load Bots (Internal Wallets) ---
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await fetch('/api/admin/get-wallets');
                const data = await res.json();
                if (data.wallets) {
                    const bots = data.wallets.map((w: string) => w.toLowerCase());
                    setInternalWallets(bots);
                }
            } catch (e) { console.error("Bridge Error:", e); }
        };
        fetchWallets();
    }, []);

    // --- 2. DATA ENGINE (Chain + DB) ---
    const fetchMarketData = async () => {
        if (!publicClient) return;
        // Don't set full loading on refresh, just update
        if (allAssets.length === 0) setLoading(true); 
        
        try {
            // A. Blockchain Supply
            const totalSupplyBig = await publicClient.readContract({
                address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                abi: REGISTRY_ABI,
                functionName: 'totalSupply'
            });
            const totalCount = Number(totalSupplyBig);
            
            // B. Listings
            const [listedIds, listedPrices, sellers] = await publicClient.readContract({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKET_ABI,
                functionName: 'getAllListings'
            });

            const listingsMap = new Map();
            listedIds.forEach((id, i) => {
                listingsMap.set(id.toString(), {
                    price: formatEther(listedPrices[i]),
                    seller: sellers[i].toLowerCase()
                });
            });

            // C. Offers
            const { data: offers } = await supabase
                .from('offers')
                .select('token_id, price')
                .eq('status', 'active');
            
            const offersMap = new Map();
            if (offers) {
                offers.forEach((o: any) => {
                    const tid = o.token_id.toString();
                    if (!offersMap.has(tid) || o.price > offersMap.get(tid)) {
                        offersMap.set(tid, o.price);
                    }
                });
            }

            // D. Build Asset List (Batched)
            const allIds = Array.from({ length: totalCount }, (_, i) => i);
            const batchSize = 100; // Faster batching
            let processedAssets: any[] = [];
            
            // For initial load, we show progress. For auto-refresh, we do it silently.
            const isInitial = allAssets.length === 0;

            for (let i = 0; i < allIds.length; i += batchSize) {
                const batch = allIds.slice(i, i + batchSize);
                
                const batchResults = await Promise.all(batch.map(async (tokenId) => {
                    const tid = tokenId.toString();
                    const listing = listingsMap.get(tid);
                    const highestOffer = offersMap.get(tid);
                    
                    let currentOwner = listing ? listing.seller : '';
                    
                    // Optimization: If listing exists, we know owner. If not, fetch.
                    if (!currentOwner) {
                        try {
                            currentOwner = (await publicClient.readContract({
                                address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                                abi: REGISTRY_ABI,
                                functionName: 'ownerOf',
                                args: [BigInt(tid)]
                            })).toLowerCase();
                        } catch { currentOwner = 'burned'; }
                    }

                    return {
                        id: tid,
                        owner: currentOwner,
                        isListed: !!listing,
                        price: listing ? listing.price : null,
                        highestOffer: highestOffer || 0,
                        nameLength: tid.length 
                    };
                }));
                
                processedAssets = [...processedAssets, ...batchResults];
                if (isInitial) setProgress(Math.floor((i / totalCount) * 100));
            }

            setAllAssets(processedAssets);
            setLastUpdated(new Date());

        } catch (e) {
            console.error("Scanner Error:", e);
        } finally {
            setLoading(false);
            setProgress(100);
        }
    };

    // Initial Load
    useEffect(() => {
        if (publicClient) fetchMarketData();
    }, [publicClient]);

    // --- AUTO REFRESH (Every 15 Seconds) ---
    useEffect(() => {
        const interval = setInterval(() => {
            if (publicClient && !loading) {
                // Silent refresh
                fetchMarketData(); 
            }
        }, 15000); // 15 seconds
        return () => clearInterval(interval);
    }, [publicClient, loading]);


    // --- 3. FILTERING ---
    const filteredData = useMemo(() => {
        let data = [...allAssets];
        const adminAddr = address ? address.toLowerCase() : '';
        const fullInternalTeam = [...internalWallets, adminAddr];

        // View Mode Filter (Strict Separation)
        if (viewMode === 'internal') {
            data = data.filter(item => fullInternalTeam.includes(item.owner));
        } else {
            data = data.filter(item => !fullInternalTeam.includes(item.owner));
        }

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(item => item.id.includes(q) || item.owner.includes(q));
        }

        // Length
        if (lengthFilter !== 'All') {
            const len = parseInt(lengthFilter);
            if (lengthFilter === '4+') data = data.filter(item => item.nameLength >= 4);
            else data = data.filter(item => item.nameLength === len);
        }

        // Sorting
        if (sortMode === 'newest') data.sort((a, b) => Number(b.id) - Number(a.id));
        if (sortMode === 'oldest') data.sort((a, b) => Number(a.id) - Number(b.id));
        if (sortMode === 'price_high') data.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        if (sortMode === 'price_low') data.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));

        return data;
    }, [allAssets, viewMode, searchQuery, lengthFilter, sortMode, internalWallets, address]);

    // Pagination Slicing
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    // Stats
    const stats = useMemo(() => {
        const listed = filteredData.filter(i => i.isListed).length;
        const withOffers = filteredData.filter(i => i.highestOffer > 0).length;
        const total = filteredData.length;
        return { listed, withOffers, total };
    }, [filteredData]);

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
            
            {/* TOP BAR */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ backgroundColor: SURFACE_DARK, border: `1px solid ${BORDER_COLOR}` }}>
                <div className="d-flex align-items-center gap-3">
                    <h2 className="m-0 fw-bold" style={{ color: GOLD_COLOR, fontSize: '20px' }}>
                        <i className="bi bi-radar me-2"></i> MARKET MONITOR
                    </h2>
                    <span className="text-muted small" style={{ fontSize: '11px' }}>
                        <i className="bi bi-arrow-repeat me-1 spinner-grow-sm"></i>
                        Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                </div>
                
                <div className="d-flex gap-2">
                    {/* GLASS BUTTONS */}
                    <button 
                        onClick={() => { setViewMode('internal'); setCurrentPage(1); }}
                        className="btn fw-bold transition-all"
                        style={{ 
                            backgroundColor: viewMode === 'internal' ? '#000' : 'rgba(255, 255, 255, 0.05)',
                            color: viewMode === 'internal' ? GOLD_COLOR : '#888',
                            border: `1px solid ${viewMode === 'internal' ? GOLD_COLOR : 'rgba(255,255,255,0.1)'}`,
                            minWidth: '160px',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        INTERNAL MARKET
                    </button>
                    <button 
                        onClick={() => { setViewMode('external'); setCurrentPage(1); }}
                        className="btn fw-bold transition-all"
                        style={{ 
                            backgroundColor: viewMode === 'external' ? '#000' : 'rgba(255, 255, 255, 0.05)',
                            color: viewMode === 'external' ? GOLD_COLOR : '#888',
                            border: `1px solid ${viewMode === 'external' ? GOLD_COLOR : 'rgba(255,255,255,0.1)'}`,
                            minWidth: '160px',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        EXTERNAL MARKET
                    </button>
                </div>
            </div>

            {/* KPI CARDS (Context Aware) */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}>
                        <div style={{ color: '#888', fontSize: '11px', letterSpacing: '1px' }}>TOTAL ASSETS (IN VIEW)</div>
                        <div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}>
                        <div style={{ color: GOLD_COLOR, fontSize: '11px', letterSpacing: '1px' }}>LISTED FOR SALE</div>
                        <div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{stats.listed}</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}>
                        <div style={{ color: '#0ecb81', fontSize: '11px', letterSpacing: '1px' }}>ACTIVE DEMAND</div>
                        <div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{stats.withOffers}</div>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="d-flex flex-wrap gap-3 mb-4 align-items-center p-3 rounded" style={{ backgroundColor: '#111', border: '1px solid #333' }}>
                <div className="flex-grow-1 position-relative">
                    <i className="bi bi-search position-absolute" style={{ left: '12px', top: '10px', color: '#666' }}></i>
                    <input 
                        type="text" 
                        placeholder="Search ID, Wallet..." 
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="form-control form-control-sm"
                        style={{ backgroundColor: '#000', border: '1px solid #444', color: '#fff', paddingLeft: '35px' }}
                    />
                </div>

                <select className="form-select form-select-sm w-auto" value={sortMode} onChange={(e) => setSortMode(e.target.value)} style={{ backgroundColor: '#000', border: '1px solid #444', color: '#fff' }}>
                    <option value="newest">Newest IDs</option>
                    <option value="oldest">Oldest IDs</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="price_low">Price: Low to High</option>
                </select>

                <select className="form-select form-select-sm w-auto" value={lengthFilter} onChange={(e) => { setLengthFilter(e.target.value); setCurrentPage(1); }} style={{ backgroundColor: '#000', border: '1px solid #444', color: '#fff' }}>
                    <option value="All">Length: All</option>
                    <option value="1">1 Digit</option>
                    <option value="2">2 Digits</option>
                    <option value="3">3 Digits</option>
                    <option value="4+">4+ Digits</option>
                </select>
            </div>

            {/* MAIN TABLE */}
            <div className="table-responsive">
                <table className="table table-dark table-hover mb-0" style={{ fontSize: '13px' }}>
                    <thead>
                        <tr style={{ color: '#888', borderBottom: '1px solid #333' }}>
                            <th className="py-3 ps-3">ASSET</th>
                            <th className="py-3">WALLET / OWNER</th>
                            <th className="py-3">STATUS</th>
                            <th className="py-3">PRICE</th>
                            <th className="py-3">TOP OFFER</th>
                            <th className="py-3 text-end pe-3">ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && allAssets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-5">
                                    <div className="mb-2">SCANNING BLOCKCHAIN... {progress}%</div>
                                    <div className="progress" style={{ height: '2px', maxWidth: '300px', margin: '0 auto', backgroundColor: '#333' }}>
                                        <div className="progress-bar" role="progressbar" style={{ width: `${progress}%`, backgroundColor: GOLD_COLOR }}></div>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-5 text-muted">NO DATA FOUND IN THIS VIEW</td></tr>
                        ) : (
                            paginatedData.map((item) => {
                                const adminAddr = address ? address.toLowerCase() : '';
                                const isInternal = internalWallets.includes(item.owner) || item.owner === adminAddr;

                                return (
                                    <tr key={item.id} style={{ verticalAlign: 'middle' }}>
                                        <td className="ps-3 fw-bold">
                                            <span style={{ color: GOLD_COLOR }}>#{item.id}</span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <span className="text-muted font-monospace me-2">
                                                    {item.owner === adminAddr ? 'YOU (ADMIN)' : `${item.owner.slice(0, 6)}...${item.owner.slice(-4)}`}
                                                </span>
                                                {isInternal && item.owner !== adminAddr &&
                                                    <span className="badge bg-warning text-dark" style={{ fontSize: '9px', padding: '4px 6px' }}>BOT</span>
                                                }
                                                {!isInternal && item.owner !== 'burned' &&
                                                    <span className="badge bg-dark border border-secondary text-secondary" style={{ fontSize: '9px', padding: '4px 6px' }}>USER</span>
                                                }
                                            </div>
                                        </td>
                                        <td>
                                            {item.isListed ? 
                                                <span className="badge bg-success" style={{ fontWeight: '500' }}>LISTED</span> : 
                                                <span className="badge bg-secondary" style={{ fontWeight: '500', opacity: 0.5 }}>HELD</span>
                                            }
                                        </td>
                                        <td className="font-monospace">
                                            {item.isListed ? <span className="text-white">{item.price} POL</span> : <span className="text-muted">--</span>}
                                        </td>
                                        <td className="font-monospace">
                                            {item.highestOffer > 0 ? <span style={{ color: '#0ecb81' }}>{item.highestOffer} POL</span> : <span className="text-muted">--</span>}
                                        </td>
                                        <td className="text-end pe-3">
                                            <Link href={`/asset/${item.id}`} target="_blank">
                                                <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '10px', padding: '4px 10px' }}>
                                                    VIEW <i className="bi bi-box-arrow-up-right ms-1"></i>
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION CONTROLS */}
            {!loading && filteredData.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-secondary border-opacity-25">
                    <div className="text-muted small">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} entries
                    </div>
                    <div className="d-flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="btn btn-sm btn-outline-secondary"
                            style={{ fontSize: '12px' }}
                        >
                            <i className="bi bi-chevron-left me-1"></i> Previous
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="btn btn-sm btn-outline-secondary"
                            style={{ fontSize: '12px' }}
                        >
                            Next <i className="bi bi-chevron-right ms-1"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
