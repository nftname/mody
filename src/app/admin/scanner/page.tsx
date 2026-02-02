'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAccount, usePublicClient } from "wagmi";
import { parseAbi, formatEther, erc721Abi } from 'viem';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase';

// --- Helper Functions ---
const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
};

// مكون سهم الترتيب
const SortIcon = ({ active, direction }: { active: boolean, direction: string }) => (
    <span className="d-flex flex-column ms-1" style={{ fontSize: '8px', lineHeight: '6px' }}>
        <i className={`bi bi-caret-up-fill ${active && direction === 'asc' ? 'text-warning' : 'text-secondary'}`} style={{ opacity: active && direction === 'asc' ? 1 : 0.3 }}></i>
        <i className={`bi bi-caret-down-fill ${active && direction === 'desc' ? 'text-warning' : 'text-secondary'}`} style={{ opacity: active && direction === 'desc' ? 1 : 0.3 }}></i>
    </span>
);

// --- HARDCODED WALLETS ---
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
    
    // States
    const [viewMode, setViewMode] = useState<'internal' | 'external'>('internal');
    const [loading, setLoading] = useState(true);
    const [allAssets, setAllAssets] = useState<any[]>([]);
    const [internalWallets, setInternalWallets] = useState<string[]>(BOT_WALLETS);
    
    // Filters & Pagination
    const ITEMS_PER_PAGE = 20;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    
    // --- NEW FILTER & SORT LOGIC ---
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'listed' | 'offers'
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [lengthFilter, setLengthFilter] = useState('All'); 

    // Sync API (Backup)
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await fetch('/api/admin/get-wallets');
                const data = await res.json();
                if (data.wallets && data.wallets.length > 0) {
                    const combined = [...new Set([...BOT_WALLETS, ...data.wallets.map((w: string) => w.toLowerCase().trim())])];
                    setInternalWallets(combined);
                }
            } catch (e) { }
        };
        fetchWallets();
    }, []);

    const fetchMarketData = async () => {
        if (!publicClient) return;
        if (allAssets.length === 0) setLoading(true); 
        
        try {
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

            const { data: offers } = await supabase.from('offers').select('token_id, price').eq('status', 'active');
            const offersMap = new Map();
            if (offers) offers.forEach((o: any) => {
                const tid = o.token_id.toString();
                if (!offersMap.has(tid) || o.price > offersMap.get(tid)) offersMap.set(tid, o.price);
            });

            const allIds = Array.from({ length: totalCount }, (_, i) => i);
            const batchSize = 50; 
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

                    let realName = `Asset #${tid}`;
                    try {
                        const uri = await publicClient.readContract({ 
                            address: NFT_COLLECTION_ADDRESS as `0x${string}`, 
                            abi: erc721Abi, 
                            functionName: 'tokenURI', 
                            args: [BigInt(tid)] 
                        });
                        const metaRes = await fetch(resolveIPFS(uri));
                        const meta = metaRes.ok ? await metaRes.json() : {};
                        if (meta.name) realName = meta.name;
                    } catch (err) { }

                    return {
                        id: tid,
                        name: realName,
                        owner: currentOwner,
                        seller: sellerAddress,
                        isListed: !!listing,
                        price: listing ? parseFloat(listing.price) : 0,
                        highestOffer: highestOffer ? parseFloat(highestOffer) : 0,
                        nameLength: realName.includes('Asset #') ? 0 : realName.length 
                    };
                }));
                processedAssets = [...processedAssets, ...batchResults];
            }
            setAllAssets(processedAssets);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { if (publicClient) fetchMarketData(); }, [publicClient]);
    useEffect(() => {
        const interval = setInterval(() => { if (publicClient && !loading) fetchMarketData(); }, 30000);
        return () => clearInterval(interval);
    }, [publicClient, loading]);

    // --- SORT HANDLER ---
    const handleSort = (key: string) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    // --- FILTER & SORT LOGIC ---
    const filteredData = useMemo(() => {
        let data = [...allAssets];
        const fullInternalTeam = [...internalWallets];

        // 1. Internal/External Split
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

        // 2. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(item => item.name.toLowerCase().includes(q) || item.id.includes(q));
        }

        // 3. Status Filter (The Fix for Hidden Assets)
        if (filterStatus === 'listed') {
            data = data.filter(item => item.isListed);
        } else if (filterStatus === 'offers') {
            data = data.filter(item => item.highestOffer > 0);
        }
        // If filterStatus === 'all', we do nothing! We show everything (Held, Listed, Offers).

        // 4. Length Filter
        if (lengthFilter !== 'All') {
            const len = parseInt(lengthFilter);
            if (lengthFilter === '4+') data = data.filter(item => item.nameLength >= 4);
            else data = data.filter(item => item.nameLength === len);
        }
        
        // 5. Sorting
        data.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            
            // Handle string sorting (Name)
            if (sortConfig.key === 'name') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    }, [allAssets, viewMode, searchQuery, lengthFilter, filterStatus, sortConfig, internalWallets]);

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
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="d-flex align-items-center gap-3">
                    <h2 className="m-0 fw-bold" style={{ color: '#FCD535', fontSize: '20px' }}>
                        <i className="bi bi-radar me-2"></i> MARKET MONITOR - CORRECT LOGIC
                    </h2>
                    {loading && <span className="spinner-border spinner-border-sm text-warning"></span>}
                </div>
                <div className="d-flex gap-2">
                    <button onClick={() => { setViewMode('internal'); setCurrentPage(1); }} className="btn fw-bold" style={{ backgroundColor: viewMode === 'internal' ? '#FCD535' : 'transparent', color: viewMode === 'internal' ? '#000' : '#888', border: '1px solid #FCD535', minWidth: '150px' }}>INTERNAL MARKET</button>
                    <button onClick={() => { setViewMode('external'); setCurrentPage(1); }} className="btn fw-bold" style={{ backgroundColor: viewMode === 'external' ? '#FCD535' : 'transparent', color: viewMode === 'external' ? '#000' : '#888', border: '1px solid #FCD535', minWidth: '150px' }}>EXTERNAL MARKET</button>
                </div>
            </div>

            {/* Stats */}
            <div className="row g-3 mb-4">
                <div className="col-md-4"><div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}><div style={{ color: '#888', fontSize: '11px' }}>TOTAL ASSETS</div><div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{stats.totalInView}</div></div></div>
                <div className="col-md-4"><div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}><div style={{ color: '#FCD535', fontSize: '11px' }}>LISTED</div><div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{stats.listed}</div></div></div>
                <div className="col-md-4"><div className="p-3 rounded text-center" style={{ backgroundColor: '#111', border: '1px solid #333' }}><div style={{ color: '#0ecb81', fontSize: '11px' }}>DEMAND</div><div style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold' }}>{stats.withOffers}</div></div></div>
            </div>

            {/* Filters */}
            <div className="d-flex flex-wrap gap-3 mb-4 align-items-center p-3 rounded" style={{ backgroundColor: '#111', border: '1px solid #333' }}>
                <input type="text" placeholder="Search Name..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="form-control form-control-sm" style={{ backgroundColor: '#000', border: '1px solid #444', color: '#fff', maxWidth: '300px' }} />
                
                {/* NEW FILTER DROPDOWN */}
                <select className="form-select form-select-sm w-auto bg-black text-white border-secondary" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">Status: All Assets</option>
                    <option value="listed">Status: Listed Only</option>
                    <option value="offers">Status: With Offers</option>
                </select>

                <select className="form-select form-select-sm w-auto bg-black text-white border-secondary" value={lengthFilter} onChange={(e) => { setLengthFilter(e.target.value); setCurrentPage(1); }}><option value="All">Length: All</option><option value="1">1 Digit</option><option value="2">2 Digits</option><option value="3">3 Digits</option><option value="4+">4+</option></select>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table className="table table-dark table-hover mb-0" style={{ fontSize: '13px' }}>
                    <thead>
                        <tr style={{ color: '#888', borderBottom: '1px solid #333' }}>
                            <th className="py-3 ps-3 cursor-pointer" onClick={() => handleSort('name')}>
                                <div className="d-flex align-items-center">NAME <SortIcon active={sortConfig.key === 'name'} direction={sortConfig.direction} /></div>
                            </th>
                            <th className="py-3">WALLET</th>
                            <th className="py-3">STATUS</th>
                            <th className="py-3 cursor-pointer" onClick={() => handleSort('price')}>
                                <div className="d-flex align-items-center">PRICE <SortIcon active={sortConfig.key === 'price'} direction={sortConfig.direction} /></div>
                            </th>
                            <th className="py-3 cursor-pointer" onClick={() => handleSort('highestOffer')}>
                                <div className="d-flex align-items-center">TOP OFFER <SortIcon active={sortConfig.key === 'highestOffer'} direction={sortConfig.direction} /></div>
                            </th>
                            <th className="py-3 text-end pe-3">ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && allAssets.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-5 text-warning">SCANNING MARKET...</td></tr>
                        ) : paginatedData.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-5 text-muted">NO ASSETS FOUND</td></tr>
                        ) : (
                            paginatedData.map((item) => {
                                const adminAddr = address ? address.toLowerCase().trim() : '';
                                const isBot = internalWallets.includes(item.owner) || internalWallets.includes(item.seller);
                                const isAdmin = item.owner === adminAddr || item.seller === adminAddr;
                                const isInternal = isBot || isAdmin;

                                return (
                                    <tr key={item.id}>
                                        <td className="ps-3 fw-bold text-white">
                                            {item.name} 
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
                                            {item.isListed ? <span className="text-success fw-bold">LISTED</span> : <span style={{ color: '#666' }}>HELD</span>}
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

