import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type Activity = {
  time: string;
  title: string;
  description: string;
  category: string;
  estimatedCostInr: number;
  location: string;
};

type ItineraryDay = {
  day: number;
  title: string;
  activities: Activity[];
};

type Recommendation = {
  type: "PLACE" | "BUSINESS";
  name: string;
  description: string;
  reason: string;
  estimatedCostInr: number;
};

type Itinerary = {
  title: string;
  summary: string;
  estimated_min_inr: number;
  estimated_max_inr: number;
  days: ItineraryDay[];
  recommendations: Recommendation[];
  travel_notes: string[];
  ai_model?: string;
};

function formatInr(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    Food: "🍛",
    Nature: "🌿",
    Culture: "🏛️",
    Adventure: "🧗",
    Relaxation: "🧘",
    Sightseeing: "📍",
    Travel: "🚗",
  };

  return icons[category] ?? "✨";
}

function getRecommendationIcon(type: "PLACE" | "BUSINESS") {
  return type === "PLACE" ? "📍" : "🏡";
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  // ---------------------------------------------------------
  // 1. Authentication
  // ---------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/trip/${id}`);
  }

  // ---------------------------------------------------------
  // 2. Fetch trip
  // ---------------------------------------------------------

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select(
      `
        id,
        destination,
        budget_inr,
        budget_style,
        duration_days,
        pacing_style,
        interests,
        status,
        created_at
      `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (tripError || !trip) {
    notFound();
  }

  // ---------------------------------------------------------
  // 3. Fetch AI itinerary
  // ---------------------------------------------------------

  const { data: itineraryData, error: itineraryError } =
    await supabase
      .from("itineraries")
      .select(
        `
          title,
          summary,
          estimated_min_inr,
          estimated_max_inr,
          days,
          recommendations,
          travel_notes,
          ai_model
        `,
      )
      .eq("trip_id", trip.id)
      .maybeSingle();

  if (itineraryError) {
    console.error(
      "Failed to load itinerary:",
      itineraryError,
    );
  }

  const itinerary = itineraryData as Itinerary | null;

  const days = Array.isArray(itinerary?.days)
    ? itinerary.days
    : [];

  const recommendations = Array.isArray(
    itinerary?.recommendations,
  )
    ? itinerary.recommendations
    : [];

  const travelNotes = Array.isArray(
    itinerary?.travel_notes,
  )
    ? itinerary.travel_notes
    : [];

  const totalActivities = days.reduce(
    (total, day) => total + day.activities.length,
    0,
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            aria-label="Smart Travel Companion home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-700 via-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/10 transition-transform duration-200 group-hover:scale-105">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
              </svg>
            </span>

            <div className="hidden flex-col sm:flex">
              <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
                Smart Travel{" "}
                <span className="text-orange-600">
                  Companion
                </span>
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                India-First AI
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/places"
              className="hidden rounded-xl px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-orange-600 sm:block"
            >
              Discover places
            </Link>

            <Link
              href="/profile"
              className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition-all hover:border-orange-300 hover:text-orange-600"
            >
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Back */}

        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-orange-600"
        >
          <span aria-hidden="true">←</span>
          Back to home
        </Link>

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] bg-stone-950 px-6 py-8 text-white shadow-2xl shadow-stone-300/30 sm:px-10 sm:py-10 lg:px-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative">
            {/* Status badges */}

            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                AI itinerary ready
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-stone-300">
                {trip.duration_days} days
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-stone-300">
                {trip.pacing_style}
              </span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              {/* Hero text */}

              <div>
                <p className="mb-2 text-sm font-medium text-orange-300">
                  Your personalized journey
                </p>

                <h1 className="max-w-4xl font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  {itinerary?.title ??
                    `${trip.destination} Adventure`}
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-7 text-stone-300 sm:text-lg">
                  {itinerary?.summary ??
                    `A personalized ${trip.duration_days}-day travel plan for ${trip.destination}.`}
                </p>
              </div>

              {/* Budget */}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm lg:min-w-64">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Estimated trip cost
                </p>

                <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  {itinerary
                    ? `${formatInr(
                        itinerary.estimated_min_inr,
                      )} – ${formatInr(
                        itinerary.estimated_max_inr,
                      )}`
                    : formatInr(trip.budget_inr)}
                </p>

                <p className="mt-1 text-xs text-stone-400">
                  Your budget:{" "}
                  {formatInr(trip.budget_inr)}
                </p>
              </div>
            </div>

            {/* Metadata */}

            <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2.5 text-sm text-stone-300">
                <span>📍</span>
                <span>{trip.destination}</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2.5 text-sm text-stone-300">
                <span>💰</span>
                <span>{trip.budget_style}</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2.5 text-sm text-stone-300">
                <span>✨</span>

                <span>
                  {trip.interests?.length
                    ? trip.interests.join(" • ")
                    : "Personalized interests"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            QUICK STATS
        =================================================== */}

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Days
            </p>

            <p className="mt-2 text-2xl font-bold text-stone-900">
              {trip.duration_days}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Activities
            </p>

            <p className="mt-2 text-2xl font-bold text-stone-900">
              {totalActivities}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Budget
            </p>

            <p className="mt-2 text-2xl font-bold text-stone-900">
              {formatInr(trip.budget_inr)}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              AI status
            </p>

            <p className="mt-2 flex items-center gap-2 text-lg font-bold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Ready
            </p>
          </div>
        </section>

        {/* ===================================================
            NO ITINERARY
        =================================================== */}

        {!itinerary && (
          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
              ✨
            </div>

            <h2 className="mt-4 font-serif text-2xl font-bold text-stone-900">
              Your itinerary is being prepared
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-600">
              We have your trip details, but an AI itinerary
              has not been saved yet. Generate your personalized
              plan to continue.
            </p>

            <p className="mt-4 text-xs text-stone-500">
              Trip status: {trip.status}
            </p>
          </section>
        )}

        {/* ===================================================
            DAY-BY-DAY ITINERARY
        =================================================== */}

        {days.length > 0 && (
          <section className="mt-12">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                  Your AI plan
                </p>

                <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                  Your journey, day by day
                </h2>

                <p className="mt-2 text-sm text-stone-500">
                  A practical route built around your interests,
                  pace and budget.
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700">
                ✨ Personalized by AI
              </div>
            </div>

            <div className="space-y-6">
              {days.map((day) => (
                <article
                  key={day.day}
                  className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-stone-200/40"
                >
                  {/* Day header */}

                  <div className="border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white px-5 py-5 sm:px-7">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-sm font-bold text-white shadow-sm">
                        {String(day.day).padStart(
                          2,
                          "0",
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                          Day {day.day}
                        </p>

                        <h3 className="mt-0.5 font-serif text-xl font-bold text-stone-900 sm:text-2xl">
                          {day.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Activities */}

                  <div className="divide-y divide-stone-100">
                    {day.activities.map(
                      (activity, activityIndex) => (
                        <div
                          key={`${day.day}-${activityIndex}-${activity.title}`}
                          className="group px-5 py-6 sm:px-7"
                        >
                          <div className="flex gap-4">
                            {/* Time */}

                            <div className="hidden w-16 shrink-0 text-right sm:block">
                              <p className="text-xs font-bold text-stone-500">
                                {activity.time}
                              </p>
                            </div>

                            <div className="relative flex min-w-0 flex-1 gap-4">
                              {/* Icon */}

                              <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg ring-4 ring-white">
                                {getCategoryIcon(
                                  activity.category,
                                )}
                              </div>

                              {/* Activity content */}

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="text-base font-bold text-stone-900 sm:text-lg">
                                        {activity.title}
                                      </h4>

                                      <span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                                        {activity.category}
                                      </span>
                                    </div>

                                    <p className="mt-1 text-xs font-semibold text-orange-600 sm:hidden">
                                      {activity.time}
                                    </p>
                                  </div>

                                  <div className="shrink-0 rounded-xl bg-stone-50 px-3 py-2 text-sm font-bold text-stone-800">
                                    {formatInr(
                                      activity.estimatedCostInr,
                                    )}
                                  </div>
                                </div>

                                <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
                                  {activity.description}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600">
                                    <span>📍</span>
                                    {activity.location}
                                  </span>

                                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600">
                                    <span>💰</span>
                                    Estimated cost
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ===================================================
            AI RECOMMENDATIONS
        =================================================== */}

        {recommendations.length > 0 && (
          <section className="mt-14">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Discover more
              </p>

              <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900">
                AI recommendations
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Places and local experiences selected for this
                journey.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.map(
                (recommendation, index) => (
                  <div
                    key={`${recommendation.type}-${index}-${recommendation.name}`}
                    className="group rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-xl">
                        {getRecommendationIcon(
                          recommendation.type,
                        )}
                      </div>

                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        {recommendation.type}
                      </span>
                    </div>

                    <h3 className="mt-5 font-serif text-xl font-bold text-stone-900">
                      {recommendation.name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {recommendation.description}
                    </p>

                    <div className="mt-4 rounded-2xl bg-orange-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-orange-700">
                        Why it fits your trip
                      </p>

                      <p className="mt-1.5 text-sm leading-5 text-orange-950">
                        {recommendation.reason}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                      <span className="text-xs font-medium text-stone-400">
                        Estimated cost
                      </span>

                      <span className="text-sm font-bold text-stone-900">
                        {formatInr(
                          recommendation.estimatedCostInr,
                        )}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        {/* ===================================================
            TRAVEL NOTES
        =================================================== */}

        {travelNotes.length > 0 && (
          <section className="mt-14">
            <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50/50 to-white p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                  💡
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                    Local wisdom
                  </p>

                  <h2 className="mt-1 font-serif text-2xl font-bold text-stone-900">
                    Travel notes
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {travelNotes.map((note, index) => (
                  <div
                    key={`${index}-${note}`}
                    className="flex items-start gap-3 rounded-2xl border border-white bg-white/80 p-4"
                  >
                    <span className="mt-0.5 text-orange-500">
                      ✦
                    </span>

                    <p className="text-sm leading-6 text-stone-700">
                      {note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===================================================
            BOTTOM CTA
        =================================================== */}

        <section className="mt-14 overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Continue exploring
              </p>

              <h2 className="mt-1 font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
                Ready to discover the local side?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                Explore hidden places, local experiences and
                community discoveries around India.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/places"
                className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md"
              >
                Explore places
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition-all hover:border-orange-300 hover:text-orange-600"
              >
                Plan another trip
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="mt-8 border-t border-stone-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-center text-xs text-stone-400 sm:px-6 lg:px-8">
          <p>
            Smart Travel Companion · SIH 2026 · India-First
            AI Travel Platform
          </p>

          {itinerary?.ai_model && (
            <p className="text-[10px] text-stone-300">
              AI itinerary generated with{" "}
              {itinerary.ai_model}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}