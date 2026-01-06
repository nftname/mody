'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from "wagmi";
import { createPublicClient, http, parseAbi } from 'viem';
import { polygon } from 'viem/chains';
import { NFT_COLLECTION_ADDRESS } from '@/data/config';

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
  
  const [myAssets, setMyAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  const resolveIPFS = (uri) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
  };

  const chunk = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
    return result;
  };

  const fetchAssets = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const balanceBigInt = await publicClient.readContract({
        address: NFT_COLLECTION_ADDRESS,
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
                address: NFT_COLLECTION_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'tokenOfOwnerByIndex',
                args: [address, BigInt(i)]
            })
        )
      );

      const batches = chunk(tokenIds, 5);
      const loaded = [];

      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(async (tokenId) => {
            try {
              const tokenURI = await publicClient.readContract({
                  address: NFT_COLLECTION_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: 'tokenURI',
                  args: [tokenId]
              });

              const metaRes = await fetch(resolveIPFS(tokenURI));
              const meta = metaRes.ok ? await metaRes.json() : {};
              
              return {
                id: tokenId.toString(),
                name: meta.name || `NNM #${tokenId.toString()}`,
                tier: meta.attributes?.find((a) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founders',
                price: meta.attributes?.find((a) => a.trait_type === 'Price')?.value || '10'
              };
            } catch (error) {
              console.error('Failed to load token metadata', error);
              return null;
            }
          })
        );

        const valid = batchResults.filter(Boolean);
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
      
      <div style={{ height: '220px', width: '100%', background: 'linear-gradient(180deg, rgba(252, 213, 53, 0.15) 0%, #1E1E1E 100%)', position: 'relative', marginTop: '60px' }}>
      </div>

      <div className="container mx-auto px-4" style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
        <div className="d-flex flex-column gap-4">
            
            <div className="d-flex flex-column flex-md-row align-items-start gap-4">
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #1E1E1E', background: '#161b22', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    <div style={{ width: '100%', height: '100%', background: GOLD_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', color: '#1E1E1E' }}>
                        {address ? address.slice(2,4).toUpperCase() : 'U'}
                    </div>
                </div>

                <div className="mt-2 pt-md-4">
                    <h1 className="text-white fw-bold m-0 mb-1" style={{ fontSize: '32px', fontFamily: 'serif' }}>Unnamed User</h1>
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="text-secondary" style={{ fontSize: '14px' }}>{address ? `${address.slice(0,6)}...${address.slice(-4)}` : ''}</span>
                        <span className="badge" style={{ backgroundColor: 'rgba(252, 213, 53, 0.1)', color: '#FCD535', border: '1px solid #FCD535', fontSize: '10px' }}>VIP TRADER</span>
                    </div>
                </div>

                <div className="ms-md-auto mt-2 pt-md-4 d-flex gap-4">
                    <div className="text-center px-3 py-2 rounded-3" style={{ backgroundColor: '#161b22', border: '1px solid #2d333b' }}>
                        <div className="text-white fw-bold fs-5">{myAssets.length}</div>
                        <div className="text-secondary text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>Items</div>
                    </div>
                    <div className="text-center px-3 py-2 rounded-3" style={{ backgroundColor: '#161b22', border: '1px solid #2d333b' }}>
                        <div className="fw-bold fs-5" style={{ color: '#0ecb81' }}>Active</div>
                        <div className="text-secondary text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>Status</div>
                    </div>
                </div>
            </div>

            <div className="d-flex gap-4 border-bottom border-secondary overflow-auto pb-2" style={{ borderColor: '#333 !important' }}>
                {['ALL', 'IMMORTAL', 'ELITE', 'FOUNDERS'].map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)} 
                        className="btn px-0 fw-bold text-uppercase position-relative"
                        style={{ 
                            color: activeTab === tab ? '#FCD535' : '#888', 
                            background: 'transparent', 
                            border: 'none', 
                            fontSize: '14px',
                            letterSpacing: '1px',
                            paddingBottom: '12px'
                        }}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div style={{ position: 'absolute', bottom: '-2px', left: 0, width: '100%', height: '2px', backgroundColor: '#FCD535', boxShadow: '0 -2px 10px rgba(252, 213, 53, 0.5)' }}></div>
                        )}
                    </button>
                ))}
            </div>

            <div className="mt-2 mb-5">
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
                                <div className="h-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ border: '1px dashed #333', borderRadius: '12px', minHeight: '340px', cursor: 'pointer', transition: '0.2s', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px', border: '1px solid #333' }}>
                                        <i className="bi bi-plus-lg text-secondary" style={{ fontSize: '24px' }}></i>
                                    </div>
                                    <span className="text-secondary fw-bold text-uppercase" style={{ fontSize: '12px' }}>Mint New Asset</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

        </div>
      </div>
    </main>
  );
}

const DashboardAssetCard = ({ item }) => {
    const style = getCardStyles(item.tier);
    return (
      <div className="d-flex flex-column h-100" style={{ backgroundColor: '#161b22', borderRadius: '16px', border: '1px solid #1c2128', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}>
          <div style={{ width: '100%', height: '200px', background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
               <div style={{ textAlign: 'center', zIndex: 2 }}>
                   <h3 style={{ fontFamily: 'serif', fontWeight: '900', fontSize: '28px', background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase', margin: 0 }}>{item.name}</h3>
               </div>
               <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, #161b22 0%, transparent 40%)' }}></div>
          </div>
          <div className="p-3 d-flex flex-column flex-grow-1">
              <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                      <div className="text-secondary text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>{item.tier} Tier</div>
                      <div className="text-white fw-bold mt-1" style={{ fontSize: '14px' }}>{item.name}</div>
                  </div>
                  <div className="text-end">
                      <div className="text-secondary text-uppercase" style={{ fontSize: '10px' }}>Price</div>
                      <div className="text-white fw-bold d-flex align-items-center justify-content-end gap-1" style={{ fontSize: '14px' }}>
                          <img src="/images/polygon-logo.png" alt="POL" width="14" height="14" style={{ borderRadius: '50%' }} onError={(e) => e.target.style.display = 'none'} />
                          {item.price} POL
                      </div>
                  </div>
              </div>
              <div className="mt-auto pt-3 border-top border-secondary" style={{ borderColor: '#2d333b !important' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary" style={{ fontSize: '12px' }}>#{item.id}</span>
                    <Link href={`/asset/${item.id}`} className="text-decoration-none">
                        <span className="fw-bold" style={{ color: '#FCD535', fontSize: '12px' }}>Manage</span>
                    </Link>
                  </div>
              </div>
          </div>
      </div>
    );
};

const getCardStyles = (tier) => {
    if (tier?.toLowerCase() === 'immortal') return { bg: 'linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 100%)' };
    if (tier?.toLowerCase() === 'elite') return { bg: 'linear-gradient(135deg, #2b0505 0%, #5a1a1a 100%)' };
    return { bg: 'linear-gradient(135deg, #001f24 0%, #004d40 100%)' };
};
