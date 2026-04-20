'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const COLOR_NAVY_BG = '#050a16';
const TARGET_DATE = new Date('2026-05-22T12:00:00Z').getTime();

export default function PresalePage() {
    const [isMounted, setIsMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isConnected, setIsConnected] = useState(false);
    
    const [blockchainData, setBlockchainData] = useState({
        currentPhase: 1,
        currentPrice: 0.001,
        nextPrice: 0.0025,
        phaseTarget: 300000000,
        tokensSoldInPhase: 0,
        baseFomoFill: 5
    });
    
    const totalPresaleAllocation = 300000000;
    const finalPrice = 0.007;
    const currentRate = blockchainData.currentPrice === 0.001 ? 80000 : 32000;

    const progressPercentage = Math.min(
        100, 
        ((blockchainData.tokensSoldInPhase / blockchainData.phaseTarget) * 100) + blockchainData.baseFomoFill
    );

    const [activeDonut, setActiveDonut] = useState({ label: 'TOTAL SUPPLY', val: '1B', color: '#fff' });
    
    const allocations = [
        { id: 'presale', label: 'Presale Allocation', percent: 30, color: '#ff85a1' },
        { id: 'rewards', label: 'Platform Rewards', percent: 34, color: '#9b51e0' },
        { id: 'liquidity', label: 'Liquidity Pool', percent: 15, color: '#14F195' },
        { id: 'treasury', label: 'Treasury & Growth', percent: 8, color: '#f3c24d' },
        { id: 'team', label: 'Team Allocation', percent: 5, color: '#00bfff' },
        { id: 'dev', label: 'Development Fund', percent: 5, color: '#00fa9a' },
        { id: 'reserve', label: 'Emergency Reserve', percent: 3, color: '#d3a4ff' }
    ];

    const [solAmount, setSolAmount] = useState('');
    const [nnmAmount, setNnmAmount] = useState('');

    useEffect(() => {
        setIsMounted(true);
        
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const difference = TARGET_DATE - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [isMounted]);

    const toEnglishDigits = (str: string) => {
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return str.replace(/[٠-٩]/g, (char) => arabicNumbers.indexOf(char).toString()).replace(/[^0-9.]/g, '');
    };

    const handleSolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = toEnglishDigits(e.target.value);
        setSolAmount(val);
        if (val && !isNaN(Number(val))) {
            const calculated = Number(val) * currentRate;
            setNnmAmount(calculated.toString());
        } else {
            setNnmAmount('');
        }
    };

    const handleQuickSelect = (amount: number) => {
        setSolAmount(amount.toString());
        setNnmAmount((amount * currentRate).toString());
    };

    if (!isMounted) return null;

    return (
        <main className="presale-wrapper">
           <title>NNM | presale</title>
           
            <div className="twinkling-stars"></div>

            <div className="container-main">
                <header className="nav-top">
                    <div className="neon-btn-group">
                        <Link href="/whitepaper" className="link-reset">
                            <button className="neon-btn"><span>Whitepaper</span></button>
                        </Link>
                        <a href="#tokenomics-section" className="link-reset">
                            <button className="neon-btn"><span>Tokenomics</span></button>
                        </a>
                        <a href="#burn-section" className="link-reset">
                            <button className="neon-btn"><span>Burn Protocol</span></button>
                        </a>
                        <a href="#roadmap-section" className="link-reset">
                            <button className="neon-btn"><span>Roadmap</span></button>
                        </a>
                        <Link href="/presale/balance" className="link-reset">
                            <button className="neon-btn"><span>Balance</span></button>
                        </Link>
                    </div>
                </header>

                <section className="hero-section">
                    <div className="hero-text-block">
                        <h1 className="hero-title gradient-glow">Web3 Identity Utility Access with $NNM</h1>
                        <p className="hero-description">
                           Access the $NNM Genesis phase. Limited participation. 
                           Powered by a native utility token.
                        </p>

                        <div className="benefits-list">
                            <div className="benefit-bar">
                                <span className="benefit-number">1</span>
                                <span className="benefit-text">Lifetime digital identity on the NNM Registry</span>
                                <span className="benefit-icon">&#10003;</span>
                            </div>
                            <div className="benefit-bar">
                                <span className="benefit-number">2</span>
                                <span className="benefit-text">ChainFace payments & management</span>
                                <span className="benefit-icon">&#10003;</span>
                            </div>
                            <div className="benefit-bar">
                                <span className="benefit-number">3</span>
                                <span className="benefit-text">1,000 WNNM points for platform rewards</span>
                                <span className="benefit-icon">&#10003;</span>
                            </div>
                            <div className="benefit-bar">
                                <span className="benefit-number">4</span>
                                <span className="benefit-text">NNM utility allocation for early testers</span>
                                <span className="benefit-icon">&#10003;</span>
                            </div>
                        </div>
                    </div>

                    <div className="presale-fomo-panel">
                        <div className="d-flex justify-content-between mb-3 align-items-end">
                            <div className="price-line text-left">
                                Phase {blockchainData.currentPhase} Price<br/>
                                <span className="text-white fw-bold" style={{ fontSize: '1.2rem' }}>${blockchainData.currentPrice}</span>
                            </div>

                            <div className="price-line text-right">
                                Listing Price<br/>
                                <span className="gold-metallic-text" style={{ fontSize: '1.4rem' }}>${finalPrice}</span>
                            </div>
                        </div>

                        <div className="countdown-inline-row mb-3" style={{ justifyContent: 'center' }}>
                            <div className="countdown-wrapper">
                                <div className="time-box">
                                    <span className="time-value">{timeLeft.days}</span>
                                    <span className="time-label">D</span>
                                </div>
                                <div className="time-box">
                                    <span className="time-value">{timeLeft.hours}</span>
                                    <span className="time-label">H</span>
                                </div>
                                <div className="time-box">
                                    <span className="time-value">{timeLeft.minutes}</span>
                                    <span className="time-label">M</span>
                                </div>
                                <div className="time-box">
                                    <span className="time-value">{timeLeft.seconds}</span>
                                    <span className="time-label">S</span>
                                </div>
                            </div>
                        </div>

                        <div className="progress-container-presale mb-3">
                            <div className="d-flex justify-content-between mb-1">
                                <span className="text-light-muted" style={{ fontSize: '0.75rem' }}>Phase {blockchainData.currentPhase} Availability</span>
                                <span className="text-white fw-bold" style={{ fontSize: '0.75rem' }}>
                                    300,000,000 NNM
                                </span>
                            </div>
                            <div className="presale-bar-style">
                                <div 
                                    className="presale-fill-style" 
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="exchange-module">
                            <div className="quick-select-container">
                                <button className="quick-btn" onClick={() => handleQuickSelect(0.1)}>0.1 SOL</button>
                                <button className="quick-btn" onClick={() => handleQuickSelect(0.5)}>0.5 SOL</button>
                                <button className="quick-btn" onClick={() => handleQuickSelect(1)}>1 SOL</button>
                                <button className="quick-btn" onClick={() => handleQuickSelect(10)}>10 SOL</button>
                                <button className="quick-btn" onClick={() => handleQuickSelect(15)}>15 SOL</button>
                            </div>

                            <div className="input-card mb-2">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="input-label">YOU CONTRIBUTE</span>
                                </div>
                                <div className="input-row">
                                    <input 
                                        type="text" 
                                        inputMode="decimal"
                                        placeholder="0.0" 
                                        value={solAmount}
                                        onChange={handleSolChange}
                                        className="crypto-input"
                                        lang="en"
                                        dir="ltr"
                                    />
                                    <div className="token-selector">
                                        <div className="token-icon sol-icon"></div>
                                        <span>SOL</span>
                                    </div>
                                </div>
                            </div>

                            <div className="input-card mb-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="input-label">YOU GET</span>
                                </div>
                                <div className="input-row">
                                    <input 
                                        type="text" 
                                        placeholder="0" 
                                        value={nnmAmount}
                                        readOnly
                                        className="crypto-input readonly"
                                        lang="en"
                                        dir="ltr"
                                    />
                                    <div className="token-selector">
                                        <div className="token-icon nnm-icon"></div>
                                        <span>NNM</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ position: 'relative', width: '75%', margin: '0 auto' }}>
                                <div style={{ 
                                    position: 'absolute', 
                                    top: 0, left: 0, right: 0, bottom: 0, 
                                    backgroundColor: 'transparent', 
                                    zIndex: 10, 
                                    borderRadius: '10px', 
                                    cursor: 'not-allowed'
                                }}></div>
                                
                                <button className="connect-wallet-btn" style={{ width: '100%', opacity: 1 }}>
                                    <span>{isConnected ? 'Participate Now' : 'Connect Wallet'}</span>
                                </button>
                            </div>
                            
                            <div style={{ textAlign: 'center', margin: '12px 0' }}>
                                <span className="gradient-glow" style={{ fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                    ⏳ Opening ... 22-5-2026
                                </span>
                            </div>

                            <div className="legal-disclaimer mt-2">
                                Participating means you accept the T&C
                            </div>
                        </div>
                    </div>
                </section>

                <section className="features-section">
                    <div className="feature-card">
                        <h3 className="feature-title gradient-glow">ChainFace Identity</h3>
                        <p className="feature-desc">
                            Transforming purely speculative NFTs into hyper-functional Web3 utilities via verified cross-chain payment dashboards.
                        </p>
                    </div>
                    <div className="feature-card">
                        <h3 className="feature-title gradient-glow">The NFX Global Index</h3>
                        <p className="feature-desc">
                            The authoritative observatory for the NFT ecosystem, featuring Ecosystem Sentiment, Network Activity, and Ecosystem Size.
                        </p>
                    </div>
                    <div className="feature-card">
                        <h3 className="feature-title gradient-glow">Conviction Rank</h3>
                        <p className="feature-desc">
                            An immutable, sybil-resistant ranking system rewarding genuine community belief over artificial wash trading.
                        </p>
                    </div>
                </section> 

                                <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '15px' }}>
                    <h2 className="hero-title gradient-glow" style={{ fontSize: '1.25rem', margin: 0 }}>Automated Integrity Protocol</h2>
                </div>

                      <div id="burn-section" className="burn-box-wide" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px', textAlign: 'left', marginTop: '0' }}>
                    <div>
                        <div className="burn-header" style={{ justifyContent: 'flex-start', marginBottom: '10px' }}>
                            <span className="burn-icon">🔥</span>
                            <h4 className="gradient-glow" style={{ fontSize: '1.1rem', margin: 0 }}>Genesis Supply Calibration</h4>
                        </div>
                        <p style={{ textAlign: 'left', margin: 0, color: '#b0c0c0', fontSize: '0.85rem', lineHeight: '1.6' }}>
                            To fortify network resilience and ensure a stable technical launch, a "Technical Exclusion" of 50,000,000 units from the NNM total supply has been executed prior to the presale phase. This proactive measure optimizes smart contract efficiency and reinforces the infrastructure against inflation, ensuring a streamlined, high-performance operational environment from day one.
                        </p>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(162, 0, 255, 0.15)', width: '100%' }}></div>

                    <div>
                        <div className="burn-header" style={{ justifyContent: 'flex-start', marginBottom: '10px' }}>
                            <span className="burn-icon">⚙️</span>
                            <h4 className="gradient-glow" style={{ fontSize: '1.1rem', margin: 0 }}>Operational Sustainability Mechanism</h4>
                        </div>
                        <p style={{ textAlign: 'left', margin: 0, color: '#b0c0c0', fontSize: '0.85rem', lineHeight: '1.6' }}>
                            As part of our commitment to digital identity sovereignty, 10% of units generated via platform activity—including digital name minting—are autonomously and permanently decommissioned. This automated protocol functions as a technical shield, fortifying the network against adversarial spam while maintaining the long-term structural equilibrium of the NNM and ChainFace infrastructure.
                        </p>
                    </div>
                </div>

                <div className="tokenomics-header">
                    <h2 className="hero-title gradient-glow" style={{ fontSize: '1.25rem' }}>NNM Tokenomics</h2>
                </div>
                
                <section className="tokenomics-section" id="tokenomics-section">
                    <div className="tokenomics-card">
                        <div className="donut-container">
                            <div className="donut-legend">
                                {allocations.map((item, i) => (
                                    <div key={i} className="legend-item" onMouseEnter={() => setActiveDonut({ label: item.label, val: `${item.percent}%`, color: item.color })} onMouseLeave={() => setActiveDonut({ label: 'TOTAL SUPPLY', val: '1B', color: '#fff' })}>
                                        <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                                        <span className="legend-text">{item.label} {item.percent}%</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="donut-chart-wrapper">
                                <svg viewBox="0 0 36 36" className="donut-chart" style={{ overflow: 'visible' }}>
                                    <circle strokeDasharray="100 0" strokeDashoffset="0" cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#1a1a3a" strokeWidth="4"></circle>
                                    {allocations.map((slice, index) => {
                                        let cumulativePercent = 0;
                                        for (let i = 0; i < index; i++) cumulativePercent += allocations[i].percent;
                                        const offset = 100 - cumulativePercent;
                                        return (
                                            <circle 
                                                key={index}
                                                strokeDasharray={`${slice.percent} ${100 - slice.percent}`} 
                                                strokeDashoffset={offset} 
                                                cx="18" cy="18" r="15.91549430918954" 
                                                fill="transparent" 
                                                stroke={slice.color} 
                                                strokeWidth="4"
                                                className="donut-segment"
                                                onMouseEnter={() => setActiveDonut({ label: slice.label, val: `${slice.percent}%`, color: slice.color })}
                                                onMouseLeave={() => setActiveDonut({ label: 'TOTAL SUPPLY', val: '1B', color: '#fff' })}
                                            ></circle>
                                        );
                                    })}
                                </svg>
                                <div className="donut-inner-text">
                                    <span className="donut-val" style={{ color: activeDonut.color }}>{activeDonut.val}</span>
                                    <span className="donut-label">{activeDonut.label}</span>
                                </div>
                            </div>
                        </div>

                        <div className="token-info-table">
                            <div className="table-row">
                                <span className="table-key">Total Supply</span>
                                <span className="table-val text-white">1,000,000,000</span>
                            </div>
                            <div className="table-row">
                                <span className="table-key">Genesis Price</span>
                                <span className="table-val text-white">$0.001 per NNM</span>
                            </div>
                            <div className="table-row">
                                <span className="table-key">Chain</span>
                                <span className="table-val chain-val">
                                    <div className="table-icon" style={{backgroundImage: "url('/icons/sol.svg')"}}></div>
                                    Solana
                                </span>
                            </div>
                            <div className="table-row">
                                <span className="table-key">Contract</span>
                                <span className="table-val">
                                    <a href="#!" onClick={(e) => e.preventDefault()} className="blue-link">BfKz5Afz...koX5x</a>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="tokenomics-card">
                        <div className="allocation-details-scroll">
                            <div className="alloc-item">
                                <h4 className="gradient-glow">Presale Allocation (30%)</h4>
                                <p>Distributed to early participants in the Genesis phase. 250% unlocked at TGE, remainder released linearly over 60 days. <a href="#!" onClick={(e) => e.preventDefault()} className="verify-link">View Contract ↗</a></p>
                            </div>
                            <div className="alloc-item">
                                <h4 className="gradient-glow">Liquidity Pool (10%) 🔒</h4>
                                <p>Allocated to DEX liquidity. Locked for 365 days post‑listing to protect price stability.</p>
                            </div>
                            <div className="alloc-item">
                                <h4 className="gradient-glow">Platform Rewards & Ecosystem (34%) 🔒</h4>
                                <p>5% unlocked at TGE; remaining 30% released linearly over 12 months. <a href="#!" onClick={(e) => e.preventDefault()} className="verify-link">View Vesting ↗</a></p>
                            </div>
                            <div className="alloc-item">
                                <h4 className="gradient-glow">Treasury & Growth (8%) 🔒</h4>
                                <p>5% unlocked at TGE; remaining 2% released linearly over 12 months. <a href="#!" onClick={(e) => e.preventDefault()} className="verify-link">View Vesting ↗</a></p>
                            </div>
                            <div className="alloc-item">
                                <h4 className="gradient-glow">Team Allocation (5%) 🔒</h4>
                                <p>Locked with 6‑month cliff, then linear vesting over 12 months. <a href="#!" onClick={(e) => e.preventDefault()} className="verify-link">View Vesting ↗</a></p>
                            </div>
                            <div className="alloc-item">
                                <h4 className="gradient-glow">Development Fund (5%) 🔒</h4>
                                <p>Locked with 6‑month cliff, then linear vesting over 12 months. <a href="#!" onClick={(e) => e.preventDefault()} className="verify-link">View Vesting ↗</a></p>
                            </div>
                            <div className="alloc-item">
                                <h4 className="gradient-glow">Emergency Reserve (3%) 🔒</h4>
                                <p>Available immediately via multi‑signature treasury wallet. <a href="#!" onClick={(e) => e.preventDefault()} className="verify-link">View Wallet ↗</a></p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="roadmap-header mt-100" id="roadmap-section">
                    <h2 className="hero-title gradient-glow" style={{ fontSize: '1.25rem', textAlign: 'left' }}>NNM Roadmap</h2>
                </div>

                <section className="roadmap-section">
                    <div className="roadmap-card">
                        <h3 className="feature-title gradient-glow">Phase 1 - The Genesis & Identity Layer</h3>
                        <p className="feature-desc">
                            Deployment of the NNM Protocol on the Polygon Mainnet. Activation of ChainFace identity profiles, enabling cross-chain interactions and foundational ecosystem functionality. Initial minting of Nexus Digital Name Assets.
                        </p>
                    </div>

                    <div className="roadmap-card">
                        <h3 className="feature-title gradient-glow">Phase 2 - Network Infrastructure & Activation</h3>
                        <p className="feature-desc">
                            Establishment of core ecosystem infrastructure, including multi-chain interaction capabilities within ChainFace and initial integration of the NFX Index for tracking network activity and ecosystem data.
                        </p>
                    </div>

                    <div className="roadmap-card">
                        <h3 className="feature-title gradient-glow">Phase 3 - Ecosystem Utility Distribution</h3>
                        <p className="feature-desc">
                            Ongoing distribution of the NNM utility token to early participants, enabling access to ecosystem features, identity services, and internal protocol interactions.
                        </p>
                    </div>

                    <div className="roadmap-card">
                        <h3 className="feature-title gradient-glow">Phase 4 - Platform Infrastructure & Mechanics</h3>
                        <p className="feature-desc">
                            Initialization of Internal system balancing mechanisms with time-locked smart contracts. Activation of usage-based platform mechanics , including automated supply adjustments linked to network activity.
                        </p>
                    </div>

                    <div className="roadmap-card">
                        <h3 className="feature-title gradient-glow">Phase 5 - Global Integration & Ecosystem Expansion</h3>
                        <p className="feature-desc">
                            Continuous expansion of the ChainFace identity layer and ecosystem infrastructure, supporting broader accessibility and long-term protocol evolution.
                        </p>
                    </div>
                </section>

                <div className="important-notice-footer">
                    Important Notice: NNM Tokens are digital utility units designed for use within the NNM ecosystem and its protocol functionalities. They are not securities, investment contracts, or financial instruments. Participation in this optional genesis distribution is entirely voluntary and may involve the complete loss of contributed digital assets due to the experimental nature of blockchain technologies. By proceeding, you acknowledge that you are acquiring NNM Tokens solely for their potential utility within the ecosystem and not with any expectation of profit or financial return.
                </div>

            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .presale-wrapper {
                    scroll-behavior: smooth;
                    background-color: ${COLOR_NAVY_BG};
                    min-height: 100vh;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                }

                .twinkling-stars {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    z-index: 0;
                    pointer-events: none;
                }

                .twinkling-stars::after {
                    content: "";
                    position: absolute;
                    top: -150%; left: -150%; width: 400%; height: 400%;
                    background-image: 
                        radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
                        radial-gradient(1.5px 1.5px at 100px 150px, #fff, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 200px 50px, #fff, rgba(0,0,0,0)),
                        radial-gradient(1.5px 1.5px at 300px 250px, #fff, rgba(0,0,0,0));
                    background-repeat: repeat;
                    background-size: 400px 400px;
                    opacity: 0.5;
                }

                .container-main {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 30px 4%;
                }

                .nav-top {
                    display: flex;
                    justify-content: flex-start;
                    margin-bottom: 27px;
                }

                .neon-btn-group {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                .link-reset { text-decoration: none; display: flex; }

                .neon-btn {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 75, 130, 0.25);
                    padding: 10px 22px;
                    border-radius: 30px;
                    backdrop-filter: blur(10px);
                    cursor: pointer;
                    opacity: 1;
                    transition: all 0.3s ease;
                }

                .neon-btn span {
                    background: linear-gradient(90deg, #9b51e0 0%, #ff4b82 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 700;
                }

                .neon-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 20px rgba(255, 75, 130, 0.4);
                }

                .hero-section {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 5%;
                    min-height: 50vh;
                }

                .hero-text-block {
                    width: 45%;
                    margin-top: 4%;
                    text-align: left;
                }

                .presale-fomo-panel {
                    margin-right: 3%;
                    width: 50%;
                    background: rgba(14, 28, 65, 0.25);
                    border: 1px solid rgba(162, 0, 255, 0.15);
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 0 15px rgba(162, 0, 255, 0.2), 0 0 40px rgba(162, 0, 255, 0.1);
                    padding: 28px 30px;
                    display: flex;
                    flex-direction: column;
                }

                .hero-title {
                    font-size: 2.2rem;
                    font-weight: 600;
                    line-height: 1.5;
                    margin-bottom: 12px;
                }

                .gradient-glow {
                    background: linear-gradient(90deg, #9b51e0 15%, #ff4b82 50%, #9b51e0 85%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-description {
                    color: #EAECEF;
                    font-size: 1.05rem;
                    line-height: 1.6;
                    font-weight: 200;
                    letter-spacing: 0.4px;
                }

                .benefits-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 70px;
                }

                .benefit-bar {
                    display: flex;
                    align-items: center;
                    background: rgba(14, 28, 65, 0.4);
                    border: 1px solid rgba(162, 0, 255, 0.15);
                    border-radius: 12px;
                    padding: 14px 20px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    opacity: 1;
                }

                .benefit-number {
                    font-weight: 800;
                    font-size: 1.1rem;
                    margin-right: 15px;
                    color: #ff4b82;
                }

                .benefit-text {
                    color: #EAECEF;
                    font-size: 0.85rem;
                    font-weight: 300;
                    letter-spacing: 0.4px;
                    flex-grow: 1;
                }

                .benefit-icon {
                    color: #14F195;
                    font-weight: bold;
                    font-size: 1.2rem;
                }
                .price-line { color: #b0c0c0; font-size: 0.8rem; line-height: 1.4; }
                
                .gold-metallic-text {
                    background: linear-gradient(135deg, #f7df85 0%, #e19d08 40%, #fbe9aa 50%, #f3c24d 60%, #e19d08 70%, #f7df85 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: inline-block;
                    font-weight: 900;
                }

                .countdown-inline-row {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 20px;
                    background: rgba(0,0,0,0.15);
                    padding: 12px 15px;
                    border-radius: 15px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .countdown-wrapper { display: flex; gap: 8px; }
                .time-box {
                    background: rgba(14, 28, 65, 0.6);
                    border: 1px solid rgba(155, 81, 224, 0.4);
                    border-radius: 8px;
                    padding: 10px 8px;
                    min-width: 55px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 0 10px rgba(162, 0, 255, 0.1);
                }
                .time-value {
                    color: #fff; font-size: 1.3rem; font-weight: 700; line-height: 1; margin-bottom: 2px;
                    text-shadow: 0 0 10px rgba(255, 75, 130, 0.5);
                }
                .time-label { color: #b0c0c0; font-size: 0.55rem; text-transform: uppercase; letter-spacing: 1px; }

                .current-price-inline {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    text-align: center;
                }

                .presale-bar-style {
                    width: 100%; height: 14px; background: rgba(14, 28, 65, 0.6); border-radius: 12px;
                    border: 1px solid rgba(155, 81, 224, 0.4); overflow: hidden;
                    box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
                }
                .presale-fill-style {
                    height: 100%; background: linear-gradient(90deg, #9b51e0 0%, #ff4b82 100%); border-radius: 12px;
                    box-shadow: 0 0 15px rgba(255, 75, 130, 0.6);
                }

                .exchange-module {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 16px;
                    padding: 18px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .quick-select-container {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                    justify-content: flex-end;
                    flex-wrap: wrap;
                }

                .quick-btn {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #b0c0c0;
                    font-size: 0.7rem;
                    padding: 4px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.1s;
                }

                .quick-btn:hover {
                    background: rgba(155, 81, 224, 0.3);
                    color: #fff;
                }

                .input-card {
                    background: rgba(14, 28, 65, 0.5);
                    border-radius: 12px;
                    padding: 9px 15px;
                    border: 1px solid rgba(255,255,255,0.08);
                }

                .input-label {
                    color: #fff;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }

                .input-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: transparent;
                }

                input.crypto-input::-webkit-outer-spin-button,
                input.crypto-input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                
                input.crypto-input {
                    -moz-appearance: textfield;
                }

                .crypto-input {
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 1.2rem;
                    font-weight: 400;
                    width: 60%;
                    outline: none;
                }
                
                .crypto-input::placeholder { color: rgba(255,255,255,0.2); }
                .crypto-input.readonly { color: #b0c0c0; }

                .token-selector {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.05);
                    padding: 6px 12px;
                    border-radius: 20px;
                    color: #fff;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .token-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                
                .sol-icon { 
                    background-image: url('/icons/sol.svg');
                    background-size: 65%;
                    background-color: #1a1a1a;
                }
                
                .nnm-icon { 
                    background-image: url('/logo-coyn-nnm.png');
                }

                .connect-wallet-btn {
                    width: 75%;
                    display: block;
                    margin: 0 auto;
                    background: linear-gradient(90deg, #9b51e0 0%, #ff4b82 100%);
                    border: none;
                    padding: 11px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 15px rgba(255, 75, 130, 0.3);
                }

                .connect-wallet-btn span {
                    color: white;
                    font-size: 0.85rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .connect-wallet-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 25px rgba(255, 75, 130, 0.5);
                }

                .legal-disclaimer {
                    text-align: center;
                    color: #b0c0c0;
                    font-size: 0.7rem;
                }

                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .text-white { color: #fff; }
                .fw-bold { font-weight: bold; }
                .mb-1 { margin-bottom: 0.25rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-3 { margin-bottom: 1rem; }
                .mb-4 { margin-bottom: 1.5rem; }
                .d-flex { display: flex; }
                .align-items-end { align-items: flex-end; }
                .align-items-center { align-items: center; }
                .justify-content-center { justify-content: center; }
                .justify-content-between { justify-content: space-between; }
                .text-light-muted { color: #b0c0c0; }

                .features-section {
                    display: flex;
                    justify-content: space-between;
                    gap: 30px;
                    margin-top: 120px;
                    width: 100%;
                }

                .feature-card {
                    flex: 1;
                    background: rgba(14, 28, 65, 0.4);
                    border: 1px solid rgba(162, 0, 255, 0.15);
                    border-radius: 16px;
                    padding: 30px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    opacity: 1;
                }

                .feature-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin-bottom: 12px;
                    margin-top: 0;
                }

                .feature-desc {
                    color: #b0c0c0;
                    font-size: 0.85rem;
                    line-height: 1.6;
                    font-weight: 300;
                    margin: 0;
                }

                .tokenomics-header {
                    margin-top: 100px;
                    margin-bottom: 20px;
                }

                .tokenomics-section {
                    display: flex;
                    justify-content: space-between;
                    gap: 30px;
                    width: 100%;
                    align-items: stretch;
                    scroll-margin-top: 35vh;
                }

                .tokenomics-card {
                    flex: 1;
                    background: rgba(14, 28, 65, 0.4);
                    border: 1px solid rgba(162, 0, 255, 0.15);
                    border-radius: 20px;
                    padding: 35px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    opacity: 1;
                }

                .donut-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 30px;
                }

                .donut-legend {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 60px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    font-size: 0.75rem;
                    color: #b0c0c0;
                    cursor: pointer;
                    transition: color 0.3s ease;
                }
                
                .legend-item:hover { color: #fff; }

                .legend-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    margin-right: 6px;
                }

                .donut-chart-wrapper {
                    position: relative;
                    width: 210px;
                    height: 210px;
                }

                .donut-chart {
                    width: 100%;
                    height: 100%;
                    transform: rotate(-180deg);
                    overflow: visible;
                }

                .donut-segment {
                    transition: stroke-width 0.3s ease, filter 0.3s ease;
                    cursor: pointer;
                }

                .donut-segment:hover {
                    stroke-width: 6;
                    filter: drop-shadow(0px 0px 6px rgba(255,255,255,0.4));
                }

                .donut-inner-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    pointer-events: none;
                }

                .donut-val {
                    font-size: 1.8rem;
                    font-weight: 300;
                    line-height: 1.1;
                    text-shadow: 0 0 10px rgba(0,0,0,0.5);
                    transition: color 0.3s ease;
                }

                .donut-label {
                    font-size: 0.65rem;
                    color: #b0c0c0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 5px;
                }

                .burn-box-wide {
                    background: rgba(14, 28, 65, 0.4);
                    border: 1px solid rgba(162, 0, 255, 0.15);
                    border-radius: 16px;
                    padding: 25px 40px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 0 20px rgba(162, 0, 255, 0.15);
                    margin: 160px auto 0 auto;
                    width: 70%;
                    text-align: center;
                    overflow: hidden;
                    opacity: 1;
                    scroll-margin-top: 35vh;
                }

                .burn-box-wide:hover {
                    box-shadow: 0 0 30px rgba(162, 0, 255, 0.3);
                    border-color: rgba(162, 0, 255, 0.4);
                }

                .burn-box-wide .burn-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 12px;
                }

                .burn-box-wide .burn-icon {
                    font-size: 1.2rem;
                    margin-right: 10px;
                }

                .burn-box-wide h4 {
                    margin: 0;
                    font-size: 1rem;
                }

                .burn-box-wide p {
                    color: #b0c0c0;
                    font-size: 0.85rem;
                    line-height: 1.6;
                    margin: 0;
                }

                .token-info-table {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 12px;
                    padding: 20px;
                    margin-top: 45px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .table-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                
                .table-row:last-child { border-bottom: none; padding-bottom: 0; }
                .table-row:first-child { padding-top: 0; }

                .table-key {
                    color: #b0c0c0;
                    font-size: 0.85rem;
                }

                .table-val {
                    font-size: 0.9rem;
                    font-weight: 400;
                    display: flex;
                    align-items: center;
                }

                .chain-val { color: #fff; font-weight: 400; }

                .table-icon {
                    width: 16px; height: 16px; margin-right: 6px;
                    background-size: cover; background-position: center; border-radius: 50%;
                }

                .blue-link {
                    color: #4da8da;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .blue-link:hover { color: #82cfff; text-decoration: underline; }

                .verify-link {
                    color: #9b51e0;
                    text-decoration: none;
                    font-weight: 600;
                    margin-left: 5px;
                    transition: color 0.2s;
                }

                .verify-link:hover { color: #ff4b82; text-decoration: underline; }

                .allocation-details-scroll {
                    overflow-y: auto;
                    padding-right: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                    flex-grow: 1;
                }

                .allocation-details-scroll::-webkit-scrollbar { width: 4px; }
                .allocation-details-scroll::-webkit-scrollbar-thumb { background: rgba(162, 0, 255, 0.5); border-radius: 4px; }

                .alloc-item h4 {
                    margin: 0 0 8px 0;
                    font-size: 1.05rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .alloc-item p {
                    margin: 0;
                    color: #b0c0c0;
                    font-size: 0.9rem;
                    line-height: 1.6;
                }
                    .mt-100 { margin-top: 100px; }

                    #roadmap-section { scroll-margin-top: 40vh; }
                    .roadmap-section {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                        width: 100%;
                        margin-top: 20px;
                        margin-bottom: 40px;
                    }

                    .roadmap-card {
                        background: rgba(14, 28, 65, 0.4);
                        border: 1px solid rgba(162, 0, 255, 0.15);
                        border-radius: 16px;
                        padding: 25px 30px;
                        backdrop-filter: blur(10px);
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                        width: 100%;
                        opacity: 1;
                    }

                    .important-notice-footer {
                        margin-top: 80px;
                        padding-bottom: 30px;
                        color: #888;
                        font-size: 0.72rem;
                        font-style: italic;
                        text-align: center;
                        max-width: 1100px;
                        margin-left: auto;
                        margin-right: auto;
                        line-height: 1.6;
                        opacity: 0.8;
                    }

                @media (max-width: 991px) {
                    .nav-top { justify-content: center; width: 100%; margin-bottom: 50px !important; }
                    .neon-btn-group {
                        display: grid !important;
                        grid-template-columns: repeat(6, 1fr) !important;
                        gap: 8px !important;
                        width: 100% !important;
                    }
                    .link-reset:nth-child(1) { grid-column: 1 / 3; grid-row: 1; }
                    .link-reset:nth-child(4) { grid-column: 3 / 5; grid-row: 1; }
                    .link-reset:nth-child(5) { grid-column: 5 / 7; grid-row: 1; }
                    .link-reset:nth-child(2) { grid-column: 2 / 4; grid-row: 2; }
                    .link-reset:nth-child(3) { grid-column: 4 / 6; grid-row: 2; }
                    
                    .link-reset { width: 100%; display: flex; }
                    .neon-btn {
                        width: 100%;
                        padding: 8.5px 0 !important;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .neon-btn span {
                        font-size: 11px !important;
                        letter-spacing: -0.4px !important;
                        white-space: nowrap !important;
                    }

                    .hero-section { flex-direction: column !important; justify-content: flex-start; gap: 30px; align-items: center; }
                    .hero-text-block { width: 95%; text-align: center; margin-top: 20px !important; }
                    .hero-title { font-size: 1.8rem !important; }
                    .hero-description { font-size: 0.94rem !important; }

                    .presale-fomo-panel { width: 100% !important; padding: 25px 12px !important; }
                    .presale-fomo-panel .d-flex.justify-content-between.mb-3 { margin-bottom: 20px !important; }
                    .price-line { font-size: 0.64rem !important; margin-bottom: 4px !important; line-height: 1.2 !important; }
                    .gold-metallic-text { font-size: 1.1rem !important; }
                    
                    .countdown-inline-row { padding: 12px !important; gap: 12px !important; flex-direction: column; align-items: center; }
                    .time-box { padding: 6px 4px !important; min-width: 42px !important; }
                    .time-value { font-size: 1.05rem !important; margin-bottom: 4px !important; }
                    .time-label { font-size: 0.44rem !important; }
                    .current-price-inline { margin-top: 8px !important; }

                    .progress-container-presale { margin-bottom: 25px !important; }
                    .progress-container-presale span { font-size: 0.6rem !important; }

                    .quick-select-container { 
                        justify-content: space-between !important; 
                        flex-wrap: nowrap !important; 
                        gap: 4px !important; 
                        width: 100% !important;
                    }
                    .quick-btn { 
                        flex: 1 1 0 !important; 
                        font-size: 0.56rem !important; 
                        padding: 6px 2px !important; 
                        white-space: nowrap !important;
                        text-align: center !important;
                    }

                    .connect-wallet-btn { padding: 9px !important; }

                    .features-section { flex-direction: column !important; width: 100% !important; gap: 20px !important; margin-top: 60px !important; }
                    .feature-card { width: 100% !important; padding: 25px !important; min-height: auto !important; }
                    .feature-title { font-size: 1.1rem !important; }
                    .feature-desc { font-size: 0.85rem !important; }

                    .tokenomics-section { flex-direction: column !important; gap: 30px !important; }
                    .tokenomics-card { padding: 25px 15px !important; width: 100% !important; }
                    
                    .donut-container { flex-direction: column !important; align-items: center !important; }
                    .donut-chart-wrapper { margin-bottom: 30px !important; }
                    .donut-legend { 
                        display: flex !important;
                        flex-direction: column !important; 
                        align-items: flex-start !important; 
                        gap: 12px !important; 
                        width: 100% !important;
                        padding-left: 15% !important;
                        margin-bottom: 50px !important;
                    }
                    .legend-item { font-size: 0.85rem !important; width: 100% !important; display: flex !important; align-items: center !important; }

                    .token-info-table { width: 100% !important; padding: 20px 15px !important; margin-top: 25px !important;}
                    .table-row { justify-content: space-between !important; padding: 14px 0 !important; }
                    .table-key { font-size: 0.85rem !important; text-align: left !important; }
                    .table-val { font-size: 0.85rem !important; text-align: right !important; justify-content: flex-end !important; }

                    .burn-box-wide { 
                        width: 100% !important; 
                        padding: 25px 20px !important; 
                        margin-top: 60px !important; 
                    }
                    .burn-header { 
                        display: flex !important; 
                        flex-direction: row !important; 
                        align-items: center !important; 
                        justify-content: center !important; 
                        gap: 8px !important; 
                        flex-wrap: nowrap !important;
                    }
                    .burn-icon { margin: 0 !important; font-size: 1.2rem !important; line-height: 1 !important; }
                    .burn-box-wide h4 { margin: 0 !important; font-size: 1rem !important; text-align: center !important; line-height: 1 !important; }
                    .burn-box-wide p { font-size: 0.85rem !important; text-align: center !important; margin-top: 15px !important; }

                    .mt-100 { margin-top: 60px !important; }
                }
            ` }} />           
        </main>
    );
}
