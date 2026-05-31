import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini SDK securely on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY_IF_ABSENT",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const app = express();
const PORT = 3000;

app.use(express.json());

// --- MOCK DATABASE STATE ---
let users: any[] = [
  {
    id: "user-1",
    email: "volunteer@impactcircle.org",
    name: "Alex Rivera",
    role: "volunteer",
    causes: ["Environment", "Tree Plantation", "Sustainability"],
    skills: ["Event Management", "Photography"],
    availability: "Weekends",
    location: {
      lat: 37.774929,
      lng: -122.419416,
      address: "Civic Center, San Francisco, CA"
    },
    impactScore: 450,
    communityRank: 12,
    volunteerHours: 32,
    treesPlanted: 18,
    wasteDiverted: 0,
    compostProduced: 0,
    badges: [
      { id: "b1", name: "First Volunteer Event", description: "Attended your first initiative!", icon: "Sparkles", unlockedAt: "2026-05-15", color: "from-emerald-500 to-teal-500" },
      { id: "b2", name: "Tree Guardian", description: "Planted 15+ micro trees", icon: "TreePine", unlockedAt: "2026-05-24", color: "from-green-500 to-emerald-600" }
    ]
  },
  {
    id: "user-2",
    email: "bistro@greenwaste.com",
    name: "Chef Amelia (Grand Bistro)",
    role: "producer",
    causes: ["Sustainability", "Food Distribution"],
    skills: ["Marketing"],
    availability: "Flexible",
    location: {
      lat: 37.7801,
      lng: -122.412,
      address: "456 Market St, San Francisco, CA"
    },
    impactScore: 680,
    communityRank: 5,
    volunteerHours: 0,
    treesPlanted: 0,
    wasteDiverted: 580,
    compostProduced: 116,
    badges: [
      { id: "b3", name: "Waste Warrior", description: "Diverted over 500kg food waste from landfills", icon: "Trash2", unlockedAt: "2026-05-10", color: "from-orange-500 to-amber-600" }
    ]
  },
  {
    id: "user-3",
    email: "recycle@biotech.org",
    name: "BioRecycle Solutions",
    role: "collector",
    causes: ["Sustainability", "Environment"],
    skills: ["Programming"],
    availability: "Weekdays",
    location: {
      lat: 37.76,
      lng: -122.435,
      address: "88 Industrial Way, San Francisco, CA"
    },
    impactScore: 820,
    communityRank: 3,
    volunteerHours: 0,
    treesPlanted: 0,
    wasteDiverted: 1200,
    compostProduced: 240,
    badges: [
      { id: "b4", name: "Sustainability Champion", description: "Collected 1000kg+ waste material", icon: "ShieldAlert", unlockedAt: "2026-04-20", color: "from-blue-500 to-indigo-600" }
    ]
  },
  {
    id: "user-4",
    email: "agro@perfectcompost.com",
    name: "EcoAgro Fertilizer Corp",
    role: "fertilizer_company",
    causes: ["Sustainability", "Tree Plantation"],
    skills: ["Teaching"],
    availability: "Flexible",
    location: {
      lat: 37.75,
      lng: -122.45,
      address: "102 Farming Flatlands, CA"
    },
    impactScore: 940,
    communityRank: 2,
    volunteerHours: 0,
    treesPlanted: 0,
    wasteDiverted: 2400,
    compostProduced: 480,
    badges: [
      { id: "b5", name: "Impact Leader", description: "Supplied 400kg+ organic bio-compost to farms", icon: "Award", unlockedAt: "2026-05-01", color: "from-purple-500 to-pink-600" }
    ]
  }
];

let activeUser: any = null; // No one is logged in by default

