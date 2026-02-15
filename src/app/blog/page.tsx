'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MarketTicker from '@/components/MarketTicker';

const BACKGROUND_MAIN = '#181A20';
const CARD_BG = '#1E2329';
const CARD_BORDER = '#2B3139';
const TEXT_OFF_WHITE = '#EAECEF'; 
const TEXT_BODY = '#848E9C';      
const GOLD_BASE = '#FCD535';      
const GOLD_MEDIUM = '#FCD535';    

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
        console.error('Error fetching archives:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <main style={{ backgroundColor: BACKGROUND_MAIN, minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '0px' }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');
        
        .font-imperium { font-family: 'Cinzel', serif; }
        
        .btn-ingot {
            background: linear-gradient(180deg, #FFF5CC 0%, #FCD535 40%, #B3882A 100%);
            border: 1px solid #B3882A;
            color: #2b1d00;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3), 0 0 15px rgba(252, 213, 53, 0.1);
            text-shadow: 0 1px 0 rgba(255,255,255,0.4);
            transition: filter 0.3s ease, transform 0.2s ease;
            width: 50%;
            margin: 0 auto;
            display: block;
            text-align: center;
            padding: 14px 10px;
            font-size: 0.85rem;
            white-space: normal;
            line-height: 1.2;
            text-decoration: none;
            border-radius: 2px;
        }
        .btn-ingot:hover {
            filter: brightness(1.08);
            transform: translateY(-1px);
            color: #1a1100;
        }

        .archive-card {
            background-color: ${CARD_BG};
            border: 1px solid ${CARD_BORDER};
            border-radius: 8px;
            transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .archive-card:hover {
            transform: translateY(-5px);
            border-color: #444;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        
        .card-img-wrapper {
            height: 200px;
            overflow: hidden;
            border-bottom: 1px solid ${CARD_BORDER};
            position: relative;
        }
        
        .card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
            opacity: 0.8;
        }
        
        .archive-card:hover .card-img {
            transform: scale(1.05);
            opacity: 1;
        }

        .text-gold { color: ${GOLD_BASE} !important; }
        .text-off-white { color: ${TEXT_OFF_WHITE} !important; }
        .text-body-gray { color: ${TEXT_BODY} !important; }
        
        @media (max-width: 768px) {
            .btn-ingot { 
                width: 60%;
                font-size: 0.75rem; 
            }
        }
      `}</style>

      <MarketTicker />

      <section className="container pt-5 pb-5">
        <div className="row">
            <div className="col-12 text-start">
                <h1 className="fw-bold mb-3 font-imperium text-off-white" style={{ fontSize: '1.6rem', letterSpacing: '-1px' }}>
                    NNM <span style={{ color: GOLD_MEDIUM }}>INTELLIGENCE</span>
                </h1>
                <p className="text-body-gray" style={{ maxWidth: '800px', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                    The definitive archive of Digital Name Assets market analysis, infrastructure updates, and sovereign identity research. Access the full history of the Nexus ecosystem.
                </p>
                <div className="mt-4" style={{ width: '60px', height: '2px', background: `linear-gradient(to right, ${GOLD_BASE}, transparent)` }}></div>
            </div>
        </div>
      </section>

      <section className="container pb-5">
        {loading ? (
            <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: '300px' }}>
                 <div className="spinner-border text-secondary mb-3" role="status" style={{ color: TEXT_BODY }}></div>
                 <span style={{ fontSize:'11px', letterSpacing:'2px', color: TEXT_BODY, fontFamily: 'monospace' }}>ACCESSING ARCHIVES...</span>
            </div>
        ) : (
            <>
                <div className="row g-4">
                    {posts.length === 0 ? (
                        <div className="col-12 text-start py-5 text-body-gray">
                            No reports available.
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="col-12 col-md-6 col-lg-4">
                                <Link href={`/blog/${post.id}`} className="text-decoration-none">
                                    <div className="archive-card">
                                        <div className="card-img-wrapper">
                                            {post.image_url ? (
                                                <img src={post.image_url} alt={post.title} className="card-img" />
                                            ) : (
                                                <div className="d-flex align-items-center justify-content-center h-100 bg-dark text-secondary">
                                                    <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
                                                </div>
                                            )}
                                            <div style={{ position: 'absolute', top: '15px', left: '15px', backgroundColor: 'rgba(24, 26, 32, 0.9)', padding: '3px 8px', borderRadius: '4px', border: `1px solid #444` }}>
                                                <span style={{ color: TEXT_BODY, fontSize: '9px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 flex-grow-1 d-flex flex-column">
                                            <div className="mb-2">
                                                <span style={{ fontSize:'10px', color: TEXT_BODY, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                                                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            
                                            <h3 className="h6 fw-bold mb-3 font-imperium text-off-white" style={{ lineHeight:'1.4', minHeight: '3rem', fontSize: '1rem' }}>
                                                {post.title}
                                            </h3>
                                            
                                            <p className="text-body-gray" style={{ fontSize:'12px', lineHeight:'1.6', marginBottom:'20px', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {post.summary || "Click to read full report..."}
                                            </p>

                                            <div className="mt-auto pt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                                <span className="text-gold" style={{ fontSize:'10px', fontWeight:'700', letterSpacing:'1px', textTransform: 'uppercase' }}>
                                                    READ REPORT <i className="bi bi-arrow-right ms-1"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                <div className="row mt-5 pt-5 mb-5">
                    <div className="col-12 text-center"> 
                        <div className="p-4 rounded-3" style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, maxWidth: '100%', margin: '0 auto' }}>
                            <h4 className="text-off-white mb-2 font-imperium" style={{ fontSize: '1.2rem' }}>Establish Your Sovereign Identity</h4>
                            <p className="text-body-gray mb-4" style={{ fontSize: '12px' }}>
                                The registry is open. Secure your Nexus Name before the era of permanence begins.
                            </p>
                            
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Link href="/mint" className="btn-ingot rounded-1">
                                    CLAIM NEXUS NAME
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}
      </section>
    </main>
  );
}
