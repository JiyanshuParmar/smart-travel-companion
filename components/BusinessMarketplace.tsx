"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BUSINESSES_DATA, BUSINESS_CATEGORIES, Business } from "../data/businesses";
import BusinessCard from "./BusinessCard";
import { StoreIcon, PlusCircleIcon, ShieldCheckIcon, XIcon, MapPinIcon } from "./icons";

interface BusinessMarketplaceProps {
  onOpenListModal?: () => void;
}

export default function BusinessMarketplace({ onOpenListModal }: BusinessMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);

  const filtered =
    selectedCategory === "All"
      ? BUSINESSES_DATA
      : BUSINESSES_DATA.filter((b) => b.category === selectedCategory);

  return (
    <section id="businesses" className="py-16 sm:py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold tracking-wide uppercase mb-3">
              <StoreIcon size={14} className="text-emerald-600" />
              Direct-to-Host Marketplace
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-stone-900 tracking-tight">
              Local businesses. Real experiences.
            </h2>
            <p className="mt-4 text-stone-600 text-base sm:text-lg">
              Support indigenous weavers, verified vernacular guides, multigenerational homestay families, and regional transport collectives across India.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onOpenListModal}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <PlusCircleIcon size={18} />
              <span>List your business</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-start overflow-x-auto pb-3 mb-10 gap-2 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              selectedCategory === "All"
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            All Hosts ({BUSINESSES_DATA.length})
          </button>
          {BUSINESS_CATEGORIES.map((cat) => (
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

        {/* Grid of Business Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onSelect={(b) => setActiveBusiness(b)}
            />
          ))}
        </div>

        {/* Marketplace Value Proposition Banner */}
        <div className="mt-14 p-8 rounded-3xl bg-stone-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-orange-400">
              <ShieldCheckIcon size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold font-serif">
                Fair Trade &amp; Direct Indian Host Settlement
              </h4>
              <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Unlike global aggregator platforms taking 20–30% cuts, Smart Travel Companion connects you directly to registered grassroots hosts with verified safety records and government tourism badges.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenListModal}
            className="shrink-0 px-6 py-3 rounded-xl bg-white text-stone-900 hover:bg-orange-50 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Join Merchant Network
          </button>
        </div>
      </div>

      {/* Business Details Preview Modal */}
      {activeBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl bg-white overflow-hidden shadow-2xl border border-stone-200">
            <div className="relative h-60 w-full bg-stone-900">
              <Image
                src={activeBusiness.image}
                alt={activeBusiness.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button
                type="button"
                onClick={() => setActiveBusiness(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                aria-label="Close dialog"
              >
                <XIcon size={18} />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-orange-600 text-xs font-semibold mb-1">
                  {activeBusiness.category}
                </span>
                <h3 className="text-2xl font-serif font-bold">{activeBusiness.name}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-stone-700 font-medium">
                  <MapPinIcon size={14} className="text-orange-600" />
                  <span>{activeBusiness.location}</span>
                </div>
                <div className="font-bold text-stone-900">
                  {activeBusiness.pricing}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
                <span className="font-semibold text-stone-900">Host / Lead:</span>{" "}
                {activeBusiness.hostName} ({activeBusiness.hostRole})
              </div>

              <p className="text-stone-700 text-sm leading-relaxed">
                {activeBusiness.shortDescription}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeBusiness.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBusiness(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
                >
                  Close
                </button>
                <a
                  href="#planner"
                  onClick={() => setActiveBusiness(null)}
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl"
                >
                  Inquire Experience (Demo)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
