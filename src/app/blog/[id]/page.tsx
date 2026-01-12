'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MarketTicker from '@/components/MarketTicker';

// --- COLORS MATCHING NNM CONCEPT ---
const BACKGROUND_MAIN = '#1E1E1E';
const TEXT_OFF_WHITE = '#E0E0E0';
const TEXT_BODY = '#B0B0B0';
const GOLD_BASE = '#F0C420';
const GOLD_MEDIUM = '#FDB931';

export default function BlogPost() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
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

  // --- LOADING STATE ---
  if (loading) return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{backgroundColor: BACKGROUND_MAIN, minHeight:'100vh', color: TEXT_BODY}}>
          <div className="spinner-border text-secondary mb-3" role="status"></div>
          <span style={{fontSize:'12px', letterSpacing:'2px', fontFamily: 'monospace'}}>RETRIEVING INTEL...</span>
      </div>
  );
  
  // --- ERROR STATE ---
  if (!post) return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center px-3" style={{backgroundColor: BACKGROUND_MAIN, minHeight:'100vh'}}>
          <h2 className="fw-bold mb-2 text-white font-imperium">ASSET NOT FOUND</h2>
          <p style={{color: TEXT_BODY}}>The requested report is unavailable.</p>
          <Link href="/blog" className="text-decoration-none mt-4" style={{color: GOLD_BASE}}>RETURN TO ARCHIVE</Link>
      </div>
  );

  return (
    <main style={{ backgroundColor: BACKGROUND_MAIN, minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '100px' }}>
      
      {/* --- GLOBAL STYLES --- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');
        
        .font-imperium { font-family: 'Cinzel', serif; }
        
        /* INGOT BUTTON STYLE (EXACT REPLICA) */
        .btn-ingot {
            background: linear-gradient(180deg, #E6C76A 0%, #D4AF37 40%, #B8962E 100%);
            border: 1px solid #B8962E;
            color: #2b1d00;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            letter-spacing: 1px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3), 0 0 15px rgba(212, 175, 55, 0.1);
            text-shadow: 0 1px 0 rgba(255,255,255,0.4);
            transition: filter 0.3s ease, transform 0.2s ease;
            padding: 12px 30px; 
            font-size: 1rem;
            white-space: nowrap;
            text-decoration: none;
            display: inline-block;
            border-radius: 2px;
        }
        .btn-ingot:hover {
            filter: brightness(1.08);
            transform: translateY(-1px);
            color: #1a1100;
        }

        /* ARTICLE CONTENT STYLES */
        .article-content {
            color: ${TEXT_BODY};
            font-size: 1.1rem;
            line-height: 1.8;
        }
        .article-content h2, .article-content h3 {
            color: ${TEXT_OFF_WHITE};
            font-family: 'Cinzel', serif;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            letter-spacing: -0.5px;
        }
        .article-content p {
            margin-bottom: 1.5rem;
        }
        .article-content strong {
            color: ${TEXT_OFF_WHITE};
        }
        .article-content ul, .article-content ol {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
        }
        .article-content li {
            margin-bottom: 0.5rem;
        }

        /* NOTE BOX (Matching Concept Page) */
        .note-box {
          background-color: rgba(240, 196, 32, 0.05);
          border-left: 3px solid ${GOLD_BASE};
          border-top: 1px solid rgba(240, 196, 32, 0.18);
          border-right: 1px solid rgba(240, 196, 32, 0.12);
          border-bottom: 1px solid rgba(240, 196, 32, 0.12);
          padding: 20px;
          font-size: 15px;
          color: ${TEXT_BODY};
          border-radius: 0 4px 4px 0;
          margin-top: 40px;
          line-height: 1.6;
        }
      `}</style>

      <MarketTicker />

      <div className="container pt-5">
        <div className="row justify-content-center">
            {/* Main Content Column (Left Aligned) */}
            <div className="col-12 col-lg-8 text-start"> 
                
                {/* 1. BACK LINK */}
                <div className="mb-4">
                    <Link href="/blog" className="text-decoration-none d-inline-flex align-items-center gap-2" style={{color: TEXT_BODY, fontSize:'12px', fontWeight:'600', letterSpacing:'1px', transition: 'color 0.2s'}}>
                        <i className="bi bi-arrow-left"></i> RETURN TO ARCHIVE
                    </Link>
                </div>

                {/* 2. HEADER SECTION */}
                <header className="mb-5 border-bottom border-secondary pb-4" style={{borderColor: 'rgba(255,255,255,0.1) !important'}}>
                    {/* Category Tag */}
                    <span className="d-inline-block mb-3" style={{color: GOLD_BASE, border: `1px solid rgba(240, 196, 32, 0.3)`, padding: '4px 10px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase'}}>
                        {post.category}
                    </span>
                    
                    {/* Title (Cinzel) */}
                    <h1 className="display-5 fw-bold mb-3 font-imperium" style={{color: TEXT_OFF_WHITE, lineHeight: '1.2'}}>
                        {post.title}
                    </h1>
                    
                    {/* Meta Info */}
                    <div className="d-flex align-items-center text-start">
                         <div style={{color: TEXT_BODY, fontSize: '13px'}}>
                            <span className="text-white fw-bold">NNM Editorial Desk</span>
                            <span className="mx-2 opacity-50">|</span>
                            {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* 3. COVER IMAGE */}
                {post.image_url && (
                    <div className="w-100 rounded-2 mb-5 overflow-hidden shadow-sm" style={{border: '1px solid #2E2E2E'}}>
                         <img src={post.image_url} alt="Cover" style={{width:'100%', height:'auto', display:'block'}} />
                    </div>
                )}

                {/* 4. FULL ARTICLE CONTENT */}
                <article className="article-content text-start">
                    <div dangerouslySetInnerHTML={{ __html: post.content ? post.content.replace(/\n/g, '<br/>') : '' }} />
                </article>

                {/* 5. DISCLAIMER BOX */}
                <div className="note-box text-start">
                   <span className="fw-bold" style={{color: TEXT_OFF_WHITE}}>Disclaimer:</span> This content is for informational purposes only. "Digital Name Assets" are a sovereign asset class on the Polygon network. Invest responsibly.
                </div>

                {/* 6. CTA (GOLD INGOT BUTTON) */}
                <div className="mt-5 pt-4 pb-5 text-start">
                    <h4 className="mb-3 font-imperium" style={{color: TEXT_OFF_WHITE, fontSize: '1.4rem'}}>Ready to claim your legacy?</h4>
                    <p className="text-secondary mb-4" style={{fontSize: '14px'}}>Secure your unique Digital Name Asset before the registry closes.</p>
                    
                    <Link href="/mint" className="btn-ingot rounded-1">
                        ACCESS REGISTRY
                    </Link>
                </div>

            </div>
        </div>
      </div>
    </main>
  );
}
