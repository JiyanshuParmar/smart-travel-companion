import Image from "next/image";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import BookingForm from "@/components/BookingForm";

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
  business: {
    id: string;
    business_name: string;
    business_type: string;
    city: string;
    state: string;
    rating: number;
    review_count: number;
  } | null;
};

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPricingUnit(unit: string) {
  switch (unit) {
    case "PER_PERSON":
      return "per person";
    case "PER_NIGHT":
      return "per night";
    case "PER_GROUP":
      return "per group";
    case "PER_VEHICLE":
      return "per vehicle";
    default:
      return "";
  }
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "Flexible";

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours} hr`;

  return `${hours} hr ${remaining} min`;
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/book/${listingId}`);
  }

  const { data } = await supabase
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
        businesses!inner (
          id,
          business_name,
          business_type,
          city,
          state,
          rating,
          review_count
        )
      `
    )
    .eq("id", listingId)
    .eq("status", "APPROVED")
    .eq("businesses.status", "APPROVED")
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const listing: Listing = {
    ...data,
    business: Array.isArray(data.businesses)
      ? data.businesses[0] ?? null
      : data.businesses ?? null,
  } as Listing;

  if (!listing.business) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/businesses"
              className="hover:text-slate-950"
            >
              Local experiences
            </Link>

            <span>/</span>

            <Link
              href={`/business/${listing.id}`}
              className="truncate hover:text-slate-950"
            >
              {listing.title}
            </Link>

            <span>/</span>

            <span className="text-slate-900">Book</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* Booking form */}
          <div>
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Secure your experience
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Book {listing.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Choose your date and group size. You&apos;ll review the
                complete booking details before confirming.
              </p>
            </div>

            <BookingForm
              listingId={listing.id}
              price={listing.price_inr}
              pricingUnit={listing.pricing_unit}
              maxGuests={listing.max_guests}
            />
          </div>

          {/* Summary */}
          <aside>
            <div className="sticky top-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[16/10] bg-slate-100">
                {listing.primary_image_url ? (
                  <Image
                    src={listing.primary_image_url}
                    alt={listing.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">
                    ✦
                  </div>
                )}
              </div>

              <div className="p-6">
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Verified local partner
                </span>

                <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                  {listing.title}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {listing.business?.business_name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {listing.business?.city}, {listing.business?.state}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Starting price
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formatInr(listing.price_inr)}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatPricingUnit(listing.pricing_unit)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Duration
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formatDuration(listing.duration_minutes)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Maximum guests
                    </span>

                    <span className="font-semibold text-slate-900">
                      {listing.max_guests}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Rating
                    </span>

                    <span className="font-semibold text-slate-900">
                      ★{" "}
                      {Number(
                        listing.business?.rating ?? 0
                      ).toFixed(1)}
                    </span>
                  </div>
                </div>

                <p className="mt-6 text-xs leading-5 text-slate-400">
                  Your booking request is stored securely and can be
                  viewed from your traveller dashboard.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}