import React from "react";
import { 
  ArrowRight, ShieldCheck, Zap, Layout, Lock, CheckCircle2, 
  Globe, Users, Sparkles, ChevronDown, FileText, Upload, 
  Download, Play, Clock, Layers, Eye, Database
} from "lucide-react";
import "../doctrans.css"; // Ensure the path to your CSS is correct

export default function Landing({ goApp, goPricingCheckout, goLogin, goSignup }) {
  return (
    <div className="landing-page">
      
      {/* =========================================
          STICKY NAVBAR
      ========================================= */}
      <nav className="landing-navbar">
        <div className="landing-logo" onClick={goApp} style={{ cursor: 'pointer' }}>
          <span className="logo-dot">●</span> DocTrans
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="landing-auth-buttons">
          <button onClick={goLogin} className="btn-outline">Log in</button>
          <button onClick={goSignup} className="btn-primary">Sign Up</button>
        </div>
      </nav>

      {/* =========================================
          HERO SECTION
      ========================================= */}
      <header className="landing-hero">
        <div className="hero-text">
          <div className="hero-badge">
            <Sparkles size={14} /> Now in Early Access
          </div>
          <h1>Translate documents without breaking the layout.</h1>
          <p>
            DocTrans is the privacy-first translation engine built for professionals. 
            Keep your tables, fonts, and images intact while translating into 22+ languages.
          </p>
          <div className="hero-actions">
            <button onClick={goSignup} className="btn-primary btn-large">
              Get Started for Free <ArrowRight size={18} />
            </button>
            <button onClick={goApp} className="btn-outline btn-large">
              <Play size={18} /> Try the App
            </button>
          </div>
          <p className="hero-subtext">No credit card required. Free tier available.</p>
        </div>
        
        <div className="hero-visual">
          <div className="visual-card">
            <div className="visual-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="visual-body">
              <div className="visual-line long"></div>
              <div className="visual-line short"></div>
              <div className="visual-line medium"></div>
              <div className="visual-stat">
                <span>Layout</span> Preserved
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================
          SOCIAL PROOF / INTEGRATIONS BAR
      ========================================= */}
      <section className="landing-proof">
        <p className="proof-title">Works with your existing tools</p>
        <div className="proof-logos">
          <span>Google Drive</span>
          <span>Dropbox</span>
          <span>OneDrive</span>
          <span>Notion</span>
          <span>Slack</span>
        </div>
      </section>

      {/* =========================================
          PROBLEM / SOLUTION SECTION
      ========================================= */}
      <section className="landing-problem">
        <div className="problem-grid">
          <div className="problem-card problem">
            <h3>The Problem</h3>
            <p>Traditional translation tools destroy your formatting. You spend hours re-building tables, fixing fonts, and re-inserting images.</p>
          </div>
          <div className="problem-card solution">
            <h3>The Solution</h3>
            <p>DocTrans uses a layout-aware engine. We translate the text but preserve the structure, so your document looks exactly the same in any language.</p>
          </div>
        </div>
      </section>

      {/* =========================================
          FEATURE DEEP DIVE
      ========================================= */}
      <section id="features" className="landing-features">
        <div className="section-header">
          <h2>Everything you need to translate with confidence</h2>
          <p>Built for accuracy, speed, and security.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <Layout className="feature-icon" />
            <h3>Format Preservation</h3>
            <p>Tables, columns, headers, and footers remain exactly where they should be.</p>
          </div>
          <div className="feature-card">
            <ShieldCheck className="feature-icon" />
            <h3>Privacy First</h3>
            <p>Your documents are encrypted and never used to train public models. Your data stays yours.</p>
          </div>
          <div className="feature-card">
            <Zap className="feature-icon" />
            <h3>Fast Processing</h3>
            <p>Translate hundreds of pages in minutes with our optimized batch engine.</p>
          </div>
          <div className="feature-card">
            <Globe className="feature-icon" />
            <h3>22+ Languages</h3>
            <p>Support for all major European and Asian languages, with more added monthly.</p>
          </div>
          <div className="feature-card">
            <FileText className="feature-icon" />
            <h3>Multiple Formats</h3>
            <p>Upload PDF, DOCX, PPTX, and XLSX files. We handle the rest.</p>
          </div>
          <div className="feature-card">
            <Users className="feature-icon" />
            <h3>Team Collaboration</h3>
            <p>Share projects, assign reviews, and manage glossaries with your team.</p>
          </div>
        </div>
      </section>

      {/* =========================================
          HOW IT WORKS (TIMELINE)
      ========================================= */}
      <section id="how-it-works" className="landing-steps">
        <div className="section-header">
          <h2>How it works</h2>
          <p>Three simple steps to a perfectly formatted translation.</p>
        </div>
        
        <div className="steps-container">
          <div className="step">
            <div className="step-icon-wrapper">
              <Upload className="step-icon" />
            </div>
            <h4>1. Upload</h4>
            <p>Drag and drop your document securely into the dashboard.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-icon-wrapper">
              <Layers className="step-icon" />
            </div>
            <h4>2. Translate</h4>
            <p>Our engine processes the text while keeping the design intact.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-icon-wrapper">
              <Download className="step-icon" />
            </div>
            <h4>3. Download</h4>
            <p>Get your translated document, ready to use immediately.</p>
          </div>
        </div>
      </section>

      {/* =========================================
          TRUST & SECURITY SECTION
      ========================================= */}
      <section className="landing-trust">
        <div className="trust-content">
          <h2>Your documents are safe with us.</h2>
          <p>We take security seriously. DocTrans is built with privacy at its core.</p>
          <div className="trust-badges">
            <div className="badge">
              <Lock className="badge-icon" />
              <span>End-to-End Encryption</span>
            </div>
            <div className="badge">
              <Eye className="badge-icon" />
              <span>No Data Training</span>
            </div>
            <div className="badge">
              <Database className="badge-icon" />
              <span>Secure Cloud Storage</span>
            </div>
            <div className="badge">
              <Clock className="badge-icon" />
              <span>Auto-Delete Option</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          COMPARISON TABLE
      ========================================= */}
      <section className="landing-comparison">
        <div className="section-header">
          <h2>Why DocTrans is different</h2>
          <p>See how we compare to traditional translation tools.</p>
        </div>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>DocTrans</th>
                <th>Traditional Tools</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Format Preservation</td>
                <td><CheckCircle2 className="text-green" size={20} /></td>
                <td><span className="text-red">✕</span></td>
              </tr>
              <tr>
                <td>Privacy First (No Training)</td>
                <td><CheckCircle2 className="text-green" size={20} /></td>
                <td><span className="text-red">✕</span></td>
              </tr>
              <tr>
                <td>Batch Processing</td>
                <td><CheckCircle2 className="text-green" size={20} /></td>
                <td><span className="text-red">✕</span></td>
              </tr>
              <tr>
                <td>Team Collaboration</td>
                <td><CheckCircle2 className="text-green" size={20} /></td>
                <td><span className="text-red">✕</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================
          PRICING PREVIEW
      ========================================= */}
      <section id="pricing" className="landing-pricing">
        <div className="section-header">
          <h2>Simple, honest pricing</h2>
          <p>Start for free. Upgrade when you need more.</p>
        </div>
        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>Ponctuel</h3>
            <div className="price">0€<span>/mo</span></div>
            <p className="pricing-desc">For occasional use.</p>
            <ul>
              <li><CheckCircle2 size={16} /> 5 pages / month</li>
              <li><CheckCircle2 size={16} /> Basic translation</li>
            </ul>
            <button onClick={goApp} className="btn-outline w-full">Get Started</button>
          </div>
          <div className="pricing-card popular">
            <div className="popular-badge">Most Popular</div>
            <h3>Pro</h3>
            <div className="price">29€<span>/mo</span></div>
            <p className="pricing-desc">For professionals.</p>
            <ul>
              <li><CheckCircle2 size={16} /> Unlimited pages</li>
              <li><CheckCircle2 size={16} /> Format preservation</li>
              <li><CheckCircle2 size={16} /> Priority support</li>
            </ul>
            <button onClick={() => goPricingCheckout("Pro", 29)} className="btn-primary w-full">Upgrade to Pro</button>
          </div>
          <div className="pricing-card">
            <h3>Équipe</h3>
            <div className="price">79€<span>/mo</span></div>
            <p className="pricing-desc">For teams.</p>
            <ul>
              <li><CheckCircle2 size={16} /> Everything in Pro</li>
              <li><CheckCircle2 size={16} /> 5 team members</li>
              <li><CheckCircle2 size={16} /> Admin dashboard</li>
            </ul>
            <button onClick={() => goPricingCheckout("Équipe", 79)} className="btn-outline w-full">Upgrade to Team</button>
          </div>
        </div>
      </section>

      {/* =========================================
          FAQ ACCORDION
      ========================================= */}
      <section id="faq" className="landing-faq">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about DocTrans.</p>
        </div>
        <div className="faq-list">
          <details className="faq-item">
            <summary>Is my data used to train AI models?</summary>
            <p>No. Your documents are never used for training. We are a privacy-first company, and your data is encrypted and only accessible to you.</p>
          </details>
          <details className="faq-item">
            <summary>What file types do you support?</summary>
            <p>We currently support PDF, DOCX, PPTX, and XLSX files. More formats are being added regularly.</p>
          </details>
          <details className="faq-item">
            <summary>Can I cancel my subscription at any time?</summary>
            <p>Yes. You can cancel your subscription from your dashboard at any time, no questions asked.</p>
          </details>
          <details className="faq-item">
            <summary>How accurate is the translation?</summary>
            <p>We use state-of-the-art neural machine translation models. For specialized fields, we recommend using our custom glossary feature.</p>
          </details>
        </div>
      </section>

      {/* =========================================
          FINAL CTA BANNER
      ========================================= */}
            {/* =========================================
          FINAL CTA BANNER (Redesigned)
      ========================================= */}
      <section className="landing-final-cta-wrapper">
        <div className="landing-final-cta">
          {/* Decorative glowing background elements */}
          <div className="cta-glow cta-glow-1"></div>
          <div className="cta-glow cta-glow-2"></div>
          
          <div className="cta-content">
            <h2>Ready to translate without the headaches?</h2>
            <p>Join our early access and start translating documents the right way.</p>
            <div className="cta-actions">
              <button onClick={goSignup} className="btn-cta">
                Start Your Free Trial <ArrowRight size={18} />
              </button>
            </div>
            <span className="cta-subtext">No credit card required.</span>
          </div>
        </div>
      </section>

      {/* =========================================
          FOOTER
      ========================================= */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="landing-logo"><span className="logo-dot">●</span> DocTrans</div>
            <p>The privacy-first document translation engine.</p>
          </div>
          <div className="footer-links-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#how-it-works">How it works</a>
          </div>
          <div className="footer-links-col">
            <h4>Company</h4>
            <a href="#faq">FAQ</a>
            <span onClick={goLogin} style={{ cursor: 'pointer' }}>Login</span>
            <span onClick={goSignup} style={{ cursor: 'pointer' }}>Sign Up</span>
          </div>
          <div className="footer-links-col">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} DocTrans. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}