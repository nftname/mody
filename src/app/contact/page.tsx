'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

const BRAND_GOLD = '#FCD535'; 
const BG_DARK = '#181A20';
const PANEL_BG = '#1E2329';
const BORDER_COLOR = '#2B3139';
const TEXT_PRIMARY = '#EAECEF';
const TEXT_MUTED = '#848E9C';
const DARK_PLACEHOLDER = '#444444'; 

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Inquiry',
    message: ''
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const departments = [
      "General Inquiry",
      "Technical Support",
      "Partnerships & Institutional",
      "Legal & IP"
  ];

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setIsDropdownOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelect = (value: string) => {
      setFormData({ ...formData, category: value });
      setIsDropdownOpen(false);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert("Message simulation: Sent successfully.");
  };

    const inputStyle = {
        backgroundColor: BG_DARK,
        border: `1px solid ${BORDER_COLOR}`,
        color: TEXT_PRIMARY,
        width: '100%',
        padding: '14px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s',
        fontFamily: 'inherit'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '13px',
        fontWeight: '500',
        color: TEXT_MUTED, 
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px'
    };

    return (
        <main className="contact-page" style={{ backgroundColor: BG_DARK, minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '80px' }}>
      
      <div className="container pt-5">
        
        <div className="row justify-content-center mb-5">
            <div className="col-12 col-lg-8 text-center">
                <h1 className="fw-bold mb-3" style={{ fontSize: '2.2rem', letterSpacing: '-1px', color: TEXT_PRIMARY }}>
                    Contact <span style={{ color: BRAND_GOLD }}>NNM</span>
                </h1>
                <p style={{ lineHeight: '1.6', color: TEXT_MUTED, fontSize: '15px' }}>
                    Select the appropriate channel below for assistance.
                </p>
            </div>
        </div>

        <div className="row justify-content-center g-5">
            
            <div className="col-12 col-lg-4">
                <div className="d-flex flex-column gap-3">
                    
                    <div className="p-4 rounded-4 contact-card">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="icon-box">
                                <i className="bi bi-chat-text-fill"></i>
                            </div>
                            <h3 className="h6 text-white m-0 fw-bold" style={{ color: TEXT_PRIMARY }}>General Inquiries</h3>
                        </div>
                        <p className="card-desc">
                            For platform assistance and general information.
                        </p>
                        <a href="mailto:contact@nftnnm.com" className="contact-link">
                            contact@nftnnm.com
                        </a>
                    </div>

                    <div className="p-4 rounded-4 contact-card">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="icon-box">
                                <i className="bi bi-megaphone-fill"></i>
                            </div>
                            <h3 className="h6 text-white m-0 fw-bold" style={{ color: TEXT_PRIMARY }}>Media & Partnerships</h3>
                        </div>
                        <p className="card-desc">
                            For press, partnerships, and brand assets.
                        </p>
                        <a href="mailto:media@nftnnm.com" className="contact-link">
                            media@nftnnm.com
                        </a>
                    </div>

                    <div className="p-4 rounded-4 contact-card">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="icon-box">
                                <i className="bi bi-shield-fill-check"></i>
                            </div>
                            <h3 className="h6 text-white m-0 fw-bold" style={{ color: TEXT_PRIMARY }}>Legal & Compliance</h3>
                        </div>
                        <p className="card-desc">
                            For verified institutional inquiries only.
                        </p>
                        <a href="mailto:legal@nftnnm.com" className="contact-link">
                            legal@nftnnm.com
                        </a>
                    </div>

                </div>
            </div>

            <div className="col-12 col-lg-6">
                <div className="p-4 p-md-5 rounded-4 form-container">
                    
                    <h2 className="h4 fw-bold mb-4" style={{ color: TEXT_PRIMARY }}>Send a message</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label style={labelStyle}>Name</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={inputStyle} 
                                    placeholder="Enter your name" 
                                    className="contact-input"
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label style={labelStyle}>Email</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={inputStyle} 
                                    placeholder="name@example.com" 
                                    className="contact-input"
                                />
                            </div>

                            <div className="col-12" ref={dropdownRef}>
                                <label style={labelStyle}>Department</label>
                                <div 
                                    className={`custom-select ${isDropdownOpen ? 'open' : ''}`} 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    style={{...inputStyle, backgroundColor: BG_DARK, cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}
                                >
                                    <span>{formData.category}</span>
                                    <i className="bi bi-chevron-down" style={{ fontSize: '12px', color: TEXT_MUTED, transition: 'transform 0.3s', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}></i>
                                    
                                    {isDropdownOpen && (
                                        <div className="dropdown-options">
                                            {departments.map((dept) => (
                                                <div 
                                                    key={dept} 
                                                    className={`option ${formData.category === dept ? 'selected' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelect(dept);
                                                    }}
                                                >
                                                    {dept}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-12">
                                <label style={labelStyle}>Message</label>
                                <textarea 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    style={{...inputStyle, minHeight: '150px', resize: 'vertical'}} 
                                    placeholder="Type your message here..."
                                    className="contact-input"
                                ></textarea>
                            </div>

                            <div className="col-12 mt-4">
                                <button type="submit" 
                                        className="btn w-100 py-3 minimalist-btn"
                                >
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-4 pt-3 border-top border-secondary border-opacity-10 text-center">
                        <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>
                            <i className="bi bi-lock-fill me-1"></i>
                            NNM support will never ask for your private keys.
                        </p>
                    </div>

                </div>
            </div>

        </div>
      </div>

            <style jsx>{`
                .contact-card {
                    background-color: ${PANEL_BG};
                    border: 1px solid ${BORDER_COLOR};
                    transition: transform 0.2s;
                }
                .contact-card:hover { transform: translateY(-2px); }
                
                .icon-box {
                    width: 36px; height: 36px;
                    border-radius: 50%;
                    background-color: rgba(252, 213, 53, 0.1); 
                    color: ${BRAND_GOLD};
                    display: flex; align-items: center; justify-content: center;
                    font-size: 16px;
                }
                .card-desc {
                    color: ${TEXT_MUTED};
                    font-size: 14px;
                    margin-bottom: 12px;
                    line-height: 1.5;
                }
                
                .contact-link {
                    text-decoration: none;
                    font-weight: 400; 
                    color: ${BRAND_GOLD};
                    font-size: 14px;
                    transition: color 0.2s;
                }
                .contact-link:hover { color: #fff; }

                .form-container {
                    background-color: ${PANEL_BG};
                    border: 1px solid ${BORDER_COLOR};
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }

                .contact-input::placeholder {
                    color: ${DARK_PLACEHOLDER}; 
                    font-weight: 400;
                    opacity: 1; 
                }
                .contact-input:focus {
                    border-color: ${BRAND_GOLD} !important;
                    background-color: ${BG_DARK} !important;
                }

                .custom-select { position: relative; user-select: none; }
                .custom-select.open { border-color: ${BRAND_GOLD} !important; }
                
                .dropdown-options {
                    position: absolute;
                    top: 105%;
                    left: 0;
                    width: 100%;
                    background-color: ${BG_DARK};
                    border: 1px solid ${BORDER_COLOR};
                    border-radius: 8px;
                    z-index: 100;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .dropdown-options .option {
                    padding: 12px 16px;
                    color: ${TEXT_MUTED};
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .dropdown-options .option:hover {
                    background-color: rgba(255, 255, 255, 0.05);
                    color: #FFF;
                }
                .dropdown-options .option.selected {
                    background-color: rgba(252, 213, 53, 0.05);
                    color: ${BRAND_GOLD};
                }

                .minimalist-btn {
                    background-color: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(252, 213, 53, 0.4) !important;
                    color: ${BRAND_GOLD} !important;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                    transition: all 0.3s ease;
                }
                .minimalist-btn:hover {
                    background-color: rgba(252, 213, 53, 0.1) !important;
                    border-color: ${BRAND_GOLD} !important;
                    color: #FFF !important;
                    transform: translateY(-1px);
                }
            `}</style>
    </main>
  );
}