let communities = [
  {
    id: "comm-1",
    name: "Green Guardians",
    description: "The official tree plantation and nature preservation club of SF. We host weekly drives to restore green canopies in urban landscapes.",
    avatar: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80",
    category: "Environment",
    memberCount: 154,
    causes: ["Environment", "Tree Plantation", "Sustainability"],
    achievements: ["Restored SF Main Park Avenue", "Planted 250 Saplings in May 2026"]
  },
  {
    id: "comm-2",
    name: "ZeroWaste Kitchens Network",
    description: "Uniting local restaurants, dining holes, events, and cafes to coordinate local composting, excess food sharing, and organic processing.",
    avatar: "https://images.unsplash.com/photo-1545601445-5b6f418af4bf?w=150&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80",
    category: "Sustainability",
    memberCount: 88,
    causes: ["Sustainability", "Food Distribution", "Community Service"],
    achievements: ["Diverted 20,000kg of food waste", "Zero landfill milestone for 15 restaurants"]
  },
  {
    id: "comm-3",
    name: "SF Vet Helpers & Wildlife Save",
    description: "Animal welfare, stray feeding, medical rescues, and active animal adoption events. Caring for our urban four-legged companions.",
    avatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?w=800&auto=format&fit=crop&q=80",
    category: "Animal Welfare",
    memberCount: 74,
    causes: ["Animal Welfare", "Healthcare"],
    achievements: ["Rescued 45 homeless animals", "Conducted local rabies vaccination camp"]
  },
  {
    id: "comm-4",
    name: "Active Minds Mentors",
    description: "Providing high-quality tutoring and free skills coaching to disadvantaged classrooms and community schools.",
    avatar: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=150&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
    category: "Education",
    memberCount: 62,
    causes: ["Education", "Community Service"],
    achievements: ["600 hours of free student coaching", "Renovated public school library bookcase"]
  }
];

