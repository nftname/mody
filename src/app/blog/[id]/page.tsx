'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // هذا هو المفتاح لاستلام الـ ID
import { supabase } from '@/lib/supabase';
import MarketTicker from '@/components/MarketTicker';
import NGXWidget from '@/components/NGXWidget';
import NGXCapWidget from '@/components/NGXCapWidget';
import NGXVolumeWidget from '@/components/NGXVolumeWidget';

// --- STYLES & CONSTANTS ---
const BACKGROUND_DARK = '#1E1E1E';
const SURFACE_DARK = '#242424';
const TEXT_PRIMARY = '#E0E0E0';
const TEXT_MUTED = '#B0B0B0';
const GOLD_BASE = '#F0C420';

export default function BlogPost() {
  const params = useParams(); // استقبال رقم المقال من الرابط
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      // حماية: التأكد من وجود ID
      if (!params?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('news_posts')
          .select('*')
          .eq('id', params.id)
          .single(); // جلب مقال واحد فقط

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

  // حالات التحميل والخطأ
  if (loading) return (
      <div style={{backgroundColor: BACKGROUND_DARK, minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', color:'#666'}}>
          <div className="spinner-border text-warning mb-3" role="status"></div>
          <span style={{color: GOLD_BASE, fontSize:'14px', letterSpacing:'1px'}}>RETRIEVING ARCHIVE...</span>
      </div>
  );
  
  if (!post) return (
      <div style={{backgroundColor: BACKGROUND_DARK, minHeight:'100vh', padding:'50px', textAlign:'center', color:'white'}}>
          <h2 style={{fontFamily:'Cinzel, serif', color: GOLD_BASE}}>404 - RECORD NOT FOUND</h2>
          <p className="text-muted mt-3">The requested asset record does not exist in the registry.</p>
          <Link href="/news" className="btn btn-outline-light mt-3 btn-sm">RETURN TO NEWS WIRE</Link>
      </div>
  );

  return (
    <main style={{ backgroundColor: BACKGROUND_DARK, minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '80px' }}>
      
      <MarketTicker />

      {/* HEADER WIDGETS (Consistent UI) */}
      <div className="header-wrapper shadow-sm border-bottom border-secondary d-none d-md-block" style={{ borderColor: '#333 !important', padding: '10px 0', backgroundColor: SURFACE_DARK }}>
        <div className="container-fluid p-0"> 
            <div className="widgets-grid-container">
                <div className="widget-item"> <NGXWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXCapWidget theme="dark" /> </div>
                <div className="widget-item"> <NGXVolumeWidget theme="dark" /> </div>
            </div>
        </div>
      </div>

      <div className="container pt-5">
        <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
                
                {/* ARTICLE HEADER */}
                <header className="mb-4 text-center text-md-start">
                    <div className="d-flex gap-2 mb-3 justify-content-center justify-content-md-start">
                        <Link href="/news" style={{textDecoration:'none'}}>
                            <span className="tag-pill hover-glow"><i className="bi bi-arrow-left me-1"></i> BACK</span>
                        </Link>
                        <span className="tag-pill" style={{borderColor: GOLD_BASE, color: GOLD_BASE}}>{post.category}</span>
                    </div>
                    
                    <h1 className="display-5 fw-bold mb-4 article-title">
                        {post.title}
                    </h1>
                    
                    <div className="author-badge justify-content-center justify-content-md-start">
                        <div className="icon-circle">
                            <i className="bi bi-pen-fill" style={{ color: GOLD_BASE, fontSize: '14px' }}></i>
                        </div>
                        <div>
                            <div className="fw-bold text-white" style={{fontSize: '14px'}}>NNM Editorial Board</div>
                            <div style={{ fontSize: '11px', color: '#888' }}>
                                {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </header>

                {/* COVER IMAGE */}
                {post.image_url && (
                    <div className="w-100 rounded-3 mb-5 article-cover shadow-lg" 
                         style={{ backgroundImage: `url(${post.image_url})` }}>
                         <div className="cover-overlay"></div>
                    </div>
                )}

                {/* CONTENT BODY */}
                <article className="article-body">
                    {/* يستخدم dangerouslySetInnerHTML لعرض تنسيقات النص المحفوظة في الداتا بيز */}
                    <div dangerouslySetInnerHTML={{ __html: post.content ? post.content.replace(/\n/g, '<br/>') : '' }} />
                </article>

                {/* SIGNATURE / DISCLAIMER */}
                <div className="mt-5 pt-4 border-top border-secondary border-opacity-25">
                    <p className="fst-italic text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <strong style={{color: GOLD_BASE}}>Disclosure:</strong> This article was published by the NNM Research Desk. The content is for informational purposes only and does not constitute financial advice. Digital Name Assets are a sovereign asset class on the Polygon network.
                    </p>
                </div>

                {/* CTA BOX */}
                <div className="mt-5 p-5 rounded-3 text-center cta-box position-relative overflow-hidden">
                    <div className="cta-glow"></div>
                    <h4 className="text-white mb-2 position-relative" style={{fontFamily: 'Cinzel, serif'}}>Secure Your Digital Legacy</h4>
                    <p className="text-muted mb-4 position-relative" style={{fontSize:'14px'}}>The registry is open. Claim your Gen-0 name before the window closes.</p>
                    <Link href="/mint" className="btn btn-gold mt-2 position-relative">
                        ACCESS REGISTRY
                    </Link>
                </div>

            </div>
        </div>
      </div>

      <style jsx global>{`
        /* Widgets Grid */
        .widgets-grid-container { display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; max-width: 1050px; margin: 0 auto; padding: 0 15px; gap: 10px; }
        .widget-item { flex: 1; min-width: 0; }
        
        /* Typography */
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Cinzel:wght@700&display=swap');
        
        .article-title { color: ${TEXT_PRIMARY}; font-family: 'Inter', sans-serif; letter-spacing: -1px; line-height: 1.2; }
        .article-body { font-family: 'Merriweather', serif; font-size: 1.15rem; line-height: 2; color: #C8C8C8; }
        
        /* Dropcap effect for first letter of content (Optional styling via CSS if content allows) */
        
        /* Cover Image */
        .article-cover { height: 400px; background-size: cover; background-position: center; position: relative; border: 1px solid #333; overflow: hidden; }
        .cover-overlay { position: absolute; bottom: 0; left: 0; width: 100%; height: 50%; background: linear-gradient(to top, #1E1E1E 0%, transparent 100%); }

        /* Badges & Tags */
        .tag-pill { background: rgba(255,255,255,0.05); padding: 6px 14px; border-radius: 30px; font-size: 0.7rem; letter-spacing: 1px; text-transform: uppercase; color: #888; border: 1px solid #444; cursor: pointer; transition: all 0.3s; }
        .hover-glow:hover { border-color: ${GOLD_BASE}; color: ${GOLD_BASE}; }
        
        .author-badge { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; border-bottom: 1px solid #333; padding-bottom: 2rem; }
        .icon-circle { width: 36px; height: 36px; background: #2A2A2A; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #333; }
        
        /* CTA Box */
        .cta-box { background-color: #242424; border: 1px solid #333; }
        .cta-glow { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(240,196,32,0.05) 0%, transparent 60%); pointer-events: none; }
        .btn-gold { background: linear-gradient(to bottom, #FCD535 0%, #B3882A 100%); border: none; color: #000; font-family: 'Cinzel', serif; font-weight: 700; padding: 12px 35px; letter-spacing: 1px; transition: transform 0.2s; }
        .btn-gold:hover { transform: scale(1.03); filter: brightness(1.1); }

        @media (max-width: 768px) {
            .article-cover { height: 250px; }
            .article-title { font-size: 2rem; }
            .article-body { font-size: 1rem; line-height: 1.8; }
        }
      `}</style>
    </main>
  );
}
