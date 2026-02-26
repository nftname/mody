'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

const BACKGROUND_DARK = '#181A20';
const SURFACE_DARK = '#181A20';
const BORDER_COLOR = '#2B3139';
const TEXT_PRIMARY = '#EAECEF';
const TEXT_MUTED = '#848E9C';
const GOLD_SOLID = '#FCD535';

const Accordion = ({ title, isOpen, onToggle, children }: any) => (
    <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px', marginBottom: '10px', overflow: 'hidden' }}>
        <button onClick={onToggle} className="w-100 d-flex justify-content-between align-items-center p-3" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: TEXT_PRIMARY, fontWeight: 'bold' }}>
            {title}
            <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
        </button>
        {isOpen && <div className="p-3" style={{ background: SURFACE_DARK }}>{children}</div>}
    </div>
);

const ScriptControl = ({ name }: { name: string }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const toggleScript = async () => {
        const action = isRunning ? 'stop' : 'start';
        try {
            const res = await fetch('/api/admin-scripts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, scriptName: name })
            });
            const data = await res.json();
            if (data.success) {
                setIsRunning(!isRunning);
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${action === 'start' ? 'Started' : 'Stopped'} ${name}`]);
            }
        } catch (e) { }
    };

    return (
        <div className="d-flex flex-column gap-3">
            <div className="d-flex gap-2">
                <button onClick={toggleScript} className="btn btn-sm" style={{ background: isRunning ? '#ea3943' : '#0ecb81', color: '#fff', fontWeight: 'bold', border: 'none' }}>
                    {isRunning ? 'Stop' : 'Start'}
                </button>
            </div>
            <div style={{ background: '#000', border: `1px solid ${BORDER_COLOR}`, height: '150px', borderRadius: '4px', padding: '10px', overflowY: 'auto', color: '#0ecb81', fontFamily: 'monospace', fontSize: '12px' }}>
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    );
};

const DropdownTable = ({ title, data, columns, type }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    
    const filteredData = useMemo(() => {
        let sorted = [...data];
        if (search) sorted = sorted.filter(item => item.name?.toLowerCase().includes(search.toLowerCase()));
        if (type === 'owned') {
            sorted.sort((a, b) => {
                if (a.name.length !== b.name.length) return a.name.length - b.name.length;
                return a.name.localeCompare(b.name);
            });
        }
        return sorted;
    }, [data, search, type]);

    return (
        <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px', marginBottom: '15px' }}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-100 p-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(255,255,255,0.02)', border: 'none', color: TEXT_PRIMARY }}>
                <span style={{ fontWeight: 'bold' }}>{title} ({filteredData.length})</span>
                <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
            </button>
            {isOpen && (
                <div className="p-3" style={{ background: SURFACE_DARK, overflowX: 'auto' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <input 
                            type="text" 
                            placeholder="Search name..." 
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="custom-input"
                        />
                        {type !== 'owned' && (
                            <select className="custom-select">
                                <option value="all">All Time</option>
                                <option value="1h">1 Hour</option>
                                <option value="10h">10 Hours</option>
                                <option value="24h">24 Hours</option>
                                <option value="7d">1 Week</option>
                            </select>
                        )}
                    </div>
                    <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
                        <thead>
                            <tr>{columns.map((c: string, i: number) => <th key={i} style={{ color: TEXT_MUTED, borderBottom: `1px solid ${BORDER_COLOR}` }}>{c}</th>)}</tr>
                        </thead>
                        <tbody>
                            {filteredData.slice((page - 1) * 10, page * 10).map((row: any, i: number) => (
                                <tr key={i}>
                                    <td style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                        <Link href={`/asset/${row.id}`} style={{ color: GOLD_SOLID, textDecoration: 'none' }}>{row.name}</Link>
                                    </td>
                                    {type === 'owned' && (
                                        <td style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                            <Link href={`/profile/${row.wallet}`} style={{ color: TEXT_PRIMARY, textDecoration: 'none' }}>{row.wallet.slice(0, 6)}...</Link>
                                        </td>
                                    )}
                                    {type === 'sales' && (
                                        <>
                                            <td style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>{row.price} POL</td>
                                            <td style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                                <Link href={`/profile/${row.buyer}`} style={{ color: GOLD_SOLID, textDecoration: 'none' }}>{row.buyer.slice(0, 6)}</Link>
                                            </td>
                                        </>
                                    )}
                                    {type === 'offers' && (
                                        <>
                                            <td style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                                <Link href={`/profile/${row.wallet}`} style={{ color: GOLD_SOLID, textDecoration: 'none' }}>{row.wallet.slice(0, 6)}</Link>
                                            </td>
                                            <td style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>{row.price} WPOL</td>
                                            <td style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>{row.expiry}</td>
                                        </>
                                    )}
                                    {type === 'prints' && (
                                        <td style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>{row.id}</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-between mt-3">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="btn btn-sm custom-btn" disabled={page === 1}>Prev</button>
                        <span style={{ color: TEXT_MUTED, fontSize: '14px' }}>Page {page}</span>
                        <button onClick={() => setPage(p => p + 1)} className="btn btn-sm custom-btn" disabled={filteredData.length <= page * 10}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AdminScanner() {
    const [openScript, setOpenScript] = useState<string | null>(null);
    const [inventory, setInventory] = useState({ founder: [], elite: [], immortal: [] });
    const [activity, setActivity] = useState({ sales: [], offers: [] });

    const scripts = [
        "Market Maker Final",
        "NNM Conviction Expert",
        "Sweep All",
        "Add Money",
        "Execute Sovereign Listings",
        "Expert Admin Minter"
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const invRes = await fetch('/api/admin-scripts?type=inventory');
                const invData = await invRes.json();
                if (invData.success) setInventory(invData.inventory);

                const actRes = await fetch('/api/admin-scripts?type=external_activity');
                const actData = await actRes.json();
                if (actData.success) setActivity({ sales: actData.sales, offers: actData.offers });
            } catch (e) { }
        };
        fetchData();
    }, []);

    return (
        <main style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
            <style jsx global>{`
                .custom-select {
                    background-color: ${BACKGROUND_DARK};
                    color: ${TEXT_PRIMARY};
                    border: 1px solid ${BORDER_COLOR};
                    padding: 4px 8px;
                    border-radius: 4px;
                    outline: none;
                    font-size: 13px;
                }
                .custom-select:focus {
                    border-color: ${GOLD_SOLID};
                }
                .custom-input {
                    background-color: transparent;
                    color: ${TEXT_PRIMARY};
                    border: 1px solid ${BORDER_COLOR};
                    padding: 4px 8px;
                    border-radius: 4px;
                    outline: none;
                    font-size: 13px;
                }
                .custom-input:focus {
                    border-color: ${GOLD_SOLID};
                }
                .custom-btn {
                    border: 1px solid ${BORDER_COLOR};
                    color: ${TEXT_PRIMARY};
                    background: transparent;
                }
                .custom-btn:hover:not(:disabled) {
                    border-color: ${GOLD_SOLID};
                    color: ${GOLD_SOLID};
                }
            `}</style>
            
            <div className="container-fluid" style={{ maxWidth: '1280px' }}>
                <div className="row mb-4">
                    <div className="col-12">
                        <h4 style={{ color: GOLD_SOLID, marginBottom: '15px' }}>Owned Names</h4>
                        <DropdownTable title="Founders" data={inventory.founder} columns={['Name', 'Wallet Link']} type="owned" />
                        <DropdownTable title="Elite" data={inventory.elite} columns={['Name', 'Wallet Link']} type="owned" />
                        <DropdownTable title="Immortal" data={inventory.immortal} columns={['Name', 'Wallet Link']} type="owned" />
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-12">
                        <h4 style={{ color: GOLD_SOLID, marginBottom: '15px' }}>External Market Activity</h4>
                        <DropdownTable title="Sales (External)" data={activity.sales} columns={['Name', 'Price', 'Buyer Wallet']} type="sales" />
                        <DropdownTable title="Offers (External)" data={activity.offers} columns={['Name', 'Wallet', 'Offer Value', 'Expiry']} type="offers" />
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-12">
                        <h4 style={{ color: GOLD_SOLID, marginBottom: '15px' }}>Printing Stats</h4>
                        <div className="d-flex gap-3 mb-3 flex-wrap">
                            <div className="flex-fill" style={{ minWidth: '300px' }}>
                                <DropdownTable title="Founders" data={[]} columns={['Name', 'ID']} type="prints" />
                            </div>
                            <div className="flex-fill" style={{ minWidth: '300px' }}>
                                <DropdownTable title="Elite" data={[]} columns={['Name', 'ID']} type="prints" />
                            </div>
                            <div className="flex-fill" style={{ minWidth: '300px' }}>
                                <DropdownTable title="Immortal" data={[]} columns={['Name', 'ID']} type="prints" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <h4 style={{ color: GOLD_SOLID, marginBottom: '15px' }}>Experts Control</h4>
                        {scripts.map((script, idx) => (
                            <Accordion key={idx} title={script} isOpen={openScript === script} onToggle={() => setOpenScript(openScript === script ? null : script)}>
                                <ScriptControl name={script} />
                            </Accordion>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
