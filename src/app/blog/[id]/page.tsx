'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MarketTicker from '@/components/MarketTicker';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';

// --- CONSTANTS MATCHING NGX STYLE ---
const BACKGROUND_DARK = '#1E1E1E';
const SURFACE_DARK = '#242424'; 
const BORDER_COLOR = '#2E2E2E';
const TEXT_PRIMARY = '#E0E0E0'; // أبيض (للعناوين)
const TEXT_MUTED = '#B0B0B0';   // رمادي (للنصوص)
const GOLD_BASE = '#F0C420';    // ذهبي (للأزرار واللمسات فقط)

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
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params.id]);

  // LOADING STATE
  if (loading) return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{backgroundColor: BACKGROUND_DARK, minHeight:'100vh', color: TEXT_MUTED}}>
          <div className="spinner-border text-secondary mb-3" role="status"></div>
          <span style={{fontSize:'12px', letterSpacing:'1px'}}>LOADING DATA...</span>
      </div>
  );
  
  // NOT FOUND STATE
  if (!post) return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{backgroundColor: BACKGROUND_DARK, minHeight:'100vh', padding:'20px'}}>
          <h2 className="fw-bold mb-3" style={{color: TEXT_PRIMARY}}>ARTICLE NOT FOUND</h2>
          <p style={{color: TEXT_MUTED, maxWidth:'500px'}}>The requested article could not be retrieved from the database.</p>
          <Link href="/news" className="btn btn-outline-light btn-sm mt-3 px-4">RETURN TO NEWS</Link>
      </div>
  );

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
            {/* CHANGED COL-LG-8 TO COL-LG-10 (80% WIDTH) */}
            <div className="col-12 col-lg-10">
                
                {/* 1. ARTICLE HEADER */}
                <header className="mb-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <Link href="/news" className="text-decoration-none">
                            <span className="back-link"><i className="bi bi-arrow-left me-1"></i> BACK</span>
                        </Link>
                        <span className="category-badge">{post.category}</span>
                    </div>
                    
                    {/* H1: WHITE, REDUCED SIZE (calc 1.4rem + 1vw instead of huge display fonts) */}
                    <h1 className="fw-bold mb-3 article-title">
                        {post.title}
                    </h1>
                    
                    <div className="d-flex align-items-center border-bottom border-secondary pb-4 mb-4" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                        <div className="me-2" style={{color: GOLD_BASE}}><i className="bi bi-person-circle"></i></div>
                        <div className="text-white fw-bold me-3" style={{fontSize: '13px'}}>NNM Research</div>
                        <div style={{color: '#666', fontSize: '13px'}}>|</div>
                        <div className="ms-3" style={{color: TEXT_MUTED, fontSize: '13px'}}>
                            {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* 2. COVER IMAGE */}
                {post.image_url && (
                    <div className="w-100 rounded-2 mb-5 article-cover" 
                         style={{ backgroundImage: `url(${post.image_url})` }}>
                    </div>
                )}

                {/* 3. CONTENT BODY */}
                <article className="article-body">
                    {/* يستخدم dangerouslySetInnerHTML لعرض النص القادم من الداتا بيز */}
                    <div dangerouslySetInnerHTML={{ __html: post.content ? post.content.replace(/\n/g, '<br/>') : '' }} />
                </article>

                {/* 4. DISCLAIMER (Standardized) */}
                <div className="mt-5 pt-4 border-top border-secondary" style={{borderColor: 'rgba(255,255,255,0.1) !important'}}>
                    <p className="fst-italic" style={{ fontSize: '12px', lineHeight: '1.5', color: '#666' }}>
                        <strong style={{color: TEXT_MUTED}}>Disclaimer:</strong> The content of this article is for educational purposes only. NNM Protocol does not provide financial advice. "Digital Name Assets" are a speculative asset class.
                    </p>
                </div>

                {/* 5. CTA SECTION (Standardized to Surface Dark) */}
                <div className="mt-5 p-4 rounded-2 text-center" style={{ backgroundColor: SURFACE_DARK, border: `1px solid ${BORDER_COLOR}` }}>
                    <h4 className="text-white mb-2 fw-bold" style={{ fontSize: '18px' }}>Secure Your Legacy</h4>
                    <p className="mb-3" style={{ color: TEXT_MUTED, fontSize: '14px' }}>The registry is open for Gen-0 minting.</p>
                    <Link href="/mint" className="btn btn-gold">
                        ACCESS REGISTRY
                    </Link>
                </div>

            </div>
        </div>
      </div>

      <style jsx global>{`
        /* 1. Global Styles matching NGX */
        .widgets-grid-container { display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; max-width: 1050px; margin: 0 auto; padding: 0 15px; gap: 10px; }
        .widget-item { flex: 1; min-width: 0; }
        
        /* 2. Article Typography (Matches NGX Font Family) */
        .article-title { 
            color: ${TEXT_PRIMARY}; 
            font-family: "Inter", "Segoe UI", sans-serif;
            font-size: 2rem; /* Reduced from Display-5 */
            line-height: 1.3;
            letter-spacing: -0.5px;
        }
        
        .article-body { 
            font-family: "Inter", "Segoe UI", sans-serif; /* UNIFIED FONT */
            font-size: 16px; /* Standard readable size */
            line-height: 1.8; /* Comfortable spacing */
            color: ${TEXT_MUTED};
            text-align: left;
        }
        
        /* Paragraph spacing within article */
        .article-body br { content: ""; display: block; margin-bottom: 10px; }

        /* 3. Components */
        .article-cover { 
            height: 380px; 
            background-size: cover; 
            background-position: center; 
            border: 1px solid ${BORDER_COLOR};
            opacity: 0.9;
        }
        
        .back-link { font-size: 12px; color: ${TEXT_MUTED}; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .back-link:hover { color: ${TEXT_PRIMARY}; }

        .category-badge { 
            font-size: 10px; 
            color: ${GOLD_BASE}; 
            border: 1px solid ${GOLD_BASE}44; 
            padding: 3px 8px; 
            border-radius: 4px; 
            font-weight: 700; 
            letter-spacing: 0.5px;
        }

        .btn-gold { 
            background: linear-gradient(180deg, #FCD535 0%, #B3882A 100%); 
            border: none; 
            color: #000; 
            font-weight: 700; 
            padding: 10px 30px; 
            font-size: 14px;
            letter-spacing: 0.5px;
        }
        .btn-gold:hover { filter: brightness(1.1); transform: translateY(-1px); }

        /* Mobile */
        @media (max-width: 768px) {
            .article-title { font-size: 1.6rem; }
            .article-cover { height: 200px; }
        }
      `}</style>
    </main>
  );
}
