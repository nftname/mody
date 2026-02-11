'use client';
import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAccount, useReadContract } from 'wagmi';
import { parseAbi } from 'viem';
import { NFT_COLLECTION_ADDRESS } from '@/data/config'; // تأكد من المسار
import { supabase } from '@/lib/supabase'; // تأكد من المسار

// --- CONSTANTS & ABI ---
const CONTRACT_ABI = parseAbi([
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)"
]);

const COIN_LOGOS: any = {
    BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=026",
    ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=026",
    POLYGON: "https://cryptologos.cc/logos/polygon-matic-logo.svg?v=026",
    SOL: "https://cryptologos.cc/logos/solana-sol-logo.svg?v=026",
    BNB: "https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=026",
    USDT: "https://cryptologos.cc/logos/tether-usdt-logo.svg?v=026",
    // زر عام في حالة عدم تحديد شبكة
    WALLET: "https://cdn-icons-png.flaticon.com/512/60/60484.png" 
};

// --- COMPONENTS ---

// --- (2) BUTTON COMPONENT (With Delete X) ---
const Web3PaymentButton = ({ type, name, address, onClick, isOwner, onRemove }: any) => (
    <button 
        className="web3-payment-btn" 
        onClick={onClick} 
        style={{ 
            opacity: address ? 1 : 0.5, 
            position: 'relative', 
            overflow: 'visible',
            cursor: isOwner || address ? 'pointer' : 'default',
            filter: address ? 'none' : 'grayscale(100%)',
            transition: '0.2s'
        }}
    >
        <div className="btn-content">
            <div className="logo-wrapper">
                <img src={COIN_LOGOS[type] || COIN_LOGOS.WALLET} alt={name} width="32" height="32" className="coin-logo" style={{ objectFit: 'contain' }} />
            </div>
            <div className="token-info">
                <span className="token-name">{name}</span>
                <span className="action-text">
                    {address ? 'Send' : (isOwner ? 'Add Wallet' : 'Inactive')}
                </span>
            </div>
        </div>

        {/* زر الحذف X (للمالك فقط) */}
        {isOwner && address && (
            <div 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    right: '15px', 
                    transform: 'translateY(-50%)',
                    width: '24px', 
                    height: '24px', 
                    background: '#ff4444', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: 'white', 
                    fontSize: '14px', 
                    zIndex: 10,
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                <i className="bi bi-x"></i>
            </div>
        )}
    </button>
);

// شارات التوثيق (ديناميكية حسب الطلب)
const ThreeVerificationBadges = ({ verifiedLevel }: { verifiedLevel: string }) => {
    // Logic: Gold is always there (Base verification).
    // Blue adds on right. Green adds on right of Blue.
    const hasBlue = verifiedLevel === 'blue' || verifiedLevel === 'green';
    const hasGreen = verifiedLevel === 'green';

    const badgePath = "M22.25 12.5c0-1.58-.875-2.95-2.148-3.6.55-1.57.2-3.38-1.1-4.56C17.7 3.14 15.88 2.8 14.3 3.34c-.65-1.28-2.02-2.15-3.6-2.15s-2.95.87-3.6 2.15c-1.57-.54-3.38-.2-4.69 1.1-1.3 1.18-1.65 2.99-1.1 4.56-1.28.65-2.15 2.02-2.15 3.6s.87 2.95 2.15 3.6c-.55 1.57-.2 3.38 1.1 4.56 1.3 1.18 3.12 1.52 4.69.98.65 1.28 2.02 2.15 3.6 2.15s2.95-.87 3.6-2.15c1.58.54 3.39.2 4.69-1.1 1.3-1.18 1.65-2.99 1.1-4.56 1.28-.65 2.15-2.02 2.15-3.6z";
    const checkPath = "M10.5 17.5L5.5 12.5L7 11L10.5 14.5L17.5 7.5L19 9L10.5 17.5Z";
    const badgeStyle = { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' };

    return (
        <div className="badges-container" style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <svg width="0" height="0">
                <defs>
                    <linearGradient id="goldLuxury" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FCD535" />
                        <stop offset="50%" stopColor="#F7931A" />
                        <stop offset="100%" stopColor="#B3882A" />
                    </linearGradient>
                    <linearGradient id="blueLuxury" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4A90E2" />
                        <stop offset="100%" stopColor="#1DA1F2" />
                    </linearGradient>
                    <linearGradient id="greenLuxury" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Always Show Gold (NNM Verified) on Left/Center */}
            <svg viewBox="0 0 25 25" style={badgeStyle} xmlns="http://www.w3.org/2000/svg" className="verification-badge">
                 <path d={badgePath} fill="url(#goldLuxury)" />
                 <path d={checkPath} fill="#FFFFFF" />
            </svg>

            {/* Show Blue if Level >= Blue */}
            {hasBlue && (
                <svg viewBox="0 0 25 25" style={badgeStyle} xmlns="http://www.w3.org/2000/svg" className="verification-badge">
                    <path d={badgePath} fill="url(#blueLuxury)" />
                    <path d={checkPath} fill="#FFFFFF" />
                </svg>
            )}

            {/* Show Green if Level == Green */}
            {hasGreen && (
                <svg viewBox="0 0 25 25" style={badgeStyle} xmlns="http://www.w3.org/2000/svg" className="verification-badge">
                    <path d={badgePath} fill="url(#greenLuxury)" />
                    <path d={checkPath} fill="#FFFFFF" />
                </svg>
            )}
        </div>
    );
};

