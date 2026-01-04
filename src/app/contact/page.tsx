'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    message: ''
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert("Thank you. Your message has been simulated (Frontend Demo).");
  };

    const inputStyle = {
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        color: '#E0E0E0',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: '600',
        color: '#E0E0E0'
  };

  return (
    <main style={{ backgroundColor: '#1E1E1E', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '80px', color: '#E0E0E0' }}>
      
      <div className="container pt-5">
        
        <div className="row justify-content-center mb-5">
            <div className="col-12 col-lg-10 text-center text-md-start">
                <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem', letterSpacing: '-0.5px', color: '#E0E0E0' }}>
                    Contact <span style={{ color: '#FFD700' }}>NNM</span>
                </h1>
                <p style={{ fontSize: '16px', color: '#E0E0E0', maxWidth: '700px', lineHeight: '1.6' }}>
                    We are here to assist with your sovereign asset journey. 
                    Please select the appropriate channel below to ensure your inquiry is routed to the correct team.
                </p>
            </div>
        </div>

        <div className="row justify-content-center g-5">
            
            <div className="col-12 col-lg-4">
                <div className="d-flex flex-column gap-4">
                    
                    <div className="p-4 rounded-3" style={{ border: '1px solid #30363d', backgroundColor: '#161b22', color: '#E0E0E0' }}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                 style={{ width: '40px', height: '40px', backgroundColor: 'rgba(240, 196, 32, 0.1)', color: '#F0C420' }}>
                                <i className="bi bi-chat-text-fill"></i>
                            </div>
                            <h3 className="h6 text-white m-0 fw-bold">General Inquiries</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: '#E0E0E0', marginBottom: '15px' }}>
                            For platform assistance, account questions, or general information.
                        </p>
                        <a href="mailto:contact@nnm.com" className="text-decoration-none fw-bold" style={{ color: '#F0C420', fontSize: '14px' }}>
                            contact@nftnnm.com
                        </a>
                    </div>

                    <div className="p-4 rounded-3" style={{ border: '1px solid #30363d', backgroundColor: '#161b22', color: '#E0E0E0' }}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                 style={{ width: '40px', height: '40px', backgroundColor: 'rgba(240, 196, 32, 0.1)', color: '#F0C420' }}>
                                <i className="bi bi-megaphone-fill"></i>
                            </div>
                            <h3 className="h6 text-white m-0 fw-bold">Media & Partnerships</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: '#E0E0E0', marginBottom: '15px' }}>
                            For press releases, institutional partnerships, and brand assets.
                        </p>
                        <a href="mailto:media@nnm.com" className="text-decoration-none fw-bold" style={{ color: '#F0C420', fontSize: '14px' }}>
                            media@nftnnm.com
                        </a>
                    </div>

                    <div className="p-4 rounded-3" style={{ border: '1px solid #30363d', backgroundColor: '#161b22', color: '#E0E0E0' }}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                 style={{ width: '40px', height: '40px', backgroundColor: 'rgba(240, 196, 32, 0.1)', color: '#F0C420' }}>
                                <i className="bi bi-shield-fill-check"></i>
                            </div>
                            <h3 className="h6 text-white m-0 fw-bold">Legal & Compliance</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: '#E0E0E0', marginBottom: '15px' }}>
                            For verified institutional inquiries only: Regulatory, IP rights, and compliance matters.
                        </p>
                        <a href="mailto:legal@nnm.com" className="text-decoration-none fw-bold" style={{ color: '#F0C420', fontSize: '14px' }}>
                            legal@nftnnm.com
                        </a>
                    </div>

                </div>
            </div>

            <div className="col-12 col-lg-6">
                <div className="p-4 p-md-5 rounded-4" 
                     style={{ 
                         backgroundColor: '#1E1E1E', 
                         border: '1px solid #30363d',
                         boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                         color: '#E0E0E0'
                     }}>
                    
                    <h2 className="h4 fw-bold mb-4" style={{ color: '#E0E0E0' }}>Send a message</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label style={labelStyle}>Name / Organization</label>
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
                                <label style={labelStyle}>Email Address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={inputStyle} 
                                    placeholder="nftnnm.com" 
                                    className="contact-input"
                                />
                            </div>

                            <div className="col-12">
                                <label style={labelStyle}>Department</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    style={{...inputStyle, cursor: 'pointer', appearance: 'none'}} 
                                    className="contact-input form-select-dark"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="support">Technical Support</option>
                                    <option value="partnerships">Partnerships & Institutional</option>
                                    <option value="legal">Legal & IP</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <label style={labelStyle}>Message</label>
                                <textarea 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    style={{...inputStyle, minHeight: '150px', resize: 'vertical'}} 
                                    placeholder="How can we help you?"
                                    className="contact-input"
                                ></textarea>
                            </div>

                            <div className="col-12 mt-4">
                                <button type="submit" 
                                        className="btn w-100 fw-bold py-3"
                                        style={{ 
                                            background: 'linear-gradient(180deg, #FFD700 0%, #FDB931 50%, #B8860B 100%)', 
                                            color: '#000', 
                                            border: 'none',
                                            borderRadius: '6px'
                                        }}>
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-center">
                        <p style={{ fontSize: '12px', color: '#E0E0E0', margin: 0 }}>
                            <i className="bi bi-lock-fill me-1"></i>
                            Security Note: NNM support will <strong>never</strong> ask for your private keys or seed phrase.
                        </p>
                    </div>

                </div>
            </div>

        </div>
      </div>

      <style jsx>{`
        .contact-input:focus {
            border-color: #F0C420 !important;
            box-shadow: 0 0 0 2px rgba(240, 196, 32, 0.15);
        }
      `}</style>
    </main>
  );
}