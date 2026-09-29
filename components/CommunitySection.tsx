"use client";

import React from "react";
import Image from "next/image";
import { UsersIcon, StarIcon, MapPinIcon, CameraIcon, SparklesIcon } from "./icons";

interface CommunitySectionProps {
  onOpenShareModal?: () => void;
}

export default function CommunitySection({ onOpenShareModal }: CommunitySectionProps) {
  return (
    <section id="community" className="py-16 sm:py-24 bg-stone-50/70 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide uppercase mb-3">
            <UsersIcon size={14} className="text-amber-700" />
            Decentralized Scout Network
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-stone-900 tracking-tight">
            Know a place worth sharing?
          </h2>
          <p className="mt-4 text-stone-600 text-base sm:text-lg">
            India&apos;s greatest travel stories live in ancestral memories, forgotten mountain passes, and village kitchens. Help conscious explorers discover them sustainably.
          </p>
        </div>

        {/* Featured Traveller Contribution Card */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-stone-200/90 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            {/* Travel Photo */}
            <div className="relative md:col-span-6 min-h-[300px] md:min-h-[420px] bg-stone-900">
              <Image
                src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80"
                alt="Secret mountain valley view submitted by community scout"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-xs font-semibold text-stone-900 shadow-xs">
                <SparklesIcon size={13} className="text-orange-600" />
                <span>Featured Community Submission</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
                  Demo Scout Highlight
                </span>
                <h4 className="text-xl font-serif font-bold text-white">
                  Gurez Valley Shepherd Watchpoint
                </h4>
              </div>
            </div>

            {/* Contribution Details */}
            <div className="p-6 sm:p-10 md:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-semibold text-orange-700">
                    <MapPinIcon size={14} className="shrink-0" />
                    <span>Bandipora District, Kashmir</span>
                  </div>

                  {/* Demo Community Rating */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
                    <StarIcon size={12} className="text-amber-500 fill-amber-500" />
                    <span>4.95</span>
                    <span className="text-[10px] text-amber-700 font-normal">(Demo Score)</span>
                  </div>
                </div>

                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  Gurez Valley Shepherd Ridge Meadow
                </h3>

                <p className="text-stone-600 text-sm leading-relaxed">
                  &ldquo;Discovered this quiet log cabin overlook through a local shepherd while crossing toward Dawar. Unmapped on commercial search engines, free of noisy tour vans, and framed by wild mountain irises.&rdquo;
                </p>

                {/* Contributor badge */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500 block text-[11px]">Submitted by Demo Scout:</span>
                    <span className="font-bold text-stone-900">Priya S. (Himalayan Trekker)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 text-[10px] font-semibold">
                    Vetted by 18 Scouts
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenShareModal}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-stone-900 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  <CameraIcon size={16} />
                  <span>Share a hidden place</span>
                </button>

                <a
                  href="#explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 rounded-2xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Browse Map
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Community Transparency Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-stone-500 max-w-xl mx-auto">
            <strong>Community Disclaimer:</strong> Submissions in this preview are simulated examples. Community-vetted contributions will open for verified travellers upon our SIH 2026 public rollout.
          </p>
        </div>
      </div>
    </section>
  );
}
