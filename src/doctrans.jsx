import { useState, useEffect } from "react";
import Landing from "./components/Landing";
import AppView from "./components/AppView";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import Signup from "./components/Signup";
import "./doctrans.css";
import { supabase } from './supabase';

const BACKEND_URL = "http://localhost:4000";

export default function DocTrans() {
  // 1. Initialize screen from localStorage, fallback to "landing"
  const [screen, setScreen] = useState(() => {
    try {
      return localStorage.getItem("doctrans_screen") || "landing";
    } catch {
      return "landing";
    }
  });

  const [checkout, setCheckout] = useState(null);
  const [plan, setPlan] = useState(null);
  const [locale, setLocale] = useState("fr");
  const [email, setEmailState] = useState(() => {
    try { return localStorage.getItem("doctrans_email") || ""; } catch { return ""; }
  });

  // 2. Save screen to localStorage whenever it changes
  useEffect(() => {
    try { localStorage.setItem("doctrans_screen", screen); } catch {}
  }, [screen]);

  const setEmail = (value) => {
    setEmailState(value);
    try { localStorage.setItem("doctrans_email", value); } catch {}
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setEmail(session.user.email);
      setScreen('app');
    }
  };
  checkSession();

  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      setEmail(session.user.email);
      setScreen('app');
    }
  });

  return () => {
    authListener.subscription.unsubscribe();
  };
 }, []);

  const openCheckout = (planName, price) => setCheckout({ plan: planName, price });
  
  const handleLogout = () => { 
    setScreen("landing"); 
    setPlan(null); 
    // Clear local storage on logout
    try { localStorage.removeItem("doctrans_screen"); } catch {}
  };

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
            setEmail(userEmail); // Save the email!
            setScreen("app");
          }} 
          goSignup={() => setScreen("signup")} 
          goBack={() => setScreen("landing")}
        />
      )}
      {screen === "signup" && (
        <Signup 
          onSignupSuccess={(userEmail) => {
            setEmail(userEmail); // Save the email!
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