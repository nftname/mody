'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useBalance } from "wagmi";
import { createPublicClient, http, parseAbi } from 'viem';
import { polygon } from 'viem/chains';
import { NFT_COLLECTION_ADDRESS } from '@/data/config';

const GOLD_GRADIENT = 'linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)';

// ABI متوافق مع Registry 10 (ERC721Enumerable)
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
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Logic for UI interactions
  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
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
    <main style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* Spacer for Fixed Navbar */}
      <div style={{ height: '80px', width: '100%' }}></div>

      {/* Banner Section */}
      <div style={{ width: '100%', height: '25vh', minHeight: '180px', background: 'linear-gradient(180deg, #2b2b2b 0%, #1E1E1E 100%)', position: 'relative', borderBottom: '1px solid #2d2d2d' }}>
      </div>

      {/* Profile & Content Container */}
      <div className="container mx-auto px-3" style={{ marginTop: '-70px', position: 'relative', zIndex: 10 }}>
        
        {/* Header: Avatar & Wallet Address */}
        <div className="d-flex flex-column gap-3 mb-5">
            <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '5px solid #1E1E1E', background: '#161b22', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.6)' }}>
                <div style={{ width: '100%', height: '100%', background: GOLD_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '46px', fontWeight: 'bold', color: '#1E1E1E' }}>
                    {address ? address.slice(2,4).toUpperCase() : ''}
                </div>
            </div>

            <div className="d-flex align-items-center gap-3">
                <span className="text-white fw-bold" style={{ fontSize: '24px' }}>
                    {address ? `${address.slice(0,6)}...${address.slice(-4)}` : ''}
                </span>
                <button onClick={copyToClipboard} className="btn p-0 border-0" style={{ color: '#8a939b' }}>
                    {isCopied ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-copy"></i>}
                </button>
            </div>

            {/* Stats Bar: Balance | Items | Portfolio Value */}
            <div className="d-flex flex-wrap gap-4 mt-2">
                <div>
                    <div className="fw-bold text-white fs-5">
                        {balanceData ? parseFloat(balanceData.formatted).toFixed(2) : '0.00'} <span style={{ fontSize: '12px', color: '#8a939b' }}>POL</span>
                    </div>
                    <div style={{ color: '#8a939b', fontSize: '12px' }}>Currency Balance</div>
                </div>
                <div>
                    <div className="fw-bold text-white fs-5">{myAssets.length}</div>
                    <div style={{ color: '#8a939b', fontSize: '12px' }}>Total Items</div>
                </div>
                <div>
                    <div className="fw-bold text-white fs-5">{totalAssetValue.toFixed(0)} <span style={{ fontSize: '12px', color: '#8a939b' }}>POL</span></div>
                    <div style={{ color: '#8a939b', fontSize: '12px' }}>Portfolio Value</div>
                </div>
            </div>
        </div>

        {/* Tabs Navigation */}
        <div className="d-flex gap-4 border-bottom border-secondary mb-4 overflow-auto" style={{ borderColor: '#2d2d2d !important' }}>
            {['Items', 'Listings', 'Offers', 'Created', 'Activity'].map((tab) => (
                <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className="btn px-0 fw-bold position-relative pb-3"
                    style={{ 
                        color: activeTab === tab ? '#FFFFFF' : '#8a939b', 
                        background: 'transparent', 
                        border: 'none', 
                        fontSize: '16px',
                        whiteSpace: 'nowrap',
                        marginRight: '10px'
                    }}
                >
                    {tab}
                    {activeTab === tab && (
                        <div style={{ position: 'absolute', bottom: '-1px', left: 0, width: '100%', height: '2px', backgroundColor: '#FCD535' }}></div>
                    )}
                </button>
            ))}
        </div>

        {/* Content Area (Items Tab) */}
        {activeTab === 'Items' && (
            <>
                {/* Toolbar: Search, Filters, View Modes */}
                <div className="d-flex flex-column flex-md-row gap-3 mb-4 justify-content-between align-items-center">
                    <div className="d-flex gap-2 w-100 flex-wrap">
                         {/* Search */}
                        <div className="position-relative flex-grow-1" style={{ maxWidth: '400px', minWidth: '200px' }}>
                            <i className="bi bi-search position-absolute text-secondary" style={{ top: '12px', left: '12px' }}></i>
                            <input 
                                type="text" 
                                placeholder="Search by name" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-control bg-transparent text-white border-secondary ps-5 py-2" 
                                style={{ borderRadius: '12px', borderColor: '#333' }} 
                            />
                        </div>
                        {/* Visual Filters (Placeholder for now) */}
                        <button className="btn border-secondary text-white d-flex align-items-center gap-2" style={{ borderRadius: '12px', borderColor: '#333', fontSize: '14px' }}>
                            Price: Low to High <i className="bi bi-chevron-down" style={{ fontSize: '10px' }}></i>
                        </button>
                    </div>

                    {/* View Toggles */}
                    <div className="d-flex gap-2 bg-dark rounded-3 p-1" style={{ border: '1px solid #333' }}>
                        <button onClick={() => setViewMode('grid')} className={`btn btn-sm ${viewMode === 'grid' ? 'bg-secondary text-white' : 'text-secondary'}`} style={{ borderRadius: '8px' }}><i className="bi bi-grid-fill"></i></button>
                        <button onClick={() => setViewMode('large')} className={`btn btn-sm ${viewMode === 'large' ? 'bg-secondary text-white' : 'text-secondary'}`} style={{ borderRadius: '8px' }}><i className="bi bi-square-fill"></i></button>
                        <button onClick={() => setViewMode('list')} className={`btn btn-sm ${viewMode === 'list' ? 'bg-secondary text-white' : 'text-secondary'}`} style={{ borderRadius: '8px' }}><i className="bi bi-list-ul"></i></button>
                    </div>
                </div>

                {/* Assets Renderer */}
                <div className="pb-5">
                    {loading && myAssets.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-secondary" role="status"></div>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {filteredAssets.map((asset) => (
                                <AssetRenderer key={asset.id} item={asset} mode={viewMode} />
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
                    <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#161b22', border: '1px solid #2d2d2d', transition: '0.2s' }}>
                        <div style={{ width: '56px', height: '56px', background: style.bg, borderRadius: '8px', flexShrink: 0 }}></div>
                        <div className="flex-grow-1">
                            <div className="text-white fw-bold" style={{ fontSize: '15px', fontFamily: 'serif', fontStyle: 'italic' }}>{item.name}</div>
                            <div className="text-secondary" style={{ fontSize: '12px' }}>NNM Registry</div>
                        </div>
                        <div className="text-end pe-3 d-none d-md-block">
                             <div className="text-secondary" style={{ fontSize: '11px' }}>Top Offer</div>
                             <div className="text-white" style={{ fontSize: '13px' }}>-</div>
                        </div>
                        <div className="text-end pe-3">
                            <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{item.price} POL</div>
                            <div className="text-secondary" style={{ fontSize: '11px' }}>Price</div>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }

    // 2. Grid & Large View
    return (
      <div className={colClass}>
          <div className="h-100 d-flex flex-column" style={{ backgroundColor: '#161b22', borderRadius: '12px', border: '1px solid #2d2d2d', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}>
              <Link href={`/asset/${item.id}`} className="text-decoration-none h-100 d-flex flex-column">
                  {/* Image Area */}
                  <div style={{ width: '100%', aspectRatio: '1/1', background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                       <div style={{ textAlign: 'center', zIndex: 2 }}>
                           <h3 className="asset-name" style={{ fontFamily: 'serif', fontWeight: '900', fontSize: mode === 'large' ? '32px' : '22px', color: '#e5e8eb', fontStyle: 'italic', textTransform: 'uppercase', margin: 0 }}>{item.name}</h3>
                       </div>
                       {/* Overlay gradient */}
                       <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, #161b22 0%, transparent 30%)' }}></div>
                  </div>
                  
                  {/* Info Area */}
                  <div className="p-3 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                          <div style={{ maxWidth: '70%' }}>
                              <div className="text-white fw-bold asset-name" style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'serif', fontStyle: 'italic' }}>{item.name}</div>
                              <div className="text-secondary" style={{ fontSize: '11px' }}>NNM Registry</div>
                          </div>
                          <div className="text-end">
                              <div className="text-secondary" style={{ fontSize: '10px' }}>Price</div>
                              <div className="text-white fw-bold" style={{ fontSize: '13px' }}>{item.price} POL</div>
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
            .h-100:hover .asset-name { color: #FCD535 !important; }
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