const FiveStars = ({ count = 5 }) => (
    <div className="stars-container" style={{ display: 'flex', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} className="star-icon" viewBox="0 0 24 24" fill={s <= count ? "#F0C420" : "#444"} stroke={s <= count ? "#B8860B" : "#444"} strokeWidth="1">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
        ))}
    </div>
);

const GoldenCheckBadge = () => (
    <svg width="12" height="12" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '15px', filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.3))' }}>
        <defs>
            <linearGradient id="goldBadgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
            </linearGradient>
        </defs>
        <circle cx="21" cy="21" r="20" fill="url(#goldBadgeGradient)" stroke="#ffffff" strokeWidth="2"/>
        <path d="M12 21l6 6 12-12" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
);

const ChainFaceButton = ({ name, currentUrl }: { name: string, currentUrl: string }) => {
  const qrBg = currentUrl ? `url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}&bgcolor=ffffff')` : 'none';
  
  return (
    <Link href="/mint" className="signature-btn">
        <div className="sig-qr-container"><div className="sig-qr-code" style={{ backgroundImage: qrBg }}></div></div>
        <div className="sig-content">
            <div className="sig-top-row">
                <span className="sig-label">ChainFace</span>
                <GoldenCheckBadge />
            </div>
            <span className="sig-name">{name || 'ASSET'}</span>
        </div>
    </Link>
  );
};

