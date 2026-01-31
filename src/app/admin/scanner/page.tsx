'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAccount, usePublicClient } from "wagmi";
import { parseAbi, formatEther } from 'viem';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase';

// --- القائمة الذهبية: الأدمن + 30 بوت ---
const BOT_WALLETS = [
    "0xfa148Ea96986E89c7bEEe67D3b8F72B3719aAb7e",
    "0xf3e2544af3e7ba1687d852e80e7cb6c850b797b6",
    "0x02f75874846d09c89f55cae371c5a8d6d3afd9ac",
    "0x266e228c9d9b540caa2e6994ce7c61e58b05d36b",
    "0x21edfa31678bb6ea6059133cf1052e1c554eb296",
    "0xa7801681fcd85499e20c619e9bd841e12e064247",
    "0x48b2a4e0a13b7594216704875ea318a47e4ffacc",
    "0x0184bf26e9c3bd07230928eb2e281a3dbc1e8e19",
    "0x654f845afcddfa89d73e212b9a813b5f8aa90c7b",
    "0xc2a893d3a7054638038cb013a14021c32ec3a70c",
    "0xaebd218990de3f179954cd8a6ee1c33c8b039f20",
    "0xec02f481c46b4fcbefdeab70abd7a7d4b2a07a33",
    "0xc45023ebeeff0772c5fc55aded198ff1ce58074e",
    "0x5503be70fd97d1bdb3b7110f14e9c997b365ecaf",
    "0xc958c34ac43fef119f20326b4e9e15fcab3d3268",
    "0x229ad709c5b103097007f744aed0343985e01769",
    "0x9d8adcef02c563731f816eca00fe8ba860436065",
    "0xead5b437a71e18697e233e7eaff2509221939b01",
    "0x1a926dd0d6cfa9e997f3ab52a04813cd6b9f9661",
    "0xe2487da5067546a08867f38470ac23a17b5441dd",
    "0xdc2e1f271425817d1d1843ad68b413630f9dfcf3",
    "0x21bd964ecf04aba35650172123bd42953b067a0c",
    "0x8b6ce7465ecf52402206896f81a3504bd489e3bd",
    "0xa65d4789429a52ae56b2e61efc9cd1e51278484b",
    "0x78a39e9fea8d115d407a16c38d44276c104643c6",
    "0xb73a60f55b43cc053fe080f8811159e525c5bf46",
    "0x484dde32afba0497f01980f316f85bdfc004e57b",
    "0xb7f6a0ac4af231b6ea0336931a9496aab96538ba",
    "0x45b586643474abba7abb5faf3ae415f675b8a6e7",
    "0x5c4a53e521cbb712686401bd38779ee30965c228",
    "0x48370e9ec371344ac518be555eea1ed121c3f082"
].map(w => w.toLowerCase().trim());

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
    
    const [viewMode, setViewMode] = useState<'internal' | 'external'>('internal');
    const [loading, setLoading] = useState(true);
    const [allAssets, setAllAssets] = useState<any[]>([]);
    
    // استخدام القائمة الثابتة فوراً
    const [internalWallets, setInternalWallets] = useState<string[]>(BOT_WALLETS);
    
    const ITEMS_PER_PAGE = 20;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState('highest_offer'); 
    const [lengthFilter, setLengthFilter] = useState('All'); 

    // محاولة جلب إضافية (اختياري)
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await fetch('/api/admin/get-wallets');
                const data = await res.json();
                if (data.wallets && data.wallets.length > 0) {
                    const combined = [...new Set([...BOT_WALLETS, ...data.wallets.map((w: string) => w.toLowerCase().trim())])];
                    setInternalWallets(combined);
                }
            } catch (e) { /* Silent Fail */ }
        };
        fetchWallets();
    }, []);

    const fetchMarketData = async () => {
        if (!publicClient) return;
        if (allAssets.length === 0) setLoading(true); 
        
        try {
            // 1. Blockchain Data
            const totalSupplyBig = await publicClient.readContract({
                address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                abi: REGISTRY_ABI,
                functionName: 'totalSupply'
            });
            const totalCount = Number(totalSupplyBig);
            
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

            // 2. Database (Offers)
            const { data: offers } = await supabase.from('offers').select('token_id, price').eq('status', 'active');
            const offersMap = new Map();
            if (offers) offers.forEach((o: any) => {
                const tid = o.token_id.toString();
                if (!offersMap.has(tid) || o.price > offersMap.get(tid)) offersMap.set(tid, o.price);
            });

            // 3. Database (NAMES - البحث الشامل المحسّن)
            const namesMap = new Map();
            
            // محاولة 1: جدول assets
            const { data: assetsTable } = await supabase
                .from('assets')
                .select('token_id, name')
                .not('name', 'is', null);
            
            if (assetsTable && assetsTable.length > 0) {
                assetsTable.forEach((a: any) => {
                    if (a.name && a.name.trim() !== '') {
                        namesMap.set(a.token_id.toString(), a.name.trim());
                    }
                });
            }

            // محاولة 2: جدول activities للأسماء المفقودة
            const { data: activitiesTable } = await supabase
                .from('activities')
                .select('token_id, token_name')
                .not('token_name', 'is', null);
                
            if (activitiesTable && activitiesTable.length > 0) {
                activitiesTable.forEach((n: any) => {
                    const tid = n.token_id.toString();
                    if (!namesMap.has(tid) && n.token_name && n.token_name.trim() !== '') {
                        namesMap.set(tid, n.token_name.trim());
                    }
                });
            }

            // محاولة 3: جدول nft_metadata (إذا كان موجوداً)
            const { data: metadataTable } = await supabase
                .from('nft_metadata')
                .select('token_id, name')
                .not('name', 'is', null);
                
            if (metadataTable && metadataTable.length > 0) {
                metadataTable.forEach((m: any) => {
                    const tid = m.token_id.toString();
                    if (!namesMap.has(tid) && m.name && m.name.trim() !== '') {
                        namesMap.set(tid, m.name.trim());
                    }
                });
            }

            console.log(`✅ تم تحميل ${namesMap.size} اسم من قاعدة البيانات`);

            // 4. Build List
            const allIds = Array.from({ length: totalCount }, (_, i) => i);
            const batchSize = 100; 
            let processedAssets: any[] = [];
            
            for (let i = 0; i < allIds.length; i += batchSize) {
                const batch = allIds.slice(i, i + batchSize);
                const batchResults = await Promise.all(batch.map(async (tokenId) => {
                    const tid = tokenId.toString();
                    const listing = listingsMap.get(tid);
                    const highestOffer = offersMap.get(tid);
                    
                    let currentOwner = '';
                    let sellerAddress = '';

                    if (listing) {
                        sellerAddress = listing.seller;
                        currentOwner = listing.seller; 
                    } else {
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

                    // الحصول على الاسم الحقيقي من قاعدة البيانات
                    const realName = namesMap.get(tid);
                    
                    return {
                        id: tid,
                        name: realName || null, // نحفظ null إذا لم يكن هناك اسم
                        owner: currentOwner,
                        seller: sellerAddress,
                        isListed: !!listing,
                        price: listing ? listing.price : null,
                        highestOffer: highestOffer || 0,
                        nameLength: realName ? realName.length : 0
                    };
                }));
                processedAssets = [...processedAssets, ...batchResults];
            }
            setAllAssets(processedAssets);
        } catch (e) { 
            console.error('❌ خطأ في جلب البيانات:', e); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { if (publicClient) fetchMarketData(); }, [publicClient]);
    useEffect(() => {
        const interval = setInterval(() => { if (publicClient && !loading) fetchMarketData(); }, 15000);
        return () => clearInterval(interval);
    }, [publicClient, loading]);

    const filteredData = useMemo(() => {
        let data = [...allAssets];
        const fullInternalTeam = [...internalWallets];

        if (viewMode === 'internal') {
            data = data.filter(item => 
                fullInternalTeam.includes(item.owner) || 
                (item.isListed && fullInternalTeam.includes(item.seller))
            );
        } else {
            data = data.filter(item => 
                !fullInternalTeam.includes(item.owner) && 
                !(item.isListed && fullInternalTeam.includes(item.seller))
            );
        }

        data = data.filter(item => item.isListed || item.highestOffer > 0);

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(item => {
                const nameMatch = item.name ? item.name.toLowerCase().includes(q) : false;
                const idMatch = item.id.includes(q);
                return nameMatch || idMatch;
            });
        }
        
        if (lengthFilter !== 'All') {
            const len = parseInt(lengthFilter);
            if (lengthFilter === '4+') data = data.filter(item => item.nameLength >= 4);
            else data = data.filter(item => item.nameLength === len);
        }
        
        if (sortMode === 'highest_offer') data.sort((a, b) => (Number(b.highestOffer) || 0) - (Number(a.highestOffer) || 0));
        else if (sortMode === 'newest') data.sort((a, b) => Number(b.id) - Number(a.id));
        else if (sortMode === 'price_high') data.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        else if (sortMode === 'price_low') data.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));

        return data;
    }, [allAssets, viewMode, searchQuery, lengthFilter, sortMode, internalWallets]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    const stats = useMemo(() => {
        const listed = filteredData.filter(i => i.isListed).length;
        const withOffers = filteredData.filter(i => i.highestOffer > 0).length;
        const totalInView = filteredData.length;
        return { listed, withOffers, totalInView };
    }, [filteredData]);

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="d-flex align-items-center gap-3">
                    <h2 className="m-0 fw-bold" style={{ color: '#FCD535', fontSize: '20px' }}>
                        <i className="bi bi-radar me-2"></i> MARKET MONITOR - PRO LIVE
                    </h2>
                    {loading && <span className="spinner-border spinner-border-sm text-warning"></span>}
                </div>
                <div className="d-flex gap-2">
                    <button onClick={() => { setViewMode('internal'); setCurrentPage(1); }} className="btn fw-bold" style={{ backgroundColor: viewMode === 'internal' ? '#FCD535' : 'transparent', color: viewMode === 'internal' ? '#000' : '#888', border: '1px solid #FCD535', minWidth: '150px' }}>INTERNAL MARKET</button>
                    <button onClick={() => { setViewMode('external'); setCurrentPage(1); }} className="btn fw-bold" style={{ backgroundColor: viewMode === 'external' ? '#FCD535' : 'transparent', color: viewMode === 'external' ? '#000' : '#888', border: '1px solid #FCD535', minWidth: '150px' }}>EXTERNAL MARKET</button>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-4"><div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}><div style={{ color: '#888', fontSize: '11px' }}>ACTIVE ASSETS</div><div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{stats.totalInView}</div></div></div>
                <div className="col-md-4"><div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}><div style={{ color: '#FCD535', fontSize: '11px' }}>LISTED</div><div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{stats.listed}</div></div></div>
                <div className="col-md-4"><div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}><div style={{ color: '#0ecb81', fontSize: '11px' }}>DEMAND</div><div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{stats.withOffers}</div></div></div>
            </div>

            <div className="d-flex flex-wrap gap-3 mb-4 align-items-center p-3 rounded" style={{ backgroundColor: '#111', border: '1px solid #333' }}>
                <input type="text" placeholder="Search Name or ID..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="form-control form-control-sm" style={{ backgroundColor: '#000', border: '1px solid #444', color: '#fff', maxWidth: '300px' }} />
                <select className="form-select form-select-sm w-auto bg-black text-white border-secondary" value={sortMode} onChange={(e) => setSortMode(e.target.value)}><option value="highest_offer">Highest Offer</option><option value="newest">Newest</option><option value="price_high">Price High</option><option value="price_low">Price Low</option></select>
                <select className="form-select form-select-sm w-auto bg-black text-white border-secondary" value={lengthFilter} onChange={(e) => { setLengthFilter(e.target.value); setCurrentPage(1); }}><option value="All">Length: All</option><option value="1">1 Digit</option><option value="2">2 Digits</option><option value="3">3 Digits</option><option value="4+">4+</option></select>
            </div>

            <div className="table-responsive">
                <table className="table table-dark table-hover mb-0" style={{ fontSize: '13px' }}>
                    <thead>
                        <tr style={{ color: '#888', borderBottom: '1px solid #333' }}>
                            <th className="py-3 ps-3">NAME</th>
                            <th className="py-3">WALLET</th>
                            <th className="py-3">STATUS</th>
                            <th className="py-3">PRICE</th>
                            <th className="py-3">TOP OFFER</th>
                            <th className="py-3 text-end pe-3">ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && allAssets.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-5 text-warning">SCANNING MARKET...</td></tr>
                        ) : paginatedData.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-5 text-muted">NO ACTIVE ASSETS FOUND</td></tr>
                        ) : (
                            paginatedData.map((item) => {
                                const adminAddr = address ? address.toLowerCase().trim() : '';
                                const isBot = internalWallets.includes(item.owner) || internalWallets.includes(item.seller);
                                const isAdmin = item.owner === adminAddr || item.seller === adminAddr;
                                const isInternal = isBot || isAdmin;

                                return (
                                    <tr key={item.id}>
                                        <td className="ps-3 fw-bold text-white">
                                            {/* عرض الاسم الحقيقي فقط إذا كان موجوداً */}
                                            {item.name ? (
                                                <span style={{ color: '#FCD535', fontSize: '15px' }}>{item.name}</span>
                                            ) : (
                                                <span style={{ color: '#888', fontSize: '13px' }}>Token #{item.id}</span>
                                            )}
                                            {/* رقم التوكن بجانب الاسم بحجم صغير */}
                                            {item.name && (
                                                <span style={{ color: '#555', fontSize: '10px', marginLeft: '8px' }}>#{item.id}</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <span className="font-monospace me-2" style={{ color: '#FCD535' }}>
                                                    {isAdmin ? 'YOU (ADMIN)' : `${item.owner.slice(0, 6)}...${item.owner.slice(-4)}`}
                                                </span>
                                                {isInternal && !isAdmin && <span className="badge bg-warning text-dark" style={{fontSize: '9px'}}>BOT</span>}
                                            </div>
                                        </td>
                                        <td>
                                            {item.isListed ? <span className="text-success fw-bold">LISTED</span> : <span style={{ color: '#ccc' }}>HELD</span>}
                                        </td>
                                        <td>{item.isListed ? `${item.price} POL` : '--'}</td>
                                        <td>{item.highestOffer > 0 ? <span style={{color: '#0ecb81'}}>{item.highestOffer} POL</span> : '--'}</td>
                                        <td className="text-end pe-3">
                                            <Link href={`/asset/${item.id}`} target="_blank"><button className="btn btn-sm btn-outline-light" style={{ fontSize: '10px' }}>VIEW</button></Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            
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