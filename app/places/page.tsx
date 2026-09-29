"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  MapPin,
  Search,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Place = {
  id: string;
  title: string;
  slug: string;
  category: string;
  state: string;
  district: string | null;
  location_name: string;
  short_description: string;
  primary_image_url: string;
  estimated_cost_inr: number | null;
};

const categories = [
  "All",
  "Hidden Places",
  "Local Food",
  "Culture",
  "Nature",
  "Adventure",
];

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPlaces() {
      setLoading(true);
      setErrorMessage("");

      const supabase = createClient();

      const { data, error } = await supabase
        .from("places")
        .select(
          `
          id,
          title,
          slug,
          category,
          state,
          district,
          location_name,
          short_description,
          primary_image_url,
          estimated_cost_inr
        `
        )
        .eq("moderation_status", "APPROVED")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load places:", error);

        setErrorMessage(
          "We couldn't load places right now. Please try again."
        );

        setPlaces([]);
      } else {
        setPlaces(data ?? []);
      }

      setLoading(false);
    }

    loadPlaces();
  }, []);

  const filteredPlaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return places.filter((place) => {
      const matchesCategory =
        selectedCategory === "All" ||
        place.category === selectedCategory;

      if (!query) {
        return matchesCategory;
      }

      const searchableText = [
        place.title,
        place.category,
        place.state,
        place.district ?? "",
        place.location_name,
        place.short_description,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchableText.includes(query);
    });
  }, [places, searchQuery, selectedCategory]);

  function clearSearch() {
    setSearchQuery("");
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#1d1d1b]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#151515] text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-500 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-amber-400 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium tracking-wide text-white/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-orange-300" />
              LOCAL-FIRST DISCOVERY
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Discover places
              <span className="block font-serif italic text-orange-300">
                tourists miss.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              Go beyond the standard itinerary. Explore local experiences,
              cultural landmarks, nature escapes and community-discovered
              places across India.
            </p>
          </div>

          {/* Search */}
          <div className="mt-10 max-w-3xl">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white p-2 shadow-2xl">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f3f0ea] text-[#55524c]">
                <Search className="h-5 w-5" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search Goa, culture, food, nature..."
                className="min-w-0 flex-1 bg-transparent px-1 text-sm text-[#1d1d1b] outline-none placeholder:text-[#99958d] sm:text-base"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mr-2 rounded-full p-2 text-[#77736c] transition hover:bg-[#f3f0ea] hover:text-[#1d1d1b]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
        {/* Category filters */}
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const active = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#1d1d1b] text-white shadow-sm"
                    : "border border-[#ddd9d1] bg-white text-[#68645d] hover:border-[#bdb8ae] hover:text-[#1d1d1b]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Result heading */}
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a6a3a]">
              Explore India
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Places worth adding to your trip
            </h2>
          </div>

          {!loading && (
            <p className="hidden text-sm text-[#817d75] sm:block">
              {filteredPlaces.length}{" "}
              {filteredPlaces.length === 1 ? "place" : "places"}
            </p>
          )}
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-[#e3dfd7] bg-white"
              >
                <div className="h-60 animate-pulse bg-[#e8e4dc]" />

                <div className="space-y-4 p-6">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#e8e4dc]" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-[#e8e4dc]" />
                  <div className="h-4 w-full animate-pulse rounded bg-[#e8e4dc]" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[#e8e4dc]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !errorMessage && filteredPlaces.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[#cfcac1] bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f1eee8]">
              <Compass className="h-7 w-7 text-[#817b71]" />
            </div>

            <h3 className="mt-6 text-xl font-semibold">
              No places found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817d75]">
              Try another search term or choose a different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-6 rounded-full bg-[#1d1d1b] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#333330]"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Place cards */}
        {!loading && filteredPlaces.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place) => (
              <Link
                key={place.id}
                href={`/places/${place.id}`}
                className="group overflow-hidden rounded-3xl border border-[#e3dfd7] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#d0cbc1] hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-[#e8e4dc]">
                  <Image
                    src={place.primary_image_url}
                    alt={place.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#383631] shadow-sm backdrop-blur">
                      {place.category}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-sm text-white">
                    <MapPin className="h-4 w-4 shrink-0" />

                    <span>
                      {place.location_name}
                      {place.district ? `, ${place.district}` : ""}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-[#22211f] transition group-hover:text-[#9a5f2d]">
                        {place.title}
                      </h3>

                      <p className="mt-1 text-sm text-[#8a867e]">
                        {place.state}
                      </p>
                    </div>

                    <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-[#aaa59c] transition duration-300 group-hover:translate-x-1 group-hover:text-[#9a5f2d]" />
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#6f6b64]">
                    {place.short_description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-[#eeeae3] pt-4">
                    <div className="flex items-center gap-2 text-xs text-[#77736c]">
                      <Wallet className="h-4 w-4" />

                      {place.estimated_cost_inr === null ||
                      place.estimated_cost_inr === 0
                        ? "Free / varies"
                        : `From ₹${place.estimated_cost_inr.toLocaleString(
                            "en-IN"
                          )}`}
                    </div>

                    <span className="text-xs font-semibold text-[#9a5f2d]">
                      Explore
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-8 lg:px-12">
        <div className="overflow-hidden rounded-[2rem] bg-[#1d1d1b] px-7 py-12 text-white sm:px-12">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                <Sparkles className="h-4 w-4" />
                Build your journey
              </div>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Found somewhere interesting?
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                Start planning a trip and let your preferences shape the
                itinerary around places like these.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1d1d1b] transition hover:bg-[#f0ece5]"
            >
              Plan my trip
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}