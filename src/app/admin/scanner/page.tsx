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

export default function AdminScannerPage() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    
    // --- States ---
    const [viewMode, setViewMode] = useState<'internal' | 'external'>('internal');
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    
    const [allAssets, setAllAssets] = useState<any[]>([]);
    const [internalWallets, setInternalWallets] = useState<string[]>([]);
    
    // Pagination
    const ITEMS_PER_PAGE = 20;
    const [currentPage, setCurrentPage] = useState(1);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState('newest'); 
    const [lengthFilter, setLengthFilter] = useState('All'); 

    // --- 1. Load Bots ---
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await fetch('/api/admin/get-wallets');
                const data = await res.json();
                if (data.wallets) {
                    const bots = data.wallets.map((w: string) => w.toLowerCase().trim());
                    setInternalWallets(bots);
                }
            } catch (e) { console.error("API Error", e); }
        };
        fetchWallets();
    }, []);

    // --- 2. DATA ENGINE ---
    const fetchMarketData = async () => {
        if (!publicClient) return;
        // Only show full loading on first mount
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

            // D. Build Asset List
            const allIds = Array.from({ length: totalCount }, (_, i) => i);
            const batchSize = 50; 
            let processedAssets: any[] = [];
            
            for (let i = 0; i < allIds.length; i += batchSize) {
                const batch = allIds.slice(i, i + batchSize);
                
                const batchResults = await Promise.all(batch.map(async (tokenId) => {
                    const tid = tokenId.toString();
                    const listing = listingsMap.get(tid);
                    const highestOffer = offersMap.get(tid);
                    
                    let currentOwner = listing ? listing.seller : '';
                    
                    // Only fetch owner if needed (optimization)
                    if (!currentOwner) {
                        try {
                            const ownerRaw = await publicClient.readContract({
                                address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                                abi: REGISTRY_ABI,
                                functionName: 'ownerOf',
                                args: [BigInt(tid)]
                            });
                            currentOwner = ownerRaw.toLowerCase();
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
                if (allAssets.length === 0) setProgress(Math.floor((i / totalCount) * 100));
            }

            setAllAssets(processedAssets);

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

    // Auto Refresh (Silent Update every 15s)
    useEffect(() => {
        const interval = setInterval(() => {
            if (publicClient && !loading) fetchMarketData(); 
        }, 15000);
        return () => clearInterval(interval);
    }, [publicClient, loading]);

    // --- 3. FILTERING LOGIC ---
    const filteredData = useMemo(() => {
        let data = [...allAssets];
        const adminAddr = address ? address.toLowerCase().trim() : '';
        const fullInternalTeam = [...internalWallets, adminAddr];

        // 1. Market Separation
        if (viewMode === 'internal') {
            data = data.filter(item => fullInternalTeam.includes(item.owner));
        } else {
            data = data.filter(item => !fullInternalTeam.includes(item.owner));
        }

        // 2. Hide Dormant Assets (Show ONLY Listed or Has Offer)
        // This cleans up the table as requested
        data = data.filter(item => item.isListed || item.highestOffer > 0);

        // 3. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(item => item.id.includes(q) || item.owner.includes(q));
        }

        // 4. Length Filter
        if (lengthFilter !== 'All') {
            const len = parseInt(lengthFilter);
            if (lengthFilter === '4+') data = data.filter(item => item.nameLength >= 4);
            else data = data.filter(item => item.nameLength === len);
        }

        // 5. Sorting
        if (sortMode === 'newest') data.sort((a, b) => Number(b.id) - Number(a.id));
        if (sortMode === 'oldest') data.sort((a, b) => Number(a.id) - Number(b.id));
        if (sortMode === 'price_high') data.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        if (sortMode === 'price_low') data.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));

        return data;
    }, [allAssets, viewMode, searchQuery, lengthFilter, sortMode, internalWallets, address]);

    // Pagination
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    // KPI Stats (Based on FILTERED view)
    const stats = useMemo(() => {
        const listed = filteredData.filter(i => i.isListed).length;
        const withOffers = filteredData.filter(i => i.highestOffer > 0).length;
        const totalInView = filteredData.length; // Active assets only
        return { listed, withOffers, totalInView };
    }, [filteredData]);

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
            
            {/* TOP BAR */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="d-flex align-items-center gap-3">
                    <h2 className="m-0 fw-bold" style={{ color: '#FCD535', fontSize: '20px' }}>
                        <i className="bi bi-radar me-2"></i> MARKET MONITOR
                    </h2>
                    {loading && <span className="spinner-border spinner-border-sm text-warning"></span>}
                </div>
                
                <div className="d-flex gap-2">
                    <button 
                        onClick={() => { setViewMode('internal'); setCurrentPage(1); }}
                        className="btn fw-bold"
                        style={{ 
                            backgroundColor: viewMode === 'internal' ? '#FCD535' : 'transparent',
                            color: viewMode === 'internal' ? '#000' : '#888',
                            border: '1px solid #FCD535',
                            minWidth: '150px'
                        }}
                    >
                        INTERNAL (BOTS)
                    </button>
                    <button 
                        onClick={() => { setViewMode('external'); setCurrentPage(1); }}
                        className="btn fw-bold"
                        style={{ 
                            backgroundColor: viewMode === 'external' ? '#FCD535' : 'transparent',
                            color: viewMode === 'external' ? '#000' : '#888',
                            border: '1px solid #FCD535',
                            minWidth: '150px'
                        }}
                    >
                        EXTERNAL (USERS)
                    </button>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}>
                        <div style={{ color: '#888', fontSize: '11px' }}>ACTIVE ASSETS</div>
                        <div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{stats.totalInView}</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}>
                        <div style={{ color: '#FCD535', fontSize: '11px' }}>LISTED</div>
                        <div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{stats.listed}</div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}>
                        <div style={{ color: '#0ecb81', fontSize: '11px' }}>DEMAND</div>
                        <div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{stats.withOffers}</div>
                    </div>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="d-flex flex-wrap gap-3 mb-4 align-items-center p-3 rounded" style={{ backgroundColor: '#111', border: '1px solid #333' }}>
                <input 
                    type="text" 
                    placeholder="Search ID..." 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="form-control form-control-sm"
                    style={{ backgroundColor: '#000', border: '1px solid #444', color: '#fff', maxWidth: '300px' }}
                />
                
                <select className="form-select form-select-sm w-auto bg-black text-white border-secondary" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="price_high">Price High</option>
                    <option value="price_low">Price Low</option>
                </select>

                <select className="form-select form-select-sm w-auto bg-black text-white border-secondary" value={lengthFilter} onChange={(e) => { setLengthFilter(e.target.value); setCurrentPage(1); }}>
                    <option value="All">Length: All</option>
                    <option value="1">1 Digit</option>
                    <option value="2">2 Digits</option>
                    <option value="3">3 Digits</option>
                    <option value="4+">4+</option>
                </select>
            </div>

            {/* MAIN TABLE */}
            <div className="table-responsive">
                <table className="table table-dark table-hover mb-0" style={{ fontSize: '13px' }}>
                    <thead>
                        <tr style={{ color: '#888', borderBottom: '1px solid #333' }}>
                            <th className="py-3 ps-3">ASSET</th>
                            <th className="py-3">OWNER</th>
                            <th className="py-3">STATUS</th>
                            <th className="py-3">PRICE</th>
                            <th className="py-3">TOP OFFER</th>
                            <th className="py-3 text-end pe-3">ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && allAssets.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-5 text-warning">SCANNING MARKET... {progress}%</td></tr>
                        ) : paginatedData.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-5 text-muted">NO ACTIVE ASSETS FOUND</td></tr>
                        ) : (
                            paginatedData.map((item) => {
                                const adminAddr = address ? address.toLowerCase().trim() : '';
                                const isBot = internalWallets.includes(item.owner);
                                const isAdmin = item.owner === adminAddr;

                                return (
                                    <tr key={item.id}>
                                        <td className="ps-3 fw-bold text-white">#{item.id}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <span className="text-muted font-monospace me-2">
                                                    {isAdmin ? 'YOU' : `${item.owner.slice(0, 4)}...${item.owner.slice(-4)}`}
                                                </span>
                                                {isBot && <span className="badge bg-warning text-dark" style={{fontSize: '9px'}}>BOT</span>}
                                                {!isBot && !isAdmin && <span className="badge bg-secondary" style={{fontSize: '9px'}}>USER</span>}
                                            </div>
                                        </td>
                                        <td>{item.isListed ? <span className="text-success">LISTED</span> : <span className="text-muted">HELD</span>}</td>
                                        <td>{item.isListed ? `${item.price} POL` : '--'}</td>
                                        <td>{item.highestOffer > 0 ? `${item.highestOffer} POL` : '--'}</td>
                                        <td className="text-end pe-3">
                                            <Link href={`/asset/${item.id}`} target="_blank">
                                                <button className="btn btn-sm btn-outline-light" style={{ fontSize: '10px' }}>VIEW</button>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {!loading && filteredData.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-secondary">
                    <div className="text-muted small">Page {currentPage} of {totalPages}</div>
                    <div className="d-flex gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-sm btn-outline-secondary">Previous</button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn btn-sm btn-outline-secondary">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}
