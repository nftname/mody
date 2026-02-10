'use client';
import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAccount, useReadContract } from 'wagmi';
import { parseAbi } from 'viem';
import { NFT_COLLECTION_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase';

// --- CONSTANTS ---
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
    WALLET: "https://cdn-icons-png.flaticon.com/512/60/60484.png" 
};

// --- CUSTOM TOAST (بديل الـ Alert) ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className="fade-in" style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: type === 'success' ? '#101740' : '#3d0a0a',
            border: `1px solid ${type === 'success' ? '#FCD535' : '#ff4444'}`,
            padding: '12px 24px', borderRadius: '12px', zIndex: 99999,
            color: '#fff', display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', minWidth: '300px', justifyContent: 'center'
        }}>
            <i className={`bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} style={{ color: type === 'success' ? '#FCD535' : '#ff4444' }}></i>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{message}</span>
        </div>
    );
};

// --- WALLET EDITOR MODAL (نافذة إدارة المحافظ) ---
const WalletEditorModal = ({ isOpen, onClose, wallets, onSave }: any) => {
    const [step, setStep] = useState<'select' | 'input'>('select');
    const [selectedCoin, setSelectedCoin] = useState<string>('');
    const [addressInput, setAddressInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleCoinSelect = (coin: string) => {
        setSelectedCoin(coin);
        setAddressInput(wallets[coin.toLowerCase()] || '');
        setStep('input');
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(selectedCoin, addressInput);
        setIsSaving(false);
        setStep('select');
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
            <div className="fade-in" style={{
                width: '90%', maxWidth: '420px', backgroundColor: '#1E1E1E',
                border: '1px solid #FCD535', borderRadius: '24px', padding: '30px',
                boxShadow: '0 0 60px rgba(252, 213, 53, 0.2)', position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#666', fontSize: '24px' }}>
                    <i className="bi bi-x-lg"></i>
                </button>

                <h3 style={{ color: '#fff', fontSize: '18px', textAlign: 'center', marginBottom: '25px', fontFamily: 'serif', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
                    {step === 'select' ? 'Configure Payment Methods' : `Set ${selectedCoin} Address`}
                </h3>

                {step === 'select' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        {Object.keys(COIN_LOGOS).filter(k => k !== 'WALLET').map(coin => (
                            <button key={coin} onClick={() => handleCoinSelect(coin)}
                                style={{
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid #333',
                                    borderRadius: '16px', padding: '15px', display: 'flex', alignItems: 'center',
                                    gap: '12px', cursor: 'pointer', transition: '0.2s', color: '#fff'
                                }}
                                className="coin-btn"
                            >
                                <img src={COIN_LOGOS[coin]} width="32" height="32" alt={coin} />
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{coin}</span>
                                    <span style={{ fontSize: '10px', color: wallets[coin.toLowerCase()] ? '#10b981' : '#666' }}>
                                        {wallets[coin.toLowerCase()] ? 'Active' : 'Empty'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '5px' }}>
                            Enter your <b>{selectedCoin}</b> wallet address.
                        </div>
                        <input 
                            type="text" 
                            value={addressInput}
                            onChange={(e) => setAddressInput(e.target.value)}
                            placeholder={`Paste ${selectedCoin} address...`}
                            autoFocus
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px',
                                background: '#000', border: '1px solid #FCD535', color: '#fff',
                                fontSize: '13px', outline: 'none', fontFamily: 'monospace'
                            }}
                        />
                        <div className="d-flex gap-2 mt-2">
                            <button onClick={() => setStep('select')} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'transparent', border: '1px solid #444', color: '#fff' }}>Back</button>
                            <button onClick={handleSave} disabled={isSaving} style={{ flex: 2, padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #FCD535 0%, #B3882A 100%)', border: 'none', color: '#000', fontWeight: 'bold' }}>
                                {isSaving ? 'Saving...' : 'Save & Activate'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- PAYMENT BUTTON ---
const Web3PaymentButton = ({ type, name, address, onClick, isOwner }: any) => (
    <button className="web3-payment-btn" onClick={onClick} style={{ opacity: 1 }}>
        <div className="btn-content">
            <div className="logo-wrapper">
                <img src={COIN_LOGOS[type] || COIN_LOGOS.WALLET} alt={`${name} Logo`} width="32" height="32" className="coin-logo" style={{ objectFit: 'contain' }} />
            </div>
            <div className="token-info">
                <span className="token-name">{name}</span>
                <span className="action-text">
                    {address ? 'Pay / Copy' : (isOwner ? 'Setup Wallet' : 'Not Active')}
                </span>
            </div>
        </div>
    </button>
);

// --- MAIN PAGE ---
export default function ChainFacePage() {
  const router = useRouter();
  const params = useParams();
  const tokenId = params?.id as string;
  const { address } = useAccount();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  // Blockchain Hooks
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

  // --- FETCH DATA ---
  const fetchChainFaceData = useCallback(async () => {
      if (!tokenId || !realOwnerAddress) return;
      setLoading(true);
      try {
          // 1. Name & Metadata
          let assetName = `NNM #${tokenId}`;
          if (tokenURI) {
              const url = tokenURI.startsWith('ipfs://') ? tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : tokenURI;
              const meta = await fetch(url).then(res => res.json()).catch(() => ({}));
              if (meta.name) assetName = meta.name;
          }

          // 2. Profile Data
          const { data: profile } = await supabase.from('chainface_profiles').select('*').eq('token_id', tokenId).maybeSingle();
          const { count: conviction } = await supabase.from('conviction_votes').select('*', { count: 'exact', head: true }).eq('token_id', tokenId);

          // 3. Kill Switch Check
          const currentOwnerStr = String(realOwnerAddress).toLowerCase();
          
          if (profile && profile.owner_address && profile.owner_address.toLowerCase() !== currentOwnerStr) {
              // RESET if sold
              setProfileData({
                  name: assetName,
                  owner: currentOwnerStr,
                  customMessage: 'Thank you for stopping in.',
                  verifiedLevel: 'none',
                  wallets: {},
                  stats: { conviction: (conviction || 0) * 100 }
              });
          } else {
              setProfileData({
                  name: assetName,
                  owner: currentOwnerStr,
                  customMessage: profile?.custom_message || 'Thank you for stopping in.',
                  verifiedLevel: profile?.verified_level || 'none',
                  wallets: {
                      btc: profile?.btc_address,
                      eth: profile?.eth_address,
                      sol: profile?.sol_address,
                      bnb: profile?.bnb_address,
                      usdt: profile?.usdt_address,
                      polygon: profile?.matic_address
                  },
                  stats: { conviction: (conviction || 0) * 100 }
              });
          }

          setIsOwner(address?.toLowerCase() === currentOwnerStr);

      } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [tokenId, realOwnerAddress, tokenURI, address]);

  useEffect(() => { fetchChainFaceData(); }, [fetchChainFaceData]);

  // --- ACTIONS ---
  const handleSaveWallet = async (coin: string, walletAddr: string) => {
      if (!isOwner) return;
      const columnMap: any = { 'BTC': 'btc_address', 'ETH': 'eth_address', 'SOL': 'sol_address', 'BNB': 'bnb_address', 'USDT': 'usdt_address', 'POLYGON': 'matic_address' };
      
      try {
          const updates: any = { token_id: tokenId, owner_address: address, updated_at: new Date().toISOString() };
          updates[columnMap[coin]] = walletAddr;
          await supabase.from('chainface_profiles').upsert(updates, { onConflict: 'token_id' });
          setToast({ message: `${coin} Address Saved Successfully`, type: 'success' });
          fetchChainFaceData();
      } catch (e) { setToast({ message: 'Error saving address', type: 'error' }); }
  };

  const handleWalletClick = (type: string, addr: string) => {
      if (isOwner) { setIsModalOpen(true); } 
      else {
          if (addr) {
              navigator.clipboard.writeText(addr);
              setToast({ message: `${type} Address Copied`, type: 'success' });
          } else {
              setToast({ message: 'This wallet is not active yet.', type: 'error' });
          }
      }
  };

  const handleShare = async () => {
      const url = window.location.href;
      if (navigator.share) {
          try { await navigator.share({ title: `ChainFace: ${profileData.name}`, url: url }); } catch (e) {}
      } else {
          navigator.clipboard.writeText(url);
          setToast({ message: 'Profile Link Copied to Clipboard', type: 'success' });
      }
  };

  const handleVerification = (type: string) => {
      // Placeholder for SDK
      setToast({ message: 'Redirecting to Secure Verification...', type: 'success' });
  };

  if (loading || !profileData) return <div style={{height:'100vh', background:'#F0EDF2'}}></div>;

  return (
    <main style={{ backgroundColor: '#F0EDF2', minHeight: '100vh', fontFamily: '"Inter", sans-serif', position: 'relative', paddingBottom: '100px' }}>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <WalletEditorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} wallets={profileData.wallets} onSave={handleSaveWallet} />

      <style jsx global>{`
        .coin-btn:hover { background: rgba(252, 213, 53, 0.1) !important; border-color: #FCD535 !important; }
        .fade-in { animation: fadeIn 0.3s ease-in; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .verify-btn-group { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; width: 100%; align-items: center; }
        .v-btn { display: flex; align-items: center; gap: 12px; width: 220px; background: rgba(255,255,255,0.8); padding: 8px 12px; border-radius: 12px; border: 1px solid #d1d5db; cursor: pointer; transition: 0.2s; text-decoration: none; }
        .v-btn:hover { transform: translateX(3px); background: #fff; border-color: #aaa; }
        .v-icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: #fff; border-radius: 50%; font-size: 12px; }
        .v-text { display: flex; flex-direction: column; align-items: flex-start; }
        .v-title { font-size: 12px; fontWeight: 700; color: #333; }
        .v-sub { font-size: 10px; color: #666; }

        .hero-banner-wrapper { width: 100%; height: 220px; position: relative; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
        .chainface-metallic-title { font-family: 'Outfit', sans-serif; font-size: 80px; font-weight: 700; background: linear-gradient(135deg, #4c1d95 10%, #6d28d9 40%, #a78bfa 50%, #4c1d95 90%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; position: relative; z-index: 10; padding-left: 95px; margin: 0; }
        .back-btn { position: absolute; top: 55px; left: 25px; width: 42px; height: 42px; border-radius: 50%; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #2E1A47; font-size: 20px; cursor: pointer; z-index: 100; border: 1px solid #E5E7EB; }
        .header-qr-btn { position: absolute; top: 55px; right: 25px; width: 84px; height: 84px; border-radius: 12px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; z-index: 100; border: 1px solid #E5E7EB; cursor: pointer; overflow:hidden; }
        
        .identity-card-container { width: 260px; min-height: 140px; margin: -30px 0 0 10%; border-radius: 20px; background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 45%, #6d28d9 70%, #1e1b4b 100%); position: relative; z-index: 10; box-shadow: 0 20px 40px rgba(0,0,0,0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 0; }
        .card-name { font-family: 'Cinzel', serif; font-size: 22px; color: white; text-transform: uppercase; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        
        .pay-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; max-width: 800px; margin: 20px auto; }
        .web3-payment-btn { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; height: 72px; width: 100%; display: flex; align-items: center; padding: 0 16px; cursor: pointer; transition: 0.2s; }
        .web3-payment-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .token-info { display: flex; flex-direction: column; align-items: flex-start; margin-left: 12px; }
        .token-name { font-weight: 700; font-size: 15px; color: #111; }
        .action-text { font-size: 11px; color: #666; text-transform: uppercase; font-weight: 600; }
        
        .share-footer-btn { background: #1E1E1E; color: #FCD535; border: 1px solid #FCD535; width: 220px; height: 50px; border-radius: 25px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: bold; font-size: 14px; cursor: pointer; transition: 0.2s; letter-spacing: 1px; }
        .share-footer-btn:hover { background: #FCD535; color: #1E1E1E; }

        @media (max-width: 768px) {
            .chainface-metallic-title { font-size: 48px; padding-left: 20px; }
            .hero-banner-wrapper { height: 160px; }
            .identity-card-container { width: 180px; min-height: 100px; margin-top: -20px; margin-left: 20px; }
            .card-name { font-size: 16px; }
            .pay-grid { grid-template-columns: repeat(2, 1fr); }
            .header-qr-btn { width: 40px; height: 40px; top: 15px; right: 15px; }
            .header-qr-btn img { width: 24px; height: 24px; }
            .back-btn { width: 40px; height: 40px; top: 15px; left: 15px; }
            .verify-btn-group { align-items: flex-start; margin-left: 20px; }
            .v-btn { width: 180px; }
        }
      `}</style>

      {/* HEADER */}
      <div className="hero-banner-wrapper">
          <div className="back-btn" onClick={() => router.back()}><i className="bi bi-arrow-left"></i></div>
          <div className="header-qr-btn" onClick={handleShare}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&bgcolor=ffffff`} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <svg width="100%" height="100%" viewBox="0 0 900 220" style={{ position: 'absolute', opacity: 0.4 }}><path d="M50 50 L150 100 L250 40" fill="none" stroke="#cbd5e1" strokeWidth="1.5" /><circle cx="150" cy="100" r="5" fill="#d8b4fe" /></svg>
          <h1 className="chainface-metallic-title">ChainFace</h1>
      </div>

      <div className="page-container">
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* ID CARD */}
              <div className="identity-card-container">
                  <div className="card-content">
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '5px' }}>
                            {/* Gold Badge (Always) */}
                            <img src="https://cdn-icons-png.flaticon.com/512/7641/7641727.png" width="20" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }} />
                            {/* Additional Badges Logic */}
                            {(profileData.verifiedLevel === 'blue' || profileData.verifiedLevel === 'green') && <img src="https://cdn-icons-png.flaticon.com/512/7641/7641727.png" width="20" style={{ filter: 'hue-rotate(200deg) drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }} />}
                            {profileData.verifiedLevel === 'green' && <img src="https://cdn-icons-png.flaticon.com/512/7641/7641727.png" width="20" style={{ filter: 'hue-rotate(100deg) drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }} />}
                      </div>
                      <span className="card-name">{profileData.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '3px', marginTop: '5px' }}>{[1,2,3,4,5].map(i => <i key={i} className="bi bi-star-fill" style={{ color: '#F0C420', fontSize: '10px' }}></i>)}</div>
              </div>

              {/* VERIFICATION BUTTONS (Appears below card for Owner) */}
              {isOwner && (
                  <div className="verify-btn-group">
                      <button className="v-btn" onClick={() => handleVerification('phone')}>
                          <div className="v-icon" style={{ background: '#10b981' }}><i className="bi bi-telephone-fill"></i></div>
                          <div className="v-text"><span className="v-title">Verify Phone</span><span className="v-sub">Get Green Badge</span></div>
                      </button>
                      <button className="v-btn" onClick={() => handleVerification('id')}>
                          <div className="v-icon" style={{ background: '#3b82f6' }}><i className="bi bi-person-vcard-fill"></i></div>
                          <div className="v-text"><span className="v-title">Verify Identity</span><span className="v-sub">Get Blue Badge</span></div>
                      </button>
                  </div>
              )}
          </div>

          <div className="conviction-box" style={{ textAlign: 'center', margin: '30px 0' }}>
              <span style={{ display: 'block', color: '#2E1A47', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Conviction</span>
              <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '5px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '900', color: '#2E1A47' }}>{new Intl.NumberFormat().format(profileData.stats.conviction)}</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#a855f7' }}>NNM</span>
              </div>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
              
              {/* Wallet Header (Owner Only) */}
              {isOwner && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Payment Methods</span>
                      <button onClick={() => setIsModalOpen(true)} style={{ background: 'transparent', border: '1px solid #2E1A47', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: 'bold', color: '#2E1A47', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <i className="bi bi-sliders"></i> Edit Wallets
                      </button>
                  </div>
              )}

              <div className="pay-grid">
                  {Object.keys(COIN_LOGOS).filter(k => k !== 'WALLET').map(coin => {
                      const addr = profileData.wallets[coin.toLowerCase()] || profileData.wallets[coin === 'POLYGON' ? 'polygon' : ''];
                      if (!isOwner && !addr) return null; // Visitor sees only active
                      return <Web3PaymentButton key={coin} type={coin} name={coin === 'POLYGON' ? 'Polygon' : coin} address={addr} isOwner={isOwner} onClick={() => handleWalletClick(coin, addr)} />;
                  })}
                  {!isOwner && Object.values(profileData.wallets).every(x => !x) && (
                      <Web3PaymentButton type="WALLET" name="Owner Wallet" address={profileData.owner} onClick={() => handleWalletClick('WALLET', profileData.owner)} />
                  )}
              </div>

              <p className="footer-note" style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>Payments are peer-to-peer. ChainFace never holds funds.</p>

              <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: '700', fontSize: '18px', color: '#2E1A47' }}>{profileData.name}</h2>
                <p style={{ color: '#2E1A47', fontSize: '16px', fontWeight: '600', marginTop: '5px' }}>{profileData.customMessage}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                  <i className={`bi bi-hand-thumbs-up-fill ${feedback === 'like' ? 'text-warning' : 'text-secondary'}`} style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => setFeedback('like')}></i>
                  <i className={`bi bi-hand-thumbs-down-fill ${feedback === 'dislike' ? 'text-warning' : 'text-secondary'}`} style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => setFeedback('dislike')}></i>
              </div>
          </div>
      </div>

      {/* SHARE FOOTER */}
      <div style={{ padding: '20px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', position: 'fixed', bottom: 0, width: '100%', zIndex: 900 }}>
          <button className="share-footer-btn" onClick={handleShare}>
              SHARE PROFILE <i className="bi bi-share-fill"></i>
          </button>
      </div>

    </main>
  );
}
