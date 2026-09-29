import React from "react";
import BenefitCard from "./BenefitCard";
import { SparklesIcon, IndianRupeeIcon, CompassIcon, ShieldCheckIcon } from "./icons";

export default function TrustSection() {
  const benefits = [
    {
      icon: <SparklesIcon size={26} />,
      title: "Personalized Planning",
      description:
        "Subcontinental route algorithms calibrated to your exact pacing, budget, and interests—from handloom circuits to quiet river estuaries.",
      statBadge: "AI-calibrated itineraries",
    },
    {
      icon: <IndianRupeeIcon size={26} />,
      title: "Transparent Costs",
      description:
        "Real-time INR (₹) breakdown covering authentic stays, honest guide honorariums, and direct transit tariffs without inflated commercial markups.",
      statBadge: "Dynamic ₹ Estimates",
    },
    {
      icon: <CompassIcon size={26} />,
      title: "Local-First Discovery",
      description:
        "Unfiltered access to generational family homestays, master craftsmen looms, and sacred trails preserved by resident guardians.",
      statBadge: "100% Grassroots Partners",
    },
    {
      icon: <ShieldCheckIcon size={26} />,
      title: "Secure Booking",
      description:
        "Government-verified host identity badges, transparent safety standards, and direct zero-commission host settlements.",
      statBadge: "Verified Safety Protocols",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 text-stone-800 text-xs font-bold tracking-wide uppercase mb-3">
            <ShieldCheckIcon size={14} className="text-emerald-600" />
            Why Smart Travel Companion
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-stone-900 tracking-tight">
            Built for conscious explorers, rooted in India.
          </h2>
          <p className="mt-4 text-stone-600 text-base sm:text-lg">
            A travel ecosystem designed for Smart India Hackathon 2026 to celebrate India&apos;s cultural richness while empowering local host economies.
          </p>
        </div>

        {/* 4 Benefit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => (
            <BenefitCard
              key={idx}
              icon={b.icon}
              title={b.title}
              description={b.description}
              statBadge={b.statBadge}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
