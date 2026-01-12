'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseAbi, formatEther, parseEther } from 'viem';
import { NFT_COLLECTION_ADDRESS, MARKETPLACE_ADDRESS } from '@/data/config';

// 1. SECURITY CONFIG
// استبدل هذا العنوان بعنوان محفظتك الحالية (الأدمن)
const OWNER_WALLET = "0x5f2f670df4Db14ddB4Bc1E3eCe86CA645fb01BE6".toLowerCase();
const ACCESS_CODE_SECRET = "NNM-2026"; // كلمة المرور للدخول

// 2. SMART CONTRACT INTERFACES (ABIs)
const REGISTRY_ABI = parseAbi([
  "function setPrices(uint256 _immortal, uint256 _elite, uint256 _founder) external",
  "function withdraw() external",
  "function setAuthorizedMinter(address _wallet, bool _status) external",
  "function transferOwnership(address newOwner) external",
  "function priceImmortal() view returns (uint256)",
  "function priceElite() view returns (uint256)",
  "function priceFounder() view returns (uint256)",
  "function paused() view returns (bool)",
  "function pause() external",
  "function unpause() external"
]);

const MARKET_ABI = parseAbi([
  "function setPlatformFee(uint256 _newFee) external",
  "function platformFee() view returns (uint256)",
  "function transferOwnership(address newOwner) external"
]);

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  // --- AUTH STATES ---
  const [isWalletAdmin, setIsWalletAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessInput, setAccessInput] = useState('');
  const [authError, setAuthError] = useState('');

  // --- DATA STATES ---
  const [loading, setLoading] = useState(false);
  const [contractBalance, setContractBalance] = useState('0');
  
  // Prices (Display in Dollars)
  const [prices, setPrices] = useState({ immortal: '', elite: '', founder: '' });
  const [newPrices, setNewPrices] = useState({ immortal: '', elite: '', founder: '' });
  
  // Market Fee (100 = 1%)
  const [marketFee, setMarketFee] = useState('0');
  const [newFee, setNewFee] = useState('');

  // Authorized Minter
  const [authMinterAddress, setAuthMinterAddress] = useState('');
  
  // Ownership Transfer (Danger Zone)
  const [newOwnerAddress, setNewOwnerAddress] = useState('');

  // --- INITIAL CHECK ---
  useEffect(() => {
    if (isConnected && address && address.toLowerCase() === OWNER_WALLET) {
        setIsWalletAdmin(true);
    } else {
        setIsWalletAdmin(false);
    }
  }, [address, isConnected]);

  // --- FETCH DATA (After Auth) ---
  useEffect(() => {
      if (isAuthenticated && publicClient) {
          refreshData();
      }
  }, [isAuthenticated, publicClient]);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (accessInput === ACCESS_CODE_SECRET) {
          setIsAuthenticated(true);
          setAuthError('');
      } else {
          setAuthError('INVALID ACCESS CODE');
          setAccessInput('');
      }
  };

  const refreshData = async () => {
      if (!publicClient) return;
      setLoading(true);
      try {
          // 1. Get Balance
          const balance = await publicClient.getBalance({ address: NFT_COLLECTION_ADDRESS as `0x${string}` });
          setContractBalance(formatEther(balance));

          // 2. Get Prices
          const [pImmortal, pElite, pFounder] = await Promise.all([
              publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: REGISTRY_ABI, functionName: 'priceImmortal' }),
              publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: REGISTRY_ABI, functionName: 'priceElite' }),
              publicClient.readContract({ address: NFT_COLLECTION_ADDRESS as `0x${string}`, abi: REGISTRY_ABI, functionName: 'priceFounder' })
          ]);

          // Convert Wei to Dollars (divide by 1e18) for display
          setPrices({
              immortal: formatEther(pImmortal as bigint),
              elite: formatEther(pElite as bigint),
              founder: formatEther(pFounder as bigint)
          });

          // 3. Get Market Fee
          const fee = await publicClient.readContract({ address: MARKETPLACE_ADDRESS as `0x${string}`, abi: MARKET_ABI, functionName: 'platformFee' });
          setMarketFee(fee.toString()); // 100 = 1%

      } catch (e) { console.error("Fetch Error:", e); }
      setLoading(false);
  };

  // --- ACTIONS ---

  // 1. Set Prices
  const handleSetPrices = async () => {
      const imm = newPrices.immortal || prices.immortal;
      const eli = newPrices.elite || prices.elite;
      const fou = newPrices.founder || prices.founder;

      if (!confirm(`Update Prices to:\nImmortal: $${imm}\nElite: $${eli}\nFounder: $${fou}`)) return;

      try {
          await writeContractAsync({
              address: NFT_COLLECTION_ADDRESS as `0x${string}`,
              abi: REGISTRY_ABI,
              functionName: 'setPrices',
              // Convert Dollars to Wei (multiply by 1e18) as required by contract
              args: [parseEther(imm), parseEther(eli), parseEther(fou)]
          });
          alert("Transaction Sent! Prices updating...");
          refreshData();
      } catch (e: any) { alert("Error: " + e.message); }
  };

  // 2. Withdraw
  const handleWithdraw = async () => {
      if (!confirm("⚠️ Are you sure you want to withdraw ALL funds from the contract?")) return;
      try {
          await writeContractAsync({
              address: NFT_COLLECTION_ADDRESS as `0x${string}`,
              abi: REGISTRY_ABI,
              functionName: 'withdraw',
          });
          alert("Withdrawal Initiated!");
          refreshData();
      } catch (e: any) { alert("Error: " + e.message); }
  };

  // 3. Set Market Fee
  const handleSetFee = async () => {
      if (!newFee) return;
      // Input: 1.5 -> Contract needs 150
      const feeValue = Number(newFee) * 100; 
      if (!confirm(`Set Marketplace Fee to ${newFee}%?`)) return;

      try {
          await writeContractAsync({
              address: MARKETPLACE_ADDRESS as `0x${string}`,
              abi: MARKET_ABI,
              functionName: 'setPlatformFee',
              args: [BigInt(Math.floor(feeValue))]
          });
          alert("Fee Update Sent!");
          refreshData();
      } catch (e: any) { alert("Error: " + e.message); }
  };

  // 4. Authorized Minter
  const handleAuthMinter = async (status: boolean) => {
      if (!authMinterAddress) return;
      const action = status ? "AUTHORIZE" : "REVOKE";
      if (!confirm(`${action} minting rights for: ${authMinterAddress}?`)) return;

      try {
          await writeContractAsync({
              address: NFT_COLLECTION_ADDRESS as `0x${string}`,
              abi: REGISTRY_ABI,
              functionName: 'setAuthorizedMinter',
              args: [authMinterAddress as `0x${string}`, status]
          });
          alert(`Wallet ${action}D successfully.`);
          setAuthMinterAddress('');
      } catch (e: any) { alert("Error: " + e.message); }
  };

  // 5. Transfer Ownership (Danger Zone)
  const handleTransferOwnership = async (targetContract: 'REGISTRY' | 'MARKET') => {
      if (!newOwnerAddress) return;
      if (!confirm(`⛔ DANGER: You are about to transfer ownership of the ${targetContract} to:\n${newOwnerAddress}\n\nThis action is irreversible. Are you sure?`)) return;

      const contractAddr = targetContract === 'REGISTRY' ? NFT_COLLECTION_ADDRESS : MARKETPLACE_ADDRESS;
      const abi = targetContract === 'REGISTRY' ? REGISTRY_ABI : MARKET_ABI;

      try {
          await writeContractAsync({
              address: contractAddr as `0x${string}`,
              abi: abi,
              functionName: 'transferOwnership',
              args: [newOwnerAddress as `0x${string}`]
          });
          alert(`Ownership Transfer Initiated for ${targetContract}.`);
      } catch (e: any) { alert("Error: " + e.message); }
  };

  // --- RENDER ---

  if (!isWalletAdmin) return (
      <div className="fullscreen-msg text-danger">
          <i className="bi bi-shield-lock-fill" style={{fontSize:'4rem'}}></i>
          <h2>ACCESS DENIED</h2>
          <p>This wallet is not authorized.</p>
      </div>
  );

  if (!isAuthenticated) return (
      <div className="fullscreen-msg">
          <div className="login-box">
              <i className="bi bi-cpu-fill text-gold" style={{fontSize:'3rem'}}></i>
              <h3>NNM CONTROL UNIT</h3>
              <form onSubmit={handleLogin} className="mt-4">
                  <input type="password" value={accessInput} onChange={e=>setAccessInput(e.target.value)} placeholder="Access Code" autoFocus />
                  <button type="submit">UNLOCK</button>
              </form>
              {authError && <p className="text-danger mt-3">{authError}</p>}
          </div>
      </div>
  );

  return (
    <div className="admin-container">
      <div className="header">
          <div>
              <h1><i className="bi bi-grid-1x2-fill text-gold"></i> CONTROL UNIT</h1>
              <p className="text-muted mb-0">System Status: <span className="text-success">ONLINE</span></p>
          </div>
          <div className="balance-badge">
              <span>Treasury Balance:</span>
              <span className="amount">{parseFloat(contractBalance).toFixed(4)} POL</span>
              <button onClick={handleWithdraw} className="btn-withdraw" title="Withdraw All Funds"><i className="bi bi-wallet2"></i> Withdraw</button>
          </div>
      </div>

      <div className="dashboard-grid">
          
          {/* 1. REVENUE CONTROL */}
          <div className="panel">
              <div className="panel-title text-gold"><i className="bi bi-coin"></i> Mint Prices (USD)</div>
              <div className="panel-body">
                  <div className="input-row">
                      <label>Immortal ($)</label>
                      <input type="number" placeholder={prices.immortal} onChange={e=>setNewPrices({...newPrices, immortal: e.target.value})} />
                  </div>
                  <div className="input-row">
                      <label>Elite ($)</label>
                      <input type="number" placeholder={prices.elite} onChange={e=>setNewPrices({...newPrices, elite: e.target.value})} />
                  </div>
                  <div className="input-row">
                      <label>Founder ($)</label>
                      <input type="number" placeholder={prices.founder} onChange={e=>setNewPrices({...newPrices, founder: e.target.value})} />
                  </div>
                  <button onClick={handleSetPrices} className="btn-action mt-3">UPDATE PRICES</button>
              </div>
          </div>

          {/* 2. MARKETPLACE CONTROL */}
          <div className="panel">
              <div className="panel-title text-blue"><i className="bi bi-shop"></i> Marketplace Fee</div>
              <div className="panel-body">
                  <div className="stat-display">Current Fee: <span>{(Number(marketFee)/100).toFixed(2)}%</span></div>
                  <div className="input-row mt-3">
                      <label>New Fee (%)</label>
                      <input type="number" step="0.1" placeholder="e.g. 2.5" onChange={e=>setNewFee(e.target.value)} />
                  </div>
                  <button onClick={handleSetFee} className="btn-action mt-3">UPDATE FEE</button>
              </div>
          </div>

          {/* 3. ACCESS CONTROL */}
          <div className="panel">
              <div className="panel-title text-green"><i className="bi bi-person-badge"></i> Authorized Minters</div>
              <div className="panel-body">
                  <p className="small-text">Add wallets that can mint for free (Gas only).</p>
                  <input type="text" placeholder="Wallet Address (0x...)" value={authMinterAddress} onChange={e=>setAuthMinterAddress(e.target.value)} className="w-100 mb-2" />
                  <div className="d-flex gap-2">
                      <button onClick={()=>handleAuthMinter(true)} className="btn-action flex-grow-1">AUTHORIZE</button>
                      <button onClick={()=>handleAuthMinter(false)} className="btn-action btn-danger flex-grow-1">REVOKE</button>
                  </div>
              </div>
          </div>

          {/* 4. DANGER ZONE (OWNERSHIP) */}
          <div className="panel border-danger">
              <div className="panel-title text-danger"><i className="bi bi-exclamation-octagon-fill"></i> Transfer Ownership</div>
              <div className="panel-body">
                  <p className="small-text text-danger">Warning: This transfers full control to a new wallet.</p>
                  <input type="text" placeholder="New Owner Address (0x...)" value={newOwnerAddress} onChange={e=>setNewOwnerAddress(e.target.value)} className="w-100 mb-2" />
                  <div className="d-flex gap-2">
                      <button onClick={()=>handleTransferOwnership('REGISTRY')} className="btn-action btn-danger-outline flex-grow-1">Registry</button>
                      <button onClick={()=>handleTransferOwnership('MARKET')} className="btn-action btn-danger-outline flex-grow-1">Marketplace</button>
                  </div>
              </div>
          </div>

      </div>

      <style jsx>{`
        .admin-container { min-height: 100vh; background: #050505; color: #fff; padding: 100px 20px 50px; font-family: 'Inter', sans-serif; }
        .fullscreen-msg { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #000; color: #fff; }
        
        .login-box { background: #111; padding: 40px; border: 1px solid #333; border-radius: 12px; text-align: center; width: 320px; }
        .login-box input { width: 100%; padding: 12px; background: #000; border: 1px solid #333; color: #fff; text-align: center; letter-spacing: 2px; margin-bottom: 10px; border-radius: 6px; }
        .login-box button { width: 100%; padding: 12px; background: #FCD535; border: none; font-weight: bold; cursor: pointer; border-radius: 6px; }

        .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; border-bottom: 1px solid #222; padding-bottom: 20px; flex-wrap: wrap; gap: 20px; }
        .header h1 { margin: 0; font-size: 24px; color: #fff; }
        .text-gold { color: #FCD535; } .text-blue { color: #38BDF8; } .text-green { color: #0ecb81; } .text-danger { color: #ff4d4d; }
        
        .balance-badge { background: #111; padding: 10px 20px; border-radius: 8px; border: 1px solid #333; display: flex; align-items: center; gap: 10px; }
        .balance-badge .amount { font-size: 18px; font-weight: bold; color: #fff; font-family: monospace; }
        .btn-withdraw { background: #333; color: #fff; border: 1px solid #555; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; }
        .btn-withdraw:hover { background: #fff; color: #000; }

        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto; }
        
        .panel { background: #111; border: 1px solid #222; border-radius: 10px; padding: 20px; }
        .panel.border-danger { border-color: rgba(255, 77, 77, 0.3); }
        .panel-title { font-size: 16px; font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px; }
        
        .input-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .input-row label { font-size: 12px; color: #888; }
        .input-row input { width: 100px; background: #000; border: 1px solid #333; color: #fff; padding: 6px; text-align: center; border-radius: 4px; font-size: 14px; }
        .w-100 { width: 100% !important; text-align: left !important; }

        .btn-action { width: 100%; padding: 10px; background: #FCD535; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; color: #000; }
        .btn-action:hover { background: #e0bc2e; }
        .btn-danger { background: #ff4d4d; color: #fff; } .btn-danger:hover { background: #cc0000; }
        .btn-danger-outline { background: transparent; border: 1px solid #ff4d4d; color: #ff4d4d; } .btn-danger-outline:hover { background: #ff4d4d; color: #fff; }
        
        .small-text { font-size: 11px; color: #666; margin-bottom: 10px; }
        .stat-display { font-size: 14px; color: #888; } .stat-display span { color: #fff; font-weight: bold; font-size: 18px; margin-left: 5px; }
      `}</style>
    </div>
  );
}
