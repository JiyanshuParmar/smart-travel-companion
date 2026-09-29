import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  Lightbulb,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Place = {
  id: string;
  title: string;
  slug: string;
  category: string;
  state: string;
  district: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  short_description: string;
  detailed_backstory: string | null;
  insider_tip: string | null;
  best_time_to_visit: string | null;
  primary_image_url: string;
  gallery_urls: string[];
  estimated_cost_inr: number | null;
  vetted_scout_count: number;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlaceDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: place, error } = await supabase
    .from("places")
    .select(
      `
      id,
      title,
      slug,
      category,
      state,
      district,
      location_name,
      latitude,
      longitude,
      short_description,
      detailed_backstory,
      insider_tip,
      best_time_to_visit,
      primary_image_url,
      gallery_urls,
      estimated_cost_inr,
      vetted_scout_count
    `
    )
    .eq("id", id)
    .eq("moderation_status", "APPROVED")
    .single();

  if (error || !place) {
    notFound();
  }

  const typedPlace = place as Place;

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#1d1d1b]">
      {/* Hero image */}
      <section className="relative h-[55vh] min-h-[460px] overflow-hidden bg-[#151515]">
        <Image
          src={typedPlace.primary_image_url}
          alt={typedPlace.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

        {/* Back button */}
        <div className="absolute left-0 right-0 top-0">
          <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-12">
            <Link
              href="/places"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-black/40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to places
            </Link>
          </div>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-6 pb-10 sm:px-8 lg:px-12">
            <div className="max-w-4xl">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#37342f]">
                  {typedPlace.category}
                </span>

                {typedPlace.vetted_scout_count > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {typedPlace.vetted_scout_count} local scouts
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {typedPlace.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/80">
                <MapPin className="h-4 w-4" />

                <span>
                  {typedPlace.location_name}
                  {typedPlace.district
                    ? `, ${typedPlace.district}`
                    : ""}
                  , {typedPlace.state}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Left content */}
          <div>
            {/* Intro */}
            <div className="rounded-3xl border border-[#e2ded6] bg-white p-7 sm:p-9">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9a6a3a]">
                <Sparkles className="h-4 w-4" />
                Local discovery
              </div>

              <p className="mt-5 text-lg leading-8 text-[#4e4a44]">
                {typedPlace.short_description}
              </p>
            </div>

            {/* Story */}
            {typedPlace.detailed_backstory && (
              <section className="mt-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ebe6dd]">
                    <Compass className="h-5 w-5 text-[#8f5c32]" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6a3a]">
                      The story
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold">
                      Know before you go
                    </h2>
                  </div>
                </div>

                <p className="mt-5 text-base leading-8 text-[#66615a]">
                  {typedPlace.detailed_backstory}
                </p>
              </section>
            )}

            {/* Insider tip */}
            {typedPlace.insider_tip && (
              <section className="mt-10 rounded-3xl border border-[#eadbc8] bg-[#fffaf2] p-7">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f3e3ca]">
                    <Lightbulb className="h-5 w-5 text-[#9a6a3a]" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6a3a]">
                      Insider tip
                    </p>

                    <p className="mt-3 text-sm leading-7 text-[#5d574f]">
                      {typedPlace.insider_tip}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Visit information */}
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">
                Plan your visit
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e2ded6] bg-white p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1eee8]">
                    <CalendarDays className="h-5 w-5 text-[#746e65]" />
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#99938a]">
                    Best time
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#35322e]">
                    {typedPlace.best_time_to_visit ??
                      "Check local conditions before visiting"}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e2ded6] bg-white p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1eee8]">
                    <Wallet className="h-5 w-5 text-[#746e65]" />
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#99938a]">
                    Estimated cost
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#35322e]">
                    {typedPlace.estimated_cost_inr === null ||
                    typedPlace.estimated_cost_inr === 0
                      ? "Free / varies"
                      : `₹${typedPlace.estimated_cost_inr.toLocaleString(
                          "en-IN"
                        )}`}
                  </p>
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="mt-10 rounded-3xl border border-[#e2ded6] bg-white p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ebe6dd]">
                  <MapPin className="h-5 w-5 text-[#8f5c32]" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6a3a]">
                    Location
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {typedPlace.location_name}
                  </h2>
                </div>
              </div>

              <div className="mt-6 flex min-h-40 items-center justify-center rounded-2xl bg-[#efebe4]">
                <div className="text-center">
                  <MapPin className="mx-auto h-8 w-8 text-[#9b9489]" />

                  <p className="mt-3 text-sm font-medium text-[#625d55]">
                    Map integration coming next
                  </p>

                  <p className="mt-1 text-xs text-[#918b82]">
                    Coordinates will be connected when we add maps.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <aside>
            <div className="sticky top-6 rounded-3xl border border-[#ded9d1] bg-white p-6 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6a3a]">
                  Add it to your journey
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Make this part of your trip
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#777168]">
                  Save this place as you build your personalized itinerary.
                </p>
              </div>

              <div className="mt-7 space-y-3">
                {/* Plan trip around this place */}
                <Link
                  href={`/?place=${encodeURIComponent(
                    typedPlace.title
                  )}`}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#333330]"
                >
                  Plan a trip around this
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {/* Explore more places */}
                <Link
                  href="/places"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#d9d4cc] bg-white px-5 py-3.5 text-sm font-semibold text-[#383530] transition hover:bg-[#f6f3ee]"
                >
                  Explore more places
                </Link>
              </div>

              <div className="mt-7 border-t border-[#eeeae3] pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#66815f]" />

                  <p className="text-xs leading-5 text-[#777168]">
                    Only approved places are shown in public discovery.
                  </p>
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#9a6a3a]" />

                  <p className="text-xs leading-5 text-[#777168]">
                    AI recommendations will use verified platform data
                    instead of inventing destinations.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] bg-[#1d1d1b] px-7 py-12 text-center text-white sm:px-12">
          <Sparkles className="mx-auto h-6 w-6 text-orange-300" />

          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your next story starts here.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
            Combine local discoveries, your interests and your budget into a
            journey built around what you actually want to experience.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1d1d1b] transition hover:bg-[#f0ece5]"
          >
            Start planning
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}