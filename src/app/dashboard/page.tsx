'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from "wagmi";
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
  
  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

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
                price: meta.attributes?.find((a: any) => a.trait_type === 'Price')?.value || '10'
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

  const filteredAssets = activeTab === 'ALL' 
    ? myAssets 
    : myAssets.filter(asset => asset.tier.toUpperCase() === activeTab);

  if (!isConnected) {
    return (
        <main style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', width: '100%' }}>
            <div className="text-center">
                <h2 className="text-white mb-3">Connect Wallet to View Dashboard</h2>
                <p className="text-secondary mb-4">Please connect your wallet to see your NNM assets.</p>
            </div>
        </main>
    );
  }

  return (
    <main style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      
      {/* 1. Spacer for Fixed Navbar (Keeps content visible) */}
      <div style={{ height: '80px', width: '100%' }}></div>

      {/* 2. Banner Section (OpenSea Style Cover) */}
      <div style={{ width: '100%', height: '220px', background: 'linear-gradient(180deg, rgba(252, 213, 53, 0.15) 0%, #1E1E1E 100%)', position: 'relative' }}>
      </div>

      {/* 3. Profile & Content Container (Negative margin for overlap) */}
      <div className="container mx-auto px-3" style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
        
        {/* Profile Header */}
        <div className="d-flex flex-column gap-3 mb-5">
            {/* Avatar Circle */}
            <div style={{ width: '130px', height: '130px', borderRadius: '50%', border: '5px solid #1E1E1E', background: '#161b22', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
                <div style={{ width: '100%', height: '100%', background: GOLD_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', color: '#1E1E1E' }}>
                    {address ? address.slice(2,4).toUpperCase() : 'U'}
                </div>
            </div>

            {/* User Info Row */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end gap-3">
                <div>
                    <h1 className="text-white fw-bold m-0 mb-1" style={{ fontSize: '32px', fontFamily: 'serif' }}>My Portfolio</h1>
                    <div className="d-flex align-items-center gap-2">
                         <span className="text-secondary" style={{ fontSize: '14px' }}>{address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Guest'}</span>
                         <span className="badge" style={{ backgroundColor: 'rgba(252, 213, 53, 0.1)', color: '#FCD535', border: '1px solid #FCD535', fontSize: '10px' }}>VIP TRADER</span>
                    </div>
                </div>

                {/* Stats Box */}
                <div className="d-flex gap-4 p-3 rounded-3" style={{ backgroundColor: '#161b22', border: '1px solid #2d333b' }}>
                    <div className="text-center">
                        <div className="text-white fw-bold fs-5">{myAssets.length}</div>
                        <div className="text-secondary text-uppercase" style={{ fontSize: '10px' }}>Items</div>
                    </div>
                    <div style={{ width: '1px', backgroundColor: '#30363d' }}></div>
                    <div className="text-center">
                        <div className="fw-bold fs-5" style={{ color: '#0ecb81' }}>Active</div>
                        <div className="text-secondary text-uppercase" style={{ fontSize: '10px' }}>Status</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-4 border-bottom border-secondary mb-4" style={{ borderColor: '#333 !important', overflowX: 'auto' }}>
            {['ALL', 'IMMORTAL', 'ELITE', 'FOUNDERS'].map((tab) => (
                <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className="btn px-0 fw-bold text-uppercase position-relative pb-3"
                    style={{ 
                        color: activeTab === tab ? '#FCD535' : '#888', 
                        background: 'transparent', 
                        border: 'none', 
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {tab}
                    {activeTab === tab && (
                        <div style={{ position: 'absolute', bottom: '-1px', left: 0, width: '100%', height: '2px', backgroundColor: '#FCD535' }}></div>
                    )}
                </button>
            ))}
        </div>

        {/* Assets Grid */}
        <div className="pb-5">
            {loading && myAssets.length === 0 ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {filteredAssets.map((asset) => (
                        <div key={asset.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                        <DashboardAssetCard item={asset} />
                        </div>
                    ))}
                    <div className="col-12 col-md-6 col-lg-4 col-xl-3">
                        <Link href="/mint" className="text-decoration-none">
                            <div className="h-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ border: '1px dashed #333', borderRadius: '12px', minHeight: '280px', cursor: 'pointer', transition: '0.2s', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                <i className="bi bi-plus-lg text-secondary mb-3" style={{ fontSize: '28px' }}></i>
                                <span className="text-secondary fw-bold text-uppercase" style={{ fontSize: '12px' }}>Mint New Asset</span>
                            </div>
                        </Link>
                    </div>
                </div>
            )}
        </div>

      </div>
    </main>
  );
}

const DashboardAssetCard = ({ item }: { item: any }) => {
    const style = getCardStyles(item.tier);
    return (
      <div className="p-3 h-100 d-flex flex-column" style={{ backgroundColor: '#161b22', borderRadius: '12px', border: '1px solid #1c2128' }}>
          <div className="mb-3" style={{ width: '100%', height: '160px', background: style.bg, border: style.border, borderRadius: '8px', boxShadow: style.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ textAlign: 'center' }}>
                   <h3 style={{ fontFamily: 'serif', fontWeight: '900', fontSize: '24px', background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' }}>{item.name}</h3>
               </div>
          </div>
          <div className="w-100 mt-auto">
              <div className="d-flex justify-content-between align-items-end mb-3">
                  <div>
                      <div className="text-secondary text-uppercase" style={{ fontSize: '9px' }}>Tier</div>
                      <div style={{ color: style.labelColor, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{item.tier}</div>
                  </div>
                  <div className="text-end">
                      <div className="text-secondary text-uppercase" style={{ fontSize: '9px' }}>ID</div>
                      <div className="text-white fw-bold" style={{ fontSize: '12px' }}>#{item.id}</div>
                  </div>
              </div>
              <Link href={`/asset/${item.id}`} className="text-decoration-none">
                  <button className="btn w-100 py-2 border-secondary text-white" style={{ backgroundColor: '#0d1117', fontSize: '12px', fontWeight: '600' }}>
                      <i className="bi bi-gear-fill me-2 text-secondary"></i> Manage Asset
                  </button>
              </Link>
          </div>
      </div>
    );
};

const getCardStyles = (tier: string) => {
    if (tier?.toLowerCase() === 'immortal') return { bg: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 100%)', border: '1px solid #FCD535', shadow: '0 10px 30px rgba(0,0,0,0.8)', labelColor: '#FCD535' };
    if (tier?.toLowerCase() === 'elite') return { bg: 'linear-gradient(135deg, #2b0505 0%, #4a0a0a 100%)', border: '1px solid #ff3232', shadow: '0 10px 30px rgba(40,0,0,0.5)', labelColor: '#ff3232' };
    return { bg: 'linear-gradient(135deg, #001f24 0%, #003840 100%)', border: '1px solid #008080', shadow: '0 10px 30px rgba(0,30,30,0.5)', labelColor: '#4db6ac' };
};
