import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  // Screen-routing states: 'landing' | 'auth' | 'app_dashboard'
  const [screen, setScreen] = useState<'landing' | 'auth' | 'app_dashboard'>('landing');
  const [user, setUser] = useState<any | null>(null);

  // Sync profile session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            setScreen('app_dashboard');
          }
        }
      } catch (err) {
        // App is booting up or offline, fallback to landing defaults
        console.log("Awaiting full-stack Express server activation...", err);
      }
    };
    checkActiveSession();
  }, []);

  const handleAuthSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    setScreen('app_dashboard');
  };

  const handleLogout = async () => {
    try {
      // Toggle or reset user back to guest
      setUser(null);
      setScreen('landing');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-950">
      {screen === 'landing' && (
        <LandingPage 
          onStart={() => setScreen('auth')} 
          onExplore={() => setScreen('auth')} 
        />
      )}

      {screen === 'auth' && (
        <AuthScreen 
          onSuccess={handleAuthSuccess} 
          onBackToLanding={() => setScreen('landing')} 
        />
      )}

      {screen === 'app_dashboard' && user && (
        <Dashboard 
          user={user} 
          onUpdateUser={(updated) => setUser(updated)} 
        />
      )}
    </div>
  );
}
export { App };
