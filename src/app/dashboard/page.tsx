'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '@/data/config';
import ABI from '@/data/abi.json';

const GOLD_GRADIENT = 'linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchAssets = async () => {
    if (!address || !isConnected) return;
    
    // 1. Load from Cache Immediately
    const CACHE_KEY = `myAssets_${address}`;
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        setMyAssets(JSON.parse(cachedData));
    }

    setLoading(true);

    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      
      const balance = await contract.balanceOf(address);
      const count = Number(balance);
      
      if (count === 0) {
          setLoading(false);
          setMyAssets([]);
          localStorage.removeItem(CACHE_KEY);
          return;
      }

      const tempAssets: any[] = [];

      for (let i = 0; i < count; i++) {
        try {
            const tokenId = await contract.tokenOfOwnerByIndex(address, i);
            const uri = await contract.tokenURI(tokenId);
            const gatewayURI = uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
            const metaRes = await fetch(gatewayURI);
            const meta = await metaRes.json();

            const newAsset = {
                id: tokenId.toString(),
                name: meta.name,
                tier: meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founders',
                price: '10'
            };

            tempAssets.push(newAsset);
            
            // Incremental Update
            setMyAssets(prev => {
                const exists = prev.find(a => a.id === newAsset.id);
                if (exists) return prev;
                return [...prev, newAsset];
            });

        } catch (err) {
            console.error(err);
        }
      }

      // Update Cache after full load
      localStorage.setItem(CACHE_KEY, JSON.stringify(tempAssets));

    } catch (error) {
      console.error("Dashboard Engine Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, [address, isConnected]);

  const filteredAssets = activeTab === 'ALL' 
    ? myAssets 
    : myAssets.filter(asset => asset.tier.toUpperCase() === activeTab);

  return (
    <main style={{ backgroundColor: '#0d1117', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
      
      <div className="container pt-5 pb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end gap-4">
            <div>
                <h5 className="text-secondary text-uppercase mb-2" style={{ letterSpacing: '2px', fontSize: '12px' }}>Welcome Back</h5>
                <h1 className="text-white fw-bold m-0" style={{ fontFamily: 'serif', fontSize: '36px' }}>My Portfolio</h1>
                <div className="d-flex align-items-center gap-2 mt-2">
                    <span className="badge bg-dark border border-secondary text-secondary px-3 py-2">{address?.slice(0,6)}...{address?.slice(-4)}</span>
                    <span className="badge" style={{ backgroundColor: '#161b22', color: '#FCD535', border: '1px solid #FCD535' }}>VIP TRADER</span>
                    {loading && <div className="spinner-border spinner-border-sm text-warning ms-2" role="status"></div>}
                </div>
            </div>
            <div className="d-flex gap-4 p-3 rounded-3" style={{ backgroundColor: '#161b22', border: '1px solid #1c2128' }}>
                <div>
                    <div className="text-secondary text-uppercase" style={{ fontSize: '10px' }}>Total Assets</div>
                    <div className="text-white fw-bold" style={{ fontSize: '20px' }}>{myAssets.length}</div>
                </div>
                <div style={{ width: '1px', backgroundColor: '#30363d' }}></div>
                <div>
                    <div className="text-secondary text-uppercase" style={{ fontSize: '10px' }}>Status</div>
                    <div className="fw-bold" style={{ fontSize: '20px', color: '#0ecb81' }}>Active</div>
                </div>
            </div>
        </div>
        <div className="w-100 my-4" style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(252, 213, 53, 0.3) 50%, transparent 100%)' }}></div>
      </div>

      <div className="container mb-5">
        <div className="d-flex gap-3">
            {['ALL', 'IMMORTAL', 'ELITE', 'FOUNDERS'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="btn fw-bold rounded-pill px-4"
                    style={{ backgroundColor: activeTab === tab ? '#FCD535' : 'transparent', color: activeTab === tab ? '#000' : '#888', border: '1px solid #333', fontSize: '12px' }}>
                    {tab}
                </button>
            ))}
        </div>
      </div>

      <div className="container">
        <div className="row g-4">
            {filteredAssets.map((asset) => (
                <div key={asset.id} className="col-12 col-md-6 col-lg-4 col-xl-3 fade-in">
                   <DashboardAssetCard item={asset} />
                </div>
            ))}
            <div className="col-12 col-md-6 col-lg-4 col-xl-3">
                <Link href="/mint" className="text-decoration-none">
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center p-4" style={{ border: '1px dashed #333', borderRadius: '12px', minHeight: '280px' }}>
                        <i className="bi bi-plus-lg text-secondary mb-3" style={{ fontSize: '28px' }}></i>
                        <span className="text-secondary fw-bold text-uppercase" style={{ fontSize: '12px' }}>Mint New Asset</span>
                    </div>
                </Link>
            </div>
        </div>
      </div>

      <style jsx>{`
        .fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}

const DashboardAssetCard = ({ item }: { item: any }) => {
    const style = getCardStyles(item.tier);
    return (
      <div className="p-3" style={{ backgroundColor: '#161b22', borderRadius: '12px', border: '1px solid #1c2128' }}>
          <div className="mb-3" style={{ width: '100%', height: '160px', background: style.bg, border: style.border, borderRadius: '8px', boxShadow: style.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ textAlign: 'center' }}>
                   <h3 style={{ fontFamily: 'serif', fontWeight: '900', fontSize: '24px', background: GOLD_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' }}>{item.name}</h3>
               </div>
          </div>
          <div className="w-100">
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
    if (tier === 'immortal') return { bg: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 100%)', border: '1px solid #FCD535', shadow: '0 10px 30px rgba(0,0,0,0.8)', labelColor: '#FCD535' };
    if (tier === 'elite') return { bg: 'linear-gradient(135deg, #2b0505 0%, #4a0a0a 100%)', border: '1px solid #ff3232', shadow: '0 10px 30px rgba(40,0,0,0.5)', labelColor: '#ff3232' };
    return { bg: 'linear-gradient(135deg, #001f24 0%, #003840 100%)', border: '1px solid #008080', shadow: '0 10px 30px rgba(0,30,30,0.5)', labelColor: '#4db6ac' };
};
