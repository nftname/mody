"use client";

import React, { useState } from 'react';

export default function NexusPresalePage() {
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('POL');

  return (
    <div className="min-h-screen flex flex-col relative font-sans antialiased bg-[#fafaf9] text-slate-900">
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white/80 backdrop-blur-xl border-black/5 py-0 shadow-sm">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex-1 flex items-center justify-start min-w-0">
              <a className="flex items-center gap-2 group relative transition-all duration-300 hover:opacity-80" href="/">
                <div className="flex items-center justify-center font-bold text-2xl tracking-tighter">
                  <span className="text-purple-600">N</span>
                  <span className="text-slate-900">NM</span>
                </div>
              </a>
            </div>
            <nav className="hidden xl:flex items-center justify-center grow shrink-0">
              <div className="flex items-center gap-1 bg-black/5 px-2 py-1 rounded-full border border-black/5">
                <a href="#about" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-full hover:bg-white/50">About</a>
                <a href="#tokenomics" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-full hover:bg-white/50">Tokenomics</a>
                <a href="#roadmap" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-full hover:bg-white/50">Roadmap</a>
              </div>
            </nav>
            <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                Polygon Network
              </div>
              <button className="inline-flex items-center justify-center whitespace-nowrap transition-all bg-slate-900 text-white font-semibold shadow-md hover:bg-slate-800 hover:-translate-y-0.5 rounded-lg h-10 px-5 text-sm gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                </svg>
                <span className="hidden sm:inline">Connect Wallet</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 pt-24">
        <section className="relative overflow-hidden flex items-center pt-16 pb-16 md:pt-24 md:pb-24">
          <div className="container relative z-10 mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-sm font-medium text-purple-700">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  Official Presale is Live
                </div>
                <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-tight">
                  Nexus Digital <br />
                  <span className="text-purple-600">Name NFTs</span> Market
                </h1>
                <p className="mb-10 text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  The first fully decentralized digital identity and naming marketplace built on Polygon. Secure your unique Web3 identity today through our exclusive NNM token presale.
                </p>
                <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
                  <button className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all bg-purple-600 text-white hover:bg-purple-700 rounded-full h-14 px-8 text-lg w-full sm:w-auto shadow-lg shadow-purple-500/30">
                    Buy NNM Tokens
                  </button>
                  <a href="#whitepaper" className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 rounded-full h-14 px-8 text-lg w-full sm:w-auto">
                    Read Whitepaper
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-end">
                <div className="w-full max-w-[440px]">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Presale Raised</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">$125,450</span>
                          <span className="text-slate-400 text-sm font-medium">/ $500,000</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 text-sm font-medium mb-1">Listing Price</p>
                        <span className="text-xl font-bold text-slate-900">$0.05</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600 text-sm font-medium">Phase 1</span>
                      <span className="text-purple-600 text-sm font-bold">25%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 mb-6 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[25%]"></div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Payment</span>
                        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                          <button 
                            onClick={() => setPaymentMethod('POL')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${paymentMethod === 'POL' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            POL
                          </button>
                          <button 
                            onClick={() => setPaymentMethod('USDT')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${paymentMethod === 'USDT' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            USDT
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-3 border border-slate-200 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                          <p className="text-xs font-bold text-slate-400 mb-1">Amount to Pay</p>
                          <div className="flex items-center justify-between">
                            <input 
                              type="number" 
                              className="bg-transparent border-none p-0 text-xl font-bold text-slate-900 w-full focus:outline-none focus:ring-0" 
                              placeholder="0.0" 
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                            />
                            <span className="text-sm font-bold text-slate-700 ml-2">{paymentMethod}</span>
                          </div>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10">
                          <div className="bg-white rounded-full p-1.5 border border-slate-200 shadow-sm text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                          </div>
                        </div>

                        <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 opacity-80">
                          <p className="text-xs font-bold text-slate-400 mb-1">You Receive</p>
                          <div className="flex items-center justify-between">
                            <input 
                              type="text" 
                              readOnly 
                              className="bg-transparent border-none p-0 text-xl font-bold text-slate-900 w-full focus:outline-none focus:ring-0" 
                              placeholder="0.0" 
                              value={receiveAmount}
                            />
                            <span className="text-sm font-bold text-purple-600 ml-2">NNM</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-14 flex items-center justify-center gap-2 transition-all shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>
                      Connect Wallet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white border-y border-slate-100">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Fully Audited</h3>
                <p className="text-slate-500 text-sm">Smart contracts verified</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Polygon Native</h3>
                <p className="text-slate-500 text-sm">Low fees & high speed</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Utility Driven</h3>
                <p className="text-slate-500 text-sm">Real world ecosystem</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-purple-600 font-bold tracking-wider uppercase text-sm mb-2 block">The Ecosystem</span>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6">What is NNM?</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Nexus Digital Name NFTs Market (NNM) is a revolutionary marketplace bridging Web3 identity with digital assets. We provide a decentralized ecosystem where users can mint, trade, and utilize exclusive domain names as NFTs on the Polygon network.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Decentralized Names</h3>
                <p className="text-slate-600 leading-relaxed">
                  Mint unique digital identities that act as your universal Web3 username, wallet address, and portfolio identifier all in one secure NFT.
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Zero Gas Marketplace</h3>
                <p className="text-slate-600 leading-relaxed">
                  Leveraging Polygon's infrastructure, NNM offers near-zero gas fees for trading, buying, and selling your digital identity assets seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="tokenomics" className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-purple-600 font-bold tracking-wider uppercase text-sm mb-2 block">Token Economics</span>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6">NNM Tokenomics</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Total Supply: <span className="font-bold text-slate-900">10,000,000,000 NNM</span>
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative flex justify-center">
                <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full relative" style={{ background: 'conic-gradient(#8b5cf6 0% 30%, #3b82f6 30% 50%, #10b981 50% 70%, #f59e0b 70% 85%, #ec4899 85% 100%)' }}>
                  <div className="absolute inset-0 m-auto w-48 h-48 sm:w-64 sm:h-64 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
                    <span className="text-3xl font-extrabold text-slate-900">10B</span>
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">Total Supply</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-purple-500 shadow-sm"></div>
                    <div>
                      <h4 className="font-bold text-slate-900">Presale & Public Sale</h4>
                      <p className="text-sm text-slate-500">Distributed to early adopters</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-slate-900">30%</span>
                </div>
                
                <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>
                    <div>
                      <h4 className="font-bold text-slate-900">Liquidity & Exchanges</h4>
                      <p className="text-sm text-slate-500">DEX and CEX listings</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-slate-900">20%</span>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm"></div>
                    <div>
                      <h4 className="font-bold text-slate-900">Platform Ecosystem</h4>
                      <p className="text-sm text-slate-500">Rewards and development</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-slate-900">20%</span>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-amber-500 shadow-sm"></div>
                    <div>
                      <h4 className="font-bold text-slate-900">Marketing & Partnerships</h4>
                      <p className="text-sm text-slate-500">Global expansion</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-slate-900">15%</span>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-pink-500 shadow-sm"></div>
                    <div>
                      <h4 className="font-bold text-slate-900">Core Team</h4>
                      <p className="text-sm text-slate-500">Locked and vested</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-slate-900">15%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="roadmap" className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-900 to-slate-900 pointer-events-none"></div>
          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="text-center mb-16">
              <span className="text-purple-400 font-bold tracking-wider uppercase text-sm mb-2 block">The Journey</span>
              <h2 className="text-4xl font-extrabold mb-6">Project Roadmap</h2>
            </div>

            <div className="space-y-8">
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-bold text-xs rounded-full uppercase">Phase 1</span>
                  <h3 className="text-2xl font-bold">Foundation</h3>
                </div>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Concept Development</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Smart Contract Creation on Polygon</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Security Audit & KYC</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Presale Launch</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-bold text-xs rounded-full uppercase">Phase 2</span>
                  <h3 className="text-2xl font-bold">Marketplace Live</h3>
                </div>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Token Claim & Distribution</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-blue-400"></span> DEX Listing (QuickSwap)</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-blue-400"></span> NNM NFT Marketplace Beta Release</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-blue-400"></span> First Global Marketing Campaign</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden backdrop-blur-sm opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-slate-500/20 text-slate-300 font-bold text-xs rounded-full uppercase">Phase 3</span>
                  <h3 className="text-2xl font-bold">Expansion & Integration</h3>
                </div>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-slate-500"></span> CEX Listings</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-slate-500"></span> Integration with Major Web3 Wallets</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-slate-500"></span> Governance Staking Launch</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-slate-900">NNM</span>
              <span className="text-slate-500 text-sm">© 2026 Nexus Digital Name. All rights reserved.</span>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-purple-600 transition-colors">Twitter</a>
              <a href="#" className="text-slate-400 hover:text-purple-600 transition-colors">Telegram</a>
              <a href="#" className="text-slate-400 hover:text-purple-600 transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
