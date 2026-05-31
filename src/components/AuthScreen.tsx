import React, { useState } from "react";
import { Sprout, Lock, Mail, User, ShieldAlert, Sparkles, MapPin, Compass, ArrowRight } from "lucide-react";

interface AuthScreenProps {
  onSuccess: (user: any) => void;
  onBackToLanding: () => void;
}

export function AuthScreen({ onSuccess, onBackToLanding }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "verify">("login");
  
  // Registration / Onboarding Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"volunteer" | "producer" | "collector" | "fertilizer_company">("volunteer");
  
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState<"Weekdays" | "Weekends" | "Flexible">("Flexible");
  const [address, setAddress] = useState("Civic Center, San Francisco, CA");
  
  const availableCauses = [
    "Environment", "Tree Plantation", "Animal Welfare", "Education", 
    "Blood Donation", "Healthcare", "Community Service", "Food Distribution", "Sustainability"
  ];

  const availableSkills = [
    "Teaching", "Design", "Programming", "Photography", "Event Management", "Medical Support", "Marketing"
  ];

  const toggleCause = (cause: string) => {
    setSelectedCauses(prev => 
      prev.includes(cause) ? prev.filter(c => c !== cause) : [...prev, cause]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || "volunteer@impactcircle.org" })
      });
      const data = await response.json();
      if (data.success) {
        onSuccess(data.user);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate latitude and longitude based on general SF location
    const lat = 37.7749 + (Math.random() - 0.5) * 0.05;
    const lng = -122.4194 + (Math.random() - 0.5) * 0.05;

    const payload = {
      name: name || "Demo Member",
      email: email || "member@impactcircle.org",
      role,
      causes: selectedCauses.length ? selectedCauses : ["Environment", "Sustainability"],
      skills: selectedSkills,
      availability,
      location: { lat, lng, address }
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        setMode("verify"); // Show verification UI
        setTimeout(() => {
          onSuccess(data.user);
        }, 3000); // Redirect after short simulation
      }
    } catch (err) {
      console.error("Register failed:", err);
    }
  };

  const triggerGoogleSignIn = () => {
    // Simulated Google login
    const randomUserObj = {
      id: "google-oauth-1",
      email: "google.user@gmail.com",
      name: "Riley Thomas",
      role: "volunteer",
      causes: ["Environment", "Tree Plantation"],
      skills: ["Teaching", "Photography"],
      availability: "Flexible",
      location: { lat: 37.7801, lng: -122.4120, address: "Mission Dist, San Francisco, CA" },
      impactScore: 230,
      communityRank: 18,
      volunteerHours: 12,
      treesPlanted: 6,
      wasteDiverted: 0,
      compostProduced: 0,
      badges: []
    };
    onSuccess(randomUserObj);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-55 bg-slate-50 p-4 text-slate-900 relative font-sans overflow-y-auto selection:bg-emerald-100 selection:text-emerald-950">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl relative z-10 my-8">
        
        {/* LOGO TITLE */}
        <div className="text-center mb-8">
          <button onClick={onBackToLanding} className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-all mb-4 text-xs">
            <Compass className="w-3.5 h-3.5" />
            <span>Back to Landing Page</span>
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <div className="w-6 h-6 border-4 border-white rounded-full"></div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            {mode === "login" && "Welcome Internally to Impact Circle"}
            {mode === "register" && "Create Your Changemaker Account"}
            {mode === "forgot" && "Reset Password Chain"}
            {mode === "verify" && "Awaiting Secure Email Verification"}
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
            {mode === "login" && "Enter your email credentials to login. Or join as new."}
            {mode === "register" && "Let's configure your custom skills, physical causes and local coordinates to help AI match nearby clubs."}
            {mode === "forgot" && "Provide your email address to deploy a custom reset link."}
            {mode === "verify" && "We sent a secret code to your mailbox safely. Enjoy the circular loop onboarding!"}
          </p>
        </div>

        {/* 1. LOGIN MODE */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-5 max-w-md mx-auto">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="volunteer@impactcircle.org"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-sans"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-sans"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-slate-500 hover:text-emerald-600 font-semibold transition-all"
              >
                Forgot Password?
              </button>
              <span className="text-slate-400 font-medium">Demo Code bypass enabled</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-emerald-650 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide transition-all duration-150 shadow-md shadow-emerald-250 flex items-center justify-center space-x-2 mt-4"
            >
              <span>Authenticate Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Google Sign-In */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">Or continue with</span>
            </div>

            <button
              type="button"
              onClick={triggerGoogleSignIn}
              className="w-full py-3 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs tracking-wide transition-all flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Google Identity</span>
            </button>

            <p className="text-center text-xs text-slate-500 mt-6 font-medium">
              New to our ecosystem?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-emerald-600 hover:underline font-extrabold transition-all"
              >
                Create an Account
              </button>
            </p>
          </form>
        )}

        {/* 2. REGISTRATION & ONBOARDING */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Profile Role Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Your Role</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: "volunteer", label: "Volunteer Node", desc: "Causes & drives" },
                  { value: "producer", label: "Waste Producer", desc: "Restaurants/hotels" },
                  { value: "collector", label: "Waste Collector", desc: "Bio-composting hubs" },
                  { value: "fertilizer_company", label: "Organic Agro Corp", desc: "Crop fertilizer" }
                ].map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value as any)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      role === r.value 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold" 
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-100/50"
                    }`}
                  >
                    <span className="text-xs font-bold">{r.label}</span>
                    <span className="text-[10px] text-slate-500 mt-1">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CAUSES SELECTIONS */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Causes You Advocate For</label>
              <div className="flex flex-wrap gap-2">
                {availableCauses.map(cause => {
                  const active = selectedCauses.includes(cause);
                  return (
                    <button
                      key={cause}
                      type="button"
                      onClick={() => toggleCause(cause)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        active
                          ? "bg-emerald-600 text-white font-semibold shadow-sm"
                          : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {cause}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SKILLS SELECTION */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Your Professional Skills</label>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map(skill => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        active
                          ? "bg-blue-600 text-white font-semibold shadow-sm"
                          : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* AVAILABILITY */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Availability Pattern</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 transition-all font-sans"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                >
                  <option value="Flexible">Flexible / Anytime</option>
                  <option value="Weekends">Weekends Only</option>
                  <option value="Weekdays">Weekdays Only</option>
                </select>
              </div>

              {/* LOCATION */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Geographic Address Selection</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-3 pl-4 pr-10 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <div className="absolute right-3.5 top-3.5 text-slate-500 font-mono text-[9px] uppercase">
                    Map-Locked
                  </div>
                </div>
              </div>
            </div>

            {/* SIMULATED MAP VISUAL PREVIEW BOX */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-105">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Interlinked Map Coordinate Registry</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Anchoring address vicinity inside San Francisco boundary grids.</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-850 font-bold font-mono px-2.5 py-1 rounded-full uppercase">
                LAT: 37.77 / LNG: -122.41
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-emerald-600 hover:bg-emerald-755 hover:bg-emerald-700 text-white font-extrabold text-sm tracking-wide transition-all duration-150 flex items-center justify-center space-x-2 shadow-md shadow-emerald-250"
            >
              <span>Complete Onboarding & Verify</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-500 mt-4">
              Already have a registered node?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-emerald-600 font-bold hover:underline transition-all"
              >
                Sign In Instead
              </button>
            </p>
          </form>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {mode === "forgot" && (
          <form className="space-y-5 max-w-sm mx-auto" onSubmit={(e) => { e.preventDefault(); setMode("login"); }}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Registered Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="alex@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-full text-sm transition-all shadow-md shadow-emerald-250"
            >
              Request Reset Mailer Link
            </button>

            <p className="text-center text-xs">
              <button type="button" onClick={() => setMode("login")} className="text-emerald-600 hover:underline">
                Back to Login Page
              </button>
            </p>
          </form>
        )}

        {/* 4. VERIFY EMAIL SECURITY MODE */}
        {mode === "verify" && (
          <div className="text-center p-6 space-y-6 max-w-xs mx-auto">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto animate-pulse border border-emerald-100">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">One-Time Verifying Loop</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Securing your cryptographic member profile database. Translating credentials...
              </p>
            </div>

            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4].map(idx => (
                <div
                  key={idx}
                  className="w-10 h-12 bg-slate-50 border border-slate-250 rounded-xl text-emerald-600 text-lg font-bold flex items-center justify-center animate-bounce"
                  style={{ animationDelay: `${idx * 0.15}s` }}
                >
                  *
                </div>
              ))}
            </div>

            <span className="inline-block text-[10px] text-emerald-700 font-bold py-1 px-3 rounded-full bg-emerald-50 animate-pulse border border-emerald-100">
              Auto Redirecting to Dashboard...
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
