"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

const LISTING_TYPE_LABELS: Record<
  (typeof LISTING_TYPES)[number],
  string
> = {
  ROOM: "Room / Stay",
  TOUR: "Tour",
  EXPERIENCE: "Experience",
  ACTIVITY: "Activity",
  TRANSPORT: "Transport",
};

const PRICING_LABELS: Record<
  (typeof PRICING_UNITS)[number],
  string
> = {
  PER_PERSON: "Per person",
  PER_NIGHT: "Per night",
  PER_GROUP: "Per group",
  PER_VEHICLE: "Per vehicle",
};

type Listing = {
  id: string;
  title: string;
  description: string | null;
  listing_type: string;
  price_inr: number;
  pricing_unit: string;
  max_guests: number;
  duration_minutes: number | null;
  primary_image_url: string | null;
  status: string;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadListing() {
      try {
        setLoading(true);
        setErrorMessage("");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push(
            `/login?redirect=${encodeURIComponent(
              `/business/listings/${listingId}/edit`
            )}`
          );
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError) {
          throw profileError;
        }

        if (
          profile.role !== "BUSINESS" &&
          profile.role !== "ADMIN"
        ) {
          throw new Error(
            "Only business accounts can edit listings."
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
          router.push("/business/register");
          return;
        }

        const { data, error } = await supabase
          .from("listings")
          .select(
            `
              id,
              title,
              description,
              listing_type,
              price_inr,
              pricing_unit,
              max_guests,
              duration_minutes,
              primary_image_url,
              status
            `
          )
          .eq("id", listingId)
          .eq("business_id", business.id)
          .single();

        if (error) {
          throw error;
        }

        const loadedListing = data as Listing;

        setListing(loadedListing);
        setTitle(loadedListing.title);
        setDescription(loadedListing.description ?? "");
        setListingType(
          loadedListing.listing_type as (typeof LISTING_TYPES)[number]
        );
        setPrice(String(loadedListing.price_inr));
        setPricingUnit(
          loadedListing.pricing_unit as (typeof PRICING_UNITS)[number]
        );
        setMaxGuests(String(loadedListing.max_guests));
        setDurationMinutes(
          loadedListing.duration_minutes
            ? String(loadedListing.duration_minutes)
            : ""
        );
        setImageUrl(loadedListing.primary_image_url ?? "");
      } catch (error) {
        console.error("Load listing error:", error);

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Could not load this listing.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (listingId) {
      loadListing();
    }
  }, [listingId, router, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanImageUrl = imageUrl.trim();

    if (cleanTitle.length < 2) {
      setErrorMessage(
        "Listing title must contain at least 2 characters."
      );
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

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(
          `/login?redirect=${encodeURIComponent(
            `/business/listings/${listingId}/edit`
          )}`
        );
        return;
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
        throw new Error("Business profile not found.");
      }

      const baseSlug =
        createSlug(cleanTitle) || `listing-${Date.now()}`;

      let listingSlug = baseSlug;

      const { data: existingListing, error: slugError } =
        await supabase
          .from("listings")
          .select("id")
          .eq("slug", listingSlug)
          .neq("id", listingId)
          .maybeSingle();

      if (slugError) {
        throw slugError;
      }

      if (existingListing) {
        listingSlug = `${baseSlug}-${Date.now()}`;
      }

      const { error: updateError } = await supabase
        .from("listings")
        .update({
          title: cleanTitle,
          slug: listingSlug,
          description: cleanDescription,
          listing_type: listingType,
          price_inr: Math.round(priceNumber),
          pricing_unit: pricingUnit,
          max_guests: maxGuestsNumber,
          duration_minutes: durationNumber,
          primary_image_url: cleanImageUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", listingId)
        .eq("business_id", business.id);

      if (updateError) {
        throw updateError;
      }

      setSuccessMessage("Listing updated successfully.");

      setTimeout(() => {
        router.push("/business/listings");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error("Update listing error:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Something went wrong while updating the listing."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-32 rounded bg-slate-200" />
            <div className="h-10 w-72 rounded bg-slate-200" />

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="h-[700px] rounded-3xl bg-white" />
              <div className="h-[400px] rounded-3xl bg-white" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-6 py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Listing not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            We could not find this listing or you do not have permission
            to edit it.
          </p>

          <Link
            href="/business/listings"
            className="mt-6 inline-flex rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
          >
            Back to listings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <Link
            href="/business/listings"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back to listings
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Manage listing
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Edit listing
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Update the details travellers will see.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current status
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {listing.status}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"
        >
          <div className="space-y-8">
            {/* Basic information */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Listing details
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Basic information
                </h2>
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
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
                    rows={8}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
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
                    Photo uploads will be added with Supabase Storage.
                  </p>
                </div>
              </div>
            </section>

            {/* Type */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Category
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  What are you offering?
                </h2>
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
                  Pricing
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Pricing & capacity
                </h2>
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
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-9 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
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
                    htmlFor="duration"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Duration
                  </label>

                  <div className="relative">
                    <input
                      id="duration"
                      type="number"
                      min="1"
                      value={durationMinutes}
                      onChange={(event) =>
                        setDurationMinutes(event.target.value)
                      }
                      placeholder="120"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      minutes
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Messages */}
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <p className="font-semibold">
                  We could not update your listing.
                </p>

                <p className="mt-1">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                <p className="font-semibold">{successMessage}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/business/listings"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving changes..." : "Save changes"}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                ✨
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Keep your listing fresh
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Accurate pricing, descriptions, and capacity information
                help travellers make better booking decisions.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  "Use an accurate title",
                  "Keep your description useful",
                  "Check your pricing",
                  "Add a good cover photo later",
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
                Listing status
              </p>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">
                  {listing.status}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Editing your listing does not automatically publish it.
                  Review and submission will be handled separately.
                </p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}