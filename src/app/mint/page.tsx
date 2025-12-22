'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { useWalletClient, useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CHAIN_ID } from '@/data/config';
import ABI from '@/data/abi.json';

export const dynamic = 'force-dynamic';

const ADMIN_WALLET = "0xf65bf669ee7775c9788ed367742e1527d0118b58"; 
const READ_PROVIDER = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com');

function clientToSigner(client: any) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new ethers.BrowserProvider(transport, network);
  const signer = new ethers.JsonRpcSigner(provider, account.address);
  return signer;
}

const MintContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [mintStep, setMintStep] = useState(0); 
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'process' | 'error' | 'success'>('process');
  const [errorMessage, setErrorMessage] = useState('');
  const [txHash, setTxHash] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: walletClient } = useWalletClient();
  const { address, isConnected, chain } = useAccount();
  const { open } = useWeb3Modal();

  const signer = useMemo(() => {
    if (!walletClient) return null;
    return clientToSigner(walletClient);
  }, [walletClient]);

  useEffect(() => {
    if (address) {
        setIsAdmin(address.toLowerCase() === ADMIN_WALLET.toLowerCase());
    } else {
        setIsAdmin(false);
    }
  }, [address]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleInputFocus = () => {
    setStatus(null);   
    setErrorMessage('');
  };

  const checkAvailability = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm) return;
    
    const cleanName = searchTerm.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (cleanName !== searchTerm) setSearchTerm(cleanName);

    setIsSearching(true);
    setStatus(null);

    try {
        const readContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, READ_PROVIDER);
        const nameHash = ethers.keccak256(ethers.toUtf8Bytes(cleanName));
        const isTaken = await readContract.registeredNames(nameHash);
        
        if (isTaken === true) setStatus('taken');
        else setStatus('available');

    } catch (err: any) {
        console.error("Check Error:", err);
        setStatus('available');
    } finally {
        setIsSearching(false);
    }
  };

  const handleCloseModal = () => {
    if (modalType === 'success' || modalType === 'error') {
        setShowModal(false);
        setMintStep(0);
        setHasPaid(false);
        return;
    }
    setShowModal(false);
    setIsMinting(false);
    setMintStep(0);
  };

  const startMinting = async (tierLabel: string) => {
    if (status !== 'available') {
        setErrorMessage("Name is not available.");
        setModalType('error');
        setShowModal(true);
        return;
    }

    setDebugLog([]); 
    setErrorMessage('');
    setTxHash('');
    setIsMinting(true); 
    setHasPaid(false);
    setModalType('process');
    setShowModal(true);
    
    const nameToMint = searchTerm.toUpperCase(); 

    try {
      if (!isConnected || !signer) {
        addLog("Wallet not connected. Opening...");
        await open();
        setIsMinting(false);
        return; 
      }

      const targetChainId = CHAIN_ID;
      if (chain?.id !== targetChainId) {
        addLog(`Wrong Network. Switching to Polygon...`);
        await walletClient?.switchChain({ id: targetChainId });
        await new Promise(r => setTimeout(r, 1500));
      }

      let tierId = 2; 
      const lowerLabel = tierLabel.toLowerCase();
      
      if (lowerLabel === 'immortal') tierId = 0;
      else if (lowerLabel === 'elite') tierId = 1;
      else if (lowerLabel === 'founders') tierId = 2;

      addLog("Generating Metadata...");
      setMintStep(1);

      const apiResponse = await fetch('/api/mint-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameToMint, tier: lowerLabel })
      });

      const apiData = await apiResponse.json();

      if (!apiData.success || !apiData.tokenUri) {
        throw new Error(apiData.error || "Metadata Generation Failed");
      }

      const tokenURI = apiData.tokenUri;
      addLog(`Metadata Ready.`);

      setMintStep(2);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      if (isAdmin) {
          addLog("👑 Admin Identified: Initiating Free Mint...");
          
          const tx = await contract.reserveName(nameToMint, tierId, tokenURI);
          
          addLog(`Tx Sent: ${tx.hash}`);
          setTxHash(tx.hash);
          setMintStep(3); 
          
          await tx.wait(); 

      } else {
          addLog("Calculating Oracle Price...");
          
          let usdAmountWei;
          if (tierId === 0) usdAmountWei = ethers.parseUnits("50", 18);
          else if (tierId === 1) usdAmountWei = ethers.parseUnits("30", 18);
          else usdAmountWei = ethers.parseUnits("10", 18);

          const costInMatic = await contract.getMaticCost(usdAmountWei);
          
          // @ts-ignore
          const buffer = (costInMatic * 102n) / 100n; 

          addLog(`Price: ${ethers.formatEther(costInMatic)} MATIC`);
          addLog("Requesting Wallet Signature...");

          const tx = await contract.mintPublic(nameToMint, tierId, tokenURI, { 
              value: buffer
          });

          setHasPaid(true);
          setTxHash(tx.hash);
          addLog(`Tx Sent: ${tx.hash}`);
          setMintStep(3);
          
          await tx.wait();
      }
      
      addLog("Transaction Confirmed on Blockchain!");
      setMintStep(4);
      setModalType('success'); 

    } catch (error: any) {
      console.error(error);
      let errorMsg = error.reason || error.message || "Unknown Error";
      
      if (errorMsg.includes("rejected")) errorMsg = "Transaction cancelled by user.";
      if (errorMsg.includes("insufficient funds")) errorMsg = "Insufficient MATIC balance for gas or price.";
      
      addLog(`ERROR: ${errorMsg}`);
      setErrorMessage(errorMsg);
      setModalType('error');
    }
  };

  const GOLD_GRADIENT = 'linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)';

  return (
    <main dir="ltr" style={{ backgroundColor: '#0d1117', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '50px', position: 'relative', direction: 'ltr' }}>
      
      {isAdmin && (
        <div 
            title="Admin Mode: ReserveName Active"
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
            <LuxuryIngot label="IMMORTAL" price="$50" gradient={GOLD_GRADIENT} isAvailable={status === 'available'} isConnected={isConnected} onMint={() => startMinting('immortal')} connectWallet={open} showAlert={(msg: string) => { setErrorMessage(msg); setModalType('error'); setShowModal(true); }} />
            <LuxuryIngot label="ELITE" price="$30" gradient={GOLD_GRADIENT} isAvailable={status === 'available'} isConnected={isConnected} onMint={() => startMinting('elite')} connectWallet={open} showAlert={(msg: string) => { setErrorMessage(msg); setModalType('error'); setShowModal(true); }} />
            <LuxuryIngot label="FOUNDERS" price="$10" gradient={GOLD_GRADIENT} isAvailable={status === 'available'} isConnected={isConnected} onMint={() => startMinting('founders')} connectWallet={open} showAlert={(msg: string) => { setErrorMessage(msg); setModalType('error'); setShowModal(true); }} />
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#161b22', border: '1px solid #333', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', textAlign: 'center', position: 'relative' }}>
                <button onClick={handleCloseModal} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#666', fontSize: '24px', cursor: 'pointer', zIndex: 10 }}><i className="bi bi-x-lg"></i></button>

                {modalType === 'process' && (
                  <>
                    <h4 className="text-white fw-bold mb-4">Securing Your Asset...</h4>
                    <ProcessingStep label="Generating Visual ID" status={mintStep > 1 ? 'done' : (mintStep === 1 ? 'loading' : 'waiting')} icon="bi-cloud-upload" color="#FCD535" />
                    <ProcessingStep label="Wallet Signature" status={mintStep > 2 ? 'done' : (mintStep === 2 ? 'loading' : 'waiting')} icon="bi-wallet2" color="#8247E5" />
                    <ProcessingStep label="Blockchain Confirmation" status={mintStep > 3 ? 'done' : (mintStep === 3 ? 'loading' : 'waiting')} icon="bi-link-45deg" color="#0ecb81" />
                    <div className="mt-4 p-2 rounded text-start" style={{ backgroundColor: 'rgba(0,0,0,0.3)', fontSize: '10px', color: '#666', fontFamily: 'monospace', maxHeight: '100px', overflowY: 'auto' }}>
                        {debugLog.length > 0 ? debugLog[debugLog.length - 1] : 'Initializing...'}
                    </div>
                  </>
                )}

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

const LuxuryIngot = ({ label, price, gradient, isAvailable, isConnected, onMint, connectWallet, showAlert }: any) => {
    const handleClick = () => { 
        if (!isAvailable) { 
            showAlert("Please check name availability first."); 
        } else if (!isConnected) { 
            connectWallet(); 
        } else { 
            onMint(); 
        } 
    };
    const btnOpacity = isAvailable ? 1 : 0.5;
    return (
        <div className="col-12 col-md-4 d-flex flex-column align-items-center ingot-wrapper">
            <div className="mb-2 d-flex justify-content-center align-items-baseline gap-2 price-top-container"><span className="text-white fw-bold" style={{ fontSize: '16px', fontFamily: 'sans-serif' }}>{price}</span></div>
            <div className="luxury-btn-container" style={{ width: '100%' }}>
                <button onClick={handleClick} className="btn w-100 luxury-btn d-flex align-items-center justify-content-center" style={{ background: gradient, border: '1px solid #b3882a', color: '#000', borderRadius: '10px', height: '50px', boxShadow: '0 4px 15px rgba(252, 213, 53, 0.1)', transition: 'transform 0.2s, filter 0.2s', position: 'relative', padding: '0', opacity: btnOpacity }} onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.filter = 'brightness(1.1)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }}>{!isAvailable && ( <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1 }}></div> )}<span style={{ fontFamily: 'serif', fontSize: '18px', fontWeight: '800', letterSpacing: '2px' }}>{label}</span></button>
            </div>
            <div className="mobile-price-display" style={{ display: 'none' }}><span style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#fff' }}>{price}</span></div>
        </div>
    );
};

const ProcessingStep = ({ label, status, icon, color }: any) => {
    return (
        <div className="d-flex align-items-center justify-content-between mb-3 p-3 rounded" style={{ backgroundColor: status === 'waiting' ? 'transparent' : '#0d1117', border: '1px solid #222', transition: 'all 0.3s' }}>
            <div className="d-flex align-items-center gap-3"><div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: status === 'waiting' ? '#222' : `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: status === 'waiting' ? '#555' : color }}> <i className={`bi ${icon}`} style={{ fontSize: '16px' }}></i> </div><span style={{ color: status === 'waiting' ? '#555' : '#fff', fontSize: '13px', fontWeight: '600' }}>{label}</span></div>
            <div>{status === 'loading' && <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>}{status === 'done' && <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '18px' }}></i>}{status === 'waiting' && <i className="bi bi-circle text-secondary" style={{ fontSize: '18px', opacity: 0.3 }}></i>}</div>
        </div>
    );
};

export default dynamicImport(() => Promise.resolve(MintContent), { ssr: false });

