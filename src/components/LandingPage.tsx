import { motion } from "motion/react";
import { TreePine, ArrowRight, Shield, Award, Sparkles, Sprout, Recycle, Users, MessageSquare } from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const steps = [
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      title: "1. Find Your Cause",
      description: "Select from core focus domains like reforestation, marine cleanups, education assistance, or food distribution."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-blue-600" />,
      title: "2. Connect Nearby",
      description: "Instantly link with neighbors, civic clubs, and eco-businesses sharing your coordinates and skills."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-amber-600" />,
      title: "3. Create & Join Events",
      description: "Organize neighborhood cleanups, blood drives, or teaching circles. Invite volunteers and set limits."
    },
    {
      icon: <Award className="w-6 h-6 text-emerald-600" />,
      title: "4. Track Impact Live",
      description: "Convert physical activities into public milestones, verifying your cumulative trees, hours, and score."
    },
    {
      icon: <Recycle className="w-6 h-6 text-blue-600" />,
      title: "5. Recirculate Waste",
      description: "Connecting local hospitality groups and marriage halls with bio-composting networks to process organic soil feeds."
    },
    {
      icon: <Sprout className="w-6 h-6 text-emerald-600" />,
      title: "6. Build Eco-Communities",
      description: "Support organic farming and complete the loop, converting daily urban scrap to regional crop bounty."
    }
  ];

  const highlights = [
    {
      title: "Community Network",
      metric: "12,400+",
      sub: "Active Changemakers",
      label: "Volunteers, non-profits, and green hubs connecting daily."
    },
    {
      title: "Carbon Offset",
      metric: "98.2 Tons",
      sub: "CO2 Equivalent Saved",
      label: "Diverting wet food from landfill to biological aeration."
    },
    {
      title: "Bio-Fertilizer",
      metric: "12,500 Kg",
      sub: "Compost Generated",
      label: "High-grade organic fertilizer distributed to county farms."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans overflow-x-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        
        {/* Navigation Floating Header */}
        <header className="flex justify-between items-center py-4 border-b border-slate-200 mb-16 backdrop-blur-md bg-white/80 sticky top-0 z-50 px-4 sm:px-8 rounded-full shadow-sm mt-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <span className="font-bold text-xl tracking-tight text-emerald-900 italic">
              Impact <span className="text-emerald-600">Circle</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onLogin}
              id="nav-login-btn"
              className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-750 hover:text-emerald-700 transition-all font-sans hover:bg-slate-100"
            >
              Sign In
            </button>
            <button
              onClick={onRegister}
              id="nav-join-btn"
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-200 flex items-center space-x-1.5"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* HERO SECTION */}
        <section id="hero" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-emerald-600 uppercase bg-emerald-100 rounded-full">
              Sustainability Ecosystem of the Year & Reforestation Hub
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-slate-900">
              Turn Good Intentions Into <br />
              <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">
                Collective Action
              </span>
            </h1>
            
            <p className="text-slate-500 text-base sm:text-lg max-w-xl leading-relaxed">
              Connect with people who care about the same causes, organize impactful initiatives, and transform organic waste into sustainable resources. Inspired by circular economies and powered by AI matching.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onRegister}
                id="hero-join"
                className="group relative px-8 py-4 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <span>Join the Movement</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onLogin}
                id="hero-explore"
                className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
              >
                <span>Sign In to Explorer</span>
              </button>
            </div>
          </div>

          {/* ANIMATED ILLUSTRATIONS GRID */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="p-6 bg-white border border-slate-100 shadow-md rounded-2xl flex flex-col justify-between min-h-[160px]"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
                <TreePine className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1 leading-snug">Volunteers</h3>
                <p className="text-xs text-slate-500">Planting saplings and safeguarding wildlands.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-6 bg-white border border-slate-100 shadow-md rounded-2xl flex flex-col justify-between min-h-[160px] lg:mt-6"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-650 mb-6">
                <Recycle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1 leading-snug">Waste Circularity</h3>
                <p className="text-xs text-slate-500">Vesting wet scraps into bio-composting lines.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="p-6 bg-white border border-slate-100 shadow-md rounded-2xl flex flex-col justify-between min-h-[160px]"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1 leading-snug">Organic Fertilizer</h3>
                <p className="text-xs text-slate-500">Enabling farm nutrients and robust harvests.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="p-6 bg-white border border-slate-100 shadow-md rounded-2xl flex flex-col justify-between min-h-[160px] lg:mt-6"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-5 flex bg-purple-50 items-center justify-center text-purple-650 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1 leading-snug">AI Matchmaking</h3>
                <p className="text-xs text-slate-500">Aligning local causes to nearby team skills.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* METRICS DISCOVERY */}
        <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8 sm:p-12 mb-32 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="flex justify-center items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-bounce"></div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-90">Live Impact Ledger</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
              Decentralized Environmental Action Metrics
            </h2>
            <p className="text-emerald-100 text-sm max-w-lg mx-auto">
              We compile real-time social metrics and municipal organic transfers to track environmental transformation publicly.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((h, i) => (
              <div key={i} className="text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="text-xs text-emerald-250 font-bold tracking-wider uppercase mb-2">
                  {h.title}
                </div>
                <div className="text-3xl sm:text-4xl font-black mb-1">
                  {h.metric}
                </div>
                <div className="text-xs text-emerald-100 font-semibold mb-3">{h.sub}</div>
                <p className="text-xs text-slate-100 max-w-xs mx-auto leading-relaxed">{h.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS CHRONICLE */}
        <section id="how-it-works" className="space-y-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-xs text-emerald-600 font-bold tracking-widest uppercase mb-3">
              Circular Flow Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Cultivating Change In 6 Easy Loops
            </h2>
            <p className="text-slate-500 text-sm mt-4">
              Explore how both community events and bio-waste collection chains sync on Impact Circle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((st, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 transition-all duration-300 group flex flex-col justify-between space-y-6 shadow-sm hover:shadow"
              >
                <div className="w-12 h-12 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                  {st.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-2">{st.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{st.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ADVISORY FOOTER */}
        <footer className="mt-32 pt-12 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
          <p>© 2026 Impact Circle Ecosystem. All rights reserved.</p>
          <p>Created by Google AI Studio Build to promote actionable climate loops.</p>
        </footer>

      </div>
    </div>
  );
}
