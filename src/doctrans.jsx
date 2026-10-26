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
  const [checkingAuth, setCheckingAuth] = useState(true); // Prevents flashing login page
  const [checkout, setCheckout] = useState(null);
  const [plan, setPlan] = useState(null);
  const [locale, setLocale] = useState("en");
  
  const [email, setEmailState] = useState(() => {
    try { return localStorage.getItem("doctrans_email") || ""; } catch { return ""; }
  });

  const setEmail = (value) => {
    setEmailState(value);
    try { localStorage.setItem("doctrans_email", value); } catch {}
  };

  // ==========================================
  // 1. SUPABASE AUTH LISTENER (The Fix)
  // ==========================================
  useEffect(() => {
    // Check if there is a session when the page loads (after Google redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Supabase Session Check:", session);
      if (session) {
        setEmail(session.user.email);
        setScreen("app");
      } else {
        // If no session, check local storage for the last screen
        try {
          const savedScreen = localStorage.getItem("doctrans_screen");
          if (savedScreen) setScreen(savedScreen);
        } catch {}
      }
      setCheckingAuth(false);
    });

    // Listen for auth changes (Login / Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event, session);
      if (session) {
        setEmail(session.user.email);
        setScreen("app");
      } else if (event === 'SIGNED_OUT') {
        setScreen("landing");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Save screen to localStorage whenever it changes
  useEffect(() => {
    try { localStorage.setItem("doctrans_screen", screen); } catch {}
  }, [screen]);

  // ==========================================
  // 2. CHECKOUT LOGIC
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("checkout");
    const planName = params.get("plan");

    if (result === "success" && planName) {
      setScreen("app");
      let pending = null;
      try { pending = JSON.parse(localStorage.getItem("doctrans_pending_checkout") || "null"); } catch {}
      if (pending?.token) {
        fetch(`${BACKEND_URL}/api/checkout/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: pending.token }),
        })
          .then((res) => res.json())
          .catch(() => null)
          .finally(() => {
            try { localStorage.removeItem("doctrans_pending_checkout"); } catch {}
            refreshAccount(email);
          });
      } else {
        const price = { Ponctuel: 0, Pro: 29, Équipe: 79 }[planName] || null;
        setPlan({ name: planName, price });
      }
    }
    if (result) window.history.replaceState({}, "", window.location.pathname);
  }, [email]);

  const openCheckout = (planName, price) => setCheckout({ plan: planName, price });
  
  const handleLogout = async () => { 
    await supabase.auth.signOut(); // Clear Supabase session
    setScreen("landing"); 
    setPlan(null); 
    setEmailState(""); 
    try { localStorage.removeItem("doctrans_screen"); } catch {}
  };

  // Show a loading screen while checking auth to prevent flashing
  if (checkingAuth) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>Loading...</div>;
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