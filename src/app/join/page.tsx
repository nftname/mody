'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

interface Task {
    id: string;
    platform: string;
    label: string;
    points: number;
    type: 'once' | 'daily';
    color: string;
    icon: string;
    actionUrl: string;
    instruction: string;
    subText: string;
    tooltip: string;
}

interface LeaderboardUser {
    rank: number;
    wallet: string;
    points: number;
    lastActiveDate: string;
    formattedDate: string;
    formattedTime: string;
}

const COLOR_NAVY_BG = '#050a16';
const COLOR_PANEL = '#121824';
const COLOR_BORDER = '#2B3139';
const COLOR_TEXT_MAIN = '#EAECEF';
const COLOR_TEXT_MUTED = '#848E9C';
const COLOR_TEXT_OFF_WHITE = '#F8FAF6';
const COLOR_GOLD = '#FCD535';

const formatWalletMobile = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const TASKS: Task[] = [
    { id: 'tw_rt', platform: 'X', label: 'Repost @nnmmarket on X', points: 30, type: 'daily', color: '#000000', icon: 'fa-brands fa-x-twitter', actionUrl: 'https://x.com/nnmmarket', instruction: 'Repost our pinned post, then paste the link to your repost below.', subText: 'daily', tooltip: 'You can complete this action once a day to earn points.' },
    { id: 'tw_like', platform: 'X', label: 'Like & Reply on X', points: 30, type: 'daily', color: '#000000', icon: 'fa-brands fa-x-twitter', actionUrl: 'https://x.com/nnmmarket', instruction: 'Like the pinned post and confirm your username below.', subText: 'daily', tooltip: 'You can complete this action once a day to earn points.' },
    { id: 'tg_like', platform: 'Telegram', label: 'Like & Reply on Telegram', points: 30, type: 'daily', color: '#229ED9', icon: 'fa-brands fa-telegram', actionUrl: 'https://t.me/NFTNNM', instruction: 'Interact with our latest post and enter your Telegram username below.', subText: 'daily', tooltip: 'You can complete this action once a day to earn points.' },
    { id: 'fb_like', platform: 'Facebook', label: 'Like & Reply on Facebook', points: 30, type: 'daily', color: '#1877F2', icon: 'fa-brands fa-facebook', actionUrl: 'https://www.facebook.com/profile.php?id=61586895007931', instruction: 'Interact with our latest post and enter your profile name below.', subText: 'daily', tooltip: 'You can complete this action once a day to earn points.' },
    { id: 'ig_like', platform: 'Instagram', label: 'Like & Reply on Instagram', points: 30, type: 'daily', color: '#E4405F', icon: 'fa-brands fa-instagram', actionUrl: 'https://www.instagram.com/NNM_Assets', instruction: 'Interact with our latest post and enter your IG handle below.', subText: 'daily', tooltip: 'You can complete this action once a day to earn points.' },
    { id: 'md_like', platform: 'Medium', label: 'Like & Reply on Medium', points: 30, type: 'daily', color: '#000000', icon: 'fa-brands fa-medium', actionUrl: 'https://medium.com/@nftnnmmarket', instruction: 'Interact with our latest article and enter your profile link below.', subText: 'daily', tooltip: 'You can complete this action once a day to earn points.' },
    { id: 'tw_follow', platform: 'X', label: 'Follow @nnmmarket on X', points: 100, type: 'once', color: '#000000', icon: 'fa-brands fa-x-twitter', actionUrl: 'https://x.com/nnmmarket', instruction: 'Click the link to follow us, then enter your X handle below.', subText: 'once', tooltip: 'This reward is one-time only and cannot be repeated. It is a core requirement to boost your rank.' },
    { id: 'tg_join', platform: 'Telegram', label: 'Join NFTNNM on Telegram', points: 100, type: 'once', color: '#229ED9', icon: 'fa-brands fa-telegram', actionUrl: 'https://t.me/NFTNNM', instruction: 'Join our channel and enter your Telegram username (@username) below.', subText: 'once', tooltip: 'This reward is one-time only and cannot be repeated. It is a core requirement to boost your rank.' },
    { id: 'fb_follow', platform: 'Facebook', label: 'Follow us on Facebook', points: 100, type: 'once', color: '#1877F2', icon: 'fa-brands fa-facebook', actionUrl: 'https://www.facebook.com/profile.php?id=61586895007931', instruction: 'Follow our page and enter your profile name below.', subText: 'once', tooltip: 'This reward is one-time only and cannot be repeated. It is a core requirement to boost your rank.' },
    { id: 'ig_follow', platform: 'Instagram', label: 'Follow us on Instagram', points: 100, type: 'once', color: '#E4405F', icon: 'fa-brands fa-instagram', actionUrl: 'https://www.instagram.com/NNM_Assets', instruction: 'Follow our official account and enter your IG handle below.', subText: 'once', tooltip: 'This reward is one-time only and cannot be repeated. It is a core requirement to boost your rank.' },
    { id: 'md_follow', platform: 'Medium', label: 'Follow us on Medium ', points: 100, type: 'once', color: '#000000', icon: 'fa-brands fa-medium', actionUrl: 'https://medium.com/@nftnnmmarket', instruction: 'Follow us on Medium and enter your profile link below.', subText: 'once', tooltip: 'This reward is one-time only and cannot be repeated. It is a core requirement to boost your rank.' }
];

