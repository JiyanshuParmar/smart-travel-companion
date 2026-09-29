import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

/* ============================================================
   ITINERARY VALIDATION SCHEMA
   ============================================================ */

const itinerarySchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),

  estimatedMinInr: z.number().nonnegative(),
  estimatedMaxInr: z.number().nonnegative(),

  days: z.array(
    z.object({
      day: z.number().int().positive(),
      title: z.string().min(1),

      activities: z.array(
        z.object({
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

          estimatedCostInr: z.number().nonnegative(),
          location: z.string().min(1),
        }),
      ),
    }),
  ),

  recommendations: z.array(
    z.object({
      type: z.enum(["PLACE", "BUSINESS"]),
      name: z.string().min(1),
      description: z.string().min(1),
      reason: z.string().min(1),
      estimatedCostInr: z.number().nonnegative(),
    }),
  ),

  travelNotes: z.array(z.string()),
});

/* ============================================================
   REQUEST VALIDATION
   ============================================================ */

const requestSchema = z.object({
  tripId: z.string().uuid(),
});

/* ============================================================
   TYPES
   ============================================================ */

type OpenRouterMessage = {
  content?: unknown;
  refusal?: unknown;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: OpenRouterMessage;
  }>;

  error?: {
    message?: string;
    code?: string | number;
  };
};

/* ============================================================
   HELPER: EXTRACT TEXT FROM AI MESSAGE
   ============================================================ */

function getMessageContent(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const textParts = content
      .map((part) => {
        if (
          typeof part === "object" &&
          part !== null &&
          "text" in part
        ) {
          const value = (part as { text?: unknown }).text;

          return typeof value === "string" ? value : "";
        }

        return "";
      })
      .filter(Boolean);

    return textParts.join("").trim();
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
   HELPER: CLEAN COMMON AI JSON FORMATTING PROBLEMS
   ============================================================ */

function cleanAIJsonText(text: string): string {
  let cleaned = text.trim();

  /*
   * Remove Markdown code fences.
   *
   * Example:
   *
   * ```json
   * {
   *   ...
   * }
   * ```
   */

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  /*
   * Some models occasionally add a sentence before JSON.
   *
   * Example:
   *
   * Here is your itinerary:
   * {
   *   ...
   * }
   *
   * Find the first { and last } and keep that section.
   */

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned = cleaned.slice(
      firstBrace,
      lastBrace + 1,
    );
  }

  return cleaned.trim();
}

/* ============================================================
   HELPER: PARSE AI JSON SAFELY
   ============================================================ */

