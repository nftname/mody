'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAccount, useWriteContract, useReadContract, usePublicClient } from "wagmi";
import { parseAbi, keccak256, stringToBytes } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { toBlob } from 'html-to-image'; // المكتبة المسؤولة عن التصوير
import { CONTRACT_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase';
import MintTemplate from '@/components/MintTemplate'; // استدعاء الاستوديو المخفي

// --- BUTTON CONSTANTS ---
const GOLD_BTN_PRIMARY = '#D4AF37';
const GOLD_BTN_HIGHLIGHT = '#E6C76A';
const GOLD_BTN_SHADOW = '#B8962E';

// ABI for the NFT Registry Contract
const CONTRACT_ABI = parseAbi([
  "function owner() view returns (address)",
  "function registeredNames(bytes32) view returns (bool)",
  "function getMaticCost(uint256 usdAmount) view returns (uint256)",
  "function mintPublic(string _name, uint8 _tier, string _tokenURI) payable",
  "function reserveName(string _name, uint8 _tier, string _tokenURI)"
]);

// الوصف الطويل (تم الحفاظ عليه كاملاً كما طلبت)
const LONG_DESCRIPTION = `GEN-0 Genesis — NNM Protocol Record

A singular, unreplicable digital artifact. This digital name is recorded on-chain with a verifiable creation timestamp and immutable registration data under the NNM protocol, serving as a canonical reference layer for historical name precedence within this system.

It represents a Gen-0 registered digital asset and exists solely as a transferable NFT, without renewal, guarantees, utility promises, or dependency. Ownership is absolute, cryptographically secured, and fully transferable. No subscriptions. No recurring fees. No centralized control. This record establishes the earliest verifiable origin of the name as recognized by the NNM protocol — a permanent, time-anchored digital inscription preserved on the blockchain.`;

const MintContent = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  
  // --- Refs for Snapshot Logic (الكاميرا) ---
  const templateRef = useRef<HTMLDivElement>(null);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState(''); 
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'process' | 'error' | 'success'>('process');
  const [processStep, setProcessStep] = useState(''); 
  const [mounted, setMounted] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [timer, setTimer] = useState(60);

  // حالة جديدة: تجهيز البيانات للقالب قبل التصوير
  const [snapshotData, setSnapshotData] = useState({ name: '', tier: 'ELITE' });

  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const isAdmin = address && ownerAddress && (address.toLowerCase() === ownerAddress.toLowerCase());

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- دالة نظام المكافآت (تم نقلها للأعلى لاستخدامها في العملية الرئيسية) ---
  const notifyRewardSystem = async (userWallet: any) => {
    try {
        await fetch('/api/nnm/mint-hook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: userWallet }),
        });
        console.log('Reward point added!');
    } catch (error) {
        console.error('Failed to add reward', error);
    }
  };

  // --- دالة التصوير (المحرك الجديد) ---
  const generateSnapshot = async (name: string, tier: string): Promise<Blob | null> => {
    // 1. وضع البيانات في القالب المخفي
    setSnapshotData({ name, tier });
    
    // 2. إعطاء مهلة بسيطة جداً (100ms) لضمان أن الرياكت قام بتحديث النص داخل القالب
    await new Promise(resolve => setTimeout(resolve, 100));

    if (templateRef.current) {
        try {
            // 3. التقاط الصورة بجودة عالية وتحويلها لملف Blob
            const blob = await toBlob(templateRef.current, { cacheBust: true, pixelRatio: 1 }); 
            // pixelRatio: 1 لأننا ضبطنا القالب على حجم كبير أصلاً (1080px)
            return blob;
        } catch (err) {
            console.error("Snapshot failed", err);
            return null;
        }
    }
    return null;
  };

  const handleInputFocus = () => {
    setStatus(null);   
    setErrorMessage('');
  };

  const checkAvailability = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm || searchTerm.length < 2) {
        setStatus('too_short');
        setIsSearching(false);
        return;
    }
    const cleanName = searchTerm.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (cleanName !== searchTerm) setSearchTerm(cleanName);

    setIsSearching(true);
    setStatus(null);

    try {
        if (!publicClient) return;
        const nameHash = keccak256(stringToBytes(cleanName));
        const isRegistered = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'registeredNames',
            args: [nameHash]
        });
        if (isRegistered) setStatus('taken');
        else setStatus('available');

    } catch (err: any) {
        console.error("Check Error:", err);
        setStatus('available'); 
    } finally {
        setIsSearching(false);
    }
  };

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (showModal && modalType === 'process' && timer > 0) {
        interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0 && modalType === 'process') {
        handleCloseModal(); 
    }
    return () => clearInterval(interval);
  }, [showModal, modalType, timer]);

  const handleCloseModal = () => {
    setShowModal(false);
    setIsSearching(false);
    setIsMinting(false);
    setTimer(60);
    setStatus(null);
    setSearchTerm('');
    setErrorMessage('');
    setProcessStep('');
  };

  const handleError = (err: any) => {
      console.error(err);
      const errStr = err?.message || JSON.stringify(err);
      let niceTitle = "Action Update";
      let niceMessage = "The process was interrupted. Please check your connection and try again.";

      if (errStr.includes("User rejected") || errStr.includes("User denied")) {
          niceTitle = "Action Cancelled";
          niceMessage = "You cancelled the transaction. No funds were deducted.";
      } 
      else if (errStr.includes("Insufficient funds") || errStr.includes("exceeds balance") || errStr.includes("low balance")) {
          niceTitle = "Insufficient Balance";
          niceMessage = "Your wallet balance is lower than the required amount (Price + Gas). Please top up POL and try again.";
      }

      setErrorTitle(niceTitle);
      setErrorMessage(niceMessage);
      setModalType('error');
      setShowModal(true);
  };

  // --- CORE MINT LOGIC (PRO VERSION - LINKED WITH NEW API) ---
  const handleMintProcess = async (tierName: string, tierIndex: number, priceDisplay: string) => {
      if (!searchTerm || !status || !publicClient) return;
      
      setIsMinting(true);
      // تغيير الرسالة لتناسب العملية الجديدة
      setProcessStep("Generative Engine: Creating high-res asset...");
      setModalType('process');
      setShowModal(true);

      try {
          // STEP A: Generate Snapshot (Client-Side)
          // هنا يتم استدعاء القالب المخفي لتكوين الصورة
          const imageBlob = await generateSnapshot(searchTerm, tierName);
          
          if (!imageBlob) throw new Error("Failed to generate asset snapshot locally.");

          // STEP B: Upload to API (The Postman)
          setProcessStep("Uploading: Securing asset on IPFS...");
          
          // تجهيز البيانات كـ FormData لأننا نرسل ملفاً حقيقياً وليس مجرد نص
          const formData = new FormData();
          formData.append('file', imageBlob, `NNM-${searchTerm}.png`);
          formData.append('name', searchTerm);
          formData.append('tier', tierName);

          const apiResponse = await fetch('/api/generate-image', { 
              method: 'POST',
              body: formData // إرسال الفورم داتا
          });

          if (!apiResponse.ok) {
              const errorData = await apiResponse.json();
              throw new Error(errorData.error || "Upload Failed");
          }

          const { gatewayUrl } = await apiResponse.json();
          console.log("SUCCESS: Asset uploaded at", gatewayUrl);

          // STEP C: Prepare Metadata (Full Data Preserved)
          // --- 1. Calculate Dynamic Date ---
          const date = new Date();
          const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          // This ensures the date is always the current month and year (e.g., "January 2026")
          const dynamicDate = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

          // --- 2. Update Metadata Object ---
          const metadataObject = {
            name: searchTerm,
            description: LONG_DESCRIPTION,
            image: gatewayUrl, 
            attributes: [
              { trait_type: "Asset Type", value: "Digital Name" },
              { trait_type: "Generation", value: "Gen-0" },
              { trait_type: "Tier", value: tierName },
              { trait_type: "Platform", value: "NNM Registry" },
              { trait_type: "Collection", value: "Genesis - 001" },
              // Use the dynamic variable here:
              { trait_type: "Mint Date", value: dynamicDate }
            ]
          };

          const jsonString = JSON.stringify(metadataObject);
          const tokenURI = `data:application/json;base64,${btoa(unescape(encodeURIComponent(jsonString)))}`;

          // STEP D: Blockchain Transaction
          setProcessStep("Wallet: Please sign the transaction...");

          let hash;
          if (isAdmin) {
            hash = await writeContractAsync({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: CONTRACT_ABI,
              functionName: 'reserveName',
              args: [searchTerm, tierIndex, tokenURI],
            });
          } else {
            // الحسابات المالية كما هي
            const usdVal = tierName === "IMMORTAL" ? 15 : tierName === "ELITE" ? 10 : 5;
            const usdAmountWei = BigInt(usdVal) * BigInt(10**18);
            const costInMatic = await publicClient.readContract({
               address: CONTRACT_ADDRESS as `0x${string}`,
               abi: CONTRACT_ABI,
               functionName: 'getMaticCost',
               args: [usdAmountWei]
            });
            const valueToSend = (costInMatic * BigInt(101)) / BigInt(100); 

            if (address) {
                const balance = await publicClient.getBalance({ address });
                if (balance < valueToSend) throw new Error("Insufficient funds (Pre-flight check): Low POL balance.");
            }
            
            hash = await writeContractAsync({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: CONTRACT_ABI,
              functionName: 'mintPublic',
              args: [searchTerm, tierIndex, tokenURI],
              value: valueToSend, 
            });
          }

          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          // STEP E: Finalize & Logging
          if (receipt.status === 'success') {
             // Supabase Logging
             const transferLog = receipt.logs.find(log => log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef');
             if (transferLog && transferLog.topics[3]) {
                 const mintedId = parseInt(transferLog.topics[3], 16);
                 supabase.from('activities').insert([{
                     token_id: mintedId,
                     activity_type: 'Mint',
                     from_address: '0x0000000000000000000000000000000000000000',
                     to_address: address, 
                     price: priceDisplay.replace('$',''),
                     created_at: new Date().toISOString()
                 }]);
             }
             if (address) notifyRewardSystem(address);
          }

          setModalType('success');
          setShowModal(true);

      } catch (err) {
          handleError(err);
      } finally {
          setIsMinting(false);
      }
  };

  const GOLD_GRADIENT = 'linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)';

  if (!mounted) return null;

  return (
    <main dir="ltr" style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '50px', position: 'relative', direction: 'ltr' }}>
      
      {/* === الاستوديو الخفي ===
         هذا المكون موجود في الصفحة ولكن تم إخراجه من الشاشة
         وظيفته: يتم وضع الاسم فيه، ثم تأخذ المكتبة صورة له وترسلها 
      */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <MintTemplate 
            ref={templateRef} 
            name={snapshotData.name} 
            tier={snapshotData.tier} 
        />
      </div>

      <div className="container hero-container text-center">
        <h1 className="text-white fw-bold mb-2" style={{ fontSize: '32px', fontFamily: 'serif', letterSpacing: '1px', color: '#E0E0E0' }}>
          Claim Your Nexus <span style={{ background: 'linear-gradient(180deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Digital Name</span> Assets
        </h1>
        <p className="mx-auto" style={{ maxWidth: '600px', fontFamily: '"Inter", "Segoe UI", sans-serif', fontSize: '15px', lineHeight: '1.6', color: '#B0B0B0' }}>
          Mint your visual Nexus Name asset on the Polygon network. First-come, first-served. Immutable. Global. Yours forever.
        </p>
      </div>

      <div className="container mb-1">
        <div className="mx-auto position-relative" style={{ maxWidth: '600px' }}>
          <form onSubmit={checkAvailability} className="position-relative">
            <input 
              type="text" 
              className="form-control text-white text-center" 
              placeholder="Enter name to check ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleInputFocus} 
              style={{ backgroundColor: '#161b22', border: status === 'available' ? '1px solid #0ecb81' : (status === 'taken' ? '1px solid #f6465d' : '1px solid rgba(252, 213, 53, 0.6)'), borderRadius: '50px', height: '52px', fontSize: '20px', fontWeight: '300', boxShadow: '0 0 30px rgba(0,0,0,0.5)', color: '#fff', caretColor: '#FCD535' }}
            />
            <button type="submit" className="btn position-absolute top-50 start-0 translate-middle-y ms-1 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', background: GOLD_GRADIENT, border: 'none', transition: 'all 0.3s', right: '5px' }}>
                {isSearching ? <div className="spinner-border text-dark" style={{ width: '18px', height: '18px' }} role="status"></div> : <i className="bi bi-search text-dark" style={{ fontSize: '20px' }}></i>}
            </button>
          </form>

          <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '6px', marginBottom: '0px' }}>
            {status === 'available' && <div className="d-inline-flex align-items-center gap-2 px-4 py-1 rounded-pill fade-in" style={{ backgroundColor: 'rgba(14, 203, 129, 0.1)', border: '1px solid #0ecb81' }}><i className="bi bi-check-circle-fill" style={{ color: '#0ecb81', fontSize: '14px' }}></i><span className="text-white fw-bold" style={{ fontSize: '13px' }}>Available! You can mint now.</span></div>}
            {status === 'taken' && <div className="d-inline-flex align-items-center gap-2 px-4 py-1 rounded-pill fade-in" style={{ backgroundColor: 'rgba(246, 70, 93, 0.1)', border: '1px solid #f6465d' }}><i className="bi bi-x-circle-fill" style={{ color: '#f6465d', fontSize: '14px' }}></i><span className="text-white fw-bold" style={{ fontSize: '13px' }}>Taken! Please choose another.</span></div>}
            {status === 'too_short' && <div className="d-inline-flex align-items-center gap-2 px-4 py-1 rounded-pill fade-in" style={{ backgroundColor: 'rgba(246, 70, 93, 0.1)', border: '1px solid #f6465d' }}><i className="bi bi-exclamation-circle-fill" style={{ color: '#f6465d', fontSize: '14px' }}></i><span className="text-white fw-bold" style={{ fontSize: '13px' }}>Min. 2 characters required!</span></div>}
          </div>
        </div>
      </div>

      <div className="container mt-0">
        <h5 className="text-white text-center mb-4 select-asset-title" style={{ letterSpacing: '2px', fontSize: '11px', textTransform: 'uppercase', color: '#888' }}>Select Asset Class</h5>
        <div className="row justify-content-center g-2 mobile-clean-stack"> 
            {/* 1. IMMORTAL Button */}
            <LuxuryIngot 
                label="IMMORTAL" 
                price="$15" 
                isAvailable={status === 'available'} 
                // Correctly passing "IMMORTAL"
                onMint={() => handleMintProcess("IMMORTAL", 0, "$15")} 
                isMinting={isMinting} 
            />

            {/* 2. ELITE Button */}
            <LuxuryIngot 
                label="ELITE" 
                price="$10" 
                isAvailable={status === 'available'} 
                // Correctly passing "ELITE"
                onMint={() => handleMintProcess("ELITE", 1, "$10")} 
                isMinting={isMinting} 
            />

            {/* 3. FOUNDERS Button */}
            <LuxuryIngot 
                label="FOUNDERS" 
                price="$5" 
                isAvailable={status === 'available'} 
                // CRITICAL FIX: Pass "FOUNDER" (singular) to match the image key and image filename
                onMint={() => handleMintProcess("FOUNDER", 2, "$5")} 
                isMinting={isMinting} 
            />
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#161b22', border: '1px solid #333', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', textAlign: 'center', position: 'relative' }}>
                <button onClick={handleCloseModal} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#666', fontSize: '24px', cursor: 'pointer', zIndex: 10 }}><i className="bi bi-x-lg"></i></button>

                {modalType === 'success' && (
                   <div className="fade-in">
                     <div className="mb-3"><i className="bi bi-check-circle-fill text-success" style={{fontSize: '3.5rem'}}></i></div>
                     <h3 className="text-white fw-bold mb-2">History Made!</h3>
                     <p className="text-secondary mb-4">The name <span style={{color: '#FCD535'}}>{searchTerm}</span> is now your eternal digital asset.</p>
                     <Link href={`/dashboard`} passHref>
                        <button className="btn w-100 fw-bold py-3" style={{ background: GOLD_GRADIENT, border: 'none', color: '#000', fontSize: '16px', borderRadius: '8px' }}>View Your New Asset <i className="bi bi-arrow-right ms-2"></i></button>
                     </Link>
                     <div className="mt-3"><button onClick={handleCloseModal} className="btn btn-link text-secondary text-decoration-none" style={{fontSize: '12px'}}>Mint Another</button></div>
                   </div>
                )}

                {modalType === 'process' && (
                   <div className="fade-in">
                     <div className="mb-4 position-relative d-inline-block">
                        <div className="spinner-border" style={{ color: '#FCD535', width: '4rem', height: '4rem', borderWidth: '0.25em' }} role="status"></div>
                        <div className="position-absolute top-50 start-50 translate-middle text-white fw-bold" style={{ fontSize: '14px' }}>{timer}</div>
                     </div>
                     <h4 className="text-white fw-bold mb-2">Processing...</h4>
                     <p className="text-warning mb-2 fw-bold" style={{ fontSize: '14px' }}>{processStep}</p>
                     <p className="text-secondary mb-4" style={{ fontSize: '13px' }}>Do not close this window. Auto-reset in {timer}s.</p>
                     <button onClick={handleCloseModal} className="btn btn-link text-muted text-decoration-none" style={{fontSize: '12px'}}>Cancel & Reset UI</button>
                   </div>
                )}

                {modalType === 'error' && (
                    <div className="fade-in">
                        <i className="bi bi-info-circle-fill mb-3" style={{ fontSize: '3rem', color: '#E6C76A' }}></i>
                        <h5 className="text-white fw-bold mb-3">{errorTitle || "Notice"}</h5>
                        <p className="text-secondary mb-4" style={{ fontSize: '14px' }}>{errorMessage}</p>
                        <button onClick={handleCloseModal} className="btn w-100 fw-bold" style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid #666' }}>Close & Retry</button>
                    </div>
                )}
            </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
        .force-ltr { direction: ltr !important; }
        .fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .form-control::placeholder { color: #444; font-weight: 300; }
        .form-control:focus { background-color: #0d1117 !important; color: #fff !important; border-color: #FCD535 !important; }
        
        .btn-ingot {
            background: linear-gradient(180deg, ${GOLD_BTN_HIGHLIGHT} 0%, ${GOLD_BTN_PRIMARY} 40%, ${GOLD_BTN_SHADOW} 100%);
            border: 1px solid ${GOLD_BTN_SHADOW};
            color: #2b1d00;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            letter-spacing: 1px;
            font-size: 1rem;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3), 0 0 15px rgba(212, 175, 55, 0.1);
            text-shadow: 0 1px 0 rgba(255,255,255,0.4);
            transition: filter 0.3s ease, transform 0.2s ease;
            white-space: nowrap;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
        }

        .btn-ingot:hover { filter: brightness(1.08); transform: translateY(-1px); color: #1a1100; }
        .btn-ingot:disabled { opacity: 0.7; cursor: not-allowed; filter: grayscale(0.5); }
        .hero-container { padding-top: 20px; padding-bottom: 0px; }
        .select-asset-title { margin-bottom: 2rem !important; }
        .custom-connect-btn { width: 100%; }

        @media (max-width: 768px) {
            .mobile-clean-stack { direction: ltr !important; display: flex !important; flex-direction: column !important; gap: 20px !important; width: 100% !important; padding: 0 20px !important; }
            .ingot-wrapper { display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
            .luxury-btn-container { width: 140px !important; flex: 0 0 auto !important; }
            .btn-ingot { width: 100% !important; height: 45px !important; font-size: 0.85rem; }
            .price-top-container { display: none !important; }
            .mobile-price-display { display: flex !important; flex-direction: column !important; align-items: flex-end !important; text-align: right !important; flex: 1 !important; }
            .hero-container { padding-top: 35px !important; padding-bottom: 25px !important; }
        }
        @media (min-width: 769px) { .mobile-price-display { display: none !important; } .ingot-wrapper { max-width: 180px !important; } }
      `}</style>
    </main>
  );
}

// --- Luxury Ingot Component (Simplified) ---
// تم تخفيف هذا المكون ليصبح مجرد "زر عرض" ويستلم الأمر من الأب
const LuxuryIngot = ({ label, price, isAvailable, onMint, isMinting }: any) => {
    
    const { isConnected } = useAccount(); 
    
    return (
        <div className="col-12 col-md-4 d-flex flex-column align-items-center ingot-wrapper">
            <div className="mb-2 d-flex justify-content-center align-items-baseline gap-2 price-top-container"><span className="text-white fw-bold" style={{ fontSize: '16px', fontFamily: 'sans-serif' }}>{price}</span></div>
            <div className="luxury-btn-container" style={{ width: '100%' }}>
                
                {!isConnected ? (
                    <div className="custom-connect-btn" style={{ width: '100%' }}>
                        <ConnectButton.Custom>
                            {({ openConnectModal }) => (
                                <button 
                                    onClick={openConnectModal}
                                    className="btn-ingot"
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {label}
                                </button>
                            )}
                        </ConnectButton.Custom>
                    </div>
                ) : (
                    <button
                        onClick={onMint} // يستدعي الدالة القادمة من الأب
                        disabled={isMinting || !isAvailable}
                        className="btn-ingot"
                        style={{
                            width: '100%',
                            height: '50px',
                            cursor: (isMinting || !isAvailable) ? 'not-allowed' : 'pointer',
                            opacity: (!isAvailable) ? 0.5 : 1
                        }}
                    >
                       {isMinting ? <div className="spinner-border spinner-border-sm text-dark" role="status"></div> : label}
                    </button>
                )}
                
            </div>
            <div className="mobile-price-display" style={{ display: 'none' }}><span style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#fff' }}>{price}</span></div>
        </div>
    );
};

export default dynamic(() => Promise.resolve(MintContent), { ssr: false });
