'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useActiveAccount, TransactionButton, useReadContract, ConnectButton } from "thirdweb/react";
import { prepareContractCall, readContract, getContract, defineChain } from "thirdweb";
import { keccak256, toBytes } from "thirdweb/utils";
import { upload } from "thirdweb/storage";
import { client } from "@/lib/client"; 

const CONTRACT_ADDRESS = "0x8e46c897bc74405922871a8a6863ccf5cd1fc721";
const CHAIN_ID = 137;
const chain = defineChain(CHAIN_ID);
const MASTER_IMAGE_URI = "ipfs://Bafkreiech2mqddofl5af7k24qglnbpxqmvmxaehbudrlxs2drhprxcsmvu";

const contract = getContract({
  client: client,
  chain: chain,
  address: CONTRACT_ADDRESS,
});

export const dynamic = 'force-dynamic';

const MintContent = () => {
  const account = useActiveAccount();
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'process' | 'error' | 'success'>('process');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data: ownerAddress } = useReadContract({
    contract,
    method: "function owner() view returns (address)",
    params: [],
  });

  const isAdmin = account?.address && ownerAddress && (account.address.toLowerCase() === ownerAddress.toLowerCase());

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
        const nameHash = keccak256(toBytes(cleanName));
        const isRegistered = await readContract({
            contract,
            method: "function registeredNames(bytes32) view returns (bool)",
            params: [nameHash]
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
        <p className="mx-auto" style={{ maxWidth: '600px', fontSize: '14px', lineHeight: '1.6', color: '#B0B3B8' }}>
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

        /* ستايل مخصص لزر الاتصال ليطابق السبيكة */
        .custom-connect-btn .tw-connect-wallet {
            width: 100% !important;
            height: 50px !important;
            background: linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%) !important;
            color: #000 !important;
            border: 1px solid #b3882a !important;
            border-radius: 10px !important;
            font-family: serif !important;
            font-weight: 800 !important;
            font-size: 18px !important;
            letter-spacing: 2px !important;
            text-transform: uppercase !important;
            justify-content: center !important;
        }

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

// ---  LuxuryIngot Component (The Bridge Logic) ---
const LuxuryIngot = ({ label, price, gradient, isAvailable, tierName, tierIndex, nameToMint, isAdmin, onSuccess, onError }: any) => {
    
    const account = useActiveAccount(); // نتحقق من حالة الاتصال
    const btnOpacity = isAvailable ? 1 : 0.5;

    return (
        <div className="col-12 col-md-4 d-flex flex-column align-items-center ingot-wrapper">
            <div className="mb-2 d-flex justify-content-center align-items-baseline gap-2 price-top-container"><span className="text-white fw-bold" style={{ fontSize: '16px', fontFamily: 'sans-serif' }}>{price}</span></div>
            <div className="luxury-btn-container" style={{ width: '100%' }}>
                
                {!account ? (
                    // 1. إذا لم يكن متصلاً: اعرض زر الاتصال الرسمي بتصميم مخصص
                    <div className="custom-connect-btn" style={{ width: '100%' }}>
                        <ConnectButton 
                            client={client}
                            chain={chain}
                            connectButton={{
                                label: label, // يظهر اسم السبيكة بدلاً من "Connect"
                                style: {
                                    width: '100%',
                                    height: '50px',
                                    background: gradient,
                                    border: '1px solid #b3882a',
                                    color: '#000',
                                    borderRadius: '10px',
                                    fontSize: '18px',
                                    opacity: btnOpacity
                                }
                            }}
                        />
                    </div>
                ) : (
                    // 2. إذا كان متصلاً: اعرض زر الطباعة (Transaction Button)
                    <TransactionButton
                        transaction={async () => {
                            if (!nameToMint) throw new Error("Please enter a name");
                            
                            const metadata = {
                              name: nameToMint,
                              description: `GEN-0 Genesis — NNM Protocol Record for ${nameToMint}`,
                              image: MASTER_IMAGE_URI,
                              attributes: [
                                { trait_type: "Tier", value: tierName },
                                { trait_type: "Mint Date", value: new Date().toISOString() },
                                { trait_type: "Type", value: "Digital Name" }
                              ]
                            };
                            
                            const uri = await upload({ client, files: [metadata] });
    
                            if (isAdmin) {
                              return prepareContractCall({
                                contract,
                                method: "function reserveName(string _name, uint8 _tier, string _tokenURI)",
                                params: [nameToMint, tierIndex, uri],
                              });
                            } else {
                              const usdAmountWei = BigInt(tierName === "IMMORTAL" ? 50 : tierName === "ELITE" ? 30 : 10) * BigInt(10**18);
                              const costInMatic = await readContract({
                                 contract,
                                 method: "function getMaticCost(uint256 usdAmount) view returns (uint256)",
                                 params: [usdAmountWei]
                              });
                              const valueToSend = (costInMatic * BigInt(101)) / BigInt(100); 
                              
                              return prepareContractCall({
                                contract,
                                method: "function mintPublic(string _name, uint8 _tier, string _tokenURI) payable",
                                params: [nameToMint, tierIndex, uri],
                                value: valueToSend, 
                              });
                            }
                        }}
                        onTransactionConfirmed={(tx) => {
                            console.log("Success", tx);
                            onSuccess();
                        }}
                        onError={(err) => {
                            onError(err);
                        }}
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
                            opacity: btnOpacity,
                            cursor: isAvailable ? 'pointer' : 'not-allowed'
                        }}
                        disabled={!isAvailable}
                    >
                       {label}
                    </TransactionButton>
                )}
                
            </div>
            <div className="mobile-price-display" style={{ display: 'none' }}><span style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#fff' }}>{price}</span></div>
        </div>
    );
};

export default dynamicImport(() => Promise.resolve(MintContent), { ssr: false });
