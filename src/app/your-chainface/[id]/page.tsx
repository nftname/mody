'use client';
import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAccount, useReadContract, useSendTransaction, useWriteContract, useSwitchChain } from 'wagmi';
import { parseAbi, parseEther } from 'viem';
import { NFT_COLLECTION_ADDRESS } from '@/data/config'; 
import { supabase } from '@/lib/supabase';
import { useEVMPayment } from '@/hooks/useEVMPayment';
import { useNonEVMPayment } from '@/hooks/useNonEVMPayment';

// --- PAYMENT CONFIG ---
const TREASURY_ADDRESS = "0x8B0251c2Ce9836A3867adb9a371802AdfFaaC824"; // محفظتك
const USDT_POLYGON_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // عقد USDT الرسمي
const VERIFICATION_COST_USDT = "1000000"; // 1 USDT (6 decimals)

const ERC20_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)"
]);


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

        {}
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


const ThreeVerificationBadges = ({ isPhoneVerified, isKycVerified }: { isPhoneVerified: boolean, isKycVerified: boolean }) => {
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

            <svg viewBox="0 0 25 25" style={badgeStyle} xmlns="http://www.w3.org/2000/svg" className="verification-badge">
                 <path d={badgePath} fill="url(#goldLuxury)" />
                 <path d={checkPath} fill="#FFFFFF" />
            </svg>

            {isPhoneVerified && (
                <svg viewBox="0 0 25 25" style={badgeStyle} xmlns="http://www.w3.org/2000/svg" className="verification-badge">
                    <path d={badgePath} fill="url(#greenLuxury)" />
                    <path d={checkPath} fill="#FFFFFF" />
                </svg>
            )}

            {isKycVerified && (
                <svg viewBox="0 0 25 25" style={badgeStyle} xmlns="http://www.w3.org/2000/svg" className="verification-badge">
                    <path d={badgePath} fill="url(#blueLuxury)" />
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

const ChainFaceButton = ({ name, currentUrl, isOwner }: { name: string, currentUrl: string, isOwner?: boolean }) => {
  const qrBg = currentUrl ? `url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}&bgcolor=ffffff')` : 'none';
  
  return (
    <Link href={isOwner ? "/dashboard" : "/mint"} className="signature-btn">
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
    const [saveSuccess, setSaveSuccess] = useState(false); 

    useEffect(() => {
        if (isOpen) {
            setSelectedCoin(null);
            setSaveSuccess(false);
            setIsSaving(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!selectedCoin) return;
        setIsSaving(true);
        await onSave(selectedCoin, addressInput);
        setIsSaving(false);
        setSaveSuccess(true); 

        setTimeout(() => {
            setSaveSuccess(false);
            setSelectedCoin(null); 
        }, 1000);
    };

    const handleBackgroundClick = (e: any) => {
        if (e.target === e.currentTarget) onClose();
    };

    const deepPurple = '#2E1A47';

    return (
        <div onClick={handleBackgroundClick} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(46, 26, 71, 0.6)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="fade-in" style={{ width: '90%', maxWidth: '400px', backgroundColor: '#ffffff', border: `1px solid ${deepPurple}`, borderRadius: '24px', padding: '30px', boxShadow: '0 20px 60px rgba(46, 26, 71, 0.2)', position: 'relative', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer', zIndex: 10 }}><i className="bi bi-x-lg"></i></button>
                
                <h3 style={{ color: deepPurple, fontSize: '20px', textAlign: 'center', marginBottom: '20px', fontFamily: 'Outfit, sans-serif', fontWeight: '700', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    {selectedCoin ? `Configure ${selectedCoin}` : 'Select Wallet'}
                </h3>

                {!selectedCoin ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        
              {['BTC', 'ETH', 'SOL', 'BNB', 'USDT', 'POLYGON'].map(coin => {
                   const stateKey = coin === 'POLYGON' ? 'matic' : coin.toLowerCase();
                   return (
                <button key={coin} onClick={() => { setSelectedCoin(coin); setAddressInput(wallets[stateKey] || ''); }} 
                    style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '15px', color: deepPurple, display: 'flex', alignItems:                'center', gap: '10px', cursor: 'pointer', transition: '0.2s' }}>
                     <img src={COIN_LOGOS[coin]} width="28" height="28" alt={coin} />
                    <span style={{fontSize: '14px', fontWeight: '700'}}>{coin}</span>
                 </button>
               );
            })}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                        <div style={{fontSize:'13px', color: '#666'}}>Paste your <b>{selectedCoin}</b> address:</div>
                        
                        <input type="text" value={addressInput} onChange={(e) => setAddressInput(e.target.value)} placeholder="0x..." 
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#fff', border: '2px solid #e5e7eb', color: '#333', fontSize: '14px', outline: 'none', fontFamily: 'monospace' }} autoFocus />
                        
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                            <button onClick={() => setSelectedCoin(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: `1px solid ${deepPurple}`, color: deepPurple, fontWeight: '600' }}>Back</button>
                            
                            <button onClick={handleSave} disabled={isSaving || saveSuccess} 
                                style={{ 
                                    flex: 2, padding: '12px', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold',
                                    background: saveSuccess ? '#10B981' : deepPurple, 
                                    transition: '0.3s'
                                }}>
                                {isSaving ? 'Saving...' : (saveSuccess ? <span>Saved <i className="bi bi-check-lg"></i></span> : 'Confirm')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const PaymentModal = ({ isOpen, onClose, coin, address, onConfirm }: any) => {
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [walletError, setWalletError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setIsProcessing(false);
            setCopied(false);
            setWalletError(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePay = async () => {
        if (!amount || parseFloat(amount) <= 0) return;
        setIsProcessing(true);
        setWalletError(false);
        try {
            await onConfirm(amount);
        } catch (error: any) {
            if (error.message === "WALLET_NOT_FOUND") {
                setWalletError(true);
            }
        }
        setIsProcessing(false);
    };

    const handleBackgroundClick = (e: any) => {
        if (e.target === e.currentTarget) onClose();
    };

    const deepPurple = '#2E1A47';
    const shortAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '';

    return (
        <div onClick={handleBackgroundClick} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(46, 26, 71, 0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="fade-in" style={{ width: '85%', maxWidth: '300px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '18px', boxShadow: '0 15px 40px rgba(46, 26, 71, 0.2)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#999', fontSize: '16px', cursor: 'pointer', zIndex: 10 }}><i className="bi bi-x-lg"></i></button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <img src={COIN_LOGOS[coin] || COIN_LOGOS.WALLET} width="20" height="20" alt={coin} style={{ objectFit: 'contain' }} />
                    <h3 style={{ margin: 0, color: deepPurple, fontSize: '15px', fontFamily: 'Outfit, sans-serif', fontWeight: '700' }}>
                        Send {coin}
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '8px', border: '1px solid #e9ecef', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontWeight: '600', display: 'block', marginBottom: '2px', color: '#888', fontSize: '9px', textTransform: 'uppercase' }}>Recipient Address:</span>
                            <div style={{ fontSize: '12px', color: '#333', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                {shortAddress}
                            </div>
                        </div>
                        <button onClick={handleCopy} style={{ background: '#e5e7eb', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', color: '#4b5563', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {copied ? <><i className="bi bi-check2"></i> <span style={{fontSize:'9px', fontWeight:'bold'}}>Copied</span></> : <i className="bi bi-copy"></i>}
                        </button>
                    </div>

                    {walletError && (
                        <div style={{ fontSize: '10px', color: '#dc2626', background: '#fee2e2', padding: '8px', borderRadius: '6px', textAlign: 'center', fontWeight: '600' }}>
                            Wallet not found. Please copy the address and pay manually.
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: '600', color: '#333' }}>Amount</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text" 
                                inputMode="decimal"
                                value={amount} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                        setAmount(val);
                                    }
                                }} 
                                placeholder="0.00" 
                                style={{ width: '100%', padding: '8px 35px 8px 10px', borderRadius: '8px', background: '#fff', border: '1px solid #d1d5db', color: '#333', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif', fontWeight: '500' }} 
                                autoFocus 
                            />
                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: '600', color: '#888', fontSize: '11px', pointerEvents: 'none' }}>
                                {coin}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={handlePay} 
                        disabled={isProcessing || !amount} 
                        style={{ 
                            marginTop: '4px',
                            width: '100%', 
                            padding: '10px', 
                            borderRadius: '8px', 
                            border: 'none', 
                            color: '#fff', 
                            fontWeight: '600',
                            fontSize: '13px',
                            background: deepPurple, 
                            cursor: (isProcessing || !amount) ? 'default' : 'pointer',
                            opacity: (isProcessing || !amount) ? 0.7 : 1,
                            transition: '0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}>
                        {isProcessing ? 'Processing...' : (
                            <>
                                <span>Pay Now</span>
                                <img src={COIN_LOGOS[coin]} width="14" height="14" style={{ filter: 'brightness(0) invert(1)' }} alt="" />
                            </>
                        )}
                    </button>
                </div>
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
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();


   // --- VERIFICATION PAYMENT LOGIC ---
  const { writeContractAsync } = useWriteContract();
  const [verifyStep, setVerifyStep] = useState<'idle' | 'confirm' | 'paying' | 'success'>('idle');

  const [targetVerifyType, setTargetVerifyType] = useState<'phone' | 'kyc' | null>(null);

  const handleVerificationRequest = (type: 'phone' | 'kyc') => {
      setTargetVerifyType(type);
      setVerifyStep('confirm'); // Open Modal
  };

  
 
     const executeVerificationPayment = async () => {
      if (!targetVerifyType) return;
      
      // 1. Show processing state inside the modal
      setVerifyStep('paying');

      try {
          // 2. Execute Payment (Wallet Popup Only)
          const hash = await writeContractAsync({
              address: USDT_POLYGON_ADDRESS,
              abi: ERC20_ABI,
              functionName: 'transfer',
              args: [TREASURY_ADDRESS, BigInt(VERIFICATION_COST_USDT)], 
          });

          // 3. Success! Update UI instantly to Green Step (No Browser Alert)
          setVerifyStep('success');
          
      } catch (error: any) {
          console.error("Payment Failed:", error);
          // If failed, just go back to confirm button silently or show red border
          setVerifyStep('confirm'); 
      }
  };
  const openSumsubWindow = () => {
      const baseUrl = "https://verify.didit.me/u/Tsy0RqfeTfGJVuQBAb5h7A";
      const walletParam = address || 'unknown';
      const finalUrl = `${baseUrl}?client_user_id=${walletParam}&vendor_data=${walletParam}`;
      
      window.open(finalUrl, '_blank');
      
      setVerifyStep('idle');
      setTargetVerifyType(null);
  };




  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>({
      name: '',
      owner: '',
      customMessage: '',
     isPhoneVerified: false,
      isKycVerified: false,

      wallets: { btc: '', eth: '', sol: '', bnb: '', usdt: '', matic: '' },
      stats: { conviction: 0, likes: 0, dislikes: 0 }
  });
  const [isOwner, setIsOwner] = useState(false);
    const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
   // --- NEW PAYMENT MODAL STATE ---
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentCoin, setSelectedPaymentCoin] = useState<string | null>(null);
  const [selectedPaymentAddress, setSelectedPaymentAddress] = useState<string>('');
  const { processEVMPayment } = useEVMPayment();
  const { processNonEVMPayment } = useNonEVMPayment();

  
  const [messages, setMessages] = useState<any[]>([]);
  const [visitorMessage, setVisitorMessage] = useState('');
  const [showVisitorBox, setShowVisitorBox] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isLinkExpired, setIsLinkExpired] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSaveWallet = async (coin: string, walletAddr: string) => {
      if (!isOwner) return;
      
      const columnMap: any = { 
          'BTC': 'btc_address', 
          'ETH': 'eth_address', 
          'SOL': 'sol_address', 
          'BNB': 'bnb_address', 
          'USDT': 'usdt_address', 
          'POLYGON': 'matic_address' 
      };

      try {
          const updates: any = { 
              owner_address: address, 
              updated_at: new Date().toISOString() 
          };
          
          updates[columnMap[coin]] = walletAddr; 

          const { error } = await supabase
              .from('chainface_profiles')
              .update(updates)
              .eq('token_id', Number(tokenId));

          if (error) {
              const { error: insertError } = await supabase
                  .from('chainface_profiles')
                  .upsert({ token_id: Number(tokenId), ...updates }, { onConflict: 'token_id' });
              if (insertError) throw insertError;
          }

          const stateKey = coin === 'POLYGON' ? 'matic' : coin.toLowerCase();
          setProfileData((prev: any) => ({
              ...prev, 
              wallets: { ...prev.wallets, [stateKey]: walletAddr }
          }));

      } catch (e) { 
          console.error("Save execution failed", e); 
      }
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

  // --- DATA FETCHING (TRIGGER ACTIVATOR) ---
  const fetchChainFaceData = useCallback(async (isInitialLoad = false) => {
    if (!tokenId || !realOwnerAddress) return;
    if (isInitialLoad) setLoading(true);

      try {
          const currentOwnerStr = String(realOwnerAddress).toLowerCase();
          
          const urlParams = new URLSearchParams(window.location.search);
          const ownerInLink = urlParams.get('owner')?.toLowerCase();
          
          if (ownerInLink && ownerInLink !== currentOwnerStr) {
              setIsLinkExpired(true);
          }

          let assetName = `NNM #${tokenId}`;
          if (tokenURI) {
              const url = tokenURI.startsWith('ipfs://') ? tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : tokenURI;
              const meta = await fetch(url).then(res => res.json()).catch(() => ({}));
              if (meta.name) assetName = meta.name;
          }

          const { data: votesData } = await supabase
              .from('conviction_votes')
              .select('amount')
              .eq('token_id', tokenId);

          const totalConviction = votesData?.reduce((acc: number, curr: any) => acc + (curr.amount || 100), 0) || 0;
          const { data: walletVerification } = await supabase
              .from('chainface_wallet_verifications')
              .select('is_phone_verified, is_kyc_verified')
              .eq('wallet_address', currentOwnerStr)
              .maybeSingle();

          const { data: profile } = await supabase
              .from('chainface_profiles')
              .select('*')
              .eq('token_id', tokenId)
              .maybeSingle();

          let safeProfile = profile;

          // =============================================================
          if (profile && profile.owner_address && profile.owner_address.toLowerCase() !== currentOwnerStr) {
              
              console.log("New Owner Detected! Updating DB to trigger auto-wipe...");

              await supabase.from('chainface_profiles').update({
    owner_address: currentOwnerStr,
    btc_address: null,
    eth_address: null,
    sol_address: null,
    bnb_address: null,
    usdt_address: null,
    matic_address: null,
    updated_at: new Date().toISOString()
}).eq('token_id', tokenId);

await supabase.from('chainface_wallet_verifications').update({
    is_phone_verified: false,
    is_kyc_verified: false
}).eq('wallet_address', currentOwnerStr);
;

              safeProfile = null;
              setMessages([]); 
          }
          // ============================================================

          setProfileData({
              name: assetName,
              owner: currentOwnerStr,
              customMessage: safeProfile?.custom_message || '',
              isPhoneVerified: walletVerification?.is_phone_verified || false,
              isKycVerified: walletVerification?.is_kyc_verified || false,

              wallets: {
                  btc: safeProfile?.btc_address || '',
                  eth: safeProfile?.eth_address || '',
                  sol: safeProfile?.sol_address || '',
                  bnb: safeProfile?.bnb_address || '',
                  usdt: safeProfile?.usdt_address || '',
                  matic: safeProfile?.matic_address || ''
              },
              stats: {
                  conviction: totalConviction,
                  likes: safeProfile?.likes_count || 0,
                  dislikes: safeProfile?.dislikes_count || 0
              }
          });

          if (address && currentOwnerStr && address.toLowerCase() === currentOwnerStr) {
              setIsOwner(true);
          } else {
              setIsOwner(false);
          }

      } catch (err) {
          console.error("Error:", err);
      } finally {
          setLoading(false);
      }
  }, [tokenId, realOwnerAddress, tokenURI, address]);

  const fetchMessages = useCallback(async () => {
    if (!isOwner || !tokenId) return;
    const { data } = await supabase
      .from('chainface_messages')
      .select('*')
      .eq('token_id', tokenId)
      .order('created_at', { ascending: sortOrder === 'oldest' });
    if (data) setMessages(data);
  }, [tokenId, isOwner, sortOrder]);

   useEffect(() => {
    fetchChainFaceData(true);
    const handleFocus = () => fetchChainFaceData(false);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
}, [fetchChainFaceData]);


  useEffect(() => {
      if (isOwner) fetchMessages();
  }, [isOwner, sortOrder, fetchMessages]);

  const handleSendMessage = async () => {
    if (!visitorMessage.trim()) return;
    setIsSending(true);
    await supabase.from('chainface_messages').insert([
      { token_id: Number(tokenId), message_text: visitorMessage, sender_wallet: address || 'Anonymous' }
    ]);
    setVisitorMessage('');
    setShowVisitorBox(false);
    setIsSending(false);
  };

  
const handleWalletAction = (walletAddr: string, coin: string) => {
    if (!walletAddr || isLinkExpired) return;
    setSelectedPaymentCoin(coin);
    setSelectedPaymentAddress(walletAddr);
    setPaymentModalOpen(true);
    setShowVisitorBox(true);
};

const handleConfirmPayment = async (amount: string) => {
    if (!selectedPaymentCoin || !selectedPaymentAddress) return;
    
    try {
        const lowerCoin = selectedPaymentCoin.toLowerCase();
        let txHash;

        if (lowerCoin === 'btc' || lowerCoin === 'sol') {
            await processNonEVMPayment(selectedPaymentCoin, selectedPaymentAddress, amount);
            setPaymentModalOpen(false);
            setShowVisitorBox(true);
            return;
        }

        txHash = await processEVMPayment(selectedPaymentCoin, selectedPaymentAddress, amount);

        if (txHash) {
            await fetch('/api/nnm/chainface-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokenId: tokenId,
                    sender: address || 'Anonymous_Visitor',
                    receiver: profileData.owner,
                    coin: selectedPaymentCoin,
                    amount: amount,
                    txHash: txHash
                })
            });
            setPaymentModalOpen(false);
            setShowVisitorBox(true);
            fetchChainFaceData(false);
        }
    } catch (e: any) {
        console.error(e);
        throw e;
    }
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
          alert('Link Copied!');
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

  const getSecureUrl = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    if (profileData.owner) url.searchParams.set('owner', profileData.owner);
    return url.toString();
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(getSecureUrl());
      setCopiedTip('link');
      setTimeout(() => setCopiedTip(null), 2000);
  };
  

  const handleShareClick = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const element = document.getElementById('cf-btn');
    if (!element) return;

    element.classList.add('screenshot-mode');

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
            const el = clonedDoc.getElementById('cf-btn');
            if (!el) return;

            const nameEl = el.querySelector('.sig-name') as any;
            if (nameEl) {
                nameEl.style.background = 'none';
                nameEl.style.webkitTextFillColor = '#ffffff';
                nameEl.style.color = '#ffffff';
                nameEl.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
            }

            const btnEl = el.querySelector('.signature-btn') as any;
            if (btnEl) {
                btnEl.style.background = '#2E1A47';
                btnEl.style.boxShadow = 'none';
                btnEl.style.border = '1px solid #4a3b69';
            }
        }
      });

      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png', 1.0));
      element.classList.remove('screenshot-mode');

      if (!blob) return;
      
      const file = new File([blob], 'chainface-id.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `ChainFace: ${profileData.name}`,
          text: `My Verified Web3 Profile\n${getSecureUrl()}`,
        });
      } else {
        setShowShareMenu(!showShareMenu);
      }
    } catch (error) {
      console.error(error);
      element.classList.remove('screenshot-mode');
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
            margin-top: -60px; 
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
            gap: 12px;
            max-width: 600px;
            margin: 0 auto;
        }

        .web3-payment-btn {
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            height: 54px;
            width: 100%;
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 0 10px;
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
            width: 24px; 
            height: 24px;
            min-width: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
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
            font-size: 12px;
            color: #111827;
            line-height: 1.1;
        }

        .action-text {
            font-size: 9px;
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
            height: 68px !important;
            min-height: 68px !important;
            max-height: 68px !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            background: linear-gradient(110deg, #5e1139 0%, #240b36 50%, #020c1b 100%);
            border-radius: 30px;
            padding: 0 12px 0 24px;
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
    line-height: 1.4;      
    padding-bottom: 3px;   
    margin-top: -2px;      
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
                margin-top: -60px;
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
                gap: 8px;
            }
            
            .web3-payment-btn {
                height: 45px;
                padding: 0 8px;
            }
            
            .token-name {
                font-size: 11px;
            }
        }
                    .action-btn {
            transition: transform 0.1s ease !important;
        }
        .action-btn:active {
            transform: scale(0.9) !important; 
            background-color: #e0e0e0 !important; 
        }

      `}</style>

      <div className="hero-banner-wrapper">
           <div className="back-btn" onClick={() => router.back()} style={{ zIndex: 99999, cursor: 'pointer' }}>
    <i className="bi bi-arrow-left"></i>
</div>


       <div className="header-qr-btn" title="Scan to Share Profile">
              <img 
                src={qrCodeUrl} 
                alt="Profile QR Code" 
                className="qr-image-generated"
              />
          </div>
   
          {}
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
                  <ThreeVerificationBadges isPhoneVerified={profileData.isPhoneVerified} isKycVerified={profileData.isKycVerified} />
                  
                  <div className="card-name-row">
                      {/* Dynamic Name */}
                      <span className="card-name">{profileData.name}</span>
                  </div>
              </div>
              <FiveStars count={5} />
          </div>

{/* --- (MOD 3-A) Verification Buttons (SECURE & PAID) --- */}
           {isOwner && address && address.toLowerCase() === profileData.owner?.toLowerCase() && (
              <div style={{ marginTop: '20px', marginLeft: '10%', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start', position: 'relative' }}>
                  
                  {/* DISCLAIMER TEXT */}
                  <p style={{ fontSize: '9px', color: '#9CA3AF', maxWidth: '240px', lineHeight: '1.3', marginBottom: '5px', fontStyle: 'italic' }}>
                      Verification is processed by an independent provider. ChainFace does not store personal data. 
                      <span style={{ color: '#10B981', fontWeight: '600', display: 'block', marginTop: '2px' }}>
                          (Cost: 1 USDT • One-time fee for all assets)
                      </span>
                  </p>

                  {/* SINGLE COMBINED BUTTON WITH STARS */}
                  {(!profileData.isPhoneVerified || !profileData.isKycVerified) && (
                      <button onClick={() => handleVerificationRequest('kyc')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#4B5563', fontSize: '13px', cursor: 'pointer', fontWeight: '700', transition: '0.2s' }}>
                          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #EFF6FF 0%, #ECFDF5 100%)', border: '1px solid #3B82F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E1A47', fontSize: '14px' }}>
                              <i className="bi bi-shield-fill-check"></i>
                          </div>
                          <span style={{ borderBottom: '1px dotted #999' }}>Verify Phone, ID & Face</span>
                          
                          {/* VISUAL STARS PREVIEW */}
                          <div style={{ display: 'flex', gap: '2px', marginLeft: '5px' }}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="#10B981">
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="#3B82F6">
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                          </div>
                      </button>
                  )}
              </div>
          )}


                    <div style={{ position: 'relative', textAlign: 'center', marginTop: '30px', marginBottom: '45px' }}>
              <span style={{ 
                  display: 'block', 
                  fontSize: '8px', 
                  fontWeight: '700', 
                  letterSpacing: '2px', 
                  textTransform: 'uppercase', 
                  color: '#64748B',
                  marginBottom: '4px',
                  fontFamily: '"Inter", sans-serif',
                  opacity: '0.85'
              }}>
                  Conviction
              </span>
              
              <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '6px' 
              }}>
                  {/* Dynamic Conviction Score with New Styling */}
                  <span style={{ 
                      color: '#0F172A',
                      fontSize: '19px', 
                      fontWeight: '700', 
                      fontFamily: '"Satoshi", sans-serif',
                      letterSpacing: '-0.2px',
                      lineHeight: '1',
                      paddingTop: '2px'
                  }}>
                      {new Intl.NumberFormat('en-US').format(profileData.stats.conviction)}
                  </span>

                  {/* Royal Blue Diamond Icon */}
                  <img 
                      src="https://cdn-icons-png.flaticon.com/512/3557/3557840.png" 
                      alt="Royal Blue Diamond" 
                      width="17" 
                      height="17" 
                      style={{ 
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 4px rgba(0, 150, 255, 0.2))'
                      }}
                  />
              </div>
          </div>


          <div style={{ maxWidth: '800px', margin: '20px auto', textAlign: 'center', padding: '0 20px' }}>
              
                       {/* --- (MOD 3-B) Wallet Config & Buttons --- */}
              {isOwner && address && address.toLowerCase() === profileData.owner?.toLowerCase() && (

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <button onClick={() => setIsModalOpen(true)} style={{ background: 'transparent', border: '1px solid #2E1A47', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', fontWeight: 'bold', color: '#2E1A47', cursor: 'pointer' }}>
                          <i className="bi bi-gear-fill me-1"></i> Settings
                      </button>
                  </div>
              )}
              
              <WalletEditorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} wallets={profileData.wallets} onSave={handleSaveWallet} />
                  {/* --- VERIFICATION PAYMENT MODAL (UPDATED) --- */}
            {verifyStep !== 'idle' && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="fade-in" style={{ background: '#fff', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '320px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                        
                        {/* ICON */}
                        <div style={{ width: '50px', height: '50px', background: verifyStep === 'success' ? '#ECFDF5' : '#F0FDF4', borderRadius: '50%', color: verifyStep === 'success' ? '#10B981' : '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontSize: '24px' }}>
                            <i className={`bi ${verifyStep === 'success' ? 'bi-check-lg' : 'bi-shield-lock-fill'}`}></i>
                        </div>
                        
                        {/* TITLE & TEXT */}
                        <h3 style={{ margin: '0 0 10px', color: '#2E1A47', fontFamily: 'Outfit, sans-serif' }}>
                            {verifyStep === 'success' ? 'Payment Successful!' : 'Secure Verification'}
                        </h3>
                        
                        {verifyStep !== 'success' && (
                            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5', marginBottom: '20px' }}>
                                To prevent spam and cover processing fees, a one-time fee is required.
                                <br/><br/>
                                <strong style={{ color: '#000', fontSize: '16px' }}>Cost: 1 USDT</strong>
                            </p>
                        )}

                        {/* BUTTONS */}
                        {verifyStep === 'success' ? (
                            <button 
                                onClick={openSumsubWindow} 
                                style={{ width: '100%', padding: '14px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                                Continue to Verification <i className="bi bi-arrow-right ml-2"></i>
                            </button>
                        ) : (
                            <button 
                                onClick={executeVerificationPayment} 
                                disabled={verifyStep === 'paying'}
                                style={{ width: '100%', padding: '14px', background: '#2E1A47', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: verifyStep === 'paying' ? 'default' : 'pointer', opacity: verifyStep === 'paying' ? 0.7 : 1 }}>
                                {verifyStep === 'paying' ? 'Processing Payment...' : 'Pay & Verify Now'}
                            </button>
                        )}
                        
                        {verifyStep !== 'success' && verifyStep !== 'paying' && (
                            <button onClick={() => setVerifyStep('idle')} style={{ marginTop: '10px', background: 'transparent', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                        )}
                    </div>
                </div>
            )}


              <PaymentModal 
                  isOpen={paymentModalOpen} 
                  onClose={() => setPaymentModalOpen(false)} 
                  coin={selectedPaymentCoin} 
                  address={selectedPaymentAddress} 
                  onConfirm={handleConfirmPayment} 
              />
                    
              <div className="pay-grid">
                  {Object.keys(COIN_LOGOS).filter(k => k !== 'WALLET').map(coin => {
                      const addr = profileData.wallets[coin === 'POLYGON' ? 'matic' : coin.toLowerCase()];
                      
                      return (
                          <Web3PaymentButton 
                              key={coin}
                              type={coin} 
                              name={coin === 'POLYGON' ? 'Polygon' : coin} 
                              address={addr} 
                              isOwner={isOwner} 
                              onRemove={() => handleRemoveWallet(coin)} 
                             
                              onClick={() => isOwner ? setIsModalOpen(true) : handleWalletAction(addr, coin)} 
                          />
                      );
                  })}
              </div>

{isLinkExpired && (
    <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '15px', borderRadius: '16px', fontSize: '13px', fontWeight: '600', marginBottom: '25px', textAlign: 'center' }}>
        ⚠️ This link belongs to a previous owner. Please ask for the current secure link.
    </div>
)}



<p className="footer-note">
                  Payments are peer-to-peer. ChainFace never holds funds.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '40px 0' }}>
                  <i className={`bi bi-hand-thumbs-up-fill ${feedback === 'like' ? 'text-warning' : ''}`} 
                     style={{ fontSize: '24px', cursor: 'pointer', transition: '0.3s', color: feedback === 'like' ? '' : '#d1d5db' }}
                     onClick={() => handleSupportClick('like')}></i>
                  <i className={`bi bi-hand-thumbs-down-fill ${feedback === 'dislike' ? 'text-warning' : ''}`} 
                     style={{ fontSize: '24px', cursor: 'pointer', transition: '0.3s', color: feedback === 'dislike' ? '' : '#d1d5db' }}
                     onClick={() => handleSupportClick('dislike')}></i>
              </div>

              {!isOwner && showVisitorBox && (
                  <div className="fade-in" style={{ margin: '30px auto', padding: '20px', background: '#fff', borderRadius: '24px', border: '1px solid #eee', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', textAlign: 'left', maxWidth: '600px' }}>
                      <textarea 
                          value={visitorMessage}
                          onChange={(e) => setVisitorMessage(e.target.value)}
                          placeholder="....."
                          style={{ width: '100%', minHeight: '100px', border: 'none', background: '#f8f9fa', borderRadius: '15px', padding: '15px', fontSize: '14px', outline: 'none', resize: 'none', color: '#2E1A47' }}
                      />
                      <button onClick={handleSendMessage} disabled={isSending} style={{ display: 'block', width: '25%', marginLeft: 'auto', marginTop: '12px', padding: '10px', borderRadius: '12px', background: '#2E1A47', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '11px' }}>
                          {isSending ? '...' : 'Send'}
                      </button>
                  </div>
              )}
          </div>
      </div>

      {isOwner && address && address.toLowerCase() === profileData.owner?.toLowerCase() && (
        <>

     <div style={{ padding: '30px 20px', backgroundColor: '#fff', borderTop: '1px solid #eee', textAlign: 'center', position: 'relative' }}>
          
          <p style={{ color: '#2E1A47', fontSize: '14px', fontWeight: '500', marginBottom: '25px', lineHeight: '1.5' }}>
             Share this sovereign link button with friends, clients, or anyone you wish to view your page.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', position: 'relative' }}>
            
              {/* Share Button & Menu */}
              <div style={{ position: 'relative' }}>
                  <div onClick={handleShareClick} className="action-btn" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#2E1A47' }}>
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
<div id="cf-btn" style={{ display: 'inline-block', background: 'transparent', padding: '4px', borderRadius: '35px' }}>
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

              <div style={{ width: '80%', margin: '40px auto', paddingBottom: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                  <select 
                      value={sortOrder} 
                      onChange={(e:any) => setSortOrder(e.target.value)} 
                      style={{ 
                          border: '1px solid #ddd', 
                          background: '#fff', 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          padding: '6px 10px', 
                          borderRadius: '8px', 
                          color: '#2E1A47',
                          cursor: 'pointer',
                          outline: 'none',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                      }}
                  >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                  </select>
              </div>
              
              {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#ccc', fontSize: '13px' }}>Inbox empty.</div>
              ) : (
                  <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {messages.slice((currentPage - 1) * 10, currentPage * 10).map(m => (
                              <div key={m.id} style={{ padding: '15px', background: '#fff', borderRadius: '15px', border: '1px solid #f0f0f0' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '700', color: '#a855f7' }}>
                                      <a 
                                        href={`https://polygonscan.com/address/${m.sender_wallet}`} 
                                         target="_blank" 
                                         rel="noopener noreferrer"
                                   style={{ color: '#a855f7', textDecoration: 'underline', cursor: 'pointer' }}
                                         title="View on Explorer"
                                             >
                                       {m.sender_wallet.slice(0, 6)}...{m.sender_wallet.slice(-4)}
                                       </a>

                                      <span style={{ color: '#aaa' }}>{new Date(m.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#2E1A47' }}>{m.message_text}</p>
                              </div>
                          ))}
                      </div>

                      {messages.length > 10 && (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '25px' }}>
                              
                              <button 
                                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                  disabled={currentPage === 1}
                                  style={{ 
                                      background: 'transparent', 
                                      border: 'none', 
                                      cursor: currentPage === 1 ? 'default' : 'pointer', 
                                      opacity: currentPage === 1 ? 0.3 : 1,
                                      fontSize: '20px',
                                      color: '#2E1A47'
                                  }}
                              >
                                  <i className="bi bi-arrow-left-circle-fill"></i>
                              </button>

                              <span style={{ fontSize: '14px', fontWeight: '700', color: '#2E1A47' }}>
                                  {currentPage} <span style={{color:'#999', margin:'0 5px'}}>/</span> {Math.ceil(messages.length / 10)}
                              </span>

                              <button 
                                  onClick={() => currentPage < Math.ceil(messages.length / 10) && setCurrentPage(currentPage + 1)}
                                  disabled={currentPage >= Math.ceil(messages.length / 10)}
                                  style={{ 
                                      background: 'transparent', 
                                      border: 'none', 
                                      cursor: currentPage >= Math.ceil(messages.length / 10) ? 'default' : 'pointer', 
                                      opacity: currentPage >= Math.ceil(messages.length / 10) ? 0.3 : 1,
                                      fontSize: '20px',
                                      color: '#2E1A47'
                                  }}
                              >
                                  <i className="bi bi-arrow-right-circle-fill"></i>
                              </button>
                          </div>
                      )}
                  </>
              )}
          </div>

        </>
      )}
      
      {/* --- FOOTER START --- */}
      <div 
          onClick={() => router.push('/')}
          style={{
              width: '100%',
              height: '80px', 
              backgroundImage: 'radial-gradient(circle at center, #ffffff 40%, #f8f9fa 100%)',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginTop: 'auto',
              position: 'relative',
              zIndex: 10
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#2E1A47'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
      >
          <span style={{
              color: '#4b5563', 
              fontSize: '9px', 
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              transition: 'color 0.2s ease',
              textAlign: 'center',
              padding: '0 20px'
          }}>
              © 2025 NNM Digital Name Assets Market ChainFace. All rights reserved.
          </span>
      </div>
      {/* --- FOOTER END --- */}

    </main>
  );
}
