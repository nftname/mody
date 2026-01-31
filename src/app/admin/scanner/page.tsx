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
    "function totalSupply() view returns (uint256)", // المصدر الحقيقي للعدد الكلي
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)"
]);

// --- STYLES ---
const GOLD_COLOR = '#FCD535';
const SURFACE_DARK = '#1E1E1E';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.1)';

export default function AdminScannerPage() {
    const { address } = useAccount(); // محفظة الأدمن المتصلة
    const publicClient = usePublicClient();
    
    // --- States ---
    const [viewMode, setViewMode] = useState<'internal' | 'external'>('internal');
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0); // شريط تقدم التحميل
    const [allAssets, setAllAssets] = useState<any[]>([]);
    const [internalWallets, setInternalWallets] = useState<string[]>([]); 
    
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
                    // نوحد كل الحروف لتكون lowercase للمقارنة الدقيقة
                    const bots = data.wallets.map((w: string) => w.toLowerCase());
                    setInternalWallets(bots);
                }
            } catch (e) { console.error("Bridge Error:", e); }
        };
        fetchWallets();
    }, []);

    // --- 2. THE ENGINE: Fetch Real Blockchain Data ---
    useEffect(() => {
        const fetchMarketData = async () => {
            if (!publicClient) return;
            setLoading(true);
            setProgress(10);
            
            try {
                // A. جلب عدد الأصول الكلي الحقيقي من العقد (مثلاً 224)
                const totalSupplyBig = await publicClient.readContract({
                    address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                    abi: REGISTRY_ABI,
                    functionName: 'totalSupply'
                });
                const totalCount = Number(totalSupplyBig);
                console.log(`🔍 Scanner Found: ${totalCount} Total Assets on Chain.`);
                setProgress(30);

                // B. جلب جميع المعروض للبيع دفعة واحدة
                const [listedIds, listedPrices, sellers] = await publicClient.readContract({
                    address: MARKETPLACE_ADDRESS as `0x${string}`,
                    abi: MARKET_ABI,
                    functionName: 'getAllListings'
                });

                // خريطة سريعة للبحث في المعروض
                const listingsMap = new Map();
                listedIds.forEach((id, i) => {
                    listingsMap.set(id.toString(), {
                        price: formatEther(listedPrices[i]),
                        seller: sellers[i].toLowerCase()
                    });
                });
                setProgress(50);

                // C. جلب أعلى العروض من قاعدة البيانات
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
                setProgress(60);

                // D. (Critical Step) بناء القائمة الكاملة
                // سنقوم بجلب الملاك لكل الأصول. هذا قد يكون ثقيلاً قليلاً لكنه ضروري للدقة.
                // لتسريع العملية، سنستخدم Promise.all على دفعات (Batches)
                
                const allIds = Array.from({ length: totalCount }, (_, i) => i); // [0, 1, 2, ... 223]
                const batchSize = 50; // نعالج 50 أصل في المرة الواحدة
                let processedAssets: any[] = [];

                for (let i = 0; i < allIds.length; i += batchSize) {
                    const batch = allIds.slice(i, i + batchSize);
                    
                    const batchResults = await Promise.all(batch.map(async (tokenId) => {
                        const tid = tokenId.toString();
                        const listing = listingsMap.get(tid);
                        const highestOffer = offersMap.get(tid);
                        
                        // تحديد المالك:
                        // 1. إذا كان معروضاً للبيع، المالك هو البائع (Seller)
                        // 2. إذا لم يكن، نسأل البلوكشين مباشرة (ownerOf)
                        let currentOwner = listing ? listing.seller : '';
                        
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
                            name: `Asset #${tid}`, 
                            owner: currentOwner,
                            isListed: !!listing,
                            price: listing ? listing.price : null,
                            highestOffer: highestOffer || 0,
                            nameLength: tid.length 
                        };
                    }));
                    
                    processedAssets = [...processedAssets, ...batchResults];
                    // تحديث شريط التقدم
                    const currentProgress = 60 + Math.floor((i / totalCount) * 40);
                    setProgress(currentProgress);
                }

                setAllAssets(processedAssets);
                setProgress(100);

            } catch (e) {
                console.error("Scanner Full Error:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();
    }, [publicClient]); // يعمل مرة واحدة عند فتح الصفحة

    // --- 3. FILTERING LOGIC (The Brain) ---
    const filteredData = useMemo(() => {
        let data = [...allAssets];
        const adminAddr = address ? address.toLowerCase() : '';

        // تعريف الفريق الداخلي: البوتات + الأدمن
        const fullInternalTeam = [...internalWallets, adminAddr];

        // 1. View Mode Logic
        if (viewMode === 'internal') {
            // السوق الداخلي: نعرض فقط ما يملكه الفريق
            data = data.filter(item => fullInternalTeam.includes(item.owner));
        } else {
            // السوق الخارجي: نعرض كل شيء ما عدا الفريق
            data = data.filter(item => !fullInternalTeam.includes(item.owner));
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
        // بما أننا لا نملك تواريخ صك دقيقة من البلوكشين في هذا الوضع السريع، 
        // سنرتب حسب الـ ID (الأحدث هو الرقم الأكبر)
        if (sortMode === 'newest') data.sort((a, b) => Number(b.id) - Number(a.id));
        if (sortMode === 'oldest') data.sort((a, b) => Number(a.id) - Number(b.id));
        if (sortMode === 'price_high') data.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        if (sortMode === 'price_low') data.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));

        return data;
    }, [allAssets, viewMode, searchQuery, lengthFilter, sortMode, internalWallets, address]);

    // --- KPI STATS ---
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
                    <option value="newest">Newest IDs</option>
                    <option value="oldest">Oldest IDs</option>
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
                            <tr>
                                <td colSpan={6} className="text-center py-5">
                                    <div className="mb-2">SCANNING BLOCKCHAIN... {progress}%</div>
                                    <div className="progress" style={{ height: '4px', maxWidth: '300px', margin: '0 auto' }}>
                                        <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-5 text-muted">NO DATA FOUND IN THIS MARKET</td></tr>
                        ) : (
                            filteredData.map((item) => {
                                // التحقق: هل هو داخلي أم لا؟
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
                                                {!isInternal && 
                                                    <span className="badge bg-info text-dark" style={{ fontSize: '9px', padding: '4px 6px' }}>USER</span>
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
        </div>
    );
}
