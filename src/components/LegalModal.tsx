'use client';
import { useState, useEffect } from 'react';

export default function LegalModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkTerms = () => {
        // Updated version to v8 so users re-accept the new terms
        const hasAccepted = localStorage.getItem('nnm_terms_accepted_v8');
        if (!hasAccepted) {
          setShowModal(true);
        }
    }
    checkTerms();
  }, []);

  const handleAccept = () => {
    localStorage.setItem('nnm_terms_accepted_v8', 'true');
    setShowModal(false);
  };

  const handleCancel = () => {
    window.location.href = 'https://google.com';
  };

  if (!showModal) return null;

  return (
    <div style={{
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // تعتيم الخلفية وراء النافذة لزيادة التركيز
      backdropFilter: 'blur(5px)',
      zIndex: 999999, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <style jsx global>{`
        .legal-scroll::-webkit-scrollbar { width: 5px; }
        .legal-scroll::-webkit-scrollbar-track { background: #252525; }
        .legal-scroll::-webkit-scrollbar-thumb { background: #4a505c; border-radius: 3px; }
        .legal-scroll::-webkit-scrollbar-thumb:hover { background: #76808f; }
        .legal-ul { margin: 4px 0 8px 15px; padding-left: 0; }
        .legal-ul li { margin-bottom: 4px; list-style-type: disc; color: #B7BDC6; font-weight: 300; }
      `}</style>

      <div style={{
        backgroundColor: '#252525', // ✅ اللون الجديد: رمادي فحمي "أخف" قليلاً من خلفية الموقع
        border: '1px solid rgba(252, 213, 53, 0.3)', // إطار ذهبي خافت
        borderRadius: '12px',
        width: '90%', 
        maxWidth: '600px', 
        maxHeight: '85vh', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
      }}>
        
        <div className="p-3 border-bottom" style={{ borderColor: '#333' }}>
          <h5 className="fw-bold m-0 ps-2" style={{ fontFamily: 'sans-serif', fontSize: '21px', color: '#E6E8EA' }}>
            <span style={{ color: '#FCD535' }}>NNM</span> Terms of Service
          </h5>
          <p className="m-0 ps-2" style={{ fontSize: '11px', marginTop: '4px', fontWeight: '300', color: '#848E9C' }}>Last Updated: November 2025</p>
        </div>

        <div className="legal-scroll p-4" style={{ 
          overflowY: 'auto', 
          flex: 1,
          fontSize: '11.5px', 
          fontWeight: '300',
          color: '#B7BDC6', 
          lineHeight: '1.6', 
          textAlign: 'left'
        }}>
            <p className="mb-3">
              <strong style={{ color: '#E6E8EA', fontWeight: '600' }}>IMPORTANT NOTICE:</strong> By accessing, browsing, connecting a wallet to, minting through, listing on, interacting with, or otherwise using the NFT Name Market (NNM) interface (the &quot;Site&quot;) and protocol, you acknowledge that you have read, understood, and fully agree to be legally bound by this User Agreement (&quot;Agreement&quot;). If you do not agree to any portion of these Terms, you must immediately discontinue all access to the Site and Protocol.
            </p>

            <div style={{ height: '1px', backgroundColor: '#333', margin: '12px 0' }}></div>

            <h6 className="fw-bold mt-3 mb-2" style={{ fontSize: '13px', fontWeight: '600', color: '#E6E8EA' }}>I. TERMS OF SERVICE & LIABILITY</h6>

            <p className="mb-1" style={{ fontWeight: '500', color: '#E6E8EA' }}>1. ELIGIBILITY & AGE REQUIREMENTS</p>
            <p className="mb-3">
              By using the NNM Protocol you represent, warrant, and covenant that you are at least <strong style={{ fontWeight: '500', color: '#E6E8EA' }}>18 years old</strong> (or of legal majority where you reside), that you possess the full legal capacity and authority to enter into this Agreement, and that your use of the Protocol will comply with all applicable laws and regulations.
            </p>

            <p className="mb-1" style={{ fontWeight: '500', color: '#E6E8EA' }}>2. PROTOCOL NATURE &mdash; INTERFACE-ONLY</p>
            <p className="mb-1">NNM is strictly a <strong style={{ fontWeight: '500', color: '#E6E8EA' }}>visual interface layer</strong>. It is not an exchange, escrow, broker, custodian, wallet provider, financial institution, or regulated marketplace.</p>
            <ul className="legal-ul">
              <li><strong>Interface Only:</strong> NNM controls only the website and UI through which blockchain data is presented.</li>
              <li><strong>No Custody:</strong> NNM does not possess, store, control, or have access to your private keys or assets.</li>
              <li><strong>Autonomous:</strong> The underlying smart contracts on Polygon remain fully autonomous and immutable.</li>
            </ul>

            <p className="mb-1" style={{ fontWeight: '500', color: '#E6E8EA' }}>3. JURISDICTION-NEUTRAL OPERATION</p>
            <p className="mb-3">
              NNM operates as a decentralized, jurisdiction-agnostic protocol interface. The Site is not operated, managed, hosted, administered, or controlled from within any specific country or legal jurisdiction.
            </p>
            <p className="mb-3">
              Access to the Site is global and passive in nature. NNM does not target, solicit, conduct, or carry on business activities within any particular jurisdiction, nor does it maintain a physical presence, establishment, or permanent operations in any country.
            </p>
            <p className="mb-3">
              Any access or use of the Site occurs solely at the initiative of the user, who is fully responsible for ensuring compliance with the laws applicable in their own jurisdiction. NNM assumes no responsibility for jurisdiction-specific regulatory obligations arising from user access.
            </p>

            <p className="mb-1" style={{ fontWeight: '500', color: '#E6E8EA' }}>4. NO FINANCIAL, LEGAL, OR TAX ADVICE</p>
            <p className="mb-3">
              All content is for informational purposes only. Nothing on the Site constitutes investment advice. You should seek independent professional counsel. Your use of the Protocol is at your own risk.
            </p>

            <p className="mb-1" style={{ fontWeight: '500', color: '#E6E8EA' }}>5. LIMITATION OF LIABILITY &mdash; &quot;AS IS&quot;</p>
            <p className="mb-3">
              To the fullest extent permitted by law, <strong style={{ fontWeight: '500', color: '#E6E8EA' }}>NNM expressly disclaims all warranties</strong>. The Service is provided &quot;AS IS.&quot; NNM shall not be liable for any damages, lost profits, smart-contract vulnerabilities, gas fee losses, or unauthorized access. NNM&apos;s liability is limited to the maximum extent permitted by law.
            </p>

            <p className="mb-1" style={{ fontWeight: '500', color: '#E6E8EA' }}>6. USER RESPONSIBILITY & INDEMNIFICATION</p>
            <p className="mb-1">You accept full responsibility for any content you mint. NNM does not review or verify legality of user content.</p>
            <ul className="legal-ul">
              <li><strong>No Monitoring:</strong> The interface displays on-chain content as recorded.</li>
              <li><strong>Indemnification:</strong> You agree to indemnify and hold NNM harmless against any claims arising from your use or IP violations.</li>
            </ul>

            <p className="mb-1" style={{ fontWeight: '500', color: '#E6E8EA' }}>7. ASSET CLASSIFICATION</p>
            <p className="mb-1">NFTs are classified as <strong style={{ fontWeight: '500', color: '#E6E8EA' }}>&quot;Visual Identity Assets&quot;</strong>.</p>
            <ul className="legal-ul">
              <li><strong>No Commercial Rights:</strong> Minting does NOT grant trademark rights outside the blockchain.</li>
              <li><strong>No Exclusivity:</strong> NNM does not guarantee global exclusivity or enforceability.</li>
              <li><strong>Tax Responsibility:</strong> You are solely responsible for all taxes.</li>
            </ul>

            <p className="mb-1" style={{ fontWeight: '500', color: '#E6E8EA' }}>8. PROHIBITED ACTIVITIES</p>
            <p className="mb-1">You agree not to use NNM for illegal purposes, including:</p>
            <ul className="legal-ul">
              <li>Money laundering, terrorist financing, or sanctions violations.</li>
              <li>Market manipulation (wash trading) or bot activity.</li>
              <li>Any activity intended to defraud or deceive.</li>
            </ul>
            <p className="mb-3">NNM reserves the right to restrict access to wallets suspected of prohibited activities.</p>

            <p className="mb-1" style={{ fontWeight: '500', color: '#E6E8EA' }}>9. GOVERNING LAW & ARBITRATION</p>
            <p className="mb-3">
              All disputes shall be resolved by binding individual arbitration. Class-actions are waived. Governed by the laws of <strong style={{ fontWeight: '500', color: '#E6E8EA' }}>Singapore</strong>.
            </p>

            <div style={{ height: '1px', backgroundColor: '#333', margin: '12px 0' }}></div>

            <h6 className="fw-bold mt-3 mb-2" style={{ fontSize: '13px', fontWeight: '600', color: '#E6E8EA' }}>II. PRIVACY POLICY</h6>

            <p className="mb-1" style={{ fontWeight: '500', color: '#E6E8EA' }}>10. MAXIMUM PRIVACY / DATA POLICY</p>
            <p className="mb-1">NNM uses a Zero-PII philosophy. We do not collect names, emails, or IP addresses.</p>
            <ul className="legal-ul">
              <li>No accounts or registrations required.</li>
              <li>No analytics tracking for identification.</li>
              <li>We only read public on-chain data.</li>
            </ul>
            <p className="mb-3">Note that blockchain transactions are inherently public.</p>

            <div style={{ height: '1px', backgroundColor: '#333', margin: '12px 0' }}></div>

            <h6 className="fw-bold mt-3 mb-2" style={{ fontSize: '13px', fontWeight: '600', color: '#E6E8EA' }}>III. INTELLECTUAL PROPERTY</h6>

            <p className="mb-1" style={{ fontWeight: '500', color: '#E6E8EA' }}>11. TAKEDOWN MECHANISM</p>
            <p className="mb-1">NNM respects IP rights. Upon valid notice (DMCA), we may:</p>
            <ul className="legal-ul">
              <li>Delist the NFT from the UI.</li>
              <li>Hide metadata and search visibility.</li>
            </ul>
            <p className="mb-3">This affects UI only; the on-chain token remains immutable.</p>

            <p className="mt-4 mb-0" style={{ fontSize: '10px', color: '#687080' }}>
              <strong style={{ fontWeight: '500', color: '#848E9C' }}>MODIFICATIONS:</strong> NNM may update these terms. Continued use constitutes acceptance.
            </p>
        </div>

        <div className="p-3 border-top d-flex justify-content-end gap-3" style={{ borderColor: '#333', backgroundColor: '#252525', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
            <button 
                onClick={handleCancel}
                className="btn text-secondary"
                style={{ 
                    backgroundColor: 'transparent',
                    border: '1px solid #555', 
                    borderRadius: '4px',
                    padding: '6px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#888'; e.currentTarget.style.color = '#E6E8EA'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#6c757d'; }}
            >
                Cancel
            </button>

            <button 
                onClick={handleAccept}
                className="btn"
                style={{ 
                    background: 'linear-gradient(180deg, #FCD535 0%, #F0B90B 100%)', 
                    border: 'none', 
                    borderRadius: '4px',
                    color: '#000', 
                    padding: '6px 30px', 
                    fontSize: '13px',
                    fontWeight: '600',
                    boxShadow: '0 2px 10px rgba(252, 213, 53, 0.2)'
                }}
            >
                I Accept
            </button>
        </div>

      </div>
    </div>
  );
}
