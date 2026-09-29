import React from "react";
import Image from "next/image";
import { Business } from "../data/businesses";
import { ShieldCheckIcon, MapPinIcon } from "./icons";

interface BusinessCardProps {
  business: Business;
  onSelect?: (business: Business) => void;
}

export default function BusinessCard({ business, onSelect }: BusinessCardProps) {
  return (
    <div
      onClick={() => onSelect?.(business)}
      className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
    >
      {/* Business Image & Badge */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
        <Image
          src={business.image}
          alt={business.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-stone-900 shadow-xs">
            {business.category}
          </span>
        </div>

        {/* Verified Badge */}
        {business.verified && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
              <ShieldCheckIcon size={13} className="text-emerald-400" />
              <span>Verified Host</span>
            </span>
          </div>
        )}

        {/* Price & Location Over Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1 text-stone-200 font-medium">
            <MapPinIcon size={13} className="text-orange-400 shrink-0" />
            <span className="truncate">{business.location}</span>
          </div>
          <span className="font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded-md">
            {business.pricing}
          </span>
        </div>
      </div>

      {/* Body details */}
      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
        <div>
          <div className="text-[11px] font-semibold text-orange-700 uppercase tracking-wide mb-1">
            {business.hostRole} • {business.hostName}
          </div>
          <h3 className="text-lg font-bold font-serif text-stone-900 group-hover:text-orange-600 transition-colors">
            {business.name}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {business.shortDescription}
          </p>
        </div>

        {/* Highlights tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {business.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Action Link */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">Direct host connection</span>
          <span className="font-bold text-orange-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
            Connect →
          </span>
        </div>
      </div>
    </div>
  );
}
