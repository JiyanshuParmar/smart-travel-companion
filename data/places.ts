export type PlaceCategory =
  | "Hidden Places"
  | "Local Food"
  | "Homestays"
  | "Local Guides"
  | "Culture"
  | "Adventure";

export interface Place {
  id: string;
  title: string;
  location: string;
  category: PlaceCategory;
  shortDescription: string;
  image: string;
  demoRating: number;
  reviewCount: number;
  highlight: string;
  bestTime: string;
}

export const PLACES_CATEGORIES: PlaceCategory[] = [
  "Hidden Places",
  "Local Food",
  "Homestays",
  "Local Guides",
  "Culture",
  "Adventure",
];

export const PLACES_DATA: Place[] = [
  {
    id: "divar-island",
    title: "Divar Island Sluice Gates & Estuary",
    location: "Mandovi River Basin, Goa",
    category: "Hidden Places",
    shortDescription:
      "A car-free island reached only by government river barges, preserving pre-Portuguese dike systems and bird sanctuaries.",
    image:
      "https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=800&q=80",
    demoRating: 4.92,
    reviewCount: 38,
    highlight: "Ancestral bund networks & riverside fado melodies",
    bestTime: "Sunrise or late afternoon",
  },
  {
    id: "saraswat-thali",
    title: "Fernandes Ancestral Woodfire Kitchen",
    location: "Near Chorao Ferry, Goa",
    category: "Local Food",
    shortDescription:
      "A 90-year-old family kitchen serving traditional earthen-pot sungta (prawn) curry and steamed sanna cakes cooked with palm toddy ferment.",
    image:
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
    demoRating: 4.88,
    reviewCount: 52,
    highlight: "Secret triple-ground kokum gravy & heirloom recipes",
    bestTime: "Lunch (12:30 PM – 3:30 PM)",
  },
  {
    id: "marari-coconuts",
    title: "Nellickal Canal Heritage Farmstay",
    location: "Kumarakom, Kerala",
    category: "Homestays",
    shortDescription:
      "A 140-year-old wooden Nalukettu courtyard home surrounded by narrow canoe canals and organic pepper plantations.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    demoRating: 4.95,
    reviewCount: 41,
    highlight: "Row your own non-motorized wooden canoe at sunrise",
    bestTime: "September to March",
  },
  {
    id: "kashi-heritage-guide",
    title: "Anand's Medieval Ghats & Akhada Walk",
    location: "Varanasi, Uttar Pradesh",
    category: "Local Guides",
    shortDescription:
      "Walk the oldest labyrinth alleys with a 5th-generation resident historian to uncover mud-pit wrestling akhadas and clandestine music gharanas.",
    image:
      "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
    demoRating: 4.97,
    reviewCount: 64,
    highlight: "Private dawn access to Vedic chants and classical sitar riyaz",
    bestTime: "5:30 AM – 8:30 AM",
  },
  {
    id: "shekhawati-havelis",
    title: "Mandawa Painted Open-Air Frescoes",
    location: "Shekhawati, Rajasthan",
    category: "Culture",
    shortDescription:
      "Intricate 19th-century fresco murals rendered with natural vegetable pigments, depicting subcontinental caravans and mythology.",
    image:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    demoRating: 4.89,
    reviewCount: 31,
    highlight: "Preserved natural indigo and turmeric pigment ceilings",
    bestTime: "October to February",
  },
  {
    id: "nongriat-trail",
    title: "Double Decker Living Root Trek",
    location: "Nongriat, Meghalaya",
    category: "Adventure",
    shortDescription:
      "A descending stone trail into the rain-forested gorge leading to bio-architectural Ficus elastica bridges nurtured across centuries.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    demoRating: 4.94,
    reviewCount: 47,
    highlight: "Swim in emerald natural spring basins beneath the bridges",
    bestTime: "October to April",
  },
  {
    id: "tirthan-forest-cabin",
    title: "Tirthan Cedar Valley Sanctuary",
    location: "Gushaini, Himachal Pradesh",
    category: "Hidden Places",
    shortDescription:
      "Resting on the boundary of the Great Himalayan National Park, surrounded by deodar spires and untamed glacial streams.",
    image:
      "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
    demoRating: 4.91,
    reviewCount: 29,
    highlight: "Hike to the ancient Chhoie waterfall without tour groups",
    bestTime: "March to June & Sept to Nov",
  },
  {
    id: "bagru-block-printing",
    title: "Bagru Chipper Guild Mud-Resist Dyeing",
    location: "Bagru, Rajasthan",
    category: "Culture",
    shortDescription:
      "Experience the 400-year-old Dabu mud-resist handblock printing tradition directly in the courtyards of the hereditary master craftsmen.",
    image:
      "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80",
    demoRating: 4.86,
    reviewCount: 22,
    highlight: "Create your own hand-printed indigo scarf on teakwood blocks",
    bestTime: "Year-round except monsoon",
  },
];
