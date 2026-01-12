'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MarketTicker from '@/components/MarketTicker';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';

// --- SYSTEM DESIGN CONSTANTS ---
const BACKGROUND_DARK = '#13171F'; // نفس لون النافبار الجديد (Dark Navy Black)
const SURFACE_DARK = '#1E232B';
const TEXT_PRIMARY = '#E0E0E0';
const TEXT_MUTED = '#9CA3AF';
const GOLD_PRIMARY = '#F0C420';

export default function BlogPost() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      // حماية من الخطأ إذا لم يكن هناك ID
      if (!params?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('news_posts')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        if (data) setPost(data);
      } catch (err) {
        console.error('System Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  // 1. LOADING STATE (ENGLISH & PROFESSIONAL)
  if (loading) return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{backgroundColor: BACKGROUND_DARK, minHeight:'100vh', color: TEXT_MUTED}}>
          <div className="spinner-border text-warning mb-3" role="status" style={{width: '2rem', height: '2rem', borderWidth: '2px'}}></div>
          <span style={{fontSize:'12px', letterSpacing:'2px', fontFamily: 'monospace'}}>ESTABLISHING SECURE CONNECTION...</span>
      </div>
  );
  
  // 2. ERROR STATE / NOT FOUND (ENGLISH)
  if (!post) return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center px-3" style={{backgroundColor: BACKGROUND_DARK, minHeight:'100vh'}}>
          <div style={{fontSize: '40px', color: '#333', marginBottom: '20px'}}><i className="bi bi-shield-lock"></i></div>
          <h2 className="fw-bold mb-2 text-white" style={{fontFamily: 'sans-serif', letterSpacing: '1px'}}>ASSET NOT FOUND</h2>
          <p style={{color: TEXT_MUTED, maxWidth:'400px', fontSize: '14px'}}>The requested intelligence report could not be retrieved from the NNM Registry.</p>
          <Link href="/news" className="btn btn-outline-light btn-sm mt-4 px-4 py-2" style={{letterSpacing: '1px', fontSize: '11px'}}>RETURN TO WIRE</Link>
      </div>
  );

  return (
    <main style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', fontFamily: '"Inter", sans-serif', paddingBottom: '100px' }}>
      
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

      {/* ARTICLE CONTENT */}
      <div className="container pt-5">
        <div className="row justify-content-center">
            <div className="col-12 col-lg-9">
                
                {/* BACK NAVIGATION */}
                <div className="mb-4">
                    <Link href="/news" className="text-decoration-none d-inline-flex align-items-center gap-2 back-link">
                        <i className="bi bi-arrow-left"></i>
                        <span>BACK TO WIRE</span>
                    </Link>
                </div>

                {/* ARTICLE HEADER */}
                <header className="mb-5">
                    <span className="category-badge mb-3 d-inline-block">{post.category}</span>
                    
                    <h1 className="display-5 fw-bold mb-4 text-white article-title">
                        {post.title}
                    </h1>
                    
                    <div className="d-flex align-items-center border-bottom border-secondary pb-4" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                        <div className="author-avatar me-3">
                            <i className="bi bi-pencil-fill"></i>
                        </div>
                        <div>
                            <div className="text-white fw-bold" style={{fontSize: '13px'}}>NNM Editorial Desk</div>
                            <div style={{color: TEXT_MUTED, fontSize: '12px'}}>
                                {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </header>

                {/* COVER IMAGE */}
                {post.image_url && (
                    <div className="w-100 rounded-1 mb-5 article-cover shadow-lg" 
                         style={{ backgroundImage: `url(${post.image_url})` }}>
                    </div>
                )}

                {/* CONTENT BODY */}
                <article className="article-body">
                    <div dangerouslySetInnerHTML={{ __html: post.content ? post.content.replace(/\n/g, '<br/>') : '' }} />
                </article>

                {/* DISCLAIMER */}
                <div className="mt-5 pt-4 border-top border-secondary" style={{borderColor: 'rgba(255,255,255,0.1) !important'}}>
                    <p className="fst-italic" style={{ fontSize: '12px', lineHeight: '1.6', color: '#555' }}>
                        <strong>Disclaimer:</strong> This content is for informational purposes only. "Digital Name Assets" are a sovereign asset class on the Polygon network. Invest responsibly.
                    </p>
                </div>

                {/* --- THE GOLD INGOT CTA (BUTTON) --- */}
                <div className="mt-5 pt-3 pb-5 text-center">
                    <h4 className="text-white mb-3" style={{fontFamily: 'serif', letterSpacing: '1px', fontSize: '18px'}}>Ready to claim your legacy?</h4>
                    
                    <Link href="/mint" className="ingot-btn">
                        <span className="ingot-shine"></span>
                        <span className="ingot-text">ACCESS REGISTRY</span>
                        <i className="bi bi-gem ms-2"></i>
                    </Link>
                </div>

            </div>
        </div>
      </div>

      <style jsx global>{`
        /* 1. Widgets Grid */
        .widgets-grid-container { display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; max-width: 1050px; margin: 0 auto; padding: 0 15px; gap: 10px; }
        .widget-item { flex: 1; min-width: 0; }
        
        /* 2. Article Styles */
        .back-link { font-size: 11px; color: ${TEXT_MUTED}; font-weight: 700; letter-spacing: 1px; transition: 0.2s; }
        .back-link:hover { color: ${GOLD_PRIMARY}; transform: translateX(-3px); }

        .category-badge { 
            font-size: 10px; 
            color: ${GOLD_PRIMARY}; 
            border: 1px solid rgba(240, 196, 32, 0.3); 
            padding: 4px 10px; 
            font-weight: 700; 
            letter-spacing: 1px;
            background: rgba(240, 196, 32, 0.05);
        }

        .article-title { 
            font-family: "Inter", sans-serif;
            letter-spacing: -1px;
            line-height: 1.25;
        }

        .author-avatar {
            width: 36px; height: 36px;
            background: linear-gradient(135deg, #333 0%, #111 100%);
            border: 1px solid #444;
            color: ${GOLD_PRIMARY};
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 14px;
        }

        .article-cover { 
            height: 400px; 
            background-size: cover; 
            background-position: center; 
            border: 1px solid rgba(255,255,255,0.05);
        }

        .article-body { 
            font-family: "Georgia", "Times New Roman", serif; /* Serif for reading comfort */
            font-size: 18px; 
            line-height: 1.8; 
            color: #C0C0C0; 
        }

        /* 3. THE GOLD INGOT BUTTON (SOPHISTICATED) */
        .ingot-btn {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 16px 50px;
            font-family: "Cinzel", serif; /* Or sans-serif if you prefer, but serif looks regal */
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 2px;
            color: #241C04; /* Dark gold/brown text */
            text-decoration: none;
            overflow: hidden;
            border-radius: 2px; /* Slightly sharp edges like an ingot */
            
            /* The Gold Gradient */
            background: linear-gradient(
                180deg, 
                #FFD700 0%, 
                #FDB931 45%, 
                #D4AF37 55%, 
                #CBA135 100%
            );
            
            /* Gold Shadow/Glow */
            box-shadow: 
                0 4px 15px rgba(212, 175, 55, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.4),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1);
                
            transition: all 0.3s ease;
            border: 1px solid #B8860B;
        }

        .ingot-btn:hover {
            transform: translateY(-2px);
            box-shadow: 
                0 8px 25px rgba(212, 175, 55, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.4);
            filter: brightness(1.1);
        }

        /* Shine Effect animation */
        .ingot-shine {
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(
                to right,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.6) 50%,
                rgba(255, 255, 255, 0) 100%
            );
            transform: skewX(-25deg);
            animation: shine 4s infinite;
        }

        @keyframes shine {
            0% { left: -100%; }
            20% { left: 200%; }
            100% { left: 200%; }
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
            .article-cover { height: 220px; }
            .article-title { font-size: 28px; }
            .article-body { font-size: 16px; }
            .ingot-btn { width: 100%; padding: 14px 0; }
        }
      `}</style>
    </main>
  );
}
