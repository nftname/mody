'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useBalance, usePublicClient } from "wagmi";
import { parseAbi, formatEther } from 'viem';
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

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const publicClient = usePublicClient(); // Use the global shared client
  
  // --- States ---
  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [createdAssets, setCreatedAssets] = useState<any[]>([]);
  const [offersData, setOffersData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  
  // --- Pagination States ---
  const ITEMS_PER_PAGE = 20;
  const [pageItems, setPageItems] = useState(1);
  const [pageListings, setPageListings] = useState(1);
  const [pageOffers, setPageOffers] = useState(1);
  const [pageCreated, setPageCreated] = useState(1);
  const [pageActivity, setPageActivity] = useState(1); 
  
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('Items');

    // --- Conviction & Audit States ---
    const [convictionLogs, setConvictionLogs] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [walletBalances, setWalletBalances] = useState({ wnnm: 0, nnm: 0 });
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimStep, setClaimStep] = useState<'audit' | 'confirm' | 'processing' | 'success' | 'error'>('audit');
    const [auditDetails, setAuditDetails] = useState({ totalEarned: 0, totalPaid: 0, claimable: 0 });
    const [claimTx, setClaimTx] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);
    const [viewModeState, setViewModeState] = useState(0); 
  const viewModes = ['grid', 'large', 'list'];
  const currentViewMode = viewModes[viewModeState];
  const [isCopied, setIsCopied] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL'); 
  const [filterFavorites, setFilterFavorites] = useState(false);
  
  // Dropdown States
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [offerType, setOfferType] = useState('All'); 
  const [offerSort, setOfferSort] = useState('Newest');   
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // --- Click Outside Handler ---
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

  // --- Helpers ---
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
      const absNum = Math.abs(num);
      
      // CASE 1: Micro-transactions (Gas fees, etc.) -> Show exact precision
      // If number is small (between 0 and 1), show up to 4 decimal places.
      if (absNum > 0 && absNum < 1) {
          return new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 4 
          }).format(num);
      }

      // CASE 2: Standard/Large numbers -> Use compact notation (1K, 1M)
      // Increased fraction digits to 2 to avoid rounding errors like 1.5K showing as 2K
      return Intl.NumberFormat('en-US', {
          notation: "compact",
          maximumFractionDigits: 2
      }).format(num);
  };

  // Helper: Static fee/currency mapping for activity values
  const getActivityValue = (type: string, price: any) => {
      const value = parseFloat(price || '0');
      if (type === 'List') return { label: '- 0.01', currency: 'POL' };
      if (type === 'Mint') return { label: `-${formatCompactNumber(value)}`, currency: 'POL' };
      if (type === 'Sale') return { label: `+${formatCompactNumber(value)}`, currency: 'POL' };
      if (type === 'Offer') return { label: formatCompactNumber(value), currency: 'WPOL' };
      if (type === 'Payout') return { label: `+${formatCompactNumber(value)}`, currency: 'POL' };
      return { label: formatCompactNumber(value), currency: 'POL' };
  };

  // --- Favorites Logic ---
  const fetchFavorites = async () => {
    if (!address) return;
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('token_id')
            .eq('wallet_address', address);
        
        if (error) throw error;
        if (data) {
            setFavoriteIds(new Set(data.map((item: any) => item.token_id)));
        }
    } catch (e) { console.error("Error fetching favorites", e); }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, tokenId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!address) return;

    const newFavs = new Set(favoriteIds);
    const isFav = newFavs.has(tokenId);

    if (isFav) newFavs.delete(tokenId);
    else newFavs.add(tokenId);

    setFavoriteIds(newFavs);

    try {
        if (isFav) {
            await supabase.from('favorites').delete().match({ wallet_address: address, token_id: tokenId });
        } else {
            await supabase.from('favorites').insert({ wallet_address: address, token_id: tokenId });
        }
    } catch (error) {
        console.error("Error toggling favorite", error);
        fetchFavorites(); // Revert
    }
  };

  // --- 1. ITEMS ---
  const fetchAssets = async () => {
    if (!address || !publicClient) return;
    setLoading(true);
    try {
      const balanceBigInt = await publicClient.readContract({
        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [address]
      });
      
      const count = Number(balanceBigInt);
      if (!count) { setMyAssets([]); setLoading(false); return; }

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

  // --- 2. OFFERS ---
  const fetchOffers = async () => {
      if (!address || !publicClient) return;
      setLoading(true);
      try {
          let query = supabase.from('offers').select('*');
          const now = Math.floor(Date.now() / 1000);
          const myTokenIds = myAssets.map(a => a.id);
          const idsString = myTokenIds.length > 0 ? myTokenIds.join(',') : '';

          if (offerType === 'All') {
              if (idsString) {
                query = query.or(`bidder_address.ilike.${address},token_id.in.(${idsString})`).gt('expiration', now).neq('status', 'cancelled');
              } else {
                query = query.ilike('bidder_address', address).gt('expiration', now).neq('status', 'cancelled');
              }
          } else if (offerType === 'Received') {
              if (myTokenIds.length > 0) {
                  query = query.in('token_id', myTokenIds).gt('expiration', now).neq('status', 'cancelled');
              } else {
                  setOffersData([]); setLoading(false); return;
              }
          } else if (offerType === 'Made') {
              query = query.ilike('bidder_address', address).gt('expiration', now).neq('status', 'cancelled');
          } else if (offerType === 'Expired') {
              if (idsString) {
                query = query.or(`bidder_address.ilike.${address},token_id.in.(${idsString})`).lte('expiration', now);
              } else {
                query = query.ilike('bidder_address', address).lte('expiration', now);
              }
          }

          const { data, error } = await query;
          if (error) throw error;

          const enrichedOffers = await Promise.all((data || []).map(async (offer: any) => {
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

  // --- 3. CREATED ---
  const fetchCreated = async () => {
      if (!address) return; // Removed publicClient check to allow DB-only fetch if needed
      setLoading(true);
      try {
          // 1. Get ALL Mint actions by this user (Robust Query)
          const { data, error } = await supabase
            .from('activities')
            .select('*') // Select all fields to have backup metadata
            .eq('activity_type', 'Mint')
            .or(`to_address.ilike.${address},from_address.ilike.${address}`); // Check BOTH sides

          if (error) throw error;
          
          if (!data || data.length === 0) {
              setCreatedAssets([]);
              setLoading(false);
              return;
          }

          // 2. Remove duplicates (in case of multiple logs for same ID)
          const uniqueItems = Array.from(new Map(data.map((item: any) => [item.token_id, item])).values());

          // 3. Resolve Metadata (Try Blockchain -> Fallback to DB/Placeholder)
          const loadedAssets = await Promise.all(uniqueItems.map(async (item: any) => {
              try {
                  // A. Try fetching live data from contract
                  if (publicClient) {
                      const tokenURI = await publicClient.readContract({ 
                          address: NFT_COLLECTION_ADDRESS as `0x${string}`, 
                          abi: CONTRACT_ABI, 
                          functionName: 'tokenURI', 
                          args: [BigInt(item.token_id)] 
                      });
                      const metaRes = await fetch(resolveIPFS(tokenURI));
                      if (metaRes.ok) {
                          const meta = await metaRes.json();
                          return {
                              id: item.token_id.toString(),
                              name: meta.name || `NNM #${item.token_id}`,
                              image: resolveIPFS(meta.image) || '',
                              tier: meta.attributes?.find((a: any) => a.trait_type === 'Tier')?.value?.toLowerCase() || 'founders',
                              price: item.price, // Use historical price from DB
                              mintDate: item.created_at
                          };
                      }
                  }
                  throw new Error("Contract fetch failed");
              } catch (e) {
                  // B. Fallback: If contract read fails (e.g. old contract item), return basic DB info
                  return {
                      id: item.token_id.toString(),
                      name: `NNM #${item.token_id}`, // Fallback name
                      image: '', // Placeholder or specific fallback image
                      tier: 'archived', // Indicate it's not on current contract
                      price: item.price,
                      mintDate: item.created_at
                  };
              }
          }));

          // 4. Update State
          setCreatedAssets(loadedAssets);
          
      } catch (e) { 
          console.error("Created Fetch Error:", e); 
      } finally { setLoading(false); }
  };

  // --- 4. ACTIVITY ---
  const fetchActivity = async () => {
      if (!address) return;
      setLoading(true);
      try {
          // History
          const { data: activityData, error: actError } = await supabase
            .from('activities')
            .select('*')
            .or(`from_address.ilike.${address},to_address.ilike.${address}`)
            .order('created_at', { ascending: false });

          if (actError) throw actError;

          // Offers
          const { data: offersData, error: offError } = await supabase
             .from('offers')
             .select('*')
             .ilike('bidder_address', address)
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

  // --- 5. CONVICTION & AUDIT ---
  const fetchConvictionData = async () => {
      if (!address) return;
      setLoading(true);
      try {
          // 1. Fetch History (The Source of Truth)
          // Using ILIKE to ensure we catch ALL casing variations
          const { data: mints } = await supabase.from('activities').select('*').match({ activity_type: 'Mint' }).ilike('to_address', address);
          const { data: sales } = await supabase.from('activities').select('*').match({ activity_type: 'Sale' }).ilike('to_address', address);
          const { data: votes } = await supabase.from('conviction_votes').select('*').ilike('supporter_address', address);

          // 2. Calculate Real Balance locally with NEW Multipliers
          const earned = ((mints?.length || 0) * 300) + ((sales?.length || 0) * 100);
          const spent = (votes?.length || 0) * 100; // Deduct 100 WNNM per vote
          let finalWNNM = earned - spent;
          if (finalWNNM < 0) finalWNNM = 0;

          // 3. CRITICAL: Force-Sync this calculated balance to the DB
          // This ensures the API sees the funds when the user clicks "Give Conviction"
          const { data: wallet } = await supabase.from('nnm_wallets').select('nnm_balance').eq('wallet_address', address).maybeSingle();
          
          await supabase.from('nnm_wallets').upsert({
              wallet_address: address,
              wnnm_balance: finalWNNM, // <--- SYNC HERE
              // Preserve existing NNM balance or default to 0
              nnm_balance: wallet ? wallet.nnm_balance : 0, 
              updated_at: new Date().toISOString()
          }, { onConflict: 'wallet_address' });

          // 4. Update UI State
          setWalletBalances({ 
              wnnm: finalWNNM, 
              nnm: wallet ? parseFloat(wallet.nnm_balance) : 0 
          });

          // 5. Set Logs - Updated to reflect NEW multipliers
          const historyLogs = [
              ...(mints?.map((m: any) => ({ type: 'Mint Reward', amount: 300, currency: 'WNNM', date: m.created_at })) || []),
              ...(sales?.map((s: any) => ({ type: 'Market Reward', amount: 100, currency: 'WNNM', date: s.created_at })) || []),
              ...(votes?.map((v: any) => ({ type: 'Support Given', amount: -100, currency: 'WNNM', date: v.created_at })) || [])
          ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setConvictionLogs(historyLogs);

      } catch (e) { console.error("Sync Error:", e); } 
      finally { setLoading(false); }
  };

  const handleSmartClaim = async () => {
      setShowClaimModal(true);
      setClaimStep('audit');
      
      // Simulate auditing delay, then move to confirm step
      setTimeout(() => {
          setAuditDetails({ totalEarned: 0, totalPaid: 0, claimable: walletBalances.nnm });
          setClaimStep('confirm');
      }, 1500);
  };

  const confirmClaim = async () => {
        if (auditDetails.claimable <= 0) return;
        
        // 1. Optimistic UI (Instant Feedback)
        setShowClaimModal(false);
        const amountToClaim = auditDetails.claimable;
        
        // Zero out visually immediately
        setWalletBalances(prev => ({ ...prev, nnm: 0 })); 
        setIsTransferring(true); 
        
        try {
            // 2. Direct API Call
            const res = await fetch('/api/nnm/claim', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ userWallet: address, amountNNM: amountToClaim })
            });
            
            const data = await res.json();
            
            if (data.success) {
                await fetchActivity();
                setIsTransferring(false); 
                // Optionally verify success step here if needed
            } else {
                // [DEBUG] Show the exact error reason from the server
                alert(`❌ Server Error: ${data.error}`); 
                console.error("Request Failed:", data.error);
                
                // Rollback UI
                setWalletBalances(prev => ({ ...prev, nnm: amountToClaim })); 
                setIsTransferring(false);
            }
        } catch (e: any) { 
            // [DEBUG] Show connection error
            alert(`❌ Connection Error: ${e.message}`);
            console.error("Connection Error", e);
            
            // Rollback UI
            setWalletBalances(prev => ({ ...prev, nnm: amountToClaim })); 
            setIsTransferring(false);
        }
    };

  useEffect(() => { 
      if (isConnected) {
          fetchAssets();
          fetchFavorites();
      } 
  }, [address, isConnected]);
  
  useEffect(() => { 
      if (activeSection === 'Offers') fetchOffers();
      if (activeSection === 'Created') fetchCreated();
      if (activeSection === 'Activity') fetchActivity();
      if (activeSection === 'Conviction') fetchConvictionData();
  }, [activeSection, offerType, offerSort, myAssets]);

  // Effect: Check persistence on load (Robust against race conditions)
  useEffect(() => {
      // CRITICAL: Do not reset flags while data is still loading/fetching
      if (loading) return;

      const isPending = localStorage.getItem(`nnm_claim_pending_${address}`);
      
      // Logic: Flag exists AND Balance > 0 => Keep showing "In Progress"
      if (isPending && walletBalances.nnm > 0) {
          setIsTransferring(true);
      } 
      // Logic: If balance hits 0 (confirmed by DB) => Transaction Done => Clear flag
      else if (!loading && walletBalances.nnm === 0) {
          localStorage.removeItem(`nnm_claim_pending_${address}`);
          setIsTransferring(false);
      }
  }, [address, walletBalances.nnm, loading]);
 // --- ADMIN CONFIG ---
  const ADMIN_WALLET = (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || "").toLowerCase();
  const isAdmin = address ? address.toLowerCase() === ADMIN_WALLET : false;

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleViewMode = () => { setViewModeState((prev) => (prev + 1) % viewModes.length); };

  const totalAssetValue = myAssets.reduce((acc, curr) => acc + parseFloat(curr.price || 0), 0);
  
  // Updated Filter Logic
  const filteredAssets = myAssets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedTier === 'FAVORITES') {
          return matchesSearch && favoriteIds.has(asset.id);
      }
      const matchesTier = selectedTier === 'ALL' || asset.tier.toUpperCase() === selectedTier;
      return matchesSearch && matchesTier;
  });

  const listedAssets = myAssets.filter(asset => asset.isListed);
  const sortedListedAssets = sortOrder === 'newest' ? [...listedAssets].reverse() : listedAssets;
  const sortedCreatedAssets = sortOrder === 'newest' ? [...createdAssets].reverse() : createdAssets;

  // --- Pagination Helper Component ---
  const PaginationFooter = ({ currentPage, totalCount, onPageChange }: any) => {
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
      if (totalPages <= 1) return null;

      return (
          <div className="d-flex justify-content-between align-items-center mt-4 px-2" style={{ gap: '10px' }}>
              <button 
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-sm"
                  style={{ border: '1px solid #2d2d2d', backgroundColor: currentPage === 1 ? '#0d0d0d' : '#161b22', color: '#fff' }}
              >
                  <i className="bi bi-chevron-left"></i>
              </button>
              <span style={{ color: '#fff', fontSize: '13px' }}>Page {currentPage} of {totalPages}</span>
              <button 
                  onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-sm"
                  style={{ border: '1px solid #2d2d2d', backgroundColor: currentPage === totalPages ? '#0d0d0d' : '#161b22', color: '#fff' }}
              >
                  <i className="bi bi-chevron-right"></i>
              </button>
          </div>
      );
  };

  // --- Apply Pagination Slicing ---
  const paginatedItems = filteredAssets.slice((pageItems - 1) * ITEMS_PER_PAGE, pageItems * ITEMS_PER_PAGE);
  const paginatedListings = sortedListedAssets.slice((pageListings - 1) * ITEMS_PER_PAGE, pageListings * ITEMS_PER_PAGE);
  const paginatedOffers = offersData.slice((pageOffers - 1) * ITEMS_PER_PAGE, pageOffers * ITEMS_PER_PAGE);
  const paginatedCreated = sortedCreatedAssets.slice((pageCreated - 1) * ITEMS_PER_PAGE, pageCreated * ITEMS_PER_PAGE);
  const paginatedActivity = activityData.slice((pageActivity - 1) * ITEMS_PER_PAGE, pageActivity * ITEMS_PER_PAGE);

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
      
      <div style={{ width: '100%', height: '180px', background: 'linear-gradient(180deg, #2b2b2b 0%, #1E1E1E 100%)', position: 'relative', borderBottom: '1px solid #2d2d2d' }}></div>

      <div className="container mx-auto px-3" style={{ marginTop: '-90px', position: 'relative', zIndex: 10 }}>
        
        {/* Profile Header */}
        <div className="d-flex flex-column gap-1 mb-2">
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid #1E1E1E', background: '#161b22', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                <div style={{ width: '100%', height: '100%', background: GOLD_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: '#1E1E1E' }}>
                    {address ? address.slice(2,4).toUpperCase() : ''}
                </div>
            </div>
            
            <div className="d-flex align-items-center gap-2">
                <Link href={`/profile/${address}`} className="text-decoration-none">
                    <span className="fw-normal" style={{ fontSize: '18px', fontFamily: 'monospace', color: GOLD_COLOR, cursor: 'pointer' }}>
                        {address ? `${address.slice(0,6)}...${address.slice(-4)}` : ''}
                    </span>
                </Link>
                <button onClick={copyToClipboard} className="btn p-0 border-0" style={{ color: '#8a939b' }}>
                    {isCopied ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-copy"></i>}
                </button>   {/* --- SECRET ADMIN BUTTON --- */}
                {isAdmin && (
                    <div className="d-flex align-items-center gap-2 ms-3">
                        {/* Existing Admin Control Button */}
                        <Link href="/admin" className="text-decoration-none">
                            <div 
                                className="d-flex align-items-center justify-content-center" 
                                style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    background: 'rgba(252, 213, 53, 0.1)', 
                                    border: '1px solid #FCD535', 
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: '0.2s'
                                }}
                                title="Control Unit"
                            >
                                <i className="bi bi-shield-lock-fill" style={{ fontSize: '14px', color: '#FCD535' }}></i>
                            </div>
                        </Link>

                        {/* NEW Market Monitor Button */}
                        <Link href="/admin/scanner" className="text-decoration-none">
                            <div 
                                className="d-flex align-items-center justify-content-center" 
                                style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    background: 'linear-gradient(135deg, #004d40 0%, #002b36 100%)', 
                                    border: '1px solid #004d40', 
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                                }}
                                title="Market Monitor"
                            >
                                <i className="bi bi-activity" style={{ fontSize: '14px', color: '#4db6ac' }}></i>
                            </div>
                        </Link>
                    </div>
                )}

            </div>

            <div className="d-flex gap-5 mt-2 px-2">
                <div className="d-flex flex-column align-items-start">
                    <div style={{ color: '#8a939b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Balance</div>
                    <div className="text-white" style={{ fontSize: '15px', fontWeight: '600' }}>
                         <span style={{ fontSize: '13px', color: '#FFFFFF', marginRight: '4px' }}>POL</span>
                         {balanceData ? formatCompactNumber(parseFloat(balanceData.formatted)) : '0.00'}
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
                        {formatCompactNumber(totalAssetValue)}
                    </div>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-4 mb-3 overflow-auto" style={{ borderBottom: 'none' }}>
            {['Items', 'Listings', 'Offers', 'Created', 'Activity', 'Conviction'].map((tab) => (
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

        {/* --- 1. ITEMS --- */}
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
                                        <div style={{ fontSize: '10px', color: '#8a939b', padding: '4px 8px', textTransform: 'uppercase' }}>Filter by Category</div>
                                        {/* Updated Filter Options with Favorites at the end */}
                                        {['ALL', 'IMMORTAL', 'ELITE', 'FOUNDERS', 'FAVORITES'].map(tier => (
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
                        <>
                            <div className="row g-3">
                                {paginatedItems.map((asset) => (<AssetRenderer key={asset.id} item={asset} mode={currentViewMode} isFavorite={favoriteIds.has(asset.id)} onToggleFavorite={handleToggleFavorite} />))}
                                {filteredAssets.length === 0 && !loading && <div className="col-12 text-center py-5 text-secondary">No items found</div>}
                            </div>
                            <PaginationFooter currentPage={pageItems} totalCount={filteredAssets.length} onPageChange={setPageItems} />
                        </>
                    )}
                </div>
            </>
        )}

        {/* --- 2. LISTINGS --- */}
        {activeSection === 'Listings' && (
            <div className="pb-5 mt-4">
                {loading ? <div className="text-center py-5"><div className="spinner-border text-secondary" role="status"></div></div> : listedAssets.length === 0 ? (
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ backgroundColor: 'transparent', color: '#fff' }}><thead><tr><th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '45%' }}>ASSET</th></tr></thead><tbody><tr><td style={{ backgroundColor: 'transparent', color: '#8a939b', textAlign: 'center', padding: '60px 0', borderBottom: '1px solid #2d2d2d', fontSize: '14px' }}>No active listings found</td></tr></tbody></table>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table mb-0" style={{ backgroundColor: 'transparent', color: '#fff', borderCollapse: 'separate', borderSpacing: '0' }}>
                                <thead><tr>
                                    <th onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')} style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '45%', cursor: 'pointer' }}>ASSET <i className={`bi ${sortOrder === 'newest' ? 'bi-caret-up-fill' : 'bi-caret-down-fill'} ms-2`} style={{ fontSize: '11px' }}></i></th>
                                    <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '25%' }}>POL</th>
                                    <th style={{ backgroundColor: 'transparent', color: '#8a939b', fontWeight: 'normal', fontSize: '13px', borderBottom: '1px solid #2d2d2d', padding: '0 0 10px 0', width: '20%' }}>Exp</th>
                                    <th style={{ backgroundColor: 'transparent', borderBottom: '1px solid #2d2d2d', width: '10%' }}></th> 
                                </tr></thead>
                                <tbody>{paginatedListings.map((asset) => (
                                    <tr key={asset.id} className="align-middle listing-row">
                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontStyle: 'italic' }}>{asset.name}</td>
                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontWeight: '700' }}>{formatCompactNumber(parseFloat(asset.price))}</td>
                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontSize: '14px' }}>Active</td>
                                        <td style={{ backgroundColor: 'transparent', padding: '12px 20px 12px 0', borderBottom: '1px solid #2d2d2d', textAlign: 'right' }}><Link href={`/asset/${asset.id}`}><i className="bi bi-gear-fill text-white" style={{ cursor: 'pointer', fontSize: '16px' }}></i></Link></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                        <PaginationFooter currentPage={pageListings} totalCount={sortedListedAssets.length} onPageChange={setPageListings} />
                    </>
                )}
            </div>
        )}

        {/* --- 3. OFFERS --- */}
        {activeSection === 'Offers' && (
            <div className="mt-4">
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
                                paginatedOffers.map((offer) => (
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
                <PaginationFooter currentPage={pageOffers} totalCount={offersData.length} onPageChange={setPageOffers} />
            </div>
        )}

        {/* --- 4. CREATED (Updated UI) --- */}
        {activeSection === 'Created' && (
            <>
                <div className="row g-3 mb-4 d-none d-lg-flex align-items-center">
                    <div className="col-lg-3">
                        <span className="text-white fw-bold" style={{ fontSize: '15px' }}>{createdAssets.length} Assets</span>
                    </div>
                    <div className="col-lg-3">
                        <div className="position-relative dropdown-container">
                            <button onClick={() => toggleDropdown('createdSort')} className="btn d-flex align-items-center gap-2 ps-0" style={{ border: 'none', background: 'transparent', color: '#fff', fontSize: '14px' }}>
                                Sort by <i className="bi bi-chevron-down" style={{ fontSize: '11px' }}></i>
                            </button>
                            {openDropdown === 'createdSort' && (
                                <div className="position-absolute mt-2 p-2 rounded-3 shadow-lg" style={{ top: '100%', left: 0, width: '180px', backgroundColor: '#1E1E1E', border: '1px solid #333', zIndex: 100 }}>
                                    {['Newest', 'Oldest'].map(sort => (<button key={sort} onClick={() => { setSortOrder(sort === 'Newest' ? 'newest' : 'oldest'); setOpenDropdown(null); }} className="btn w-100 text-start btn-sm text-white" style={{ backgroundColor: 'transparent', fontSize: '13px' }}>Minted {sort}</button>))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-lg-3"></div>
                    <div className="col-lg-3 text-end">
                        <button onClick={toggleViewMode} className="btn border border-secondary d-inline-flex align-items-center justify-content-center" style={{ borderRadius: '8px', borderColor: '#333', width: '32px', height: '32px', color: '#FFF', padding: 0, backgroundColor: 'transparent' }}>
                            {currentViewMode === 'grid' && <i className="bi bi-grid-fill" style={{ fontSize: '16px' }}></i>}
                            {currentViewMode === 'large' && <i className="bi bi-square-fill" style={{ fontSize: '16px' }}></i>}
                            {currentViewMode === 'list' && <i className="bi bi-list-ul" style={{ fontSize: '20px' }}></i>}
                        </button>
                    </div>
                </div>

                <div className="row mb-4 d-lg-none">
                    <div className="col-12">
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
                    {loading && createdAssets.length === 0 ? <div className="text-center py-5"><div className="spinner-border text-secondary" role="status"></div></div> : (
                        <>
                            <div className="row g-3">
                                {paginatedCreated.map((asset) => (<AssetRenderer key={asset.id} item={asset} mode={currentViewMode} isFavorite={favoriteIds.has(asset.id)} onToggleFavorite={handleToggleFavorite} />))}
                            </div>
                            <PaginationFooter currentPage={pageCreated} totalCount={sortedCreatedAssets.length} onPageChange={setPageCreated} />
                        </>
                    )}
                </div>
            </>
        )}

        {/* --- 5. ACTIVITY (Updated UI) --- */}
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
                                paginatedActivity.map((activity, index) => (
                                    <tr key={index} className="align-middle listing-row" style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/asset/${activity.tokenId}`}>
                                        <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontSize: '11px' }}>
                                            <span>{activity.type}</span>
                                        </td>
                                        {(() => {
                                            const val = getActivityValue(activity.type, activity.price);
                                            return (
                                                <td style={{ backgroundColor: 'transparent', color: '#fff', padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontWeight: '600' }}>
                                                    {/* Display Number ONLY - Off-White Color (#E0E0E0) - No Suffix */}
                                                    <span style={{ color: '#E0E0E0' }}>{val.label}</span>
                                                </td>
                                            );
                                        })()}
                                        <td style={{ backgroundColor: 'transparent', color: GOLD_COLOR, padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontSize: '12px' }}>
                                            {activity.from === '0x0000000000000000000000000000000000000000' ? 'NullAddress' : (
                                                <a href={`https://polygonscan.com/address/${activity.from}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: GOLD_COLOR, textDecoration: 'none' }}>
                                                    {activity.from.toLowerCase() === address?.toLowerCase() ? 'You' : `${activity.from.slice(0,4)}...${activity.from.slice(-4)}`}
                                                </a>
                                            )}
                                        </td>
                                        <td style={{ backgroundColor: 'transparent', color: GOLD_COLOR, padding: '12px 0', borderBottom: '1px solid #2d2d2d', fontSize: '12px' }}>
                                            {activity.to === 'Market' ? (
                                                <a href={`https://polygonscan.com/address/${MARKETPLACE_ADDRESS}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: GOLD_COLOR, textDecoration: 'none' }}>Market</a>
                                            ) : (
                                                <a href={`https://polygonscan.com/address/${activity.to}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: GOLD_COLOR, textDecoration: 'none' }}>
                                                    {activity.to === 'Owner' ? 'Owner' : (activity.to.toLowerCase() === address?.toLowerCase() ? 'You' : `${activity.to.slice(0,4)}...${activity.to.slice(-4)}`)}
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
                <PaginationFooter currentPage={pageActivity} totalCount={activityData.length} onPageChange={setPageActivity} />
            </div>
        )}

        {/* --- 6. CONVICTION --- */}
        {activeSection === 'Conviction' && (
            <div className="mt-4 pb-5 fade-in">
                {/* Header: Balances */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 p-4 rounded-4" style={{ backgroundColor: '#161b22', border: '1px solid #2d2d2d' }}>
                    <div className="d-flex gap-5">
                        <div className="d-flex flex-column">
                            <span style={{ fontSize: '12px', color: '#8a939b', textTransform: 'uppercase', letterSpacing: '1px' }}>WNNM Balance</span>
                            <span className="text-white fw-bold" style={{ fontSize: '24px', fontFamily: 'monospace' }}>
                                {walletBalances.wnnm} <span style={{ fontSize: '14px', color: '#FCD535' }}>WNNM</span>
                            </span>
                        </div>
                        <div className="d-flex flex-column" style={{ borderLeft: '1px solid #333', paddingLeft: '20px' }}>
                            <span style={{ fontSize: '12px', color: '#8a939b', textTransform: 'uppercase', letterSpacing: '1px' }}>NNM Balance</span>
                            <span className="text-white fw-bold" style={{ fontSize: '24px', fontFamily: 'monospace' }}>
                                {walletBalances.nnm} <span style={{ fontSize: '14px', color: '#FCD535' }}>NNM</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Data Table with Pagination */}
                {(() => {
                    const indexOfLastLog = currentPage * 10;
                    const indexOfFirstLog = indexOfLastLog - 10;
                    const currentLogs = convictionLogs.slice(indexOfFirstLog, indexOfLastLog);
                    const totalPages = Math.ceil(convictionLogs.length / 10);

                    return (
                        <>
                            <div className="table-responsive rounded-3" style={{ border: '1px solid #2d2d2d' }}>
                                <table className="table mb-0" style={{ backgroundColor: '#161b22', color: '#fff', fontSize: '13px' }}>
                                    <thead style={{ backgroundColor: '#1E1E1E' }}>
                                        <tr>
                                            <th style={{ color: '#8a939b', fontWeight: 'normal', borderBottom: '1px solid #2d2d2d', padding: '15px' }}>Type</th>
                                            <th style={{ color: '#8a939b', fontWeight: 'normal', borderBottom: '1px solid #2d2d2d', padding: '15px' }}>Currency</th>
                                            <th style={{ color: '#8a939b', fontWeight: 'normal', borderBottom: '1px solid #2d2d2d', padding: '15px' }}>Amount</th>
                                            <th style={{ color: '#8a939b', fontWeight: 'normal', borderBottom: '1px solid #2d2d2d', padding: '15px', textAlign: 'right' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={4} className="text-center py-5"><div className="spinner-border text-secondary spinner-border-sm"></div></td></tr>
                                        ) : convictionLogs.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-5 text-secondary">No conviction history found.</td></tr>
                                        ) : (
                                            currentLogs.map((log, idx) => (
                                                <tr key={idx} className="align-middle" style={{ borderBottom: '1px solid #2d2d2d' }}>
                                                    <td style={{ padding: '15px', color: '#fff' }}>{log.type}</td>
                                                    <td style={{ padding: '15px', color: '#8a939b' }}>{log.currency}</td>
                                                    <td style={{ padding: '15px', fontWeight: 'bold', color: log.amount > 0 ? '#0ecb81' : '#f6465d' }}>
                                                        {log.amount > 0 ? '+' : ''}{log.amount}
                                                    </td>
                                                    <td style={{ padding: '15px', textAlign: 'right', color: '#8a939b' }}>
                                                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {convictionLogs.length > 0 && (
                                <div className="d-flex justify-content-between align-items-center mt-4 px-2" style={{ gap: '10px' }}>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="btn btn-sm"
                                        style={{
                                            border: '1px solid #2d2d2d',
                                            backgroundColor: currentPage === 1 ? '#0d0d0d' : '#161b22',
                                            color: currentPage === 1 ? '#666' : '#fff',
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            fontSize: '13px'
                                        }}
                                    >
                                        Previous
                                    </button>
                                    <span style={{ color: '#fff', fontSize: '13px', minWidth: '150px', textAlign: 'center' }}>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="btn btn-sm"
                                        style={{
                                            border: '1px solid #2d2d2d',
                                            backgroundColor: currentPage === totalPages ? '#0d0d0d' : '#161b22',
                                            color: currentPage === totalPages ? '#666' : '#fff',
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            fontSize: '13px'
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>
        )}

      </div>
      <style jsx global>{`
        .listing-row:hover td { background-color: rgba(255, 255, 255, 0.03) !important; }
        table, th, td, tr, .table { background-color: transparent !important; }
      `}</style>

      {showClaimModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="bg-dark rounded-4 p-4 text-center position-relative border border-secondary" style={{ width: '90%', maxWidth: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                    <button onClick={() => setShowClaimModal(false)} className="btn btn-link position-absolute top-0 end-0 text-secondary text-decoration-none fs-4"><i className="bi bi-x"></i></button>
                    
                    {claimStep === 'audit' && (
                        <div className="py-4">
                            <div className="spinner-border text-warning mb-3" role="status"></div>
                            <h5 className="text-white">Auditing Ledger...</h5>
                            <p className="text-secondary small">Verifying your on-chain conviction history.</p>
                        </div>
                    )}
                    
                    {claimStep === 'confirm' && (
                        <div>
                             <h4 className="text-white mt-2">Audit Passed</h4>
                             <div className="my-4 text-white fw-bold fs-4">Claimable: <span style={{color:'#FCD535'}}>{auditDetails.claimable} NNM</span></div>
                             <button onClick={confirmClaim} className="btn w-100 fw-bold py-3" style={{ background: 'linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)', border: 'none', color: '#000' }}>Confirm</button>
                        </div>
                    )}
                    
                    {claimStep === 'processing' && (
                        <div className="py-4">
                            <div className="spinner-border text-warning mb-3" role="status"></div>
                            <h5 className="text-white">Transfer Initiated</h5>
                            <p className="text-secondary small">Funds will arrive shortly.</p>
                        </div>
                    )}
                    
                    {claimStep === 'success' && (
                        <div className="py-4">
                             <i className="bi bi-check-circle-fill text-warning fs-1 mb-3"></i>
                             <h4 className="text-white">Transfer Successful!</h4>
                             <p className="text-secondary small mb-3">Funds sent to your wallet.</p>
                             {claimTx && (
                                 <a href={`https://polygonscan.com/tx/${claimTx}`} target="_blank" className="btn btn-sm btn-outline-warning mb-3">
                                     View on PolygonScan <i className="bi bi-box-arrow-up-right"></i>
                                 </a>
                             )}
                             <button onClick={() => setShowClaimModal(false)} className="btn w-100 fw-bold" style={{ background: '#FCD535', border: 'none', color: '#000' }}>Close</button>
                        </div>
                    )}
                    {/* Add success/error states as needed */}
                </div>
            </div>
      )}
    </main>
  );
}

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
                        <button onClick={(e) => onToggleFavorite(e, item.id)} className="btn position-absolute end-0 me-2 p-0 border-0 bg-transparent" style={{ zIndex: 10 }}>
                             <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`} style={{ color: isFavorite ? '#FFFFFF' : '#8a939b', fontSize: '16px' }}></i>
                        </button>
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
                       {item.image ? (<img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="asset-img" />) : (<div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="bi bi-image text-secondary"></i></div>)}
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
