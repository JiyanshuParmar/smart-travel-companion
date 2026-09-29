import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

/* ============================================================
   ITINERARY VALIDATION
   ============================================================ */

const activitySchema = z.object({
  time: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum([
    "Food",
    "Nature",
    "Culture",
    "Adventure",
    "Relaxation",
    "Sightseeing",
    "Travel",
  ]),
  estimatedCostInr: z.coerce.number().nonnegative(),
  location: z.string().min(1),
});

const daySchema = z.object({
  day: z.coerce.number().int().positive(),
  title: z.string().min(1),
  activities: z.array(activitySchema).min(1).max(4),
});

const recommendationSchema = z.object({
  type: z.enum(["PLACE", "BUSINESS"]),
  name: z.string().min(1),
  description: z.string().min(1),
  reason: z.string().min(1),
  estimatedCostInr: z.coerce.number().nonnegative(),
});

const itinerarySchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  estimatedMinInr: z.coerce.number().nonnegative(),
  estimatedMaxInr: z.coerce.number().nonnegative(),
  days: z.array(daySchema).min(1),
  recommendations: z.array(recommendationSchema).max(6),
  travelNotes: z.array(z.string()).max(8),
});

const requestSchema = z.object({
  tripId: z.string().uuid(),
});

/* ============================================================
   TYPES
   ============================================================ */

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
      refusal?: unknown;
    };
  }>;

  error?: {
    message?: string;
    code?: string | number;
  };
};

/* ============================================================
   EXTRACT AI CONTENT
   ============================================================ */

function getMessageContent(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (
          typeof part === "object" &&
          part !== null &&
          "text" in part
        ) {
          const text = (part as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }

        return "";
      })
      .filter(Boolean)
      .join("")
      .trim();
  }

  if (
    typeof content === "object" &&
    content !== null
  ) {
    try {
      return JSON.stringify(content);
    } catch {
      return "";
    }
  }

  return "";
}

/* ============================================================
   EXTRACT JSON FROM MODEL RESPONSE
   ============================================================ */

function extractJson(text: string): unknown | null {
  let cleaned = text.trim();

  if (!cleaned) {
    return null;
  }

  // Remove markdown fences.
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // First try direct JSON parsing.
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue with extraction.
  }

  /*
   * Some models write:
   *
   * Here is your itinerary:
   * { ... }
   */

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    const candidate = cleaned.slice(
      firstBrace,
      lastBrace + 1,
    );

    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  return null;
}

/* ============================================================
   OPENROUTER REQUEST
   ============================================================ */

