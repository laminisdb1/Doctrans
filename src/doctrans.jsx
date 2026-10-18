import { useEffect, useState, createContext, useContext } from "react";
import {
  Upload, FileText, Check, ArrowRight, CreditCard, X, Download,
  Languages, Shield, Gauge, LayoutGrid, Plus, Receipt, LogOut,
  ChevronRight, Settings, Globe, Play, BarChart3, Users, Sparkles,
  Menu, Eye, EyeOff, Loader2,
} from "lucide-react";
import { supabase } from "./supabase";
import "./doctrans.css";

const BACKEND_URL = "http://localhost:4000";
const LANG_CODE = { Français: "FR", English: "EN", Español: "ES" };

// ============== AUTH CONTEXT ==============
const AuthContext = createContext(undefined);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => { setUser(session?.user ?? null); setLoading(false); }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/` }
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
};

const STRINGS = {
  fr: {
    nav: { new: "Nouvelle traduction", docs: "Mes documents", billing: "Facturation", settings: "Paramètres", logout: "Se déconnecter", login: "Se connecter", signup: "S'inscrire" },
    titles: { new: "Nouvelle traduction", docs: "Mes documents", billing: "Facturation", settings: "Paramètres" },
    plan: "Plan", free: "Gratuit",
    drop: "Glissez un document ici, ou cliquez pour parcourir",
    dropHint: "Word, PDF, PowerPoint — jusqu'à 50 Mo",
    translateBtn: "Lancer la traduction",
    translating: "Traduction en cours, mise en page préservée…",
    done: "Traduction terminée — mise en page identique à l'original",
    download: "Télécharger", newDoc: "Nouveau document",
    changePlan: "Changer de plan", upgradePlan: "Passer au plan Pro",
    billingNote: "Facturation mensuelle, résiliable à tout moment. Paiement par Wave, Orange Money, Carte.",
    settingsLangLabel: "Langue de l'interface",
    settingsLangHint: "Change la langue des menus et des messages de DocTrans.",
    authEmail: "Adresse email",
    authPass: "Mot de passe",
    authSignup: "Créer un compte",
    authLogin: "Se connecter",
    authNoAccount: "Pas encore de compte ?",
    authHasAccount: "Déjà un compte ?",
    authSigning: "Traitement en cours…",
    authError: "Identifiants invalides ou réseau instable",
  },
  en: {
    nav: { new: "New translation", docs: "My documents", billing: "Billing", settings: "Settings", logout: "Log out", login: "Sign in", signup: "Sign up" },
    titles: { new: "New translation", docs: "My documents", billing: "Billing", settings: "Settings" },
    plan: "Plan", free: "Free",
    drop: "Drop a document here, or click to browse",
    dropHint: "Word, PDF, PowerPoint — up to 50 MB",
    translateBtn: "Start translation",
    translating: "Translating — layout being preserved…",
    done: "Translation complete — layout identical to the original",
    download: "Download", newDoc: "New document",
    changePlan: "Change plan", upgradePlan: "Upgrade to Pro",
    billingNote: "Billed monthly, cancel anytime. Pay via Wave, Orange Money, Card.",
    settingsLangLabel: "Interface language",
    settingsLangHint: "Changes the language of DocTrans' menus and messages.",
    authEmail: "Email address",
    authPass: "Password",
    authSignup: "Create account",
    authLogin: "Sign in",
    authNoAccount: "Don't have an account?",
    authHasAccount: "Already have an account?",
    authSigning: "Processing…",
    authError: "Invalid credentials or network issue",
  },
};

/* ============== PREVIEW CARD ============== */
function DocPreviewCard({ lang }) {
  const isFr = lang === "fr";
  return (
    <article className={`doc-card ${isFr ? "doc-card--fr" : "doc-card--en"}`}>
      <header className="doc-card__header">
        <span className="doc-card__lang">{isFr ? "FR — Original" : "EN — Traduit"}</span>
        <span className="doc-card__badge">{isFr ? "Source" : "DocTrans"}</span>
      </header>
      <div className="doc-card__body">
        <p className="doc-card__caption">
          {isFr ? "Contrat de prestation — Art. 4" : "Service Agreement — Art. 4"}
        </p>
        <div className="doc-card__bar doc-card__bar--near-full" />
        <div className="doc-card__bar doc-card__bar--full" />
        <div className="doc-card__bar doc-card__bar--most doc-card__bar--gap" />
        <table className="doc-card__table">
          <thead>
            <tr>
              <th>{isFr ? "Livrable" : "Deliverable"}</th>
              <th>{isFr ? "Échéance" : "Due"}</th>
              <th className="doc-card__cell-right">{isFr ? "Montant" : "Amount"}</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                <td><span className="doc-card__cell doc-card__cell--wide" /></td>
                <td><span className="doc-card__cell doc-card__cell--narrow" /></td>
                <td className="doc-card__cell-right doc-card__amount">
                  {isFr ? "1 200 €" : "€1,200"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="doc-card__bar doc-card__bar--full" />
        <div className="doc-card__bar doc-card__bar--partial doc-card__bar--gap-lg" />
        <div className="doc-card__footer">
          <div>
            <div className="doc-card__sig-line" />
            <div className="doc-card__sig-name">A. Diouf</div>
          </div>
          <div className="doc-card__stamp">{isFr ? "SIGNÉ" : "SIGNED"}</div>
        </div>
      </div>
    </article>
  );
}
function DocumentCompare() {
  return (
    <div className="compare">
      <DocPreviewCard lang="fr" />
      <div className="compare__arrow-wrap">
        <div className="compare__arrow">
          <ArrowRight size={16} color="white" />
        </div>
      </div>
      <DocPreviewCard lang="en" />
    </div>
  );
}

/* ============== AUTH MODAL ============== */
function AuthModal({ mode, setMode, onClose, locale }) {
  const { signIn, signUp } = useAuth();
  const t = STRINGS[locale];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") await signIn(email, password);
      else await signUp(email, password);
      onClose();
    } catch (err) {
      setError(err.message || t.authError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ck-overlay" onClick={onClose}>
      <div className="ck" onClick={(e) => e.stopPropagation()}>
        <header className="ck__header">
          <div>
            <div className="ck__title">
              {mode === "login" ? t.authLogin : t.authSignup}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="ck__close">
            <X size={18} />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="ck__body ck__form">
          <label className="ck__label">{t.authEmail}</label>
          <input
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
            className="ck__input"
          />
          <label className="ck__label mt-4">{t.authPass}</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"} required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="ck__input pr-10"
            />
            <button type="button" className="absolute right-3 top-3 text-gray-400" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <div className="msg-error mt-3">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="btn btn--purple btn--pill btn--block ck__submit mt-4"
          >
            {loading ? <Loader2 size={16} className="animate-spin mr-2 inline" /> : null}
            {loading ? t.authSigning : (mode === "login" ? t.authLogin : t.authSignup)}
          </button>
          <p className="text-center mt-4 text-sm text-slate-500">
            {mode === "login" ? (
              <>{t.authNoAccount} <button type="button" onClick={() => setMode("signup")} className="text-purple-600 font-medium"> {t.authSignup}</button></>
            ) : (
              <>{t.authHasAccount} <button type="button" onClick={() => setMode("login")} className="text-purple-600 font-medium"> {t.authLogin}</button></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

/* ============== LANDING ============== */
function Landing({ goApp, goPricingCheckout, locale, setAuthMode }) {
  const avatars = ["#A78BFA", "#F472B6", "#FBBF24", "#60A5FA"];
  const { user } = useAuth();

  return (
    <div className="landing">
      <header className="nav">
        <div className="nav__inner">
          <a className="nav__brand" href="#">
            <span className="nav__logo">D</span>
            <span className="nav__name">DocTrans</span>
          </a>
          <nav className="nav__links">
            <a href="#fonctionnalites">Produit</a>
            <a href="#tarifs">Tarifs</a>
            <a href="#fonctionnalites">Fonctionnalités</a>
            <a href="#comment">À propos</a>
          </nav>
          <div className="nav__cta">
            {user ? (
              <>
                <button onClick={goApp} className="btn btn--purple btn--pill">
                  Accéder à l'application
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setAuthMode("login")} className="nav__signin">
                  Se connecter
                </button>
                <button onClick={() => setAuthMode("signup")} className="btn btn--purple btn--pill">
                  Commencer
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero__inner">
          <div className="hero__text">
            <h1 className="hero__title">
              Traduisez vite.<br />
              Gardez votre <span className="hero__accent">mise en page</span>.
            </h1>
            <p className="hero__lede">
              Contrats, rapports, présentations : DocTrans traduit le texte tout
              en conservant tableaux, styles et signatures. Une plateforme
              unique pour vos documents professionnels multilingues.
            </p>
            <div className="hero__cta">
              <button onClick={user ? goApp : () => setAuthMode("signup")} className="btn btn--purple btn--pill btn--lg">
                Essai gratuit <ArrowRight size={16} />
              </button>
              <button
                onClick={() => document.getElementById("comment")?.scrollIntoView({ behavior: "smooth" })}
                className="btn btn--ghost-light btn--pill btn--lg"
              >
                <Play size={14} fill="currentColor" /> Voir la démo
              </button>
            </div>
            <div className="hero__proof">
              <div className="hero__avatars">
                {avatars.map((c, i) => (
                  <span key={i} className="hero__avatar" style={{ background: c }} />
                ))}
              </div>
              <span className="hero__proof-text">Utilisé par 10 000+ équipes</span>
            </div>
          </div>
          <div className="hero__art">
            <div className="hero__glow" />
            <div className="hero__doc hero__doc--back" />
            <div className="hero__doc hero__doc--front">
              <div className="hero__doc-line hero__doc-line--short" />
              <div className="hero__doc-line" />
              <div className="hero__doc-line hero__doc-line--long" />
              <div className="hero__doc-line hero__doc-line--short" />
              <div className="hero__doc-line" />
              <div className="hero__doc-badge">
                <Check size={14} /> Traduit
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="logos">
        {["CloudTech", "Nexora", "Zenlic", "DataWave", "Startly", "Proline"].map((name) => (
          <span key={name} className="logos__item">{name}</span>
        ))}
      </section>

      <section className="stats">
        <div className="stats__inner">
          <div className="stats__left">
            <h2 className="stats__title">
              10 000+ équipes<br />nous font confiance
            </h2>
            <p className="stats__lede">
              Des cabinets d'avocats aux équipes marketing, DocTrans s'occupe de
              vos documents dans 22 langues sans casser la mise en page.
            </p>
            <button onClick={user ? goApp : () => setAuthMode("signup")} className="btn btn--purple btn--pill">
              Démarrer maintenant <ArrowRight size={15} />
            </button>
          </div>
          <div className="stats__grid">
            {[
              { v: "92%", l: "Fidélité de mise en page" },
              { v: "350+", l: "Modèles de documents" },
              { v: "18K+", l: "Utilisateurs actifs" },
              { v: "99.9%", l: "Disponibilité" },
            ].map((s) => (
              <div key={s.l} className="stat-card">
                <div className="stat-card__value">{s.v}</div>
                <div className="stat-card__label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tarifs" className="pricing-section">
        <div className="section-head">
          <h2 className="section-head__title">Tarifs simples et transparents</h2>
        </div>
        <div className="plans">
          {[
            {
              name: "Starter", price: "0", tag: "",
              features: ["1 document / mois", "PDF et Word", "22 langues", "Support par email"],
              cta: "Commencer gratuitement", featured: false, amountXof: 0,
            },
            {
              name: "Pro", price: "3 500 F CFA", tag: "Le plus choisi",
              features: ["20 documents / mois", "PDF, Word et PowerPoint", "22 langues, tous sens", "Support prioritaire", "Sans filigrane"],
              cta: "Passer à Pro", featured: true, amountXof: 3500,
            },
            {
              name: "Équipe", price: "8 000 F CFA", tag: "",
              features: ["Documents illimités", "Jusqu'à 8 membres", "Espaces partagés", "API et intégrations", "Facturation centralisée"],
              cta: "Choisir Équipe", featured: false, amountXof: 8000,
            },
          ].map((p) => (
            <div key={p.name} className={`plan ${p.featured ? "plan--featured" : ""}`}>
              {p.tag && <span className="plan__tag">{p.tag}</span>}
              <div className="plan__name">{p.name}</div>
              <div className="plan__price">
                <span className="plan__amount">{p.price}</span>
                {p.amountXof > 0 && <span className="plan__per">/mois</span>}
              </div>
              <ul className="plan__features">
                {p.features.map((f) => (
                  <li key={f}><Check size={16} /> {f}</li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (!user) return setAuthMode("signup");
                  goPricingCheckout(p.name, p.amountXof);
                }}
                className={`btn btn--pill plan__cta ${p.featured ? "btn--purple" : "btn--outline-purple"}`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="fonctionnalites" className="features">
        <div className="features__inner">
          <div className="features__left">
            <span className="features__eyebrow"><Sparkles size={14} /> Fonctionnalités</span>
            <h2 className="features__title">Tout ce qu'il faut pour vos documents multilingues</h2>
            <p className="features__lede">
              Déposez un fichier, choisissez une langue, récupérez le même
              document traduit — mêmes polices, mêmes tableaux, mêmes signatures.
            </p>
          </div>
          <div className="features__right">
            {[
              { icon: BarChart3, title: "Analyses et rapports", desc: "Suivez vos traductions, volumes et coûts par équipe et par langue." },
              { icon: Users, title: "Gestion des utilisateurs", desc: "Invitez des collègues, gérez les rôles et centralisez la facturation." },
              { icon: CreditCard, title: "Paiement local", desc: "Wave, Orange Money, Free Money, Carte bancaire — PayDunya sécurisé." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-row">
                <div className="feature-row__icon"><Icon size={18} /></div>
                <div className="feature-row__body">
                  <h3 className="feature-row__title">{title}</h3>
                  <p className="feature-row__desc">{desc}</p>
                </div>
                <ChevronRight size={18} className="feature-row__chev" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="comment" className="steps-section">
        <div className="section-head">
          <h2 className="section-head__title">Comment ça marche</h2>
        </div>
        <div className="steps">
          {[
            { n: "1", t: "Créez votre compte", d: "Email + mot de passe — 30 secondes." },
            { n: "2", t: "Déposez le fichier", d: "Word, PDF ou PowerPoint, jusqu'à 50 Mo." },
            { n: "3", t: "Choisissez la langue", d: "22 langues, dans les deux sens." },
            { n: "4", t: "Téléchargez le résultat", d: "Même mise en page, texte traduit." },
          ].map((s) => (
            <div key={s.n} className="step">
              <div className="step__num">{s.n}</div>
              <h3 className="step__title">{s.t}</h3>
              <p className="step__desc">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-strip">
        <div className="cta-strip__inner">
          <div>
            <h2 className="cta-strip__title">Prêt à traduire votre premier document ?</h2>
            <p className="cta-strip__lede">Gratuit, sans carte bancaire. Mise en page garantie.</p>
          </div>
          <button onClick={user ? goApp : () => setAuthMode("signup")} className="btn btn--purple btn--pill btn--lg">
            Commencer maintenant <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <span className="nav__logo">D</span><span>DocTrans</span>
          </div>
          <div className="footer__links">
            <a href="#fonctionnalites">Produit</a>
            <a href="#tarifs">Tarifs</a>
            <a href="#comment">À propos</a>
          </div>
          <span className="footer__copy">© 2026 DocTrans — Dakar, Sénégal</span>
        </div>
      </footer>
    </div>
  );
}

/* ============== CHECKOUT WITH PAYDUNYA ============== */
function Checkout({ plan, price, email, onClose, onSuccess, locale }) {
  const t = STRINGS[locale];
  const [step, setStep] = useState(email ? "ready" : "email");
  const [emailInput, setEmailInput] = useState(email || "");
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [error, setError] = useState("");

  const createPayment = async (userEmail) => {
    setStep("loading");
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/payment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          amount: price,
          email: userEmail,
          currency: "XOF",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur paiement");
      setCheckoutUrl(data.checkoutUrl);
      setStep("payment");
    } catch (err) {
      setError(err.message || "Impossible de contacter le serveur de paiement");
      setStep("error");
    }
  };

  const submitEmail = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setError("Email invalide");
      return;
    }
    createPayment(emailInput);
  };

  return (
    <div className="ck-overlay" onClick={onClose}>
      <div className="ck" onClick={(e) => e.stopPropagation()}>
        <header className="ck__header">
          <div>
            <div className="ck__eyebrow">Abonnement</div>
            <div className="ck__title">Plan {plan} — {price.toLocaleString("fr-FR")} F CFA/mois</div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="ck__close">
            <X size={18} />
          </button>
        </header>

        {step === "email" && (
          <form onSubmit={submitEmail} className="ck__body ck__form">
            <label className="ck__label">Email pour la facture</label>
            <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
              placeholder="toi@exemple.com" className="ck__input" />
            {error && <div className="msg-error">{error}</div>}
            <button type="submit" className="btn btn--purple btn--pill btn--block mt-4">Continuer</button>
          </form>
        )}

        {step === "loading" && (
          <div className="ck__body ck__center">
            <Loader2 size={30} className="animate-spin text-purple-600 mb-3" />
            <p>Initialisation du paiement sécurisé…</p>
          </div>
        )}

        {step === "payment" && checkoutUrl && (
          <div className="ck__body ck__center">
            <CreditCard size={36} className="text-purple-600 mb-3" />
            <p className="mb-4 text-sm text-slate-600">
              Paiement via PayDunya — accepte Wave, Orange Money, Free Money et cartes bancaires.
            </p>
            <a href={checkoutUrl} target="_blank" rel="noreferrer"
              className="btn btn--purple btn--pill btn--block mb-3">
              Payer maintenant — {price.toLocaleString("fr-FR")} F CFA
            </a>
            <p className="text-xs text-slate-400">
              Après paiement, vous serez redirigé·e vers votre compte.
            </p>
          </div>
        )}

        {step === "error" && (
          <div className="ck__body ck__center">
            <div className="msg-error mb-3">{error}</div>
            <button onClick={() => setStep("email")} className="btn btn--outline-purple btn--pill">
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============== APP VIEW (POST-LOGIN) ============== */
function AppView({ plan, setPlan, locale, setLocale, onLogout, userEmail }) {
  const t = STRINGS[locale];
  const [view, setView] = useState("new");
  const [stage, setStage] = useState("idle");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [resultName, setResultName] = useState("");
  const [lang, setLang] = useState({ from: "Français", to: "English" });
  const [docs, setDocs] = useState([
    { name: "Contrat_prestation_v2.docx", date: "18 sept.", pair: "FR → EN" },
    { name: "Rapport_annuel_2025.pdf", date: "14 sept.", pair: "FR → EN" },
  ]);

  const acceptFile = (f) => {
    if (!f) return;
    setFile(f); setError(""); setStage("uploaded");
  };
  const onDrop = (e) => { e.preventDefault(); acceptFile(e.dataTransfer.files?.[0]); };
  const onPick = (e) => acceptFile(e.target.files?.[0]);

  const translate = async () => {
    setStage("translating");
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", userEmail);
      formData.append("sourceLang", LANG_CODE[lang.from] || "FR");
      formData.append("targetLang", LANG_CODE[lang.to] || "EN");

      const res = await fetch(`${BACKEND_URL}/api/translate`, {
        method: "POST", body: formData
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erreur ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const outputName = file.name.replace(/\.docx$/i, `.${(LANG_CODE[lang.to] || "en").toLowerCase()}.docx`);
      setResultUrl(url); setResultName(outputName); setStage("done");
      setDocs((d) => [{ name: outputName, date: "Aujourd'hui", pair: `${LANG_CODE[lang.from]} → ${LANG_CODE[lang.to]}` }, ...d]);
    } catch (err) {
      setError(err.message);
      setStage("uploaded");
    }
  };

  return (
    <div className="app">
      <aside className="app__sidebar">
        <div>
          <div className="app__brand">
            <span className="nav__logo">D</span> DocTrans
          </div>
          <nav className="app__nav">
            {[
              { k: "new", label: t.nav.new, icon: Plus },
              { k: "docs", label: t.nav.docs, icon: LayoutGrid },
              { k: "billing", label: t.nav.billing, icon: Receipt },
              { k: "settings", label: t.nav.settings, icon: Settings },
            ].map(({ k, label, icon: Icon }) => (
              <button key={k} onClick={() => setView(k)}
                className={`app__nav-btn ${view === k ? "is-active" : ""}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={onLogout} className="app__logout">
          <LogOut size={16} /> {t.nav.logout}
        </button>
      </aside>

      <main className="app__main">
        <div className="app__topbar">
          <h1 className="app__title">{t.titles[view]}</h1>
          <div className="app__plan-badge">{t.plan} {plan?.name || t.free}</div>
        </div>

        {view === "new" && (
          <div>
            {stage === "idle" && (
              <label onDrop={onDrop} onDragOver={(e) => e.preventDefault()} className="dropzone">
                <Upload size={26} />
                <div className="dropzone__title">{t.drop}</div>
                <div className="dropzone__hint">{t.dropHint}</div>
                <input type="file" hidden onChange={onPick} />
              </label>
            )}
            {stage !== "idle" && (
              <div className="filecard">
                <div className="filecard__name">
                  <FileText size={20} /> <span>{file?.name}</span>
                </div>
                {stage === "uploaded" && (
                  <>
                    {error && <div className="msg-error filecard__error">{error}</div>}
                    <div className="filecard__langs">
                      <select value={lang.from} onChange={(e) => setLang({ ...lang, from: e.target.value })} className="filecard__select">
                        <option>Français</option><option>English</option><option>Español</option>
                      </select>
                      <ArrowRight size={16} />
                      <select value={lang.to} onChange={(e) => setLang({ ...lang, to: e.target.value })} className="filecard__select">
                        <option>English</option><option>Français</option><option>Español</option>
                      </select>
                    </div>
                    <button onClick={translate} className="btn btn--purple btn--pill">
                      {t.translateBtn}
                    </button>
                  </>
                )}
                {stage === "translating" && (
                  <div className="filecard__status">
                    <Loader2 size={16} className="animate-spin inline mr-2" /> {t.translating}
                  </div>
                )}
                {stage === "done" && (
                  <>
                    <div className="filecard__done"><Check size={16} /> {t.done}</div>
                    <div className="filecard__actions">
                      <a href={resultUrl} download={resultName} className="btn btn--ink btn--pill">
                        <Download size={15} /> {t.download}
                      </a>
                      <button onClick={() => { setStage("idle"); setFile(null); setError(""); setResultUrl(null); }}
                        className="btn btn--outline-purple btn--pill">
                        {t.newDoc}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {view === "docs" && (
          <div className="docs">
            {docs.map((d, i) => (
              <div key={i} className={`docs__row ${i > 0 ? "docs__row--sep" : ""}`}>
                <div className="docs__name"><FileText size={16} /> <span>{d.name}</span></div>
                <div className="docs__meta">
                  <span>{d.pair}</span><span>{d.date}</span>
                  <Download size={15} className="docs__dl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {view === "billing" && (
          <div className="billing">
            <div className="billing__top">
              <div>
                <div className="billing__eyebrow">{locale === "fr" ? "Plan actuel" : "Current plan"}</div>
                <div className="billing__plan">
                  {plan ? `${plan.name} — ${plan.price.toLocaleString("fr-FR")} F CFA/mois` : t.free}
                </div>
              </div>
            </div>
            <p className="billing__note mt-4">{t.billingNote}</p>
          </div>
        )}

        {view === "settings" && (
          <div className="settings">
            <div className="settings__card">
              <div className="settings__head">
                <FileText size={18} />
                <div>
                  <div className="settings__title">{locale === "fr" ? "Compte" : "Account"}</div>
                  <p className="settings__hint">{userEmail}</p>
                </div>
              </div>
            </div>
            <div className="settings__card">
              <div className="settings__head">
                <Globe size={18} />
                <div>
                  <div className="settings__title">{t.settingsLangLabel}</div>
                  <p className="settings__hint">{t.settingsLangHint}</p>
                </div>
              </div>
              <div className="settings__langs">
                {[{ code: "fr", label: "Français" }, { code: "en", label: "English" }].map((l) => (
                  <button key={l.code} onClick={() => setLocale(l.code)}
                    className={`settings__lang ${locale === l.code ? "is-active" : ""}`}>
                    {locale === l.code && <Check size={14} />} {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ============== ROOT EXPORT ============== */
export default function DocTrans() {
  return (
    <AuthProvider>
      <DocTransApp />
    </AuthProvider>
  );
}

function DocTransApp() {
  const { user, signOut } = useAuth();
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [plan, setPlan] = useState(null);
  const [locale, setLocale] = useState("fr");

  useEffect(() => {
    if (user) setScreen("app");
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    setScreen("landing");
    setPlan(null);
  };

  const openCheckout = (planName, price) => {
    setCheckout({ plan: planName, price });
  };

  return (
    <>
      {screen === "landing" && (
        <Landing
          goApp={() => setScreen("app")}
          goPricingCheckout={openCheckout}
          locale={locale}
          setAuthMode={setAuthMode}
        />
      )}

      {screen === "app" && user && (
        <AppView
          plan={plan}
          setPlan={setPlan}
          locale={locale}
          setLocale={setLocale}
          onLogout={handleLogout}
          userEmail={user.email}
        />
      )}

      {authMode && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setAuthMode(null)}
          locale={locale}
        />
      )}

      {checkout && (
        <Checkout
          plan={checkout.plan}
          price={checkout.price}
          email={user?.email || ""}
          onClose={() => setCheckout(null)}
          locale={locale}
        />
      )}
    </>
  );
}