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
    "function tokenURI(uint256 tokenId) view returns (string)",
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
    const [allAssets, setAllAssets] = useState<any[]>([]);
    const [internalWallets, setInternalWallets] = useState<string[]>([]); // القائمة المؤمنة
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState('newest'); 
    const [lengthFilter, setLengthFilter] = useState('All'); 

    // --- 1. Fetch Wallets from Secure API ---
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await fetch('/api/admin/get-wallets');
                const data = await res.json();
                if (data.wallets) {
                    setInternalWallets(data.wallets);
                    console.log("✅ Secure Bridge: Loaded", data.wallets.length, "wallets.");
                }
            } catch (e) {
                console.error("Bridge Error:", e);
            }
        };
        fetchWallets();
    }, []);

    // --- 2. Data Fetching Engine ---
    useEffect(() => {
        const fetchData = async () => {
            if (!publicClient) return;
            // ننتظر تحميل المحافظ فقط إذا كنا في الوضع الداخلي، لكن لا بأس من التحميل العام
            setLoading(true);
            try {
                // A. Blockchain Listings (Real-time)
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

                // B. Supabase Offers (Real-time)
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

                // C. Fetch Assets History (Minted Items)
                const { data: mintedItems } = await supabase
                    .from('activities')
                    .select('token_id, created_at')
                    .eq('activity_type', 'Mint');

                let processedAssets: any[] = [];
                
                if (mintedItems) {
                    processedAssets = await Promise.all(mintedItems.map(async (item: any) => {
                        const tid = item.token_id.toString();
                        const listing = listingsMap.get(tid);
                        const highestOffer = offersMap.get(tid);
                        
                        let currentOwner = listing ? listing.seller : '';
                        
                        // If not listed, fetch owner from chain (Critical for Internal View)
                        if (!currentOwner) {
                            try {
                                currentOwner = (await publicClient.readContract({
                                    address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                                    abi: REGISTRY_ABI,
                                    functionName: 'ownerOf',
                                    args: [BigInt(tid)]
                                })).toLowerCase();
                            } catch (e) { currentOwner = 'burned'; }
                        }

                        return {
                            id: tid,
                            name: `Asset #${tid}`, // يمكن تطويرها لجلب الاسم الحقيقي
                            owner: currentOwner,
                            isListed: !!listing,
                            price: listing ? listing.price : null,
                            highestOffer: highestOffer || 0,
                            mintDate: item.created_at,
                            nameLength: tid.length // افتراضياً طول الرقم، أو الاسم إذا توفر
                        };
                    }));
                }

                setAllAssets(processedAssets);

            } catch (e) {
                console.error("Scanner Error:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [publicClient]); // Runs once on mount (and client ready)

    // --- FILTERING LOGIC ---
    const filteredData = useMemo(() => {
        let data = [...allAssets];

        // 1. View Mode Filter
        if (viewMode === 'internal') {
            // هنا نستخدم القائمة القادمة من الـ API
            data = data.filter(item => internalWallets.includes(item.owner));
        }

        // 2. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(item => item.id.includes(q) || item.owner.includes(q));
        }

        // 3. Length Filter
        if (lengthFilter !== 'All') {
            const len = parseInt(lengthFilter);
            if (lengthFilter === '4+') data = data.filter(item => item.nameLength >= 4);
            else data = data.filter(item => item.nameLength === len);
        }

        // 4. Sorting
        if (sortMode === 'newest') data.sort((a, b) => new Date(b.mintDate).getTime() - new Date(a.mintDate).getTime());
        if (sortMode === 'oldest') data.sort((a, b) => new Date(a.mintDate).getTime() - new Date(b.mintDate).getTime());
        if (sortMode === 'price_high') data.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        if (sortMode === 'price_low') data.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));

        return data;
    }, [allAssets, viewMode, searchQuery, lengthFilter, sortMode, internalWallets]);

    // --- KPI STATS ---
    const stats = useMemo(() => {
        const listed = filteredData.filter(i => i.isListed).length;
        const withOffers = filteredData.filter(i => i.highestOffer > 0).length;
        const total = filteredData.length;
        return { listed, withOffers, total };
    }, [filteredData]);

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
            
            {/* HEADER & CONTROLS */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ backgroundColor: SURFACE_DARK, border: `1px solid ${BORDER_COLOR}` }}>
                <h2 className="m-0 fw-bold" style={{ color: GOLD_COLOR, fontSize: '20px' }}>
                    <i className="bi bi-radar me-2"></i> MARKET MONITOR
                </h2>
                
                <div className="d-flex gap-2">
                    <button 
                        onClick={() => setViewMode('internal')}
                        className={`btn btn-sm fw-bold ${viewMode === 'internal' ? 'active' : ''}`}
                        style={{ 
                            backgroundColor: viewMode === 'internal' ? GOLD_COLOR : 'transparent',
                            color: viewMode === 'internal' ? '#000' : '#888',
                            border: `1px solid ${GOLD_COLOR}`,
                            minWidth: '140px'
                        }}
                    >
                        INTERNAL MARKET
                    </button>
                    <button 
                        onClick={() => setViewMode('external')}
                        className={`btn btn-sm fw-bold ${viewMode === 'external' ? 'active' : ''}`}
                        style={{ 
                            backgroundColor: viewMode === 'external' ? GOLD_COLOR : 'transparent',
                            color: viewMode === 'external' ? '#000' : '#888',
                            border: `1px solid ${GOLD_COLOR}`,
                            minWidth: '140px'
                        }}
                    >
                        EXTERNAL MARKET
                    </button>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}>
                        <div style={{ color: '#888', fontSize: '11px', letterSpacing: '1px' }}>TOTAL ASSETS</div>
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-control form-control-sm"
                        style={{ backgroundColor: '#000', border: '1px solid #444', color: '#fff', paddingLeft: '35px' }}
                    />
                </div>

                <select className="form-select form-select-sm w-auto" value={sortMode} onChange={(e) => setSortMode(e.target.value)} style={{ backgroundColor: '#000', border: '1px solid #444', color: '#fff' }}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="price_low">Price: Low to High</option>
                </select>

                <select className="form-select form-select-sm w-auto" value={lengthFilter} onChange={(e) => setLengthFilter(e.target.value)} style={{ backgroundColor: '#000', border: '1px solid #444', color: '#fff' }}>
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
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-5"><span className="spinner-border spinner-border-sm text-warning me-2"></span> SCANNING...</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-5 text-muted">NO DATA FOUND</td></tr>
                        ) : (
                            filteredData.map((item) => (
                                <tr key={item.id} style={{ verticalAlign: 'middle' }}>
                                    <td className="ps-3 fw-bold">
                                        <span style={{ color: GOLD_COLOR }}>#{item.id}</span>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <span className="text-muted font-monospace me-2">{item.owner.slice(0, 6)}...{item.owner.slice(-4)}</span>
                                            {internalWallets.includes(item.owner) && 
                                                <span className="badge bg-warning text-dark" style={{ fontSize: '9px', padding: '4px 6px' }}>INTERNAL</span>
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
