import React from "react";
import Image from "next/image";
import { Place } from "../data/places";
import { MapPinIcon, StarIcon, SparklesIcon, ClockIcon } from "./icons";

interface PlaceCardProps {
  place: Place;
  onExplore?: (place: Place) => void;
}

export default function PlaceCard({ place, onExplore }: PlaceCardProps) {
  return (
    <div
      onClick={() => onExplore?.(place)}
      className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
    >
      {/* Visual Top Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
        <Image
          src={place.image}
          alt={place.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-stone-800 shadow-xs backdrop-blur-xs">
            {place.category}
          </span>
        </div>

        {/* Demo Score Pill */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-950/80 text-amber-300 border border-white/10 backdrop-blur-xs">
            <StarIcon size={12} className="text-amber-400 fill-amber-400" />
            <span>{place.demoRating.toFixed(1)}</span>
            <span className="text-[10px] text-stone-300 font-normal">(Demo)</span>
          </span>
        </div>

        {/* Best time tag */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-[11px] text-white/90">
          <ClockIcon size={13} className="text-orange-300 shrink-0" />
          <span className="truncate">{place.bestTime}</span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-orange-700 font-semibold mb-1.5">
            <MapPinIcon size={14} className="shrink-0" />
            <span className="truncate">{place.location}</span>
          </div>

          <h3 className="text-lg font-bold font-serif text-stone-900 leading-snug group-hover:text-orange-600 transition-colors">
            {place.title}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {place.shortDescription}
          </p>
        </div>

        {/* Local Highlight */}
        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-start gap-2 text-xs text-stone-700">
          <SparklesIcon size={14} className="text-orange-600 shrink-0 mt-0.5" />
          <span className="line-clamp-2">
            <strong>Insider Secret:</strong> {place.highlight}
          </span>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          <span className="text-stone-600 font-medium">
            Demo Rating • {place.reviewCount} scouts
          </span>
          <span className="font-semibold text-orange-600 group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
}