function parseAIJson(content: unknown): unknown | null {
  if (
    typeof content === "object" &&
    content !== null
  ) {
    return content;
  }

  const text = getMessageContent(content);

  if (!text) {
    return null;
  }

  const cleaned = cleanAIJsonText(text);

  if (!cleaned) {
    return null;
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/* ============================================================
   HELPER: OPENROUTER REQUEST
   ============================================================ */

async function callOpenRouter(
  apiKey: string,
  prompt: string,
  useJsonMode = true,
): Promise<OpenRouterResponse> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 60000);

  try {
    const requestBody: Record<string, unknown> = {
      model: "openrouter/free",

      messages: [
        {
          role: "system",
          content: `
You are the Smart Travel Companion itinerary engine.

You MUST return exactly one JSON object.

Do not use Markdown.
Do not use code fences.
Do not write explanations before or after the JSON.
Do not include comments.
Do not include trailing commas.

Follow the requested structure exactly.
          `.trim(),
        },

        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.4,

      /*
       * Gives the model enough room for multi-day itineraries.
       */
      max_tokens: 7000,
    };

    /*
     * JSON mode is more compatible with OpenAI-compatible
     * providers than relying on a provider-specific strict
     * JSON schema.
     */
    if (useJsonMode) {
      requestBody.response_format = {
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

          /*
           * These are recommended OpenRouter headers.
           */
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Smart Travel Companion",
        },

        body: JSON.stringify(requestBody),

        signal: controller.signal,
      },
    );

    const data =
      (await response.json()) as OpenRouterResponse;

    if (!response.ok) {
      console.error(
        "OpenRouter HTTP error:",
        response.status,
        data,
      );

      throw new Error(
        data?.error?.message ||
          `OpenRouter returned HTTP ${response.status}.`,
      );
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

/* ============================================================
   MAIN POST HANDLER
   ============================================================ */

export async function POST(request: Request) {
  console.log("=================================");
  console.log("SMART TRAVEL AI PLANNER STARTED");
  console.log("=================================");

  try {
    /* ---------------------------------------------------------
       1. CHECK API KEY
       --------------------------------------------------------- */

    const apiKey =
      process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error(
        "OPENROUTER_API_KEY is missing.",
      );

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
       2. VALIDATE REQUEST
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

    const parsedRequest =
      requestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid trip request.",
        },
        { status: 400 },
      );
    }

    const { tripId } =
      parsedRequest.data;

    console.log("Trip ID:", tripId);

    /* ---------------------------------------------------------
       3. SUPABASE
       --------------------------------------------------------- */

    const supabase = await createClient();

    /* ---------------------------------------------------------
       4. AUTHENTICATION
       --------------------------------------------------------- */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "Authentication failed:",
        userError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "You must be logged in to generate an itinerary.",
        },
        { status: 401 },
      );
    }

    console.log(
      "Authenticated user:",
      user.id,
    );

    /* ---------------------------------------------------------
       5. FETCH TRIP
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

    console.log(
      "Trip found:",
      trip.destination,
    );

    /* ---------------------------------------------------------
       6. FETCH APPROVED PLACES
       --------------------------------------------------------- */

    const {
      data: places,
      error: placesError,
    } = await supabase
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
        detailed_backstory,
        insider_tip,
        best_time_to_visit,
        estimated_cost_inr
      `,
      )
      .eq("moderation_status", "APPROVED")
      .limit(30);

    if (placesError) {
      console.error(
        "Places fetch error:",
        placesError,
      );
    }

    /* ---------------------------------------------------------
       7. FETCH APPROVED BUSINESSES
       --------------------------------------------------------- */

    const {
      data: businesses,
      error: businessesError,
    } = await supabase
      .from("businesses")
      .select(
        `
        id,
        business_name,
        business_type,
        short_description,
        description,
        state,
        district,
        city,
        rating,
        review_count
      `,
      )
      .eq("status", "APPROVED")
      .limit(30);

    if (businessesError) {
      console.error(
        "Businesses fetch error:",
        businessesError,
      );
    }

    /* ---------------------------------------------------------
       8. FETCH APPROVED LISTINGS
       --------------------------------------------------------- */

    const {
      data: listings,
      error: listingsError,
    } = await supabase
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
        max_guests,
        duration_minutes
      `,
      )
      .eq("status", "APPROVED")
      .limit(50);

    if (listingsError) {
      console.error(
        "Listings fetch error:",
        listingsError,
      );
    }

    /* ---------------------------------------------------------
       9. FILTER RELEVANT DATA
       --------------------------------------------------------- */

    const destination =
      trip.destination
        .trim()
        .toLowerCase();

    const relevantPlaces =
      places?.filter((place) => {
        const searchableText = [
          place.title,
          place.category,
          place.state,
          place.district,
          place.location_name,
          place.short_description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          searchableText.includes(
            destination,
          ) ||
          destination.includes(
            searchableText,
          )
        );
      }) ?? [];

    const relevantBusinesses =
      businesses?.filter((business) => {
        const searchableText = [
          business.business_name,
          business.business_type,
          business.short_description,
          business.description,
          business.state,
          business.district,
          business.city,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          searchableText.includes(
            destination,
          ) ||
          destination.includes(
            searchableText,
          )
        );
      }) ?? [];

    const relevantBusinessIds =
      new Set(
        relevantBusinesses.map(
          (business) =>
            business.id,
        ),
      );

    const relevantListings =
      listings?.filter((listing) =>
        relevantBusinessIds.has(
          listing.business_id,
        ),
      ) ?? [];

    const placesForAI =
      relevantPlaces.length > 0
        ? relevantPlaces
        : places ?? [];

    const businessesForAI =
      relevantBusinesses.length > 0
        ? relevantBusinesses
        : businesses ?? [];

    const listingsForAI =
      relevantListings.length > 0
        ? relevantListings
        : listings ?? [];

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
       10. BUILD PROMPT
       --------------------------------------------------------- */

    const prompt = `
Create a complete travel itinerary for this trip.

TRIP INFORMATION

Destination:
${trip.destination}

Total Budget:
₹${trip.budget_inr}

Budget Style:
${trip.budget_style}

Duration:
${trip.duration_days} days

Pacing:
${trip.pacing_style}

Interests:
${
  (trip.interests ?? []).join(
    ", ",
  ) || "General travel"
}

IMPORTANT RULES

1. Create EXACTLY ${
      trip.duration_days
    } days.

2. Every day must contain at least one activity.

3. Keep the itinerary realistic and practical.

4. Respect the traveller's total budget.

5. estimatedMinInr must be less than or equal to estimatedMaxInr.

6. Use Indian Rupees for all costs.

7. Prioritize local food, culture, nature, community tourism,
   hidden places and authentic experiences.

8. Do NOT invent businesses, places, hotels, restaurants,
   activities, prices, addresses or booking options.

9. Named places and businesses MUST come from the supplied
   database context.

10. If the database does not contain enough information for
    the requested destination, use generic activity descriptions
    instead of inventing a named business or place.

11. Do not overload each day.

12. Consider realistic travel time.

13. Match the traveller's selected interests.

14. Recommendations must use names from the supplied database
    whenever a named recommendation is provided.

15. Keep estimated costs realistic.

16. Return ONLY a JSON object.

17. Do not wrap the JSON in Markdown.

18. Do not add any explanation outside the JSON.

19. Keep the response compact enough to fit within the output limit.

20. Use at most 4 activities per day.

21. Use at most 6 recommendations.

EXPECTED JSON STRUCTURE

{
  "title": "Trip title",
  "summary": "Short trip summary",
  "estimatedMinInr": 10000,
  "estimatedMaxInr": 15000,
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Activity title",
          "description": "Activity description",
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
      "name": "Name",
      "description": "Description",
      "reason": "Why it matches the traveller",
      "estimatedCostInr": 500
    }
  ],
  "travelNotes": [
    "Travel note"
  ]
}

APPROVED PLACES FROM OUR DATABASE

${JSON.stringify(
  placesForAI,
  null,
  2,
)}

APPROVED BUSINESSES FROM OUR DATABASE

${JSON.stringify(
  businessesForAI,
  null,
  2,
)}

APPROVED BUSINESS LISTINGS FROM OUR DATABASE

${JSON.stringify(
  listingsForAI,
  null,
  2,
)}
`;

    /* ---------------------------------------------------------
       11. CALL OPENROUTER
       --------------------------------------------------------- */

    console.log(
      "Calling OpenRouter...",
    );

    let openRouterData:
      | OpenRouterResponse
      | null = null;

    let parsedItinerary:
      | unknown
      | null = null;

    /*
     * We allow up to TWO attempts.
     *
     * Attempt 1:
     * JSON mode.
     *
     * Attempt 2:
     * JSON mode disabled, but stronger prompt.
     *
     * This makes the application much more tolerant of
     * providers that don't fully support JSON mode.
     */

    for (
      let attempt = 1;
      attempt <= 2;
      attempt++
    ) {
      try {
        console.log(
          `OpenRouter attempt ${attempt}/2`,
        );

        openRouterData =
          await callOpenRouter(
            apiKey,
            prompt,
            attempt === 1,
          );

        const content =
          openRouterData
            ?.choices?.[0]
            ?.message?.content;

        if (!content) {
          console.error(
            "OpenRouter returned empty content.",
          );

          continue;
        }

        parsedItinerary =
          parseAIJson(content);

        if (parsedItinerary) {
          console.log(
            `AI JSON parsed successfully on attempt ${attempt}.`,
          );

          break;
        }

        console.error(
          `AI JSON parsing failed on attempt ${attempt}.`,
        );
      } catch (error) {
        console.error(
          `OpenRouter attempt ${attempt} failed:`,
          error,
        );

        /*
         * If the request timed out, do not waste another
         * 60 seconds attempting again.
         */
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

        /*
         * Retry once for other OpenRouter errors.
         */
      }
    }

    /* ---------------------------------------------------------
       12. FINAL JSON CHECK
       --------------------------------------------------------- */

    if (!parsedItinerary) {
      console.error(
        "AI failed to return valid JSON after two attempts.",
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The AI could not format the itinerary correctly. Please try generating the plan again.",
        },
        { status: 502 },
      );
    }

    /* ---------------------------------------------------------
       13. ZOD VALIDATION
       --------------------------------------------------------- */

    const itineraryResult =
      itinerarySchema.safeParse(
        parsedItinerary,
      );

    if (!itineraryResult.success) {
      console.error(
        "AI itinerary validation failed:",
        itineraryResult.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The AI generated an incomplete itinerary. Please try again.",
        },
        { status: 502 },
      );
    }

    const itinerary =
      itineraryResult.data;

    /* ---------------------------------------------------------
       14. EXTRA BUSINESS RULE VALIDATION
       --------------------------------------------------------- */

    if (
      itinerary.days.length !==
      trip.duration_days
    ) {
      console.error(
        "AI generated incorrect number of days.",
        {
          expected:
            trip.duration_days,
          received:
            itinerary.days.length,
        },
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The AI generated an incorrect number of days. Please try again.",
        },
        { status: 502 },
      );
    }

    if (
      itinerary.estimatedMinInr >
      itinerary.estimatedMaxInr
    ) {
      console.error(
        "Invalid estimated budget range.",
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The AI generated an invalid budget range. Please try again.",
        },
        { status: 502 },
      );
    }

    console.log(
      "Itinerary validated successfully.",
    );

    /* ---------------------------------------------------------
       15. SAVE ITINERARY
       --------------------------------------------------------- */

    const {
      error: itineraryError,
    } = await supabase
      .from("itineraries")
      .upsert(
        {
          trip_id: trip.id,

          title:
            itinerary.title,

          summary:
            itinerary.summary,

          estimated_min_inr:
            itinerary.estimatedMinInr,

          estimated_max_inr:
            itinerary.estimatedMaxInr,

          days:
            itinerary.days,

          recommendations:
            itinerary.recommendations,

          travel_notes:
            itinerary.travelNotes,

          ai_model:
            "openrouter/free",

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "trip_id",
        },
      );

    if (itineraryError) {
      console.error(
        "Itinerary database error:",
        itineraryError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The itinerary was generated, but saving it failed. Please try again.",
        },
        { status: 500 },
      );
    }

    console.log(
      "Itinerary saved successfully.",
    );

    /* ---------------------------------------------------------
       16. UPDATE TRIP STATUS
       --------------------------------------------------------- */

    const {
      error: tripUpdateError,
    } = await supabase
      .from("trips")
      .update({
        status:
          "ITINERARY_READY",

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
       17. SUCCESS
       --------------------------------------------------------- */

    console.log("=================================");
    console.log(
      "SMART TRAVEL AI PLANNER SUCCESS",
    );
    console.log("=================================");

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