let communityPosts: any[] = [
  {
    id: "post-1",
    communityId: "comm-1",
    authorName: "Sarah Jenkins",
    authorRole: "Founder, Green Guardians",
    authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sarah",
    content: "Absolutely blown away! Yesterday's tree plantation event at SF South Hill was our highest turn-out yet! We planted 32 native cedar saplings in under three hours. A huge thank you to everyone who pitched in! See the photo below. Let's keep the momentum alive!",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
    likes: 48,
    comments: [
      { id: "c-1", authorName: "Alex Rivera", authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex", content: "It was an absolute pleasure! Glad I got to take some photos of the team in action.", timestamp: "2 hours ago" },
      { id: "c-2", authorName: "Marcus Brody", authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Marcus", content: "Next time I will bring my composting spade as well! Count me in.", timestamp: "1 hour ago" }
    ],
    timestamp: "1 day ago"
  },
  {
    id: "post-2",
    communityId: "comm-2",
    authorName: "Chef Amelia",
    authorRole: "Owner, Grand Bistro",
    authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Amelia",
    content: "An incredible cycle! Just uploaded our third waste batch today. With the local bio-recycler routing it, we have saved an estimated 450 kg of carbon emission equivalents. Not only are our bins empty, but our team feels extremely proud to assist the organic farming network in regional counties!",
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80",
    likes: 31,
    comments: [
      { id: "c-3", authorName: "BioRecycle Solutions", authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=BioRecycle", content: "Amazing output Amelia! Pickup scheduled for tomorrow at 8 AM. Safe travels!", timestamp: "4 hours ago" }
    ],
    timestamp: "2 days ago"
  }
];

let events = [
  {
    id: "event-1",
    title: "Eco-Park Sapling Planting",
    description: "Help us plant 35 native oak and pine saplings to increase tree cover and support local shade. Everyone is welcome, tools provided!",
    category: "Tree Plantation",
    organizer: "Green Guardians",
    locationName: "McLaren Park Community Lot, SF",
    lat: 37.719,
    lng: -122.422,
    date: "June 06, 2026",
    time: "09:00 AM - 01:00 PM",
    volunteerLimit: 25,
    volunteers: ["user-1"],
    resources: [
      { name: "Saplings", quantity: "35 native species", required: true },
      { name: "Organic Compost", quantity: "150 kg bio-compost", required: true },
      { name: "Watering Cans & Shovels", quantity: "15 kits", required: false }
    ],
    budget: {
      total: 350,
      materials: ["35 Saplings ($240)", "150kg Bio-Compost ($60)", "Tools ($50)"]
    },
    timeline: [
      "09:00 AM: Orientation and pairing",
      "09:30 AM: Preparing pit soils with fertilizer compost",
      "10:15 AM: Planting and mulching",
      "12:00 PM: Group hydration and impact logging"
    ],
    verified: true
  },
  {
    id: "event-2",
    title: "Beach Cleanup & Microplastics Sweep",
    description: "Join us for our monthly sweep of sand and dune areas. Help protect shorebirds and sea lions from hazardous waste.",
    category: "Environment",
    organizer: "ZeroWaste Kitchens Network",
    locationName: "Ocean Beach Beachfront, SF",
    lat: 37.769,
    lng: -122.511,
    date: "June 13, 2026",
    time: "10:00 AM - 02:00 PM",
    volunteerLimit: 40,
    volunteers: [],
    resources: [
      { name: "Recycling Sacks", quantity: "100 degradable sacks", required: true },
      { name: "Re-usable Tongs", quantity: "20 sets", required: false },
      { name: "First Aid & Hand Sanitizer", quantity: "2 units", required: true }
    ],
    budget: {
      total: 80,
      materials: ["Recycling Bags ($30)", "Gloves & Sanitizers ($50)"]
    },
    timeline: [
      "10:00 AM: Safety briefing & zone division",
      "10:30 AM: Trash collection & microplastics sweep",
      "01:00 PM: Waste weighing and recycling segregation",
      "01:45 PM: Photography and closing discussion"
    ],
    verified: true
  },
  {
    id: "event-3",
    title: "Nutritional Food Distribution Camp",
    description: "Redistributing high-quality fresh food boxes sourced from sustainable local dining groups to low-income senior citizens.",
    category: "Food Distribution",
    organizer: "ZeroWaste Kitchens Network",
    locationName: "Civic Transit Plaza, SF",
    lat: 37.778,
    lng: -122.415,
    date: "June 20, 2026",
    time: "11:30 AM - 03:00 PM",
    volunteerLimit: 15,
    volunteers: ["user-1"],
    resources: [
      { name: "Food Ration Boxes", quantity: "120 boxed servings", required: true },
      { name: "Sanitizing Gloves", quantity: "30 pairs", required: true }
    ],
    budget: {
      total: 180,
      materials: ["Packaging boxes ($60)", "Transport ($120)"]
    },
    timeline: [
      "11:30 AM: Setup food storage tables",
      "12:00 PM: Seniors arrival & structured distribution",
      "02:30 PM: Clear storage racks & site sanitization"
    ],
    verified: false
  }
];

let wasteListings = [
  {
    id: "waste-1",
    producerId: "user-2",
    producerName: "Grand Bistro Restaurant",
    producerLocation: "456 Market St, San Francisco, CA",
    producerLat: 37.7801,
    producerLng: -112.412,
    weight: 95,
    wasteType: "vegetable_peels",
    description: "95kg of raw raw organic vegetable peels and coffee grounds from our morning food prep stage. Purely organic, no chemical products.",
    status: "available",
    dateUploaded: "2026-05-31",
    co2Saved: 161.5,
    compostYield: 19.0
  },
  {
    id: "waste-2",
    producerId: "user-2",
    producerName: "Grand Bistro Restaurant",
    producerLocation: "456 Market St, San Francisco, CA",
    producerLat: 37.7801,
    producerLng: -112.412,
    weight: 180,
    wasteType: "mixed_organic",
    description: "Bulk biodegradable waste from wedding wedding dinner event catering. Cooked and uncooked organic elements.",
    status: "pickup_scheduled",
    dateUploaded: "2026-05-30",
    pickupDate: "2026-06-01",
    collectorId: "user-3",
    collectorName: "BioRecycle Solutions",
    co2Saved: 306,
    compostYield: 36.0
  },
  {
    id: "waste-3",
    producerId: "event-kitchen-1",
    producerName: "Harbor Hotel banquet room",
    producerLocation: "1 Marina Blvd, San Francisco, CA",
    producerLat: 37.808,
    producerLng: -122.431,
    weight: 350,
    wasteType: "mixed_organic",
    description: "Heavy leftover food waste from regional startup summit ceremony. Safely containerized in steel bins.",
    status: "processing",
    dateUploaded: "2026-05-28",
    pickupDate: "2026-05-29",
    collectorId: "user-3",
    collectorName: "BioRecycle Solutions",
    processingCompanyId: "user-4",
    processingCompanyName: "EcoAgro Fertilizer Corp",
    co2Saved: 595,
    compostYield: 70.0
  },
  {
    id: "waste-4",
    producerId: "user-2",
    producerName: "Grand Bistro Restaurant",
    producerLocation: "456 Market St, San Francisco, CA",
    producerLat: 37.7801,
    producerLng: -112.412,
    weight: 150,
    wasteType: "dairy",
    description: "Expired creamery and backing ingredients from previous inventory shelf checks.",
    status: "processed",
    dateUploaded: "2026-05-20",
    pickupDate: "2026-05-22",
    collectorId: "user-3",
    collectorName: "BioRecycle Solutions",
    processingCompanyId: "user-4",
    processingCompanyName: "EcoAgro Fertilizer Corp",
    co2Saved: 255,
    compostYield: 30.0,
    earnings: 45
  }
];

let chatMessages = [
  { id: "m-1", senderId: "user-1", senderName: "Alex Rivera", senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex", content: "Hi team, what time are we gathering for McLaren Park tree planting drive?", timestamp: "10:15 AM", channelId: "comm-1" },
  { id: "m-2", senderId: "founder", senderName: "Sarah Jenkins", senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sarah", content: "We will meet at the McLaren South Entrance at 8:45 AM to check equipment. Shovels are preloaded!", timestamp: "10:18 AM", channelId: "comm-1" },
  { id: "m-3", senderId: "user-2", senderName: "Chef Amelia", senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Amelia", content: "Hey, we have some special waste items. Collected 95 kg. Pickup schedule for morning shifts?", timestamp: "09:00 AM", channelId: "comm-2" },
  { id: "m-4", senderId: "user-3", senderName: "BioRecycle Solutions", senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=BioRecycle", content: "Perfect Amelia, we have a routing truck in your alley at 8:30 AM tomorrow. We will mark it accepted!", timestamp: "09:05 AM", channelId: "comm-2" }
];

// --- AUTHENTICATION & SESSION PORTS ---
app.get("/api/auth/session", (req, res) => {
  res.json({ user: activeUser });
});

app.post("/api/auth/toggle-role", (req, res) => {
  const { role } = req.body;
  const target = users.find(u => u.role === role);
  if (target) {
    activeUser = target;
    res.json({ success: true, user: activeUser });
  } else {
    // dynamically create if doesn't exist
    const newUser = {
      id: `user-${Date.now()}`,
      email: `${role}@impactcircle.org`,
      name: `Demo ${role.toUpperCase()}`,
      role: role,
      causes: ["Sustainability", "Environment"],
      skills: ["Event Management"],
      availability: "Flexible" as const,
      location: { lat: 37.7749, lng: -122.4194, address: "San Francisco, CA" },
      impactScore: 100,
      communityRank: 40,
      volunteerHours: 5,
      treesPlanted: 2,
      wasteDiverted: 50,
      compostProduced: 10,
      badges: []
    };
    users.push(newUser);
    activeUser = newUser;
    res.json({ success: true, user: activeUser });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role, causes, skills, availability, location } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ success: false, message: "Required fields are missing." });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: "An account with this email address already exists." });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    password: password, // Store plain-text for simple prototype database persistence
    name: name || "Anonymous Changemaker",
    role: role || "volunteer",
    causes: causes || ["Sustainability"],
    skills: skills || ["Marketing"],
    availability: availability || "Flexible",
    location: location || { lat: 37.7749, lng: -122.4194, address: "Civic Center, San Francisco" },
    impactScore: 100,
    communityRank: 35,
    volunteerHours: 0,
    treesPlanted: 0,
    wasteDiverted: 0,
    compostProduced: 0,
    badges: [
      { id: "b-welcome", name: "Joiner", description: "Completed onboarding profile setup!", icon: "Flame", unlockedAt: "2026-05-31", color: "from-blue-400 to-indigo-500" }
    ]
  };
  
  users.push(newUser);
  activeUser = newUser;
  res.json({ success: true, user: activeUser });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required inputs." });
  }

  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (found) {
    const userPassword = found.password || "password"; // Default fallback to "password" for demonstration users
    if (password === userPassword) {
      activeUser = found;
      res.json({ success: true, user: activeUser });
    } else {
      res.status(401).json({ success: false, message: "Invalid password for this account. Please try again." });
    }
  } else {
    res.status(401).json({ success: false, message: "No registered account found with that email address. Would you like to create an account?" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  activeUser = null;
  res.json({ success: true });
});

// --- CORE RESOURCES ENDPOINTS ---
app.get("/api/communities", (req, res) => {
  res.json(communities);
});

app.post("/api/communities", (req, res) => {
  const { name, description, category, causes } = req.body;
  const newComm = {
    id: `comm-${Date.now()}`,
    name: name || "New Circle Community",
    description: description || "Organizing impact campaigns.",
    category: category || "Environment",
    avatar: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80",
    memberCount: 1,
    causes: causes || ["Environment"],
    achievements: ["Successfully launched page setup!"]
  };
  communities.push(newComm);
  res.json(newComm);
});

// Community Discussion Posts
app.get("/api/communities/:id/posts", (req, res) => {
  const commId = req.params.id;
  const list = communityPosts.filter(p => p.communityId === commId);
  res.json(list);
});

app.post("/api/communities/:id/posts", (req, res) => {
  const commId = req.params.id;
  const { content } = req.body;
  const newPost = {
    id: `post-${Date.now()}`,
    communityId: commId,
    authorName: activeUser.name,
    authorRole: activeUser.role === 'admin' ? 'Platform Admin' : `Active ${activeUser.role.toUpperCase()}`,
    authorAvatar: activeUser.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${activeUser.name}`,
    content: content || "Sharing collective action!",
    likes: 0,
    comments: [],
    timestamp: "Just now"
  };
  communityPosts.unshift(newPost);
  res.json(newPost);
});

app.post("/api/posts/:postId/like", (req, res) => {
  const { postId } = req.params;
  const post = communityPosts.find(p => p.id === postId);
  if (post) {
    post.likes += 1;
    res.json({ success: true, likes: post.likes });
  } else {
    res.status(404).json({ error: "Post not found" });
  }
});

app.post("/api/posts/:postId/comment", (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const post = communityPosts.find(p => p.id === postId);
  if (post && content) {
    const newComment = {
      id: `comment-${Date.now()}`,
      authorName: activeUser.name,
      authorAvatar: activeUser.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${activeUser.name}`,
      content: content,
      timestamp: "Just now"
    };
    post.comments.push(newComment);
    res.json(post);
  } else {
    res.status(404).json({ error: "Post not found or empty comment" });
  }
});

// --- EVENTS MANAGEMENT ---
app.get("/api/events", (req, res) => {
  res.json(events);
});

app.post("/api/events", (req, res) => {
  const { title, description, category, locationName, date, time, volunteerLimit, resources, budget, timeline } = req.body;
  const newEv = {
    id: `event-${Date.now()}`,
    title: title || "Community Green Drive",
    description: description || "No goals too big, no efforts too small.",
    category: category || "Environment",
    organizer: activeUser.name,
    locationName: locationName || "Downtown Plaza Park",
    lat: 37.7749,
    lng: -122.4194,
    date: date || "June 15, 2026",
    time: time || "10:00 AM - 01:00 PM",
    volunteerLimit: Number(volunteerLimit) || 20,
    volunteers: [activeUser.id],
    resources: resources || [{ name: "Bags", quantity: "20 bags", required: true }],
    budget: budget || { total: 100, materials: ["Standard startup gear ($100)"] },
    timeline: timeline || ["10:00 AM Meeting point gathering", "12:00 PM Work tally and refreshments"],
    verified: activeUser.role === 'admin'
  };
  events.push(newEv);
  res.json(newEv);
});

app.post("/api/events/:id/join", (req, res) => {
  const evId = req.params.id;
  const ev = events.find(e => e.id === evId);
  if (ev) {
    if (ev.volunteers.includes(activeUser.id)) {
      // Unjoin
      ev.volunteers = ev.volunteers.filter(id => id !== activeUser.id);
      res.json({ success: true, joined: false, volunteersCount: ev.volunteers.length });
    } else {
      // Join
      ev.volunteers.push(activeUser.id);
      activeUser.volunteerHours += 2; // grant volunteer time
      activeUser.impactScore += 25; // boost impact rating points
      res.json({ success: true, joined: true, volunteersCount: ev.volunteers.length });
    }
  } else {
    res.status(404).json({ error: "Event not found" });
  }
});

app.post("/api/events/:id/verify", (req, res) => {
  const evId = req.params.id;
  const ev = events.find(e => e.id === evId);
  if (ev) {
    ev.verified = true;
    res.json({ success: true, event: ev });
  } else {
    res.status(404).json({ error: "Event not found" });
  }
});

// --- CHATS MESSAGING ---
app.get("/api/chats/:id", (req, res) => {
  const id = req.params.id;
  const items = chatMessages.filter(m => m.channelId === id);
  res.json(items);
});

app.post("/api/chats", (req, res) => {
  const { channelId, content } = req.body;
  const message = {
    id: `msg-${Date.now()}`,
    senderId: activeUser.id,
    senderName: activeUser.name,
    senderAvatar: activeUser.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${activeUser.name}`,
    content: content || "Hello team!",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    channelId: channelId || "global"
  };
  chatMessages.push(message);
  res.json(message);
});

// --- CIRCULAR ECONOMY WASTE MARKETPLACE ---
app.get("/api/waste-listings", (req, res) => {
  res.json(wasteListings);
});

app.post("/api/waste-listings", (req, res) => {
  const { weight, wasteType, description, location } = req.body;
  const numericWeight = Number(weight) || 50;
  // Calculate potential variables
  const co2Saved = Number((numericWeight * 1.7).toFixed(1));
  const compostYield = Number((numericWeight * 0.2).toFixed(1));

  const newListing = {
    id: `waste-${Date.now()}`,
    producerId: activeUser.id,
    producerName: activeUser.name,
    producerLocation: location || activeUser.location.address,
    producerLat: activeUser.location.lat,
    producerLng: activeUser.location.lng,
    weight: numericWeight,
    wasteType: wasteType || "vegetable_peels",
    description: description || "Daily food operations leftovers.",
    status: "available" as const,
    dateUploaded: new Date().toISOString().split('T')[0],
    co2Saved,
    compostYield
  };
  wasteListings.unshift(newListing);
  
  // Track metrics on active producer user
  activeUser.wasteDiverted += numericWeight;
  activeUser.impactScore += Math.floor(numericWeight * 0.8);

  res.json(newListing);
});

app.post("/api/waste-listings/:id/schedule", (req, res) => {
  const { id } = req.params;
  const { date } = req.body;
  const item = wasteListings.find(w => w.id === id);
  if (item) {
    item.status = "pickup_scheduled";
    item.pickupDate = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    item.collectorId = activeUser.id;
    item.collectorName = activeUser.name;
    res.json(item);
  } else {
    res.status(404).json({ error: "Waste listing not found" });
  }
});

app.post("/api/waste-listings/:id/collect", (req, res) => {
  const { id } = req.params;
  const item = wasteListings.find(w => w.id === id);
  if (item) {
    item.status = "collected";
    // Collector impact score boost
    activeUser.wasteDiverted += item.weight;
    activeUser.impactScore += Math.floor(item.weight * 0.5);
    res.json(item);
  } else {
    res.status(404).json({ error: "Waste listing not found" });
  }
});

app.post("/api/waste-listings/:id/process", (req, res) => {
  const { id } = req.params;
  const item = wasteListings.find(w => w.id === id);
  if (item) {
    item.status = "processed";
    item.processingCompanyId = activeUser.id;
    item.processingCompanyName = activeUser.name;
    item.earnings = Math.floor(item.weight * 0.3); // mock payout to restaurant

    // Update processing statistics
    activeUser.compostProduced += item.compostYield;
    activeUser.impactScore += Math.floor(item.compostYield * 2);

    // Update restaurant/producer too
    const producer = users.find(u => u.id === item.producerId);
    if (producer) {
      producer.compostProduced += item.compostYield;
      producer.impactScore += 100; // special circular complete points
    }

    res.json(item);
  } else {
    res.status(404).json({ error: "Waste listing not found" });
  }
});

// GET ADMIN SUMMARY STATS
app.get("/api/admin/overview", (req, res) => {
  const totalVolunteers = users.filter(u => u.role === 'volunteer').length;
  const totalProducers = users.filter(u => u.role === 'producer').length;
  const totalCollectors = users.filter(u => u.role === 'collector').length;
  const totalProcessing = users.filter(u => u.role === 'fertilizer_company').length;
  
  res.json({
    totalUsers: users.length,
    usersBreakdown: {
      volunteer: totalVolunteers,
      producer: totalProducers,
      collector: totalCollectors,
      fertilizer_company: totalProcessing,
    },
    communityCount: communities.length,
    eventsCount: events.length,
    unverifiedEvents: events.filter(e => !e.verified).length,
    totalWasteRecycled: wasteListings.reduce((sum, item) => sum + (item.status === 'processed' ? item.weight : 0), 0),
    carbonEmissionsSaved: wasteListings.reduce((sum, item) => sum + item.co2Saved, 0)
  });
});

// --- AI GENERATIVE INTELLIGENCE CORES ---

// 1. AI Cause Match Route
app.post("/api/ai/cause-match", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Query text is required" });
  }

  try {
    const prompt = `
      You are an expert AI community coordinator for "Impact Circle".
      We want you to read the user request of their goals and interests, and return which causes, community circles, and volunteer actions are the perfect match.

      Analyze and align the user input against these target lists:
      Causes: [Environment, Tree Plantation, Animal Welfare, Education, Blood Donation, Healthcare, Community Service, Food Distribution, Sustainability]
      Recommended Skills to pick: [Teaching, Design, Programming, Photography, Event Management, Medical Support, Marketing]

      User Input: "${text}"

      Return a strict JSON format matching this schema:
      {
        "matchingCauses": ["cause-name1", "cause-name2"],
        "recommendedSkills": ["skill-name1", "skill-name2"],
        "reasoningText": "A warm, 2-sentence explanation of why these match their aspirations",
        "actionIdeas": ["Specific action project group 1", "Specific action project group 2"]
      }
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchingCauses: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            reasoningText: { type: Type.STRING },
            actionIdeas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["matchingCauses", "recommendedSkills", "reasoningText", "actionIdeas"]
        }
      }
    });

    res.json(JSON.parse(result.text.trim()));
  } catch (err: any) {
    console.error("AI Cause matching error:", err);
    // Graceful offline fallback if API Key not set
    res.json({
      matchingCauses: ["Environment", "Sustainability"],
      recommendedSkills: ["Event Management", "Photography"],
      reasoningText: "Based on your focus, we recommend getting involved in active tree planting groups and community-level events.",
      actionIdeas: ["Planting saplings in local suburban parks", "Setting up water conservation posts"]
    });
  }
});

