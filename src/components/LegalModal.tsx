'use client';
import { useState, useEffect } from 'react';

// Color Palette Constants matching the Page Design
const COLORS = {
  MODAL_BG: '#1E2329',      // Binance Card BG
  BORDER: '#2B3139',        // Subtle Dark Border
  TEXT_HEAD: '#EAECEF',     // Off-White for Headings
  TEXT_BODY: '#848E9C',     // Muted Blue-Grey for Text
  TEXT_HIGHLIGHT: '#CFD6E0',// Platinum for strong warnings
  GOLD_MAIN: '#FCD535',     // Binance Gold
  SCROLL_TRACK: '#181A20',  // Darkest BG for scroll track
  SCROLL_THUMB: '#474D57'   // Scroll thumb color
};

export default function LegalModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkTerms = () => {
        // IMPORTANT: Updated version to 'v9' to force re-acceptance of the new 19 clauses
        const hasAccepted = localStorage.getItem('nnm_terms_accepted_v9');
        if (!hasAccepted) {
          setShowModal(true);
        }
    }
    checkTerms();
  }, []);

  const handleAccept = () => {
    localStorage.setItem('nnm_terms_accepted_v9', 'true');
    setShowModal(false);
  };

  const handleCancel = () => {
    // Redirect or handle refusal
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
      backgroundColor: 'rgba(0, 0, 0, 0.85)', // Slightly darker overlay for focus
      backdropFilter: 'blur(8px)',
      zIndex: 999999, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '15px'
    }}>
      <style jsx global>{`
        .legal-scroll::-webkit-scrollbar { width: 6px; }
        .legal-scroll::-webkit-scrollbar-track { background: ${COLORS.SCROLL_TRACK}; border-radius: 4px; }
        .legal-scroll::-webkit-scrollbar-thumb { background: ${COLORS.SCROLL_THUMB}; border-radius: 4px; }
        .legal-scroll::-webkit-scrollbar-thumb:hover { background: #5E6673; }
        
        .legal-ul { margin: 8px 0 12px 18px; padding-left: 0; }
        .legal-ul li { margin-bottom: 6px; list-style-type: disc; color: ${COLORS.TEXT_BODY}; font-weight: 400; }
        .legal-ul li::marker { color: ${COLORS.GOLD_MAIN}; }
        
        .legal-term-title { margin-top: 16px; margin-bottom: 8px; font-weight: 600; font-size: 13px; color: ${COLORS.TEXT_HEAD}; }
        .legal-p { margin-bottom: 12px; }
      `}</style>

      <div style={{
        backgroundColor: COLORS.MODAL_BG, 
        border: `1px solid ${COLORS.BORDER}`, 
        borderRadius: '16px',
        width: '100%', 
        maxWidth: '650px', 
        maxHeight: '85vh', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Header */}
        <div className="p-4 border-bottom" style={{ borderColor: COLORS.BORDER }}>
          <h5 className="fw-bold m-0" style={{ fontFamily: 'sans-serif', fontSize: '22px', color: COLORS.TEXT_HEAD, letterSpacing: '-0.5px' }}>
            <span style={{ color: COLORS.GOLD_MAIN }}>NNM</span> Terms of Service
          </h5>
          <p className="m-0" style={{ fontSize: '12px', marginTop: '6px', fontWeight: '400', color: COLORS.TEXT_BODY }}>
            Effective: February 2026
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="legal-scroll p-4" style={{ 
          overflowY: 'auto', 
          flex: 1,
          fontSize: '13px', 
          fontWeight: '400',
          color: COLORS.TEXT_BODY, 
          lineHeight: '1.6', 
          textAlign: 'left'
        }}>
            {/* Intro */}
            <div className="p-3 mb-4 rounded-3" style={{ backgroundColor: '#181A20', border: `1px solid ${COLORS.BORDER}` }}>
              <p className="m-0">
                <strong style={{ color: COLORS.GOLD_MAIN }}>IMPORTANT NOTICE:</strong> By accessing, browsing, connecting a wallet to, minting, listing, interacting with, or otherwise using the NFT Name Market (NNM) website, interface, smart contracts, or ChainFace services (collectively, the “Protocol”), you acknowledge that you have read, understood, and irrevocably agree to be legally bound by this Agreement. If you do not agree, you must immediately discontinue all access.
              </p>
            </div>

            <h6 className="fw-bold mt-2 mb-3 pb-2 border-bottom" style={{ fontSize: '14px', color: COLORS.TEXT_HEAD, borderColor: COLORS.BORDER }}>
                I. TERMS OF SERVICE & LIABILITY
            </h6>

            <p className="legal-term-title">1. ELIGIBILITY & AGE REQUIREMENTS</p>
            <p className="legal-p">
              By using the NNM Protocol you represent, warrant, and covenant that you are at least <strong style={{ color: COLORS.TEXT_HEAD }}>18 years old</strong> (or of legal majority in your jurisdiction), possess full legal capacity to enter into this Agreement, and that your use of the Protocol complies with all applicable laws and regulations. Users accept sole responsibility for any legal consequences arising from jurisdiction-specific obligations.
            </p>

            <p className="legal-term-title">2. PROTOCOL NATURE – INTERFACE ONLY</p>
            <p className="legal-p">NNM provides a strictly decentralized interface for autonomous smart contracts on public blockchains.</p>
            <ul className="legal-ul">
              <li><strong>NNM is not</strong> a financial institution, broker, exchange, escrow, wallet, custodian, or regulated marketplace.</li>
              <li>NNM does not hold, control, or access user funds or private keys.</li>
              <li>All transactions are peer-to-peer and executed solely by users through their own wallets.</li>
              <li>NNM does not guarantee liquidity, execution, or value of any asset.</li>
            </ul>

            <p className="legal-term-title">3. DECENTRALIZED & JURISDICTION-NEUTRAL OPERATION</p>
            <p className="legal-p">
              NNM operates globally and is jurisdiction-agnostic. NNM does not solicit, target, or conduct business in any specific country and has no physical presence for financial operations. Users assume full responsibility for compliance with local laws.
            </p>

            <p className="legal-term-title">4. NO FINANCIAL, INVESTMENT, OR LEGAL ADVICE</p>
            <p className="legal-p">
              All content is informational only. NNM provides no investment, financial, tax, or legal advice. Users act at their own risk. Users must seek independent professional counsel for any financial decisions.
            </p>

            <p className="legal-term-title">5. DIGITAL ASSET CLASSIFICATION</p>
            <p className="legal-p">NFT Names and related digital items (“Digital Identity Assets”) are:</p>
            <ul className="legal-ul">
              <li>Purely visual identity assets.</li>
              <li>Not securities, equities, or investment contracts.</li>
              <li>Not granting trademark, publicity, or commercial rights outside the blockchain.</li>
              <li>Not guaranteeing exclusivity, enforceability, or financial appreciation.</li>
            </ul>

            <p className="legal-term-title">6. MARKET ACTIVITY & ADMIN/OPERATIONAL WALLETS</p>
            <p className="legal-p">
              NNM may operate an Initial Market Testing Phase for up to ninety (90) days using authorized Operational and Admin Wallets. Such wallets are used for technical testing, initial liquidity, and educational evaluation.
            </p>
            <p className="legal-p">
              Trades via Operational/Admin Wallets do not constitute financial advice. <strong style={{ color: COLORS.TEXT_HEAD }}>After the 90-day testing period</strong>, Operational/Admin Wallets cease experimental activities, and the marketplace operates fully user-driven.
            </p>

            <p className="legal-term-title">7. CHAINFACE SERVICE</p>
            <p className="legal-p">
              ChainFace provides decentralized identity display linked to NFT ownership. NNM does not custody funds or process payments. Users accept complete autonomy and privacy, with zero liability on NNM’s part.
            </p>

            <p className="legal-term-title">8. CONVICTION POINTS SYSTEM</p>
            <p className="legal-p">
              Conviction Rank points are symbolic, non-monetary, and purely internal. They are not a currency, token, or security. NNM retains full control to modify or terminate points at any time.
            </p>

            <p className="legal-term-title">9. USER RESPONSIBILITY</p>
            <p className="legal-p">
              Users are fully responsible for content minted, listed, or displayed. Users acknowledge that NNM does not monitor or verify user content; all on-chain activity is solely the user’s responsibility.
            </p>

            <p className="legal-term-title">10. PROHIBITED ACTIVITIES</p>
            <p className="legal-p">
              Users agree not to use NNM for money laundering, terrorist financing, sanctions violations, market manipulation (wash trading), or bot activity.
            </p>

            <p className="legal-term-title">11. PROHIBITED CONTENT & RIGHT TO BURN</p>
            <p className="legal-p">
              Users must NOT mint names that violate trademarks, contain hate speech, or are illegal.
            </p>
            <p className="legal-p" style={{ color: COLORS.TEXT_HEAD }}>
               NNM reserves the <strong>strict right, at its sole discretion, to block, delist, or burn (permanently destroy)</strong> any Digital Identity Asset that violates these standards.
            </p>
            <p className="legal-p mt-2" style={{ color: COLORS.TEXT_HIGHLIGHT, fontWeight: '600' }}>
               NO REFUNDS: In the event an asset is blocked, delisted, or burned, the user forfeits all access and is not entitled to any refund or compensation.
            </p>

            <p className="legal-term-title">12. NAME BURN AUTHORIZATION</p>
            <p className="legal-p">
              NNM may burn assets in cases of verified legal claims, misuse, or threats to protocol integrity.
            </p>

            <p className="legal-term-title">13. LIMITATION OF LIABILITY – “AS IS”</p>
            <p className="legal-p">
              NNM shall not be liable for smart contract bugs, network failures, high gas fees, Polygon congestion, or loss of funds. Maximum liability is limited to amounts directly paid to NNM.
            </p>

            <p className="legal-term-title">14. INDEMNIFICATION</p>
            <p className="legal-p">
              Users agree to indemnify NNM against any claims arising from their use of the Protocol or violation of third-party rights.
            </p>

            <p className="legal-term-title">15. INTELLECTUAL PROPERTY</p>
            <p className="legal-p">
              All branding, NGX Index, and proprietary tools belong to NNM. On-chain assets are controlled by users.
            </p>

            <p className="legal-term-title">16. PRIVACY POLICY</p>
            <p className="legal-p">
              Zero-PII policy. No collection of names or emails. Blockchain transactions are public.
            </p>

            <p className="legal-term-title">17. MODIFICATIONS</p>
            <p className="legal-p">
              NNM may update these Terms at any time; continued use constitutes acceptance.
            </p>

            <p className="legal-term-title">18. GOVERNING LAW</p>
            <p className="legal-p">
              All disputes are resolved via individual binding arbitration under Singapore law.
            </p>

            <p className="legal-term-title">19. MISCELLANEOUS</p>
            <p className="legal-p mb-0">
              Users agree that NNM is a neutral interface only. These Terms cover all liabilities.
            </p>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-top d-flex justify-content-end gap-2" style={{ borderColor: COLORS.BORDER, backgroundColor: COLORS.MODAL_BG, borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
            <button 
                onClick={handleCancel}
                className="btn"
                style={{ 
                    backgroundColor: 'transparent',
                    border: '1px solid #474D57', 
                    borderRadius: '8px',
                    padding: '8px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: COLORS.TEXT_BODY,
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#848E9C'; e.currentTarget.style.color = COLORS.TEXT_HEAD; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#474D57'; e.currentTarget.style.color = COLORS.TEXT_BODY; }}
            >
                Decline
            </button>

            <button 
                onClick={handleAccept}
                className="btn"
                style={{ 
                    background: `linear-gradient(180deg, ${COLORS.GOLD_MAIN} 0%, #F0B90B 100%)`, 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#1E2329', 
                    padding: '8px 32px', 
                    fontSize: '14px',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(252, 213, 53, 0.25)',
                    cursor: 'pointer'
                }}
                onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
                I Agree
            </button>
        </div>

      </div>
    </div>
  );
}
