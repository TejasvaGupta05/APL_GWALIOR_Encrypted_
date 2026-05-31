export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'volunteer' | 'producer' | 'collector' | 'fertilizer_company' | 'admin';
  causes: string[];
  skills: string[];
  availability: 'Weekdays' | 'Weekends' | 'Flexible';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  impactScore: number;
  communityRank: number;
  volunteerHours: number;
  treesPlanted: number;
  wasteDiverted: number; // in kg
  compostProduced: number; // in kg
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  color: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage: string;
  category: string;
  memberCount: number;
  causes: string[];
  achievements: string[];
  creatorId: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  content: string;
  image?: string;
  likes: number;
  likedByMe?: boolean;
  comments: Comment[];
  timestamp: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  organizer: string;
  locationName: string;
  lat: number;
  lng: number;
  date: string;
  time: string;
  volunteerLimit: number;
  volunteers: string[]; // user list
  resources: { name: string; quantity: string; required: boolean }[];
  budget?: {
    total: number;
    materials: string[];
  };
  timeline?: string[];
  verified: boolean;
}

export interface WasteListing {
  id: string;
  producerId: string;
  producerName: string;
  producerLocation: string;
  producerLat: number;
  producerLng: number;
  weight: number; // in kg
  wasteType: 'vegetable_peels' | 'cooked_food' | 'bakery' | 'dairy' | 'mixed_organic';
  description: string;
  status: 'available' | 'pickup_scheduled' | 'collected' | 'processing' | 'processed';
  dateUploaded: string;
  pickupDate?: string;
  collectorId?: string;
  collectorName?: string;
  processingCompanyId?: string;
  processingCompanyName?: string;
  co2Saved: number; // in kg CO2 e
  compostYield: number; // in kg compost
  earnings?: number; // if sold
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  channelId: string; // community ID, event ID, or user-to-user pairing ID
}

export interface ImpactAnalytics {
  treesPlanted: number;
  volunteerHours: number;
  wasteCollectedKg: number;
  compostProducedKg: number;
  co2SavedKg: number;
  peopleImpacted: number;
  monthlyWasteData: { month: string; collected: number; processed: number }[];
  monthlyImpactData: { month: string; plantings: number; volunteerHrs: number }[];
}
