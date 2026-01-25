'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAccount, useWriteContract, useReadContract, usePublicClient } from "wagmi";
import { parseAbi, keccak256, stringToBytes } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACT_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase';

// --- BUTTON CONSTANTS (FROM ROYAL CONCEPT) ---
const GOLD_BTN_PRIMARY = '#D4AF37';
const GOLD_BTN_HIGHLIGHT = '#E6C76A';
const GOLD_BTN_SHADOW = '#B8962E';

// ABI for the NFT Registry Contract (Minting Logic - Updated for Registry 10)
const CONTRACT_ABI = parseAbi([
  "function owner() view returns (address)",
  "function registeredNames(bytes32) view returns (bool)",
  "function getMaticCost(uint256 usdAmount) view returns (uint256)",
  "function mintPublic(string _name, uint8 _tier, string _tokenURI) payable",
  "function reserveName(string _name, uint8 _tier, string _tokenURI)"
]);

const TIER_IMAGES = {
    IMMORTAL: "https://gateway.pinata.cloud/ipfs/bafkreib7mz6rnwk3ig7ft6ne5iuajlywkttv4zvjp5bbk7ssd5kaykjbsm", 
    ELITE: "https://gateway.pinata.cloud/ipfs/bafkreiazhoyzkbenhbvjlltd6izwonwz3xikljtrrksual5ttzs4nyzbuu",    
    FOUNDER: "https://gateway.pinata.cloud/ipfs/bafkreiagc35ykldllvd2knqcnei2ctmkps66byvjinlr7hmkgkdx5mhxqi"   
};

const LONG_DESCRIPTION = `GEN-0 Genesis — NNM Protocol Record

A singular, unreplicable digital artifact. This digital name is recorded on-chain with a verifiable creation timestamp and immutable registration data under the NNM protocol, serving as a canonical reference layer for historical name precedence within this system.

It represents a Gen-0 registered digital asset and exists solely as a transferable NFT, without renewal, guarantees, utility promises, or dependency. Ownership is absolute, cryptographically secured, and fully transferable. No subscriptions. No recurring fees. No centralized control. This record establishes the earliest verifiable origin of the name as recognized by the NNM protocol — a permanent, time-anchored digital inscription preserved on the blockchain.`;

