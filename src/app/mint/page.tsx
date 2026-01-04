'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAccount, useWriteContract, useReadContract, usePublicClient } from "wagmi";
import { parseAbi, keccak256, stringToBytes } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACT_ADDRESS } from '@/data/config';

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

const MintContent = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'process' | 'error' | 'success'>('process');
  const [mounted, setMounted] = useState(false);

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
    if (!searchTerm || searchTerm.length < 2) return;
    
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

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleError = (err: any) => {
      console.error(err);
      setErrorMessage(err.message || "Transaction Failed");
      setModalType('error');
      setShowModal(true);
  };

  if (!mounted) return null;

  const GOLD_GRADIENT = 'linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)';

  return (
    <main dir="ltr" style={{ backgroundColor: '#0d1117', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '50px', position: 'relative', direction: 'ltr' }}>
      
      {isAdmin && (
        <div 
            title="Admin Mode: ReserveName Active (Free Mint)"
            style={{
                position: 'fixed', top: '20px', right: '20px', width: '10px', height: '10px',
                backgroundColor: '#00ff00', borderRadius: '50%', boxShadow: '0 0 10px #00ff00',
                zIndex: 9999, cursor: 'help'
            }}
        ></div>
      )}

      <div className="container hero-container text-center">
        <h1 className="text-white fw-bold mb-2" style={{ fontSize: '32px', fontFamily: 'serif', letterSpacing: '1px' }}>
          Claim Your <span style={{ color: '#FCD535' }}>Nexus Digital Name</span> Assets
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
              placeholder="Enter name to check (e.g. VIVI)..."
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
          </div>
        </div>
      </div>

      <div className="container mt-0">
        <h5 className="text-white text-center mb-4 select-asset-title" style={{ letterSpacing: '2px', fontSize: '11px', textTransform: 'uppercase', color: '#888' }}>Select Asset Class</h5>
        <div className="row justify-content-center g-2 mobile-clean-stack"> 
            <LuxuryIngot 
                label="IMMORTAL" price="$50" gradient={GOLD_GRADIENT} isAvailable={status === 'available'} 
                tierName="IMMORTAL" tierIndex={0} nameToMint={searchTerm} isAdmin={isAdmin} 
                onSuccess={() => { setModalType('success'); setShowModal(true); }} onError={handleError}
            />
            <LuxuryIngot 
                label="ELITE" price="$30" gradient={GOLD_GRADIENT} isAvailable={status === 'available'} 
                tierName="ELITE" tierIndex={1} nameToMint={searchTerm} isAdmin={isAdmin} 
                onSuccess={() => { setModalType('success'); setShowModal(true); }} onError={handleError}
            />
            <LuxuryIngot 
                label="FOUNDERS" price="$10" gradient={GOLD_GRADIENT} isAvailable={status === 'available'} 
                tierName="FOUNDER" tierIndex={2} nameToMint={searchTerm} isAdmin={isAdmin} 
                onSuccess={() => { setModalType('success'); setShowModal(true); }} onError={handleError}
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

                {modalType === 'error' && (
                    <div className="fade-in">
                        <i className="bi bi-exclamation-triangle-fill text-danger mb-3" style={{ fontSize: '3rem' }}></i>
                        <h5 className="text-white fw-bold mb-3">Process Interrupted</h5>
                        <p className="text-danger mb-4" style={{ fontSize: '14px', fontWeight: 'bold' }}>{errorMessage}</p>
                        <button onClick={handleCloseModal} className="btn w-100 fw-bold" style={{ backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>Close & Retry</button>
                    </div>
                )}
            </div>
        </div>
      )}

      <style>{`
        .force-ltr { direction: ltr !important; }
        .fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .form-control::placeholder { color: #444; font-weight: 300; }
        .form-control:focus { background-color: #0d1117 !important; color: #fff !important; border-color: #FCD535 !important; }
        .luxury-btn { position: relative; overflow: hidden; }
        .luxury-btn::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transition: 0.5s; }
        .luxury-btn:hover::after { left: 100%; }
        .hero-container { padding-top: 20px; padding-bottom: 0px; }
        .select-asset-title { margin-bottom: 2rem !important; }

        .custom-connect-btn { width: 100%; }

        @media (max-width: 768px) {
            .mobile-clean-stack { direction: ltr !important; display: flex !important; flex-direction: column !important; gap: 20px !important; width: 100% !important; padding: 0 20px !important; }
            .ingot-wrapper { display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
            .luxury-btn-container { width: 140px !important; flex: 0 0 auto !important; }
            .luxury-btn { width: 100% !important; height: 45px !important; background: linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%) !important; }
            .price-top-container { display: none !important; }
            .mobile-price-display { display: flex !important; flex-direction: column !important; align-items: flex-end !important; text-align: right !important; flex: 1 !important; }
            .hero-container { padding-top: 35px !important; padding-bottom: 25px !important; }
        }
        @media (min-width: 769px) { .mobile-price-display { display: none !important; } .ingot-wrapper { max-width: 180px !important; } }
      `}</style>
    </main>
  );
}