export default function JoinCampaignPage() {
    const { address } = useAccount();
    const [socialPoints, setSocialPoints] = useState<number>(0);
    const [convictionPoints, setConvictionPoints] = useState<number>(0);
    const [giftPoints, setGiftPoints] = useState<number>(0);
    const [completedTasks, setCompletedTasks] = useState<string[]>([]);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [taskInputValue, setTaskInputValue] = useState<string>('');
    const [isSubmittingTask, setIsSubmittingTask] = useState<boolean>(false);
    const [isTaskStepTwo, setIsTaskStepTwo] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [itemsPerPage, setItemsPerPage] = useState<number>(30);
    const [isMounted, setIsMounted] = useState(false);
    const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true);

    const socialsRef = useRef<HTMLElement>(null);
    const leaderboardRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setIsMounted(true);
        
        if (typeof window !== 'undefined' && window.location.hash) {
            setTimeout(() => {
                const id = window.location.hash.replace('#', '');
                const element = document.getElementById(id);
                if (element) {
                    const offset = 100;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = element.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }, 500);
        }

        const fetchUnifiedData = async () => {
            setIsLoadingTasks(true);
            try {
                const lbRes = await fetch('/api/campaign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getLeaderboard', address: address || 'all' })
                });
                const lbData = await lbRes.json();
                
                if (lbData.data) {
                    const formattedLeaderboard = lbData.data.map((user: any, index: number) => {
                        const dateObj = user.last_active_date ? new Date(user.last_active_date) : new Date();
                        const formattedDate = dateObj.toISOString().split('T')[0];
                        const formattedTime = dateObj.toTimeString().split(' ')[0].substring(0, 5);

                        return {
                            rank: index + 1,
                            wallet: user.wallet_address,
                            points: user.total_points || 0,
                            lastActiveDate: user.last_active_date,
                            formattedDate: formattedDate,
                            formattedTime: formattedTime
                        };
                    });
                    setLeaderboardData(formattedLeaderboard);
                }

                if (address) {
                    const res = await fetch('/api/campaign', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'getConviction', address })
                    });
                    
                    const data = await res.json();
                    
                    if (!data.error) {
                        setSocialPoints(data.social_points || 0);
                        setConvictionPoints(data.wallet?.claimable_nnm ? Number(data.wallet.claimable_nnm) : 0);
                        setGiftPoints(data.ecosystem_points || 0);
                        
                        if (data.completed_tasks) {
                            setCompletedTasks(data.completed_tasks);
                        }
                    }
                } else {
                    setSocialPoints(0);
                    setConvictionPoints(0);
                    setGiftPoints(0);
                    setCompletedTasks([]);
                }
            } catch (error) { 
                console.error(error); 
            } finally {
                setIsLoadingTasks(false);
            }
        };
        fetchUnifiedData();
    }, [address]);
    useEffect(() => {
        if (!isLoadingTasks && typeof window !== 'undefined' && window.location.hash) {
            setTimeout(() => {
                const id = window.location.hash.replace('#', '');
                const element = document.getElementById(id);
                if (element) {
                    const offset = 100;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = element.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }, 100);
        }
    }, [isLoadingTasks]);

    const totalPoints = socialPoints + convictionPoints + giftPoints;
    const handleDynamicPost = (e: React.MouseEvent, platform: string, taskId: string, defaultUrl: string) => {
        e.preventDefault();
        
        if (platform !== 'X' || taskId.includes('follow') || taskId.includes('join')) {
            window.open(defaultUrl, '_blank');
            return;
        }

        const spintax = [
            {
                p1: ["Just claimed my digital identity", "Finally set up my Web3 presence", "Secured my permanent digital name"],
                p2: ["on the NNM registry. No more long addresses, just pure trust.", "with NNM Protocol. One unified profile for the decentralized web.", "through NNM. Absolute privacy and zero renewal fees."],
                p3: ["The future is human.", "Web3 is getting real.", "Check it out!"],
                tags: "#DigitalIdentity #Web3Identity #DID #NNM"
            },
            {
                p1: ["Excited to join the NNM expansion campaign!", "Participating in the NNM continuous reward program.", "Building the future of Web3 with the NNM community."],
                p2: ["Completing daily missions to unlock massive ecosystem milestones.", "Earning conviction points while expanding the decentralized identity network.", "Helping unlock the ecosystem reward vaults by claiming my Web3 name."],
                p3: ["Join the movement.", "Let's grow together.", "Be an early founder."],
                tags: "#CryptoRewards #Web3Community #Ecosystem #Polygon"
            },
            {
                p1: ["Crypto payments just got incredibly simple.", "Say goodbye to copying and pasting long wallet addresses.", "Managing crypto across multiple chains is finally easy."],
                p2: ["ChainFace acts as a unified hub for all my wallets, peer-to-peer with no middlemen.", "My ChainFace profile routes payments directly to me with 100% privacy.", "Using my ChainFace link to receive crypto safely and instantly."],
                p3: ["Welcome to real decentralization.", "Try it yourself.", "Web3 made easy."],
                tags: "#ChainFace #Crypto #DeFi #Privacy"
            },
            {
                p1: ["Digital ownership is evolving.", "Your name is your ultimate asset.", "Web3 identity is more than just a wallet."],
                p2: ["NNM lets you truly own your digital asset permanently.", "Minting my lifetime digital name on Polygon was incredibly smooth.", "I just secured my permanent blockchain identity."],
                p3: ["Don't miss the next era of crypto.", "Secure your spot now.", "Build your presence."],
                tags: "#NFT #Web3Domain #DigitalAssets #PolygonNFT"
            },
            {
                p1: ["Trust in Web3 is finally measurable.", "Reputation matters more than hype in crypto.", "Building real trust on the blockchain."],
                p2: ["The Conviction Rank highlights true community belief, not just volume.", "My profile now has verified trust signals and Conviction points.", "Shifting the focus from speculation to verified digital presence."],
                p3: ["This is game-changing.", "See your true rank.", "Transparency wins."],
                tags: "#ConvictionRank #CryptoTwitter #Blockchain #Web3"
            }
        ];

        const t = spintax[Math.floor(Math.random() * spintax.length)];
        const text1 = t.p1[Math.floor(Math.random() * t.p1.length)];
        const text2 = t.p2[Math.floor(Math.random() * t.p2.length)];
        const text3 = t.p3[Math.floor(Math.random() * t.p3.length)];
        const refCode = Date.now().toString().slice(-5);

        const finalTweet = `${text1} ${text2} ${text3}\nhttps://www.nftnnm.com ${t.tags} ID:${refCode}`;
        const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(finalTweet)}`;
        
        window.open(intentUrl, '_blank');
    };

    const launchPrice = 0.005;
    const totalValueUSD = totalPoints * launchPrice;

    const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
        const offset = 100;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = ref.current?.getBoundingClientRect().top || 0;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };


    const toggleTaskAccordion = (taskId: string) => {
        if (completedTasks.includes(taskId)) return;
        setExpandedTaskId(prev => prev === taskId ? null : taskId);
        setTaskInputValue('');
        setIsTaskStepTwo(false);
    };

    const handleTaskSubmit = async (taskId: string, points: number, type: string) => {
        if (!taskInputValue.trim() || !address) return;
        setIsSubmittingTask(true);
        try {
            const res = await fetch('/api/campaign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'submitTask', 
                    address, 
                    taskId, 
                    proof: taskInputValue,
                    points,
                    type
                })
            });
            const data = await res.json();
            
            if (!res.ok || data.error_message) {
                alert(`API Error: ${data.error_message} \n\nCheck browser console for details.`);
                console.error("Backend Error Details:", data.error_details);
                return;
            }

            if (data.success) {
                setCompletedTasks(prev => [...prev, taskId]);
                setExpandedTaskId(null);
                setTaskInputValue('');
                
                const pointsRes = await fetch('/api/campaign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getConviction', address })
                });
                const pointsData = await pointsRes.json();
                if (!pointsData.error) {
                    setSocialPoints(pointsData.social_points || 0);
                }
                
                const lbRes = await fetch('/api/campaign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getLeaderboard', address })
                });
                const lbData = await lbRes.json();
                if (lbData.data) {
                    const formattedLeaderboard = lbData.data.map((user: any, index: number) => {
                        const dateObj = user.last_active_date ? new Date(user.last_active_date) : new Date();
                        const formattedDate = dateObj.toISOString().split('T')[0];
                        const formattedTime = dateObj.toTimeString().split(' ')[0].substring(0, 5);

                        return {
                            rank: index + 1,
                            wallet: user.wallet_address,
                            points: user.total_points || 0,
                            lastActiveDate: user.last_active_date,
                            formattedDate: formattedDate,
                            formattedTime: formattedTime
                        };
                    });
                    setLeaderboardData(formattedLeaderboard);
                }
            }
        } catch (error) {
            console.error("Network or Fetch Error:", error);
            alert("Network Error: Could not connect to API.");
        } finally {
            setIsSubmittingTask(false);
        }
    };

    const filteredLeaderboard = leaderboardData.filter(user => 
        user.wallet.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderRankBadge = (rank: number) => {
        return <span className="rank-text">{rank}</span>;
    };

    if (!isMounted) return null;

    return (
        <main className="campaign-main">
            <div className="twinkling-stars"></div>

            <div className="container-fluid pt-2 position-relative z-index-1" style={{ padding: '0 4%', maxWidth: '1600px', margin: '0 auto' }}>
                
                <div className="neon-btn-container justify-content-center w-100" style={{ margin: '0 auto 2rem auto', paddingTop: '1rem' }}>
                    <Link href="/Rewards" style={{ textDecoration: 'none', display: 'flex' }}>
                        <button className="neon-btn">
                            <span>Rewards</span>
                        </button>
                    </Link>
                    <button onClick={() => scrollToSection(leaderboardRef)} className="neon-btn">
                        <span>Leaderboard</span>
                    </button>
                    <button onClick={() => scrollToSection(socialsRef)} className="neon-btn">
                        <span>Join Socials</span>
                    </button>
                </div>

                <div className="text-center mx-auto giveaway-header" style={{ maxWidth: '900px', marginBottom: '2rem', marginTop: '1rem' }}>
                    <h1 className="fw-bold header-title gradient-text" style={{ fontSize: '2.5rem' }}>
                        NNM Continuous Reward Program
                    </h1>
                    <p className="mt-3 fs-15 header-description" style={{ lineHeight: '1.8' }}>
                         Engage, expand, and earn. Participate in our evolving daily missions to secure your position among the Leaderboard. Whether unlocking current reward vaults or generating direct value at our Token Launch, your daily collected points are the key to maximizing your long-term benefits.
                    </p>
                </div>

                <div className="glowing-line-container" style={{ width: '100%', marginBottom: '3rem', position: 'relative' }}>
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


                <div className="table-responsive mx-auto stats-table-wrapper luxury-panel" style={{ marginBottom: '6rem' }}>
                    <table className="table table-borderless mb-0 align-middle text-center stats-table">
                        <thead>
                            <tr className="stats-table-header">
                                <th>Social Points</th>
                                <th>Conviction</th>
                                <th>Ecosystem</th>
                                <th>Total Points</th>
                                <th className="action-col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="points-val">{socialPoints.toLocaleString('en-US')}</td>
                                <td className="points-val">{convictionPoints.toLocaleString('en-US')}</td>
                                <td className="points-val">{giftPoints.toLocaleString('en-US')}</td>
                                <td className="points-val total-val">
                                    {totalPoints.toLocaleString('en-US')}
                                    <span className="usd-value">(≈ ${totalValueUSD.toFixed(2)})</span>
                                </td>
                                <td className="action-col">
                                    <div className="d-flex flex-column align-items-end justify-content-center">
                                        <a href="https://www.nftnnm.com/presale/balance" style={{ textDecoration: 'none' }}>
                                            <button className="btn-main-claim">
                                                Claim Reward
                                            </button>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <section id="socials-section" ref={socialsRef} className="tasks-section mx-auto glass-panel glow-unified-purple tasks-container-wrapper" style={{ padding: '40px 30px', borderRadius: '20px', marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="text-center w-100 mb-4">
                        <h2 className="fw-bold" style={{ fontSize: '1.80rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0' }}>
                            <span>🎉💰</span>
                            <span className="gradient-text">Daily Quests</span>
                            <span>💰🎉</span>
                        </h2>
                        <p className="mt-2 header-description" style={{ fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                            Earn daily points to climb the Leaderboard and secure your rewards.
                        </p>
                    </div>

                    <div className="text-center w-100 mb-5">
                        <img 
                            src="/join.png" 
                            alt="Rewards" 
                            loading="lazy" 
                            style={{ marginTop: '0', maxWidth: '100%', width: '100%', height: 'auto', borderRadius: '12px', filter: 'drop-shadow(0 0 20px rgba(157, 0, 255, 0.2))' }}
                        />
                    </div>

                    <div className="tasks-container w-100">
                        {isLoadingTasks ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-light" role="status" style={{ width: '2rem', height: '2rem', opacity: 0.5 }}>
                                </div>
                            </div>
                        ) : TASKS.map(task => {
                            const isCompleted = completedTasks.includes(task.id);
                            const isExpanded = expandedTaskId === task.id;

                            return (
                                <div key={task.id} className={`task-card ${isCompleted ? 'task-completed' : ''}`}>
                                    <div className="task-header d-flex justify-content-between align-items-center" onClick={() => toggleTaskAccordion(task.id)}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="task-icon-wrapper" style={{ backgroundColor: task.color }}>
                                                <i className={task.icon}></i>
                                            </div>
                                            <span className="task-label">{task.label}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="task-points-badge text-end" title={task.tooltip}>
                                                <span className="points-val">+{task.points.toLocaleString('en-US')}</span>
                                                <span className="points-type">{task.subText}</span>
                                            </div>
                                            {!isCompleted && (
                                                <div className="chevron-wrapper">
                                                    <i 
                                                        className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'up'}`}  
                                                         style={{ color: isExpanded ? '#EAECEF' : 'transparent' }}
                                                    ></i>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isExpanded && !isCompleted && (
                                        <div className="task-accordion-body">
                                            {!isTaskStepTwo ? (
                                                <div className="d-flex flex-column align-items-center">
                                                    <p className="text-center text-light instruction-text mb-4">
                                                        {task.instruction}
                                                    </p>
                                                    
                                                    <a 
                                                        href="#" 
                                                        onClick={(e) => handleDynamicPost(e, task.platform, task.id, task.actionUrl)}
                                                        className="btn-lightchain-action mb-4"
                                                    >
                                                        <i className={task.icon} style={{ marginRight: '8px' }}></i>
                                                        {task.id.includes('follow') ? 'Follow' : task.id.includes('join') ? 'Join' : 'Post'}
                                                    </a>

                                                    <div className="d-flex justify-content-center gap-3 w-100">
                                                        <button 
                                                            className="btn btn-lightchain-continue"
                                                            onClick={() => setIsTaskStepTwo(true)}
                                                        >
                                                            Continue
                                                        </button>
                                                        <button className="btn btn-action-cancel" onClick={() => setExpandedTaskId(null)}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="d-flex flex-column align-items-center">
                                                    <p className="text-center text-light instruction-text">
                                                        Paste your proof link below to verify:
                                                    </p>
                                                    <div className="d-flex justify-content-center mb-2 w-100">
                                                        <input 
                                                            type="text" 
                                                            className="task-input form-control text-center w-75" 
                                                            placeholder="Enter proof or username..."
                                                            value={taskInputValue}
                                                            onChange={(e) => setTaskInputValue(e.target.value)}
                                                        />
                                                    </div>
                                                    <p className="text-center text-white mb-3" style={{ fontSize: '11px', opacity: 0.9 }}>
                                                        To maximize your rewards, you must stay followed until the end of the campaign.
                                                    </p>
                                                    <div className="d-flex justify-content-center gap-3">
                                                        <button 
                                                            className="btn btn-action-continue"
                                                            onClick={() => handleTaskSubmit(task.id, task.points, task.type)}
                                                            disabled={isSubmittingTask || !taskInputValue.trim()}
                                                        >
                                                            {isSubmittingTask ? 'Verifying...' : 'Confirm'}
                                                        </button>
                                                        <button className="btn btn-action-cancel" onClick={() => setIsTaskStepTwo(false)}>
                                                            Back
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="tasks-footer w-100" style={{ marginTop: '24px' }}>
                        <a href="/legal" target="_blank" rel="noreferrer" className="footer-link">Terms & Conditions</a>
                        <span className="footer-separator">|</span>
                        <span className="footer-brand">NNM Protocol</span>
                    </div>
                </section>


                <section id="leaderboard-section" ref={leaderboardRef} className="leaderboard-section" style={{ marginTop: '180px' }}>
                    <div className="row align-items-center mb-4 g-3 mx-auto leaderboard-container">
                        <div className="col-md-6">
                            <h2 className="fw-bold mb-0 text-uppercase d-flex align-items-center gap-3 leaderboard-title" style={{ fontSize: '1.62rem' }}>
                                <i className="fa-solid fa-trophy metallic-trophy"></i>
                                <span className="gradient-text">Leaderboard</span>
                            </h2>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <div className="search-wrapper position-relative d-inline-block w-100">
                                <i className="fa-solid fa-search position-absolute top-50 translate-middle-y search-icon"></i>
                                <input 
                                    type="text" 
                                    className="form-control search-input" 
                                    placeholder="Search by Wallet Address..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive mx-auto leaderboard-container leaderboard-table-wrapper luxury-panel">
                        <table className="table table-borderless mb-0 leaderboard-table">
                            <thead>
                                <tr className="leaderboard-table-header">
                                    <th className="col-rank">Rank</th>
                                    <th className="col-wallet text-start">Wallet Address</th>
                                    <th className="col-points text-center">Total Points</th>
                                    <th className="col-date text-end">Last Update</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeaderboard.length > 0 ? (
                                    filteredLeaderboard.slice(0, itemsPerPage).map((user, index) => (
                                        <tr key={index} className="align-middle leaderboard-row">
                                            <td className="col-rank text-center">{renderRankBadge(user.rank)}</td>
                                            <td className="col-wallet text-start">
                                                <a 
                                                    href={`https://polygonscan.com/address/${user.wallet}`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="wallet-link desktop-wallet monospace"
                                                >
                                                    <i className="fa-solid fa-link me-2 opacity-50"></i>
                                                    {user.wallet}
                                                </a>
                                                <a 
                                                    href={`https://polygonscan.com/address/${user.wallet}`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="wallet-link mobile-wallet monospace"
                                                >
                                                    <i className="fa-solid fa-link me-2 opacity-50"></i>
                                                    {formatWalletMobile(user.wallet)}
                                                </a>
                                            </td>
                                            <td className="col-points text-center"><span className="leaderboard-points-val">{user.points.toLocaleString('en-US')}</span></td>
                                            <td className="col-date text-end"> 
                                                <span className="date-main">{user.formattedDate}</span>
                                                <span className="time-sub">{user.formattedTime}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-5 text-muted">
                                            No participants found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="row align-items-center mt-4 pb-5 mx-auto leaderboard-container">
                        <div className="col-md-6 d-flex align-items-center justify-content-start">
                        </div>
                        <div className="col-md-6 text-md-end">
                            <div className="pagination-controls d-inline-flex gap-2">
                                <button className="btn-page-v2"><i className="fa-solid fa-chevron-left"></i></button>
                                <button className="btn-page-v2 active">1</button>
                                <button className="btn-page-v2"><i className="fa-solid fa-chevron-right"></i></button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .campaign-main {
                    background-color: ${COLOR_NAVY_BG};
                    min-height: 100vh;
                    padding-bottom: 100px;
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

                .z-index-1 {
                    z-index: 1;
                }

                .luxury-panel {
                    background: rgba(147, 51, 234, 0.05);
                    border: 1px solid rgba(147, 51, 234, 0.11);
                    box-shadow: 0 0 30px rgba(147, 51, 234, 0.11);
                    border-radius: 6px;
                    backdrop-filter: blur(15px);
                }

                .glass-panel {
                    background: rgba(14, 28, 65, 0.20);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }

                .glow-unified-purple { 
                    box-shadow: 0 0 15px rgba(162, 0, 255, 0.3), 0 0 40px rgba(162, 0, 255, 0.15); 
                    border-color: rgba(162, 0, 255, 0.4); 
                }

                .neon-btn-container {
                    display: flex;
                    gap: 15px;
                    justify-content: flex-start;
                    width: auto;
                    margin-top: 20px;
                    margin-bottom: 56px !important;
                }

                .neon-btn {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 75, 130, 0.25);
                    padding: 8px 14px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }

                .neon-btn span {
                    background: linear-gradient(90deg, #9b51e0 0%, #ff4b82 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-size: 16px;
                    font-weight: bold;
                    font-family: sans-serif;
                    white-space: nowrap;
                }

                .neon-btn:hover {
                    background: rgba(255, 255, 255, 0.06);
                    box-shadow: 0 0 15px rgba(255, 75, 130, 0.3);
                }

                @media (max-width: 991px) {
                    .neon-btn-container {
                        flex-direction: column;
                        width: 90%;
                        margin: 0 auto 1.5rem auto;
                        gap: 10px;
                    }
                    .neon-btn {
                        width: 100%;
                        padding: 12px;
                    }
                    .giveaway-header {
                        text-align: center !important;
                    }
                }

                .gradient-text {
                    background: linear-gradient(90deg, #a200ff 0%, #ff0055 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-title {
                    letter-spacing: -0.5px;
                    line-height: 1;
                    font-size: 2.3rem;
                }

                .brand-gold {
                    color: ${COLOR_GOLD};
                }

                .header-description {
                    color: ${COLOR_TEXT_OFF_WHITE};
                    line-height: 1.7;
                }
                
                .header-image {
                    max-width: 98%;
                    height: auto;
                    max-height: 400px;
                    margin-top: 50px;
                    border-radius: 12px;
                    filter: drop-shadow(0 0 20px rgba(157, 0, 255, 0.2));
                    object-fit: contain;
                }

                .stats-table-wrapper {
                    width: 90%;
                    padding: 0;
                    overflow: hidden;
                }

                .stats-table {
                    font-size: 85%;
                }

                .stats-table-header {
                    border-bottom: 1px solid rgba(147, 51, 234, 0.11);
                }

                .stats-table th {
                    color: #F8FAF6;
                    font-size: 90%;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    padding: 16px;
                    background: transparent;
                }

                .stats-table td {
                    padding: 16px;
                    background: transparent;
                    border: none;
                    vertical-align: middle;
                }

                .points-val {
                    font-size: 20px;
                    font-weight: 500;
                    color: #EAECEF !important;
                    font-family: 'Inter', sans-serif;
                }


                .total-val {
                    color: ${COLOR_GOLD};
                    font-weight: 700;
                }

                .usd-value {
                    font-size: 11px;
                    color: #10B981;
                    margin-left: 6px;
                    font-weight: normal;
                }

                .action-col {
                    text-align: right;
                    padding-right: 24px !important;
                    width: 22%;
                }

                .claim-note {
                    font-size: 9px;
                    color: ${COLOR_TEXT_MUTED};
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .btn-main-claim {
                    background: linear-gradient(90deg, #a200ff 0%, #ff0055 100%);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-weight: 700;
                    font-size: 11px;
                    padding: 8px 16px;
                    cursor: pointer;
                    opacity: 1;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    min-width: 120px;
                }

                .tasks-section {
                    max-width: 100%;
                    padding-top: 40px;
                }

                .tasks-section-title {
                    color: ${COLOR_TEXT_MAIN};
                    font-weight: 700;
                    font-size: 22px;
                }
                
               .tasks-container-wrapper {
                    width: 66%;
                    margin: 0 auto;
                    padding: 24px;
                    background: rgba(59, 130, 246, 0.06);
                    border: 1px solid rgba(59, 130, 246, 0.15);
                    border-radius: 16px;
                    backdrop-filter: blur(15px);
                }

                @media (max-width: 768px) {
                    .tasks-container-wrapper {
                        width: 95%;
                        padding: 16px;
                    }
                }
                
                .tasks-container {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .task-card {
                    width: 100%;
                    margin: 0;
                    background-color: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(30, 58, 138, 0.2);
                    border-radius: 8px;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }

                .tasks-footer {
                    margin-top: 16px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(59, 130, 246, 0.15);
                    text-align: center;
                    font-size: 14px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .footer-link {
                    color: #60A5FA;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .footer-link:hover {
                    color: #93C5FD;
                }

                .footer-separator {
                    margin: 0 12px;
                    color: #3B82F6;
                    opacity: 0.5;
                }

                .footer-brand {
                    font-weight: 600;
                    color: #BFDBFE;
                }

                .task-card:hover:not(.task-completed) {
                    background-color: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.15);
                }

                .task-header {
                    cursor: pointer;
                    padding: 8px 12px;
                }

                .task-completed {
                    opacity: 0.5;
                    pointer-events: none;
                    filter: grayscale(100%);
                }
                
                .task-icon-wrapper {
                    width: 34px;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    color: white;
                    font-size: 17px;
                }

                .task-label {
                    color: ${COLOR_TEXT_MAIN};
                    font-weight: 600;
                    font-size: 13px;
                }
                
                .task-points-badge {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    opacity: 1;
                    margin-right: 10px;
                }

                .task-points-badge .points-val {
                    color: ${COLOR_TEXT_OFF_WHITE};
                    font-weight: 700;
                    font-size: 13px;
                    line-height: 1;
                }

                .task-points-badge .points-type {
                    color: #FFFFFF;
                    font-size: 9px;
                    text-transform: lowercase;
                    margin-top: 2px;
                }

                .chevron-wrapper {
                    width: 20px;
                    text-align: center;
                }

                .task-accordion-body {
                    padding: 12px 16px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    background: rgba(0,0,0,0.2);
                }

                .instruction-text {
                    font-size: 12px;
                    margin-bottom: 12px;
                }

                .open-link-text {
                    color: ${COLOR_GOLD};
                    text-decoration: none;
                    font-weight: bold;
                }

                .open-link-text:hover {
                    text-decoration: underline;
                }
                
                .task-input {
                    background-color: ${COLOR_NAVY_BG};
                    border: 1px solid ${COLOR_BORDER};
                    color: white;
                    padding: 8px;
                    font-size: 12px;
                    border-radius: 8px;
                }

                .task-input:focus {
                    background-color: #000;
                    border-color: #848E9C;
                    color: white;
                    box-shadow: none;
                    outline: none;
                }

                .btn-action-continue {
                    background-color: #EAECEF;
                    color: #000;
                    font-weight: 700;
                    padding: 6px 20px;
                    border-radius: 8px;
                    font-size: 12px;
                }

                .btn-action-continue:hover {
                    background-color: white;
                }

                .btn-action-continue:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-action-cancel {
                    background-color: transparent;
                    color: ${COLOR_TEXT_MUTED};
                    font-weight: 600;
                    padding: 6px 20px;
                    font-size: 12px;
                }

                .btn-action-cancel:hover {
                    color: white;
                }

                .leaderboard-container {
                    max-width: 98%;
                }

                .leaderboard-title {
                    color: ${COLOR_TEXT_OFF_WHITE};
                    letter-spacing: 1px;
                    font-size: 20px;
                }

                .search-wrapper {
                    max-width: 320px;
                }

                .search-icon {
                    left: 15px;
                    color: ${COLOR_TEXT_MUTED};
                    font-size: 14px;
                }

                .search-input {
                    background-color: ${COLOR_NAVY_BG};
                    border: 1px solid ${COLOR_BORDER};
                    color: ${COLOR_TEXT_MAIN};
                    padding: 5px 15px 5px 40px;
                    border-radius: 6px;
                    box-shadow: none;
                    font-size: 13px;
                }

                .search-input:focus {
                    background-color: #0d131f;
                    border-color: #a200ff;
                    color: white;
                    box-shadow: 0 0 0 3px rgba(162, 0, 255, 0.2);
                }


                .search-input::placeholder {
                    color: ${COLOR_TEXT_MUTED};
                }

                .leaderboard-table-wrapper {
                    width: 100%;
                    margin: 0 auto;
                    padding: 0;
                    overflow: auto; 
                }

                .leaderboard-table {
                    font-size: 85%;
                    min-width: 600px; 
                }

                .col-rank { width: 10%; }
                .col-wallet { width: 50%; }
                .col-points { width: 15%; }
                .col-date { width: 25%; white-space: nowrap; }

                .leaderboard-table-header th {
                    color: #e9d5ff;
                    font-size: 80%;
                    font-weight: bold;
                    text-transform: capitalize;
                    letter-spacing: 1px;
                    padding: 10px 15px; 
                    background-color: transparent;
                    border-bottom: 1px solid rgba(147, 51, 234, 0.11);
                }

                .leaderboard-table td {
                    padding: 10px 15px; 
                    background-color: transparent;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    color: ${COLOR_TEXT_OFF_WHITE};
                }

                .leaderboard-row:hover td {
                    background-color: rgba(255,255,255,0.02);
                }

                .rank-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    font-weight: 800;
                    font-size: 12px;
                }

                .rank-text {
                    font-size: 16px;
                    font-weight: 700;
                    color: #e9d5ff;
                }

                .wallet-link {
                    color: #3B82F6;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .wallet-link:hover {
                    color: #60A5FA;
                    text-decoration: underline;
                }

                .mobile-wallet {
                    display: none;
                }

                .desktop-wallet {
                    display: inline-block;
                }

                .date-main {
                    color: #EAECEF;
                    font-size: 13px;
                }

                .time-sub {
                    color: #848E9C;
                    font-size: 11px;
                    margin-left: 8px;
                }


                .leaderboard-points-val {
                    color: #FFFFFF;
                    font-weight: normal;
                    font-size: 15px;
                }

                .monospace {
                    font-family: 'Roboto Mono', monospace;
                }

                .pagination-info {
                    color: ${COLOR_TEXT_MUTED};
                    font-size: 13px;
                }

                .clean-dark-select {
                    background-color: #121824;
                    color: #EAECEF;
                    border: 1px solid #2B3139;
                    padding: 4px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    cursor: pointer;
                    outline: none;
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    text-align: center;
                    min-width: 65px;
                }
                .clean-dark-select option {
                    background-color: #121824;
                    color: #EAECEF;
                }

                .btn-page-v2 {
                    background-color: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #848E9C;
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    cursor: pointer;
                }

                .btn-page-v2.active {
                    background-color: #003366;
                    border-color: #004d99;
                    color: #FFFFFF;
                }

                .metallic-trophy {
                    background-image: linear-gradient(135deg, #f7df85 0%, #e19d08 40%, #fbe9aa 50%, #f3c24d 60%, #e19d08 70%, #f7df85 100%);
                    background-size: 200% 200%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.5));
                }
                @media (max-width: 768px) {
                    .desktop-wallet {
                        display: none;
                    }
                    .mobile-wallet {
                        display: inline-block;
                    }
                    .col-wallet { width: 35%; }
                    .col-points { width: 30%; }
                }
                @keyframes slideInFromRight {
                    0% {
                        transform: translateX(50px);
                        opacity: 0;
                    }
                    100% {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes slideInFromLeft {
                    0% {
                        transform: translateX(-50px);
                        opacity: 0;
                    }
                    100% {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .giveaway-header .text-start {
                    animation: slideInFromLeft 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                .giveaway-header .text-end {
                    animation: slideInFromRight 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                @keyframes slideInFromFarRight {
                    0% {
                        transform: translateX(100vw); 
                        opacity: 0;
                    }
                    100% {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .neon-btn-container button {
                    opacity: 0;
                    animation: slideInFromFarRight 2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
                }
                .neon-btn-container button:nth-child(1) { animation-delay: 0.2s; }
                .neon-btn-container button:nth-child(2) { animation-delay: 1.2s; }
                .neon-btn-container button:nth-child(3) { animation-delay: 2.2s; }

                .btn-lightchain-action {
                    background-color: #f8f9fa;
                    color: #000000;
                    font-weight: 600;
                    padding: 8px 32px;
                    border-radius: 8px;
                    font-size: 13px;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #dee2e6;
                    transition: background-color 0.2s;
                }
                
                .btn-lightchain-action:hover {
                    background-color: #e9ecef;
                    color: #000000;
                }
                
                .btn-lightchain-continue {
                    background-color: #10B981;
                    color: #ffffff;
                    font-weight: 700;
                    padding: 6px 24px;
                    border-radius: 8px;
                    font-size: 12px;
                    border: none;
                    transition: background-color 0.2s;
                }
                
                .btn-lightchain-continue:hover {
                    background-color: #059669;
                }



            ` }} />
        </main>
    );
}
