'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useBalance } from "wagmi";
import { createPublicClient, http, parseAbi } from 'viem';
import { polygon } from 'viem/chains';
import { NFT_COLLECTION_ADDRESS } from '@/data/config';

const GOLD_COLOR = '#FCD535';
const GOLD_GRADIENT = 'linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)';

const CONTRACT_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function tokenOfOwnerByIndex(address, uint256) view returns (uint256)",
  "function tokenURI(uint256) view returns (string)"
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
  const [activeTab, setActiveTab] = useState('Items');
  // Single state for view mode toggle cycle
  const [viewModeState, setViewModeState] = useState(0); 
  const viewModes = ['grid', 'large', 'list'];
  const currentViewMode = viewModes[viewModeState];

  const [searchQuery, setSearchQuery] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // State for filter toggle

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
              const tokenURI = await publicClient.readContract({
                  address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                  abi: CONTRACT_ABI,
                  functionName: 'tokenURI',
                  args: [tokenId]
              });

              const metaRes = await fetch(resolveIPFS(tokenURI));
              const meta = metaRes.ok ? await metaRes.json() : {};
              
              return {
                id: tokenId.toString(),
                name: meta.name || `NNM #${tokenId.toString()}`,
                tier: meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founders',
                price: meta.attributes?.find((a: any) => a.trait_type === 'Price')?.value || '0'
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

  const totalAssetValue = myAssets.reduce((acc, curr) => acc + parseFloat(curr.price || 0), 0);

  const filteredAssets = myAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isConnected) {
    return (
        <main style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', width: '100%' }}>
            <div className="text-center">
                <h2 className="text-white mb-3">Connect Wallet to View Profile</h2>
                <p className="text-secondary mb-4">Please connect your wallet to see your NNM assets.</p>
            </div>
        </main>
    );
  }

  return (
    <main style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* Spacer for Fixed Navbar */}
      <div style={{ height: '80px', width: '100%' }}></div>

      {/* Banner Section - Reduced height, starts right after navbar */}
      <div style={{ width: '100%', height: '160px', background: 'linear-gradient(180deg, #2b2b2b 0%, #1E1E1E 100%)', position: 'relative', borderBottom: '1px solid #2d2d2d' }}>
      </div>

      {/* Profile & Content Container - Overlaps banner */}
      <div className="container mx-auto px-3" style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
        
        {/* Header: Avatar & Wallet Address - Precise OpenSea sizing */}
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

            {/* Stats Bar: Label ABOVE Value - Precise OpenSea layout & font size */}
            <div className="d-flex flex-wrap gap-4 mt-2">
                <div>
                    <div style={{ color: '#8a939b', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Currency Balance</div>
                    <div className="text-white" style={{ fontSize: '16px', fontWeight: '500' }}>
                        {balanceData ? parseFloat(balanceData.formatted).toFixed(2) : '0.00'} <span style={{ fontSize: '12px', color: '#8a939b' }}>POL</span>
                    </div>
                </div>
                <div>
                    <div style={{ color: '#8a939b', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Items</div>
                    <div className="text-white" style={{ fontSize: '16px', fontWeight: '500' }}>{myAssets.length}</div>
                </div>
                <div>
                    <div style={{ color: '#8a939b', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portfolio Value</div>
                    <div className="text-white" style={{ fontSize: '16px', fontWeight: '500' }}>{totalAssetValue.toFixed(0)} <span style={{ fontSize: '12px', color: '#8a939b' }}>POL</span></div>
                </div>
            </div>
        </div>

        {/* Tabs Navigation - Smaller font, tighter spacing, white text, golden underline */}
        <div className="d-flex gap-3 border-bottom border-secondary mb-4 overflow-auto" style={{ borderColor: '#2d2d2d !important' }}>
            {['Items', 'Listings', 'Offers', 'Created', 'Activity'].map((tab) => (
                <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className="btn px-0 position-relative pb-3"
                    style={{ 
                        color: activeTab === tab ? '#FFFFFF' : '#8a939b', 
                        background: 'transparent', 
                        border: 'none', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {tab}
                    {activeTab === tab && (
                        <div style={{ position: 'absolute', bottom: '-1px', left: 0, width: '100%', height: '2px', backgroundColor: GOLD_COLOR }}></div>
                    )}
                </button>
            ))}
        </div>

        {/* Content Area (Items Tab) */}
        {activeTab === 'Items' && (
            <>
                {/* Toolbar: Filter Icon | Search | Settings | View Toggle - Precise layout */}
                <div className="d-flex align-items-center gap-2 mb-4">
                     {/* Filter Toggle Icon */}
                    <button onClick={() => setShowFilters(!showFilters)} className="btn p-2 border border-secondary d-flex align-items-center justify-content-center" style={{ borderRadius: '8px', borderColor: '#333', width: '40px', height: '40px', color: '#8a939b' }}>
                        <i className="bi bi-funnel-fill"></i>
                    </button>

                     {/* Search Input - Squarer borders, smaller size */}
                    <div className="position-relative flex-grow-1">
                        <i className="bi bi-search position-absolute text-secondary" style={{ top: '10px', left: '12px', fontSize: '14px' }}></i>
                        <input 
                            type="text" 
                            placeholder="Search by name" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-control bg-transparent text-white border-secondary ps-5 py-2" 
                            style={{ borderRadius: '8px', borderColor: '#333', fontSize: '14px', height: '40px' }}
                        />
                    </div>

                    {/* Settings Icon */}
                    <button className="btn p-2 border border-secondary d-flex align-items-center justify-content-center" style={{ borderRadius: '8px', borderColor: '#333', width: '40px', height: '40px', color: '#8a939b' }}>
                        <i className="bi bi-gear-fill"></i>
                    </button>

                    {/* Single View Toggle Button - Cycles through modes */}
                    <button onClick={toggleViewMode} className="btn p-2 border border-secondary d-flex align-items-center justify-content-center" style={{ borderRadius: '8px', borderColor: '#333', width: '40px', height: '40px', color: '#8a939b' }}>
                        {currentViewMode === 'grid' && <i className="bi bi-grid-fill"></i>}
                        {currentViewMode === 'large' && <i className="bi bi-square-fill"></i>}
                        {currentViewMode === 'list' && <i className="bi bi-list-ul"></i>}
                    </button>
                </div>
                
                {/* Placeholder for Filters Sidebar (hidden by default) */}
                {showFilters && (
                    <div className="mb-3 p-3 rounded-3 border border-secondary" style={{ backgroundColor: '#161b22', borderColor: '#333' }}>
                        <span className="text-secondary" style={{ fontSize: '12px' }}>Filters will appear here...</span>
                    </div>
                )}

                {/* Assets Renderer */}
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

// Sub-component for rendering individual assets based on view mode
const AssetRenderer = ({ item, mode }: { item: any, mode: string }) => {
    const style = getCardStyles(item.tier);
    // Grid Logic: List=Full Width, Large=Half/Center, Grid=Standard 4 col
    const colClass = mode === 'list' ? 'col-12' : mode === 'large' ? 'col-12 col-md-6 col-lg-5 mx-auto' : 'col-6 col-md-4 col-lg-3';
    
    // 1. List View
    if (mode === 'list') {
        return (
            <div className={colClass}>
                <Link href={`/asset/${item.id}`} className="text-decoration-none">
                    <div className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ backgroundColor: '#161b22', border: '1px solid #2d2d2d', transition: '0.2s' }}>
                        <div style={{ width: '48px', height: '48px', background: style.bg, borderRadius: '6px', flexShrink: 0 }}></div>
                        <div className="flex-grow-1">
                            <div className="text-white" style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'serif', fontStyle: 'italic' }}>{item.name}</div>
                            <div className="text-secondary" style={{ fontSize: '11px' }}>NNM Registry</div>
                        </div>
                        <div className="text-end pe-2 d-none d-md-block">
                             <div className="text-secondary" style={{ fontSize: '10px' }}>Top Offer</div>
                             <div style={{ fontSize: '12px', color: '#8a939b' }}>-</div>
                        </div>
                        <div className="text-end pe-2">
                            <div className="text-white" style={{ fontSize: '13px', fontWeight: '500' }}>{item.price} POL</div>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }

    // 2. Grid & Large View
    return (
      <div className={colClass}>
          <div className="h-100 d-flex flex-column" style={{ backgroundColor: '#161b22', borderRadius: '10px', border: '1px solid #2d2d2d', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}>
              <Link href={`/asset/${item.id}`} className="text-decoration-none h-100 d-flex flex-column">
                  {/* Image Area */}
                  <div style={{ width: '100%', aspectRatio: '1/1', background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                       <div style={{ textAlign: 'center', zIndex: 2 }}>
                           <h3 className="asset-name" style={{ fontFamily: 'serif', fontWeight: '900', fontSize: mode === 'large' ? '32px' : '20px', color: '#e5e8eb', fontStyle: 'italic', textTransform: 'uppercase', margin: 0 }}>{item.name}</h3>
                       </div>
                       {/* Overlay gradient */}
                       <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, #161b22 0%, transparent 30%)' }}></div>
                  </div>
                  
                  {/* Info Area */}
                  <div className="p-3 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                          <div style={{ maxWidth: '70%' }}>
                              <div className="text-white asset-name" style={{ fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'serif', fontStyle: 'italic' }}>{item.name}</div>
                              <div className="text-secondary" style={{ fontSize: '11px' }}>NNM Registry</div>
                          </div>
                          <div className="text-end">
                              <div className="text-secondary" style={{ fontSize: '10px' }}>Price</div>
                              <div className="text-white" style={{ fontSize: '13px', fontWeight: '500' }}>{item.price} POL</div>
                          </div>
                      </div>
                      
                      {/* Footer of Card */}
                      <div className="mt-3 pt-2 border-top border-secondary d-flex justify-content-between align-items-center" style={{ borderColor: '#2d2d2d !important' }}>
                           <span className="text-secondary" style={{ fontSize: '10px' }}>Last Sale: --</span>
                           <span style={{ fontSize: '10px', color: '#8a939b' }}>Top Offer: -</span>
                      </div>
                  </div>
              </Link>
          </div>
          <style jsx>{`
            .asset-name { transition: color 0.3s; }
            .h-100:hover .asset-name { color: ${GOLD_COLOR} !important; }
            .h-100:hover { border-color: #444 !important; }
          `}</style>
      </div>
    );
};

const getCardStyles = (tier: string) => {
    if (tier?.toLowerCase() === 'immortal') return { bg: 'linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 100%)' };
    if (tier?.toLowerCase() === 'elite') return { bg: 'linear-gradient(135deg, #2b0505 0%, #5a1a1a 100%)' };
    return { bg: 'linear-gradient(135deg, #001f24 0%, #004d40 100%)' };
};