const LuxuryIngot = ({ label, price, gradient, isAvailable, tierName, tierIndex, nameToMint, isAdmin, onSuccess, onError }: any) => {
    
    const { isConnected } = useAccount(); 
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const [isMinting, setIsMinting] = useState(false);
    
    const btnOpacity = isAvailable ? 1 : 0.5;

    const handleMintClick = async () => {
        if (!nameToMint || !publicClient) return;
        setIsMinting(true);
        
        try {
            let selectedImage = TIER_IMAGES.FOUNDER; 
            if (tierName === "IMMORTAL") selectedImage = TIER_IMAGES.IMMORTAL;
            if (tierName === "ELITE") selectedImage = TIER_IMAGES.ELITE;

            const date = new Date();
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const dynamicDate = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

            const metadataObject = {
              name: nameToMint,
              description: LONG_DESCRIPTION,
              image: selectedImage,
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

            if (isAdmin) {
              await writeContractAsync({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'reserveName',
                args: [nameToMint, tierIndex, tokenURI],
              });
            } else {
              const usdAmountWei = BigInt(tierName === "IMMORTAL" ? 50 : tierName === "ELITE" ? 30 : 10) * BigInt(10**18);
              const costInMatic = await publicClient.readContract({
                 address: CONTRACT_ADDRESS as `0x${string}`,
                 abi: CONTRACT_ABI,
                 functionName: 'getMaticCost',
                 args: [usdAmountWei]
              });
              
              const valueToSend = (costInMatic * BigInt(101)) / BigInt(100); 
              
              await writeContractAsync({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'mintPublic',
                args: [nameToMint, tierIndex, tokenURI],
                value: valueToSend, 
              });
            }
            
            onSuccess();
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
                                    style={{
                                        width: '100%',
                                        height: '50px',
                                        background: gradient,
                                        border: '1px solid #b3882a',
                                        color: '#000',
                                        borderRadius: '10px',
                                        fontSize: '18px',
                                        fontFamily: 'serif',
                                        fontWeight: '800',
                                        opacity: btnOpacity,
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
                        disabled={!isAvailable || isMinting}
                        style={{
                            width: '100%',
                            height: '50px',
                            background: gradient,
                            border: '1px solid #b3882a',
                            color: '#000',
                            borderRadius: '10px',
                            fontFamily: 'serif',
                            fontSize: '18px',
                            fontWeight: '800',
                            letterSpacing: '2px',
                            opacity: isMinting ? 0.7 : btnOpacity,
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                       {isMinting ? <div className="spinner-border spinner-border-sm" role="status"></div> : label}
                    </button>
                )}
                
            </div>
            <div className="mobile-price-display" style={{ display: 'none' }}><span style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#fff' }}>{price}</span></div>
        </div>
    );
};

export default dynamic(() => Promise.resolve(MintContent), { ssr: false });
