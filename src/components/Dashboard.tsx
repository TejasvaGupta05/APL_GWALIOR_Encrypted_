import React, { useState, useEffect } from "react";
import { 
  Compass, Users, TreePine, Recycle, Cpu, ShieldCheck, 
  Sprout, Award, Clock, MapPin, Sparkles, Filter, CheckCircle2, 
  Send, Heart, MessageSquare, Plus, PlusCircle, AlertCircle, ArrowUpRight,
  TrendingUp, Trash2, Calendar, HardHat, FileText, Check, AlertTriangle, LogOut
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";

interface DashboardProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  onLogout: () => void;
}

export function Dashboard({ user, onUpdateUser, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Macro State Collections (synchronized with Express API)
  const [communities, setCommunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [wasteListings, setWasteListings] = useState<any[]>([]);

  // Selection states
  const [selectedCommunity, setSelectedCommunity] = useState<any | null>(null);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [communityChats, setCommunityChats] = useState<any[]>([]);

  // Forms Input States
  const [newPostContent, setNewPostContent] = useState("");
  const [newChatContent, setNewChatContent] = useState("");
  const [postCommentInputs, setPostCommentInputs] = useState<Record<string, string>>({});
  
  // Event Form State
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    category: "Tree Plantation",
    locationName: "",
    date: "",
    time: "",
    volunteerLimit: "20",
    materialName: "",
    materialQty: "",
  });

  // Circular Waste Form State
  const [wasteFormData, setWasteFormData] = useState({
    weight: "80",
    wasteType: "vegetable_peels",
    description: "",
    location: user.location?.address || "Downtown SF Hub"
  });

  // AI Inputs & Outputs States
  const [aiCauseText, setAiCauseText] = useState("");
  const [aiCauseResult, setAiCauseResult] = useState<any | null>(null);
  const [aiEventText, setAiEventText] = useState("");
  const [aiEventResult, setAiEventResult] = useState<any | null>(null);
  const [aiPredictorData, setAiPredictorData] = useState({
    businessType: "Hotel / Buffet Facility",
    averageDailyWasteKg: "150"
  });
  const [aiPredictorResult, setAiPredictorResult] = useState<any | null>(null);
  const [aiReportResult, setAiReportResult] = useState<string | null>(null);

  // Load Status Indicators
  const [loadingAI, setLoadingAI] = useState<Record<string, boolean>>({
    cause: false,
    event: false,
    predictor: false,
    report: false
  });

  // Admin summary state
  const [adminOverview, setAdminOverview] = useState<any | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const resComm = await fetch("/api/communities");
      const dataComm = await resComm.json();
      setCommunities(dataComm);

      const resEv = await fetch("/api/events");
      const dataEv = await resEv.json();
      setEvents(dataEv);

      const resWaste = await fetch("/api/waste-listings");
      const dataWaste = await resWaste.json();
      setWasteListings(dataWaste);

      // Default select first community for inner feed/chats
      if (dataComm.length > 0 && !selectedCommunity) {
        setSelectedCommunity(dataComm[0]);
      }
    } catch (err) {
      console.error("Error pulling platform records:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // Polling update
    return () => clearInterval(interval);
  }, []);

  // Fetch posts and chats when selectedCommunity changes
  useEffect(() => {
    if (selectedCommunity) {
      const fetchCommunityInnerDetails = async () => {
        try {
          const resPosts = await fetch(`/api/communities/${selectedCommunity.id}/posts`);
          const posts = await resPosts.json();
          setCommunityPosts(posts);

          const resChats = await fetch(`/api/chats/${selectedCommunity.id}`);
          const chats = await resChats.json();
          setCommunityChats(chats);
        } catch (err) {
          console.error("Error retrieving community dashboard nodes:", err);
        }
      };
      fetchCommunityInnerDetails();
    }
  }, [selectedCommunity]);

  // Handle switching roles instantly
  const handleToggleRoleInDashboard = async (targetRole: string) => {
    try {
      const res = await fetch("/api/auth/toggle-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole })
      });
      const data = await res.json();
      if (data.success) {
        onUpdateUser(data.user);
        fetchData();
      }
    } catch (err) {
      console.error("Error switching profile node perspective:", err);
    }
  };

  // Synchronize user profile metrics periodically from session endpoint
  const syncUserProfile = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data.user) {
        onUpdateUser(data.user);
      }
    } catch (err) {
      console.log("Error sync profile:", err);
    }
  };

  // --- ACTIONS HANDLERS ---

  // Post handling
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !selectedCommunity) return;

    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostContent })
      });
      const post = await response.json();
      setCommunityPosts(prev => [post, ...prev]);
      setNewPostContent("");
      syncUserProfile();
    } catch (err) {
      console.error("Post creation error:", err);
    }
  };

  // Post Like
  const handleLikePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await response.json();
      if (data.success) {
        setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
      }
    } catch (err) {
      console.error("Like post failed:", err);
    }
  };

  // Comment submit
  const handleCommentSubmit = async (postId: string) => {
    const commentTxt = postCommentInputs[postId];
    if (!commentTxt?.trim()) return;

    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentTxt })
      });
      if (response.ok) {
        setPostCommentInputs(prev => ({ ...prev, [postId]: "" }));
        // Refresh posts for selected community
        const resPosts = await fetch(`/api/communities/${selectedCommunity.id}/posts`);
        const posts = await resPosts.json();
        setCommunityPosts(posts);
      }
    } catch (err) {
      console.error("Comment submit error:", err);
    }
  };

  // Community Chats submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatContent.trim() || !selectedCommunity) return;

    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: selectedCommunity.id, content: newChatContent })
      });
      const chat = await response.json();
      setCommunityChats(prev => [...prev, chat]);
      setNewChatContent("");

      // Simulated automated friendly responses from nearby organizers after a short delay
      setTimeout(() => {
        const organizerAnswers = [
          "Hey there! Thanks for matching up on this. We are coordinating the local spades checklist.",
          "Awesome point Alex! Let's get more environmental nodes aligned before June 15.",
          "Perfect! We can bundle waste transfers into compost loads together.",
          "Welcome to the Circle! Every sapling helps secure global biodiversity."
        ];
        const randomAnswer = organizerAnswers[Math.floor(Math.random() * organizerAnswers.length)];
        
        setCommunityChats(prev => [
          ...prev, 
          {
            id: `msg-sim-${Date.now()}`,
            senderId: "sim-organizer",
            senderName: "Sarah Jenkins (Circle Lead)",
            senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sarah",
            content: randomAnswer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            channelId: selectedCommunity.id
          }
        ]);
      }, 1500);

    } catch (err) {
      console.error("Chat message send failed:", err);
    }
  };

  // Join / Leave Event
  const handleToggleJoinEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/join`, { method: "POST" });
      const data = await response.json();
      if (data.success) {
        // Toggle join state in events list
        setEvents(prev => prev.map(e => {
          if (e.id === eventId) {
            const hasJoined = e.volunteers.includes(user.id);
            return {
              ...e,
              volunteers: hasJoined 
                ? e.volunteers.filter((id: string) => id !== user.id)
                : [...e.volunteers, user.id]
            };
          }
          return e;
        }));
        syncUserProfile();
      }
    } catch (err) {
      console.error("Error joining event:", err);
    }
  };

  // Create Event Form submission
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: eventFormData.title,
      description: eventFormData.description,
      category: eventFormData.category,
      locationName: eventFormData.locationName,
      date: eventFormData.date,
      time: eventFormData.time,
      volunteerLimit: eventFormData.volunteerLimit,
      resources: eventFormData.materialName 
        ? [{ name: eventFormData.materialName, quantity: eventFormData.materialQty || "Standard quantity", required: true }]
        : []
    };

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setShowEventForm(false);
        setEventFormData({
          title: "",
          description: "",
          category: "Tree Plantation",
          locationName: "",
          date: "",
          time: "",
          volunteerLimit: "20",
          materialName: "",
          materialQty: "",
        });
        fetchData();
        syncUserProfile();
      }
    } catch (err) {
      console.error("Create event submit error:", err);
    }
  };

  // --- WASTE MARKETPLACE ACTORS CONTROLLS ---
  const handleUploadWasteScrap = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/waste-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wasteFormData)
      });
      if (response.ok) {
        setWasteFormData(prev => ({ ...prev, weight: "100", description: "" }));
        fetchData();
        syncUserProfile();
      }
    } catch (err) {
      console.error("Error listing organic scraps:", err);
    }
  };

  const handleScheduleWastePickup = async (listingId: string) => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    try {
      const response = await fetch(`/api/waste-listings/${listingId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: tomorrow })
      });
      if (response.ok) {
        fetchData();
        syncUserProfile();
      }
    } catch (err) {
      console.error("Error scheduling pickup:", err);
    }
  };

  const handleCollectWaste = async (listingId: string) => {
    try {
      const response = await fetch(`/api/waste-listings/${listingId}/collect`, { method: "POST" });
      if (response.ok) {
        fetchData();
        syncUserProfile();
      }
    } catch (err) {
      console.error("Error completing pickup collection:", err);
    }
  };

  const handleProcessWasteToFertilizer = async (listingId: string) => {
    try {
      const response = await fetch(`/api/waste-listings/${listingId}/process`, { method: "POST" });
      if (response.ok) {
        fetchData();
        syncUserProfile();
      }
    } catch (err) {
      console.error("Error processing bio soil fertilizer compost:", err);
    }
  };

  // Approving events by admin
  const handleVerifyEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/verify`, { method: "POST" });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error verifying activity:", err);
    }
  };

  // --- AI GENERATIVE AI SERVICE HANDLERS ---
  const executeAICauseMatching = async () => {
    if (!aiCauseText.trim()) return;
    setLoadingAI(prev => ({ ...prev, cause: true }));
    try {
      const res = await fetch("/api/ai/cause-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiCauseText })
      });
      const data = await res.json();
      setAiCauseResult(data);
    } catch (err) {
      console.error("AI matching failed:", err);
    } finally {
      setLoadingAI(prev => ({ ...prev, cause: false }));
    }
  };

  const executeAIEventPlannerBlueprint = async () => {
    if (!aiEventText.trim()) return;
    setLoadingAI(prev => ({ ...prev, event: true }));
    try {
      const res = await fetch("/api/ai/event-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiEventText })
      });
      const data = await res.json();
      setAiEventResult(data);
    } catch (err) {
      console.error("AI Planner run error:", err);
    } finally {
      setLoadingAI(prev => ({ ...prev, event: false }));
    }
  };

  const executeAIWastePrediction = async () => {
    setLoadingAI(prev => ({ ...prev, predictor: true }));
    try {
      const res = await fetch("/api/ai/waste-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: aiPredictorData.businessType,
          averageDailyWasteKg: aiPredictorData.averageDailyWasteKg
        })
      });
      const data = await res.json();
      setAiPredictorResult(data);
    } catch (err) {
      console.error("AI Optimization predicted error:", err);
    } finally {
      setLoadingAI(prev => ({ ...prev, predictor: false }));
    }
  };

  const executeAIImpactNewsletter = async () => {
    setLoadingAI(prev => ({ ...prev, report: true }));
    try {
      const res = await fetch("/api/ai/impact-insights", { method: "POST" });
      const data = await res.json();
      setAiReportResult(data.report);
    } catch (err) {
      console.error("AI Insights error:", err);
    } finally {
      setLoadingAI(prev => ({ ...prev, report: false }));
    }
  };

  // Pull Admin stats if on Admin Console
  useEffect(() => {
    if (activeTab === "admin-panel") {
      const fetchAdminStats = async () => {
        try {
          const res = await fetch("/api/admin/overview");
          const data = await res.json();
          setAdminOverview(data);
        } catch (err) {
          console.error("Admin overview stats pull error:", err);
        }
      };
      fetchAdminStats();
    }
  }, [activeTab, events, wasteListings, user]);

  // Simulated chart metrics derived from live calculations
  const totalWasteProcessed = wasteListings
    .filter(w => w.status === 'processed')
    .reduce((sum, item) => sum + item.weight, 0);

  const mockWeeklyEmissionsSaved = [
    { name: "Week 1", saving: 4500, compost: 1100 },
    { name: "Week 2", saving: 5400, compost: 1400 },
    { name: "Week 3", saving: 6100, compost: 1550 },
    { name: "Week 4", saving: 7300, compost: 1900 },
    { name: "Current", saving: 7300 + (totalWasteProcessed * 1.7), compost: 1900 + (totalWasteProcessed * 0.2) }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      
      {/* GLOBAL BANNER HEADER / NAVIGATION WRAPPER */}
      <nav className="border-b border-slate-250 border-slate-200 bg-white/85 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <div className="w-4 h-4 border-2 border-white rounded-full"></div>
              </div>
              <span className="font-bold text-lg tracking-tight text-emerald-950 italic hover:text-emerald-700 transition-colors">
                Impact <span className="text-emerald-600">Circle</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-2 bg-slate-100 pl-3 pr-2.5 py-1.5 rounded-full border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Role Node:</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                {user.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* CHOOSE TAB SELECTION BAR */}
          <div className="flex items-center overflow-x-auto space-x-1 no-scrollbar pb-1 md:pb-0">
            {[
              { id: "dashboard", label: "Dashboard", icon: <Compass className="w-4 h-4" /> },
              { id: "community", label: "Communities", icon: <Users className="w-4 h-4" /> },
              { id: "events", label: "Events Platform", icon: <TreePine className="w-4 h-4" /> },
              { id: "waste-marketplace", label: "Waste Circularity", icon: <Recycle className="w-4 h-4" /> },
              { id: "ai-workspace", label: "AI Solver Space", icon: <Cpu className="w-4 h-4" /> },
              ...(user.role === 'admin' ? [{ id: "admin-panel", label: "Admin Console", icon: <ShieldCheck className="w-4 h-4" /> }] : [])
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap ${
                    active
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-250"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE PERSONA QUICK SWITCHER DROP-DOWN */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800">{user.name}</div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-end space-x-0.5 mt-0.5">
                <Award className="w-3 h-3" />
                <span>{user.impactScore} points</span>
              </div>
            </div>

            <div className="relative flex items-center gap-2">
              <select
                value={user.role}
                onChange={(e) => handleToggleRoleInDashboard(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm hover:bg-slate-100 transition-colors mr-1"
                title="Switch Node Persona"
              >
                <option value="volunteer">Alex Rivera (Volunteer)</option>
                <option value="producer">Chef Amelia (Producer)</option>
                <option value="collector">BioRecycle (Collector)</option>
                <option value="fertilizer_company">EcoAgro (Fertilizer)</option>
                <option value="admin">Platform Manager (Admin)</option>
              </select>

              <button
                onClick={onLogout}
                id="header-logout-btn"
                className="flex items-center space-x-1 px-2.5 py-2 rounded-xl text-xs font-bold bg-red-50 border border-red-200 text-red-700 hover:text-red-800 hover:bg-red-100 transition-all cursor-pointer shadow-sm"
                title="Sign Out Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

        </div>
      </nav>

      {/* BODY WORKSPACE AREA */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* TOP SYSTEM WARNING DIALOG CLOCK ACCENT */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 animate-pulse border border-emerald-100">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Impact Circular Loops Actively Synchronized</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Explore how your choices translate to physical soil enrichment and public reforestation achievements.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-right">
            <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border border-emerald-500/10 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>SF Local Time Loop Active</span>
            </div>
          </div>
        </div>

        {/* 1. DASHBOARD VIEW CHAT SHEETS */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Dashboard left area: Stats charts & widgets */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Core Impact Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Impact Score", value: `${user.impactScore} pts`, sub: "Global ranking index", icon: <Award className="w-5 h-5 text-emerald-400" /> },
                  { label: "Community Rank", value: `#${user.communityRank}`, sub: "Node standing", icon: <Compass className="w-5 h-5 text-blue-400" /> },
                  { label: "Volunteer Hours", value: `${user.volunteerHours} hrs`, sub: "Allocated work sessions", icon: <Clock className="w-5 h-5 text-orange-400" /> },
                  { label: "Waste Organic Loops", value: `${user.wasteDiverted + user.compostProduced} kg`, sub: "Diverted & bio-composted", icon: <Recycle className="w-5 h-5 text-purple-400" /> }
                ].map((stat, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400 mb-4">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-white">{stat.value}</div>
                      <div className="text-[9.5px] text-slate-500 mt-0.5">{stat.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Visualizer */}
              <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-extrabold text-white text-base">Carbon Mitigation & Organic Yield Trends</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Simulations based on active local restaurants to organic farm loops.</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockWeeklyEmissionsSaved}>
                      <defs>
                        <linearGradient id="colorSaving" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCompost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="saving" name="CO₂ Saved (Kg)" stroke="#10b981" fillOpacity={1} fill="url(#colorSaving)" strokeWidth={2} />
                      <Area type="monotone" dataKey="compost" name="Organic Fertilizer (Kg)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCompost)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recommended Communities Carousel & Nearby Events */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Community Recommendation Node */}
                <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs uppercase text-emerald-400 tracking-wider">Recommended Circles</h4>
                    <span className="text-[10px] text-slate-500">Based on causes</span>
                  </div>
                  <div className="space-y-3.5">
                    {communities.slice(0, 3).map(c => (
                      <div key={c.id} className="flex items-center space-x-3.5 p-2 bg-slate-950/40 rounded-xl hover:bg-slate-950/80 transition-all border border-white/5 cursor-pointer" onClick={() => { setSelectedCommunity(c); setActiveTab("community"); }}>
                        <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-xl object-cover border border-white/5" />
                        <div className="flex-grow">
                          <h5 className="text-xs font-bold text-slate-200">{c.name}</h5>
                          <p className="text-[9.5px] text-slate-400 line-clamp-1 mt-0.5">{c.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">{c.category}</span>
                            <span className="text-[8px] text-slate-500">{c.memberCount} members</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nearby Events */}
                <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs uppercase text-emerald-400 tracking-wider">Nearby Impact Drives</h4>
                    <span className="text-[10px] text-slate-500">SF Grid</span>
                  </div>
                  <div className="space-y-3.5">
                    {events.slice(0, 3).map(e => (
                      <div key={e.id} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-white/5 rounded-xl hover:bg-slate-950/60 transition-all">
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-slate-200 line-clamp-1">{e.title}</h5>
                          <div className="flex items-center space-x-2 text-[9px] text-slate-400">
                            <span className="flex items-center text-slate-400">
                              <Calendar className="w-3 h-3 mr-1" />
                              {e.date}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{e.category}</span>
                          </div>
                        </div>
                        <button onClick={() => { setActiveTab("events"); }} className="px-3 py-1.5 bg-white/5 hover:bg-emerald-500 hover:text-slate-950 font-bold text-[9px] rounded-lg transition-all">
                          Inspect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Dashboard Right area: Gamifications Achievements and rankings */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Gamification Achieved Badges */}
              <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase text-emerald-400 tracking-wider">Circular Badges Unlocked</h4>
                  <span className="text-[10px] text-slate-500">{user.badges?.length || 0} Badges</span>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {user.badges && user.badges.length > 0 ? (
                    user.badges.map((badge: any) => (
                      <div key={badge.id} className="p-3 bg-slate-950 border border-white/5 rounded-xl flex flex-col items-center text-center space-y-2">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${badge.color || 'from-emerald-400 to-emerald-500'} flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/5`}>
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h5 className="text-[10px] font-bold text-slate-100">{badge.name}</h5>
                        <p className="text-[8px] text-slate-400 leading-tight">{badge.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-4 text-xs text-slate-500">
                      Attend events or complete waste processing cycles to unlock badges!
                    </div>
                  )}

                  {/* Standard badges showing lock status as a goal */}
                  {[
                    { name: "Waste Warrior II", desc: "Divert over 1000kg of kitchen residues", color: "from-slate-800 to-slate-900", icon: "Lock" },
                    { name: "Tree Sovereign", desc: "Co-organize 15 re-greening drives", color: "from-slate-800 to-slate-900", icon: "Lock" }
                  ].map((locked, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-white/5 opacity-50 rounded-xl flex flex-col items-center text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-500">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h5 className="text-[10px] font-bold text-slate-400">{locked.name}</h5>
                      <span className="text-[7.5px] text-slate-500 font-bold uppercase">Locked Goal</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volunteer Leaderboard standing */}
              <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase text-emerald-400 tracking-wider">SF Local Leaderboard</h4>
                  <span className="text-[10px] text-slate-500">Weekly Top Nodes</span>
                </div>
                
                <div className="space-y-2.5">
                  {[
                    { rank: 1, name: "EcoAgro Fertilizer Corp", score: 940, label: "Fertilizer Company" },
                    { rank: 2, name: "BioRecycle Solutions", score: 820, label: "Recycle Collector" },
                    { rank: 3, name: "Chef Amelia (Grand Bistro)", score: 680, label: "Waste Producer" },
                    { rank: 4, name: "Alex Rivera (You)", score: user.impactScore, label: "Volunteer Node", isMe: true },
                    { rank: 5, name: "Marcus Brody", score: 410, label: "Volunteer Node" },
                    { rank: 6, name: "Sarah Jenkins", score: 395, label: "Volunteer Node" }
                  ]
                  .sort((a, b) => b.score - a.score)
                  .map((lead, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                      lead.isMe ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-slate-950/40 border border-white/5"
                    }`}>
                      <div className="flex items-center space-x-3">
                        <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                          idx === 0 ? "bg-amber-400 text-slate-950" : idx === 1 ? "bg-slate-300 text-slate-950" : "bg-slate-800 text-slate-400"
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className={`text-xs font-bold ${lead.isMe ? "text-emerald-400" : "text-slate-100"}`}>
                            {lead.name}
                          </div>
                          <div className="text-[8px] text-slate-500 font-medium">{lead.label}</div>
                        </div>
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-300">
                        {lead.score} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. COMMUNITIES SECTION */}
        {activeTab === "community" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left list panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between p-2">
                <h3 className="font-extrabold text-white text-base">Impact Circles</h3>
                <span className="text-[10px] text-slate-500">{communities.length} Communities available</span>
              </div>
              
              <div className="space-y-3.5">
                {communities.map((c) => {
                  const selected = selectedCommunity?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCommunity(c)}
                      className={`p-4 bg-slate-900 border rounded-2xl cursor-pointer transition-all ${
                        selected 
                          ? "border-emerald-500 shadow-md shadow-emerald-500/10 bg-slate-900" 
                          : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img src={c.avatar} alt={c.name} className="w-11 h-11 rounded-xl object-cover border border-white/5" />
                        <div className="flex-grow">
                          <h4 className="text-xs font-bold text-slate-200">{c.name}</h4>
                          <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{c.category}</span>
                        </div>
                        <span className="text-[9.5px] text-slate-500 shrink-0">{c.memberCount} members</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">{c.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right community layout panels */}
            {selectedCommunity ? (
              <div className="lg:col-span-8 space-y-8">
                
                {/* Cover banner */}
                <div className="relative rounded-3xl overflow-hidden border border-white/5">
                  <img src={selectedCommunity.coverImage} alt={selectedCommunity.name} className="w-full h-44 object-cover opacity-60 filter blur-xs" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <img src={selectedCommunity.avatar} alt={selectedCommunity.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/20" />
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white">{selectedCommunity.name}</h2>
                        <div className="flex items-center space-x-2 text-[10.5px] text-slate-300 mt-1">
                          <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-bold uppercase">{selectedCommunity.category}</span>
                          <span>•</span>
                          <span>{selectedCommunity.memberCount} Active Changemakers</span>
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={() => {
                        setCommunities(prev => prev.map(c => c.id === selectedCommunity.id ? { ...c, memberCount: c.memberCount + 1 } : c));
                        setSelectedCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null);
                        onUpdateUser({ ...user, impactScore: user.impactScore + 40 });
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center space-x-1 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Join Circle (+40 pts)</span>
                    </button>
                  </div>
                </div>

                {/* Achievements List */}
                <div className="p-4 bg-slate-910 bg-slate-900 border border-white/5 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">Community Achievements</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCommunity.achievements?.map((ach: string, i: number) => (
                      <span key={i} className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{ach}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Feed posts boards & Chat panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Community Discussion Feed */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-1">
                      <h4 className="font-extrabold text-xs uppercase text-emerald-400 tracking-wider">Social Feed</h4>
                      <span className="text-[10.5px] text-slate-500">Board Updates</span>
                    </div>

                    {/* Create post update form */}
                    <form onSubmit={handleCreatePost} className="p-4 bg-slate-905 bg-slate-900/60 border border-white/5 rounded-2xl space-y-3">
                      <textarea
                        required
                        placeholder="Celebrate a milestone. Share photos of green loops..."
                        className="w-full bg-slate-950/80 border border-white/5 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                        rows={2}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                      />
                      <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all">
                        Post Announcement
                      </button>
                    </form>

                    {/* Posts Cards list */}
                    <div className="space-y-4">
                      {communityPosts.length > 0 ? (
                        communityPosts.map((p) => (
                          <div key={p.id} className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-3.5">
                            <div className="flex items-center space-x-3">
                              <img src={p.authorAvatar} alt={p.authorName} className="w-9 h-9 rounded-full bg-slate-800" />
                              <div>
                                <h5 className="text-xs font-bold text-slate-100">{p.authorName}</h5>
                                <div className="text-[8.5px] text-slate-400 font-medium">
                                  {p.authorRole} • {p.timestamp}
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-sans">{p.content}</p>

                            {p.image && (
                              <img src={p.image} alt="In action" className="w-full h-32 object-cover rounded-xl border border-white/5" />
                            )}

                            {/* Likes comments metrics action buttons */}
                            <div className="flex items-center space-x-6 text-[10.5px] text-slate-400 border-t border-white/5 pt-3">
                              <button onClick={() => handleLikePost(p.id)} className="flex items-center space-x-1.5 hover:text-emerald-500 transition-colors">
                                <Heart className="w-4 h-4 text-emerald-400" />
                                <span>{p.likes} Likes</span>
                              </button>
                              <div className="flex items-center space-x-1.5">
                                <MessageSquare className="w-4 h-4" />
                                <span>{p.comments?.length || 0} Comments</span>
                              </div>
                            </div>

                            {/* Comment thread */}
                            {p.comments && p.comments.length > 0 && (
                              <div className="space-y-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                                {p.comments.map((c: any) => (
                                  <div key={c.id} className="text-[10px] space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-extrabold text-slate-200">{c.authorName}</span>
                                      <span className="text-slate-500">• {c.timestamp}</span>
                                    </div>
                                    <p className="text-slate-400 leading-normal">{c.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Comment reply input */}
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Add comments..."
                                className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 pl-3.5 pr-12 text-[10.5px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                                value={postCommentInputs[p.id] || ""}
                                onChange={(e) => setPostCommentInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleCommentSubmit(p.id); }}
                              />
                              <button onClick={() => handleCommentSubmit(p.id)} className="absolute right-2 top-2.5 text-emerald-400 hover:text-emerald-300">
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-xs text-slate-500">
                          Empty discussions. Write a morning post update!
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Real-time Chats */}
                  <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col h-[520px]">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="font-extrabold text-xs uppercase text-emerald-400 tracking-wider">Active Circle Chat</h4>
                      </div>
                      <span className="text-[9.5px] text-slate-500">Organizers Online</span>
                    </div>

                    {/* Chat log wrapper */}
                    <div className="flex-grow overflow-y-auto space-y-3.5 pr-1.5 no-scrollbar">
                      {communityChats.map((m) => {
                        const isMe = m.senderId === user.id;
                        return (
                          <div key={m.id} className={`flex items-start space-x-2.5 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse space-x-reverse" : "mr-auto"}`}>
                            {!isMe && (
                              <img src={m.senderAvatar} alt={m.senderName} className="w-7 h-7 rounded-full bg-slate-800" />
                            )}
                            <div className="space-y-1">
                              {!isMe && (
                                <span className="text-[9px] text-slate-400 font-bold ml-1">{m.senderName}</span>
                              )}
                              <div className={`p-3 rounded-2xl text-[11px] leading-relaxed select-text ${
                                isMe 
                                  ? "bg-emerald-500 text-slate-950 font-medium rounded-tr-none" 
                                  : "bg-slate-950 border border-white/5 text-slate-200 rounded-tl-none"
                              }`}>
                                {m.content}
                              </div>
                              <span className="block text-[8px] text-slate-500 text-right">{m.timestamp}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Input message controls */}
                    <form onSubmit={handleChatSubmit} className="relative mt-4 pt-3 border-t border-white/5">
                      <input
                        type="text"
                        required
                        placeholder="Message your circle organizer..."
                        className="w-full bg-slate-950/80 border border-white/5 rounded-xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:border-emerald-500 transition-all"
                        value={newChatContent}
                        onChange={(e) => setNewChatContent(e.target.value)}
                      />
                      <button type="submit" className="absolute right-3.5 top-6 text-emerald-400 hover:text-emerald-300">
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                  </div>

                </div>

              </div>
            ) : (
              <div className="lg:col-span-8 text-center py-20 text-xs text-slate-500">
                Select a community to access feed discussion posts.
              </div>
            )}

          </div>
        )}

        {/* 3. EVENTS MANAGEMENT SECTION */}
        {activeTab === "events" && (
          <div className="space-y-8">
            
            {/* Header and create trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Actionable Reforestation & Sanitation Drives</h2>
                <p className="text-xs text-slate-400 mt-1">Submit public initiatives or register nearby volunteers. Verifications by Platform Admin.</p>
              </div>

              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 shrink-0"
              >
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Organize Local Event</span>
              </button>
            </div>

            {/* Simulated Event Creation fields */}
            {showEventForm && (
              <form onSubmit={handleCreateEvent} className="p-6 bg-slate-900 border border-white/10 rounded-3xl space-y-5 max-w-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="font-bold text-sm text-emerald-400">Schedule Active Drive</h3>
                  <button type="button" onClick={() => setShowEventForm(false)} className="text-slate-500 hover:text-white text-xs">Close</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Event Theme Name</label>
                    <input
                      type="text"
                      required
                      placeholder="McLaren Park Reforestation"
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                      value={eventFormData.title}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Action Focus Category</label>
                    <select
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                      value={eventFormData.category}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="Tree Plantation">Tree Plantation</option>
                      <option value="Environment">Sanitation Cleanup</option>
                      <option value="Food Distribution">Food Distribution</option>
                      <option value="Blood Donation">Blood Donation</option>
                      <option value="Education">Education Camp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Initiative Details & Goals</label>
                  <textarea
                    required
                    placeholder="We aim to plant native, draught resistant pines to cool city street coordinates..."
                    className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all font-sans"
                    rows={2}
                    value={eventFormData.description}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Location Address</label>
                    <input
                      type="text"
                      required
                      placeholder="McLaren West Gate, SF"
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      value={eventFormData.locationName}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, locationName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Selected Date</label>
                    <input
                      type="text"
                      placeholder="June 18, 2026"
                      required
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      value={eventFormData.date}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Volunteer Seats Limit</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      value={eventFormData.volunteerLimit}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, volunteerLimit: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Required Materials Item</label>
                    <input
                      type="text"
                      placeholder="Saplings or degradable bags"
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                      value={eventFormData.materialName}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, materialName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Necessary Quantity</label>
                    <input
                      type="text"
                      placeholder="e.g. 50 kits"
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                      value={eventFormData.materialQty}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, materialQty: e.target.value }))}
                    />
                  </div>
                </div>

                <span className="text-[10px] text-slate-500 border border-dashed border-white/10 p-2.5 rounded-lg block">
                  💡 Tip: You can visit the **AI Solver Space** tab to auto-generate timelines, estimated budget items, and required volunteers instantly using Gemini!
                </span>

                <button type="submit" className="w-full py-3.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg hover:bg-emerald-400">
                  Register Public Initiative
                </button>
              </form>
            )}

            {/* List of Drives Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e) => {
                const registered = e.volunteers?.includes(user.id);
                return (
                  <div key={e.id} className="p-6 bg-slate-900 border border-white/5 rounded-2xl flex flex-col justify-between space-y-4 relative">
                    
                    {/* Verified badge or not */}
                    <div className="absolute top-4 right-4 flex items-center space-x-1.5">
                      {e.verified ? (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/10 flex items-center">
                          <Check className="w-2.5 h-2.5 mr-0.5" />
                          Verified Drive
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-400 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-amber-500/10 flex items-center">
                          <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                          Awaiting Verify
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {e.category}
                      </span>
                      <h3 className="text-sm font-bold text-white pt-1">{e.title}</h3>
                      <p className="text-[11.5px] text-slate-400 leading-relaxed line-clamp-3">{e.description}</p>
                    </div>

                    <div className="border-t border-b border-white/5 py-3 space-y-2 text-[10.5px]">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="line-clamp-1">{e.locationName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{e.date} • {e.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-300">
                        <HardHat className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>Organized by <strong className="text-slate-100">{e.organizer}</strong></span>
                      </div>
                    </div>

                    {/* Resources required checklist */}
                    {e.resources && e.resources.length > 0 && (
                      <div className="space-y-1.5">
                        <h5 className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-400">Required Materials List</h5>
                        <div className="bg-slate-950/40 p-2 border border-white/5 rounded-xl space-y-1">
                          {e.resources.map((res: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-[10px] text-slate-300">
                              <span className="flex items-center">
                                <Check className="w-3 h-3 text-emerald-500 mr-1" />
                                {res.name}
                              </span>
                              <span className="font-mono text-slate-500 shrink-0">{res.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline items breakdown info block */}
                    {e.timeline && e.timeline.length > 0 && (
                      <div className="space-y-1.5">
                        <h5 className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-400">Detailed Timeline steps</h5>
                        <div className="space-y-1 pl-2 border-l border-white/10">
                          {e.timeline.slice(0, 2).map((item: string, idx: number) => (
                            <p key={idx} className="text-[9.5px] text-slate-400 line-clamp-1">{item}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Volunteer capacity tracking and Action registry */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-3">
                      <div className="text-xs">
                        <strong className="text-slate-200">{e.volunteers?.length || 0}</strong>
                        <span className="text-slate-500"> / {e.volunteerLimit} matched</span>
                      </div>

                      {user.role === 'admin' && !e.verified && (
                        <button
                          onClick={() => handleVerifyEvent(e.id)}
                          className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 hover:text-slate-950 text-blue-400 text-[10px] font-bold rounded-lg transition-colors border border-blue-500/20 flex items-center space-x-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleJoinEvent(e.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                          registered 
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" 
                            : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/5"
                        }`}
                      >
                        {registered ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Registered</span>
                          </>
                        ) : (
                          <span>Register Position (+25 pts)</span>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* 4. FOOD WASTE CIRCULAR MARKETPLACE MODULE */}
        {activeTab === "waste-marketplace" && (
          <div className="space-y-8">
            
            {/* Context Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Food Waste-to-Fertilizer Circular Loops</h2>
              <p className="text-xs text-slate-400 mt-1">
                Connecting hospitality food waste producers with local recyclers, fertilizer compost units, and organic farmers regional coordinates.
              </p>
            </div>

            {/* Visual Process Map */}
            <div className="p-6 bg-gradient-to-r from-emerald-950/20 to-blue-950/20 border border-white/5 rounded-3xl">
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">Loop Pipeline Strategy</span>
                <h3 className="font-extrabold text-white mt-3">Daily Bio-Organic Carbon Redirect Loops</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                {[
                  { title: "1. Waste Produced", icon: <Trash2 className="w-6 h-6 text-orange-400" />, desc: "Restaurants post scrap load catalogs" },
                  { title: "2. Recycler Scheduled", icon: <Clock className="w-6 h-6 text-amber-400" />, desc: "Recycle trucks dispatch logistics GPS" },
                  { title: "3. Collected & Dried", icon: <Recycle className="w-6 h-6 text-blue-400" />, desc: "Lots sorted into composting reactors" },
                  { title: "4. Fermented Soil Feed", icon: <Sprout className="w-6 h-6 text-emerald-400" />, desc: "High nitrogen fertilizers shipped to farms" }
                ].map((loopStep, i) => (
                  <div key={i} className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 relative flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                      {loopStep.icon}
                    </div>
                    <h5 className="text-xs font-bold text-slate-200">{loopStep.title}</h5>
                    <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">{loopStep.desc}</p>
                    {i < 3 && (
                      <div className="hidden sm:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-500 font-black">➔</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Persona Action dashboards split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Dynamic Actions panel for matching roles */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* A: Restaurant Waste Producer Dashboard */}
                {user.role === 'producer' && (
                  <div className="p-5 bg-slate-900 border border-white/5 rounded-3xl space-y-5">
                    <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
                      <Trash2 className="w-5 h-5 text-orange-400 animate-bounce" />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-orange-400">Producer Center Panel</h4>
                    </div>

                    <form onSubmit={handleUploadWasteScrap} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Wet food weight (Kg)</label>
                        <input
                          type="number"
                          required
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                          value={wasteFormData.weight}
                          onChange={(e) => setWasteFormData(prev => ({ ...prev, weight: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Organic Waste category</label>
                        <select
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                          value={wasteFormData.wasteType}
                          onChange={(e) => setWasteFormData(prev => ({ ...prev, wasteType: e.target.value as any }))}
                        >
                          <option value="vegetable_peels">Organic Vegetable skins & grounds</option>
                          <option value="cooked_food">Cooked buffet residues</option>
                          <option value="bakery">Bakery & dairy remnants</option>
                          <option value="mixed_organic">Mixed kitchen scraps</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Source Remarks</label>
                        <textarea
                          placeholder="Fresh scrap ready for bio compost sorting. Containerized..."
                          className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs text-slate-200 focus:outline-none font-sans"
                          rows={2}
                          value={wasteFormData.description}
                          onChange={(e) => setWasteFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <button type="submit" className="w-full py-3 bg-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg hover:bg-orange-400">
                        Upload Wet Scrap Catalog
                      </button>
                    </form>
                  </div>
                )}

                {/* B: Waste Collector Recycler Dashboard */}
                {user.role === 'collector' && (
                  <div className="p-5 bg-slate-900 border border-white/5 rounded-3xl space-y-5">
                    <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-blue-400">Collector logistics Terminal</h4>
                    </div>
                    <div className="p-3 bg-slate-950/65 border border-white/5 rounded-xl space-y-2">
                      <h5 className="text-[10px] font-bold text-slate-200">Simulate Truck Route scheduling</h5>
                      <p className="text-[9.5px] text-slate-400 leading-normal">
                        Select listed available restaurants organic batches and click **Accept & Dispatch** to simulate container routing coordinates.
                      </p>
                    </div>
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded inline-block">
                      🚚 2 active trucks routing Downtown SF
                    </span>
                  </div>
                )}

                {/* C: Fertilizer company Composting processor dashboard */}
                {user.role === 'fertilizer_company' && (
                  <div className="p-5 bg-slate-900 border border-white/5 rounded-3xl space-y-5">
                    <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
                      <Sprout className="w-5 h-5 text-purple-400 animate-pulse" />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-purple-400">Dehydrating Fertilizer processor</h4>
                    </div>
                    <div className="p-3 bg-slate-950/65 border border-white/5 rounded-xl space-y-2">
                      <h5 className="text-[10px] font-bold text-slate-200">Complete the circular loops</h5>
                      <p className="text-[9.5px] text-slate-400 leading-normal">
                        Convert sorted kitchen scraps into high nitrogen organic biocompost fertilizer. Completed batches grant credits!
                      </p>
                    </div>
                  </div>
                )}

                {/* D: Volunteer Node (no direct trade actions, views stats overview) */}
                {user.role === 'volunteer' && (
                  <div className="p-5 bg-slate-900 border border-white/5 rounded-3xl space-y-4">
                    <div className="flex items-center space-x-2">
                      <Compass className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400">Volunteer observer panel</h4>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">
                      While wet compost transfers are managed by business actors, your volunteer events supply the physical labour to mix compost soils at McLaren and regional municipal gardens!
                    </p>
                    <button onClick={() => { setActiveTab("events") }} className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">
                      Inspect Re-vegetation drives
                    </button>
                  </div>
                )}

              </div>

              {/* Central Marketplace Listings Grid Database view */}
              <div className="lg:col-span-8 space-y-5">
                <div className="flex items-center justify-between p-1">
                  <h4 className="font-extrabold text-xs uppercase text-emerald-400 tracking-wider">Ecosystem wet waste lots database</h4>
                  <span className="text-[10.5px] text-slate-500">{wasteListings.length} current circular records</span>
                </div>

                <div className="space-y-4">
                  {wasteListings.length > 0 ? (
                    wasteListings.map((w) => {
                      const statusColors: Record<string, string> = {
                        available: "bg-orange-500/10 text-orange-400 border-orange-500/20",
                        pickup_scheduled: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                        collected: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                        processing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                        processed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      };

                      return (
                        <div key={w.id} className="p-5 bg-slate-900 border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-colors">
                          <div className="space-y-2 max-w-md">
                            <div className="flex items-center space-x-3.5">
                              <span className={`text-[8.5px] font-bold uppercase px-2 py-0.5 rounded border ${statusColors[w.status] || 'bg-slate-700 text-slate-300'}`}>
                                {w.status?.replace('_', ' ')}
                              </span>
                              <span className="text-[9.5px] text-slate-500 font-mono">ID: {w.id?.slice(-8)}</span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-100">
                              {w.weight} kg wet organic waste — <span className="text-emerald-400">{w.wasteType?.replace('_', ' ')}</span>
                            </h4>
                            <p className="text-[10.5px] text-slate-400 leading-normal">{w.description}</p>
                            
                            <div className="text-[9.5px] space-y-1 text-slate-500 border-l border-white/10 pl-2">
                              <div>Uploaded by: <strong className="text-slate-300">{w.producerName}</strong></div>
                              {w.producerLocation && <div>Location: <span className="text-slate-400">{w.producerLocation}</span></div>}
                              {w.collectorName && <div>Transporter: <span className="text-slate-300 font-bold">{w.collectorName}</span></div>}
                              {w.processingCompanyName && <div>Bio Reactor: <span className="text-purple-400 font-bold">{w.processingCompanyName}</span></div>}
                            </div>
                          </div>

                          <div className="flex flex-col sm:items-end justify-between self-stretch shrink-0 gap-3">
                            <div className="text-right">
                              <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-end">
                                <Award className="w-3 h-3 mr-1" />
                                <span>-{w.co2Saved} kg CO₂ mitigated</span>
                              </div>
                              <div className="text-[9.5px] text-slate-500 mt-0.5">Est. Compost Yield: {w.compostYield} kg</div>
                              {w.earnings && (
                                <div className="text-xs font-bold text-orange-400 mt-1">Earnings Payout: ${w.earnings}</div>
                              )}
                            </div>

                            {/* DYNAMIC ACTIONS FOR MARKETPLACE STEP CORES */}
                            {user.role === 'collector' && w.status === 'available' && (
                              <button
                                onClick={() => handleScheduleWastePickup(w.id)}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold text-[10.5px] rounded-lg transition-colors shadow-md"
                              >
                                Accept & Dispatch Pickup
                              </button>
                            )}

                            {user.role === 'collector' && w.status === 'pickup_scheduled' && w.collectorId === user.id && (
                              <button
                                onClick={() => handleCollectWaste(w.id)}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold text-[10.5px] rounded-lg transition-colors"
                              >
                                Mark as Collected
                              </button>
                            )}

                            {user.role === 'fertilizer_company' && w.status === 'collected' && (
                              <button
                                onClick={() => handleProcessWasteToFertilizer(w.id)}
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-extrabold text-[10.5px] rounded-lg transition-all"
                              >
                                Dehydrate & Ferment (+{w.compostYield}kg fertilizer)
                              </button>
                            )}

                            {w.status === 'processed' && (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-bold flex items-center justify-end shrink-0">
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Loop Complete
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 bg-slate-900 border border-white/5 rounded-2xl text-xs text-slate-500">
                      Empty market lists. Restaurant role can upload wet scraps!
                    </div>
                  )}
                </div>

              </div>
              
            </div>

          </div>
        )}

        {/* 5. AI WORKSPACE SOLVER PANEL */}
        {activeTab === "ai-workspace" && (
          <div className="space-y-8">
            
            {/* Context Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Impact Generative AI Workspace</h2>
              <p className="text-xs text-slate-400 mt-1">
                Deploy advanced server-side Gemini 3.5 LLMs to align demographic interests, pre-plan volunteer materials checklists, or optimize compost parameters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Pillar A: Cause matching and Event checklists templates compiler */}
              <div className="space-y-8">
                
                {/* 1. AI CAUSE MATCHING PORT */}
                <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-extrabold text-white text-sm">AI Interests & Demographic Matching</h3>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Describe your background, professional skills, or ideal weekly goals. Gemini will align your coordinates and recommend custom focus causes structure list.
                  </p>

                  <div className="space-y-3">
                    <textarea
                      placeholder="e.g., I am a high school biology educator in Sunset District. I love sorting nature trails and have strong photography skills. Can commit on Saturday mornings..."
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                      rows={3}
                      value={aiCauseText}
                      onChange={(e) => setAiCauseText(e.target.value)}
                    />
                    
                    <button
                      onClick={executeAICauseMatching}
                      disabled={loadingAI.cause}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
                    >
                      {loadingAI.cause ? (
                        <span>Analyzing with Gemini...</span>
                      ) : (
                        <>
                          <Cpu className="w-4 h-4" />
                          <span>Generate Cause Suggestions</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* CAUSE RESULT OUTS */}
                  {aiCauseResult && (
                    <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl space-y-3.5 animate-fadeIn">
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Matched Causes</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {aiCauseResult.matchingCauses?.map((c: string, idx: number) => (
                            <span key={idx} className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 font-mono">Suggested Skills to Highlight</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {aiCauseResult.recommendedSkills?.map((s: string, idx: number) => (
                            <span key={idx} className="bg-blue-500/10 text-blue-400 text-[9px] px-2 py-0.5 rounded font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/5 font-sans">
                        {aiCauseResult.reasoningText}
                      </div>

                      {aiCauseResult.actionIdeas && (
                        <div>
                          <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">Action Groups Recommended</h4>
                          <div className="space-y-1">
                            {aiCauseResult.actionIdeas.map((idea: string, idx: number) => (
                              <p key={idx} className="text-[10px] text-slate-400 flex items-center">
                                <span className="text-emerald-400 font-bold mr-1.5">▪</span>
                                {idea}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* 2. AI EVENT PLANNER TIMELINE CORES */}
                <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-4">
                  <div className="flex items-center space-x-2">
                    <TreePine className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <h3 className="font-extrabold text-white text-sm">AI Event Blueprint & Budget Planner</h3>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Provide a one-sentence environmental action target. Gemini will execute estimated logistics checklist, chronological timeline sequence, and suggested materials budget.
                  </p>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="e.g. I want to plant 100 native cedar trees at McLaren Park Community Lot"
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500"
                      value={aiEventText}
                      onChange={(e) => setAiEventText(e.target.value)}
                    />
                    
                    <button
                      onClick={executeAIEventPlannerBlueprint}
                      disabled={loadingAI.event}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
                    >
                      {loadingAI.event ? (
                        <span>Compiling Event Checklist...</span>
                      ) : (
                        <>
                          <Cpu className="w-4 h-4" />
                          <span>Generate Event Blueprint</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* EVENT CHECKS RESULT */}
                  {aiEventResult && (
                    <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl space-y-4 font-sans animate-fadeIn">
                      <div className="flex justify-between text-xs border-b border-white/5 pb-2.5">
                        <div>
                          <span className="text-[9.5px] uppercase text-slate-400 font-bold block">Volunteers Recommended</span>
                          <strong className="text-white text-sm">{aiEventResult.estimatedVolunteers} persons</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[9.5px] uppercase text-slate-400 font-bold block">Estimated Budget</span>
                          <strong className="text-emerald-400 text-sm">${aiEventResult.estimatedBudgetUSD} USD</strong>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[9.5px] uppercase font-bold text-slate-400 mb-1.5 font-mono">Materials Required</h4>
                        <div className="bg-slate-900 p-2.5 rounded-xl space-y-1">
                          {aiEventResult.requiredMaterials?.map((mat: string, idx: number) => (
                            <p key={idx} className="text-[10px] text-slate-300 flex items-start">
                              <span className="text-blue-400 mr-1.5">•</span>
                              <span>{mat}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[9.5px] uppercase font-bold text-slate-400 mb-1.5">Proposed Chronology Timeline</h4>
                        <div className="space-y-1.5 border-l border-emerald-500/30 pl-2">
                          {aiEventResult.proposedTimeline?.map((timeStep: string, idx: number) => (
                            <p key={idx} className="text-[10.5px] text-slate-400">{timeStep}</p>
                          ))}
                        </div>
                      </div>

                      <div className="text-[10px] bg-emerald-500/5 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/10 italic">
                        Planners Advice: "{aiEventResult.expertPlannersAdvice}"
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Pillar B: Composting outputs Optimization predictor and newsletter compiles */}
              <div className="space-y-8">
                
                {/* 3. AI COMPOSTING OPTIMIZER AND REDUCTION */}
                <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-4">
                  <div className="flex items-center space-x-2">
                    <Recycle className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-extrabold text-white text-sm">AI Waste-to-Fertilizer Predictor</h3>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Pre-compute potential natural organic fertilizer yields and daily circular carbon footprints reductions based on enterprise kitchen metrics.
                  </p>

                  <div className="space-y-3 grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-[9.5px] uppercase text-slate-500 font-bold mb-1">Facility Category</label>
                      <select
                        className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs"
                        value={aiPredictorData.businessType}
                        onChange={(e) => setAiPredictorData(prev => ({ ...prev, businessType: e.target.value }))}
                      >
                        <option value="Event Marriage Hall / Banquet venue">Marriage Hall / Events</option>
                        <option value="Hotel Resort buffet chain">Premium Hotel Dining</option>
                        <option value="University Campus Dining Mess">Student Hostels Mess</option>
                        <option value="Standard high volume Bistro Cafe">High Volume Restaurant</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9.5px] uppercase text-slate-500 font-bold mb-1">Avg Daily wet scraps scrap weight (Kg)</label>
                      <input
                        type="number"
                        className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs"
                        value={aiPredictorData.averageDailyWasteKg}
                        onChange={(e) => setAiPredictorData(prev => ({ ...prev, averageDailyWasteKg: e.target.value }))}
                      />
                    </div>

                    <button
                      onClick={executeAIWastePrediction}
                      disabled={loadingAI.predictor}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
                    >
                      {loadingAI.predictor ? "Running AI Parameters..." : "Run Optimization Prediction"}
                    </button>
                  </div>

                  {/* PREDICTOR RESULTS */}
                  {aiPredictorResult && (
                    <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl space-y-3.5 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-2.5 bg-slate-900 border border-white/5 rounded-xl">
                          <span className="text-[8.5px] uppercase text-slate-500 block">Weekly Compost Produced</span>
                          <span className="text-xs font-mono font-bold text-white">{aiPredictorResult.weeklyCompostProduceKg} Kg / wk</span>
                        </div>
                        <div className="p-2.5 bg-slate-900 border border-white/5 rounded-xl">
                          <span className="text-[8.5px] uppercase text-slate-500 block">Weekly CO₂ Saved Equivalent</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">-{aiPredictorResult.weeklyCo2SavedKg} Kg / wk</span>
                        </div>
                      </div>

                      <div className="text-[10.5px]">
                        <span className="text-slate-500 uppercase font-bold text-[9px]">Optimal Pickup logistics Schedule:</span>
                        <p className="text-slate-200 mt-1">{aiPredictorResult.optimalPickupSchedule}</p>
                      </div>

                      <div className="text-[11px] text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 font-sans leading-relaxed">
                        <strong className="text-orange-400 block mb-1 text-[10px] uppercase font-mono">Kitchen Management Tip:</strong>
                        {aiPredictorResult.kitchenReductionInsight}
                      </div>
                    </div>
                  )}

                </div>

                {/* 4. AI IMPACT REPORT GENERATION NEWSLETTER */}
                <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <h3 className="font-extrabold text-white text-sm">AI Municipal Impact Insights Coordinator</h3>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Compile regional event registries, carbon saves, and composting statistics into an inspiring sustainability newsletter utilizing generative AI loops.
                  </p>

                  <button
                    onClick={executeAIImpactNewsletter}
                    disabled={loadingAI.report}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    {loadingAI.report ? "Synthesizing newsletters..." : "Compile Ecosystem Impact Statement"}
                  </button>

                  {/* REPORT INSIGHT GRAPH INLAY */}
                  {aiReportResult && (
                    <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl animate-fadeIn space-y-3 font-sans">
                      <div className="flex items-center justify-between text-xs text-emerald-400 pb-2 border-b border-white/5">
                        <span>Impact Circle Public Newsletter</span>
                        <span className="text-[9.5px] bg-emerald-500/10 px-2 rounded">May 2026 Edition</span>
                      </div>
                      
                      <div className="text-xs text-slate-300 leading-relaxed space-y-3 select-text select-all whitespace-pre-line pr-1">
                        {aiReportResult}
                      </div>
                    </div>
                  )}

                </div>

              </div>
              
            </div>

          </div>
        )}

        {/* 6. PLATFORM ADMIN CONSOLE */}
        {activeTab === "admin-panel" && user.role === 'admin' && (
          <div className="space-y-8">
            
            {/* Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Platform Administration Console</h2>
              <p className="text-xs text-slate-400 mt-1">
                Approve unverified environmental drives and inspect transactional circular bio-compost trades globally.
              </p>
            </div>

            {/* Platform metrics */}
            {adminOverview && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { label: "Community Nodes", value: adminOverview.totalUsers },
                  { label: "Unverified Drives", value: adminOverview.unverifiedEvents, accent: true },
                  { label: "Ecosystem Circular Recycled", value: `${adminOverview.totalWasteRecycled} Kg` },
                  { label: "Macro Carbon MITIGATED", value: `${adminOverview.carbonEmissionsSaved.toFixed(1)} Kg` }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 border border-white/5 rounded-2xl">
                    <span className="text-[9.5px] uppercase text-slate-500 font-bold block">{item.label}</span>
                    <strong className={`text-xl sm:text-2xl font-black block mt-2 ${item.accent ? "text-amber-400" : "text-white"}`}>
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            {/* Action panel grids */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left verification drives logs */}
              <div className="lg:col-span-6 p-5 bg-slate-900 border border-white/5 rounded-3xl space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-400">Moderate & Approve Drives</h4>
                
                <div className="space-y-3">
                  {events.filter(e => !e.verified).length > 0 ? (
                    events.filter(e => !e.verified).map((e) => (
                      <div key={e.id} className="p-4 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                        <div>
                          <strong className="text-xs text-slate-200 block">{e.title}</strong>
                          <span className="text-[10px] text-slate-400">{e.organizer} • {e.date}</span>
                        </div>
                        <button
                          onClick={() => handleVerifyEvent(e.id)}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10.5px] rounded-lg transition-colors"
                        >
                          Approve Drive
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-500">
                      Zero unverified drives needing approval! Every drive is currently vetted.
                    </div>
                  )}
                </div>
              </div>

              {/* Right system registrations breakouts */}
              <div className="lg:col-span-6 p-5 bg-slate-900 border border-white/5 rounded-3xl space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-400">Node Profile Registrations Breakout</h4>
                
                {adminOverview && (
                  <div className="space-y-3.5">
                    {[
                      { key: "Volunteers Nodes limit", val: adminOverview.usersBreakdown?.volunteer || 0, color: "bg-emerald-500" },
                      { key: "Restaurants Scraps Producers", val: adminOverview.usersBreakdown?.producer || 0, color: "bg-orange-500" },
                      { key: "Recycle Truck Collectors", val: adminOverview.usersBreakdown?.collector || 0, color: "bg-blue-500" },
                      { key: "Fertilizer composting hubs", val: adminOverview.usersBreakdown?.fertilizer_company || 0, color: "bg-purple-500" }
                    ].map((row, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span>{row.key}</span>
                          <span className="font-mono">{row.val} active</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div className={`${row.color} h-full rounded-full`} style={{ width: `${Math.max(15, (row.val / adminOverview.totalUsers) * 100)}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
