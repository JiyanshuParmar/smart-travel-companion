"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PLACES_DATA, PLACES_CATEGORIES, Place } from "../data/places";
import PlaceCard from "./PlaceCard";
import { SparklesIcon, XIcon, MapPinIcon, StarIcon, ClockIcon } from "./icons";

export default function DiscoverySection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activePlace, setActivePlace] = useState<Place | null>(null);

  const filteredPlaces =
    selectedCategory === "All"
      ? PLACES_DATA
      : PLACES_DATA.filter((p) => p.category === selectedCategory);

  return (
    <section id="explore" className="py-16 sm:py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold tracking-wide uppercase mb-3">
            <SparklesIcon size={14} className="text-orange-600" />
            Untrodden Subcontinent
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-stone-900 tracking-tight">
            Discover the places tourists miss
          </h2>
          <p className="mt-4 text-stone-600 text-base sm:text-lg">
            Generational secrets, estuary waterways, ancestral kitchens, and indigenous craft traditions sourced directly from resident scouts.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-10 gap-2 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              selectedCategory === "All"
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            All Discoveries
          </button>
          {PLACES_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onExplore={(p) => setActivePlace(p)}
            />
          ))}
        </div>

        {/* Demo Disclaimer Banner */}
        <div className="mt-12 text-center">
          <p className="text-xs text-stone-500 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
            Ratings and reviews are illustrative demo data. Real grassroots submissions open in community beta.
          </p>
        </div>
      </div>

      {/* Place Detail Modal */}
      {activePlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl bg-white overflow-hidden shadow-2xl border border-stone-200">
            <div className="relative h-60 w-full bg-stone-900">
              <Image
                src={activePlace.image}
                alt={activePlace.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button
                type="button"
                onClick={() => setActivePlace(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                aria-label="Close dialog"
              >
                <XIcon size={18} />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-orange-600 text-xs font-semibold mb-1">
                  {activePlace.category}
                </span>
                <h3 className="text-2xl font-serif font-bold">{activePlace.title}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-stone-700 font-medium">
                  <MapPinIcon size={14} className="text-orange-600" />
                  <span>{activePlace.location}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <StarIcon size={12} className="text-amber-500 fill-amber-500" />
                  <span className="font-bold">{activePlace.demoRating}</span>
                  <span className="text-[10px] text-amber-800">(Demo Score)</span>
                </div>
              </div>

              <p className="text-stone-700 text-sm leading-relaxed">
                {activePlace.shortDescription}
              </p>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <SparklesIcon size={16} className="text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Locals&apos; Tip: </span>
                  {activePlace.highlight}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <ClockIcon size={14} className="text-stone-400" />
                <span>Optimal visitation window: {activePlace.bestTime}</span>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActivePlace(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
                >
                  Close
                </button>
                <a
                  href="#planner"
                  onClick={() => setActivePlace(null)}
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl"
                >
                  Add to Itinerary
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
