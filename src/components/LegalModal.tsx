'use client';
import { useState, useEffect } from 'react';

const COLORS = {
  MODAL_BG: '#1E2329',      
  BORDER: '#2B3139',        
  TEXT_HEAD: '#EAECEF',    
  TEXT_BODY: '#848E9C',    
  TEXT_HIGHLIGHT: '#CFD6E0',
  GOLD_MAIN: '#FCD535',     
  SCROLL_TRACK: '#181A20',  
  SCROLL_THUMB: '#474D57'   
};

export default function LegalModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkTerms = () => {
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
      backgroundColor: 'rgba(0, 0, 0, 0.85)', 
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
        
        .legal-term-title { margin-top: 16px; margin-bottom: 8px; font-weight: 600; font-size: 13px; color: ${COLORS.TEXT_HEAD}; text-transform: uppercase; }
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
        
        <div className="p-4 border-bottom" style={{ borderColor: COLORS.BORDER }}>
          <h5 className="fw-bold m-0" style={{ fontFamily: 'sans-serif', fontSize: '22px', color: COLORS.TEXT_HEAD, letterSpacing: '-0.5px' }}>
            <span style={{ color: COLORS.GOLD_MAIN }}>NNM</span> Terms of Service
          </h5>
          <p className="m-0" style={{ fontSize: '12px', marginTop: '6px', fontWeight: '400', color: COLORS.TEXT_BODY }}>
            Effective: February 2026
          </p>
        </div>

        <div className="legal-scroll p-4" style={{ 
          overflowY: 'auto', 
          flex: 1,
          fontSize: '13px', 
          fontWeight: '400',
          color: COLORS.TEXT_BODY, 
          lineHeight: '1.6', 
          textAlign: 'left'
        }}>
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
              <li>Users acknowledge that NNM is a neutral interface and does not mediate or intervene in transactions.</li>
            </ul>

            <p className="legal-term-title">3. DECENTRALIZED & JURISDICTION-NEUTRAL OPERATION</p>
            <p className="legal-p">NNM operates globally and is jurisdiction-agnostic.</p>
            <ul className="legal-ul">
              <li>NNM does not solicit, target, or conduct business in any specific country.</li>
              <li>NNM has no physical presence for financial operations.</li>
              <li>Users assume full responsibility for compliance with local laws and regulations.</li>
              <li>NNM assumes no liability for jurisdiction-specific regulatory obligations.</li>
            </ul>

            <p className="legal-term-title">4. NO FINANCIAL, INVESTMENT, OR LEGAL ADVICE</p>
            <p className="legal-p">
              All content is informational only. NNM provides no investment, financial, tax, or legal advice. Users act at their own risk. Users must seek independent professional counsel for any financial, investment, or legal decisions.
            </p>

            <p className="legal-term-title">5. DIGITAL ASSET CLASSIFICATION</p>
            <p className="legal-p">NFT Names and related digital items (“Digital Identity Assets”) are:</p>
            <ul className="legal-ul">
              <li>Purely visual identity assets.</li>
              <li>Not securities, equities, or investment contracts.</li>
              <li>Not granting trademark, publicity, or commercial rights outside the blockchain.</li>
              <li>Not guaranteeing exclusivity, enforceability, or financial appreciation.</li>
              <li>Users acknowledge that minting does not imply ownership rights beyond blockchain metadata.</li>
            </ul>

            <p className="legal-term-title">6. MARKET ACTIVITY & ADMIN/OPERATIONAL WALLETS</p>
            <p className="legal-p">
              NNM may operate an Initial Market Testing Phase for up to ninety (90) days using authorized Operational and Admin Wallets:
            </p>
            <ul className="legal-ul">
              <li>Such wallets are used for technical testing, initial ecosystem activity, educational evaluation of system mechanics, and operational metric assessments.</li>
              <li>Trades via Operational/Admin Wallets do not constitute financial advice, investment recommendation, or market guarantees.</li>
              <li>Users acknowledge that any observed market activity during this period is experimental and not indicative of future results.</li>
              <li>NNM provides no warranty regarding network activity, volume, ecosystem demand, or outcomes during testing.</li>
              <li><strong style={{ color: COLORS.TEXT_HEAD }}>After the 90-day testing period</strong>, Operational/Admin Wallets cease experimental activities, and the marketplace operates fully user-driven.</li>
            </ul>

            <p className="legal-term-title">7. CHAINFACE SERVICE</p>
            <p className="legal-p">ChainFace provides decentralized identity display linked to NFT ownership.</p>
            <ul className="legal-ul">
              <li>NNM does not custody funds or process payments.</li>
              <li>NNM does not verify legality of user transactions or mediate disputes.</li>
              <li>Users fully control all interactions via ChainFace; all activities are peer-to-peer.</li>
              <li>Users accept complete autonomy and privacy, with zero liability on NNM’s part.</li>
            </ul>

            <p className="legal-term-title">8. CONVICTION POINTS SYSTEM</p>
            <p className="legal-p">Conviction Rank points (WNNM → NNM Points):</p>
            <ul className="legal-ul">
              <li>Are symbolic, non-monetary, and purely internal to the platform.</li>
              <li>Are not a currency, token, security, or tradable asset.</li>
              <li>Are fully controlled by NNM and may be modified, suspended, or terminated at any time without notice.</li>
              <li>Users acknowledge that points carry no claim to future tokens, coins, or tradable rights.</li>
            </ul>

            <p className="legal-term-title">9. USER RESPONSIBILITY</p>
            <p className="legal-p">Users are fully responsible for:</p>
            <ul className="legal-ul">
              <li>Content minted, listed, or displayed on the Protocol.</li>
              <li>Compliance with intellectual property, trademark, publicity rights, and third-party rights.</li>
              <li>Wallet security, transaction approvals, and tax obligations.</li>
              <li>Any actions, messages, or interactions via ChainFace or NFT assets.</li>
              <li>Users acknowledge that NNM does not monitor or verify user content; all on-chain activity is solely the user’s responsibility.</li>
            </ul>

            <p className="legal-term-title">10. PROHIBITED ACTIVITIES</p>
            <p className="legal-p">Users agree not to use NNM for:</p>
            <ul className="legal-ul">
              <li>Money laundering, terrorist financing, or sanctions violations.</li>
              <li>Market manipulation (including wash trading) or automated bot activity.</li>
              <li>Fraudulent, deceptive, or illegal conduct.</li>
            </ul>
            <p className="legal-p">NNM reserves the right to restrict access to wallets suspected of prohibited activities or violation of these Terms.</p>

            <p className="legal-term-title">11. PROHIBITED CONTENT, THIRD-PARTY RIGHTS & RIGHT TO BURN</p>
            <p className="legal-p">To maintain protocol integrity and compliance, users must NOT mint or display Digital Identity Assets that:</p>
            <ul className="legal-ul">
              <li>Violate trademarks, copyrights, or publicity rights of celebrities, public figures, or corporations.</li>
              <li>Contain hate speech, slurs, explicit violence, pornography, or illegal content.</li>
              <li>Are identified as “high-risk” names for misuse or infringement.</li>
            </ul>
            <p className="legal-p" style={{ color: COLORS.TEXT_HEAD }}>
               NNM reserves the <strong>strict right, at its sole discretion, to block, delist, or burn (permanently destroy)</strong> any Digital Identity Asset:
            </p>
            <ul className="legal-ul">
              <li>In response to valid legal claims.</li>
              <li>If an asset violates the community standards or high-risk policies.</li>
              <li>If the asset is involved in misuse, unauthorized commercial exploitation, or regulatory concerns.</li>
            </ul>
            <p className="legal-p mt-2" style={{ color: COLORS.TEXT_HIGHLIGHT, fontWeight: '600' }}>
               NO REFUNDS: In the event an asset is blocked, delisted, or burned, the user forfeits all access and is not entitled to any refund, compensation, or reimbursement for minting or gas fees.
            </p>

            <p className="legal-term-title">12. NAME BURN AUTHORIZATION</p>
            <p className="legal-p">NNM may, at its sole discretion, burn or remove Digital Identity Assets under circumstances including but not limited to:</p>
            <ul className="legal-ul">
              <li>Verified legal claims or court orders.</li>
              <li>Misuse, impersonation, or infringement of third-party rights.</li>
              <li>Detection of fraudulent, malicious, or harmful activity.</li>
              <li>Any activity that threatens the integrity or security of the Protocol.</li>
            </ul>

            <p className="legal-term-title">13. LIMITATION OF LIABILITY – “AS IS”</p>
            <p className="legal-p">The Protocol is provided “AS IS” and “AS AVAILABLE.” NNM shall not be liable for:</p>
            <ul className="legal-ul">
              <li>Bugs, exploits, or vulnerabilities in smart contracts.</li>
              <li>Network failures, latency, high gas fees, or congestion on the Polygon blockchain.</li>
              <li>Loss of funds or assets.</li>
              <li>Unauthorized wallet access.</li>
              <li>Ecosystem volatility or network participation outcomes.</li>
              <li>Regulatory or legal consequences arising from user activity.</li>
            </ul>
            <p className="legal-p">Maximum liability, if any, is strictly limited to amounts directly paid to NNM for services.</p>

            <p className="legal-term-title">14. INDEMNIFICATION</p>
            <p className="legal-p">Users agree to indemnify, defend, and hold harmless NNM, affiliates, and associated entities from any claims, losses, or damages arising from:</p>
            <ul className="legal-ul">
              <li>Violation of laws or third-party rights.</li>
              <li>Unauthorized transactions.</li>
              <li>Misuse of NFT Names, ChainFace, or Digital Identity Assets.</li>
            </ul>

            <p className="legal-term-title">15. INTELLECTUAL PROPERTY</p>
            <ul className="legal-ul">
              <li>All platform branding, analytics, NGX NFT Index, sub-indices, and proprietary tools remain exclusive property of NNM.</li>
              <li>On-chain assets are fully controlled by individual wallet holders.</li>
              <li>Reproduction, copying, or unauthorized use of proprietary data, indices, or methodology is strictly prohibited.</li>
            </ul>

            <p className="legal-term-title">16. PRIVACY POLICY</p>
            <p className="legal-p">NNM follows a Zero-PII policy:</p>
            <ul className="legal-ul">
              <li>No collection of personal data (names, emails, IP addresses).</li>
              <li>No account registration required.</li>
              <li>Blockchain transactions remain inherently public.</li>
              <li>Users acknowledge that all on-chain activity is public by nature and at their own discretion.</li>
            </ul>

            <p className="legal-term-title">17. MODIFICATIONS</p>
            <p className="legal-p">NNM may update these Terms at any time; continued use constitutes acceptance of the updated Terms.</p>

            <p className="legal-term-title">18. GOVERNING LAW & ARBITRATION</p>
            <ul className="legal-ul">
              <li>All disputes are resolved via individual binding arbitration.</li>
              <li>Class actions are waived.</li>
              <li>Governing law: Singapore law and internationally recognized arbitration standards.</li>
            </ul>

            <p className="legal-term-title">19. MISCELLANEOUS</p>
            <ul className="legal-ul mb-0">
              <li>Users agree that NNM is a neutral interface only, providing no financial, legal, or custodial functions.</li>
              <li>Acceptance of these Terms constitutes full waiver of claims against NNM for user-generated actions, misuse, or regulatory consequences.</li>
              <li>These Terms fully cover all liabilities, including name minting, NFT ownership, ChainFace use, and high-risk content control.</li>
            </ul>

            <p className="legal-term-title">20. NNM UTILITY TOKEN & PRESALE EVENTS</p>
            <p className="legal-p">NNM may introduce a platform utility token (“NNM Token”) used exclusively for ecosystem functionality within the NNM Protocol.</p>
            
            <p className="legal-p mt-3"><strong style={{ color: COLORS.TEXT_HEAD }}>a. Pure Utility Nature:</strong><br />
            The NNM Token is intended solely for platform utility purposes including but not limited to:</p>
            <ul className="legal-ul">
              <li>access to specific protocol features,</li>
              <li>ecosystem participation,</li>
              <li>internal platform mechanics and payments.</li>
            </ul>

            <p className="legal-p mt-3"><strong style={{ color: COLORS.TEXT_HEAD }}>b. Explicit Disclaimer of Financial Products:</strong><br />
            The NNM Token is strictly NOT:</p>
            <ul className="legal-ul">
              <li>a security,</li>
              <li>an investment contract,</li>
              <li>a share or equity instrument,</li>
              <li>a financial product,</li>
              <li>a promise of profit, yield, dividend, or return.</li>
            </ul>

            <p className="legal-p mt-3"><strong style={{ color: COLORS.TEXT_HEAD }}>c. Presale & Token Distribution:</strong><br />
            Participation in any optional token distribution, presale event, initial offering, or ecosystem allocation is entirely voluntary and conducted at the user's sole risk. Any funds contributed during a presale are considered payments for future access to platform utility, not investments in a common enterprise.</p>

            <p className="legal-p mt-3"><strong style={{ color: COLORS.TEXT_HEAD }}>d. No Market Guarantees:</strong><br />
            NNM explicitly does not guarantee, support, or promise:</p>
            <ul className="legal-ul">
              <li>future market value,</li>
              <li>secondary market liquidity,</li>
              <li>listings on centralized or decentralized exchanges (CEX/DEX),</li>
              <li>price appreciation or stabilization mechanisms.</li>
            </ul>

            <p className="legal-p mt-3"><strong style={{ color: COLORS.TEXT_HEAD }}>e. Risk Acknowledgment:</strong><br />
            Users acknowledge that digital asset markets are highly volatile, unregulated, and experimental. The NNM Token may lose all value, become illiquid, or become technologically obsolete.</p>

            <p className="legal-p mt-3"><strong style={{ color: COLORS.TEXT_HEAD }}>f. Informational Communications:</strong><br />
            Nothing on the NNM website, interface, documentation, social media channels, or communications shall be interpreted, construed, or relied upon as investment advice, financial promotion, or a solicitation to buy securities.</p>
        </div>

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
