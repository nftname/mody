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
}

const COLOR_NAVY_BG = '#050a16';
const COLOR_PANEL = '#121824';
const COLOR_BORDER = '#2B3139';
const COLOR_TEXT_MAIN = '#EAECEF';
const COLOR_TEXT_MUTED = '#848E9C';
const COLOR_TEXT_OFF_WHITE = '#F8FAF6';
const COLOR_GOLD = '#FCD535';

const formatWallet = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const TASKS: Task[] = [
    { id: 'tw_follow', platform: 'X', label: 'Follow @nnmmarket on X', points: 1000, type: 'once', color: '#000000', icon: 'fa-brands fa-x-twitter', actionUrl: 'https://x.com/nnmmarket', instruction: 'Click the link to follow us, then enter your X handle below.', subText: 'One time', tooltip: 'This reward is one-time only and cannot be repeated. It is a core requirement to boost your rank.' },
    { id: 'tw_rt', platform: 'X', label: 'Repost the Daily Mission on X', points: 300, type: 'daily', color: '#000000', icon: 'fa-brands fa-x-twitter', actionUrl: 'https://x.com/nnmmarket', instruction: 'Repost our pinned post, then paste the link to your repost below.', subText: '1 time per day', tooltip: 'You can complete this action once a day to earn points.' },
    { id: 'tw_like', platform: 'X', label: 'Like & Reply on X', points: 200, type: 'daily', color: '#000000', icon: 'fa-brands fa-x-twitter', actionUrl: 'https://x.com/nnmmarket', instruction: 'Like the pinned post and confirm your username below.', subText: '3 times per day', tooltip: 'You can complete this action up to 3 times a day to earn points.' },
    { id: 'tg_join', platform: 'Telegram', label: 'Join NFTNNM on Telegram', points: 500, type: 'once', color: '#229ED9', icon: 'fa-brands fa-telegram', actionUrl: 'https://t.me/NFTNNM', instruction: 'Join our channel and enter your Telegram username (@username) below.', subText: 'One time', tooltip: 'This reward is one-time only and cannot be repeated. It is a core requirement to boost your rank.' },
    { id: 'dc_join', platform: 'Discord', label: 'Join Our Discord Server', points: 500, type: 'once', color: '#5865F2', icon: 'fa-brands fa-discord', actionUrl: 'https://discord.com/invite/gNR8zwgtpc', instruction: 'Join our server and verify yourself. Enter your Discord ID below.', subText: 'One time', tooltip: 'This reward is one-time only and cannot be repeated. It is a core requirement to boost your rank.' },
    { id: 'fb_follow', platform: 'Facebook', label: 'Follow us on Facebook', points: 200, type: 'once', color: '#1877F2', icon: 'fa-brands fa-facebook', actionUrl: 'https://www.facebook.com/profile.php?id=61586895007931', instruction: 'Follow our page and enter your profile name below.', subText: 'One time', tooltip: 'This reward is one-time only and cannot be repeated. It is a core requirement to boost your rank.' },
    { id: 'ig_follow', platform: 'Instagram', label: 'Follow us on Instagram', points: 200, type: 'once', color: '#E4405F', icon: 'fa-brands fa-instagram', actionUrl: 'https://www.instagram.com/NNM_Assets', instruction: 'Follow our official account and enter your IG handle below.', subText: 'One time', tooltip: 'This reward is one-time only and cannot be repeated. It is a core requirement to boost your rank.' },
    { id: 'md_follow', platform: 'Medium', label: 'Follow our Medium Publication', points: 300, type: 'once', color: '#000000', icon: 'fa-brands fa-medium', actionUrl: 'https://medium.com/@nftnnmmarket', instruction: 'Follow us on Medium and enter your profile link below.', subText: 'One time', tooltip: 'This reward is one-time only and cannot be repeated. It is a core requirement to boost your rank.' }
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
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [isMounted, setIsMounted] = useState(false);

    const socialsRef = useRef<HTMLElement>(null);
    const leaderboardRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setIsMounted(true);
        const fetchUnifiedData = async () => {
            try {
                const lbRes = await fetch('/api/dashboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getLeaderboard', address: address || 'all' })
                });
                const lbData = await lbRes.json();
                
                if (lbData.data) {
                    const formattedLeaderboard = lbData.data.map((user: any, index: number) => ({
                        rank: index + 1,
                        wallet: user.wallet_address,
                        points: user.total_points,
                        lastActiveDate: user.last_active_date ? new Date(user.last_active_date).toISOString().split('T')[0] : 'N/A'
                    }));
                    setLeaderboardData(formattedLeaderboard);
                }

                if (address) {
                    const res = await fetch('/api/dashboard', {
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
            }
        };
        fetchUnifiedData();
    }, [address]);

    const totalPoints = socialPoints + convictionPoints + giftPoints;
    const launchPrice = 0.001;
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
    };

    const handleTaskSubmit = async (taskId: string, points: number) => {
        if (!taskInputValue.trim() || !address) return;
        setIsSubmittingTask(true);
        try {
            const res = await fetch('/api/dashboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'submitTask', 
                    address, 
                    taskId, 
                    proof: taskInputValue,
                    points 
                })
            });
            const data = await res.json();
            
            if (data.success) {
                setCompletedTasks(prev => [...prev, taskId]);
                setExpandedTaskId(null);
                setTaskInputValue('');
                
                const pointsRes = await fetch('/api/dashboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getConviction', address })
                });
                const pointsData = await pointsRes.json();
                if (!pointsData.error) {
                    setSocialPoints(pointsData.social_points || 0);
                }
                
                const lbRes = await fetch('/api/dashboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'getLeaderboard', address })
                });
                const lbData = await lbRes.json();
                if (lbData.data) {
                    const formattedLeaderboard = lbData.data.map((user: any, index: number) => ({
                        rank: index + 1,
                        wallet: user.wallet_address,
                        points: user.total_points,
                        lastActiveDate: user.last_active_date ? new Date(user.last_active_date).toISOString().split('T')[0] : 'N/A'
                    }));
                    setLeaderboardData(formattedLeaderboard);
                }
            }
        } catch (error) {
            console.error(error);
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
            <div className="bg-glow bg-glow-left"></div>
            <div className="bg-glow bg-glow-center"></div>
            <div className="bg-glow bg-glow-right"></div>

            <div className="container pt-4 position-relative z-index-1">
                
                <header className="row align-items-center giveaway-header" style={{ marginBottom: '6rem' }}>
                    <div className="col-lg-6 text-start mb-4 mb-lg-0">
                        <div className="neon-btn-container mb-4">
                            <Link href="/ecosystem-rewards" style={{ textDecoration: 'none', display: 'flex' }}>
                                <button className="neon-btn">
                                    <span>Ecosystem Rewards</span>
                                </button>
                            </Link>
                            <button onClick={() => scrollToSection(leaderboardRef)} className="neon-btn">
                                <span>Top Founders</span>
                            </button>
                            <button onClick={() => scrollToSection(socialsRef)} className="neon-btn">
                                <span>Join Socials</span>
                            </button>
                        </div>

                        <h1 className="fw-bold header-title gradient-text">
                            NNM Continuous Reward Program
                        </h1>
                        <p className="mt-3 fs-15 header-description">
                             Engage, expand, and earn. Participate in our evolving daily missions to secure your position among the top founders. Whether unlocking current reward vaults or generating direct value at our Token Launch, your daily collected points are the key to maximizing your long-term benefits.
                        </p>
                    </div>
                    
                    <div className="col-lg-6 text-end d-flex justify-content-center justify-content-lg-end">
                        <img 
                            src="/join.png" 
                            alt="Ecosystem Rewards" 
                            loading="lazy" 
                            className="header-image"
                        />
                    </div>
                </header>

                <div className="table-responsive mb-5 mx-auto stats-table-wrapper luxury-panel">
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

                <section ref={socialsRef} className="tasks-section mx-auto">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold" style={{ fontSize: '1.50rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0' }}>
                            <span>🎉💰</span>
                            <span className="gradient-text">Daily Expansion Missions</span>
                            <span>💰🎉</span>
                        </h2>
                        <p className="mt-2 header-description" style={{ fontSize: '0.85rem' }}>
                            Complete these daily to maximize your point balance and secure your next reward!
                        </p>
                    </div>

                    <div className="tasks-container-wrapper">
                        <div className="tasks-container">
                            {TASKS.map(task => {
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
                                                        <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-muted`}></i>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && !isCompleted && (
                                            <div className="task-accordion-body">
                                                <p className="text-center text-light instruction-text">
                                                    {task.instruction}{' '}
                                                    <a href={task.actionUrl} target="_blank" rel="noreferrer" className="open-link-text">
                                                        Open Link
                                                    </a>
                                                </p>
                                                <div className="d-flex justify-content-center mb-2">
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
                                                        onClick={() => handleTaskSubmit(task.id, task.points)}
                                                        disabled={isSubmittingTask || !taskInputValue.trim()}
                                                    >
                                                        {isSubmittingTask ? 'Verifying...' : 'Confirm'}
                                                    </button>
                                                    <button className="btn btn-action-cancel" onClick={() => setExpandedTaskId(null)}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section ref={leaderboardRef} className="leaderboard-section mt-5 pt-5">
                    <div className="row align-items-center mb-4 g-3 mx-auto leaderboard-container">
                        <div className="col-md-6">
                            <h2 className="fw-bold mb-0 text-uppercase d-flex align-items-center gap-3 leaderboard-title gradient-text" style={{ fontSize: '1.62rem' }}>
                                <i className="fa-solid fa-trophy brand-gold"></i>
                                Leaderboard
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
                                    <th style={{ width: '15%' }}>Rank</th>
                                    <th style={{ width: '40%' }}>Wallet Address</th>
                                    <th style={{ width: '25%' }}>Total Points</th>
                                    <th style={{ width: '20%' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeaderboard.length > 0 ? (
                                    filteredLeaderboard.slice(0, itemsPerPage).map((user, index) => (
                                        <tr key={index} className="align-middle leaderboard-row">
                                            <td>{renderRankBadge(user.rank)}</td>
                                            <td>
                                                <span className="wallet-badge monospace">
                                                    <i className="fa-solid fa-wallet me-2 opacity-50"></i>
                                                    {formatWallet(user.wallet)}
                                                </span>
                                            </td>
                                            <td><span className="leaderboard-points-val">{user.points.toLocaleString('en-US')}</span></td>
                                            <td><span style={{ color: '#EAECEF', fontSize: '13px' }}>{user.lastActiveDate}</span></td>

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
                            <select 
                                className="clean-dark-select"
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            >
                                <option value={10}>10</option>
                                <option value={30}>30</option>
                                <option value={50}>50</option>
                            </select>
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
                    background-image: url("data:image/svg+xml,%3Csvg width='60' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-opacity='0.003' fill='%23ffffff'/%3E%3C/svg%3E");
                    min-height: 100vh;
                    padding-bottom: 100px;
                    overflow-x: hidden;
                    font-family: 'Inter', sans-serif;
                    position: relative;
                }

                .bg-glow {
                    position: absolute;
                    pointer-events: none;
                    z-index: 0;
                }

                .bg-glow-left {
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: radial-gradient(circle at 10% 10%, rgba(225, 29, 72, 0.12) 0%, rgba(167, 139, 250, 0) 60%);
                    filter: blur(120px);
                }

                .bg-glow-center {
                    top: 30%;
                    left: 20%;
                    width: 100vw;
                    height: 100vh;
                    background: radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.1) 0%, rgba(109, 40, 217, 0) 70%);
                    filter: blur(150px);
                }

                .bg-glow-right {
                    bottom: 0;
                    right: 0;
                    width: 100vw;
                    height: 100vh;
                    background: radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0) 60%);
                    filter: blur(120px);
                }

                .z-index-1 {
                    z-index: 1;
                }

                .luxury-panel {
                    background: rgba(147, 51, 234, 0.05);
                    border: 1px solid rgba(147, 51, 234, 0.11);
                    box-shadow: 0 0 30px rgba(147, 51, 234, 0.11);
                    border-radius: 20px;
                    backdrop-filter: blur(15px);
                }

                .neon-btn-container {
                    display: flex;
                    gap: 15px;
                    justify-content: flex-start;
                    width: auto;
                    margin-top: -26px;
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
                    border-radius: 12px;
                    filter: drop-shadow(0 0 20px rgba(157, 0, 255, 0.2));
                    object-fit: cover;
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
                    width: 60%;
                    margin: 0 auto;
                    padding: 0;
                }

                @media (max-width: 768px) {
                    .tasks-container-wrapper {
                        width: 95%;
                        padding: 0;
                    }
                }
                
                .tasks-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .task-card {
                    width: 90%;
                    margin: 0 auto;
                    background-color: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.3s ease;
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
                    border-color: ${COLOR_GOLD};
                    color: white;
                    box-shadow: none;
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
                    max-width: 90%;
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
                    padding: 10px 15px 10px 40px;
                    border-radius: 8px;
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
                    padding: 0;
                    overflow: hidden;
                }

                .leaderboard-table {
                    font-size: 85%;
                }

                .leaderboard-table-header th {
                    color: #e9d5ff;
                    font-size: 80%;
                    font-weight: bold;
                    text-transform: capitalize;
                    letter-spacing: 1px;
                    padding: 16px 20px;
                    background-color: transparent;
                    border-bottom: 1px solid rgba(147, 51, 234, 0.11);
                }

                .leaderboard-table td {
                    padding: 16px 20px;
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

                .nft-id-badge {
                    background-color: rgba(28, 187, 255, 0.1);
                    color: #1CBBFF;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 12px;
                    font-weight: 600;
                }

                .user-name-text {
                    font-size: 14px;
                    color: ${COLOR_TEXT_MAIN};
                }

                .leaderboard-points-val {
                    color: #FFFFFF;
                    font-weight: normal;
                    font-size: 15px;
                }

                .wallet-badge {
                    background-color: rgba(255,255,255,0.05);
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    color: ${COLOR_TEXT_MUTED};
                }

                .monospace {
                    font-family: 'Roboto Mono', monospace;
                }

                .pagination-info {
                    color: ${COLOR_TEXT_MUTED};
                    font-size: 13px;
                }

                .custom-select-dark {
                    background-color: ${COLOR_NAVY_BG};
                    border: 1px solid ${COLOR_BORDER};
                    color: ${COLOR_TEXT_MAIN};
                    font-size: 12px;
                    padding: 6px 30px 6px 12px;
                }

                .btn-page {
                    background-color: ${COLOR_PANEL};
                    border: 1px solid ${COLOR_BORDER};
                    color: ${COLOR_TEXT_MUTED};
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                    padding: 0;
                }

                .btn-page:hover {
                    background-color: ${COLOR_NAVY_BG};
                    color: white;
                }

                .btn-page.active {
                    background-color: ${COLOR_GOLD};
                    color: #000;
                    border-color: ${COLOR_GOLD};
                    font-weight: bold;
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
            ` }} />
        </main>
    );
}
