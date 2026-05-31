import { Sprout, Compass, Users, TreePine, Recycle, Cpu, ShieldCheck, LogOut, Award } from "lucide-react";

interface NavigationProps {
  currentRole: 'volunteer' | 'producer' | 'collector' | 'fertilizer_company' | 'admin';
  onToggleRole: (role: string) => void;
  currentTab: string;
  onChangeTab: (tab: string) => void;
  userName: string;
  userImpactScore: number;
  onLogout: () => void;
}

export function Navigation({
  currentRole,
  onToggleRole,
  currentTab,
  onChangeTab,
  userName,
  userImpactScore,
  onLogout
}: NavigationProps) {
  
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <Compass className="w-4 h-4" /> },
    { id: "community", label: "Communities", icon: <Users className="w-4 h-4" /> },
    { id: "events", label: "Events", icon: <TreePine className="w-4 h-4" /> },
    { id: "waste-marketplace", label: "Waste Eco-system", icon: <Recycle className="w-4 h-4" /> },
    { id: "ai-workspace", label: "AI Center", icon: <Cpu className="w-4 h-4" /> }
  ];

  // If role is admin, allow access to Admin Panel
  if (currentRole === 'admin') {
    tabs.push({ id: "admin-panel", label: "Admin Console", icon: <ShieldCheck className="w-4 h-4" /> });
  }

  const roleLabels: Record<string, { label: string; bg: string; text: string }> = {
    volunteer: { label: "Volunteer Node", bg: "bg-emerald-500/10", text: "text-emerald-400" },
    producer: { label: "Wet Waste Producer", bg: "bg-orange-500/10", text: "text-orange-400" },
    collector: { label: "Waste Collector", bg: "bg-blue-500/10", text: "text-blue-400" },
    fertilizer_company: { label: "Compost Aggregator", bg: "bg-purple-500/10", text: "text-purple-400" },
    admin: { label: "Platform Admin", bg: "bg-pink-500/10", text: "text-pink-400" }
  };

  return (
    <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* BRAND HEADER */}
        <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onChangeTab("dashboard")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <Sprout className="w-5.5 h-5.5 text-slate-950" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white hover:text-emerald-400 transition-colors">
              Impact <span className="text-emerald-400">Circle</span>
            </span>
          </div>

          {/* ACTIVE PERSPECTIVE CAP */}
          <div className="hidden sm:flex items-center space-x-2 bg-white/5 pl-3 pr-2.5 py-1.5 rounded-full border border-white/5">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Node Persona:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${roleLabels[currentRole]?.bg} ${roleLabels[currentRole]?.text}`}>
              {roleLabels[currentRole]?.label}
            </span>
          </div>
        </div>

        {/* NAVIGATION TAB CONTROLLERS */}
        <div className="flex items-center overflow-x-auto space-x-1 no-scrollbar pb-1 md:pb-0">
          {tabs.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap ${
                  active
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/15"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* USER SECTIONS & ROLE INTERPOLATOR */}
        <div className="flex items-center justify-between sm:justify-end space-x-4">
          
          {/* PROFILE CARD */}
          <div className="flex items-center space-x-3 text-left">
            <div className="text-xs">
              <div className="font-bold text-slate-200 line-clamp-1 max-w-[120px]">{userName}</div>
              <div className="flex items-center space-x-1 text-emerald-400 font-bold mt-0.5 text-[10px]">
                <Award className="w-3.5 h-3.5" />
                <span>{userImpactScore} pts</span>
              </div>
            </div>
          </div>

          {/* SIMULATIVE SWITCHER POPUP CONTROL */}
          <div className="relative">
            <select
              value={currentRole}
              onChange={(e) => onToggleRole(e.target.value)}
              className="bg-slate-900 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer shadow-lg hover:bg-slate-800 transition-colors"
              title="Switch Node Persona"
            >
              <option value="volunteer">Alex Rivera (Volunteer)</option>
              <option value="producer">Chef Amelia (Producer)</option>
              <option value="collector">BioRecycle (Collector)</option>
              <option value="fertilizer_company">EcoAgro (Fertilizer)</option>
              <option value="admin">Platform Manager (Admin)</option>
            </select>
          </div>

          {/* EXIT TRIGGER */}
          <button
            onClick={onLogout}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 border border-white/5 text-slate-400 flex items-center justify-center transition-colors"
            title="Disconnect Profile Space"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>
    </nav>
  );
}
