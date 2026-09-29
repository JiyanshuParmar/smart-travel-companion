"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LISTING_TYPES = [
  "ROOM",
  "TOUR",
  "EXPERIENCE",
  "ACTIVITY",
  "TRANSPORT",
] as const;

const PRICING_UNITS = [
  "PER_PERSON",
  "PER_NIGHT",
  "PER_GROUP",
  "PER_VEHICLE",
] as const;

const LISTING_TYPE_LABELS: Record<(typeof LISTING_TYPES)[number], string> = {
  ROOM: "Room / Stay",
  TOUR: "Tour",
  EXPERIENCE: "Experience",
  ACTIVITY: "Activity",
  TRANSPORT: "Transport",
};

const PRICING_LABELS: Record<(typeof PRICING_UNITS)[number], string> = {
  PER_PERSON: "Per person",
  PER_NIGHT: "Per night",
  PER_GROUP: "Per group",
  PER_VEHICLE: "Per vehicle",
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewListingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [listingType, setListingType] =
    useState<(typeof LISTING_TYPES)[number]>("EXPERIENCE");
  const [price, setPrice] = useState("");
  const [pricingUnit, setPricingUnit] =
    useState<(typeof PRICING_UNITS)[number]>("PER_PERSON");
  const [maxGuests, setMaxGuests] = useState("1");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanImageUrl = imageUrl.trim();

    if (cleanTitle.length < 2) {
      setErrorMessage("Listing title must contain at least 2 characters.");
      return;
    }

    if (cleanDescription.length < 20) {
      setErrorMessage(
        "Please provide a description of at least 20 characters."
      );
      return;
    }

    const priceNumber = Number(price);
    const maxGuestsNumber = Number(maxGuests);
    const durationNumber = durationMinutes
      ? Number(durationMinutes)
      : null;

    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setErrorMessage("Please enter a valid price.");
      return;
    }

    if (
      !Number.isInteger(maxGuestsNumber) ||
      maxGuestsNumber < 1
    ) {
      setErrorMessage("Maximum guests must be at least 1.");
      return;
    }

    if (
      durationNumber !== null &&
      (!Number.isInteger(durationNumber) || durationNumber <= 0)
    ) {
      setErrorMessage("Duration must be greater than 0 minutes.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.push(
          `/login?redirect=${encodeURIComponent(
            "/business/listings/new"
          )}`
        );
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (profile.role !== "BUSINESS" && profile.role !== "ADMIN") {
        throw new Error(
          "Only business accounts can create listings."
        );
      }

      const { data: business, error: businessError } =
        await supabase
          .from("businesses")
          .select("id")
          .eq("owner_id", user.id)
          .maybeSingle();

      if (businessError) {
        throw businessError;
      }

      if (!business) {
        throw new Error(
          "You need to create a business profile before adding a listing."
        );
      }

      const baseSlug =
        createSlug(cleanTitle) ||
        `listing-${Date.now()}`;

      let listingSlug = baseSlug;

      const { data: existingListing, error: slugCheckError } =
        await supabase
          .from("listings")
          .select("id")
          .eq("slug", listingSlug)
          .maybeSingle();

      if (slugCheckError) {
        throw slugCheckError;
      }

      if (existingListing) {
        listingSlug = `${baseSlug}-${Date.now()}`;
      }

      const { error: insertError } = await supabase
        .from("listings")
        .insert({
          business_id: business.id,
          title: cleanTitle,
          slug: listingSlug,
          description: cleanDescription,
          listing_type: listingType,
          price_inr: Math.round(priceNumber),
          pricing_unit: pricingUnit,
          max_guests: maxGuestsNumber,
          duration_minutes: durationNumber,
          primary_image_url: cleanImageUrl || null,
          status: "DRAFT",
        });

      if (insertError) {
        throw insertError;
      }

      router.push("/business/listings");
      router.refresh();
    } catch (error) {
      console.error("Create listing error:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Something went wrong while creating the listing."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/business/dashboard"
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                ← Back to dashboard
              </Link>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Create a new listing
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Add an experience, stay, activity, tour, or transport
                service that travellers can discover.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Listing status
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                Draft
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"
        >
          {/* Form */}
          <div className="space-y-8">
            {/* Basic information */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Step 01
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Basic information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Give travellers a clear idea of what you offer.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Listing title
                  </label>

                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="Goa Sunset Kayaking Experience"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Describe what travellers will experience, what is included, and what makes it special..."
                    rows={7}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    required
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Minimum 20 characters.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="imageUrl"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Cover image URL
                  </label>

                  <input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(event) =>
                      setImageUrl(event.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Image upload through Supabase Storage will be added
                    later.
                  </p>
                </div>
              </div>
            </section>

            {/* Listing type */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Step 02
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  What are you offering?
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose the category that best describes your listing.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {LISTING_TYPES.map((type) => {
                  const selected = listingType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setListingType(type)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">
                          {LISTING_TYPE_LABELS[type]}
                        </span>

                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            selected
                              ? "border-emerald-600 bg-emerald-600"
                              : "border-slate-300"
                          }`}
                        >
                          {selected && (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Pricing */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Step 03
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Pricing & capacity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Help travellers understand the cost and group size.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                      ₹
                    </span>

                    <input
                      id="price"
                      type="number"
                      min="0"
                      value={price}
                      onChange={(event) =>
                        setPrice(event.target.value)
                      }
                      placeholder="1500"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pricingUnit"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Pricing unit
                  </label>

                  <select
                    id="pricingUnit"
                    value={pricingUnit}
                    onChange={(event) =>
                      setPricingUnit(
                        event.target.value as (typeof PRICING_UNITS)[number]
                      )
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  >
                    {PRICING_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {PRICING_LABELS[unit]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="maxGuests"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Maximum guests
                  </label>

                  <input
                    id="maxGuests"
                    type="number"
                    min="1"
                    value={maxGuests}
                    onChange={(event) =>
                      setMaxGuests(event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="durationMinutes"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Duration
                  </label>

                  <div className="relative">
                    <input
                      id="durationMinutes"
                      type="number"
                      min="1"
                      value={durationMinutes}
                      onChange={(event) =>
                        setDurationMinutes(event.target.value)
                      }
                      placeholder="120"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                      minutes
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Error */}
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <p className="font-semibold">
                  We could not create your listing.
                </p>

                <p className="mt-1">{errorMessage}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/business/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating listing..." : "Create listing"}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-xl">
                ✨
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Make your listing stand out
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Clear descriptions, realistic pricing, and useful
                details help travellers understand your offering.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  "Use a clear title",
                  "Explain what is included",
                  "Set an accurate price",
                  "Mention the maximum group size",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-300">
                      ✓
                    </span>

                    <span className="text-sm text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                What happens next?
              </p>

              <div className="mt-5 space-y-5">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    1
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Save as draft
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your listing is saved privately first.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    2
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Review details
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      You can edit your listing before publishing.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    3
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Submit for review
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Approved listings can become visible to travellers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}