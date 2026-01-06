'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useBalance } from "wagmi";
import { createPublicClient, http, parseAbi, formatEther } from 'viem';
import { polygon } from 'viem/chains';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';

const GOLD_COLOR = '#FCD535';
const GOLD_GRADIENT = 'linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)';

const CONTRACT_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function tokenOfOwnerByIndex(address, uint256) view returns (uint256)",
  "function tokenURI(uint256) view returns (string)"
]);

const MARKETPLACE_ABI = parseAbi([
  "function listings(uint256 tokenId) view returns (address seller, uint256 price, bool exists)"
]);

const publicClient = createPublicClient({
  chain: polygon,
  transport: http()
});

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  
  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [activeSection, setActiveSection] = useState('Items');
  
  const [viewModeState, setViewModeState] = useState(0); 
  const viewModes = ['grid', 'large', 'list'];
  const currentViewMode = viewModes[viewModeState];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL'); 
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // Sorting State for Listings
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  const [isCopied, setIsCopied] = useState(false);

  const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
  };

  const chunk = <T,>(arr: T[], size: number) => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
    return result;
  };

  const fetchAssets = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const balanceBigInt = await publicClient.readContract({
        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [address]
      });
      
      const count = Number(balanceBigInt);

      if (!count) {
        setMyAssets([]);
        setLoading(false);
        return;
      }

      const tokenIds = await Promise.all(
        Array.from({ length: count }, (_, i) => 
            publicClient.readContract({
                address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'tokenOfOwnerByIndex',
                args: [address, BigInt(i)]
            })
        )
      );

      const batches = chunk(tokenIds, 5);
      const loaded: any[] = [];

      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(async (tokenId: any) => {
            try {
              // 1. Fetch Metadata
              const tokenURI = await publicClient.readContract({
                  address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                  abi: CONTRACT_ABI,
                  functionName: 'tokenURI',
                  args: [tokenId]
              });

              const metaRes = await fetch(resolveIPFS(tokenURI));
              const meta = metaRes.ok ? await metaRes.json() : {};

              // 2. Fetch Listing Status
              let isListed = false;
              let listingPrice = '0';
              try {
                  const listingData = await publicClient.readContract({
                      address: MARKETPLACE_ADDRESS as `0x${string}`,
                      abi: MARKETPLACE_ABI,
                      functionName: 'listings',
                      args: [tokenId]
                  });
                  if (listingData[2] === true) {
                      isListed = true;
                      listingPrice = formatEther(listingData[1]);
                  }
              } catch (e) {
                  console.warn(`Failed to check listing for ${tokenId}`, e);
              }
              
              return {
                id: tokenId.toString(),
                name: meta.name || `NNM #${tokenId.toString()}`,
                image: resolveIPFS(meta.image) || '',
                tier: meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founders',
                price: isListed ? listingPrice : (meta.attributes?.find((a: any) => a.trait_type === 'Price')?.value || '0'),
                isListed: isListed
              };
            } catch (error) {
              console.error('Failed to load token metadata', error);
              return null;
            }
          })
        );

        const valid = batchResults.filter(Boolean) as any[];
        loaded.push(...valid);
        setMyAssets([...loaded]); 
      }
    } catch (error) {
      console.error("Dashboard Engine Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isConnected) fetchAssets(); }, [address, isConnected]);

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleViewMode = () => {
    setViewModeState((prev) => (prev + 1) % viewModes.length);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const totalAssetValue = myAssets.reduce((acc, curr) => acc + parseFloat(curr.price || 0), 0);

  const filteredAssets = myAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === 'ALL' ? true : asset.tier.toUpperCase() === selectedTier;
    return matchesSearch && matchesTier;
  });

  const listedAssets = myAssets.filter(asset => asset.isListed);

  // Sorting Logic: Reversing array to simulate LIFO (Last In First Out) for "Newest"
  const sortedListedAssets = sortOrder === 'newest' 
    ? [...listedAssets].reverse() 
    : listedAssets;

  if (!isConnected) {
    return (
        <main style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div className="text-center">
                <h2 className="text-white mb-3">Connect Wallet to View Profile</h2>
                <p className="text-secondary mb-4">Please connect your wallet to see your NNM assets.</p>
            </div>
        </main>
    );
  }

  return (
    <main style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      <div style={{ width: '100%', height: '180px', background: 'linear-gradient(180deg, #2b2b2b 0%, #1E1E1E 100%)', position: 'relative', borderBottom: '1px solid #2d2d2d' }}>
      </div>

      <div className="container mx-auto px-3" style={{ marginTop: '-90px', position: 'relative', zIndex: 10 }}>
        
        <div className="d-flex flex-column gap-3 mb-4">
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid #1E1E1E', background: '#161b22', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                <div style={{ width: '100%', height: '100%', background: GOLD_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: '#1E1E1E' }}>
                    {address ? address.slice(2,4).toUpperCase() : ''}
                </div>
            </div>

            <div className="d-flex align-items-center gap-2">
                <span className="fw-normal" style={{ fontSize: '18px', fontFamily: 'monospace', color: GOLD_COLOR }}>
                    {address ? `${address.slice(0,6)}...${address.slice(-4)}` : ''}
                </span>
                <button onClick={copyToClipboard} className="btn p-0 border-0" style={{ color: '#8a939b' }}>
                    {isCopied ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-copy"></i>}
                </button>
            </div>

            <div className="d-flex gap-5 mt-2 px-2">
                <div className="d-flex flex-column align-items-start">
                    <div style={{ color: '#8a939b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Balance</div>
                    <div className="text-white" style={{ fontSize: '15px', fontWeight: '600' }}>
                         <span style={{ fontSize: '13px', color: '#FFFFFF', marginRight: '4px' }}>POL</span>
                         {balanceData ? parseFloat(balanceData.formatted).toFixed(2) : '0.00'}
                    </div>
                </div>
                <div className="d-flex flex-column align-items-start">
                    <div style={{ color: '#8a939b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Assets</div>
                    <div className="text-white" style={{ fontSize: '15px', fontWeight: '600' }}>{myAssets.length}</div>
                </div>
                <div className="d-flex flex-column align-items-start">
                    <div style={{ color: '#8a939b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total value</div>
                    <div className="text-white" style={{ fontSize: '15px', fontWeight: '600' }}>
                        <span style={{ fontSize: '13px', color: '#FFFFFF', marginRight: '4px' }}>POL</span>
                        {totalAssetValue.toFixed(0)}
                    </div>
                </div>
            </div>
        </div>

        <div className="d-flex gap-4 mb-2 overflow-auto" style={{ borderBottom: 'none' }}>
            {['Items', 'Listings', 'Offers', 'Created', 'Activity'].map((tab) => (
                <button 
                    key={tab} 
                    onClick={() => setActiveSection(tab)} 
                    className="btn px-0 position-relative pb-2"
                    style={{ 
                        color: activeSection === tab ? '#FFFFFF' : '#8a939b', 
                        background: 'transparent', 
                        border: 'none', 
                        fontSize: '15px', 
                        fontWeight: activeSection === tab ? '600' : '500',
                        whiteSpace: 'nowrap',
                        borderRadius: 0
                    }}
                >
                    {tab}
                    {activeSection === tab && (
                        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '3px', backgroundColor: GOLD_COLOR, borderRadius: '2px' }}></div>
                    )}
                </button>
            ))}
        </div>

        {/* LISTINGS SECTION */}
        {activeSection === 'Listings' && (
            <div className="pb-5 mt-4">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-secondary" role="status"></div>
                    </div>
                ) : listedAssets.length === 0 ? (
                    <div className="text-center py-5 text-secondary">No active listings found</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ backgroundColor: 'transparent', color: '#fff', borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead>
                                <tr>
                                    {/* ASSET Header with Sorting */}
                                    <th 
                                        onClick={toggleSortOrder} 
                                        style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '45%', cursor: 'pointer' }}
                                    >
                                        ASSET 
                                        <i className={`bi ${sortOrder === 'newest' ? 'bi-arrow-up' : 'bi-arrow-down'} ms-2`} style={{ fontSize: '11px' }}></i>
                                    </th>
                                    
                                    {/* POL Header - Moved closer to Asset */}
                                    <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '25%' }}>
                                        POL
                                    </th>
                                    
                                    {/* Exp Header */}
                                    <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '20%' }}>
                                        Exp
                                    </th>
                                    
                                    {/* Settings Header - Shifted Inward */}
                                    <th style={{ backgroundColor: 'transparent', borderBottom: '1px solid #2d2d2d', width: '10%', padding: '0 20px 10px 0' }}></th> 
                                </tr>
                            </thead>
                            <tbody>
                                {sortedListedAssets.map((asset) => (
                                    <tr key={asset.id} className="align-middle listing-row">
                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontStyle: 'italic' }}>
                                            {asset.name}
                                        </td>
                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontWeight: '700' }}>
                                            {asset.price}
                                        </td>
                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontSize: '14px' }}>
                                            Active
                                        </td>
                                        {/* Settings Icon - Shifted Inward via Padding */}
                                        <td style={{ backgroundColor: 'transparent', padding: '12px 20px 12px 0', borderBottom: '1px solid #2d2d2d', textAlign: 'right' }}>
                                            <Link href={`/asset/${asset.id}`}>
                                                <i className="bi bi-gear-fill text-white" style={{ cursor: 'pointer', fontSize: '16px' }}></i>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <style jsx>{`
                            .listing-row:hover td {
                                background-color: rgba(255, 255, 255, 0.03) !important;
                            }
                        `}</style>
                    </div>
                )}
            </div>
        )}

        {/* ITEMS SECTION */}
        {activeSection === 'Items' && (
            <>
                <div className="d-flex align-items-center gap-2 mb-4 position-relative">
                    <div className="position-relative">
                        <button 
                            onClick={() => setShowFilterMenu(!showFilterMenu)} 
                            className="btn border border-secondary d-flex align-items-center justify-content-center" 
                            style={{ borderRadius: '8px', borderColor: '#333', width: '32px', height: '32px', padding: '0', backgroundColor: 'transparent' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6H20" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M7 12H17" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M10 18H14" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                        
                        {showFilterMenu && (
                            <div className="position-absolute mt-2 p-2 rounded-3 shadow-lg" style={{ top: '100%', left: 0, width: '180px', backgroundColor: '#1E1E1E', border: '1px solid #333', zIndex: 100 }}>
                                <div style={{ fontSize: '10px', color: '#8a939b', padding: '4px 8px', textTransform: 'uppercase' }}>Filter by Tier</div>
                                {['ALL', 'IMMORTAL', 'ELITE', 'FOUNDERS'].map(tier => (
                                    <button 
                                        key={tier}
                                        onClick={() => { setSelectedTier(tier); setShowFilterMenu(false); }}
                                        className="btn w-100 text-start btn-sm text-white"
                                        style={{ backgroundColor: selectedTier === tier ? '#2d2d2d' : 'transparent', fontSize: '13px' }}
                                    >
                                        {tier}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="position-relative flex-grow-1">
                        <i className="bi bi-search position-absolute" style={{ top: '8px', left: '10px', fontSize: '14px', color: '#b0b0b0' }}></i>
                        <input 
                            type="search" 
                            placeholder="Search by name" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-control bg-transparent text-white border-secondary ps-5" 
                            style={{ borderRadius: '8px', borderColor: '#333', fontSize: '14px', height: '32px' }}
                        />
                    </div>

                    <button onClick={toggleViewMode} className="btn border border-secondary d-flex align-items-center justify-content-center" style={{ borderRadius: '8px', borderColor: '#333', width: '32px', height: '32px', color: '#FFF', padding: 0, backgroundColor: 'transparent' }}>
                        {currentViewMode === 'grid' && <i className="bi bi-grid-fill" style={{ fontSize: '16px' }}></i>}
                        {currentViewMode === 'large' && <i className="bi bi-square-fill" style={{ fontSize: '16px' }}></i>}
                        {currentViewMode === 'list' && <i className="bi bi-list-ul" style={{ fontSize: '20px' }}></i>}
                    </button>
                </div>

                <div className="pb-5">
                    {loading && myAssets.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-secondary" role="status"></div>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {filteredAssets.map((asset) => (
                                <AssetRenderer key={asset.id} item={asset} mode={currentViewMode} />
                            ))}
                            {filteredAssets.length === 0 && !loading && (
                                <div className="col-12 text-center py-5 text-secondary">No items found</div>
                            )}
                        </div>
                    )}
                </div>
            </>
        )}

      </div>
    </main>
  );
}

const AssetRenderer = ({ item, mode }: { item: any, mode: string }) => {
    const colClass = mode === 'list' ? 'col-12' : mode === 'large' ? 'col-12 col-md-6 col-lg-5 mx-auto' : 'col-6 col-md-4 col-lg-3';
    
    // Correct Polygon Badge: 5% opacity black BG, White Logo fill
    const PolygonBadge = () => (
        <div className="position-absolute top-0 start-0 m-2 d-flex align-items-center justify-content-center" style={{ zIndex: 5, width: '28px', height: '28px', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: '50%' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 12C16.5 12.8 16.2 13.5 15.6 14.1L12.9 16.8C12.4 17.3 11.6 17.3 11.1 16.8L8.4 14.1C7.8 13.5 7.5 12.8 7.5 12C7.5 11.2 7.8 10.5 8.4 9.9L11.1 7.2C11.6 6.7 12.4 6.7 12.9 7.2L15.6 9.9C16.2 10.5 16.5 11.2 16.5 12Z" fill="#FFFFFF"/>
            </svg>
        </div>
    );

    if (mode === 'list') {
        return (
            <div className={colClass}>
                <Link href={`/asset/${item.id}`} className="text-decoration-none">
                    <div className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ backgroundColor: '#161b22', border: '1px solid #2d2d2d', transition: '0.2s' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                             {item.image ? (
                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                             ) : (
                                <div style={{ width: '100%', height: '100%', background: '#333' }}></div>
                             )}
                        </div>
                        <div className="flex-grow-1">
                            <div className="text-white" style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</div>
                            <div className="text-white" style={{ fontSize: '12px', fontWeight: '500' }}>NNM Registry</div>
                        </div>
                        <div className="text-end pe-2">
                            <div className="text-white" style={{ fontSize: '13px', fontWeight: '600' }}>{item.isListed ? `${item.price} POL` : <span style={{ color: '#cccccc' }}>Not listed</span>}</div>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }

    return (
      <div className={colClass}>
          <div className="h-100 d-flex flex-column" style={{ backgroundColor: '#161b22', borderRadius: '10px', border: '1px solid #2d2d2d', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}>
              <Link href={`/asset/${item.id}`} className="text-decoration-none h-100 d-flex flex-column">
                  <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative', overflow: 'hidden' }}>
                       <PolygonBadge />
                       {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="asset-img" />
                       ) : (
                          <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <i className="bi bi-image text-secondary"></i>
                          </div>
                       )}
                  </div>
                  
                  <div className="p-3 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                          <div className="text-white fw-bold text-truncate" style={{ fontSize: '14px', maxWidth: '80%' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: '#cccccc' }}>#{item.id}</div>
                      </div>
                      
                      <div className="text-white mb-2" style={{ fontSize: '13px', fontWeight: '500' }}>NNM Registry</div>
                      
                      <div className="mt-auto">
                           <div className="text-white fw-bold" style={{ fontSize: '14px' }}>
                               {item.isListed ? `${item.price} POL` : <span className="fw-normal" style={{ fontSize: '12px', color: '#cccccc' }}>Last Sale</span>}
                           </div>
                           {item.isListed && <div style={{ fontSize: '11px', color: '#cccccc' }}>Price</div>}
                      </div>
                  </div>
              </Link>
          </div>
          <style jsx>{`
            .h-100:hover { border-color: #888 !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
            .h-100:hover .asset-img { transform: scale(1.05); }
          `}</style>
      </div>
    );
};
