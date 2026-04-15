'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useAccount, useWriteContract, useReadContract, usePublicClient } from "wagmi";
import { parseAbi, keccak256, stringToBytes, formatEther, createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { toBlob } from 'html-to-image';
import { CONTRACT_ADDRESS } from '@/data/config';
import { supabase } from '@/lib/supabase';
import MintTemplate from '@/components/MintTemplate';
import { useMintPayment } from '@/hooks/useMintPayment';

const CONTRACT_ABI = parseAbi([
  "function owner() view returns (address)",
  "function registeredNames(bytes32) view returns (bool)",
  "function getMaticCost(uint256 usdAmount) view returns (uint256)",
  "function priceImmortal() view returns (uint256)",
  "function priceElite() view returns (uint256)",
  "function priceFounder() view returns (uint256)",
  "function mintPublic(string _name, uint8 _tier, string _tokenURI) payable",
  "function reserveName(string _name, uint8 _tier, string _tokenURI)"
]);

const LONG_DESCRIPTION = `GEN-0 Genesis — NNM Protocol Record

A singular, unreplicable digital artifact. This digital name is recorded on-chain with a verifiable creation timestamp and immutable registration data under the NNM protocol, serving as a canonical reference layer for historical name precedence within this system.

It represents a Gen-0 registered digital asset and exists solely as a transferable NFT, without renewal, guarantees, utility promises, or dependency. Ownership is absolute, cryptographically secured, and fully transferable. No subscriptions. No recurring fees. No centralized control. This record establishes the earliest verifiable origin of the name as recognized by the NNM protocol — a permanent, time-anchored digital inscription preserved on the blockchain.`;


const MintContent = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const searchParams = useSearchParams();
  const referrerWallet = searchParams?.get('ref');
  
  const templateRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState(''); 
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'process' | 'error' | 'success' | 'founder_success'>('process');
  const [processStep, setProcessStep] = useState(''); 
  const [mounted, setMounted] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [timer, setTimer] = useState(90);

  const [snapshotData, setSnapshotData] = useState({ name: '', tier: 'ELITE' });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTierForPayment, setSelectedTierForPayment] = useState({ name: '', index: 0, priceDisplay: '' });
  const [selectedCoin, setSelectedCoin] = useState('POLYGON');
  
  const COIN_LOGOS: any = {
    BTC: "/icons/btc.svg",
    ETH: "/icons/eth.svg",
    POLYGON: "/icons/matic.svg",
    SOL: "/icons/sol.svg",
    BNB: "/icons/bnb.svg",
    USDT: "/icons/usdt.svg"
  };

  const { processPayment } = useMintPayment();

  const handleAlternativePayment = async (coin: string) => {
      setIsPaymentModalOpen(false);
      
      let usdValue = 0;
      if (selectedTierForPayment.priceDisplay !== "FREE" && selectedTierForPayment.priceDisplay !== "$0") {
          usdValue = parseFloat(selectedTierForPayment.priceDisplay.replace('$', ''));
      }
      if (isNaN(usdValue)) usdValue = 0;

      const totalUsd = usdValue + 0.01;

      setIsMinting(true);
      setProcessStep("Generative Engine: Creating high-res asset...");
      setModalType('process');
      setShowModal(true);

      try {
          const imageBlob = await generateSnapshot(searchTerm, selectedTierForPayment.name);
          if (!imageBlob) throw new Error("Failed to generate asset snapshot locally.");

          setProcessStep("Uploading: Securing asset on IPFS...");
          const date = new Date();
          const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const dynamicDate = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

          const formData = new FormData();
          formData.append('file', imageBlob, `NNM-${searchTerm}.png`);
          formData.append('name', searchTerm);
          formData.append('tier', selectedTierForPayment.name);
          formData.append('description', LONG_DESCRIPTION);
          formData.append('dynamicDate', dynamicDate);

          const apiResponse = await fetch('/api/generate-image', { 
              method: 'POST',
              body: formData 
          });

          if (!apiResponse.ok) throw new Error("Upload Failed");
          const { gatewayUrl, metadataUri } = await apiResponse.json();

          let cryptoAmount = totalUsd.toString();
          
          if (coin !== 'USDT') {
              try {
                  const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`);
                  const data = await res.json();
                  cryptoAmount = (totalUsd / parseFloat(data.price)).toFixed(6);
              } catch (e) {
                  const fallbacks: any = { 'SOL': 140, 'BTC': 65000, 'ETH': 3000, 'BNB': 580 };
                  cryptoAmount = (totalUsd / (fallbacks[coin] || 1)).toFixed(6);
              }
          }

          setProcessStep(`Wallet: Please confirm ${cryptoAmount} ${coin} payment...`);

          const txHash = await processPayment(coin, cryptoAmount);

          if (!txHash) throw new Error("User rejected");

          setProcessStep("Securing Asset & Finalizing Registry...");

          fetch('/api/airdrop', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  wallet: address,
                  name: searchTerm,
                  tokenURI: metadataUri,
                  tierName: selectedTierForPayment.name,
                  imageUrl: gatewayUrl,
                  txHash: txHash,
                  coin: coin
              })
          }).catch(() => {});

                    if (txHash && typeof window !== 'undefined' && (window as any).fbq) {
              const priceVal = parseFloat(selectedTierForPayment.priceDisplay.replace(/[^0-9.]/g, '')) || 0;
              (window as any).fbq('track', 'Purchase', { value: priceVal, currency: 'USD' });
          }

          setModalType('founder_success'); 
          setShowModal(true);

      } catch (err: any) {
          handleError(err);
          setIsMinting(false);
      }
  };

  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const isAdmin = address && ownerAddress && (address.toLowerCase() === ownerAddress.toLowerCase());

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateSnapshot = async (name: string, tier: string) => {
    setSnapshotData({ name, tier });
    
    await new Promise(resolve => setTimeout(resolve, 100));

    if (templateRef.current) {
        try {
            const blob = await toBlob(templateRef.current, { cacheBust: true, pixelRatio: 1 }); 
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
        const searchClient = createPublicClient({
            chain: polygon,
            transport: http('https://polygon-bor.publicnode.com')
        });

        const nameHash = keccak256(stringToBytes(cleanName));
        const isRegistered = await searchClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'registeredNames',
            args: [nameHash]
        });
        
        if (isRegistered) setStatus('taken');
        else setStatus('available');

    } catch (err) {
        console.error("Check Error:", err);
        setStatus('available'); 
    } finally {
        setIsSearching(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
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
      else if (errStr.includes("Insufficient funds") || errStr.includes("exceeds balance") || errStr.includes("low balance") || errStr.includes("gas required exceeds allowance")) {
          niceTitle = "Insufficient Balance";
          niceMessage = "Please ensure your wallet has enough funds to cover the required price and network gas fees. Top up your wallet and try again.";
      }
      else if (errStr.includes("WALLET_NOT_FOUND")) {
          niceTitle = "Wallet Not Found";
          niceMessage = "Required wallet (e.g., Phantom for Solana, UniSat for BTC) is not installed or connected in your browser. Please install the extension.";
      }
      else if (errStr.includes("switch chain") || errStr.includes("Unrecognized chain ID") || errStr.includes("chain not configured")) {
          niceTitle = "Network Switch Failed";
          niceMessage = "Please manually switch your wallet to the selected network (Ethereum/BNB) to proceed with the payment.";
      }

      setErrorTitle(niceTitle);
      setErrorMessage(niceMessage);
      setModalType('error');
      setShowModal(true);
  };


    const handleOpenPaymentModal = (tierName: string, tierIndex: number, priceDisplay: string) => {
      if (!searchTerm) {
          setErrorTitle("Enter a Name");
          setErrorMessage("Please enter a name in the search box first.");
          setModalType('error');
          setShowModal(true);
          return;
      }

      if (status !== 'available') {
          setErrorTitle("Name Not Available");
          setErrorMessage("This name is not available or already taken. Please search for another name.");
          setModalType('error');
          setShowModal(true);
          return;
      }

      if (!address || !address.startsWith('0x')) {
          setErrorTitle("Wallet Required");
          setErrorMessage("Please connect a valid wallet first.");
          setModalType('error');
          setShowModal(true);
          return;
      }

      setSelectedTierForPayment({ name: tierName, index: tierIndex, priceDisplay });
      setIsPaymentModalOpen(true);
  };

  const handleMintProcess = async (tierName: string, tierIndex: number, priceDisplay: string) => {
      if (!searchTerm) {
          setErrorTitle("Enter a Name");
          setErrorMessage("Please enter a name in the search box first.");
          setModalType('error');
          setShowModal(true);
          return;
      }

      if (status !== 'available') {
          setErrorTitle("Name Not Available");
          setErrorMessage("This name is not available or already taken.");
          setModalType('error');
          setShowModal(true);
          return;
      }

      if (!address || !address.startsWith('0x')) {
          setErrorTitle("Wallet Required");
          setErrorMessage("Please connect a valid wallet first.");
          setModalType('error');
          setShowModal(true);
          return;
      }

      if (!publicClient) return;
      
      setIsMinting(true);
      setProcessStep("Preparing Secure Transaction...");
      setModalType('process');
      setShowModal(true);

      try {
          const polygonReadClient = createPublicClient({
              chain: polygon,
              transport: http('https://polygon-bor.publicnode.com')
          });

          let usdAmountWei = BigInt(0);
          if (tierName === "IMMORTAL") {
              usdAmountWei = await polygonReadClient.readContract({ address: CONTRACT_ADDRESS as `0x${string}`, abi: CONTRACT_ABI, functionName: 'priceImmortal' });
          } else if (tierName === "ELITE") {
              usdAmountWei = await polygonReadClient.readContract({ address: CONTRACT_ADDRESS as `0x${string}`, abi: CONTRACT_ABI, functionName: 'priceElite' });
          } else if (tierName === "FOUNDER") {
              usdAmountWei = await polygonReadClient.readContract({ address: CONTRACT_ADDRESS as `0x${string}`, abi: CONTRACT_ABI, functionName: 'priceFounder' });
          }

          let valueToSend = BigInt(0);
          if (usdAmountWei > BigInt(0)) {
              const costInMatic = await polygonReadClient.readContract({
                 address: CONTRACT_ADDRESS as `0x${string}`,
                 abi: CONTRACT_ABI,
                 functionName: 'getMaticCost',
                 args: [usdAmountWei]
              });
              valueToSend = (costInMatic * BigInt(101)) / BigInt(100); 
          }

          const balance = await polygonReadClient.getBalance({ address });
          if (balance < valueToSend) throw new Error("Insufficient funds (Pre-flight check): Low balance.");
          
          setProcessStep("Wallet: Please confirm payment to Treasury...");
          const txHash = await processPayment('POLYGON', formatEther(valueToSend));
          if (!txHash) throw new Error("Transaction rejected");

          setProcessStep("Payment Confirmed! Finalizing Registry...");

          const imageBlob = await generateSnapshot(searchTerm, tierName);
          if (!imageBlob) throw new Error("Failed to generate asset snapshot locally.");

          const date = new Date();
          const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const dynamicDate = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

          const formData = new FormData();
          formData.append('file', imageBlob, `NNM-${searchTerm}.png`);
          formData.append('name', searchTerm);
          formData.append('tier', tierName);
          formData.append('description', LONG_DESCRIPTION);
          formData.append('dynamicDate', dynamicDate);

          const apiResponse = await fetch('/api/generate-image', { 
              method: 'POST',
              body: formData 
          });

          if (!apiResponse.ok) throw new Error("Image Engine Error");
          const { gatewayUrl, metadataUri } = await apiResponse.json();

          fetch('/api/airdrop', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  wallet: address,
                  name: searchTerm,
                  tokenURI: metadataUri,
                  tierName: tierName,
                  imageUrl: gatewayUrl,
                  txHash: txHash,
                  coin: 'POLYGON'
              })
          }).catch(() => {});

          try {
               await fetch('/api/save-asset', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({
                       token_id: 0,
                       name: searchTerm,
                       tier: tierName,
                       image_url: gatewayUrl,
                       description: LONG_DESCRIPTION,
                       attributes: [
                        { trait_type: "Asset Type", value: "Digital Name" },
                        { trait_type: "Generation", value: "Gen-0" },
                        { trait_type: "Tier", value: tierName },
                        { trait_type: "Platform", value: "NNM Registry" },
                        { trait_type: "Collection", value: "Genesis - 001" },
                        { trait_type: "Mint Date", value: dynamicDate }
                      ],
                       mint_date: dynamicDate,
                       metadata_uri: metadataUri
                   })
               });
          } catch (e) {}

          if (txHash) {
               try {
                   await fetch('/api/affiliate', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ action: 'mint', transactionHash: txHash, referrerWallet: referrerWallet ? referrerWallet.toLowerCase() : null })
                   });
               } catch (e: any) {}
          }
          
                    if (txHash && typeof window !== 'undefined' && (window as any).fbq) {
              const priceVal = parseFloat(priceDisplay.replace(/[^0-9.]/g, '')) || 0;
              (window as any).fbq('track', 'Purchase', { value: priceVal, currency: 'USD' });
          }


          setModalType('success');
          setShowModal(true);

      } catch (err) {
          handleError(err);
      } finally {
          setIsMinting(false);
      }
  };


  const GOLD_GRADIENT_DIAGONAL = 'linear-gradient(135deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%)';

  if (!mounted) return null;

  return (
<main dir="ltr" style={{ backgroundColor: '#0f121a', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '50px', position: 'relative', direction: 'ltr' }}>
      <title>NNM | Mint</title>
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <MintTemplate 
            ref={templateRef} 
            name={snapshotData.name} 
            tier={snapshotData.tier} 
        />
      </div>

      <div className="container hero-container text-center">
        <h1 className="fw-bold mb-2" style={{ fontSize: '32px', fontFamily: 'serif', letterSpacing: '1px', color: '#EAECEF' }}>
          Claim Your Nexus <span style={{ color: '#FCD535', textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>Digital Name</span> Assets
        </h1>
        <p className="mx-auto" style={{ maxWidth: '600px', fontFamily: '"Inter", "Segoe UI", sans-serif', fontSize: '15px', lineHeight: '1.6', color: '#848E9C' }}>
          Mint your visual Nexus Name asset on the Polygon network. First-come, first-served. Immutable. Global. Yours forever.
        </p>
      </div>

<div className="container mb-1" style={{ marginTop: '15px' }}>
        <div className="mx-auto position-relative" style={{ maxWidth: '600px' }}>
          <form onSubmit={checkAvailability} className="position-relative">
            <input 
              type="text" 
              className="form-control text-center" 
              placeholder="Enter name to check ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleInputFocus} 
              style={{ backgroundColor: '#1E2329', border: status === 'available' ? '1px solid #0ecb81' : (status === 'taken' ? '1px solid #f6465d' : '1px solid #2B3139'), borderRadius: '50px', height: '52px', fontSize: '20px', fontWeight: '300', boxShadow: '0 0 30px rgba(0,0,0,0.5)', color: '#EAECEF', caretColor: '#FCD535' }}
            />
            <button type="submit" className="btn position-absolute top-50 start-0 translate-middle-y ms-1 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', background: GOLD_GRADIENT_DIAGONAL, border: 'none', transition: 'all 0.3s', right: '5px' }}>
                {isSearching ? <div className="spinner-border text-dark" style={{ width: '18px', height: '18px' }} role="status"></div> : <i className="bi bi-search text-dark" style={{ fontSize: '20px' }}></i>}
            </button>
          </form>

          <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '6px', marginBottom: '0px' }}>
            {status === 'available' && <div className="d-inline-flex align-items-center gap-2 px-4 py-1 rounded-pill fade-in" style={{ backgroundColor: 'rgba(14, 203, 129, 0.1)', border: '1px solid #0ecb81' }}><i className="bi bi-check-circle-fill" style={{ color: '#0ecb81', fontSize: '14px' }}></i><span className="fw-bold" style={{ fontSize: '13px', color: '#EAECEF' }}>Available! You can mint now.</span></div>}
            {status === 'taken' && <div className="d-inline-flex align-items-center gap-2 px-4 py-1 rounded-pill fade-in" style={{ backgroundColor: 'rgba(246, 70, 93, 0.1)', border: '1px solid #f6465d' }}><i className="bi bi-x-circle-fill" style={{ color: '#f6465d', fontSize: '14px' }}></i><span className="fw-bold" style={{ fontSize: '13px', color: '#EAECEF' }}>Taken! Please choose another.</span></div>}
            {status === 'too_short' && <div className="d-inline-flex align-items-center gap-2 px-4 py-1 rounded-pill fade-in" style={{ backgroundColor: 'rgba(246, 70, 93, 0.1)', border: '1px solid #f6465d' }}><i className="bi bi-exclamation-circle-fill" style={{ color: '#f6465d', fontSize: '14px' }}></i><span className="fw-bold" style={{ fontSize: '13px', color: '#EAECEF' }}>Min. 2 characters required!</span></div>}
          </div>
        </div>
      </div>

      <div className="container mt-0">
        <h5 className="text-center mb-4 select-asset-title" style={{ letterSpacing: '2px', fontSize: '11px', textTransform: 'uppercase', color: '#848E9C' }}>Select Asset Class</h5>
        <div className="row justify-content-center g-2 mobile-clean-stack"> 
            <LuxuryIngot 
                label="IMMORTAL" 
                price="$10" 
                isAvailable={status === 'available'} 
                onMint={() => handleOpenPaymentModal("IMMORTAL", 0, "$10")} 
                isMinting={isMinting} 
            />

            <LuxuryIngot 
                label="ELITE" 
                price="$5" 
                isAvailable={status === 'available'} 
                onMint={() => handleOpenPaymentModal("ELITE", 1, "$5")} 
                isMinting={isMinting} 
            />

            <LuxuryIngot 
                label="FOUNDERS" 
                price="$3"
                isAvailable={status === 'available'} 
                onMint={() => handleOpenPaymentModal("FOUNDER", 2, "$3")} 
                isMinting={isMinting} 
            />

        </div>
        <div className="row justify-content-center mt-4 mb-2">
            <div className="col-10 col-md-6 text-center">
                <span style={{ fontSize: '14px', color: '#848E9C', opacity: 0.8, display: 'block' }}>
                    Minting means you accept the T&C
                </span>
            </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            {}
<div style={{ width: '100%', maxWidth: '320px', backgroundColor: '#0f121a', border: '1px solid #2B3139', borderRadius: '15px', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', textAlign: 'center', position: 'relative' }}>                <button onClick={handleCloseModal} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#848E9C', fontSize: '20px', cursor: 'pointer', zIndex: 10 }}><i className="bi bi-x-lg"></i></button>
                {modalType === 'success' && (
                   <div className="fade-in">
                     <div className="mb-3"><i className="bi bi-check-circle-fill" style={{fontSize: '2.6rem', color: '#0ecb81'}}></i></div>
                     <h3 className="fw-bold mb-2" style={{ color: '#EAECEF', fontSize: '1.4rem' }}>Payment Successful</h3>
                     <p className="mb-3" style={{ color: '#848E9C', fontSize: '13px', lineHeight: '1.6' }}>
                        <br/><br/>
                        <strong style={{color: '#0ecb81'}}>
                        </strong>
                     </p>
                     <Link href={`/dashboard`} passHref>
                        <button className="btn w-100 fw-bold py-2" style={{ background: GOLD_GRADIENT_DIAGONAL, border: 'none', color: '#181A20', fontSize: '14px', borderRadius: '8px' }}>View Dashboard <i className="bi bi-arrow-right ms-2"></i></button>
                     </Link>
                     <div className="mt-3"><button onClick={handleCloseModal} className="btn btn-link text-decoration-none" style={{fontSize: '11px', color: '#848E9C'}}>Close</button></div>
                   </div>
                )}
                {modalType === 'founder_success' && (
                   <div className="fade-in">
                     <div className="mb-3"><i className="bi bi-check-circle-fill" style={{fontSize: '2.6rem', color: '#0ecb81'}}></i></div>
                     <h3 className="fw-bold mb-2" style={{ color: '#EAECEF', fontSize: '1.4rem' }}>History Made!</h3>
                     <p className="mb-3" style={{ color: '#848E9C', fontSize: '13px' }}>
                        The name <span style={{color: '#FCD535'}}>{searchTerm}</span> is now your eternal digital asset.
                        <br/>
                        <strong style={{color: '#0ecb81', display: 'block', marginTop: '10px'}}>
                           In a few minutes, the NFT will be sent to your wallet for free.
                        </strong>
                     </p>
                     <Link href={`/dashboard`} passHref>
                        <button className="btn w-100 fw-bold py-2" style={{ background: GOLD_GRADIENT_DIAGONAL, border: 'none', color: '#181A20', fontSize: '14px', borderRadius: '8px' }}>View Dashboard <i className="bi bi-arrow-right ms-2"></i></button>
                     </Link>
                     <div className="mt-3"><button onClick={handleCloseModal} className="btn btn-link text-decoration-none" style={{fontSize: '11px', color: '#848E9C'}}>Close</button></div>
                   </div>
                )}
                {modalType === 'process' && (
                   <div className="fade-in">
                     <div className="mb-3 position-relative d-inline-block">
                        {}
                        <div className="spinner-border" style={{ color: '#FCD535', width: '3rem', height: '3rem', borderWidth: '0.2em' }} role="status"></div>
                        <div className="position-absolute top-50 start-50 translate-middle fw-bold" style={{ fontSize: '12px', color: '#EAECEF' }}>{timer}</div>
                     </div>
                     <h4 className="fw-bold mb-2" style={{ color: '#EAECEF', fontSize: '1.2rem' }}>Processing...</h4>
                     <p className="mb-2 fw-bold" style={{ fontSize: '12px', color: '#FCD535' }}>{processStep}</p>
                     <p className="mb-3" style={{ fontSize: '11px', color: '#848E9C' }}>Do not close this window. Auto-reset in {timer}s.</p>
                     <button onClick={handleCloseModal} className="btn btn-link text-decoration-none" style={{fontSize: '11px', color: '#848E9C'}}>Cancel & Reset UI</button>
                   </div>
                )}

                {modalType === 'error' && (
                    <div className="fade-in">
                        {}
                        <i className="bi bi-info-circle-fill mb-3" style={{ fontSize: '2.2rem', color: '#FCD535' }}></i>
                        <h5 className="fw-bold mb-2" style={{ color: '#EAECEF', fontSize: '1.1rem' }}>{errorTitle || "Notice"}</h5>
                        <p className="mb-3" style={{ fontSize: '12px', color: '#848E9C' }}>{errorMessage}</p>
                        <button onClick={handleCloseModal} className="btn w-100 fw-bold py-2" style={{ backgroundColor: 'transparent', color: '#EAECEF', border: '1px solid #848E9C', fontSize: '13px' }}>Close & Retry</button>
                    </div>
                )}
            </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
<div className="fade-in" style={{ width: '100%', maxWidth: '290px', backgroundColor: '#0f121a', border: '1px solid rgba(252, 213, 53, 0.15)', borderRadius: '14px', padding: '16px', boxShadow: '0 15px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(252, 213, 53, 0.03)', position: 'relative' }}>                
                <button onClick={() => setIsPaymentModalOpen(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#848E9C', fontSize: '15px', cursor: 'pointer', zIndex: 10 }}>
                    <i className="bi bi-x-lg"></i>
                </button>

                <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                    <span style={{ background: 'rgba(252, 213, 53, 0.1)', color: '#FCD535', padding: '3px 8px', borderRadius: '5px', fontSize: '8px', fontWeight: '700', letterSpacing: '1px', border: '1px solid rgba(252, 213, 53, 0.2)' }}>
                        🔥 {selectedTierForPayment.name === 'IMMORTAL' ? 'MOST POPULAR' : 'LIMITED ACCESS'}
                    </span>
                </div>

                <h2 style={{ textAlign: 'center', color: '#EAECEF', fontSize: '15px', marginBottom: '8px', letterSpacing: '1px', fontWeight: '600' }}>
                    {selectedTierForPayment.name} TIER
                </h2>

                <div style={{ textAlign: 'center', marginBottom: '2px' }}>
                    <div style={{ fontSize: '38px', fontWeight: '800', color: '#FFFFFF', lineHeight: '1', textShadow: '0 0 15px rgba(252, 213, 53, 0.3)' }}>
                        {selectedTierForPayment.name === 'IMMORTAL' ? '3000' : selectedTierForPayment.name === 'ELITE' ? '2000' : '1000'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#FCD535', letterSpacing: '1.5px', fontWeight: '700', marginTop: '2px' }}>
                        BONUS NNM TOKENS
                    </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '10px', color: '#EAECEF', fontWeight: '500', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    Competition Entry + Token Bonus
                </div>

                <p style={{ textAlign: 'center', color: '#848E9C', fontSize: '10px', marginBottom: '14px' }}>
                    ≈ {selectedTierForPayment.priceDisplay} one-time access
                </p>

                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <p style={{ fontSize: '9px', color: '#5E6673', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '700' }}>
                        Select Payment Network
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
                        
                        <button 
                            onClick={() => setSelectedCoin('POLYGON')}
                            className={`payment-icon-btn ${selectedCoin === 'POLYGON' ? 'active-coin' : ''}`}
                            title="Pay with Polygon (MATIC/POL)"
                        >
                            <img src={COIN_LOGOS.POLYGON} width="20" height="20" alt="Polygon" style={{ objectFit: 'contain' }} />
                        </button>

                        {['SOL', 'USDT', 'ETH'].map((coin) => (
                            <button 
                                key={coin}
                                onClick={() => setSelectedCoin(coin)}
                                className={`payment-icon-btn ${selectedCoin === coin ? 'active-coin' : ''}`}
                                title={`Pay with ${coin}`}
                                style={{ position: 'relative', overflow: 'visible' }}
                            >
                                <img src={COIN_LOGOS[coin]} width={coin === 'USDT' ? "24" : coin === 'ETH' ? "16" : "20"} height={coin === 'USDT' ? "24" : coin === 'ETH' ? "18" : "20"} alt={coin} style={{ objectFit: 'contain' }} />
                                 {coin === 'USDT' && (
                                    <span style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', fontSize: '7px', color: '#848E9C', fontWeight: '300', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                                        Solana
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                  onClick={() => {
                      setIsPaymentModalOpen(false);
                      if(selectedCoin === 'POLYGON') {
                          handleMintProcess(selectedTierForPayment.name, selectedTierForPayment.index, selectedTierForPayment.priceDisplay);
                      } else {
                          handleAlternativePayment(selectedCoin);
                      }
                  }}
                  className="btn-ingot"
                  style={{ width: '100%', height: '44px', fontSize: '13px', marginTop: '2px', boxShadow: '0 0 15px rgba(252, 213, 53, 0.2)' }}>
                    Unlock Entry + {selectedTierForPayment.name === 'IMMORTAL' ? '3000' : selectedTierForPayment.name === 'ELITE' ? '2000' : '1000'} NNM
                </button>

                <div style={{ marginTop: '10px', textAlign: 'left', paddingLeft: '8px' }}>
                    <div style={{ fontSize: '9px', color: '#848E9C', marginBottom: '2px' }}><i className="bi bi-check2 text-success me-1"></i> Instant access guaranteed</div>
                    <div style={{ fontSize: '9px', color: '#848E9C', marginBottom: '2px' }}><i className="bi bi-check2 text-success me-1"></i> Bonus allocated instantly</div>
                    <div style={{ fontSize: '9px', color: '#848E9C' }}><i className="bi bi-check2 text-success me-1"></i> Limited early participants</div>
                </div>

                <p style={{ textAlign: 'center', color: '#FCD535', fontSize: '9px', marginTop: '8px', marginBottom: '0', fontWeight: '700', letterSpacing: '0.5px' }}>
                    ⏳ Early access phase – ending soon
                </p>
            </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
        
        .payment-icon-btn { 
            width: 32px; 
            height: 32px; 
            border-radius: 8px; 
            background: rgba(255, 255, 255, 0.02); 
            border: 1px solid rgba(255, 255, 255, 0.05); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer; 
            transition: all 0.3s ease; 
        }
        
        .payment-icon-btn:hover { 
            border-color: rgba(255, 255, 255, 0.2); 
            background: rgba(255, 255, 255, 0.06);
            transform: translateY(-2px); 
        }

        .payment-icon-btn.active-coin {
            border-color: rgba(255, 255, 255, 0.4);
            background: rgba(255, 255, 255, 0.12);
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.05);
        }
        
        .payment-icon-btn:active { 
            transform: scale(0.97); 
        }

        .force-ltr { direction: ltr !important; }
        .fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .form-control::placeholder { color: #848E9C; font-weight: 300; }
        .form-control:focus { background-color: #1E2329 !important; color: #EAECEF !important; border-color: #FCD535 !important; }
        
        .btn-ingot {
            background: linear-gradient(180deg, #E6C76A 0%, #D4AF37 40%, #B8962E 100%);
            border: 1px solid #B8962E;
            color: #2b1d00 !important;
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

        .btn-ingot:hover { filter: brightness(1.08); transform: translateY(-1px); color: #2b1d00 !important; }
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

interface LuxuryIngotProps {
    label: string;
    price: any;
    isAvailable: boolean;
    onMint: () => void;
    isMinting: boolean;
}

const LuxuryIngot = ({ label, price, isAvailable, onMint, isMinting }: LuxuryIngotProps) => {
    
    const { isConnected } = useAccount(); 
    
    return (
        <div className="col-12 col-md-4 d-flex flex-column align-items-center ingot-wrapper">
            <div className="mb-2 d-flex justify-content-center align-items-baseline gap-2 price-top-container"><span className="fw-bold" style={{ fontSize: '16px', fontFamily: 'sans-serif', color: '#EAECEF' }}>{price}</span></div>
            <div className="luxury-btn-container" style={{ width: '100%' }}>
                
                {!isConnected ? (
                    <div className="custom-connect-btn" style={{ width: '100%' }}>
                        <ConnectButton.Custom>
                            {({ openConnectModal }) => (
                                <button 
                                    onClick={openConnectModal}
                                    className="btn-ingot"
                                    style={{ width: '100%', height: '50px', cursor: 'pointer' }}
                                >
                                    {label}
                                </button>
                            )}
                        </ConnectButton.Custom>
                    </div>
                ) : (
                    <button
                        onClick={onMint} 
                        disabled={isMinting}
                        className="btn-ingot"
                        style={{ width: '100%', height: '50px', cursor: isMinting ? 'wait' : 'pointer' }}
                    >
                       {isMinting ? <div className="spinner-border spinner-border-sm text-dark" role="status"></div> : label}
                    </button>
                )}
                
            </div>
            <div className="mobile-price-display" style={{ display: 'none' }}><span style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#EAECEF' }}>{price}</span></div>
        </div>
    );
};

export default dynamic(() => Promise.resolve(MintContent), { ssr: false });


