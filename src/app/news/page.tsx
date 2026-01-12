'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MarketTicker from '@/components/MarketTicker';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';

// --- UNIFIED STYLES (MATCHING BLOG & NGX) ---
const BACKGROUND_DARK = '#1E1E1E';
const SURFACE_DARK = '#242424';
const BORDER_COLOR = '#2E2E2E';
const TEXT_PRIMARY = '#E0E0E0'; // أبيض (للعناوين)
const TEXT_MUTED = '#B0B0B0';   // رمادي (للنصوص)
const GOLD_BASE = '#F0C420';    // ذهبي (للأزرار واللمسات)

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA FROM SUPABASE
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news_posts')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false }); // الأحدث أولاً

        if (error) throw error;
        if (data) setNews(data);
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // TIME AGO HELPER
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
    <main style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '80px' }}>
      
      <MarketTicker />

      {/* HEADER WIDGETS (IDENTICAL TO NGX) */}
      <div className="header-wrapper shadow-sm border-bottom border-secondary d-none d-md-block" style={{ borderColor: '#333 !important', padding: '10px 0', backgroundColor: SURFACE_DARK }}>
        <div className="container-fluid p-0"> 
            <div className="widgets-grid-container">
                <div className="widget-item"> <NGXWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXCapWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXVolumeWidget theme="dark" /> </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="container pt-5">
        <div className="row justify-content-center">
            {/* MATCHING WIDTH (COL-LG-10) */}
            <div className="col-12 col-lg-10">
                
                {/* PAGE TITLE */}
                <div className="d-flex align-items-center mb-5 pb-2 border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                    <div className="live-dot"></div>
                    <h1 className="h5 fw-bold mb-0 text-white text-uppercase" style={{ letterSpacing: '2px', fontSize: '14px' }}>Global Market Wire</h1>
                </div>

                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center py-5 text-secondary">
                         <div className="spinner-border text-secondary mb-3" role="status"></div>
                         <span style={{fontSize:'12px', letterSpacing:'1px'}}>SYNCING FEED...</span>
                    </div>
                ) : (
                    <div className="news-feed">
                        {news.length === 0 ? (
                           <div className="text-center py-5 text-muted">No market updates available at the moment.</div>
                        ) : (
                           news.map((item, index) => (
                            <div key={item.id} className="news-item-wrapper">
                                <div className="news-card d-flex flex-column flex-md-row gap-4 align-items-start">
                                    
                                    {/* TEXT SIDE (Left) */}
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <span className="badge-category">{item.category}</span>
                                            <span className="text-date">{timeAgo(item.created_at)}</span>
                                        </div>
                                        
                                        {/* TITLE: WHITE & INTER FONT */}
                                        <h2 className="news-title">
                                            <Link href={`/blog/${item.id}`} className="text-decoration-none text-white hover-gold">
                                                {item.title}
                                            </Link>
                                        </h2>
                                        
                                        {/* SUMMARY: MUTED & READABLE */}
                                        <p className="news-summary">
                                            {item.summary}
                                        </p>

                                        <div className="mt-3">
                                            <Link href={`/blog/${item.id}`} className="read-more-link">
                                                READ ANALYSIS <i className="bi bi-arrow-right-short"></i>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* IMAGE SIDE (Right - US Standard) */}
                                    {item.image_url && (
                                        <div className="news-thumbnail flex-shrink-0">
                                            <Link href={`/blog/${item.id}`}>
                                                <img src={item.image_url} alt="News" />
                                            </Link>
                                        </div>
                                    )}

                                </div>
                                
                                {/* DIVIDER */}
                                {index < news.length - 1 && <div className="news-divider"></div>}
                            </div>
                           ))
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>

      <style jsx global>{`
        /* 1. Global Styles matching NGX */
        .widgets-grid-container { display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; max-width: 1050px; margin: 0 auto; padding: 0 15px; gap: 10px; }
        .widget-item { flex: 1; min-width: 0; }
        
        /* 2. News Typography */
        .news-item-wrapper { margin-bottom: 25px; }
        
        .badge-category { 
            font-size: 10px; 
            font-weight: 700; 
            color: ${GOLD_BASE}; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            border: 1px solid ${GOLD_BASE}44; 
            padding: 3px 8px; 
            border-radius: 4px; 
        }
        
        .text-date { font-size: 10px; color: #666; font-weight: 600; text-transform: uppercase; }
        
        .news-title { 
            font-family: "Inter", "Segoe UI", sans-serif; /* UNIFIED FONT */
            font-size: 1.4rem; 
            font-weight: 700; 
            margin-bottom: 10px; 
            line-height: 1.3; 
            letter-spacing: -0.5px;
            cursor: pointer;
            transition: color 0.2s;
        }
        .hover-gold:hover { color: ${GOLD_BASE} !important; }
        
        .news-summary { 
            font-family: "Inter", "Segoe UI", sans-serif; /* UNIFIED FONT */
            font-size: 15px; 
            color: ${TEXT_MUTED}; 
            line-height: 1.6; 
            margin-bottom: 0; 
            display: -webkit-box; 
            -webkit-line-clamp: 3; 
            -webkit-box-orient: vertical; 
            overflow: hidden; 
        }
        
        .read-more-link { font-size: 11px; color: ${GOLD_BASE}; text-decoration: none; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .read-more-link:hover { text-decoration: underline; filter: brightness(1.2); }

        /* 3. Image Styling */
        .news-thumbnail { width: 180px; height: 110px; border-radius: 4px; overflow: hidden; border: 1px solid #333; cursor: pointer; }
        .news-thumbnail img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .news-card:hover .news-thumbnail img { transform: scale(1.05); }

        /* 4. Live Dot Animation */
        .live-dot { width: 6px; height: 6px; background-color: #F6465D; border-radius: 50%; margin-right: 12px; box-shadow: 0 0 8px rgba(246, 70, 93, 0.6); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        .news-divider { height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 15%, rgba(255,255,255,0.1) 85%, transparent 100%); margin-top: 30px; margin-bottom: 30px; }
        
        /* Mobile */
        @media (max-width: 768px) {
            .news-card { flex-direction: column-reverse !important; }
            .news-thumbnail { width: 100%; height: 180px; margin-bottom: 15px; }
            .news-title { font-size: 1.25rem; }
            .widgets-grid-container { display: none !important; } /* Hide widgets on mobile news feed to save space/clean look if preferred, or remove this line to show */
        }
      `}</style>
    </main>
  );
}

