export type BusinessCategory =
  | "Homestay"
  | "Local Guide"
  | "Food Experience"
  | "Artisan"
  | "Activity"
  | "Transport";

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  location: string;
  hostName: string;
  hostRole: string;
  pricing: string;
  image: string;
  verified: boolean;
  shortDescription: string;
  tags: string[];
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  "Homestay",
  "Local Guide",
  "Food Experience",
  "Artisan",
  "Activity",
  "Transport",
];

export const BUSINESSES_DATA: Business[] = [
  {
    id: "casa-rodrigues",
    name: "Casa Rodrigues Heritage Estate",
    category: "Homestay",
    location: "Raia, South Goa",
    hostName: "Father & Daughter Host Pair (Roque & Anika)",
    hostRole: "6th-Gen Estate Custodians",
    pricing: "₹3,800 / night (incl. breakfast)",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    verified: true,
    shortDescription:
      "A 280-year-old restored Portuguese villa surrounded by organic mango groves, handmade terracotta tiles, and grandmother's recipes.",
    tags: ["Verified Host", "Farm-to-Table", "Heritage Architecture"],
  },
  {
    id: "varanasi-dawn-tours",
    name: "Subah-e-Banaras Heritage Walkers",
    category: "Local Guide",
    location: "Assi Ghat, Varanasi",
    hostName: "Pt. Rameshwar Mishra",
    hostRole: "Certified Cultural Historian",
    pricing: "₹1,200 / person (3-hr immersion)",
    image:
      "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
    verified: true,
    shortDescription:
      "Discover the hidden musical lineages, century-old wrestling akhadas, and secret rooftop views across the sacred river bends.",
    tags: ["Government Certified", "Bilingual", "Off-beat Routes"],
  },
  {
    id: "chettinad-cooking",
    name: "Meenakshi's Heirloom Spice Kitchen",
    category: "Food Experience",
    location: "Karaikudi, Tamil Nadu",
    hostName: "Chef Meenakshi Alagappan",
    hostRole: "Traditional Gastronomy Preserver",
    pricing: "₹1,500 / workshop (incl. feast)",
    image:
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
    verified: true,
    shortDescription:
      "Hand-grind sun-dried spices on traditional granite ammi kal stones and master the aromatic nuances of wood-fired Chettinad gravies.",
    tags: ["Hands-on Workshop", "Ancestral Cookware", "Full Feast"],
  },
  {
    id: "chanderi-weavers",
    name: "Bunkar Collective Handloom Looms",
    category: "Artisan",
    location: "Chanderi, Madhya Pradesh",
    hostName: "Master Weaver Mohammad Rafiq",
    hostRole: "National Awardee Weaver",
    pricing: "Direct artisan purchase & live loom tour",
    image:
      "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80",
    verified: true,
    shortDescription:
      "Witness real zari and gossamer silk weaving on hundred-year-old pit looms, cutting out middlemen for 100% fair artisan compensation.",
    tags: ["Zero Middlemen", "GI Tagged", "Direct Studio Pickup"],
  },
  {
    id: "dawki-canyon-kayak",
    name: "Umngot Crystalline River Kayakers",
    category: "Activity",
    location: "Shnongpdeng, Meghalaya",
    hostName: "Bantei & Pynskhem Khasi Team",
    hostRole: "Certified River Swiftwater Guides",
    pricing: "₹1,800 / session (equipment + guide)",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    verified: true,
    shortDescription:
      "Paddle over the world's most transparent river canyon in fiberglass canoes with life-vests and indigenous village safety navigators.",
    tags: ["Safety First", "Eco-Certified", "Community Run"],
  },
  {
    id: "himalayan-4x4-locals",
    name: "Spiti High-Altitude Local Drivers Union",
    category: "Transport",
    location: "Kaza, Spiti Valley, Himachal",
    hostName: "Tenzing Dorje & Local Fleet",
    hostRole: "20-Year Mountain Transporter",
    pricing: "Fixed transparent tariff from ₹4,500/day",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    verified: true,
    shortDescription:
      "Reliable 4x4 mountain vehicles piloted exclusively by high-pass winter drivers who know every landslide bypass and valley hamlet.",
    tags: ["Transparent Rates", "All-Terrain 4x4", "High Altitude Vet"],
  },
];
