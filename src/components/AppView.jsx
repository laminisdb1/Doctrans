import React, { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Plus, FileText, CreditCard, Settings, LogOut,
  UploadCloud, Globe, Search, Bell, ArrowUpRight, Award,
  X, Menu, ArrowRightLeft, File, Check, User, Shield,
  Sliders, AlertTriangle, Trash2, Download
} from "lucide-react";
import "../doctrans.css";

export default function AppView({
  onOpenCheckout, plan, locale, setLocale, onLogout, email, setEmail,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Translation State
  const [sourceLang, setSourceLang] = useState("Auto-Detect");
  const [targetLang, setTargetLang] = useState("French (FR)");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // API & Usage State
  const [translating, setTranslating] = useState(false);
  const [translatedDoc, setTranslatedDoc] = useState(null); 
  const [documents, setDocuments] = useState([]); 
  const [translationsUsed, setTranslationsUsed] = useState(0);
  const MAX_FREE_TRANSLATIONS = 2;

  // Settings State
  const [defaultLang, setDefaultLang] = useState("French (FR)");
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const fileInputRef = useRef(null);
  const displayName = email ? email.split("@")[0] : "User";

  // Fetch Account Usage & Documents
  useEffect(() => {
    if (email) {
      // Use hardcoded URL for now to bypass Netlify env var issues
      const backendUrl = "https://doctrans-backend.onrender.com";
      
      // Fetch Account Status (Usage)
      fetch(`${backendUrl}/api/account?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.subscription) {
            setTranslationsUsed(data.subscription.translationsUsed || 0);
          }
        })
        .catch(err => console.error(err));

      // Fetch Documents
      if (activeTab === "documents") {
        fetch(`${backendUrl}/api/documents?email=${encodeURIComponent(email)}`)
          .then(res => res.json())
          .then(data => setDocuments(data))
          .catch(err => console.error(err));
      }
    }
  }, [activeTab, email]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFile(file); setTranslatedDoc(null); }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { setSelectedFile(file); setTranslatedDoc(null); }
  };

  const handleSwap = () => {
    if (sourceLang === "Auto-Detect") return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const handleTranslate = async () => {
    if (!selectedFile) return;
    setTranslating(true);
    setTranslatedDoc(null);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("sourceLang", sourceLang);
    formData.append("targetLang", targetLang);
    formData.append("email", email);
    formData.append("preserveLayout", preserveLayout);

    try {
      // HARDCODED URL TO BYPASS NETLIFY ENV VARIABLE ISSUES
      const backendUrl = "https://doctrans-backend.onrender.com";
      
      // DEBUG ALERT: This will tell us exactly where it is sending the file
      alert(`Sending to: ${backendUrl}/api/translate`);

      const response = await fetch(`${backendUrl}/api/translate`, {
        method: "POST",
        body: formData,
      });

      // Check if the response is actually JSON (not an HTML error page)
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        throw new Error("Server error. Please ensure the backend is running or check CORS.");
      }

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "FREE_LIMIT_REACHED") {
          onOpenCheckout("Pro", 29);
          return; 
        }
        throw new Error(data.error || "Translation failed.");
      }

      setTranslatedDoc(data.document);
      if (data.translationsUsed !== undefined) {
        setTranslationsUsed(data.translationsUsed);
      }
      
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setTranslating(false);
    }
  };

  const resetTranslation = () => {
    setSelectedFile(null);
    setTranslatedDoc(null);
  };

  return (
    <div className="eduplex-layout">
      {/* SIDEBAR */}
      <aside className={`eduplex-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-logo">
          <div className="logo-icon-box"><span className="logo-symbol">D</span></div>
          <span className="logo-text">DocTrans</span>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} color="#ffffff" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={`nav-btn ${activeTab === "new" ? "active" : ""}`} onClick={() => setActiveTab("new")}>
            <Plus size={18} /> New Translation
          </button>
          <button className={`nav-btn ${activeTab === "documents" ? "active" : ""}`} onClick={() => setActiveTab("documents")}>
            <FileText size={18} /> My Documents
          </button>
          <button className={`nav-btn ${activeTab === "billing" ? "active" : ""}`} onClick={() => setActiveTab("billing")}>
            <CreditCard size={18} /> Billing
          </button>
          <button className={`nav-btn ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
            <Settings size={18} /> Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="promo-card">
            <div className="promo-icon"><Award size={20} /></div>
            <p>Upgrade to Pro</p>
            <span>Unlock unlimited translations.</span>
            <button onClick={() => onOpenCheckout("Pro", 29)}>Upgrade Now</button>
          </div>
          <button className="logout-btn" onClick={onLogout}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="eduplex-main">
        <header className="eduplex-header">
          <div className="header-greeting">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} color="#111827" />
            </button>
            <div>
              <h1>
                {activeTab === "dashboard" && <>Welcome back, <span>{displayName}</span> 👋</>}
                {activeTab === "new" && "New Translation"}
                {activeTab === "documents" && "My Documents"}
                {activeTab === "billing" && "Billing & Plans"}
                {activeTab === "settings" && "Account Settings"}
              </h1>
              <p>
                {activeTab === "dashboard" && "Here is your translation overview for today."}
                {activeTab === "new" && "Upload your document and select the languages."}
                {activeTab === "billing" && "Manage your subscription and billing details."}
                {activeTab === "settings" && "Manage your account preferences."}
                {activeTab === "documents" && "View and manage your translated files."}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <div className="search-bar"><Search size={16} /><input type="text" placeholder="Search..." /></div>
            <button className="icon-btn"><Bell size={18} /></button>
            <div className="header-avatar">{email ? email[0].toUpperCase() : "U"}</div>
          </div>
        </header>

        <div className="dashboard-grid">
          
          {/* DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <>
              <div className="grid-main">
                <div className="quick-actions-row">
                  <div className="action-card" onClick={() => setActiveTab("new")}>
                    <div className="action-icon bg-purple"><UploadCloud size={20} /></div>
                    <div className="action-info"><h4>New Upload</h4><p>Translate a file</p></div>
                  </div>
                  <div className="action-card">
                    <div className="action-icon bg-green"><FileText size={20} /></div>
                    <div className="action-info"><h4>Recent Files</h4><p>{translationsUsed} translated</p></div>
                  </div>
                  <div className="action-card">
                    <div className="action-icon bg-orange"><Globe size={20} /></div>
                    <div className="action-info"><h4>Languages</h4><p>22 available</p></div>
                  </div>
                </div>
                <div className="chart-card">
                  <div className="card-header">
                    <h3>Translation Activity</h3>
                    <select className="chart-select"><option>This Week</option></select>
                  </div>
                  <div className="chart-container">
                    <div className="mock-chart">
                      {[40, 70, 45, 90, 65, 85, 50].map((height, i) => (
                        <div key={i} className="chart-bar-wrapper">
                          <div className="chart-bar" style={{ height: `${height}%` }}></div>
                          <span className="chart-label">{['M','T','W','T','F','S','S'][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid-side">
                <div className="side-card plan-card">
                  <div className="plan-header">
                    <div className="plan-badge-icon">D</div>
                    <div><h4>DocTrans {plan ? plan.name : "Free"}</h4><p>Current Plan</p></div>
                  </div>
                  <p className="plan-desc">
                    {plan && plan.name !== "Free" 
                      ? "Unlimited translations remaining." 
                      : `You have ${Math.max(0, MAX_FREE_TRANSLATIONS - translationsUsed)} of ${MAX_FREE_TRANSLATIONS} free translations left.`}
                  </p>
                  <button className="btn-lime" onClick={() => onOpenCheckout("Pro", 29)}>Upgrade Plan <ArrowUpRight size={16} /></button>
                </div>
                <div className="side-card">
                  <div className="card-header"><h3>Recent Activity</h3></div>
                  <div className="activity-feed">
                    <div className="feed-item">
                      <div className="feed-dot bg-green"></div>
                      <div className="feed-text"><h4>Document Translated</h4><p>Q3_Financials.pdf ➔ ES</p><span>2 hours ago</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* NEW TRANSLATION VIEW (WITH PAYWALL) */}
          {activeTab === "new" && (
            <div className="translation-workspace">
              <div className="translation-card">
                
                {/* PAYWALL: If limit reached, replace form with Upgrade UI */}
                {(!plan || plan.name === "Free") && translationsUsed >= MAX_FREE_TRANSLATIONS ? (
                  <div className="translation-success-state">
                    <div className="success-icon-wrapper" style={{ background: '#fee2e2' }}>
                      <Award size={40} style={{ color: '#ef4444' }} />
                    </div>
                    <h3>Free Limit Reached</h3>
                    <p>You have used your {MAX_FREE_TRANSLATIONS} free translations.</p>
                    <p>Upgrade to Pro to unlock unlimited translations and preserve your layout.</p>
                    <button className="btn-primary w-full mt-4" onClick={() => onOpenCheckout("Pro", 29)}>
                      Upgrade to Pro Now
                    </button>
                  </div>
                ) : translatedDoc ? (
                  // SUCCESS STATE
                  <div className="translation-success-state">
                    <div className="success-icon-wrapper"><Check size={40} className="success-icon" /></div>
                    <h3>Translation Complete!</h3>
                    <p>Your document is ready to download.</p>
                    <a href={translatedDoc.url} download className="btn-download" target="_blank" rel="noreferrer">
                      <Download size={20} /> Download {translatedDoc.name}
                    </a>
                    <button className="btn-outline-sm mt-4" onClick={resetTranslation}>Translate another document</button>
                  </div>
                ) : (
                  // UPLOAD FORM
                  <>
                    <div 
                      className={`beautiful-dropzone ${isDragging ? "dragging" : ""} ${selectedFile ? "has-file" : ""}`}
                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden-file-input" accept=".pdf,.doc,.docx,.ppt,.pptx" />
                      {!selectedFile ? (
                        <>
                          <div className="dropzone-icon-wrapper"><UploadCloud size={32} className="dropzone-icon" /></div>
                          <h3>Drag & drop your document here</h3>
                          <p>or <span className="browse-text">browse your files</span></p>
                          <p className="hint">Word, PDF, PowerPoint — up to 50 MB</p>
                        </>
                      ) : (
                        <div className="selected-file-display">
                          <div className="file-icon-box"><File size={24} /></div>
                          <div className="file-details">
                            <h3>{selectedFile.name}</h3>
                            <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button className="remove-file-btn" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}><X size={18} /></button>
                        </div>
                      )}
                    </div>

                    <div className="language-section">
                      <div className="lang-group">
                        <label>From</label>
                        <div className="custom-select-wrapper">
                          <Globe size={16} className="select-icon" />
                          <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                            <option>Auto-Detect</option><option>English (EN)</option><option>French (FR)</option><option>Spanish (ES)</option>
                          </select>
                        </div>
                      </div>
                      <button className="swap-btn" onClick={handleSwap} title="Swap"><ArrowRightLeft size={18} /></button>
                      <div className="lang-group">
                        <label>To</label>
                        <div className="custom-select-wrapper">
                          <Globe size={16} className="select-icon" />
                          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                            <option>French (FR)</option><option>English (EN)</option><option>Spanish (ES)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button className="btn-translate" disabled={!selectedFile || translating} onClick={handleTranslate}>
                      {translating ? "Translating..." : "Translate Document"}
                      {!translating && <ArrowRightLeft size={18} style={{ transform: 'rotate(90deg)' }} />}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* DOCUMENTS VIEW */}
          {activeTab === "documents" && (
            <div className="documents-table-card">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Language</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-8 text-muted">No documents translated yet.</td></tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id}>
                        <td><FileText size={16} /> {doc.name}</td>
                        <td>{doc.lang}</td>
                        <td>{doc.date}</td>
                        <td><span className="status-badge success">{doc.status}</span></td>
                        <td>
                          <a href={doc.url} download className="btn-download-sm" target="_blank" rel="noreferrer">
                            <Download size={16} /> Download
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* BILLING VIEW (Simplified for now) */}
          {activeTab === "billing" && (
            <div className="empty-view" style={{ gridColumn: '1 / -1' }}>
              <CreditCard size={48} />
              <h2>Billing</h2>
              <p>You are on the {plan ? plan.name : "Free"} plan.</p>
              <button className="btn-primary" onClick={() => onOpenCheckout("Pro", 29)}>Upgrade</button>
            </div>
          )}

          {/* SETTINGS VIEW (Simplified for now) */}
          {activeTab === "settings" && (
             <div className="empty-view" style={{ gridColumn: '1 / -1' }}>
               <Settings size={48} />
               <h2>Settings</h2>
               <p>Manage your account details.</p>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}