// 2. AI Event Planner Route
app.post("/api/ai/event-planner", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Event idea text is required" });
  }

  try {
    const prompt = `
      You are an AI Sustainability Event Planner for Impact Circle.
      The user wrote: "${text}"

      Please generate a polished micro-blueprint/checklist structure for this initiative.
      We need:
      1. Required Volunteers estimation
      2. Estimated Materials Budget in USD (just numbers)
      3. Items of materials needed
      4. A logical, step-by-step chronology/timeline schedule of events

      Return a strict JSON format matching this schema:
      {
        "estimatedVolunteers": 15,
        "estimatedBudgetUSD": 250,
        "requiredMaterials": ["Material item 1 with description", "Material item 2 with description"],
        "proposedTimeline": [
          "09:00 AM - Gather & Intro",
          "10:00 AM - Phase 1 execute",
          "12:00 PM - Tally results"
        ],
        "expertPlannersAdvice": "A 1-sentence tip on maximizing volunteer attendance or composting effect."
      }
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedVolunteers: { type: Type.INTEGER },
            estimatedBudgetUSD: { type: Type.INTEGER },
            requiredMaterials: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            proposedTimeline: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            expertPlannersAdvice: { type: Type.STRING }
          },
          required: ["estimatedVolunteers", "estimatedBudgetUSD", "requiredMaterials", "proposedTimeline", "expertPlannersAdvice"]
        }
      }
    });

    res.json(JSON.parse(result.text.trim()));
  } catch (err: any) {
    console.error("AI Planner error:", err);
    // Graceful mock fallback
    res.json({
      estimatedVolunteers: 20,
      estimatedBudgetUSD: 300,
      requiredMaterials: ["30 high-quality saplings ($150)", "Compost soils ($50)", "Shovels & Rakes ($100)"],
      proposedTimeline: [
        "09:00 AM - Volunteer briefing & tool handouts",
        "09:30 AM - Soil preparation with local compost",
        "10:30 AM - Plantation & watering",
        "12:00 PM - Impact photoshoot & refreshments"
      ],
      expertPlannersAdvice: "Check regional forecasts and invite local gardening bloggers to share your event!"
    });
  }
});

// 3. AI Waste Optimization Predictor Route
app.post("/api/ai/waste-predictor", async (req, res) => {
  const { businessType, averageDailyWasteKg } = req.body;
  if (!businessType) {
    return res.status(400).json({ error: "Business type is required" });
  }

  try {
    const dailyKg = Number(averageDailyWasteKg) || 120;
    const prompt = `
      You are an AI Circular Economy Expert.
      Analyze waste prediction patterns for a business category: "${businessType}" generating approx ${dailyKg} kg of wet food scraps daily.

      Provide estimates for:
      - Estimated weekly compost produced (compost yields generally range from 15% to 25% of wet organic weight)
      - Estimated weekly CO2 emissions offset (in kg). (Converting food waste to compost typically saves about 1.7kg to 1.9kg of CO2 equivalent per kg of wet waste).
      - Optimal pickup cycle sequence (e.g., 'Daily', 'Every 2 days', 'Twice a week').
      - A smart sustainability insight on how the company can reorganize kitchen preparation to reduce raw waste.

      Return a strict JSON format matching this schema:
      {
        "weeklyCompostProduceKg": 150.5,
        "weeklyCo2SavedKg": 1024.0,
        "optimalPickupSchedule": "Every 2 days",
        "kitchenReductionInsight": "A 2-sentence actionable tip on minimizing trimming scrap or storing leftovers"
      }
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeklyCompostProduceKg: { type: Type.NUMBER },
            weeklyCo2SavedKg: { type: Type.NUMBER },
            optimalPickupSchedule: { type: Type.STRING },
            kitchenReductionInsight: { type: Type.STRING }
          },
          required: ["weeklyCompostProduceKg", "weeklyCo2SavedKg", "optimalPickupSchedule", "kitchenReductionInsight"]
        }
      }
    });

    res.json(JSON.parse(result.text.trim()));
  } catch (err: any) {
    console.error("AI Waste optimization error:", err);
    const dailyKg = Number(averageDailyWasteKg) || 120;
    // Direct numerical approximation
    res.json({
      weeklyCompostProduceKg: Number((dailyKg * 7 * 0.2).toFixed(1)),
      weeklyCo2SavedKg: Number((dailyKg * 7 * 1.8).toFixed(1)),
      optimalPickupSchedule: "Daily morning",
      kitchenReductionInsight: "Separate prep waste from customer plates. Vegetable skins can be boiled down into stocks instead of being directly discarded."
    });
  }
});

