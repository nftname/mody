"use client";
import React, { useState, useEffect } from 'react';

export default function NexusPresalePage() {
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('POL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    if (payAmount) {
      const rate = 10000; 
      setReceiveAmount((parseFloat(payAmount) * rate).toString());
    } else {
      setReceiveAmount('');
    }
  }, [payAmount]);

  const handleConnectClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmConnection = () => {
    if (hasAcceptedTerms) {
      setIsModalOpen(false);
      setWalletConnected(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative font-sans antialiased bg-[#0B0F19] text-slate-300">
      
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-purple-500/30 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.15)] max-w-lg w-full p-6 sm:p-8 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-4">Terms & Conditions</h3>
            
            <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-1">
                  <input 
                    type="checkbox" 
                    className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded-md checked:bg-purple-600 checked:border-purple-600 transition-all"
                    checked={hasAcceptedTerms}
                    onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                  />
                  <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-sm text-slate-300 leading-relaxed select-none group-hover:text-slate-200 transition-colors">
                  I confirm that I have read and agree to the NNM Terms of Service and understand that NNM Tokens are digital utility tokens intended solely for use within the NNM ecosystem. I acknowledge that participation in this optional token distribution is voluntary, involves significant risk, and that I may lose the entire value of the digital assets contributed. I further confirm that I am not participating with any expectation of profit or financial return.
                </span>
              </label>
            </div>

            <button 
              onClick={handleConfirmConnection}
              disabled={!hasAcceptedTerms}
              className={`w-full h-12 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                hasAcceptedTerms 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Accept & Connect MetaMask
            </button>
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-[#0B0F19]/90 backdrop-blur-xl border-white/5 py-0 shadow-sm">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="flex h-20 items-center justify-between gap-4">
            <div className="flex-1 flex items-center justify-start min-w-0">
              <a className="flex items-center gap-3 group relative transition-all duration-300 hover:opacity-80" href="/">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                  <span className="text-xs text-slate-500">LOGO</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl tracking-tighter text-white">NNM</span>
                  <span className="text-[10px] text-purple-400 font-medium tracking-widest uppercase">Nexus Market</span>
                </div>
              </a>
            </div>
            
            <div className="flex-1 flex items-center justify-end gap-4 min-w-0">
              {walletConnected && (
                <div className="hidden lg:flex items-center gap-3 bg-[#111827] px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span className="text-sm font-medium text-slate-300">0.00 NNM</span>
                  </div>
                  <div className="w-px h-4 bg-slate-700"></div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-sm font-medium text-slate-300">0.00 POL</span>
                  </div>
                </div>
              )}
              
              <button 
                onClick={!walletConnected ? handleConnectClick : undefined}
                className="inline-flex items-center justify-center whitespace-nowrap transition-all bg-purple-600 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:bg-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] rounded-xl h-11 px-6 text-sm gap-2"
              >
                {walletConnected ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    0x...A1B2
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 pt-24">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>

        <section className="relative overflow-hidden flex items-center pt-16 pb-16 md:pt-24 md:pb-24">
          <div className="container relative z-10 mx-auto px-4 max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 text-left">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                  Polygon Mainnet Live
                </div>
                
                <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
                  Nexus Digital <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Name Assets</span> Market
                </h1>
                
                <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 relative overflow-hidden mt-10">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500"></div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    Important Notice
                  </h3>
                  <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                    <p>
                      <strong className="text-slate-200">NNM Tokens</strong> are digital utility units designed for use within the NNM ecosystem and its protocol functionalities. They are not securities, investment contracts, or financial instruments.
                    </p>
                    <p>
                      Participation in this optional genesis distribution is entirely voluntary and may involve the complete loss of contributed digital assets due to the experimental nature of blockchain technologies.
                    </p>
                    <p>
                      By proceeding, you acknowledge that you are acquiring NNM Tokens solely for their potential utility within the ecosystem and not with any expectation of profit or financial return.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
                <div className="w-full max-w-[460px]">
                  <div className="bg-[#111827] rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(168,85,247,0.1)] border border-slate-800 relative">
                    
                    <div className="absolute top-0 right-10 w-32 h-32 bg-purple-600/20 blur-[50px] rounded-full pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Genesis Price</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-white tracking-tight">$0.0001</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-sm font-medium mb-1">Hardcap</p>
                        <span className="text-xl font-bold text-white">3.5B NNM</span>
                      </div>
                    </div>

                    <div className="bg-[#0B0F19] rounded-2xl p-5 border border-slate-800 mb-6 relative z-10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Payment</span>
                        <div className="flex gap-2 bg-[#111827] p-1 rounded-lg border border-slate-700">
                          <button 
                            onClick={() => setPaymentMethod('POL')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${paymentMethod === 'POL' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-800 border border-transparent'}`}
                          >
                            <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-600">
                               <span className="text-[6px]">POL</span>
                            </div>
                            POL
                          </button>
                          <button 
                            onClick={() => setPaymentMethod('USDT')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${paymentMethod === 'USDT' ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'text-slate-400 hover:bg-slate-800 border border-transparent'}`}
                          >
                            <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-600">
                               <span className="text-[6px]">USDT</span>
                            </div>
                            USDT
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-[#111827] rounded-xl p-4 border border-slate-700 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-bold text-slate-500">Amount to Pay</p>
                            <p className="text-xs text-slate-500">Min: $5</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <input 
                              type="number" 
                              className="bg-transparent border-none p-0 text-2xl font-bold text-white w-full focus:outline-none focus:ring-0 placeholder:text-slate-700" 
                              placeholder="0.0" 
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                            />
                            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-700">
                              <span className="text-sm font-bold text-white">{paymentMethod}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center -my-3 relative z-20">
                          <div className="bg-[#111827] rounded-full p-2 border border-slate-700 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                          </div>
                        </div>

                        <div className="bg-[#111827] rounded-xl p-4 border border-slate-700">
                          <p className="text-xs font-bold text-slate-500 mb-2">You Receive</p>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              readOnly 
                              className="bg-transparent border-none p-0 text-2xl font-bold text-white w-full focus:outline-none focus:ring-0 placeholder:text-slate-700" 
                              placeholder="0.0" 
                              value={receiveAmount}
                            />
                            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-700">
                               <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-600">
                                 <span className="text-[8px] text-white">N</span>
                               </div>
                              <span className="text-sm font-bold text-purple-400">NNM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={walletConnected ? () => setIsModalOpen(true) : handleConnectClick}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl h-14 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] relative z-10"
                    >
                      {walletConnected ? 'Buy NNM Tokens' : 'Connect Wallet'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 border-t border-slate-800/50 bg-[#0B0F19]">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16">
              <span className="text-purple-400 font-bold tracking-wider uppercase text-sm mb-2 block">Protocol Infrastructure</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">NNM Ecosystem Tokenomics & Vesting</h2>
              <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
                The NNM Token is the core utility asset powering the ChainFace Identity Layer and the NNM Name Market ecosystem. Total Supply: <strong className="text-white">10,000,000,000 NNM</strong>.
              </p>
            </div>

            <div className="space-y-6 relative">
              <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-slate-800 hidden md:block"></div>

              <div className="bg-[#111827] border border-slate-800 p-6 md:p-8 rounded-2xl relative flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="hidden md:flex absolute -left-10 w-8 h-8 rounded-full bg-[#0B0F19] border-4 border-purple-500 items-center justify-center z-10"></div>
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-purple-400">35%</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">1 — Early Network Bootstrapping</h3>
                  <p className="text-purple-300 text-sm font-medium mb-3">3,500,000,000 NNM</p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Allocated to early network participants who will help establish the initial identity layer of the NNM ecosystem. This phase enables early adopters to mint unique blockchain-based digital names.
                  </p>
                  <div className="bg-[#0B0F19] rounded-lg p-3 text-xs border border-slate-800 text-slate-400 break-all">
                    <span className="text-slate-500 block mb-1">Genesis Contract Address:</span>
                    <span className="text-purple-400 font-mono">0xb03aa911B7b59d83cA62EC1e5958e9F78fd1Be72</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800 p-6 md:p-8 rounded-2xl relative flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="hidden md:flex absolute -left-10 w-8 h-8 rounded-full bg-[#0B0F19] border-4 border-blue-500 items-center justify-center z-10"></div>
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-blue-400">25%</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">2 — Protocol Liquidity</h3>
                  <p className="text-blue-300 text-sm font-medium mb-3">2,500,000,000 NNM</p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Reserved to establish decentralized liquidity across major DEXs. Upon network launch, LP tokens will be locked using independently verifiable third-party smart contracts for a minimum of 12 months.
                  </p>
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800 p-6 md:p-8 rounded-2xl relative flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="hidden md:flex absolute -left-10 w-8 h-8 rounded-full bg-[#0B0F19] border-4 border-emerald-500 items-center justify-center z-10"></div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-emerald-400">15%</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">3 — Community & Ecosystem Rewards</h3>
                  <p className="text-emerald-300 text-sm font-medium mb-3">1,500,000,000 NNM</p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Supports growth, minting incentives, and community development. Subject to a 6-Month Linear Vesting schedule (16.66% monthly release beginning April 15, 2026).
                  </p>
                  <div className="bg-[#0B0F19] rounded-lg p-3 text-xs border border-slate-800 text-slate-400 break-all">
                    <span className="text-slate-500 block mb-1">Contract Address & PinkLock Proof:</span>
                    <span className="text-emerald-400 font-mono block mb-1">0xAf78a2C02D4C9e0e79Be5AaCF84379919C071ec9</span>
                    <a href="https://www.pinksale.finance/pinklock/polygon/record/1007818" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">View Proof</a>
                  </div>
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800 p-6 md:p-8 rounded-2xl relative flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="hidden md:flex absolute -left-10 w-8 h-8 rounded-full bg-[#0B0F19] border-4 border-amber-500 items-center justify-center z-10"></div>
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-amber-400">15%</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">4 — Ecosystem Expansion & Partnerships</h3>
                  <p className="text-amber-300 text-sm font-medium mb-3">1,500,000,000 NNM</p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Reserved for global ecosystem expansion, Web3 partnerships, and infrastructure integrations. Distributed through dedicated vesting smart contracts incorporating post-launch lockups.
                  </p>
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800 p-6 md:p-8 rounded-2xl relative flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="hidden md:flex absolute -left-10 w-8 h-8 rounded-full bg-[#0B0F19] border-4 border-pink-500 items-center justify-center z-10"></div>
                <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-pink-400">10%</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">5 — Core Contributors</h3>
                  <p className="text-pink-300 text-sm font-medium mb-3">1,000,000,000 NNM</p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Development team allocation subject to strict vesting controls: 12-Month Cliff Lock. 100% of contributor tokens remain locked until March 15, 2027.
                  </p>
                  <div className="bg-[#0B0F19] rounded-lg p-3 text-xs border border-slate-800 text-slate-400 break-all">
                    <span className="text-slate-500 block mb-1">Contract Address & PinkLock Proof:</span>
                    <span className="text-pink-400 font-mono block mb-1">0xB8945be19F938ABDe60D126104C14dA502b53778</span>
                    <a href="https://www.pinksale.finance/pinklock/polygon/record/1007817" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">View Proof</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#111827] border-y border-slate-800/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.5l-2.5 6c-.2.5 0 1 .4 1.2L6 15.3l-1.6 1.6c-.6.6-.6 1.6 0 2.2l2.1 2.1c.6.6 1.6.6 2.2 0l1.6-1.6 1.4 4.4c.2.4.7.6 1.2.4l6-2.5c.3-.2.6-.6.5-1.1z"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Automated Deflationary Mechanics</h3>
                <p className="text-slate-400 leading-relaxed mb-4">
                  To support long-term ecosystem sustainability and ensure that token supply evolves alongside real protocol usage, the NNM ecosystem incorporates an automated deflationary mechanism linked directly to network activity.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  <strong className="text-white">Usage-Based Burn:</strong> 50% of the protocol revenue generated from minting new digital name assets is permanently removed from circulation through an automated burn process.
                </p>
              </div>
              
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Security & Transparency</h3>
                <p className="text-slate-400 leading-relaxed mb-4">
                  All token allocations are enforced through immutable smart contracts deployed on the Polygon blockchain.
                </p>
                <ul className="space-y-2 text-slate-400 list-disc pl-5">
                  <li>Independently verified token distribution</li>
                  <li>Immutable vesting schedules</li>
                  <li>Locked liquidity commitments</li>
                  <li>Transparent burn mechanics</li>
                </ul>
                <p className="text-slate-400 mt-4 text-sm">
                  All smart contract activity can be publicly verified through PolygonScan.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-[#0B0F19]">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 md:p-10">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider text-center">Disclaimer & Legal Framework</h3>
              <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                <p>
                  NNM Tokens are digital utility units intended solely for use within the NNM ecosystem and its associated protocol functionalities. NNM Tokens do not represent equity, shares, securities, or ownership rights in any company or legal entity.
                </p>
                <p>
                  Participation in any optional token distribution or genesis allocation event is entirely voluntary and carries inherent risks associated with blockchain technologies, digital assets, and decentralized networks.
                </p>
                <p>
                  The NNM protocol does not guarantee market value, liquidity, exchange listings, or price behavior of any digital asset. Participants should conduct their own independent research and consult qualified professional advisors before acquiring NNM Tokens.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-[#05070A] border-t border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                 <span className="text-[8px] text-slate-500">LOGO</span>
              </div>
              <span className="font-bold text-xl text-white">NNM</span>
              <span className="text-slate-500 text-sm ml-4">© 2026 Nexus Digital Name. LIVE on Polygon Mainnet.</span>
            </div>
            <div className="flex gap-6">
              <a href="https://www.nftnnm.com/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">Official Platform</a>
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
