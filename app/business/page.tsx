import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type MarketplaceListing = {
  id: string;
  title: string;
  slug: string;
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
      return "starting price";
  }
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "Flexible duration";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

const CATEGORY_OPTIONS = [
  "All",
  "Homestay",
  "Local Guide",
  "Food Experience",
  "Artisan",
  "Activity",
  "Transport",
];

export default async function BusinessesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        slug,
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
    .eq("status", "APPROVED")
    .eq("businesses.status", "APPROVED")
    .order("created_at", { ascending: false });

  const listings: MarketplaceListing[] = (data ?? []).map((item) => ({
    ...item,
    business: Array.isArray(item.businesses)
      ? item.businesses[0] ?? null
      : item.businesses ?? null,
  })) as MarketplaceListing[];

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.12),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Local-first travel marketplace
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Travel through the eyes of locals.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Discover authentic stays, experiences, food, guides and
              activities created by people who know the destination best.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/plan"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Plan my trip
              </Link>

              <Link
                href="/business/register"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Become a local partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Discover local
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Experiences worth travelling for
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Explore verified experiences from local hosts, guides and
              businesses.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {listings.length}{" "}
            {listings.length === 1 ? "experience" : "experiences"} available
          </div>
        </div>

        {/* Category pills */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {CATEGORY_OPTIONS.map((category, index) => (
            <span
              key={category}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-1 ${
                index === 0
                  ? "bg-slate-950 text-white ring-slate-950"
                  : "bg-white text-slate-600 ring-slate-200"
              }`}
            >
              {category}
            </span>
          ))}
        </div>

        {/* Cards */}
        {listings.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              ✦
            </div>

            <h3 className="mt-5 text-xl font-semibold text-slate-950">
              Local experiences are coming soon
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Local partners are currently adding their experiences. Check
              back soon or become one of our first partners.
            </p>

            <Link
              href="/business/register"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Become a local partner
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/business/${listing.slug}`}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  {listing.primary_image_url ? (
                    <Image
                      src={listing.primary_image_url}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                      ✦
                    </div>
                  )}

                  <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur">
                    {listing.business?.business_type ?? listing.listing_type}
                  </div>

                  <div className="absolute bottom-4 right-4 rounded-full bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                    Local partner
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-950 transition group-hover:text-emerald-700">
                        {listing.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {listing.business?.city},{" "}
                        {listing.business?.state}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg font-semibold text-slate-950">
                        {formatInr(listing.price_inr)}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {formatPricingUnit(listing.pricing_unit)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                    {listing.description ||
                      "Discover an authentic local experience with a trusted partner."}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        ★{" "}
                        <strong className="text-slate-700">
                          {Number(
                            listing.business?.rating ?? 0
                          ).toFixed(1)}
                        </strong>
                      </span>

                      <span>
                        {listing.business?.review_count ?? 0} reviews
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-slate-900 transition group-hover:text-emerald-700">
                      Explore →
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {formatDuration(listing.duration_minutes)}
                    </span>

                    <span>Up to {listing.max_guests} guests</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Partner CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8 lg:pb-24">
        <div className="overflow-hidden rounded-3xl bg-emerald-50 p-8 ring-1 ring-emerald-100 sm:p-10 lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                For local businesses
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Turn your local knowledge into a travel experience.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                List your homestay, guide service, food experience, activity
                or local transport and connect with travellers looking for
                something authentic.
              </p>
            </div>

            <Link
              href="/business/register"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Become a partner →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}