// 4. AI Impact Insights Report Route
app.post("/api/ai/impact-insights", async (req, res) => {
  try {
    // Collect stats
    const totalTrees = events.reduce((sum, e) => sum + (e.category === "Tree Plantation" ? 30 : 0), 250);
    const totalWasteKg = wasteListings.reduce((sum, item) => sum + item.weight, 580);
    const totalCompostKg = wasteListings.reduce((sum, item) => sum + item.compostYield, 116);

    const prompt = `
      You are the friendly Director of Impact Analysis at Impact Circle.
      Analyze these macro stats:
      - Total Trees Planted across initiatives: ${totalTrees}
      - Total Bio-waste Diverted from landfills: ${totalWasteKg} kilograms
      - Total Nutritious Compost Produced: ${totalCompostKg} kilograms

      Write a highly inspiring, optimistic, venture-backed startup style micro newsletter/impact report.
      Make it 3 short paragraphs.
      Highlight:
      1. What these numbers represent for municipal land savings.
      2. The circular loops created between local dining networks and farms.
      3. A positive call to action for the next half of the year.

      Provide standard raw text. Do not return JSON. Write in clean markdown paragraph format.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ report: result.text.trim() });
  } catch (err) {
    console.error("AI Impact Insights error:", err);
    res.json({
      report: `### Cultivating Collective Green Vibrancy\n\nOur cooperative efforts represent a spectacular turning point for urban sustainability. By diverting **580kg of organic waste** away from structural city landfills, we have prevented corresponding raw methane releases and successfully yielded **116kg of fertile, nutrient-dense natural compost** for regional farm irrigation. \n\nAt the same time, planting **250 micro trees** transforms empty streets into lively shade reserves. These trees actively cleanse city air currents, cool our pavements, and bring community neighbors closer during active events. Let's grow these circular programs even further!`
    });
  }
});

// --- VITE MIDDLEWARE DEVELOPMENT FOR CLIENT ROUTING ---
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start full-stack server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error("Failed to start server loop:", err);
});
