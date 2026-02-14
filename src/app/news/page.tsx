'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MarketTicker from '@/components/MarketTicker';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';

const BACKGROUND_DARK = '#181A20';
const SURFACE_DARK = '#1E2329';
const BORDER_COLOR = '#333'; 
const TEXT_PRIMARY = '#EAECEF';
const TEXT_MUTED = '#848E9C';
const GOLD_BASE = '#FCD535';
const ITEMS_PER_PAGE = 10;

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data, error, count } = await supabase
          .from('news_posts')
          .select('*', { count: 'exact' })
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;
        if (data) setNews(data);
        if (count !== null) setTotalCount(count);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo(0, 0);
  }, [currentPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " YEARS AGO";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " MONTHS AGO";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " DAYS AGO";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " HOURS AGO";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " MINUTES AGO";
    return "JUST NOW";
  };

  return (
    <main style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', fontFamily: '"Inter", sans-serif', paddingBottom: '80px' }}>
      
      <MarketTicker />

      <div className="header-wrapper" style={{ borderBottom: `1px solid ${BORDER_COLOR}`, padding: '4px 0', backgroundColor: SURFACE_DARK }}>
        <div className="container-fluid px-2"> 
            <div className="widgets-grid-horizontal">
                <div className="widget-capsule"> <NGXWidget theme="dark" /> </div>
                <div className="widget-capsule"> <NGXCapWidget theme="dark" /> </div>
                <div className="widget-capsule"> <NGXVolumeWidget theme="dark" /> </div>
            </div>
        </div>
      </div>

      <div className="container pt-5">
        <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
                
                <div className="d-flex align-items-center mb-5 pb-2" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                    <div className="live-dot"></div>
                    <h1 className="h5 fw-bold mb-0 text-white text-uppercase" style={{ letterSpacing: '2px', fontSize: '14px', color: TEXT_PRIMARY }}>Global Market Wire</h1>
                </div>

                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ color: TEXT_MUTED }}>
                         <div className="spinner-border mb-3" role="status" style={{ color: TEXT_MUTED }}></div>
                         <span style={{fontSize:'12px', letterSpacing:'1px'}}>SYNCING FEED...</span>
                    </div>
                ) : (
                    <div className="news-feed">
                        {news.length === 0 ? (
                           <div className="text-center py-5" style={{ color: TEXT_MUTED }}>No market updates available.</div>
                        ) : (
                           news.map((item, index) => (
                            <div key={item.id} className="news-item-wrapper">
                                <div className="news-card d-flex flex-column flex-md-row gap-4 align-items-start">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <span className="badge-category">{item.category}</span>
                                            <span className="text-date">{timeAgo(item.created_at)}</span>
                                        </div>
                                        <h2 className="news-title">
                                            <Link href={`/blog/${item.id}`} className="text-decoration-none hover-gold" style={{ color: TEXT_PRIMARY }}>
                                                {item.title}
                                            </Link>
                                        </h2>
                                        <p className="news-summary">{item.summary}</p>
                                        <div className="mt-3">
                                            <Link href={`/blog/${item.id}`} className="read-more-link">READ ANALYSIS <i className="bi bi-arrow-right-short"></i></Link>
                                        </div>
                                    </div>
                                    {item.image_url && (
                                        <div className="news-thumbnail flex-shrink-0">
                                            <Link href={`/blog/${item.id}`}><img src={item.image_url} alt="News" /></Link>
                                        </div>
                                    )}
                                </div>
                                {index < news.length - 1 && <div className="news-divider"></div>}
                            </div>
                           ))
                        )}

                        {totalPages > 1 && (
                            <div className="pagination-container d-flex justify-content-center align-items-center gap-3 mt-5 pt-4">
                                <button 
                                    className="btn-pagination" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                
                                <span className="page-indicator">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button 
                                    className="btn-pagination" 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>

      <style jsx global>{`
        .widgets-grid-horizontal { 
            display: flex; 
            flex-direction: row;
            justify-content: space-between; 
            align-items: center; 
            max-width: 1050px; 
            margin: 0 auto; 
            padding: 0; 
            gap: 4px; 
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .widgets-grid-horizontal::-webkit-scrollbar { display: none; }
        
        .widget-capsule { 
            flex: 1; 
            min-width: 0;
            height: auto;
            display: flex;
            justify-content: center;
        }
        
        .news-item-wrapper { margin-bottom: 25px; }
        .badge-category { font-size: 10px; font-weight: 700; color: ${GOLD_BASE}; text-transform: uppercase; letter-spacing: 1px; border: 1px solid rgba(252, 213, 53, 0.2); padding: 3px 8px; border-radius: 4px; }
        .text-date { font-size: 10px; color: ${TEXT_MUTED}; font-weight: 600; text-transform: uppercase; }
        .news-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 10px; line-height: 1.3; cursor: pointer; transition: color 0.2s; }
        .hover-gold:hover { color: ${GOLD_BASE} !important; }
        .news-summary { font-size: 15px; color: ${TEXT_MUTED}; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .read-more-link { font-size: 11px; color: ${GOLD_BASE}; text-decoration: none; font-weight: 700; text-transform: uppercase; }
        
        .news-thumbnail { 
            width: 180px; 
            height: 110px; 
            border-radius: 4px; 
            overflow: hidden; 
            border: 1px solid ${BORDER_COLOR}; 
        }
        .news-thumbnail img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        
        .live-dot { width: 6px; height: 6px; background-color: #F6465D; border-radius: 50%; margin-right: 12px; box-shadow: 0 0 8px rgba(246, 70, 93, 0.6); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        
        .news-divider { 
            height: 1px; 
            background: ${BORDER_COLOR}; 
            margin-top: 30px; 
            margin-bottom: 30px; 
            opacity: 0.4;
        }
        
        .btn-pagination {
            background: transparent;
            border: 1px solid ${BORDER_COLOR};
            color: ${TEXT_PRIMARY};
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            cursor: pointer;
        }
        .btn-pagination:hover:not(:disabled) {
            border-color: ${GOLD_BASE};
            color: ${GOLD_BASE};
            background: rgba(252, 213, 53, 0.05);
        }
        .btn-pagination:disabled { opacity: 0.3; cursor: not-allowed; }
        .page-indicator { font-size: 13px; color: ${TEXT_MUTED}; font-weight: 500; letter-spacing: 0.5px; }

        @media (max-width: 768px) {
            .widgets-grid-horizontal { 
                justify-content: space-between;
                padding: 0 6px;
                gap: 4px;
            }
            .widget-capsule { 
                flex: 1;
                min-width: 32%;
            }
            .news-card { flex-direction: column-reverse !important; }
            .news-thumbnail { width: 100%; height: 180px; margin-bottom: 15px; }
        }
      `}</style>
    </main>
  );
}