// --- (1) MODAL: CHAINFACE THEME (White/Purple) ---
const WalletEditorModal = ({ isOpen, onClose, wallets, onSave }: any) => {
    const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
    const [addressInput, setAddressInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!selectedCoin) return;
        setIsSaving(true);
        await onSave(selectedCoin, addressInput);
        setIsSaving(false);
        setSelectedCoin(null);
    };

    const handleBackgroundClick = (e: any) => {
        if (e.target === e.currentTarget) onClose();
    };

    const deepPurple = '#2E1A47';

    return (
        <div onClick={handleBackgroundClick} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(46, 26, 71, 0.6)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="fade-in" style={{ width: '90%', maxWidth: '400px', backgroundColor: '#ffffff', border: `1px solid ${deepPurple}`, borderRadius: '24px', padding: '30px', boxShadow: '0 20px 60px rgba(46, 26, 71, 0.2)', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}><i className="bi bi-x-lg"></i></button>
                
                <h3 style={{ color: deepPurple, fontSize: '20px', textAlign: 'center', marginBottom: '20px', fontFamily: 'Outfit, sans-serif', fontWeight: '700', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    {selectedCoin ? `Configure ${selectedCoin}` : 'Select Wallet'}
                </h3>

                {!selectedCoin ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {['BTC', 'ETH', 'SOL', 'BNB', 'USDT', 'POLYGON'].map(coin => (
                            <button key={coin} onClick={() => { setSelectedCoin(coin); setAddressInput(wallets[coin.toLowerCase()] || ''); }} 
                                style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '15px', color: deepPurple, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: '0.2s' }}>
                                <img src={COIN_LOGOS[coin]} width="28" height="28" alt={coin} />
                                <span style={{fontSize: '14px', fontWeight: '700'}}>{coin}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{fontSize:'13px', color: '#666'}}>Paste your <b>{selectedCoin}</b> address:</div>
                        <input type="text" value={addressInput} onChange={(e) => setAddressInput(e.target.value)} placeholder="0x..." 
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#fff', border: '2px solid #e5e7eb', color: '#333', fontSize: '14px', outline: 'none', fontFamily: 'monospace' }} autoFocus />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button onClick={() => setSelectedCoin(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: `1px solid ${deepPurple}`, color: deepPurple, fontWeight: '600' }}>Back</button>
                            <button onClick={handleSave} disabled={isSaving} style={{ flex: 2, padding: '12px', borderRadius: '12px', background: deepPurple, border: 'none', color: '#fff', fontWeight: 'bold' }}>{isSaving ? 'Saving...' : 'Confirm'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- MAIN PAGE ---
export default function ChainFacePage() {
  const router = useRouter();
  const params = useParams();
  const tokenId = params?.id as string;
  
  const { address } = useAccount();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>({
      name: '',
      owner: '',
      customMessage: 'Thank you for stopping in.',
      verifiedLevel: 'none', // gold is default implied
      wallets: { btc: '', eth: '', sol: '', bnb: '', usdt: '', matic: '' },
      stats: { conviction: 0, likes: 0, dislikes: 0 }
  });
  const [isOwner, setIsOwner] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

   // --- (MOD 2) Wallet Logic ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveWallet = async (coin: string, walletAddr: string) => {
      if (!isOwner) return;
      const columnMap: any = { 'BTC': 'btc_address', 'ETH': 'eth_address', 'SOL': 'sol_address', 'BNB': 'bnb_address', 'USDT': 'usdt_address', 'POLYGON': 'matic_address' };
      try {
          const updates: any = { token_id: tokenId, owner_address: address, updated_at: new Date().toISOString() };
          updates[columnMap[coin]] = walletAddr;
          await supabase.from('chainface_profiles').upsert(updates, { onConflict: 'token_id' });
          
          // Update UI
          setProfileData((prev: any) => ({
              ...prev, wallets: { ...prev.wallets, [coin.toLowerCase()]: walletAddr }
          }));
          // (Optional) Close modal or allow more edits
          // setIsModalOpen(false); 
          alert(`${coin} Address Saved!`); // Temporary confirmation
      } catch (e) { console.error("Save error", e); }
  };


  // --- BLOCKCHAIN HOOKS ---
  const { data: realOwnerAddress } = useReadContract({
      address: NFT_COLLECTION_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId || 0)],
      query: { enabled: !!tokenId }
  });

  const { data: tokenURI } = useReadContract({
      address: NFT_COLLECTION_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'tokenURI',
      args: [BigInt(tokenId || 0)],
      query: { enabled: !!tokenId }
  });

  // --- DATA FETCHING & KILL SWITCH LOGIC ---
  const fetchChainFaceData = useCallback(async () => {
      if (!tokenId || !realOwnerAddress) return;
      setLoading(true);

      try {
          // 1. Fetch Name from Metadata (or DB)
          let assetName = `NNM #${tokenId}`;
          if (tokenURI) {
              const url = tokenURI.startsWith('ipfs://') ? tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : tokenURI;
              const meta = await fetch(url).then(res => res.json()).catch(() => ({}));
              if (meta.name) assetName = meta.name;
          }

          // 2. Fetch Conviction Score
          const { count: convictionCount } = await supabase
              .from('conviction_votes')
              .select('*', { count: 'exact', head: true })
              .eq('token_id', tokenId);

          // 3. Fetch ChainFace Profile (Custom Settings)
          const { data: profile, error } = await supabase
              .from('chainface_profiles')
              .select('*')
              .eq('token_id', tokenId)
              .maybeSingle();

          // --- KILL SWITCH LOGIC ---
          // If profile exists BUT owner address in DB != Real Blockchain Owner -> RESET/IGNORE
          let safeProfile = profile;
          const currentOwnerStr = String(realOwnerAddress).toLowerCase();
          
          if (profile && profile.owner_address && profile.owner_address.toLowerCase() !== currentOwnerStr) {
              console.warn("⚠️ KILL SWITCH ACTIVATED: Owner changed. Resetting view.");
              safeProfile = null; // Treat as if no profile exists (Default View)
              
              // Optional: Fire a background cleanup (Clean DB)
              // await supabase.from('chainface_profiles').delete().eq('token_id', tokenId);
          }

          // 4. Construct Final Data
          setProfileData({
              name: assetName,
              owner: currentOwnerStr,
              customMessage: safeProfile?.custom_message || 'Thank you for stopping in.',
              verifiedLevel: safeProfile?.verified_level || 'none',
              wallets: {
                  btc: safeProfile?.btc_address || '',
                  eth: safeProfile?.eth_address || '',
                  sol: safeProfile?.sol_address || '',
                  bnb: safeProfile?.bnb_address || '',
                  usdt: safeProfile?.usdt_address || '',
                  matic: safeProfile?.matic_address || ''
              },
              stats: {
                  conviction: (convictionCount || 0) * 100, // Assuming 100 per vote
                  likes: safeProfile?.likes_count || 0,
                  dislikes: safeProfile?.dislikes_count || 0
              }
          });

          // 5. Check Ownership Permission
          if (address && address.toLowerCase() === currentOwnerStr) {
              setIsOwner(true);
          } else {
              setIsOwner(false);
          }

      } catch (err) {
          console.error("Error loading ChainFace:", err);
      } finally {
          setLoading(false);
      }
  }, [tokenId, realOwnerAddress, tokenURI, address]);

  useEffect(() => {
      fetchChainFaceData();
  }, [fetchChainFaceData]);


  // --- HANDLERS ---
  const handleCopyWallet = (address: string, symbol: string) => {
      if (!address) return;
      navigator.clipboard.writeText(address);
      alert(`${symbol} Address Copied: ${address}`);
  };

  const handleSupportClick = async (type: 'like' | 'dislike') => {
      setFeedback(type);
      // Here you would call Supabase to increment like/dislike
      // await supabase.rpc('increment_reaction', { _token_id: tokenId, _type: type });
  };

  // Generate QR Code for Current Page
  const qrCodeUrl = typeof window !== 'undefined' 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}&bgcolor=ffffff`
      : '';

       const handleShare = async () => {
      const url = window.location.href;
      if (navigator.share) {
          try { await navigator.share({ title: `ChainFace: ${profileData.name}`, url: url }); } catch (e) {}
      } else {
          navigator.clipboard.writeText(url);
          alert('Link Copied!'); // سنستبدلها بتوست لاحقاً إذا أردت
      }
  };

  const handleCopyEmbed = () => {
      const embedCode = `<a href="${window.location.href}">ChainFace: ${profileData.name}</a>`;
      navigator.clipboard.writeText(embedCode);
      alert('Embed Code Copied!');
  };

  // --- (3) New Logic for Copy & Share ---
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [currentPageUrl, setCurrentPageUrl] = useState('');
  const [copiedTip, setCopiedTip] = useState<string | null>(null);

  useEffect(() => {
      if (typeof window !== 'undefined') setCurrentPageUrl(window.location.href);
  }, []);

  const handleRemoveWallet = async (coin: string) => {
      if (!isOwner) return;
      handleSaveWallet(coin, ''); 
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(currentPageUrl);
      setCopiedTip('link');
      setTimeout(() => setCopiedTip(null), 2000);
  };
  
  const handleShareClick = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById('cf-btn');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
        allowTaint: true
      });

      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png', 1.0));
      if (!blob) return;
      
      const file = new File([blob], 'chainface-id.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `ChainFace: ${profileData.name}`,
          text: `Check out my ChainFace Identity:`,
          url: currentPageUrl
        });
      } else {
        setShowShareMenu(!showShareMenu);
      }
    } catch (error) {
      console.error(error);
    }
  };


  const deepPurpleColor = '#2E1A47'; 

  if (loading) return <div style={{ minHeight: '100vh', background: '#F0EDF2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading ChainFace...</div>;

  return (
    <main style={{ backgroundColor: '#F0EDF2', minHeight: '100vh', fontFamily: '"Inter", sans-serif', position: 'relative', zIndex: 1000 }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Satoshi:wght@700;900&family=Orbitron:wght@500;700&display=swap');
        @import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;900&display=swap');

        nav, footer, .navbar, .footer, header:not(.hero-banner-wrapper) {
            display: none !important;
        }

        .page-container {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            position: relative;
        }

        .hero-banner-wrapper {
            width: 100%;
            height: 220px;
            position: relative;
            background-color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: -40px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            background-image: radial-gradient(circle at center, #ffffff 40%, #f8f9fa 100%);
            z-index: 5; 
            overflow: hidden;
        }

        .chainface-metallic-title {
            font-family: 'Outfit', sans-serif;
            font-size: 80px;     
            font-weight: 700;
            letter-spacing: -2px;
            margin: 0;
            padding-top: 15px;
            padding-left: 95px; 
            
            background: linear-gradient(
                135deg, 
                #4c1d95 10%,   
                #6d28d9 40%,   
                #a78bfa 50%,   
                #6d28d9 60%,   
                #4c1d95 90%    
            );

            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            
            filter: drop-shadow(0 2px 2px rgba(88, 28, 135, 0.2));
            text-transform: none;
            position: relative;
            z-index: 10;
        }

        .blockchain-svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1; 
            opacity: 0.4;
        }
        .node { fill: #94a3b8; }
        .link { stroke: #cbd5e1; stroke-width: 1.5px; }
        .node-active { fill: #d8b4fe; }

        .back-btn {
            position: absolute;
            top: 55px; left: 25px;
            width: 42px; height: 42px;
            border-radius: 50%;
            background-color: #f8f9fa; 
            display: flex; align-items: center; justify-content: center;
            color: #2E1A47; font-size: 20px; cursor: pointer; z-index: 100;
            border: 1px solid #E5E7EB;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
        }

        .identity-card-container {
            position: relative;
            width: 260px;
            height: 140px;
            margin-top: -30px; 
            margin-left: 10%; 
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.4);
            z-index: 10;
            background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 45%, #6d28d9 70%, #1e1b4b 100%);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 5px 0;
        }

        .card-content {
            text-align: center; color: white; z-index: 20; margin: 5px 0;
            display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;
        }

         .card-name {
            font-family: 'Cinzel', serif;
            font-size: 22px;
            font-weight: 700;
            color: white;
            text-shadow: 0 3px 10px rgba(0,0,0,0.7);
            letter-spacing: 0.5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 220px;
            display: block;
            text-transform: uppercase;
        }

        .badge-icon { width: 23px; height: 23px; } 
        .star-icon { width: 21px; height: 21px; } 
        .stars-container { gap: 5px; margin-top: 8px; margin-bottom: 5px; }
        .badges-container { margin-bottom: 10px; margin-top: -5px; }
        .verification-badge { width: 22px; height: 22px; }

        .conviction-box {
            position: relative; text-align: center; margin-top: 15px; margin-bottom: 30px;
        }
        .conviction-label {
            color: ${deepPurpleColor}; 
            font-size: 14px; font-weight: 700; text-transform: uppercase;
            font-family: 'Satoshi', sans-serif; letter-spacing: 1px;
            display: block; 
        }
        .conviction-number-wrapper {
            position: relative; display: inline-block; margin-top: 5px;
        }
        .conviction-number {
            color: ${deepPurpleColor};
            font-size: 20px; font-weight: 900; font-family: 'Satoshi', sans-serif;
        }
         .conviction-currency {
            font-size: 16px;       
            font-weight: 700;      
            color: #a855f7;        
            margin-left: 7px;      
            position: relative;
            top: -2px;            
            font-family: 'Satoshi', sans-serif;
        }

        .pay-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            max-width: 800px;
            margin: 0 auto;
        }

        .web3-payment-btn {
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 16px;
            height: 72px;
            width: 100%;
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 0 16px;
            display: flex;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .web3-payment-btn:hover {
            border-color: #D1D5DB;
            background: #F9FAFB;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.08);
        }

        .btn-content {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
        }

        .logo-wrapper {
            width: 32px; 
            height: 32px;
            min-width: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 14px;
        }
        
        .coin-logo {
            width: 100%;
            height: 100%;
            object-fit: contain; 
        }

        .token-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            flex: 1;
        }

        .token-name {
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            font-size: 15px;
            color: #111827;
            line-height: 1.2;
        }

        .action-text {
            font-size: 11px;
            font-weight: 600;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
        }

        .footer-note {
             margin-top: 30px; font-size: 12px; color: #666666; font-style: italic;
        }
        .thank-you-title {
            font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 17px;
            color: ${deepPurpleColor}; margin-bottom: 10px;
        }
        .thank-you-subtitle {
            color: ${deepPurpleColor}; font-size: 16px; line-height: 1.5; font-weight: 600;
        }
        .cta-phrase {
            font-family: 'Cinzel', serif; font-size: 20px; color: ${deepPurpleColor};
            margin-bottom: 10px; font-weight: 700;
        }

        /* --- STYLES FOR THE NEW CHAINFACE BUTTON --- */
        .signature-btn {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 190px !important; 
            min-width: 190px !important;
            max-width: 190px !important;
            height: 55px !important;
            min-height: 55px !important;
            max-height: 55px !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            background: linear-gradient(110deg, #5e1139 0%, #240b36 50%, #020c1b 100%);
            border-radius: 30px;
            padding: 0 12px;
            text-decoration: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.08);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
            cursor: pointer;
            margin: 0;
        }
        .signature-btn::before {
             content: '';
             position: absolute;
             top: 0; left: 0; width: 100%; height: 50%;
             background: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
             border-radius: 30px 30px 0 0;
             pointer-events: none;
        }
        .signature-btn:hover {
            transform: translateY(-1.5px); 
            box-shadow: 0 8px 25px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.2);
            border-color: rgba(255,255,255,0.2);
        }
        .sig-qr-container {
            width: 28px; 
            height: 28px;
            background: rgba(255,255,255,0.92);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            flex-shrink: 0; 
        }
        .sig-qr-code {
            width: 23px;
            height: 23px;
            background-image: url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ALEXANDER_CF_SIGNATURE');
            background-size: cover;
            opacity: 0.85;
            mix-blend-mode: multiply;
        }
        .sig-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            flex-grow: 1;
            padding-right: 5px; 
            overflow: hidden; 
        }
        .sig-top-row {
            display: flex;
            align-items: center;
            margin-bottom: 2px;
        }
        .sig-label {
            font-family: 'Orbitron', sans-serif;
            font-size: 9px;
            color: rgba(255,255,255,0.95);
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            font-weight: 700;
            white-space: nowrap;
        }
        .sig-name {
            font-family: 'Satoshi', sans-serif;
            font-weight: 900;
            font-size: 15px; 
            text-transform: uppercase;
            background: linear-gradient(to bottom, #ffffff 40%, #b0b0b0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: 0.2px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
            display: block;
            white-space: nowrap;       
            overflow: hidden;         
            text-overflow: ellipsis;   
            max-width: 105px;         
        }
            .header-qr-btn {
            position: absolute;
            top: 55px;
            right: 25px;
            width: 84px; 
            height: 84px;
            border-radius: 12px;
            background-color: #f8f9fa; 
            display: flex; align-items: center; justify-content: center;
            z-index: 100;
            border: 1px solid #E5E7EB;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
            cursor: pointer;
            overflow: hidden;
        }
        .header-qr-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        .qr-image-generated {
            width: 64px;
            height: 64px;
            mix-blend-mode: multiply;
            opacity: 0.85;
        }
         @media (max-width: 768px) {
            .header-qr-btn {
                 width: 34px; height: 34px; top: 15px; right: 15px;
            }
            .qr-image-generated {
                width: 24px; height: 24px;
            }
            .hero-banner-wrapper { 
                height: 160px;
                margin-top: -40px;
            } 
            .chainface-metallic-title {
                font-size: 48px; 
                padding-left: 20px; 
            }
            .back-btn {
                width: 34px; height: 34px; top: 15px; left: 15px; font-size: 16px;
            }
            .identity-card-container { 
                width: 40%; height: 80px; min-width: 140px; margin: -22px 0 0 20px;
                border-radius: 12px; border-width: 0.8px; padding: 2px 0;
            }
            .card-content { margin: 2px 0; }
            .card-name { font-size: 15px; }
            .badge-icon { width: 13px; height: 13px; }
            .verification-badge { width: 13px; height: 13px; }
            .star-icon { width: 11px; height: 11px; }
            .stars-container { gap: 1px; margin-top: 4px; margin-bottom: 2px; }
            .badges-container { margin-bottom: 2px; margin-top: -2px; }
            
            .cta-phrase {
                font-size: 19px; letter-spacing: -0.5px; color: ${deepPurpleColor};
            }
            .footer-note { font-size: 10px; }

            .pay-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            
            .web3-payment-btn {
                height: 60px;
                padding: 0 12px;
            }
            
            .token-name {
                font-size: 14px;
            }
        }
      `}</style>

      <div className="hero-banner-wrapper">
          <div className="back-btn" onClick={() => router.back()}>
              <i className="bi bi-arrow-left"></i>
          </div>
       <div className="header-qr-btn" title="Scan to Share Profile">
              <img 
                src={qrCodeUrl} 
                alt="Profile QR Code" 
                className="qr-image-generated"
              />
          </div>
   
          {/* شبكة البلوك تشين الخفيفة في الخلفية */}
          <svg className="blockchain-svg" width="100%" height="100%" viewBox="0 0 900 220" preserveAspectRatio="xMidYMid slice">
            <line x1="50" y1="50" x2="150" y2="100" className="link" />
            <line x1="50" y1="180" x2="150" y2="100" className="link" />
            <line x1="150" y1="100" x2="250" y2="40" className="link" />
            <line x1="150" y1="100" x2="220" y2="180" className="link" />
            <line x1="250" y1="40" x2="350" y2="90" className="link" />
            <line x1="850" y1="170" x2="750" y2="120" className="link" />
            <line x1="850" y1="40" x2="750" y2="120" className="link" />
            <line x1="750" y1="120" x2="650" y2="180" className="link" />
            <line x1="750" y1="120" x2="680" y2="50" className="link" />
            <line x1="680" y1="50" x2="580" y2="100" className="link" />
            
            <circle cx="50" cy="50" r="4" className="node" />
            <circle cx="50" cy="180" r="3" className="node" />
            <circle cx="150" cy="100" r="5" className="node-active" />
            <circle cx="250" cy="40" r="4" className="node" />
            <circle cx="220" cy="180" r="3" className="node" />
            <circle cx="350" cy="90" r="3" className="node" />
            <circle cx="850" cy="170" r="4" className="node" />
            <circle cx="850" cy="40" r="3" className="node" />
            <circle cx="750" cy="120" r="5" className="node-active" />
            <circle cx="650" cy="180" r="4" className="node" />
            <circle cx="680" cy="50" r="3" className="node" />
            <circle cx="580" cy="100" r="3" className="node" />
        </svg>

          <h1 className="chainface-metallic-title">ChainFace</h1>
      </div>

      <div className="page-container">
          <div className="identity-card-container">
              <div className="card-content">
                  {/* Dynamic Badges */}
                  <ThreeVerificationBadges verifiedLevel={profileData.verifiedLevel} />
                  
                  <div className="card-name-row">
                      {/* Dynamic Name */}
                      <span className="card-name">{profileData.name}</span>
                  </div>
              </div>
              <FiveStars count={5} />
          </div>

           {/* --- (MOD 3-A) Verification Buttons --- */}
          {isOwner && (
              <div style={{ marginTop: '15px', marginLeft: '10%', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                  <button onClick={() => window.open('https://sumsub.com', '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#666', fontSize: '13px', cursor: 'pointer' }}>
                      <div style={{ width: '20px', height: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '10px' }}><i className="bi bi-star-fill"></i></div>
                      Verify Phone Number
                  </button>
                  <button onClick={() => window.open('https://sumsub.com', '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#666', fontSize: '13px', cursor: 'pointer' }}>
                      <div style={{ width: '20px', height: '20px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '10px' }}><i className="bi bi-shield-fill-check"></i></div>
                      Verify Identity (KYC)
                  </button>
              </div>
          )}


          <div className="conviction-box">
              <span className="conviction-label">Conviction</span>
              <div className="conviction-number-wrapper">
                  {/* Dynamic Conviction Score */}
                  <span className="conviction-number">
                    {new Intl.NumberFormat('en-US').format(profileData.stats.conviction)}
                  </span>
                  <span className="conviction-currency">NNM</span>
              </div>
          </div>

          <div style={{ maxWidth: '800px', margin: '20px auto', textAlign: 'center', padding: '0 20px' }}>
              
                       {/* --- (MOD 3-B) Wallet Config & Buttons --- */}
              {isOwner && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Payment Methods</span>
                      <button onClick={() => setIsModalOpen(true)} style={{ background: 'transparent', border: '1px solid #2E1A47', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', fontWeight: 'bold', color: '#2E1A47', cursor: 'pointer' }}>
                          <i className="bi bi-gear-fill me-1"></i> Configure
                      </button>
                  </div>
              )}
              
              <WalletEditorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} wallets={profileData.wallets} onSave={handleSaveWallet} />

              <div className="pay-grid">
                  {Object.keys(COIN_LOGOS).filter(k => k !== 'WALLET').map(coin => {
                      const addr = profileData.wallets[coin.toLowerCase()] || profileData.wallets[coin === 'POLYGON' ? 'polygon' : ''];
                      if (!isOwner && !addr) return null; // Hide from visitors if empty
                      return (
                          <Web3PaymentButton 
                              key={coin}
                              type={coin} 
                              name={coin === 'POLYGON' ? 'Polygon' : coin} 
                              address={addr} 
                              onClick={() => isOwner ? setIsModalOpen(true) : handleCopyWallet(addr, coin)} 
                          />
                      );
                  })}
              </div>

              <p className="footer-note">
                  Payments are peer-to-peer. ChainFace never holds funds.
              </p>

                <div style={{ marginTop: '40px', marginBottom: '30px', textAlign: 'center' }}>
                <h2 className="thank-you-title" style={{ fontFamily: 'Satoshi', fontWeight: '700', fontSize: '18px', color: '#2E1A47' }}>
                      Thank you for stepping into my ChainFace.
                  </h2>
                  <p className="thank-you-subtitle" style={{ color: '#2E1A47', fontSize: '16px', fontWeight: '600', marginTop: '5px' }}>
                      {profileData.customMessage}
                  </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                  <i 
                    className={`bi bi-hand-thumbs-up-fill ${feedback === 'like' ? 'text-warning' : 'text-secondary'}`} 
                    style={{ fontSize: '24px', cursor: 'pointer', transition: '0.3s' }}
                    onClick={() => handleSupportClick('like')}
                  ></i>
                  <i 
                    className={`bi bi-hand-thumbs-down-fill ${feedback === 'dislike' ? 'text-warning' : 'text-secondary'}`} 
                    style={{ fontSize: '24px', cursor: 'pointer', transition: '0.3s' }}
                    onClick={() => handleSupportClick('dislike')}
                  ></i>
              </div>

          </div>
      </div>

     <div style={{ padding: '30px 20px', backgroundColor: '#fff', borderTop: '1px solid #eee', textAlign: 'center', position: 'relative' }}>
          
          <p style={{ color: '#2E1A47', fontSize: '14px', fontWeight: '500', marginBottom: '25px', lineHeight: '1.5' }}>
             Share this sovereign link button with friends, clients, or anyone you wish to view your page or pay you securely.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', position: 'relative' }}>
            
              {/* Share Button & Menu */}
              <div style={{ position: 'relative' }}>
                  <div onClick={handleShareClick} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#2E1A47' }}>
                      <i className="bi bi-share-fill"></i>
                  </div>
                  
                  {showShareMenu && (
                      <div className="fade-in" style={{ position: 'absolute', bottom: '55px', left: '-60px', background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', gap: '15px', zIndex: 100, minWidth: '200px', justifyContent: 'center' }}>
                          <a href={`https://wa.me/?text=${encodeURIComponent(currentPageUrl)}`} target="_blank" title="WhatsApp" style={{ color: '#25D366', fontSize: '24px' }}><i className="bi bi-whatsapp"></i></a>
                          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentPageUrl)}`} target="_blank" title="Facebook" style={{ color: '#1877F2', fontSize: '24px' }}><i className="bi bi-facebook"></i></a>
                          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentPageUrl)}`} target="_blank" title="X (Twitter)" style={{ color: '#000', fontSize: '24px' }}><i className="bi bi-twitter-x"></i></a>
                          <a href={`https://t.me/share/url?url=${encodeURIComponent(currentPageUrl)}`} target="_blank" title="Telegram" style={{ color: '#0088cc', fontSize: '24px' }}><i className="bi bi-telegram"></i></a>
                          <a href={`mailto:?body=${encodeURIComponent(currentPageUrl)}`} title="Email" style={{ color: '#EA4335', fontSize: '24px' }}><i className="bi bi-envelope-fill"></i></a>
                      </div>
                  )}
              </div>

              {/* Capsule Button */}
<div id="cf-btn" style={{ display: 'inline-block', background: 'transparent', padding: '2px' }}>
    <ChainFaceButton name={profileData.name} currentUrl={currentPageUrl} />
</div>



              {/* Copy Button */}
              <div style={{ position: 'relative' }}>
                  <div onClick={handleCopyLink} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#2E1A47' }}>
                      <i className="bi bi-files" style={{ fontSize: '20px' }}></i>
                  </div>
                  {copiedTip === 'link' && (
                      <div className="fade-in" style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: '#2E1A47', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                          Copied!
                      </div>
                  )}
              </div>

          </div>
      </div> 

    </main>
  );
}
