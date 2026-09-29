export interface Destination {
  id: string;
  name: string;
  state: string;
  tagline: string;
  description: string;
  exampleBudget: string;
  image: string;
  tags: string[];
  duration: string;
  hiddenGemHighlight: string;
}

export const POPULAR_DESTINATIONS: Destination[] = [
  {
    id: "goa",
    name: "Goa",
    state: "Goa",
    tagline: "Sunkissed estuaries & Portuguese heritage trails",
    description:
      "Venture past the overcrowded tourist strips into inland backwaters, ancestral Fontainhas mansions, and secluded spice farms.",
    exampleBudget: "₹18,500 – ₹24,000",
    duration: "3 – 5 Days",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80",
    tags: ["Secret Estuaries", "Heritage Quarters", "Artisanal Bakeries"],
    hiddenGemHighlight:
      "Divar Island backwaters & 18th-century cashew feni distilleries",
  },
  {
    id: "kerala",
    name: "Kerala",
    state: "Kerala",
    tagline: "Serene inland waterways & mist-draped coffee hills",
    description:
      "Glide on non-motorized canoe canals in Kumarakom, experience organic spices in Wayanad, and wake up to ancestral coastal cuisine.",
    exampleBudget: "₹22,000 – ₹28,500",
    duration: "4 – 6 Days",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80",
    tags: ["Canoe Backwaters", "Spice Gardens", "Heritage Homestays"],
    hiddenGemHighlight:
      "Silent Marari fishermen villages and unlisted toddy shacks",
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    state: "Rajasthan",
    tagline: "Frescoed havelis, desert artisans & starlit dunes",
    description:
      "Discover the open-air fresco galleries of Shekhawati, master indigo dyers in Bagru, and quiet family-hosted desert retreats.",
    exampleBudget: "₹24,000 – ₹32,000",
    duration: "5 – 7 Days",
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80",
    tags: ["Living Havelis", "Hand-Block Looms", "Folk Storytellers"],
    hiddenGemHighlight:
      "Mandawa's preserved painted courtyards away from highway jams",
  },
  {
    id: "himachal",
    name: "Himachal Pradesh",
    state: "Himachal Pradesh",
    tagline: "Alpine cedar forests, river valleys & high hamlets",
    description:
      "Bypass congested hill stations for the whispering pine forests of Tirthan Valley, ancient wooden temples, and riverside organic trout farms.",
    exampleBudget: "₹16,500 – ₹22,000",
    duration: "4 – 6 Days",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80",
    tags: ["Pine Forest Trails", "Orchard Cottages", "River Walks"],
    hiddenGemHighlight:
      "Great Himalayan National Park buffer zone homestays",
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    state: "Meghalaya",
    tagline: "Living root wonders, cloud forests & sacred groves",
    description:
      "Trek along bio-engineered living root spans, discover crystal-clear river canyons, and experience indigenous Khasi matriarchal village life.",
    exampleBudget: "₹26,000 – ₹35,000",
    duration: "5 – 7 Days",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=80",
    tags: ["Living Root Bridges", "Cloud Highlands", "Indigenous Groves"],
    hiddenGemHighlight:
      "Krang Shuri azure natural pools & Mawphlang sacred forests",
  },
];