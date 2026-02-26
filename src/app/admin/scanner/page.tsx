'use client';

import { useState } from 'react';
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

    const toggleScript = () => {
        setIsRunning(!isRunning);
        setLogs(prev => [...prev, isRunning ? `[${new Date().toLocaleTimeString()}] Stopped ${name}` : `[${new Date().toLocaleTimeString()}] Started ${name}`]);
    };

    return (
        <div className="d-flex flex-column gap-3">
            <div className="d-flex gap-2">
                <button onClick={toggleScript} className="btn btn-sm" style={{ background: isRunning ? '#ea3943' : '#0ecb81', color: '#fff', fontWeight: 'bold' }}>
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
    
    return (
        <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px', marginBottom: '15px' }}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-100 p-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(255,255,255,0.02)', border: 'none', color: TEXT_PRIMARY }}>
                <span style={{ fontWeight: 'bold' }}>{title} ({data.length})</span>
                <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
            </button>
            {isOpen && (
                <div className="p-3" style={{ background: SURFACE_DARK, overflowX: 'auto' }}>
                    <div className="d-flex justify-content-end mb-2">
                        <select className="form-select form-select-sm w-auto" style={{ background: 'transparent', color: TEXT_PRIMARY, borderColor: BORDER_COLOR }}>
                            <option value="all">All Time</option>
                            <option value="1h">1 Hour</option>
                            <option value="10h">10 Hours</option>
                            <option value="24h">24 Hours</option>
                            <option value="7d">1 Week</option>
                        </select>
                    </div>
                    <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
                        <thead>
                            <tr>{columns.map((c: string, i: number) => <th key={i} style={{ color: TEXT_MUTED, borderBottom: `1px solid ${BORDER_COLOR}` }}>{c}</th>)}</tr>
                        </thead>
                        <tbody>
                            {data.slice((page - 1) * 10, page * 10).map((row: any, i: number) => (
                                <tr key={i}>
                                    <td style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                        <Link href={`/asset/${row.id}`} style={{ color: GOLD_SOLID, textDecoration: 'none' }}>{row.name}</Link>
                                    </td>
                                    <td style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>{row.id}</td>
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
                                        <td style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                            <Link href={`/profile/${row.wallet}`} style={{ color: GOLD_SOLID, textDecoration: 'none' }}>{row.wallet.slice(0, 6)}</Link>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-between mt-3">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="btn btn-sm btn-outline-secondary" disabled={page === 1}>Prev</button>
                        <span style={{ color: TEXT_MUTED, fontSize: '14px' }}>Page {page}</span>
                        <button onClick={() => setPage(p => p + 1)} className="btn btn-sm btn-outline-secondary" disabled={data.length <= page * 10}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AdminScanner() {
    const [openScript, setOpenScript] = useState<string | null>(null);

    const scripts = [
        "Market Maker Final",
        "NNM Conviction Expert",
        "Sweep All",
        "Add Money",
        "Execute Sovereign Listings",
        "Expert Admin Minter"
    ];

    const toggleScriptAccordion = (name: string) => {
        setOpenScript(openScript === name ? null : name);
    };

    return (
        <main style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
            <div className="container-fluid" style={{ maxWidth: '1280px' }}>
                <div className="row mb-4">
                    <div className="col-12">
                        <h4 style={{ color: GOLD_SOLID, marginBottom: '15px' }}>Printing Stats</h4>
                        <div className="d-flex gap-3 mb-3 flex-wrap">
                            <div className="flex-fill" style={{ minWidth: '300px' }}>
                                <DropdownTable 
                                    title="Founders" 
                                    data={Array(15).fill({ id: '123', name: 'Alpha', wallet: '0x1A2B' })} 
                                    columns={['Name', 'ID', 'Wallet']} 
                                    type="prints" 
                                />
                            </div>
                            <div className="flex-fill" style={{ minWidth: '300px' }}>
                                <DropdownTable 
                                    title="Elite" 
                                    data={Array(8).fill({ id: '456', name: 'Beta', wallet: '0x3C4D' })} 
                                    columns={['Name', 'ID', 'Wallet']} 
                                    type="prints" 
                                />
                            </div>
                            <div className="flex-fill" style={{ minWidth: '300px' }}>
                                <DropdownTable 
                                    title="Immortal" 
                                    data={Array(3).fill({ id: '789', name: 'Omega', wallet: '0x5E6F' })} 
                                    columns={['Name', 'ID', 'Wallet']} 
                                    type="prints" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-12">
                        <h4 style={{ color: GOLD_SOLID, marginBottom: '15px' }}>External Market Activity</h4>
                        <DropdownTable 
                            title="Sales" 
                            data={Array(12).fill({ id: '111', name: 'SaleAsset', price: '5', buyer: '0x9999' })} 
                            columns={['Name', 'ID', 'Price', 'Buyer Wallet']} 
                            type="sales" 
                        />
                        <DropdownTable 
                            title="Offers" 
                            data={Array(25).fill({ id: '222', name: 'OfferAsset', wallet: '0x8888', price: '4.5', expiry: '2024-12-31' })} 
                            columns={['Name', 'ID', 'Wallet', 'Offer Value', 'Expiry']} 
                            type="offers" 
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <h4 style={{ color: GOLD_SOLID, marginBottom: '15px' }}>Experts Control</h4>
                        {scripts.map((script, idx) => (
                            <Accordion 
                                key={idx} 
                                title={script} 
                                isOpen={openScript === script} 
                                onToggle={() => toggleScriptAccordion(script)}
                            >
                                <ScriptControl name={script} />
                            </Accordion>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
