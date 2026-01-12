'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MarketTicker from '@/components/MarketTicker';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';

// --- VISUAL IDENTITY CONSTANTS ---
const BACKGROUND_DARK = '#13171F'; 
const SURFACE_DARK = '#1E232B';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.05)';
const GOLD_PRIMARY = '#F0C420';
const TEXT_MUTED = '#9CA3AF';

export default function BlogLibrary() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('news_posts')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setPosts(data);
      } catch (err) {
        console.error('Archive Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <main style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', fontFamily: '"Inter", sans-serif', paddingBottom: '80px' }}>
      
      <MarketTicker />

      {/* HEADER WIDGETS */}
      <div className="header-wrapper shadow-sm border-bottom border-secondary d-none d-md-block" style={{ borderColor: 'rgba(255,255,255,0.05) !important', padding: '10px 0', backgroundColor: '#0B0E11' }}>
        <div className="container-fluid p-0"> 
            <div className="widgets-grid-container">
                <div className="widget-item"> <NGXWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXCapWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXVolumeWidget theme="dark" /> </div>
            </div>
        </div>
      </div>

      <div className="container pt-5">
        
        {/* PAGE HEADER */}
        <div className="row mb-5">
            <div className="col-12 text-center">
                <h1 className="fw-bold text-white mb-2" style={{letterSpacing: '-1px', fontSize: '2.5rem'}}>NNM INTELLIGENCE</h1>
                <p style={{color: TEXT_MUTED, maxWidth: '600px', margin: '0 auto'}}>
                    The definitive archive of Digital Name Assets market analysis, infrastructure updates, and sovereign identity research.
                </p>
                <div className="mt-4 mx-auto" style={{width: '60px', height: '3px', background: GOLD_PRIMARY}}></div>
            </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
            <div className="d-flex flex-column justify-content-center align-items-center py-5">
                 <div className="spinner-border text-secondary mb-3" role="status"></div>
                 <span style={{fontSize:'12px', letterSpacing:'2px', color: '#666'}}>ACCESSING ARCHIVES...</span>
            </div>
        ) : (
            <>
                {/* POSTS GRID */}
                <div className="row g-4">
                    {posts.length === 0 ? (
                        <div className="col-12 text-center py-5 text-muted">No intelligence reports available.</div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="col-12 col-md-6 col-lg-4">
                                <Link href={`/blog/${post.id}`} className="text-decoration-none">
                                    <div className="archive-card h-100 d-flex flex-column">
                                        {/* Image */}
                                        <div className="card-image-wrapper">
                                            {post.image_url ? (
                                                <img src={post.image_url} alt={post.title} />
                                            ) : (
                                                <div className="no-image-placeholder"><i className="bi bi-file-text"></i></div>
                                            )}
                                            <div className="category-tag">{post.category}</div>
                                        </div>

                                        {/* Content */}
                                        <div className="card-content flex-grow-1">
                                            <div className="meta-info mb-2">
                                                <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <h3 className="card-title">{post.title}</h3>
                                            <p className="card-summary">
                                                {post.summary ? post.summary.substring(0, 120) + '...' : ''}
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className="card-footer-custom mt-auto">
                                            <span className="read-more">READ REPORT <i className="bi bi-arrow-right"></i></span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {/* BOTTOM CTA (GOLD INGOT) */}
                <div className="row mt-5 pt-5">
                    <div className="col-12 text-center">
                        <div className="cta-wrapper p-5 rounded-3" style={{backgroundColor: SURFACE_DARK, border: `1px solid ${BORDER_COLOR}`}}>
                            <h4 className="text-white mb-4" style={{fontFamily: 'serif'}}>Establish Your Sovereign Identity</h4>
                            
                            <Link href="/mint" className="ingot-btn">
                                <span className="ingot-shine"></span>
                                <span className="ingot-text">ACQUIRE ASSET</span>
                                <i className="bi bi-gem ms-2"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        )}

      </div>

      <style jsx global>{`
        /* Widgets */
        .widgets-grid-container { display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; max-width: 1050px; margin: 0 auto; padding: 0 15px; gap: 10px; }
        .widget-item { flex: 1; min-width: 0; }

        /* Archive Card Design */
        .archive-card {
            background-color: ${SURFACE_DARK};
            border: 1px solid ${BORDER_COLOR};
            border-radius: 4px;
            overflow: hidden;
            transition: all 0.3s ease;
            position: relative;
            top: 0;
        }

        .archive-card:hover {
            transform: translateY(-5px);
            border-color: ${GOLD_PRIMARY};
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .card-image-wrapper {
            height: 200px;
            overflow: hidden;
            position: relative;
            background-color: #000;
        }

        .card-image-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
            opacity: 0.8;
        }

        .archive-card:hover .card-image-wrapper img {
            transform: scale(1.05);
            opacity: 1;
        }

        .category-tag {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: ${GOLD_PRIMARY};
            padding: 4px 10px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            border-radius: 2px;
            border: 1px solid rgba(240, 196, 32, 0.3);
        }

        .card-content { padding: 20px; }
        
        .meta-info { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; }

        .card-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #E0E0E0;
            margin-bottom: 10px;
            line-height: 1.4;
            transition: color 0.2s;
        }

        .archive-card:hover .card-title { color: ${GOLD_PRIMARY}; }

        .card-summary {
            font-size: 14px;
            color: ${TEXT_MUTED};
            line-height: 1.6;
            margin-bottom: 0;
        }

        .card-footer-custom {
            padding: 15px 20px;
            border-top: 1px solid rgba(255,255,255,0.03);
            background: rgba(0,0,0,0.1);
        }

        .read-more {
            font-size: 11px;
            font-weight: 700;
            color: ${GOLD_PRIMARY};
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        /* --- THE GOLD INGOT BUTTON --- */
        .ingot-btn {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 14px 40px;
            font-family: "Cinzel", serif;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 2px;
            color: #241C04;
            text-decoration: none;
            overflow: hidden;
            border-radius: 2px;
            background: linear-gradient(180deg, #FFD700 0%, #FDB931 45%, #D4AF37 55%, #CBA135 100%);
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4);
            transition: all 0.3s ease;
            border: 1px solid #B8860B;
        }

        .ingot-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4);
            filter: brightness(1.1);
        }

        .ingot-shine {
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0) 100%);
            transform: skewX(-25deg);
            animation: shine 4s infinite;
        }

        @keyframes shine {
            0% { left: -100%; }
            20% { left: 200%; }
            100% { left: 200%; }
        }

        @media (max-width: 768px) {
            .widgets-grid-container { display: none !important; }
            .card-image-wrapper { height: 160px; }
        }
      `}</style>
    </main>
  );
}