// --- NEW FUNCTION: ELECTRONIC STAMPING (Writes Name on Image) ---
const generateStampedImage = async (imageUrl: string, nameText: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Important for CORS to allow export
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(imageUrl); // Fallback to original if canvas fails
                return;
            }

            // 1. Draw Original Marble Image
            ctx.drawImage(img, 0, 0);

            // 2. Configure Text Style (Montserrat, Bold, Italic, Gold)
            // Dynamic font size based on image width (approx 12% of width)
            const fontSize = Math.floor(img.width * 0.12); 
            ctx.font = `italic 900 ${fontSize}px 'Montserrat', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            // 3. Add Shadow/Stroke for readability on Marble
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 20;
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#000000';

            // 4. Calculate Position (Top Center + Padding)
            const centerX = canvas.width / 2;
            const topPadding = 100; // 100px from top as requested

            // 5. Draw The Text
            ctx.strokeText(nameText, centerX, topPadding); // Outline
            
            ctx.shadowBlur = 0; // Reset shadow for fill
            ctx.fillStyle = '#FCD535'; // Luxurious Gold Fill
            ctx.fillText(nameText, centerX, topPadding); // Fill

            // 6. Export as Base64 JPEG (Quality 0.85 for balance)
            try {
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                resolve(dataUrl);
            } catch (e) {
                console.warn("Canvas export failed (likely CORS), using original.", e);
                resolve(imageUrl);
            }
        };

        img.onerror = () => {
            console.warn("Image load failed, using original URL.");
            resolve(imageUrl);
        };
    });
};

const MintContent = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // New State for Nice Title
  const [errorTitle, setErrorTitle] = useState(''); 
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'process' | 'error' | 'success'>('process');
  const [mounted, setMounted] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [timer, setTimer] = useState(60);

  // Read owner from the new contract
  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const isAdmin = address && ownerAddress && (address.toLowerCase() === ownerAddress.toLowerCase());

  useEffect(() => {
    setMounted(true);
  }, []);

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
  };

  // --- SURGICAL UPDATE: REPLACED OLD handleError WITH SMART DIPLOMAT ---
  const handleError = (err: any) => {
      console.error(err);
      
      const errStr = err?.message || JSON.stringify(err);
      let niceTitle = "Action Update";
      let niceMessage = "The process was interrupted. Please check your connection and try again.";

      // 1. User Rejected
      if (errStr.includes("User rejected") || errStr.includes("User denied")) {
          niceTitle = "Action Cancelled";
          niceMessage = "You cancelled the transaction. No funds were deducted.";
      } 
      // 2. Insufficient Funds
      else if (errStr.includes("Insufficient funds") || errStr.includes("exceeds balance") || errStr.includes("low balance")) {
          niceTitle = "Insufficient Balance";
          niceMessage = "Your wallet balance is lower than the required amount (Price + Gas). Please top up POL and try again.";
      }

      setErrorTitle(niceTitle);
      setErrorMessage(niceMessage);
      setModalType('error');
      setShowModal(true);
  };

  if (!mounted) return null;

  const GOLD_GRADIENT = 'linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)';

  return (
    <main dir="ltr" style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '50px', position: 'relative', direction: 'ltr' }}>
      
      <div className="container hero-container text-center">
        <h1
          className="text-white fw-bold mb-2"
          style={{
            fontSize: '32px',
            fontFamily: 'serif',
            letterSpacing: '1px',
            color: '#E0E0E0'
          }}
        >
          Claim Your Nexus <span style={{ background: 'linear-gradient(180deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Digital Name</span> Assets

        </h1>
        <p
          className="mx-auto"
          style={{
            maxWidth: '600px',
            fontFamily: '"Inter", "Segoe UI", sans-serif',
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#B0B0B0'
          }}
        >
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
              style={{ 
                backgroundColor: '#161b22', 
                border: status === 'available' ? '1px solid #0ecb81' : (status === 'taken' ? '1px solid #f6465d' : '1px solid rgba(252, 213, 53, 0.6)'), 
                borderRadius: '50px', 
                height: '52px', 
                fontSize: '20px', 
                fontWeight: '300', 
                boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                color: '#fff',
                caretColor: '#FCD535'
              }}
            />
            <button 
                type="submit"
                className="btn position-absolute top-50 start-0 translate-middle-y ms-1 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '42px', height: '42px', background: GOLD_GRADIENT, border: 'none', transition: 'all 0.3s', right: '5px' }}
            >
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
            {/* SURGICAL UPDATE: Prices Updated to $15, $10, $5 */}
            <LuxuryIngot 
                label="IMMORTAL" price="$15" gradient={GOLD_GRADIENT} isAvailable={status === 'available'} 
                tierName="IMMORTAL" tierIndex={0} nameToMint={searchTerm} isAdmin={isAdmin} 
                onSuccess={() => { setModalType('success'); setShowModal(true); }} onError={handleError}
                onProcessing={() => { setModalType('process'); setShowModal(true); }}
                isMinting={isMinting} setIsMinting={setIsMinting}
            />
            <LuxuryIngot 
                label="ELITE" price="$10" gradient={GOLD_GRADIENT} isAvailable={status === 'available'} 
                tierName="ELITE" tierIndex={1} nameToMint={searchTerm} isAdmin={isAdmin} 
                onSuccess={() => { setModalType('success'); setShowModal(true); }} onError={handleError}
                onProcessing={() => { setModalType('process'); setShowModal(true); }}
                isMinting={isMinting} setIsMinting={setIsMinting}
            />
            <LuxuryIngot 
                label="FOUNDERS" price="$5" gradient={GOLD_GRADIENT} isAvailable={status === 'available'} 
                tierName="FOUNDER" tierIndex={2} nameToMint={searchTerm} isAdmin={isAdmin} 
                onSuccess={() => { setModalType('success'); setShowModal(true); }} onError={handleError}
                onProcessing={() => { setModalType('process'); setShowModal(true); }}
                isMinting={isMinting} setIsMinting={setIsMinting}
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
                     <p className="text-secondary mb-4" style={{ fontSize: '13px' }}>Confirm in your wallet. This window will reset in {timer}s to prevent UI hanging.</p>
                     <button onClick={handleCloseModal} className="btn btn-link text-muted text-decoration-none" style={{fontSize: '12px'}}>Cancel & Reset UI</button>
                   </div>
                )}

                {/* SURGICAL UPDATE: Replaced Red Style with Gold/Diplomatic Style */}
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
        /* استيراد خط Cinzel الفاخر للزر */
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
        
        /* NEW IMPORT: Montserrat for the image text (Bold & Italic) */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@1,900&display=swap');

        .force-ltr { direction: ltr !important; }
        .fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .form-control::placeholder { color: #444; font-weight: 300; }
        .form-control:focus { background-color: #0d1117 !important; color: #fff !important; border-color: #FCD535 !important; }
        
        /* NEW ROYAL INGOT BUTTON STYLE */
        .btn-ingot {
            /* الخلفية: تدرج لوني عمودي يعطي إيحاء المعدن */
            background: linear-gradient(180deg, ${GOLD_BTN_HIGHLIGHT} 0%, ${GOLD_BTN_PRIMARY} 40%, ${GOLD_BTN_SHADOW} 100%);
            
            /* الحدود: لون ظل لتعزيز الحواف */
            border: 1px solid ${GOLD_BTN_SHADOW};
            
            /* النص: لون بني غامق جداً (شبه محروق) ليعطي تباين الحفر */
            color: #2b1d00;
            
            /* الخط: Cinzel (خط سيريف كلاسيكي روماني) */
            font-family: 'Cinzel', serif;
            font-weight: 700;
            letter-spacing: 1px; /* تباعد الحروف للحفر */
            font-size: 1rem;
            
            /* الظلال: ظل ناعم للزر + توهج ذهبي خفيف */
            box-shadow: 0 4px 10px rgba(0,0,0,0.3), 0 0 15px rgba(212, 175, 55, 0.1);
            
            /* ظل النص: أبيض خفيف أسفل النص يعطي إيحاء الحفر (Engraved Effect) */
            text-shadow: 0 1px 0 rgba(255,255,255,0.4);
            
            /* الحركة والتفاعل */
            transition: filter 0.3s ease, transform 0.2s ease;
            
            white-space: nowrap;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px; /* حواف ناعمة قليلاً */
        }

        .btn-ingot:hover {
            filter: brightness(1.08); /* تفتيح بسيط عند المرور */
            transform: translateY(-1px); /* رفع الزر قليلاً */
            color: #1a1100; /* تغميق النص قليلاً */
        }

        .btn-ingot:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            filter: grayscale(0.5);
        }

        .hero-container { padding-top: 20px; padding-bottom: 0px; }
        .select-asset-title { margin-bottom: 2rem !important; }

        .custom-connect-btn { width: 100%; }

        @media (max-width: 768px) {
            .mobile-clean-stack { direction: ltr !important; display: flex !important; flex-direction: column !important; gap: 20px !important; width: 100% !important; padding: 0 20px !important; }
            .ingot-wrapper { display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
            .luxury-btn-container { width: 140px !important; flex: 0 0 auto !important; }
            /* تم تحديث عرض الزر ليكون 100% من الحاوية الخاصة به */
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

const LuxuryIngot = ({ label, price, gradient, isAvailable, tierName, tierIndex, nameToMint, isAdmin, onSuccess, onError, onProcessing, isMinting, setIsMinting }: any) => {
    
    const { address, isConnected } = useAccount(); 
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    
    // --- NEW: NNM REWARD SYSTEM HOOK (ADDED SURGICALLY) ---
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

    const handleMintClick = async () => {
        if (!nameToMint || !isAvailable || !publicClient) return; // Guard logic
        setIsMinting(true);
        // Trigger the parent's modal to show 'process' state
        onProcessing();
        
        try {
            let selectedImage = TIER_IMAGES.FOUNDER; 
            if (tierName === "IMMORTAL") selectedImage = TIER_IMAGES.IMMORTAL;
            if (tierName === "ELITE") selectedImage = TIER_IMAGES.ELITE;

            // --- SURGICAL NEW STEP: DRAW THE NAME ON THE IMAGE ---
            // This function creates the "Electronic Stamp" in real-time
            const stampedImageBase64 = await generateStampedImage(selectedImage, nameToMint);
            // ----------------------------------------------------

            const date = new Date();
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const dynamicDate = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

            const metadataObject = {
              name: nameToMint,
              description: LONG_DESCRIPTION,
              image: stampedImageBase64, // <--- Using the new Stamped Image
              attributes: [
                { trait_type: "Asset Type", value: "Digital Name" },
                { trait_type: "Generation", value: "Gen-0" },
                { trait_type: "Tier", value: tierName },
                { trait_type: "Platform", value: "NNM Registry" },
                { trait_type: "Collection", value: "Genesis - 001" },
                { trait_type: "Mint Date", value: dynamicDate }
              ]
            };

            const jsonString = JSON.stringify(metadataObject);
            // Use browser-safe base64 encoding
            const tokenURI = `data:application/json;base64,${btoa(unescape(encodeURIComponent(jsonString)))}`;

            let hash;

            if (isAdmin) {
              hash = await writeContractAsync({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'reserveName',
                args: [nameToMint, tierIndex, tokenURI],
              });
            } else {
              // --- SURGICAL UPDATE: PUBLIC MINT LOGIC (THE FIX) ---
              // A. Define Price (15, 10, 5)
              const usdVal = tierName === "IMMORTAL" ? 15 : tierName === "ELITE" ? 10 : 5;
              const usdAmountWei = BigInt(usdVal) * BigInt(10**18);
              
              // B. Get Real Cost from Contract
              const costInMatic = await publicClient.readContract({
                 address: CONTRACT_ADDRESS as `0x${string}`,
                 abi: CONTRACT_ABI,
                 functionName: 'getMaticCost',
                 args: [usdAmountWei]
              });
              
              // C. Add Buffer
              const valueToSend = (costInMatic * BigInt(101)) / BigInt(100); 

              // D. [CRITICAL FIX] PRE-FLIGHT BALANCE CHECK
              // لا تفتح المحفظة إذا لم يكن هناك رصيد!
              if (address) {
                  const balance = await publicClient.getBalance({ address });
                  if (balance < valueToSend) {
                      throw new Error("Insufficient funds (Pre-flight check): Low POL balance.");
                  }
              }
              
              // E. Execute Transaction (Wallet only opens if passed check D)
              hash = await writeContractAsync({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'mintPublic',
                args: [nameToMint, tierIndex, tokenURI],
                value: valueToSend, 
              });
            }

            // 1. Wait for transaction confirmation
            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            // 2. TRIGGER SUCCESS UI IMMEDIATELY
            onSuccess();
            setIsMinting(false);

            // 3. Run background tasks (DO NOT await them, let them run in background)
            if (receipt.status === 'success') {
                // Record to Supabase
                const transferLog = receipt.logs.find(log => log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef');
                if (transferLog && transferLog.topics[3]) {
                    const mintedId = parseInt(transferLog.topics[3], 16);
                    supabase.from('activities').insert([
                        {
                            token_id: mintedId,
                            activity_type: 'Mint',
                            from_address: '0x0000000000000000000000000000000000000000',
                            to_address: address, 
                            price: price.replace('$',''),
                            created_at: new Date().toISOString()
                        }
                    ]);
                }
                // Notify Reward System
                if (address) notifyRewardSystem(address);
            }
        } catch (err) {
            onError(err);
        } finally {
            setIsMinting(false);
        }
    };

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
                        onClick={handleMintClick}
                        // Only enable if name is available AND not currently minting
                        disabled={isMinting || !isAvailable || !nameToMint}
                        className="btn-ingot"
                        style={{
                            width: '100%',
                            height: '50px',
                            cursor: (isMinting || !isAvailable) ? 'not-allowed' : 'pointer',
                            opacity: (!isAvailable || !nameToMint) ? 0.5 : 1 // Dim if not ready
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
