'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MarketTicker from '@/components/MarketTicker';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';

// --- STYLES ---
const BACKGROUND_DARK = '#1E1E1E';
const SURFACE_DARK = '#242424';
const GOLD_BASE = '#F0C420';
const TEXT_MUTED = '#B0B0B0';

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب الأخبار من Supabase
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news_posts')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

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

  // دالة لحساب الوقت المنقضي (Time Ago)
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

      {/* HEADER WIDGETS */}
      <div className="header-wrapper shadow-sm border-bottom border-secondary" style={{ borderColor: '#333 !important', padding: '10px 0', backgroundColor: SURFACE_DARK }}>
        <div className="container-fluid p-0"> 
            <div className="widgets-grid-container">
                <div className="widget-item"> <NGXWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXCapWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXVolumeWidget theme="dark" /> </div>
            </div>
        </div>
      </div>

      {/* NEWS FEED */}
      <div className="container pt-5">
        <div className="row justify-content-center">
            <div className="col-12 col-lg-9">
                
                <div className="d-flex align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: '#2E2E2E' }}>
                    <div className="live-dot"></div>
                    <h1 className="h5 fw-bold mb-0 text-white text-uppercase" style={{ letterSpacing: '1px' }}>Market Wire</h1>
                </div>

                {loading ? (
                    <div className="text-center py-5 text-secondary">Loading Intelligence...</div>
                ) : (
                    <div className="news-feed">
                        {news.map((item, index) => (
                            <div key={item.id} className="news-item-wrapper">
                                <div className="news-card d-flex flex-column flex-md-row gap-4 align-items-start">
                                    
                                    {/* TEXT SIDE */}
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <span className="badge-category">{item.category}</span>
                                            <span className="text-date">{timeAgo(item.created_at)}</span>
                                        </div>
                                        
                                        <h2 className="news-title">
                                            <Link href={`/blog/${item.id}`} className="text-decoration-none text-white hover-gold">
                                                {item.title}
                                            </Link>
                                        </h2>
                                        
                                        <p className="news-summary">
                                            {item.summary}
                                        </p>

                                        <div className="mt-3">
                                            <Link href={`/blog/${item.id}`} className="read-more-link">
                                                Read Analysis <i className="bi bi-arrow-right-short"></i>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* IMAGE SIDE */}
                                    {item.image_url && (
                                        <div className="news-thumbnail flex-shrink-0">
                                            <img src={item.image_url} alt="News" />
                                        </div>
                                    )}

                                </div>
                                
                                {index < news.length - 1 && <div className="news-divider"></div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      <style jsx global>{`
        .widgets-grid-container { display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; max-width: 1050px; margin: 0 auto; padding: 0 15px; gap: 10px; }
        .widget-item { flex: 1; min-width: 0; }
        @media (max-width: 768px) { .widgets-grid-container { gap: 5px; padding: 0 5px; overflow-x: auto; } .widget-item { min-width: 280px; } }

        .badge-category { font-size: 10px; font-weight: 700; color: ${GOLD_BASE}; text-transform: uppercase; letter-spacing: 1px; border: 1px solid rgba(240, 196, 32, 0.3); padding: 2px 6px; border-radius: 4px; }
        .text-date { font-size: 10px; color: #666; font-weight: 600; text-transform: uppercase; }
        .news-title { font-family: 'Inter', sans-serif; font-size: 1.25rem; font-weight: 700; margin-bottom: 10px; line-height: 1.3; }
        .hover-gold:hover { color: ${GOLD_BASE} !important; }
        .news-summary { font-family: 'Segoe UI', sans-serif; font-size: 0.95rem; color: ${TEXT_MUTED}; line-height: 1.6; margin-bottom: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .read-more-link { font-size: 12px; color: ${GOLD_BASE}; text-decoration: none; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .read-more-link:hover { text-decoration: underline; }

        .news-thumbnail { width: 160px; height: 100px; border-radius: 6px; overflow: hidden; border: 1px solid #333; }
        .news-thumbnail img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
        .news-card:hover .news-thumbnail img { transform: scale(1.05); }

        .live-dot { width: 8px; height: 8px; background-color: red; border-radius: 50%; margin-right: 10px; box-shadow: 0 0 10px red; }
        .news-divider { height: 1px; background: linear-gradient(90deg, transparent 0%, #333 15%, #333 85%, transparent 100%); margin-top: 25px; margin-bottom: 25px; }
        
        @media (max-width: 768px) {
            .news-card { flex-direction: column-reverse !important; }
            .news-thumbnail { width: 100%; height: 180px; margin-bottom: 15px; }
        }
      `}</style>
    </main>
  );
}
