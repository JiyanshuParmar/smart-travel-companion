import React from "react";
import Image from "next/image";
import { Destination } from "../data/destinations";
import { ArrowRightIcon, MapPinIcon, SparklesIcon } from "./icons";

interface DestinationCardProps {
  destination: Destination;
  onSelect?: (destination: Destination) => void;
}

export default function DestinationCard({
  destination,
  onSelect,
}: DestinationCardProps) {
  return (
    <div
      onClick={() => onSelect?.(destination)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
    >
      {/* Image Container with Editorial Aspect Ratio */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
        <Image
          src={destination.image}
          alt={`Scenic view of ${destination.name}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* State Badge */}
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-xs font-semibold text-stone-800 shadow-xs">
          <MapPinIcon size={12} className="text-orange-600" />
          <span>{destination.state}</span>
        </div>

        {/* Budget Pill */}
        <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-xs font-medium text-amber-300 border border-white/10">
          <span>{destination.exampleBudget}</span>
        </div>

        {/* Title over gradient */}
        <div className="absolute bottom-4 left-4 right-4">
          <span className="text-[11px] uppercase tracking-wider text-orange-200 font-semibold">
            {destination.duration}
          </span>
          <h3 className="text-2xl font-bold font-serif text-white tracking-tight">
            {destination.name}
          </h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
        <div>
          <p className="text-xs font-semibold text-orange-700 italic mb-2">
            &ldquo;{destination.tagline}&rdquo;
          </p>
          <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {destination.description}
          </p>
        </div>

        {/* Hidden Gem highlight */}
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/50 flex items-start gap-2 text-xs text-amber-900">
          <SparklesIcon size={14} className="text-orange-600 shrink-0 mt-0.5" />
          <p className="line-clamp-2">
            <span className="font-semibold text-stone-800">Local Highlight: </span>
            {destination.hiddenGemHighlight}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {destination.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2.5 py-1 rounded-md bg-stone-100 text-stone-600 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Est. Budget: <span className="font-bold text-stone-800">{destination.exampleBudget}</span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 group-hover:text-orange-700 group-hover:translate-x-0.5 transition-all"
          >
            <span>Explore</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
