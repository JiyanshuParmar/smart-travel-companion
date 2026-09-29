"use client";

import React, { useState } from "react";
import Image from "next/image";
import { POPULAR_DESTINATIONS, Destination } from "../data/destinations";
import DestinationCard from "./DestinationCard";
import { SparklesIcon, CompassIcon, XIcon, ArrowRightIcon } from "./icons";

export default function DestinationGrid() {
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  return (
    <section id="destinations" className="py-16 sm:py-20 bg-stone-50/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/70 text-orange-800 text-xs font-semibold tracking-wide uppercase mb-3">
              <CompassIcon size={14} className="text-orange-600" />
              Regional Exploration
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-stone-900 tracking-tight">
              Popular destinations, <br className="hidden sm:inline" />
              <span className="italic font-normal text-orange-600">rediscovered through local eyes.</span>
            </h2>
            <p className="mt-4 text-stone-600 text-base sm:text-lg">
              Explore India&apos;s celebrated states with route itineraries that sidestep tourist traps in favor of generational heritage, quiet waterways, and mountain hamlets.
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>5 Flagship Curations</span>
            <span className="text-stone-300">•</span>
            <span>Real-time INR Estimates</span>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {POPULAR_DESTINATIONS.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              onSelect={(d) => setSelectedDest(d)}
            />
          ))}
        </div>
      </div>

      {/* Destination Quick Preview Modal (Interactive Demo) */}
      {selectedDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white overflow-hidden shadow-2xl border border-stone-200">
            <div className="relative h-64 w-full bg-stone-900">
              <Image
                src={selectedDest.image}
                alt={selectedDest.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedDest(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                aria-label="Close dialog"
              >
                <XIcon size={18} />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-xs uppercase tracking-wider text-orange-300 font-bold">
                  {selectedDest.state} • {selectedDest.duration}
                </span>
                <h3 className="text-3xl font-serif font-bold">{selectedDest.name}</h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <p className="text-sm font-serif italic text-orange-700 text-base">
                &ldquo;{selectedDest.tagline}&rdquo;
              </p>
              <p className="text-stone-600 text-sm leading-relaxed">
                {selectedDest.description}
              </p>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-start gap-3">
                <SparklesIcon size={18} className="text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Generational Secret Spot
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {selectedDest.hiddenGemHighlight}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <div>
                  <span className="text-xs text-stone-500 block">Estimated Budget</span>
                  <span className="text-base font-bold text-stone-900">
                    {selectedDest.exampleBudget}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDest(null)}
                    className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
                  >
                    Close
                  </button>
                  <a
                    href="#planner"
                    onClick={() => setSelectedDest(null)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs"
                  >
                    <span>Plan {selectedDest.name} Trip</span>
                    <ArrowRightIcon size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
