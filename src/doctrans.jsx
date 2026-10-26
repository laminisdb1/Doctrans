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
  // 1. THE FIX: SUPABASE AUTH LISTENER
  // ==========================================
  useEffect(() => {
    // Check session on page load
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log("✅ Session found on load:", session.user.email);
        setEmail(session.user.email);
        setScreen("app");
      } else {
        console.log("❌ No session found on load.");
        // If no session, default to landing page
        setScreen("landing");
      }
      setCheckingAuth(false);
    };
    
    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔔 Auth Event:", event);
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
  // 2. CHECKOUT LOGIC
  // ==========================================
  const openCheckout = (planName, price) => setCheckout({ plan: planName, price });
  
  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    setScreen("landing"); 
    setPlan(null); 
    setEmailState(""); 
  };

  // Show loading screen while checking auth
  if (checkingAuth) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontSize: '1.2rem', color: '#64748b' }}>Checking authentication...</div>;
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
          onLoginSuccess={(userEmail) => {
            setEmail(userEmail);
            setScreen("app");
          }} 
          goSignup={() => setScreen("signup")} 
          goBack={() => setScreen("landing")}
        />
      )}
      {screen === "signup" && (
        <Signup 
          onSignupSuccess={(userEmail) => {
            setEmail(userEmail);
            setScreen("app");
          }} 
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