import React from "react";
import { SparklesIcon, ArrowRightIcon, CompassIcon, ShieldCheckIcon, IndianRupeeIcon } from "./icons";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
      {/* Decorative Warm Ambient Background Elements */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[480px] bg-gradient-to-b from-orange-100/50 via-amber-50/30 to-transparent blur-3xl -z-10 pointer-events-none rounded-full"
        aria-hidden="true"
      />
      <div
        className="absolute -top-10 right-10 w-72 h-72 bg-amber-200/20 rounded-full blur-2xl -z-10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Powered by India-First AI Engine Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-stone-200 shadow-xs mb-8 transition-all hover:border-orange-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
          </span>
          <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-stone-800 flex items-center gap-1.5">
            <SparklesIcon size={15} className="text-orange-600" />
            <span>Powered by India-First AI Engine</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-600">REAL-TIME INR (₹) ESTIMATES</span>
          </span>
        </div>

        {/* Main Editorial Heading */}
        <h1 className="max-w-4xl mx-auto text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900 leading-[1.12]">
          Travel smarter.
          <span className="block font-serif font-normal italic text-orange-600 mt-2 sm:mt-3">
            Discover deeper.
          </span>
        </h1>

        {/* Supporting Editorial Text */}
        <p className="max-w-2xl mx-auto mt-6 text-lg sm:text-xl text-stone-600 leading-relaxed font-normal">
          Plan hyper-personalized journeys, unveil generational hidden places,
          and experience India beyond the standard tourist trails with authentic
          local intelligence.
        </p>

        {/* Action CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#planner"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-stone-900 hover:bg-orange-600 rounded-2xl transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            <span>Start AI Planner</span>
            <ArrowRightIcon size={18} />
          </a>
          <a
            href="#destinations"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-200/90 rounded-2xl transition-all duration-200 shadow-xs hover:border-stone-300"
          >
            <CompassIcon size={18} className="text-orange-600" />
            <span>Explore Curated Regions</span>
          </a>
        </div>

        {/* Highlight Trust Micro-Pills */}
        <div className="mt-14 pt-8 border-t border-stone-200/60 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-stone-600 text-xs sm:text-sm">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheckIcon size={16} className="text-emerald-600 shrink-0" />
            <span className="font-medium text-stone-700">SIH 2026 Innovation</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <IndianRupeeIcon size={16} className="text-orange-600 shrink-0" />
            <span className="font-medium text-stone-700">Dynamic ₹ Calibration</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="font-medium text-stone-700">Zero Commercial Traps</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-medium text-stone-700">Verified Local Hosts</span>
          </div>
        </div>
      </div>
    </section>
  );
}
