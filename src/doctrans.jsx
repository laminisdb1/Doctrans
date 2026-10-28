import { useState, useEffect } from "react";
import Landing from "./components/Landing";
import AppView from "./components/AppView";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { supabase } from "./supabase";
import "./doctrans.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://doctrans-backend.onrender.com";

export default function DocTrans() {
  const [screen, setScreen] = useState("landing");
  const [checkingAuth, setCheckingAuth] = useState(true); 
  const [checkout, setCheckout] = useState(null);
  const [plan, setPlan] = useState(null);
  const [locale, setLocale] = useState("en");
  const [email, setEmailState] = useState("");

  const setEmail = (value) => {
    setEmailState(value);
    try { localStorage.setItem("doctrans_email", value); } catch {}
  };

  // ==========================================
  // MASTER AUTH LISTENER
  // ==========================================
  useEffect(() => {
    // 1. Check for a session on page load (Refresh fix)
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setEmail(session.user.email);
        setScreen("app"); 
      } else {
        setScreen("landing");
      }
      setCheckingAuth(false); 
    };
    
    initializeAuth();

    // 2. Listen for auth changes (Instant Login/Logout fix)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setEmail(session.user.email);
        setScreen("app"); 
      } else if (event === 'SIGNED_OUT') {
        setEmail("");
        setScreen("landing");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ==========================================
  // CHECKOUT & PAYMENT LOGIC
  // ==========================================
  const refreshAccount = (forEmail) => {
    if (!forEmail) return;
    fetch(`${BACKEND_URL}/api/account?email=${encodeURIComponent(forEmail)}`)
      .then((res) => res.json())
      .then((acc) => {
        if (acc.subscription?.status === "active") {
          const price = { Pro: 29, Équipe: 79 }[acc.subscription.plan] || null;
          setPlan({ name: acc.subscription.plan, price });
        }
      })
      .catch(() => {});
  };

  const openCheckout = (planName, price) => setCheckout({ plan: planName, price });
  
  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    setScreen("landing"); 
    setPlan(null); 
    setEmailState(""); 
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  if (checkingAuth) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #4D6FE6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: '#64748b', fontWeight: '600' }}>Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {screen === "landing" && (
        <Landing 
          goApp={() => setScreen("app")} 
          goPricingCheckout={openCheckout}
          goLogin={() => setScreen("login")} 
          goSignup={() => setScreen("signup")} 
        />
      )}
      {screen === "login" && (
        <Login 
          goSignup={() => setScreen("signup")} 
          goBack={() => setScreen("landing")}
        />
      )}
      {screen === "signup" && (
        <Signup 
          goLogin={() => setScreen("login")} 
          goBack={() => setScreen("landing")}
        />
      )}
      {screen === "app" && (
        <AppView
          onOpenCheckout={openCheckout}
          plan={plan} locale={locale} setLocale={setLocale}
          onLogout={handleLogout} email={email} setEmail={setEmail}
        />
      )}
      {checkout && (
        <Checkout
          plan={checkout.plan} price={checkout.price} email={email}
          onEmailCaptured={setEmail} onClose={() => setCheckout(null)}
        />
      )}
    </div>
  );
}