async function callOpenRouter(
  apiKey: string,
  prompt: string,
  useJsonMode: boolean,
): Promise<OpenRouterResponse> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 75000);

  try {
    const body: Record<string, unknown> = {
      model: "openrouter/free",

      messages: [
        {
          role: "system",
          content:
            "You are a travel itinerary JSON generator. Return ONLY valid JSON. Never use Markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,

      /*
       * More room for multi-day itinerary JSON.
       */
      max_tokens: 10000,
    };

    /*
     * JSON mode is attempted first.
     * If a free model/provider does not support it,
     * the caller retries without it.
     */
    if (useJsonMode) {
      body.response_format = {
        type: "json_object",
      };
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Smart Travel Companion",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );

    let data: OpenRouterResponse;

    try {
      data =
        (await response.json()) as OpenRouterResponse;
    } catch {
      throw new Error(
        `OpenRouter returned an invalid response. HTTP ${response.status}.`,
      );
    }

    if (!response.ok) {
      const providerMessage =
        data?.error?.message;

      throw new Error(
        providerMessage ||
          `OpenRouter returned HTTP ${response.status}.`,
      );
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

/* ============================================================
   COMPACT DATABASE CONTEXT
   ============================================================ */

function compactPlace(place: {
  id: string;
  title: string;
  category: string;
  state: string;
  district: string | null;
  location_name: string;
  short_description: string;
  estimated_cost_inr: number | null;
}) {
  return {
    id: place.id,
    name: place.title,
    category: place.category,
    state: place.state,
    district: place.district,
    location: place.location_name,
    description: place.short_description,
    cost: place.estimated_cost_inr,
  };
}

function compactBusiness(business: {
  id: string;
  business_name: string;
  business_type: string;
  short_description: string | null;
  state: string;
  district: string | null;
  city: string;
  rating: number;
}) {
  return {
    id: business.id,
    name: business.business_name,
    type: business.business_type,
    description: business.short_description,
    state: business.state,
    district: business.district,
    city: business.city,
    rating: business.rating,
  };
}

function compactListing(listing: {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  listing_type: string;
  price_inr: number;
  pricing_unit: string;
  duration_minutes: number | null;
}) {
  return {
    id: listing.id,
    businessId: listing.business_id,
    title: listing.title,
    description: listing.description,
    type: listing.listing_type,
    price: listing.price_inr,
    pricingUnit: listing.pricing_unit,
    durationMinutes: listing.duration_minutes,
  };
}

/* ============================================================
   MAIN API
   ============================================================ */

export async function POST(request: Request) {
  console.log(
    "===== SMART TRAVEL AI START =====",
  );

  try {
    /* ---------------------------------------------------------
       1. API KEY
       --------------------------------------------------------- */

    const apiKey =
      process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI service is not configured correctly.",
        },
        { status: 500 },
      );
    }

    /* ---------------------------------------------------------
       2. REQUEST
       --------------------------------------------------------- */

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const requestResult =
      requestSchema.safeParse(body);

    if (!requestResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid trip request.",
        },
        { status: 400 },
      );
    }

    const { tripId } =
      requestResult.data;

    /* ---------------------------------------------------------
       3. SUPABASE + AUTH
       --------------------------------------------------------- */

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You must be logged in to generate an itinerary.",
        },
        { status: 401 },
      );
    }

    /* ---------------------------------------------------------
       4. FETCH TRIP
       --------------------------------------------------------- */

    const {
      data: trip,
      error: tripError,
    } = await supabase
      .from("trips")
      .select(
        `
        id,
        user_id,
        destination,
        budget_inr,
        budget_style,
        duration_days,
        pacing_style,
        interests,
        status
      `,
      )
      .eq("id", tripId)
      .eq("user_id", user.id)
      .single();

    if (tripError || !trip) {
      console.error(
        "Trip fetch error:",
        tripError,
      );

      return NextResponse.json(
        {
          success: false,
          error: "Trip not found.",
        },
        { status: 404 },
      );
    }

    /* ---------------------------------------------------------
       5. FETCH APPROVED PLACES
       --------------------------------------------------------- */

    const { data: places } =
      await supabase
        .from("places")
        .select(
          `
          id,
          title,
          category,
          state,
          district,
          location_name,
          short_description,
          estimated_cost_inr
        `,
        )
        .eq(
          "moderation_status",
          "APPROVED",
        )
        .limit(40);

    /* ---------------------------------------------------------
       6. FETCH APPROVED BUSINESSES
       --------------------------------------------------------- */

    const { data: businesses } =
      await supabase
        .from("businesses")
        .select(
          `
          id,
          business_name,
          business_type,
          short_description,
          state,
          district,
          city,
          rating
        `,
        )
        .eq("status", "APPROVED")
        .limit(40);

    /* ---------------------------------------------------------
       7. FETCH APPROVED LISTINGS
       --------------------------------------------------------- */

    const { data: listings } =
      await supabase
        .from("listings")
        .select(
          `
          id,
          business_id,
          title,
          description,
          listing_type,
          price_inr,
          pricing_unit,
          duration_minutes
        `,
        )
        .eq("status", "APPROVED")
        .limit(60);

    /* ---------------------------------------------------------
       8. DESTINATION FILTER
       --------------------------------------------------------- */

    const destination =
      trip.destination
        .trim()
        .toLowerCase();

    const matchingPlaces =
      (places ?? []).filter(
        (place) => {
          const text = [
            place.title,
            place.category,
            place.state,
            place.district,
            place.location_name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return (
            text.includes(destination) ||
            destination.includes(text)
          );
        },
      );

    const matchingBusinesses =
      (businesses ?? []).filter(
        (business) => {
          const text = [
            business.business_name,
            business.business_type,
            business.state,
            business.district,
            business.city,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return (
            text.includes(destination) ||
            destination.includes(text)
          );
        },
      );

    const matchingBusinessIds =
      new Set(
        matchingBusinesses.map(
          (business) => business.id,
        ),
      );

    const matchingListings =
      (listings ?? []).filter(
        (listing) =>
          matchingBusinessIds.has(
            listing.business_id,
          ),
      );

    /*
     * IMPORTANT:
     *
     * Do NOT send the entire database to the AI.
     *
     * Keep the context small so the free model has
     * enough room to produce the actual itinerary.
     */

    const placesForAI = (
      matchingPlaces.length > 0
        ? matchingPlaces
        : places ?? []
    )
      .slice(0, 10)
      .map(compactPlace);

    const businessesForAI = (
      matchingBusinesses.length > 0
        ? matchingBusinesses
        : businesses ?? []
    )
      .slice(0, 10)
      .map(compactBusiness);

    const listingsForAI = (
      matchingListings.length > 0
        ? matchingListings
        : listings ?? []
    )
      .slice(0, 15)
      .map(compactListing);

    console.log(
      "AI context:",
      placesForAI.length,
      "places,",
      businessesForAI.length,
      "businesses,",
      listingsForAI.length,
      "listings",
    );

    /* ---------------------------------------------------------
       9. PROMPT
       --------------------------------------------------------- */

    const prompt = `
Create a practical local-first travel itinerary.

TRIP

Destination: ${trip.destination}
Budget: ₹${trip.budget_inr}
Budget style: ${trip.budget_style}
Duration: ${trip.duration_days} days
Pacing: ${trip.pacing_style}
Interests: ${
      (trip.interests ?? []).join(", ") ||
      "General travel"
    }

STRICT REQUIREMENTS

- Return ONLY one valid JSON object.
- Create EXACTLY ${trip.duration_days} days.
- Day numbers must be 1 through ${trip.duration_days}.
- Every day must contain 1 to 3 activities.
- Keep descriptions short: maximum 2 sentences.
- Use realistic Indian Rupee costs.
- estimatedMinInr <= estimatedMaxInr.
- Keep total estimated cost within or reasonably close to the traveller budget.
- Match the selected interests.
- Prioritize local food, culture, nature and authentic experiences.
- Do not invent named places or businesses.
- Named places MUST come from APPROVED PLACES.
- Named businesses MUST come from APPROVED BUSINESSES.
- Recommendations may contain at most 6 items.
- Travel notes may contain at most 6 items.
- Do not use Markdown.
- Do not use code fences.
- Do not write anything before or after the JSON.
- Keep the JSON compact.

JSON SHAPE

{
  "title": "Short trip title",
  "summary": "Short summary",
  "estimatedMinInr": 10000,
  "estimatedMaxInr": 15000,
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Activity",
          "description": "Short description.",
          "category": "Food",
          "estimatedCostInr": 500,
          "location": "Location"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "type": "PLACE",
      "name": "Database place name",
      "description": "Short description.",
      "reason": "Why it matches.",
      "estimatedCostInr": 500
    }
  ],
  "travelNotes": [
    "Short travel note"
  ]
}

APPROVED PLACES

${JSON.stringify(
  placesForAI,
)}

APPROVED BUSINESSES

${JSON.stringify(
  businessesForAI,
)}

APPROVED LISTINGS

${JSON.stringify(
  listingsForAI,
)}
`;

    /* ---------------------------------------------------------
       10. AI ATTEMPTS
       --------------------------------------------------------- */

    let parsedItinerary:
      | unknown
      | null = null;

    let lastAIError =
      "The AI provider did not return a valid itinerary.";

    /*
     * Three attempts:
     *
     * 1. JSON mode.
     * 2. Normal mode.
     * 3. Normal mode + ultra compact instructions.
     *
     * This handles free-model/provider differences.
     */

    for (
      let attempt = 1;
      attempt <= 3;
      attempt++
    ) {
      try {
        console.log(
          `AI attempt ${attempt}/3`,
        );

        let attemptPrompt = prompt;

        if (attempt === 3) {
          attemptPrompt = `
Return ONLY valid JSON for this ${trip.duration_days}-day trip.

Destination: ${trip.destination}
Budget: ₹${trip.budget_inr}
Pacing: ${trip.pacing_style}
Interests: ${
            (trip.interests ?? []).join(
              ", ",
            ) || "General"
          }

You MUST return exactly ${trip.duration_days} day objects.

Each day must contain 1-2 short activities.

Use only named places/businesses from this database:

PLACES:
${JSON.stringify(
  placesForAI.slice(0, 6),
)}

BUSINESSES:
${JSON.stringify(
  businessesForAI.slice(0, 6),
)}

Return this exact structure:

{
"title":"Trip",
"summary":"Summary",
"estimatedMinInr":10000,
"estimatedMaxInr":15000,
"days":[
  {
    "day":1,
    "title":"Day 1",
    "activities":[
      {
        "time":"09:00 AM",
        "title":"Activity",
        "description":"Short description",
        "category":"Sightseeing",
        "estimatedCostInr":500,
        "location":"Location"
      }
    ]
  }
],
"recommendations":[],
"travelNotes":[]
}

NO MARKDOWN.
NO EXPLANATION.
ONLY JSON.
`;
        }

        const data =
          await callOpenRouter(
            apiKey,
            attemptPrompt,
            attempt === 1,
          );

        const content =
          data?.choices?.[0]?.message
            ?.content;

        if (!content) {
          lastAIError =
            "The AI provider returned an empty response.";
          continue;
        }

        parsedItinerary =
          extractJson(
            getMessageContent(content),
          );

        if (!parsedItinerary) {
          lastAIError =
            "The AI provider returned incomplete JSON.";

          console.error(
            `AI attempt ${attempt}: invalid JSON`,
          );

          continue;
        }

        const validation =
          itinerarySchema.safeParse(
            parsedItinerary,
          );

        if (!validation.success) {
          lastAIError =
            "The AI generated an incomplete itinerary.";

          console.error(
            `AI attempt ${attempt}: validation failed`,
            validation.error.flatten(),
          );

          parsedItinerary = null;

          continue;
        }

        /*
         * Extra business validation.
         */

        const itinerary =
          validation.data;

        if (
          itinerary.days.length !==
          trip.duration_days
        ) {
          lastAIError =
            `The AI generated ${itinerary.days.length} days instead of ${trip.duration_days}.`;

          console.error(
            "Incorrect day count:",
            {
              expected:
                trip.duration_days,
              received:
                itinerary.days.length,
            },
          );

          parsedItinerary = null;

          continue;
        }

        const expectedDays =
          Array.from(
            {
              length:
                trip.duration_days,
            },
            (_, index) =>
              index + 1,
          );

        const actualDays =
          itinerary.days.map(
            (day) => day.day,
          );

        const correctDayNumbers =
          expectedDays.every(
            (day, index) =>
              actualDays[index] ===
              day,
          );

        if (!correctDayNumbers) {
          lastAIError =
            "The AI generated invalid day numbering.";

          parsedItinerary = null;

          continue;
        }

        if (
          itinerary.estimatedMinInr >
          itinerary.estimatedMaxInr
        ) {
          lastAIError =
            "The AI generated an invalid budget range.";

          parsedItinerary = null;

          continue;
        }

        /*
         * SUCCESS.
         */

        parsedItinerary =
          itinerary;

        console.log(
          `AI succeeded on attempt ${attempt}.`,
        );

        break;
      } catch (error) {
        console.error(
          `AI attempt ${attempt} failed:`,
          error,
        );

        lastAIError =
          error instanceof Error
            ? error.message
            : "The AI provider failed.";
      }
    }

    /* ---------------------------------------------------------
       11. AI FAILURE
       --------------------------------------------------------- */

    if (!parsedItinerary) {
      return NextResponse.json(
        {
          success: false,
          error:
            lastAIError ||
            "The AI could not generate the itinerary. Please try again.",
        },
        { status: 502 },
      );
    }

    const itinerary =
      parsedItinerary as z.infer<
        typeof itinerarySchema
      >;

    /* ---------------------------------------------------------
       12. SAVE ITINERARY
       --------------------------------------------------------- */

    const {
      error: itineraryError,
    } = await supabase
      .from("itineraries")
      .upsert(
        {
          trip_id: trip.id,
          title: itinerary.title,
          summary: itinerary.summary,
          estimated_min_inr:
            itinerary.estimatedMinInr,
          estimated_max_inr:
            itinerary.estimatedMaxInr,
          days: itinerary.days,
          recommendations:
            itinerary.recommendations,
          travel_notes:
            itinerary.travelNotes,
          ai_model: "openrouter/free",
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "trip_id",
        },
      );

    if (itineraryError) {
      console.error(
        "Itinerary save error:",
        itineraryError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The itinerary was generated, but saving it failed.",
        },
        { status: 500 },
      );
    }

    /* ---------------------------------------------------------
       13. UPDATE TRIP
       --------------------------------------------------------- */

    const {
      error: tripUpdateError,
    } = await supabase
      .from("trips")
      .update({
        status: "ITINERARY_READY",
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", trip.id)
      .eq("user_id", user.id);

    if (tripUpdateError) {
      console.error(
        "Trip status update error:",
        tripUpdateError,
      );
    }

    /* ---------------------------------------------------------
       14. SUCCESS
       --------------------------------------------------------- */

    console.log(
      "===== SMART TRAVEL AI SUCCESS =====",
    );

    return NextResponse.json({
      success: true,
      tripId: trip.id,
      itinerary,
    });
  } catch (error) {
    console.error(
      "Smart Travel AI Planner error:",
      error,
    );

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The AI request took too long. Please try again.",
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating the itinerary.",
      },
      { status: 500 },
    );
  }
}