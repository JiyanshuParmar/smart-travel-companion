import React from "react";
import { SparklesIcon, ArrowRightIcon, CompassIcon } from "./icons";

export default function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-stone-900 text-white">
      {/* Background Accent Gradients */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-orange-600/30 via-amber-600/20 to-transparent blur-3xl pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-orange-300 text-xs font-semibold tracking-wide uppercase mb-6 backdrop-blur-xs">
          <SparklesIcon size={14} className="text-orange-400" />
          Start Your Subcontinental Journey
        </div>

        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-serif tracking-tight leading-[1.15]">
          Your next story <br className="hidden sm:inline" />
          <span className="italic font-normal text-orange-400">starts here.</span>
        </h2>

        <p className="mt-6 text-lg sm:text-xl text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
          Tell us where you&apos;re going. We&apos;ll help you discover what others miss.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#planner"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-orange-600/30 hover:-translate-y-0.5"
          >
            <span>Plan my trip</span>
            <ArrowRightIcon size={18} />
          </a>

          <a
            href="#explore"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-stone-200 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl transition-all duration-200 backdrop-blur-xs"
          >
            <CompassIcon size={18} className="text-orange-300" />
            <span>Explore places</span>
          </a>
        </div>

        {/* Small reassurance tag */}
        <p className="mt-8 text-xs text-stone-400">
          SIH 2026 Innovation Initiative • Free, authentic &amp; community verified
        </p>
      </div>
    </section>
  );
}
