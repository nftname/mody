'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAccount, useBalance } from "wagmi";
import { createPublicClient, http, parseAbi, formatEther } from 'viem';
import { polygon } from 'viem/chains';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase';

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

export default function ProfilePage() {
  const params = useParams();
  const targetAddress = params?.address as `0x${string}`; 
  const { address: connectedAddress } = useAccount(); 
  const { data: balanceData } = useBalance({ address: targetAddress });
  
  const isOwner = connectedAddress && targetAddress ? connectedAddress.toLowerCase() === targetAddress.toLowerCase() : false;

  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [createdAssets, setCreatedAssets] = useState<any[]>([]);
  const [offersData, setOffersData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('Items');
  
  const [viewModeState, setViewModeState] = useState(0); 
  const viewModes = ['grid', 'large', 'list'];
  const currentViewMode = viewModes[viewModeState];
  const [isCopied, setIsCopied] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL'); 
  
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [offerType, setOfferType] = useState('All'); 
  const [offerSort, setOfferSort] = useState('Newest');   
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // إغلاق القوائم المنسدلة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
            setOpenDropdown(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
      if (openDropdown === name) setOpenDropdown(null);
      else setOpenDropdown(name);
  };

  const resolveIPFS = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;
  };

  const chunk = <T,>(arr: T[], size: number) => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
    return result;
  };

  const formatExpiration = (timestamp: number) => {
      const now = Math.floor(Date.now() / 1000);
      const diff = timestamp - now;
      if (diff <= 0) return "Expired";
      const days = Math.floor(diff / (3600 * 24));
      if (days > 0) return `${days}d`;
      const hours = Math.floor(diff / 3600);
      return `${hours}h`;
  };

  const formatShortTime = (dateString: string | number) => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diff < 60) return `${diff}s`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
      if (diff < 31536000) return `${Math.floor(diff / 86400)}d`;
      return `${Math.floor(diff / 31536000)}y`;
  };

  const formatCompactNumber = (num: number) => {
      return Intl.NumberFormat('en-US', {
          notation: "compact",
          maximumFractionDigits: 1
      }).format(num);
  };

  // جلب المفضلات
  const fetchFavorites = async () => {
    if (!connectedAddress) return;
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('token_id')
            .eq('wallet_address', connectedAddress);
        
        if (error) throw error;
        if (data) {
            setFavoriteIds(new Set(data.map(item => item.token_id)));
        }
    } catch (e) { console.error("Error fetching favorites", e); }
  };

  // التعامل مع ضغط زر المفضلة
  const handleToggleFavorite = async (e: React.MouseEvent, tokenId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!connectedAddress) return; 

    const newFavs = new Set(favoriteIds);
    const isFav = newFavs.has(tokenId);

    // تحديث فوري للواجهة
    if (isFav) newFavs.delete(tokenId);
    else newFavs.add(tokenId);

    setFavoriteIds(newFavs);

    try {
        if (isFav) {
            await supabase.from('favorites').delete().match({ wallet_address: connectedAddress, token_id: tokenId });
        } else {
            await supabase.from('favorites').insert({ wallet_address: connectedAddress, token_id: tokenId });
        }
    } catch (error) {
        console.error("Error toggling favorite", error);
        fetchFavorites(); // تراجع في حال الخطأ
    }
  };

  // جلب الأصول (Items)
  const fetchAssets = async () => {
    if (!targetAddress) return;
    setLoading(true);
    try {
      const balanceBigInt = await publicClient.readContract({
        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [targetAddress]
      });
      
      const count = Number(balanceBigInt);
      if (!count) { setMyAssets([]); setLoading(false); return; }

      const tokenIds = await Promise.all(
        Array.from({ length: count }, (_, i) => 
            publicClient.readContract({
                address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'tokenOfOwnerByIndex',
                args: [targetAddress, BigInt(i)]
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
              } catch (e) { console.warn(e); }
              
              return {
                id: tokenId.toString(),
                name: meta.name || `NNM #${tokenId.toString()}`,
                image: resolveIPFS(meta.image) || '',
                tier: meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founders',
                price: isListed ? listingPrice : (meta.attributes?.find((a: any) => a.trait_type === 'Price')?.value || '0'),
                isListed: isListed
              };
            } catch (error) { return null; }
          })
        );
        loaded.push(...(batchResults.filter(Boolean) as any[]));
        setMyAssets([...loaded]); 
      }
    } catch (error) { console.error("Fetch Assets Error:", error); } finally { setLoading(false); }
  };

  // جلب العروض (Offers)
  const fetchOffers = async () => {
      if (!targetAddress || !isOwner) return; 
      setLoading(true);
      try {
          let query = supabase.from('offers').select('*');
          const now = Math.floor(Date.now() / 1000);
          const myTokenIds = myAssets.map(a => a.id);
          const idsString = myTokenIds.length > 0 ? myTokenIds.join(',') : '';

          if (offerType === 'All') {
              if (idsString) {
                query = query.or(`bidder_address.ilike.${targetAddress},token_id.in.(${idsString})`).gt('expiration', now).neq('status', 'cancelled');
              } else {
                query = query.ilike('bidder_address', targetAddress).gt('expiration', now).neq('status', 'cancelled');
              }
          } else if (offerType === 'Received') {
              if (myTokenIds.length > 0) {
                  query = query.in('token_id', myTokenIds).gt('expiration', now).neq('status', 'cancelled');
              } else {
                  setOffersData([]); setLoading(false); return;
              }
          } else if (offerType === 'Made') {
              query = query.ilike('bidder_address', targetAddress).gt('expiration', now).neq('status', 'cancelled');
          } else if (offerType === 'Expired') {
              if (idsString) {
                query = query.or(`bidder_address.ilike.${targetAddress},token_id.in.(${idsString})`).lte('expiration', now);
              } else {
                query = query.ilike('bidder_address', targetAddress).lte('expiration', now);
              }
          }

          const { data, error } = await query;
          if (error) throw error;

          const enrichedOffers = await Promise.all((data || []).map(async (offer) => {
              const knownAsset = myAssets.find(a => a.id === offer.token_id.toString());
              let assetName = knownAsset ? knownAsset.name : `NNM #${offer.token_id}`;

              if (!knownAsset) {
                  try {
                      const tokenURI = await publicClient.readContract({
                          address: NFT_COLLECTION_ADDRESS as `0x${string}`,
                          abi: CONTRACT_ABI,
                          functionName: 'tokenURI',
                          args: [BigInt(offer.token_id)]
                      });
                      const metaRes = await fetch(resolveIPFS(tokenURI));
                      const meta = metaRes.ok ? await metaRes.json() : {};
                      if (meta.name) assetName = meta.name;
                  } catch (e) { }
              }

              return {
                  ...offer,
                  assetName: assetName,
                  formattedPrice: offer.price.toString(),
                  timeLeft: formatExpiration(offer.expiration)
              };
          }));

          if (offerSort === 'Newest') enrichedOffers.sort((a, b) => b.created_at?.localeCompare(a.created_at));
          if (offerSort === 'High Price') enrichedOffers.sort((a, b) => b.price - a.price);
          if (offerSort === 'Low Price') enrichedOffers.sort((a, b) => a.price - b.price);
          if (offerSort === 'Ending Soon') enrichedOffers.sort((a, b) => a.expiration - b.expiration);

          setOffersData(enrichedOffers);
      } catch (e) { console.error("Offers Error", e); } finally { setLoading(false); }
  };

  // جلب العناصر المنشأة (Created)
  const fetchCreated = async () => {
      if (!targetAddress) return;
      setLoading(true);
      try {
          const { data, error } = await supabase
            .from('activities')
            .select('token_id, created_at')
            .ilike('to_address', targetAddress) 
            .eq('activity_type', 'Mint');

          if (error) throw error;
          
          if (!data || data.length === 0) {
              setCreatedAssets([]);
              setLoading(false);
              return;
          }

          const dateMap: Record<string, string> = {};
          data.forEach((item: any) => { dateMap[item.token_id] = item.created_at; });

          const tokenIds = [...new Set(data.map(item => item.token_id))];
          const batches = chunk(tokenIds, 4); 
          const loadedCreated: any[] = [];

          for (const batch of batches) {
              const batchResults = await Promise.all(batch.map(async (tokenId: any) => {
                  try {
                      const tokenURI = await publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: CONTRACT_ABI, functionName: 'tokenURI', args: [BigInt(tokenId)] });
                      const metaRes = await fetch(resolveIPFS(tokenURI));
                      const meta = metaRes.ok ? await metaRes.json() : {};
                      return {
                          id: tokenId.toString(),
                          name: meta.name || `NNM #${tokenId.toString()}`,
                          image: resolveIPFS(meta.image) || '',
                          tier: meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founders',
                          price: meta.attributes?.find((a: any) => a.trait_type === 'Price')?.value || '0',
                          mintDate: dateMap[tokenId]
                      };
                  } catch { return null; }
              }));
              loadedCreated.push(...(batchResults.filter(Boolean) as any[]));
              setCreatedAssets([...loadedCreated]); 
          }
      } catch (e) { 
          console.error("Created Fetch Error:", e); 
      } finally { setLoading(false); }
  };

  // جلب النشاط (Activity)
  const fetchActivity = async () => {
      if (!targetAddress) return;
      setLoading(true);
      try {
          const { data: activityData, error: actError } = await supabase
            .from('activities')
            .select('*')
            .or(`from_address.ilike.${targetAddress},to_address.ilike.${targetAddress}`)
            .order('created_at', { ascending: false });

          if (actError) throw actError;

          const { data: offersData, error: offError } = await supabase
             .from('offers')
             .select('*')
             .ilike('bidder_address', targetAddress)
             .order('created_at', { ascending: false });

          if (offError) throw offError;

          const formattedActivities = (activityData || []).map((item: any) => ({
              type: item.activity_type,
              tokenId: item.token_id.toString(),
              price: item.price,
              from: item.from_address,
              to: item.to_address,
              date: item.created_at,
              rawDate: new Date(item.created_at).getTime()
          }));

          const formattedOffers = (offersData || []).map((item: any) => ({
              type: 'Offer',
              tokenId: item.token_id.toString(),
              price: item.price,
              from: item.bidder_address,
              to: 'Market',
              date: item.created_at,
              rawDate: new Date(item.created_at).getTime()
          }));

          const merged = [...formattedActivities, ...formattedOffers].sort((a, b) => b.rawDate - a.rawDate);
          setActivityData(merged);

      } catch (e) { 
          console.error("Activity Error", e); 
      } finally { setLoading(false); }
  };

  useEffect(() => { fetchAssets(); }, [targetAddress]);
  useEffect(() => { fetchFavorites(); }, [connectedAddress]);
  
  useEffect(() => { 
      if (activeSection === 'Offers' && isOwner) fetchOffers();
      if (activeSection === 'Created') fetchCreated();
      if (activeSection === 'Activity') fetchActivity();
  }, [activeSection, offerType, offerSort, myAssets, isOwner]);

  const copyToClipboard = () => {
    if (targetAddress) {
      navigator.clipboard.writeText(targetAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleViewMode = () => { setViewModeState((prev) => (prev + 1) % viewModes.length); };

  const totalAssetValue = myAssets.reduce((acc, curr) => acc + parseFloat(curr.price || 0), 0);
  const filteredAssets = myAssets.filter(asset => asset.name.toLowerCase().includes(searchQuery.toLowerCase()) && (selectedTier === 'ALL' || asset.tier.toUpperCase() === selectedTier));
  const listedAssets = myAssets.filter(asset => asset.isListed);
  const sortedListedAssets = sortOrder === 'newest' ? [...listedAssets].reverse() : listedAssets;
  const sortedCreatedAssets = sortOrder === 'newest' ? [...createdAssets].reverse() : createdAssets;

  if (!targetAddress) return null;

  return (
    <main style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      <div style={{ width: '100%', height: '180px', background: 'linear-gradient(180deg, #2b2b2b 0%, #1E1E1E 100%)', position: 'relative', borderBottom: '1px solid #2d2d2d' }}></div>

      <div className="container mx-auto px-3" style={{ marginTop: '-90px', position: 'relative', zIndex: 10 }}>
        
        <div className="d-flex flex-column gap-1 mb-2">
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid #1E1E1E', background: '#161b22', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                <div style={{ width: '100%', height: '100%', background: GOLD_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: '#1E1E1E' }}>
                    {targetAddress ? targetAddress.slice(2,4).toUpperCase() : ''}
                </div>
            </div>
            
            <div className="d-flex align-items-center gap-2">
                <span className="fw-normal" style={{ fontSize: '18px', fontFamily: 'monospace', color: GOLD_COLOR }}>
                    {targetAddress ? `${targetAddress.slice(0,6)}...${targetAddress.slice(-4)}` : ''}
                </span>
                <button onClick={copyToClipboard} className="btn p-0 border-0" style={{ color: '#8a939b' }}>
                    {isCopied ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-copy"></i>}
                </button>
            </div>

            <div className="d-flex gap-5 mt-2 px-2">
                {isOwner && (
                <div className="d-flex flex-column align-items-start">
                    <div style={{ color: '#8a939b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Balance</div>
                    <div className="text-white" style={{ fontSize: '15px', fontWeight: '600' }}>
                         <span style={{ fontSize: '13px', color: '#FFFFFF', marginRight: '4px' }}>POL</span>
                         {balanceData ? formatCompactNumber(parseFloat(balanceData.formatted)) : '0.00'}
                    </div>
                </div>
                )}
                <div className="d-flex flex-column align-items-start">
                    <div style={{ color: '#8a939b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Assets</div>
                    <div className="text-white" style={{ fontSize: '15px', fontWeight: '600' }}>{myAssets.length}</div>
                </div>
                {isOwner && (
                <div className="d-flex flex-column align-items-start">
                    <div style={{ color: '#8a939b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total value</div>
                    <div className="text-white" style={{ fontSize: '15px', fontWeight: '600' }}>
                        <span style={{ fontSize: '13px', color: '#FFFFFF', marginRight: '4px' }}>POL</span>
                        {formatCompactNumber(totalAssetValue)}
                    </div>
                </div>
                )}
            </div>
        </div>

        <div className="d-flex gap-4 mb-3 overflow-auto" style={{ borderBottom: 'none' }}>
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

        {activeSection === 'Items' && (
            <>
                <div className="row mb-4">
                    <div className="col-12 col-lg-6">
                        <div className="d-flex align-items-center gap-2 position-relative">
                            <div className="position-relative dropdown-container">
                                <button onClick={() => toggleDropdown('filter')} className="btn border border-secondary d-flex align-items-center justify-content-center" style={{ borderRadius: '8px', borderColor: '#333', width: '32px', height: '32px', padding: '0', backgroundColor: 'transparent' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/><path d="M7 12H17" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/><path d="M10 18H14" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/></svg>
                                </button>
                                {openDropdown === 'filter' && (
                                    <div className="position-absolute mt-2 p-2 rounded-3 shadow-lg" style={{ top: '100%', left: 0, width: '180px', backgroundColor: '#1E1E1E', border: '1px solid #333', zIndex: 100 }}>
                                        <div style={{ fontSize: '10px', color: '#8a939b', padding: '4px 8px', textTransform: 'uppercase' }}>Filter by Tier</div>
                                        {['ALL', 'IMMORTAL', 'ELITE', 'FOUNDERS'].map(tier => (
                                            <button key={tier} onClick={() => { setSelectedTier(tier); setOpenDropdown(null); }} className="btn w-100 text-start btn-sm text-white" style={{ backgroundColor: selectedTier === tier ? '#2d2d2d' : 'transparent', fontSize: '13px' }}>{tier}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="position-relative flex-grow-1">
                                <i className="bi bi-search position-absolute" style={{ top: '8px', left: '10px', fontSize: '14px', color: '#b0b0b0' }}></i>
                                <input type="search" placeholder="Search by name" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-control bg-transparent text-white border-secondary ps-5" style={{ borderRadius: '8px', borderColor: '#333', fontSize: '14px', height: '32px' }} />
                            </div>
                            <button onClick={toggleViewMode} className="btn border border-secondary d-flex align-items-center justify-content-center" style={{ borderRadius: '8px', borderColor: '#333', width: '32px', height: '32px', color: '#FFF', padding: 0, backgroundColor: 'transparent' }}>
                                {currentViewMode === 'grid' && <i className="bi bi-grid-fill" style={{ fontSize: '16px' }}></i>}
                                {currentViewMode === 'large' && <i className="bi bi-square-fill" style={{ fontSize: '16px' }}></i>}
                                {currentViewMode === 'list' && <i className="bi bi-list-ul" style={{ fontSize: '20px' }}></i>}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="pb-5">
                    {loading && myAssets.length === 0 ? <div className="text-center py-5"><div className="spinner-border text-secondary" role="status"></div></div> : (
                        <div className="row g-3">
                            {filteredAssets.map((asset) => (<AssetRenderer key={asset.id} item={asset} mode={currentViewMode} isFavorite={favoriteIds.has(asset.id)} onToggleFavorite={handleToggleFavorite} />))}
                            {filteredAssets.length === 0 && !loading && <div className="col-12 text-center py-5 text-secondary">No items found</div>}
                        </div>
                    )}
                </div>
            </>
        )}

        {activeSection === 'Listings' && (
            <div className="pb-5 mt-4">
                {loading ? <div className="text-center py-5"><div className="spinner-border text-secondary" role="status"></div></div> : listedAssets.length === 0 ? (
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ backgroundColor: 'transparent', color: '#fff' }}><thead><tr><th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '45%' }}>ASSET</th></tr></thead><tbody><tr><td style={{ backgroundColor: 'transparent', color: '#8a939b', textAlign: 'center', padding: '60px 0', borderBottom: '1px solid #2d2d2d', fontSize: '14px' }}>No active listings found</td></tr></tbody></table>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ backgroundColor: 'transparent', color: '#fff', borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead><tr>
                                <th onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')} style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '45%', cursor: 'pointer' }}>ASSET <i className={`bi ${sortOrder === 'newest' ? 'bi-caret-up-fill' : 'bi-caret-down-fill'} ms-2`} style={{ fontSize: '11px' }}></i></th>
                                <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '25%' }}>POL</th>
                                <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '20%' }}>Exp</th>
                                <th style={{ backgroundColor: 'transparent', borderBottom: '1px solid #2d2d2d', width: '10%' }}></th> 
                            </tr></thead>
                            <tbody>{sortedListedAssets.map((asset) => (
                                <tr key={asset.id} className="align-middle listing-row">
                                    <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontStyle: 'italic' }}>{asset.name}</td>
                                    <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontWeight: '700' }}>{asset.price}</td>
                                    <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontSize: '14px' }}>Active</td>
                                    <td style={{ backgroundColor: 'transparent', padding: '12px 20px 12px 0', borderBottom: '1px solid #2d2d2d', textAlign: 'right' }}><Link href={`/asset/${asset.id}`}><i className="bi bi-gear-fill text-white" style={{ cursor: 'pointer', fontSize: '16px' }}></i></Link></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </div>
        )}

        {activeSection === 'Offers' && (
            <div className="mt-4">
                {isOwner ? (
                <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="position-relative dropdown-container">
                        <button onClick={() => toggleDropdown('offerSort')} className="btn border border-secondary d-flex flex-column align-items-center justify-content-center gap-1" style={{ borderRadius: '8px', borderColor: '#333', width: '32px', height: '32px', padding: '0', backgroundColor: 'transparent' }}>
                            <div style={{ width: '16px', height: '2px', backgroundColor: '#FFF', borderRadius: '1px' }}></div><div style={{ width: '16px', height: '2px', backgroundColor: '#FFF', borderRadius: '1px' }}></div><div style={{ width: '16px', height: '2px', backgroundColor: '#FFF', borderRadius: '1px' }}></div>
                        </button>
                        {openDropdown === 'offerSort' && (
                            <div className="position-absolute mt-2 p-2 rounded-3 shadow-lg" style={{ top: '100%', left: 0, width: '180px', backgroundColor: '#1E1E1E', border: '1px solid #333', zIndex: 100 }}>
                                {['Newest', 'Ending Soon', 'High Price', 'Low Price'].map(sort => (<button key={sort} onClick={() => { setOfferSort(sort); setOpenDropdown(null); }} className="btn w-100 text-start btn-sm text-white" style={{ backgroundColor: offerSort === sort ? '#2d2d2d' : 'transparent', fontSize: '13px' }}>{sort}</button>))}
                            </div>
                        )}
                    </div>
                    <div className="position-relative dropdown-container">
                        <button onClick={() => toggleDropdown('offerType')} className="btn d-flex align-items-center gap-2 px-3" style={{ border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px', height: '32px', backgroundColor: 'transparent' }}>{offerType} Offers <i className="bi bi-chevron-down" style={{ fontSize: '10px' }}></i></button>
                        {openDropdown === 'offerType' && (
                            <div className="position-absolute mt-2 p-2 rounded-3 shadow-lg" style={{ top: '100%', right: 0, width: '160px', backgroundColor: '#1E1E1E', border: '1px solid #333', zIndex: 100 }}>
                                {['All', 'Received', 'Made', 'Expired'].map(type => (<button key={type} onClick={() => { setOfferType(type); setOpenDropdown(null); }} className="btn w-100 text-start btn-sm text-white" style={{ backgroundColor: offerType === type ? '#2d2d2d' : 'transparent', fontSize: '13px' }}>{type} Offers</button>))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table mb-0" style={{ backgroundColor: 'transparent', color: '#fff', borderCollapse: 'separate', borderSpacing: '0' }}>
                        <thead><tr>
                            <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '35%' }}>ASSET</th>
                            <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '20%' }}>WPOL</th>
                            <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '25%' }}>{offerType === 'Made' ? 'TO' : 'FROM'}</th>
                            <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '15%' }}>EXP</th>
                            <th style={{ backgroundColor: 'transparent', borderBottom: '1px solid #2d2d2d', width: '5%', padding: '0 20px 10px 0' }}></th> 
                        </tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan={5} style={{ backgroundColor: 'transparent', color: '#8a939b', textAlign: 'center', padding: '60px 0', borderBottom: '1px solid #2d2d2d' }}><div className="spinner-border text-secondary" role="status"></div></td></tr> : offersData.length === 0 ? <tr><td colSpan={5} style={{ backgroundColor: 'transparent', color: '#8a939b', textAlign: 'center', padding: '60px 0', borderBottom: '1px solid #2d2d2d', fontSize: '14px' }}>No offers found</td></tr> : (
                                offersData.map((offer) => (
                                    <tr key={offer.id} className="align-middle listing-row">
                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontStyle: 'italic' }}>{offer.assetName}</td>
                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontWeight: '700' }}>{parseFloat(offer.formattedPrice).toFixed(2)}</td>
                                        <td style={{ backgroundColor: 'transparent', color: GOLD_COLOR, padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontSize: '13px' }}>{offerType === 'Made' ? 'Owner' : (offer.bidder_address ? <Link href={`/profile/${offer.bidder_address}`} className="text-decoration-none"><span style={{ color: GOLD_COLOR, cursor: 'pointer' }}>{`${offer.bidder_address.slice(0,4)}...${offer.bidder_address.slice(-4)}`}</span></Link> : '-')}</td>
                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontSize: '13px' }}>{offer.timeLeft}</td>
                                        <td style={{ backgroundColor: 'transparent', padding: '12px 20px 12px 0', borderBottom: '1px solid #2d2d2d', textAlign: 'right' }}><Link href={`/asset/${offer.token_id}`}><i className="bi bi-gear-fill text-white" style={{ cursor: 'pointer', fontSize: '16px' }}></i></Link></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                </>
                ) : (
                    <div className="text-center py-5 text-secondary">
                        
                    </div>
                )}
            </div>
        )}

        {activeSection === 'Created' && (
            <>
                <div className="row mb-4">
                    <div className="col-12 col-lg-6">
                        <div className="d-flex align-items-center gap-2 position-relative">
                            <div className="d-flex align-items-center gap-3">
                                <span className="text-white fw-bold" style={{ fontSize: '15px' }}>{createdAssets.length} Assets</span>
                                <div className="position-relative dropdown-container">
                                    <button onClick={() => toggleDropdown('createdSort')} className="btn d-flex align-items-center gap-2" style={{ border: 'none', background: 'transparent', color: '#fff', fontSize: '14px' }}>
                                        Sort by <i className="bi bi-chevron-down" style={{ fontSize: '11px' }}></i>
                                    </button>
                                    {openDropdown === 'createdSort' && (
                                        <div className="position-absolute mt-2 p-2 rounded-3 shadow-lg" style={{ top: '100%', left: 0, width: '180px', backgroundColor: '#1E1E1E', border: '1px solid #333', zIndex: 100 }}>
                                            {['Newest', 'Oldest'].map(sort => (<button key={sort} onClick={() => { setSortOrder(sort === 'Newest' ? 'newest' : 'oldest'); setOpenDropdown(null); }} className="btn w-100 text-start btn-sm text-white" style={{ backgroundColor: 'transparent', fontSize: '13px' }}>Minted {sort}</button>))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="ms-auto">
                                <button onClick={toggleViewMode} className="btn border border-secondary d-flex align-items-center justify-content-center" style={{ borderRadius: '8px', borderColor: '#333', width: '32px', height: '32px', color: '#FFF', padding: 0, backgroundColor: 'transparent' }}>
                                    {currentViewMode === 'grid' && <i className="bi bi-grid-fill" style={{ fontSize: '16px' }}></i>}
                                    {currentViewMode === 'large' && <i className="bi bi-square-fill" style={{ fontSize: '16px' }}></i>}
                                    {currentViewMode === 'list' && <i className="bi bi-list-ul" style={{ fontSize: '20px' }}></i>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pb-5">
                    {loading && createdAssets.length === 0 ? <div className="text-center py-5"><div className="spinner-border text-secondary" role="status"></div></div> : createdAssets.length === 0 ? (
                        <div className="text-center py-5 text-secondary">No created assets found</div>
                    ) : (
                        <div className="row g-3">
                            {sortedCreatedAssets.map((asset) => (<AssetRenderer key={asset.id} item={asset} mode={currentViewMode} isFavorite={favoriteIds.has(asset.id)} onToggleFavorite={handleToggleFavorite} />))}
                        </div>
                    )}
                </div>
            </>
        )}

        {activeSection === 'Activity' && (
            <div className="mt-4 pb-5">
                <div className="table-responsive">
                    <table className="table mb-0" style={{ backgroundColor: 'transparent', color: '#fff', borderCollapse: 'separate', borderSpacing: '0', fontSize: '11px' }}>
                        <thead><tr>
                            <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '12%' }}>Event</th>
                            <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '18%' }}>W/POL</th>
                            <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '25%' }}>From</th>
                            <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '25%' }}>To</th>
                            <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '10%', textAlign: 'right' }}>Date</th>
                        </tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan={5} style={{ backgroundColor: 'transparent', color: '#8a939b', textAlign: 'center', padding: '60px 0', borderBottom: '1px solid #2d2d2d' }}><div className="spinner-border text-secondary" role="status"></div></td></tr> : activityData.length === 0 ? (
                                <tr><td colSpan={5} style={{ backgroundColor: 'transparent', color: '#8a939b', textAlign: 'center', padding: '60px 0', borderBottom: '1px solid #2d2d2d', fontSize: '14px' }}>No recent activity found</td></tr>
                            ) : (
                                activityData.map((activity, index) => (
                                    <tr key={index} className="align-middle listing-row" style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/asset/${activity.tokenId}`}>
                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontSize: '11px' }}>
                                            <span>{activity.type}</span>
                                        </td>
                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontWeight: '600' }}>
                                            {activity.price && !isNaN(parseFloat(activity.price)) ? formatCompactNumber(parseFloat(activity.price)) : '-'}
                                        </td>
                                        <td style={{ backgroundColor: 'transparent', color: GOLD_COLOR, padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontSize: '12px' }}>
                                            {activity.from === '0x0000000000000000000000000000000000000000' ? 'NullAddress' : (
                                                <a href={`https://polygonscan.com/address/${activity.from}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: GOLD_COLOR, textDecoration: 'none' }}>
                                                    {activity.from.toLowerCase() === connectedAddress?.toLowerCase() ? 'You' : `${activity.from.slice(0,4)}...${activity.from.slice(-4)}`}
                                                </a>
                                            )}
                                        </td>
                                        <td style={{ backgroundColor: 'transparent', color: GOLD_COLOR, padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontSize: '12px' }}>
                                            {activity.to === 'Market' ? (
                                                <a href={`https://polygonscan.com/address/${MARKETPLACE_ADDRESS}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: GOLD_COLOR, textDecoration: 'none' }}>Market</a>
                                            ) : (
                                                <a href={`https://polygonscan.com/address/${activity.to}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: GOLD_COLOR, textDecoration: 'none' }}>
                                                    {activity.to === 'Owner' ? 'Owner' : (activity.to.toLowerCase() === connectedAddress?.toLowerCase() ? 'You' : `${activity.to.slice(0,4)}...${activity.to.slice(-4)}`)}
                                                </a>
                                            )}
                                        </td>
                                        <td style={{ backgroundColor: 'transparent', color: '#8a939b', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontSize: '11px', textAlign: 'right' }}>{formatShortTime(activity.date)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </div>
      <style jsx global>{`
        .listing-row:hover td { background-color: rgba(255, 255, 255, 0.03) !important; }
        table, th, td, tr, .table { background-color: transparent !important; }
      `}</style>
    </main>
  );
}

// مكون البطاقة الذي يحتوي على منطق العرض وزر القلب
const AssetRenderer = ({ item, mode, isFavorite, onToggleFavorite }: { item: any, mode: string, isFavorite: boolean, onToggleFavorite: (e: React.MouseEvent, id: string) => void }) => {
    const colClass = mode === 'list' ? 'col-12' : mode === 'large' ? 'col-12 col-md-6 col-lg-5 mx-auto' : 'col-6 col-md-4 col-lg-3';
    
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    if (mode === 'list') {
        return (
            <div className={colClass}>
                <Link href={`/asset/${item.id}`} className="text-decoration-none">
                    <div className="d-flex align-items-center gap-3 p-2 rounded-3 position-relative" style={{ backgroundColor: '#161b22', border: '1px solid #2d2d2d', transition: '0.2s' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                             {item.image ? (<img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />) : (<div style={{ width: '100%', height: '100%', background: '#333' }}></div>)}
                        </div>
                        <div className="flex-grow-1">
                            <div className="text-white" style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</div>
                            <div className="text-white" style={{ fontSize: '12px', fontWeight: '500' }}>NNM Registry</div>
                        </div>
                        <div className="text-end pe-4">
                             <div className="text-white" style={{ fontSize: '13px', fontWeight: '600' }}>{item.isListed ? `${item.price} POL` : <span style={{ color: '#cccccc' }}>Not listed</span>}</div>
                        </div>
                        {/* زر القلب للقائمة */}
                        <button onClick={(e) => onToggleFavorite(e, item.id)} className="btn position-absolute end-0 me-2 p-0 border-0 bg-transparent" style={{ zIndex: 10 }}>
                             <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`} style={{ color: isFavorite ? '#FFFFFF' : '#8a939b', fontSize: '16px' }}></i>
                        </button>
                    </div>
                </Link>
            </div>
        );
    }
    // الوضع Grid أو Large (نفس الهيكلية)
    return (
      <div className={colClass}>
          <div className="h-100 d-flex flex-column" style={{ backgroundColor: '#161b22', borderRadius: '10px', border: '1px solid #2d2d2d', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}>
              <Link href={`/asset/${item.id}`} className="text-decoration-none h-100 d-flex flex-column">
                  <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative', overflow: 'hidden' }}>
                       {item.image ? (<img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="asset-img" />) : (<div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="bi bi-image text-secondary"></i></div>)}
                       
                       {/* زر القلب للشبكة والصور الكبيرة - في الزاوية العلوية اليمنى */}
                       <button onClick={(e) => onToggleFavorite(e, item.id)} className="btn position-absolute top-0 end-0 m-2 p-0 border-0 bg-transparent" style={{ zIndex: 10 }}>
                            <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`} style={{ color: isFavorite ? '#FFFFFF' : 'white', fontSize: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}></i>
                       </button>
                  </div>
                  <div className="p-3 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                          <div className="text-white fw-bold text-truncate" style={{ fontSize: '14px', maxWidth: '80%' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: '#cccccc' }}>#{item.id}</div>
                      </div>
                      <div className="text-white mb-2" style={{ fontSize: '13px', fontWeight: '500' }}>NNM Registry</div>
                      {item.mintDate && <div className="text-white mb-2" style={{ fontSize: '11px', color: '#888' }}>Minted: {formatDate(item.mintDate)}</div>}
                      <div className="mt-auto">
                           <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{item.isListed ? `${item.price} POL` : <span className="fw-normal" style={{ fontSize: '12px', color: '#cccccc' }}>Last Sale</span>}</div>
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
