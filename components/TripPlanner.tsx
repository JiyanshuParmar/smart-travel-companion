"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
  MapPinIcon,
  CalendarIcon,
  SparklesIcon,
  CheckIcon,
  LeafIcon,
  InfoIcon,
} from "./icons";

interface TripPlannerProps {
  onPlanGenerated?: (details: {
    destination: string;
    budget: number;
    budgetStyle: string;
    durationDays: number;
    pacing: string;
    interests: string[];
  }) => void;
}

interface PlanApiResponse {
  success?: boolean;
  tripId?: string;
  itinerary?: unknown;
  error?: string;
  message?: string;
}

type PacingOption =
  | "Slow & Authentic"
  | "Balanced Discovery"
  | "Action & Trails";

export default function TripPlanner({
  onPlanGenerated,
}: TripPlannerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  /* ============================================================
     URL PLACE PREFILL
     ============================================================ */

  const placeFromUrl = searchParams.get("place")?.trim();

  /* ============================================================
     FORM STATE
     ============================================================ */

  const [destination, setDestination] = useState(
    placeFromUrl || "Goa",
  );

  const [budget, setBudget] = useState(25000);

  const [budgetStyle, setBudgetStyle] = useState<
    "Backpacker" | "Balanced" | "Boutique"
  >("Balanced");

  const [durationDays, setDurationDays] = useState(3);

  const [pacing, setPacing] =
    useState<PacingOption>("Slow & Authentic");

  const [selectedVibes, setSelectedVibes] = useState<string[]>([
    "Local Food",
    "Hidden Gems",
    "Homestay Living",
  ]);

  /* ============================================================
     UI STATE
     ============================================================ */

  const [isGenerating, setIsGenerating] = useState(false);

  const [planSuccessNotice, setPlanSuccessNotice] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  /* ============================================================
     OPTIONS
     ============================================================ */

  const vibeOptions = [
    "Local Food",
    "Hidden Gems",
    "Nature & Trails",
    "Heritage Architecture",
    "Handicraft Looms",
    "Homestay Living",
  ];

  const popularDestinations = [
    "Goa",
    "Kerala",
    "Rajasthan",
    "Himachal Pradesh",
    "Meghalaya",
    "Varanasi",
    "Ladakh",
  ];

  const pacingOptions: PacingOption[] = [
    "Slow & Authentic",
    "Balanced Discovery",
    "Action & Trails",
  ];

  /* ============================================================
     DATABASE PACING MAPPING
     
     The UI uses friendly labels, while Supabase's trips table
     expects:
       Relaxed
       Balanced
       Fast-Paced
       Slow & Authentic
     ============================================================ */

  const databasePacingMap: Record<PacingOption, string> = {
    "Slow & Authentic": "Slow & Authentic",
    "Balanced Discovery": "Balanced",
    "Action & Trails": "Fast-Paced",
  };

  /* ============================================================
     TOGGLE INTEREST
     ============================================================ */

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((previous) =>
      previous.includes(vibe)
        ? previous.filter((item) => item !== vibe)
        : [...previous, vibe],
    );
  };

  /* ============================================================
     DURATION LABEL
     ============================================================ */

  const getDurationLabel = (days: number) => {
    if (days <= 3) {
      return "Short Escape";
    }

    if (days <= 6) {
      return "Deep Exploration";
    }

    return "Immersive Grand Tour";
  };

  /* ============================================================
     CLEAN API ERROR
     ============================================================ */

  const getApiErrorMessage = (
    result: PlanApiResponse,
    status: number,
  ) => {
    if (
      typeof result.error === "string" &&
      result.error.trim()
    ) {
      return result.error;
    }

    if (
      typeof result.message === "string" &&
      result.message.trim()
    ) {
      return result.message;
    }

    if (status === 401) {
      return "Please log in before creating an AI itinerary.";
    }

    if (status === 429) {
      return "The AI service is temporarily busy. Please try again in a moment.";
    }

    if (status >= 500) {
      return "The AI service had a temporary problem. Please try again.";
    }

    return "We couldn't generate your AI itinerary. Please try again.";
  };

  /* ============================================================
     GENERATE AI ITINERARY
     ============================================================ */

  const handleGenerate = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    setPlanSuccessNotice(false);
    setErrorMessage("");

    let createdTripId: string | null = null;

    try {
      /* --------------------------------------------------------
         1. CHECK LOGIN
         -------------------------------------------------------- */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(
          "Authentication check error:",
          authError,
        );
      }

      if (!user) {
        router.push("/login?redirect=/");
        return;
      }

      /* --------------------------------------------------------
         2. VALIDATE DESTINATION
         -------------------------------------------------------- */

      const cleanedDestination = destination.trim();

      if (!cleanedDestination) {
        throw new Error(
          "Please enter a destination.",
        );
      }

      if (cleanedDestination.length < 2) {
        throw new Error(
          "Please enter a valid destination.",
        );
      }

      /* --------------------------------------------------------
         3. VALIDATE BUDGET
         -------------------------------------------------------- */

      if (
        !Number.isFinite(budget) ||
        budget < 5000
      ) {
        throw new Error(
          "Please choose a valid trip budget.",
        );
      }

      /* --------------------------------------------------------
         4. VALIDATE DURATION
         -------------------------------------------------------- */

      if (
        !Number.isFinite(durationDays) ||
        durationDays < 1 ||
        durationDays > 60
      ) {
        throw new Error(
          "Please choose a valid trip duration.",
        );
      }

      /* --------------------------------------------------------
         5. VALIDATE INTERESTS
         -------------------------------------------------------- */

      if (selectedVibes.length === 0) {
        throw new Error(
          "Please select at least one travel interest.",
        );
      }

      /* --------------------------------------------------------
         6. CONVERT UI PACING TO DATABASE PACING
         -------------------------------------------------------- */

      const databasePacing =
        databasePacingMap[pacing];

      /* --------------------------------------------------------
         7. CREATE TRIP
         -------------------------------------------------------- */

      const {
        data: trip,
        error: tripError,
      } = await supabase
        .from("trips")
        .insert({
          user_id: user.id,

          destination: cleanedDestination,

          budget_inr: budget,

          budget_style: budgetStyle,

          duration_days: durationDays,

          pacing_style: databasePacing,

          interests: selectedVibes,

          status: "PLANNING",
        })
        .select("id")
        .single();

      if (tripError) {
        console.error(
          "Trip creation error:",
          tripError,
        );

        throw new Error(
          "We couldn't save your trip. Please try again.",
        );
      }

      if (!trip?.id) {
        throw new Error(
          "The trip was created, but its ID could not be found.",
        );
      }

      createdTripId = trip.id;

      /* --------------------------------------------------------
         8. NOTIFY PARENT
         -------------------------------------------------------- */

      if (onPlanGenerated) {
        onPlanGenerated({
          destination: cleanedDestination,

          budget,

          budgetStyle,

          durationDays,

          pacing,

          interests: selectedVibes,
        });
      }

      /* --------------------------------------------------------
         9. CALL AI BACKEND
         -------------------------------------------------------- */

      const response = await fetch(
        "/api/plan-trip",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify({
            tripId: trip.id,
          }),
        },
      );

      /* --------------------------------------------------------
         10. PARSE API RESPONSE SAFELY
         -------------------------------------------------------- */

      let result:
        | PlanApiResponse
        | null = null;

      const responseText =
        await response.text();

      if (responseText.trim()) {
        try {
          result = JSON.parse(
            responseText,
          ) as PlanApiResponse;
        } catch (parseError) {
          console.error(
            "Could not parse AI API response:",
            parseError,
          );

          console.error(
            "Raw API response:",
            responseText,
          );

          throw new Error(
            "The AI service returned an unexpected response. Please try again.",
          );
        }
      }

      if (!result) {
        throw new Error(
          "The AI service returned an empty response. Please try again.",
        );
      }

      /* --------------------------------------------------------
         11. HANDLE API ERRORS
         -------------------------------------------------------- */

      if (!response.ok) {
        console.error(
          "AI itinerary API failed:",
          {
            status: response.status,
            statusText:
              response.statusText,
            result,
          },
        );

        throw new Error(
          getApiErrorMessage(
            result,
            response.status,
          ),
        );
      }

      /* --------------------------------------------------------
         12. VERIFY SUCCESS
         -------------------------------------------------------- */

      if (
        result.success !== true ||
        !result.itinerary
      ) {
        console.error(
          "AI API returned unexpected success response:",
          result,
        );

        throw new Error(
          "The AI itinerary was not generated correctly. Please try again.",
        );
      }

      /* --------------------------------------------------------
         13. SUCCESS
         -------------------------------------------------------- */

      setPlanSuccessNotice(true);
      setErrorMessage("");

      /* --------------------------------------------------------
         14. REDIRECT
         -------------------------------------------------------- */

      router.push(
        `/trip/${trip.id}`,
      );
    } catch (error) {
      console.error(
        "Trip planner error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your AI itinerary.";

      setErrorMessage(message);

      /*
       * If AI generation failed after creating the trip,
       * leave the trip in PLANNING status.
       *
       * The user can safely try again.
       */

      if (createdTripId) {
        console.log(
          "AI generation failed for trip:",
          createdTripId,
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /* ============================================================
     UI
     ============================================================ */

  return (
    <section
      id="planner"
      className="py-12 sm:py-16 scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-white border border-stone-200/90 shadow-xl shadow-stone-200/50 overflow-hidden">

          {/* ==================================================
              HEADER
              ================================================== */}

          <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-800 text-white px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-300 text-xs font-semibold tracking-wide uppercase mb-3">
                  <SparklesIcon
                    size={14}
                    className="text-orange-400"
                  />

                  India-First AI Travel Engine
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-serif">
                  Where do you want to go?
                </h2>

                <p className="text-stone-300 text-sm sm:text-base mt-1.5 font-light">
                  Your destination, budget and
                  interests become a personalized
                  AI itinerary
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-xs text-stone-200 self-start md:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />

                <span>
                  AI-powered itinerary generation
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================
              FORM
              ================================================== */}

          <form
            onSubmit={handleGenerate}
            className="p-6 sm:p-10 space-y-8"
          >

            {/* =================================================
                MAIN INPUTS
                ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* DESTINATION */}

              <div className="space-y-2">
                <label
                  htmlFor="destination-input"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700"
                >
                  Destination
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-600">
                    <MapPinIcon size={18} />
                  </div>

                  <input
                    id="destination-input"
                    type="text"
                    value={destination}
                    onChange={(e) =>
                      setDestination(
                        e.target.value,
                      )
                    }
                    placeholder="Enter state or region (e.g., Goa)"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 font-medium placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-stone-500">
                    Quick picks:
                  </span>

                  {popularDestinations
                    .slice(0, 4)
                    .map((dest) => (
                      <button
                        key={dest}
                        type="button"
                        onClick={() =>
                          setDestination(
                            dest,
                          )
                        }
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                          destination
                            .toLowerCase() ===
                          dest.toLowerCase()
                            ? "bg-orange-100 text-orange-800"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {dest}
                      </button>
                    ))}
                </div>
              </div>

              {/* BUDGET */}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="budget-range"
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700"
                  >
                    Total Budget
                  </label>

                  <span className="text-sm font-bold text-stone-900 font-serif">
                    ₹
                    {budget.toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>

                <div className="relative pt-1">
                  <input
                    id="budget-range"
                    type="range"
                    min="5000"
                    max="100000"
                    step="1000"
                    value={budget}
                    onChange={(e) =>
                      setBudget(
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />

                  <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                    <span>
                      ₹5,000
                    </span>

                    <span className="font-semibold text-orange-700">
                      ₹
                      {budget.toLocaleString(
                        "en-IN",
                      )}
                    </span>

                    <span>
                      ₹1,00,000+
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {(
                    [
                      "Backpacker",
                      "Balanced",
                      "Boutique",
                    ] as const
                  ).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() =>
                        setBudgetStyle(
                          style,
                        )
                      }
                      className={`py-1.5 text-xs font-medium rounded-xl border text-center transition-all ${
                        budgetStyle ===
                        style
                          ? "bg-stone-900 border-stone-900 text-white shadow-xs"
                          : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* DURATION */}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Trip Duration
                  </label>

                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200/60 text-xs font-semibold text-orange-800">
                    {getDurationLabel(
                      durationDays,
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                      <CalendarIcon size={18} />
                    </div>

                    <select
                      aria-label="Trip duration in days"
                      value={
                        durationDays
                      }
                      onChange={(e) =>
                        setDurationDays(
                          Number(
                            e.target.value,
                          ),
                        )
                      }
                      className="w-full pl-10 pr-8 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value={2}>
                        2 Days (Weekend Trip)
                      </option>

                      <option value={3}>
                        3 Days (Short Escape)
                      </option>

                      <option value={5}>
                        5 Days (Discovery Route)
                      </option>

                      <option value={7}>
                        7 Days (Full Circuit)
                      </option>

                      <option value={10}>
                        10 Days (Grand Circuit)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="pt-1">
                  <label
                    htmlFor="pacing-select"
                    className="text-[11px] font-semibold text-stone-600 block mb-1"
                  >
                    Pacing Style
                  </label>

                  <select
                    id="pacing-select"
                    value={pacing}
                    onChange={(e) =>
                      setPacing(
                        e.target
                          .value as PacingOption,
                      )
                    }
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-orange-500 font-medium"
                  >
                    {pacingOptions.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* =================================================
                INTERESTS
                ================================================= */}

            <div className="pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Select Travel Vibes &amp; Interests
                </span>

                <span className="text-xs text-stone-500">
                  {selectedVibes.length}{" "}
                  selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {vibeOptions.map((vibe) => {
                  const isSelected =
                    selectedVibes.includes(
                      vibe,
                    );

                  return (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() =>
                        toggleVibe(vibe)
                      }
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "bg-orange-600 text-white shadow-xs scale-102"
                          : "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-transparent"
                      }`}
                    >
                      {isSelected ? (
                        <CheckIcon
                          size={14}
                          className="text-white"
                        />
                      ) : (
                        <LeafIcon
                          size={14}
                          className="text-stone-400"
                        />
                      )}

                      <span>
                        {vibe}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                ACTION AREA
                ================================================= */}

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100">

              <div className="flex items-start gap-2 text-xs text-stone-500 max-w-lg">
                <InfoIcon
                  size={16}
                  className="text-amber-600 shrink-0 mt-0.5"
                />

                <p>
                  <strong>
                    AI planning:
                  </strong>{" "}
                  Your preferences are combined
                  with approved local places and
                  businesses to create a personalized
                  itinerary. Cost figures are
                  estimates and may change.
                </p>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-medium rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
              >
                <SparklesIcon
                  size={18}
                  className={
                    isGenerating
                      ? "animate-spin"
                      : ""
                  }
                />

                <span>
                  {isGenerating
                    ? "Generating AI Itinerary..."
                    : "Generate My AI Plan"}
                </span>
              </button>
            </div>

            {/* =================================================
                ERROR
                ================================================= */}

            {errorMessage && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">
                      We couldn&apos;t generate the
                      itinerary yet.
                    </p>

                    <p className="mt-1">
                      {errorMessage}
                    </p>

                    <p className="mt-2 text-xs text-red-700">
                      Your trip information is
                      still safe. You can try again.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setErrorMessage("")
                    }
                    className="text-xs font-semibold text-red-700 hover:text-red-900"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                SUCCESS
                ================================================= */}

            {planSuccessNotice && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckIcon
                    size={18}
                    className="text-emerald-600"
                  />

                  <span>
                    AI itinerary generated for{" "}
                    <strong>
                      {destination}
                    </strong>{" "}
                    (₹
                    {budget.toLocaleString(
                      "en-IN",
                    )}
                    ,{" "}
                    {durationDays}{" "}
                    Days).
                  </span>
                </div>

                <span className="text-xs font-bold text-emerald-800 ml-4 shrink-0">
                  Ready
                </span>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}