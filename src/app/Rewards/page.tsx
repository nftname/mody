'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { parseAbi } from 'viem';

const NNM_CONTRACT_ADDRESS = "0x264D75F04b135e58E2d5cC8A6B9c1371dAc3ad81";
const NNM_ABI = parseAbi([
    "function totalSupply() view returns (uint256)"
]);

const COLOR_NAVY_BG = '#050a16';

const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const targetDate = new Date('2026-04-22T12:00:00Z').getTime();

        const timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(timerInterval);
            } else {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({ days, hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(timerInterval);
    }, []);

    return (
        <div className="countdown-wrapper">
            <div className="time-box">
                <span className="time-value">{timeLeft.days}</span>
                <span className="time-label">DAYS</span>
            </div>
            <div className="time-box">
                <span className="time-value">{timeLeft.hours}</span>
                <span className="time-label">HOURS</span>
            </div>
            <div className="time-box">
                <span className="time-value">{timeLeft.minutes}</span>
                <span className="time-label">MINS</span>
            </div>
            <div className="time-box">
                <span className="time-value">{timeLeft.seconds}</span>
                <span className="time-label">SECS</span>
            </div>
        </div>
    );
};

export default function RewardsPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [namesMinted, setNamesMinted] = useState(2000);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data: totalSupplyData } = useReadContract({
        address: NNM_CONTRACT_ADDRESS,
        abi: NNM_ABI,
        functionName: 'totalSupply',
        query: { refetchInterval: 15000 }
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && totalSupplyData !== undefined) {
            const currentTotal = Number(totalSupplyData);
            setNamesMinted(currentTotal);
        }
    }, [isMounted, totalSupplyData]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 265; 
        if (direction === 'left') {
            scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!isMounted) return null;

    return (
        <main className="campaign-main">
            <title>NNM | Rewards</title>
            <div className="twinkling-stars"></div>

            <div className="container-fluid pt-3 position-relative z-index-content" style={{ padding: '0 4%', maxWidth: '1200px', margin: '0 auto' }}>
                
                <header className="row align-items-center mb-4 mt-0">
                    <div className="col-12 text-center text-lg-start">
                        <div className="neon-btn-container justify-content-center justify-content-lg-start">
                            <Link href="/Rewards" style={{ textDecoration: 'none', display: 'flex' }}>
                                <button className="neon-btn slide-btn-1">
                                    <span>Rewards</span>
                                </button>
                            </Link>
                            <Link href="/join#leaderboard-section" style={{ textDecoration: 'none', display: 'flex' }}>
                                <button className="neon-btn slide-btn-2">
                                    <span>Leaderboard</span>
                                </button>
                            </Link>
                            <Link href="/join" style={{ textDecoration: 'none', display: 'flex' }}>
                                <button className="neon-btn slide-btn-3">
                                    <span>Join Socials</span>
                                </button>
                            </Link>
                            <Link href="/presale/balance" style={{ textDecoration: 'none', display: 'flex' }}>
                                <button className="neon-btn slide-btn-4">
                                    <span>Balance</span>
                                </button>
                            </Link>
                            <Link href="/presale" style={{ textDecoration: 'none', display: 'flex' }}>
                                <button className="neon-btn slide-btn-5">
                                    <span>$ NNM Utility</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="campaign-content pb-5">
                    
                    <div className="hero-section" style={{ textAlign: 'center', marginBottom: '6rem', paddingTop: '1rem' }}>
                        <h1 className="fw-bold gradient-title-hero mb-2 reveal-hero-left" style={{ fontSize: '1.5rem', lineHeight: '1.4' }}>
                            Join Early & Start Earning from <span className="gold-metallic-text" style={{ fontSize: '1.8rem' }}>$300,000</span><br/>
                             Earn Token Rewards Today
                        </h1>
                        <div>
                            <div className="tracker-container">
                                <div className="tracker-left">
                                    <CountdownTimer />
                                    <div className="countdown-text">
                                       Time left to collect free tokens before launch
                                    </div>
                                </div>

                                <div className="tracker-center">
                                    <span className="phase-text">Early Access</span>
                                </div>

                                <div className="tracker-right">
                                    <div className="progress-header">
                                        <span className="progress-title">Users Joined</span>
                                        <span className="progress-count">{namesMinted} / 2000</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div className="progress-bar-fill" style={{ width: `${(namesMinted / 2000) * 100}%` }}></div>
                                    </div>
                                    <div className="vault-reward-container">
                                        <img src="/box.png" alt="Reward Vault" className="vault-box-img" width={30} height={30} loading="eager" fetchPriority="high" />
                                        <span className="gold-metallic-text vault-reward-amount">$1,000</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-light-muted fs-6 mx-auto" style={{ maxWidth: '900px', lineHeight: '1.8' }}>
                                Welcome to the largest Web3 network growth event. The NNM Protocol is distributing up to $300,000 in ecosystem rewards over the next 6 months. This isn&apos;t a lottery—your rewards are driven entirely by your activity, your community building, and your contribution to the network.
                            </p>
                            
                            <div className="glowing-line-container" style={{ width: '100%', marginTop: '2rem', position: 'relative' }}>
                                <svg viewBox="0 0 1000 50" preserveAspectRatio="none" style={{ width: '100%', height: '35px', overflow: 'visible' }}>
                                    <path d="M0,15 L335,15 C355,15 370,35 380,35 L620,35 C630,35 645,15 665,15 L1000,15"
                                          fill="none"
                                          stroke="url(#glowGradient)"
                                          strokeWidth="2"
                                          style={{ filter: 'drop-shadow(0px 6px 8px rgba(162, 0, 255, 0.5))' }} />
                                    <defs>
                                        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="transparent" />
                                            <stop offset="20%" stopColor="#8A2BE2" />
                                            <stop offset="50%" stopColor="#FF1493" />
                                            <stop offset="80%" stopColor="#8A2BE2" />
                                            <stop offset="100%" stopColor="transparent" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="text-center" style={{ marginBottom: '5rem', marginTop: '-5rem', position: 'relative', zIndex: 10 }}>
                            <Link href="/mint" style={{ textDecoration: 'none' }}>
                                <button className="btn-action-main">🎁 Get Free Tokens Now</button>
                            </Link>
                            <p className="fst-italic text-white mb-3" style={{ fontSize: '1rem', letterSpacing: '1.5px', fontWeight: '300', marginTop: '15px' }}>
                                Join early and start collecting rewards instantly.
                            </p>
                        </div>
                    </div>

                    <div className="vaults-section reveal-up" style={{ marginBottom: '6rem' }}>
                        <div className="d-flex align-items-center mb-4 ms-3">
                            <h3 className="fw-bold mb-0" style={{ fontSize: '1.36rem' }}>
                                🔥 <span className="animated-gradient-text">Reward Vaults</span>
                            </h3>
                        </div>
                        
                        <div className="position-relative">
                            
                            <button className="vault-nav-btn prev-btn" onClick={() => scroll('left')}>&#8249;</button>
                            <button className="vault-nav-btn next-btn" onClick={() => scroll('right')}>&#8250;</button>

                            <div 
                                className="vaults-scroll disabled-drag" 
                                ref={scrollRef}
                            >
                                
                                <div className="vault-card phase-1">
                                    <div className="phase-title">🟪 Phase 1</div>
                                    <div className="vault-target">Target: 2,000 Accounts</div>
                                    <div className="vault-amount-display">Vault: <span className="gold-metallic-text">$1,000</span></div>
                                    <div className="vault-alert">🔥 Almost Unlocked</div>
                                    <div className="vault-rewards-list mt-3">
                                        <div className="vault-reward-item">Top 3 → <span>$100</span></div>
                                        <div className="vault-reward-item">Top 4–10 → <span>$50</span></div>
                                        <div className="vault-reward-item">Top 11–50 → <span>$10</span></div>
                                    </div>
                                </div>

                                <div className="vault-card">
                                    <div className="phase-title">🟪 Phase 2</div>
                                    <div className="vault-target">Target: 4,000 Accounts</div>
                                    <div className="vault-amount-display">Vault: <span className="gold-metallic-text">$2,000</span></div>
                                    <div className="vault-rewards-list mt-4">
                                        <div className="vault-reward-item">Top 3 → <span>$200</span></div>
                                        <div className="vault-reward-item">Top 4–10 → <span>$100</span></div>
                                        <div className="vault-reward-item">Top 11–50 → <span>$20</span></div>
                                    </div>
                                </div>

                                <div className="vault-card">
                                    <div className="phase-title">🟪 Phase 3</div>
                                    <div className="vault-target">Target: 6,000 Accounts</div>
                                    <div className="vault-amount-display">Vault: <span className="gold-metallic-text">$5,000</span></div>
                                    <div className="vault-rewards-list mt-4">
                                        <div className="vault-reward-item">Top 3 → <span>$500</span></div>
                                        <div className="vault-reward-item">Top 4–10 → <span>$250</span></div>
                                        <div className="vault-reward-item">Top 11–50 → <span>$50</span></div>
                                    </div>
                                </div>

                                <div className="vault-card">
                                    <div className="phase-title">🟪 Phase 4</div>
                                    <div className="vault-target">Target: 10,000 Accounts</div>
                                    <div className="vault-amount-display">Vault: <span className="gold-metallic-text">$10,000</span></div>
                                    <div className="vault-rewards-list mt-4">
                                        <div className="vault-reward-item">Top 3 → <span>$1,000</span></div>
                                        <div className="vault-reward-item">Top 4–10 → <span>$500</span></div>
                                        <div className="vault-reward-item">Top 11–50 → <span>$100</span></div>
                                    </div>
                                </div>

                                <div className="vault-card">
                                    <div className="phase-title">🟪 Phase 5</div>
                                    <div className="vault-target">Target: 20,000 Accounts</div>
                                    <div className="vault-amount-display">Vault: <span className="gold-metallic-text">$20,000</span></div>
                                    <div className="vault-rewards-list mt-4">
                                        <div className="vault-reward-item">Top 3 → <span>$2,000</span></div>
                                        <div className="vault-reward-item">Top 4–10 → <span>$1,000</span></div>
                                        <div className="vault-reward-item">Top 11–50 → <span>$200</span></div>
                                    </div>
                                </div>

                                <div className="vault-card">
                                    <div className="phase-title">🟪 Phase 6</div>
                                    <div className="vault-target">Target: 40,000 Accounts</div>
                                    <div className="vault-amount-display">Vault: <span className="gold-metallic-text">$50,000</span></div>
                                    <div className="vault-rewards-list mt-4">
                                        <div className="vault-reward-item">Top 3 → <span>$5,000</span></div>
                                        <div className="vault-reward-item">Top 4–10 → <span>$2,500</span></div>
                                        <div className="vault-reward-item">Top 11–50 → <span>$500</span></div>
                                    </div>
                                </div>

                                <div className="vault-card phase-final">
                                    <div className="phase-title">🟪 Phase 7</div>
                                    <div className="vault-target">Target: 100,000 Accounts</div>
                                    <div className="vault-amount-display">Vault: <span className="gold-metallic-text">$100,000</span></div>
                                    <div className="vault-rewards-list mt-4">
                                        <div className="vault-reward-item">Top 3 → <span>$10,000</span></div>
                                        <div className="vault-reward-item">Top 4–10 → <span>$5,000</span></div>
                                        <div className="vault-reward-item">Top 11–50 → <span>$1,000</span></div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="text-center mt-4">
                            <span className="fst-italic text-light-muted d-block" style={{ fontSize: '1.05rem' }}>
                                Rewards depend on your activity and ranking within the platform.
                            </span>
                        </div>
                    </div>


                    <div className="info-panels-grid position-relative" style={{ marginBottom: '5rem' }}>
                        <div className="glass-panel-80 glow-unified-purple slide-in-left">
                            <h3 className="fw-bold gradient-title-hero mb-4 panel-main-title">$300,000 Reward Vaults</h3>
                            <div className="panel-text-content">
                                <p className="text-light-muted mb-2 fw-light">Up to $300,000 distributed to the top 50 active participants across 7 milestone phases.</p>
                                <p className="text-light-muted mb-2 fw-light">Every time a network milestone is reached, a new vault opens.</p>
                                <p className="text-light-muted fw-light">No random lotteries. The top 50 contributors on the leaderboard take the cash prizes directly to their wallets.</p>
                            </div>
                        </div>

                        <div className="glass-panel-80 glow-unified-purple slide-in-right">
                            <h3 className="fw-bold gradient-title-hero mb-4 panel-main-title">4 Ways to Earn</h3>
                            <div className="panel-text-content">
                                <ul className="list-unstyled ms-3">
                                    <li className="text-light-muted mb-2 fw-light">💰 <strong>Activate Account:</strong> Get up to 3,000 $WNNM instantly.</li>
                                    <li className="text-light-muted mb-2 fw-light">🤝 <strong>Invite Friends:</strong> Earn 30% INSTANT cash directly to your wallet.</li>
                                    <li className="text-light-muted mb-2 fw-light">📱 <strong>Daily Bounties:</strong> Complete social tasks to grow your balance.</li>
                                    <li className="text-light-muted mb-3 fw-light">🏆 <strong>Vault Drops:</strong>  Rank in the Top 50 to win Phase Cash Prizes.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="glass-panel-80 glow-unified-purple reveal-up" style={{ gridColumn: '1 / -1', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                            <h3 className="fw-bold gradient-title-hero mb-4 panel-main-title">May 22nd: Official Token Activation</h3>
                            <div className="panel-text-content">
                    <p className="text-light-muted mb-2 fw-light">The Genesis Phase begins April 22nd, and the $WNNM token utility is expected to activate on May 22nd.</p>
                    <p className="text-light-muted mb-0 fw-light">All $WNNM points collected during this phase will influence early ecosystem allocation. Accumulate as much as possible before the phase ends.</p>
                            </div>
                        </div>
                    </div>

                    <div className="stages-wrapper reveal-cards-container" style={{ marginBottom: '6rem' }}>
                    <div className="stages-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '900px', margin: '0 auto 6rem auto' }}>
                        
                        <div className="glass-panel-80 glow-unified-purple reveal-left">
                            <h4 className="fw-bold gradient-title-hero mb-3" style={{ fontSize: '1.4rem' }}>1- Activate Your Account</h4>
                            <div className="panel-text-content">
                                <p className="text-light-muted mb-3 fw-light">Choose your entry tier to activate your dashboard and become eligible to receive your first token allocation:</p>
                                <ul className="list-unstyled ms-4">
                                    <li className="text-light-muted mb-2">💎 <strong className="text-white">Founder ($3):</strong> 1,000 $WNNM</li>
                                    <li className="text-light-muted mb-2">🔥 <strong className="text-white">Elite ($5):</strong> 2,000 $WNNM</li>
                                    <li className="text-light-muted">👑 <strong className="text-white">Immortal ($10):</strong> 3,000 $WNNM</li>
                                </ul>
                            </div>
                        </div>

                        <div className="glass-panel-80 glow-unified-purple reveal-right">
                            <h4 className="fw-bold gradient-title-hero mb-3" style={{ fontSize: '1.4rem' }}>2- Earn 30% Instant Cash</h4>
                            <div className="panel-text-content">
                                <p className="text-light-muted mb-2 fw-light">Once activated, you unlock your unique referral link.</p>
                                <p className="text-light-muted fw-light">Share your link with your network and earn up to 30% referral rewards Rewards are distributed to your wallet according to platform terms.</p>
                            </div>
                        </div>

                        <div className="glass-panel-80 glow-unified-purple reveal-left">
                            <h4 className="fw-bold gradient-title-hero mb-3" style={{ fontSize: '1.4rem' }}>3- Complete Daily Bounties</h4>
                            <div className="panel-text-content">
                                <p className="text-light-muted mb-3 fw-light">Maximize your token balance before launch by participating in daily tasks:</p>
                                <ul className="list-unstyled ms-4">
                                    <li className="text-light-muted mb-2">• Engage with social media posts</li>
                                    <li className="text-light-muted mb-2">• Participate in community events</li>
                                    <li className="text-light-muted mb-3">• Help the network expand</li>
                                </ul>
                                <p className="text-light-muted fw-light">More points = A bigger advantage on launch day.</p>
                            </div>
                        </div>

                        <div className="glass-panel-80 glow-unified-purple reveal-right">
                            <h4 className="fw-bold gradient-title-hero mb-3" style={{ fontSize: '1.4rem' }}>4- Top 50 Vault Rewards</h4>
                            <div className="panel-text-content">
                                <p className="text-light-muted mb-2 fw-light">As more accounts are activated, the 7 Reward Vaults unlock sequentially.</p>
                                <p className="text-light-muted fw-light">The Top 50 most active users in each phase may receive rewards, scaling up to $100,000 in the final vault.</p>
                            </div>
                        </div>

                    </div>
                    </div>

                    <div className="text-center reveal-up" style={{ marginBottom: '5rem' }}>
                        <p className="fst-italic text-white mb-3" style={{ fontSize: '1rem', letterSpacing: '0.5px', fontWeight: '300' }}>
                            Join early. Secure your position. Start earning through participation.
                        </p>
                        <Link href="/mint" style={{ textDecoration: 'none' }}>
                            <button className="btn-action-main">🎁 Get Free Tokens Now</button>
                        </Link>
                    </div>

                    <div className="legal-disclaimer-wrapper text-center reveal-up" style={{ marginTop: '2rem' }}>
                        <p className="text-white mx-auto" style={{ fontSize: '12.5px', maxWidth: '800px', opacity: 1, lineHeight: '1.6', fontWeight: '500' }}>
                         Rewards are distributed based on platform activity and participation. Participation does not guarantee earnings. All rewards depend on user engagement and campaign performance.  <Link href="/legal" target="_blank" rel="noopener noreferrer" className="text-white" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>Terms of Service</Link> for full details.
                        </p>
                    </div>

                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .campaign-main {
                    background-color: ${COLOR_NAVY_BG};
                    min-height: 100vh;
                    padding-bottom: 40px;
                    overflow-x: hidden;
                    font-family: 'Inter', sans-serif;
                    position: relative;
                }

                .twinkling-stars {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    z-index: 0;
                    pointer-events: none;
                    background: transparent;
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
                    animation: starsRotate 120s linear infinite, starsFlash 6s infinite alternate;
                }
                @keyframes starsRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes starsFlash { from { opacity: 0.3; } to { opacity: 0.8; filter: brightness(1.5); } }

                .z-index-content { z-index: 10; position: relative; }

                .info-panels-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 60px;
                    width: 96%;
                    margin: 0 auto;
                }

                .glass-panel-80 {
                    background: rgba(14, 28, 65, 0.25);
                    border: 1px solid rgba(162, 0, 255, 0.15);
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    padding: 40px 20px;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    transition: transform 0.4s ease;
                    box-sizing: border-box;
                }

                .panel-main-title {
                    font-size: 1.6rem;
                }

                .panel-text-content p, .panel-text-content li {
                    color: #EAECEF !important;
                    font-size: 1rem;
                    line-height: 1.65;
                    letter-spacing: 0.3px;
                    font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                .gradient-title-hero {
                    background: linear-gradient(90deg, #9b51e0 15%, #ff4b82 50%, #9b51e0 85%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: inline-block;
                }

                .gradient-title {
                    background: linear-gradient(90deg, #B57EDC 0%, #FFB6C1 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: inline-block;
                }

                .glow-unified-purple { 
                    box-shadow: 0 0 15px rgba(162, 0, 255, 0.2), 0 0 40px rgba(162, 0, 255, 0.1); 
                    border-color: rgba(162, 0, 255, 0.3); 
                }

                .gold-metallic-text {
                    background: linear-gradient(135deg, #f7df85 0%, #e19d08 40%, #fbe9aa 50%, #f3c24d 60%, #e19d08 70%, #f7df85 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: inline-block;
                    font-weight: 900;
                }

                .text-light-muted { color: #b0c0c0; }

                .neon-btn-container { display: flex; gap: 12px; flex-wrap: wrap; }
                .neon-btn {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 75, 130, 0.25);
                    padding: 8px 18px;
                    border-radius: 30px;
                    backdrop-filter: blur(10px);
                    cursor: pointer;
                    opacity: 1;
                    transition: all 0.3s ease;
                    font-size: 0.85rem;
                }

                .neon-btn span {
                    background: linear-gradient(90deg, #9b51e0 0%, #ff4b82 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: bold;
                }

                .neon-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 20px rgba(255, 75, 130, 0.4);
                }

                .btn-action-main {
                    background: linear-gradient(90deg, #a200ff 0%, #ff0055 100%);
                    color: white;
                    border: none;
                    padding: 13px 38px;
                    border-radius: 35px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    box-shadow: 0 0 20px rgba(255, 0, 85, 0.3);
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }
                .btn-action-main:hover { transform: scale(1.05); }

                .tracker-container {
                    display: flex;
                    width: 100%;
                    margin-top: 18px;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin: 3.2rem 0 2.8rem 0;
                    gap: 30px;
                }
                
                .tracker-left, .tracker-center, .tracker-right { display: flex; flex-direction: column; }
                .tracker-left { width: 40%; align-items: flex-center; }
                .tracker-center { width: 20%; align-items: center; justify-content: center; transform: translateY(15px); }
                .tracker-right { width: 40%; justify-content: flex-start; }
                
                .countdown-wrapper { display: flex; gap: 12px; margin-bottom: 15px; }
                .countdown-text { font-size: 0.8rem; color: #b0c0c0; }
                
                .time-box {
                    background: rgba(14, 28, 65, 0.4);
                    border: 1px solid rgba(155, 81, 224, 0.3);
                    border-radius: 12px;
                    padding: 12px 10px;
                    min-width: 75px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 0 10px rgba(162, 0, 255, 0.1), 0 0 15px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(5px);
                }
                
                .time-value {
                    color: #fff; font-size: 1.6rem; font-weight: 700; line-height: 1; margin-bottom: 6px;
                    text-shadow: 0 0 10px rgba(255, 75, 130, 0.5);
                }
                .time-label { color: #b0c0c0; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; line-height: 1; }
                
                .phase-text {
                    background: linear-gradient(90deg, #9b51e0 0%, #ff4b82 100%);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    font-size: 1.0rem; font-weight: 600; text-transform: uppercase; letter-spacing: 4px;
                    text-shadow: 0 0 15px rgba(255, 75, 130, 0.15); white-space: nowrap;
                }
            
                .progress-header { display: flex; justify-content: space-between; width: 100%; margin-bottom: 12px; color: #fff; font-weight: 600; font-size: 1.1rem; }
                .progress-title { color: #b0c0c0; }
                .progress-bar-bg {
                    width: 100%; height: 14px; background: rgba(14, 28, 65, 0.6); border-radius: 12px;
                    border: 1px solid rgba(155, 81, 224, 0.4); overflow: hidden;
                    box-shadow: inset 0 0 10px rgba(0,0,0,0.8), 0 0 10px rgba(162, 0, 255, 0.1);
                }
                .progress-bar-fill {
                    height: 100%; background: linear-gradient(90deg, #9b51e0 0%, #ff4b82 100%); border-radius: 12px;
                    transition: width 1s ease-in-out; box-shadow: 0 0 15px rgba(255, 75, 130, 0.6);
                }
                
                .vault-reward-container { display: flex; align-items: center; justify-content: flex-start; margin-top: 25px; }
                .vault-box-img { width: 30px; height: 30px; margin-right: 15px; filter: drop-shadow(0 0 15px rgba(255, 75, 130, 0.2)); object-fit: contain; }
                .vault-reward-amount { font-size: 1.25rem !important; line-height: 1; margin: 0; padding: 0; }

                .stages-scroll {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 30px;
                    width: 100%;
                }
                .stage-card {
                    background: linear-gradient(180deg, rgba(20, 30, 60, 0.6) 0%, rgba(10, 15, 30, 0.8) 100%);
                    border: 1px solid rgba(255, 75, 130, 0.25);
                    border-radius: 16px; padding: 22px 18px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3), 0 0 15px rgba(255, 75, 130, 0.1);
                    display: flex; flex-direction: column;
                }
                .stage-title { 
                    font-weight: 700; margin-bottom: 12px; font-size: 1.05rem; 
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    letter-spacing: -0.3px;
                }
                .stage-text { 
                    color: #EAECEF; 
                    font-weight: 300; 
                    font-size: 0.85rem; 
                    line-height: 1.65; 
                    margin-bottom: 12px; 
                    letter-spacing: 0.3px;
                    font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                .stage-list { 
                    color: #EAECEF; 
                    font-weight: 300; 
                    font-size: 0.45rem; 
                    line-height: 1.65; 
                    padding-left: 12px; 
                    margin-bottom: 12px; 
                    letter-spacing: 0.3px;
                    font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }

                .vaults-section { width: 95%; margin: 0 auto; }
                .drag-hint { color: #b57edc; font-size: 0.85rem; font-style: italic; opacity: 0.8; animation: pulseHint 2s infinite; }
                @keyframes pulseHint { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                
                .vaults-scroll {
                    display: flex; gap: 15px; overflow-x: auto; padding: 10px 0 30px 0;
                    scroll-snap-type: x mandatory; -ms-overflow-style: none; scrollbar-width: none;
                    scroll-behavior: smooth;
                }
                .vaults-scroll.disabled-drag {
                    cursor: default;
                }
                .vaults-scroll::-webkit-scrollbar { display: none; }

                .vault-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(14, 28, 65, 0.8);
                    border: 1px solid rgba(162, 0, 255, 0.5);
                    color: white;
                    font-size: 2rem;
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    box-shadow: 0 0 15px rgba(162, 0, 255, 0.3);
                    transition: all 0.3s ease;
                }
                .vault-nav-btn:hover {
                    background: rgba(162, 0, 255, 0.3);
                    box-shadow: 0 0 20px rgba(162, 0, 255, 0.6);
                }
                .prev-btn { left: -15px; }
                .next-btn { right: -15px; }

                .animated-gradient-text {
                    background: linear-gradient(90deg, #ff4b82, #9b51e0, #ff4b82);
                    background-size: 200% auto;
                    color: transparent;
                    -webkit-background-clip: text;
                    background-clip: text;
                    animation: shineEffect 4s linear infinite;
                    display: inline-block;
                }
    
                .stage-card p {
                    text-align: left;
                    margin: 0;
                    margin-bottom: 10px;
                }

                @keyframes shineEffect {
                    to { background-position: 200% center; }
                }
                
                .vault-card {
                    flex: 0 0 calc(75vw - 20px); max-width: 250px; min-height: 260px;
                    background: linear-gradient(180deg, rgba(20, 30, 60, 0.6) 0%, rgba(10, 15, 30, 0.8) 100%);
                    border: 1px solid rgba(155, 81, 224, 0.3); border-radius: 16px;
                    padding: 25px 20px; scroll-snap-align: start; position: relative;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3); display: flex; flex-direction: column;
                    user-select: none;
                }
                .vault-card.phase-1 { border-color: #ff4b82; box-shadow: 0 0 20px rgba(255, 75, 130, 0.15); }
                .vault-card.phase-final { border-color: #f3c24d; box-shadow: 0 0 20px rgba(243, 194, 77, 0.15); }
                
                .phase-title { font-weight: 700; color: #fff; font-size: 1.05rem; margin-bottom: 8px; }
                .vault-target { color: #b0c0c0; font-size: 0.8rem; margin-bottom: 15px; }
                .vault-amount-display { color: #fff; font-size: 0.95rem; font-weight: 600; margin-bottom: 10px; }
                .vault-alert { background: rgba(255, 75, 130, 0.15); color: #ff4b82; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; display: inline-block; margin-bottom: 10px; }
                .vault-rewards-list { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; flex-grow: 1; }
                .vault-reward-item { display: flex; justify-content: space-between; color: #b0c0c0; font-size: 0.85rem; margin-bottom: 8px; }
                .vault-reward-item span { color: #fff; font-weight: 600; }

                @media (max-width: 991px) {
                    .neon-btn-container { gap: 8px !important; display: flex; flex-wrap: wrap; justify-content: center; width: 100%; margin-bottom: 10px; }
                    .neon-btn-container a { flex: 0 0 auto; display: flex !important; }
                    .neon-btn { padding: 6px 4px !important; font-size: 0.65rem !important; width: 100%; justify-content: center; }
                    
                    .neon-btn-container a:nth-child(5) { order: 1; width: 31%; }
                    .neon-btn-container a:nth-child(3) { order: 2; width: 31%; }
                    .neon-btn-container a:nth-child(1) { order: 3; width: 31%; }
                    .neon-btn-container a:nth-child(4) { order: 4; width: 47%; margin-top: 5px; }
                    .neon-btn-container a:nth-child(2) { order: 5; width: 47%; margin-top: 5px; }

                    .hero-section { margin-bottom: 2rem !important; padding-top: 0 !important; }
                    .hero-section h1 { font-size: 1.9rem !important; margin-top: 0 !important; }
                    .hero-section p.text-light-muted { font-size: 0.8rem !important; line-height: 1.5 !important; margin-top: 10px !important; padding: 0 10px; }

                    .btn-action-main { padding: 10px 28px; font-size: 0.75rem; }
                    .vault-nav-btn { display: none !important; }
                    .info-panels-grid { grid-template-columns: 1fr; width: 95%; }
                    .glass-panel-80 { width: 100% !important; grid-column: 1 / -1 !important; padding: 30px 20px; }
                    
                    .tracker-container { flex-direction: column; gap: 30px; margin: 1.5rem 0; align-items: center; }
                    .tracker-left, .tracker-center, .tracker-right { width: 100%; align-items: center; }
                    .vault-reward-container { justify-content: center; margin-top: 20px; }
                    .tracker-center { order: -1; }
                    .countdown-text { text-align: center; white-space: normal; }
                    
                    .stages-scroll { display: flex; overflow-x: auto; padding-left: 5%; padding-right: 5%; scroll-snap-type: x mandatory; }
                    .stage-card { flex: 0 0 calc(85vw - 40px); max-width: 320px; scroll-snap-align: center; }
                    
                    .vaults-section { width: 100%; }
                    .vaults-scroll { padding-left: 5%; padding-right: 5%; }
                    .drag-hint { display: none; }
                }
            ` }} />
        </main>
    );
}
