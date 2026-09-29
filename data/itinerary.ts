export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  categoryTag: string;
  costEstimate: string;
  hiddenGem?: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  dayTitle: string;
  theme: string;
  dailyEstimate: string;
  highlights: string[];
  activities: ItineraryActivity[];
}

export interface DemoItinerary {
  tripTitle: string;
  destination: string;
  duration: string;
  estimatedCostRange: string;
  authenticityScore: string;
  aiRecommendation: string;
  costBreakdown: {
    stay: string;
    food: string;
    activities: string;
    localTransit: string;
  };
  days: ItineraryDay[];
}

export const DEMO_ITINERARY: DemoItinerary = {
  tripTitle: "3 Days in Goa: Beyond The Beach Shacks",
  destination: "Goa, India",
  duration: "3 Days / 2 Nights",
  estimatedCostRange: "₹18,500 – ₹22,000",
  authenticityScore: "96% Local Authenticity Index",
  aiRecommendation:
    "Rerouted away from saturated North Goa party strips toward inland estuary waterways, ancestral Saraswat kitchens, and quiet South Goa coves.",
  costBreakdown: {
    stay: "₹8,500 (2 nights heritage villa)",
    food: "₹4,200 (authentic woodfire kitchens)",
    activities: "₹3,800 (kayak guide & spice tour)",
    localTransit: "₹3,000 (local electric scooter & ferry)",
  },
  days: [
    {
      dayNumber: 1,
      dayTitle: "Day 1",
      theme: "Arrival + Ancestral Coastal Cuisine",
      dailyEstimate: "₹5,200",
      highlights: ["Kokum welcome cooler", "Chorao river ferry", "Fontainhas architectural walk"],
      activities: [
        {
          time: "10:30 AM",
          title: "Scenic Arrival & Check-in at Panjim Heritage Quarters",
          description:
            "Unpack at a lovingly restored 19th-century Indo-Portuguese courtyard homestay with red oxide floors.",
          categoryTag: "Check-in & Heritage",
          costEstimate: "Included in stay",
        },
        {
          time: "01:00 PM",
          title: "Ancestral Saraswat Thali at Chorao Riverside",
          description:
            "Take the public barge to Chorao island for wood-fired curry with wild kokum, tisreo (clams), and red rice.",
          categoryTag: "Authentic Culinary",
          costEstimate: "₹850 for two",
          hiddenGem: true,
        },
        {
          time: "05:00 PM",
          title: "Fontainhas Architectural Walking Immersion",
          description:
            "Guided stroll with local conservator through pastel azulejo tile lanes, ancestral bakeries, and old wells.",
          categoryTag: "Heritage Walk",
          costEstimate: "₹1,200",
        },
      ],
    },
    {
      dayNumber: 2,
      dayTitle: "Day 2",
      theme: "Hidden Beach Cove + Estuary Kayak Experience",
      dailyEstimate: "₹8,400",
      highlights: ["Sunrise mangrove kayak", "Cashew feni distillation", "Secluded cliff beach"],
      activities: [
        {
          time: "06:30 AM",
          title: "Silent Mangrove Kayak in Nerul Backwaters",
          description:
            "Paddle through silent brackish canals teeming with kingfishers and mudskippers guided by an indigenous biologist.",
          categoryTag: "Nature & Adventure",
          costEstimate: "₹1,800",
          hiddenGem: true,
        },
        {
          time: "12:00 PM",
          title: "Organic Cashew & Spice Plantation Lunch",
          description:
            "Farm-to-table lunch amidst nutmeg trees followed by a gentle demonstration of traditional clay feni pot stills.",
          categoryTag: "Agri-Tourism",
          costEstimate: "₹1,400",
        },
        {
          time: "04:30 PM",
          title: "Hidden Butterfly Cove Sunset Seclusion",
          description:
            "Short hike through coastal scrub to reach a quiet crescent bay where local fishermen moor hand-carved outriggers.",
          categoryTag: "Secret Spot",
          costEstimate: "Free discovery",
          hiddenGem: true,
        },
      ],
    },
    {
      dayNumber: 3,
      dayTitle: "Day 3",
      theme: "Living Culture, Looms & Departure",
      dailyEstimate: "₹5,400",
      highlights: ["Kunbi handloom visit", "Old bakery poi fresh breads", "River departure"],
      activities: [
        {
          time: "08:30 AM",
          title: "Poder's Fresh Bread Trail in Raia Village",
          description:
            "Follow the ringing bicycle horn of the village baker for oven-fresh poee and pão stuffed with spiced chourico.",
          categoryTag: "Local Tradition",
          costEstimate: "₹250",
        },
        {
          time: "11:00 AM",
          title: "Kunbi Handloom Textile Revival Workshop",
          description:
            "Support local women artisans preserving Goa's indigenous checkered red and white handloom cotton weaves.",
          categoryTag: "Artisan Looms",
          costEstimate: "Direct studio craft",
          hiddenGem: true,
        },
        {
          time: "03:30 PM",
          title: "Mandovi Estuary Sunset Departure",
          description:
            "Conclude the journey with a quiet riverside ferry crossing towards Dabolim / Mopa airport.",
          categoryTag: "Departure Transit",
          costEstimate: "₹1,200",
        },
      ],
    },
  ],
};
