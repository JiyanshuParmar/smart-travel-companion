"use client";

import React, { useState } from "react";
import { DEMO_ITINERARY } from "../data/itinerary";
import {
  SparklesIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  LeafIcon,
  IndianRupeeIcon,
  ShareIcon,
} from "./icons";

export default function ItineraryPreview() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const activeDay = DEMO_ITINERARY.days[selectedDayIndex];

  const handleShare = () => {
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <section id="itinerary-preview" className="py-16 sm:py-24 bg-stone-50/70 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-900 text-xs font-bold tracking-wide uppercase mb-3">
            <SparklesIcon size={14} className="text-orange-600" />
            AI Itinerary Engine Feature Preview
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-stone-900 tracking-tight">
            Your trip, planned around you.
          </h2>
          <p className="mt-4 text-stone-600 text-base sm:text-lg">
            A real look at how our India-first routing engine generates synchronized day-by-day itineraries with transparent local INR estimates and zero tourist-trap stops.
          </p>
        </div>

        {/* Master Itinerary Canvas Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden">
          {/* Card Top Banner: Overview & AI Recommendation */}
          <div className="p-6 sm:p-10 border-b border-stone-200/80 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600/90 text-white text-xs font-semibold">
                    <LeafIcon size={13} className="text-orange-200" />
                    {DEMO_ITINERARY.authenticityScore}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-stone-300 text-xs font-medium">
                    <MapPinIcon size={13} className="text-stone-300" />
                    {DEMO_ITINERARY.destination}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-stone-300 text-xs font-medium">
                    <CalendarIcon size={13} className="text-stone-300" />
                    {DEMO_ITINERARY.duration}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                  {DEMO_ITINERARY.tripTitle}
                </h3>
              </div>

              {/* Total Estimated Budget */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md self-start lg:self-auto shrink-0 min-w-[220px]">
                <span className="text-xs uppercase tracking-wider text-stone-300 block font-semibold">
                  Estimated Total Budget
                </span>
                <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-300 block mt-1">
                  {DEMO_ITINERARY.estimatedCostRange}
                </span>
                <span className="text-[11px] text-stone-300 block mt-0.5">
                  Calibrated for 2 travellers
                </span>
              </div>
            </div>

            {/* AI Recommendation Box */}
            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
              <SparklesIcon size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  AI Recommendation Logic
                </span>
                <p className="text-xs sm:text-sm text-stone-200 mt-1 leading-relaxed">
                  {DEMO_ITINERARY.aiRecommendation}
                </p>
              </div>
            </div>

            {/* Cost Calibration Pill Grid */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">Heritage Stay:</span>
                <span className="font-semibold text-stone-200">{DEMO_ITINERARY.costBreakdown.stay}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Local Culinary:</span>
                <span className="font-semibold text-stone-200">{DEMO_ITINERARY.costBreakdown.food}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Certified Guides:</span>
                <span className="font-semibold text-stone-200">{DEMO_ITINERARY.costBreakdown.activities}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Local Transit &amp; Ferries:</span>
                <span className="font-semibold text-stone-200">{DEMO_ITINERARY.costBreakdown.localTransit}</span>
              </div>
            </div>
          </div>

          {/* Interactive Day Switcher Tabs */}
          <div className="border-b border-stone-200 bg-stone-50 px-6 sm:px-10 py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2">
              {DEMO_ITINERARY.days.map((d, idx) => (
                <button
                  key={d.dayNumber}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedDayIndex === idx
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-white text-stone-700 hover:bg-stone-200/70 border border-stone-200"
                  }`}
                >
                  Day {d.dayNumber}: {d.dayTitle === "Day 1" ? "Arrival & Food" : d.dayTitle === "Day 2" ? "Hidden Beach" : "Culture & Return"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-orange-600 px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
            >
              <ShareIcon size={14} />
              <span>{copiedNotice ? "Link Copied!" : "Share Itinerary"}</span>
            </button>
          </div>

          {/* Day Activities Timeline */}
          <div className="p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-stone-100 gap-2">
              <div>
                <span className="text-xs uppercase tracking-wider text-orange-600 font-bold">
                  Day {activeDay.dayNumber} Theme
                </span>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  {activeDay.theme}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Day Target Budget:</span>
                <span className="text-base font-bold font-serif text-stone-900">
                  {activeDay.dailyEstimate}
                </span>
              </div>
            </div>

            {/* Activities Vertical Progression */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-stone-200">
              {activeDay.activities.map((activity, actIdx) => (
                <div key={actIdx} className="relative pl-10 group">
                  {/* Timeline bullet */}
                  <div className="absolute left-1.5 top-1.5 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-orange-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <span className="w-2 h-2 rounded-full bg-orange-600" />
                  </div>

                  <div className="p-5 sm:p-6 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-orange-200 hover:bg-orange-50/20 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 bg-white px-2.5 py-1 rounded-md border border-stone-200">
                          <ClockIcon size={12} className="text-orange-600" />
                          {activity.time}
                        </span>
                        <span className="text-xs font-semibold text-stone-500">
                          {activity.categoryTag}
                        </span>
                        {activity.hiddenGem && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                            <SparklesIcon size={11} className="text-amber-600" />
                            Hidden Gem
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-stone-700">
                        {activity.costEstimate}
                      </div>
                    </div>

                    <h5 className="text-base font-bold text-stone-900">
                      {activity.title}
                    </h5>
                    <p className="mt-1 text-sm text-stone-600 leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Itinerary CTA Bar */}
            <div className="mt-10 p-5 rounded-2xl bg-orange-50/60 border border-orange-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                  <IndianRupeeIcon size={20} />
                </div>
                <div>
                  <h6 className="text-sm font-bold text-stone-900">
                    Want an itinerary calibrated for your exact travel dates?
                  </h6>
                  <p className="text-xs text-stone-600">
                    Use the AI Trip Planner above to customize pacing, budget, and travel party.
                  </p>
                </div>
              </div>

              <a
                href="#planner"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-orange-600 rounded-xl transition-colors shrink-0"
              >
                Customize in Planner
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
