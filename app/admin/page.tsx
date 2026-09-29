import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type Business = {
  id: string;
  business_name: string;
  business_type: string;
  short_description: string | null;
  city: string;
  state: string;
  primary_image_url: string | null;
  status: string;
  created_at: string;
};

type Listing = {
  id: string;
  business_id: string;
  title: string;
  listing_type: string;
  price_inr: number;
  pricing_unit: string;
  primary_image_url: string | null;
  status: string;
  created_at: string;
  business?: {
    business_name: string;
    city: string;
    state: string;
  } | null;
};

type Place = {
  id: string;
  title: string;
  category: string;
  location_name: string;
  state: string;
  short_description: string;
  primary_image_url: string;
  moderation_status: string;
  created_at: string;
};

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
    DRAFT: "bg-slate-100 text-slate-600 ring-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        styles[status] ?? "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "ADMIN") {
    redirect("/");
  }

  const [
    businessesResult,
    listingsResult,
    placesResult,
    approvedBusinessesResult,
    approvedListingsResult,
    approvedPlacesResult,
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select(
        `
          id,
          business_name,
          business_type,
          short_description,
          city,
          state,
          primary_image_url,
          status,
          created_at
        `,
      )
      .eq("status", "PENDING")
      .order("created_at", { ascending: false }),

    supabase
      .from("listings")
      .select(
        `
          id,
          business_id,
          title,
          listing_type,
          price_inr,
          pricing_unit,
          primary_image_url,
          status,
          created_at,
          business:businesses(
            business_name,
            city,
            state
          )
        `,
      )
      .eq("status", "PENDING")
      .order("created_at", { ascending: false }),

    supabase
      .from("places")
      .select(
        `
          id,
          title,
          category,
          location_name,
          state,
          short_description,
          primary_image_url,
          moderation_status,
          created_at
        `,
      )
      .eq("moderation_status", "PENDING")
      .order("created_at", { ascending: false }),

    supabase
      .from("businesses")
      .select("id", { count: "exact", head: true })
      .eq("status", "APPROVED"),

    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "APPROVED"),

    supabase
      .from("places")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "APPROVED"),
  ]);

  const businesses = (businessesResult.data ?? []) as Business[];
  const listings = (listingsResult.data ?? []).map((listing) => ({
  ...listing,
  business: Array.isArray(listing.business)
    ? listing.business[0] ?? null
    : listing.business ?? null,
})) as unknown as Listing[];
  const places = (placesResult.data ?? []) as Place[];

  const pendingTotal = businesses.length + listings.length + places.length;

  const approvedBusinesses = approvedBusinessesResult.count ?? 0;
  const approvedListings = approvedListingsResult.count ?? 0;
  const approvedPlaces = approvedPlacesResult.count ?? 0;

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-slate-900">
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <Link
              href="/"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              ← Smart Travel Companion
            </Link>

            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Admin Command Center
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage marketplace quality, community content, and approvals.
            </p>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
              <span className="text-slate-400">Admin</span>{" "}
              <span className="font-semibold">
                {profile.display_name || "Administrator"}
              </span>
            </div>

            <Link
              href="/"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View website
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-slate-900/10 sm:p-9">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Platform control center
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Keep every local experience trustworthy.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Review partner businesses, experiences, and community
                discoveries before they become part of the traveller
                marketplace.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 lg:min-w-[210px]">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Needs attention
              </p>
              <p className="mt-1 text-3xl font-bold">{pendingTotal}</p>
              <p className="mt-1 text-xs text-slate-400">
                pending moderation items
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Pending businesses</p>
            <p className="mt-2 text-3xl font-bold">{businesses.length}</p>
            <p className="mt-1 text-xs text-slate-400">
              Partner applications
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Pending listings</p>
            <p className="mt-2 text-3xl font-bold">{listings.length}</p>
            <p className="mt-1 text-xs text-slate-400">
              Experiences awaiting review
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Community places</p>
            <p className="mt-2 text-3xl font-bold">{places.length}</p>
            <p className="mt-1 text-xs text-slate-400">
              Discoveries awaiting review
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Approved ecosystem</p>
            <p className="mt-2 text-3xl font-bold">
              {approvedBusinesses + approvedListings + approvedPlaces}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Published platform records
            </p>
          </div>
        </section>

        {/* Pending businesses */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Partner marketplace
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Pending businesses
              </h2>
            </div>

            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              {businesses.length} waiting
            </span>
          </div>

          {businesses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                ✓
              </div>
              <h3 className="mt-4 font-semibold">No businesses waiting</h3>
              <p className="mt-1 text-sm text-slate-500">
                New partner applications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {businesses.map((business) => (
                <article
                  key={business.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="relative h-52 w-full bg-slate-100 lg:h-auto lg:w-64 lg:shrink-0">
                      {business.primary_image_url ? (
                        <Image
                          src={business.primary_image_url}
                          alt={business.business_name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 256px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">
                          🏡
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold">
                              {business.business_name}
                            </h3>
                            <StatusBadge status={business.status} />
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {business.business_type} · {business.city},{" "}
                            {business.state}
                          </p>
                        </div>

                        <p className="text-xs text-slate-400">
                          Submitted {formatDate(business.created_at)}
                        </p>
                      </div>

                      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                        {business.short_description ||
                          "No short description provided."}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <form
                          action={async () => {
                            "use server";

                            const adminSupabase = await createClient();

                            await adminSupabase.rpc("moderate_business", {
                              p_business_id: business.id,
                              p_decision: "APPROVE",
                              p_rejection_reason: null,
                            });
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Approve business
                          </button>
                        </form>

                        <form
                          action={async () => {
                            "use server";

                            const adminSupabase = await createClient();

                            await adminSupabase.rpc("moderate_business", {
                              p_business_id: business.id,
                              p_decision: "REJECT",
                              p_rejection_reason: "Needs additional review.",
                            });
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            Reject
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pending listings */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                Marketplace listings
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Pending listings
              </h2>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {listings.length} waiting
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                ✓
              </div>
              <h3 className="mt-4 font-semibold">No listings waiting</h3>
              <p className="mt-1 text-sm text-slate-500">
                Partner experiences submitted for review will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-48 w-full bg-slate-100 sm:h-auto sm:w-52 sm:shrink-0">
                      {listing.primary_image_url ? (
                        <Image
                          src={listing.primary_image_url}
                          alt={listing.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 208px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">
                          ✨
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <StatusBadge status={listing.status} />
                          <h3 className="mt-2 text-lg font-bold">
                            {listing.title}
                          </h3>
                        </div>

                        <p className="whitespace-nowrap text-sm font-bold text-emerald-700">
                          {formatInr(listing.price_inr)}
                        </p>
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        {listing.listing_type} ·{" "}
                        {listing.pricing_unit.replaceAll("_", " ")}
                      </p>

                      {listing.business && (
                        <p className="mt-3 text-sm text-slate-600">
                          <span className="font-semibold">
                            {listing.business.business_name}
                          </span>{" "}
                          · {listing.business.city},{" "}
                          {listing.business.state}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2">
                        <form
                          action={async () => {
                            "use server";

                            const adminSupabase = await createClient();

                            await adminSupabase.rpc("moderate_listing", {
                              p_listing_id: listing.id,
                              p_decision: "APPROVE",
                              p_rejection_reason: null,
                            });
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        </form>

                        <form
                          action={async () => {
                            "use server";

                            const adminSupabase = await createClient();

                            await adminSupabase.rpc("moderate_listing", {
                              p_listing_id: listing.id,
                              p_decision: "REJECT",
                              p_rejection_reason: "Needs additional review.",
                            });
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            Reject
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pending community places */}
        <section className="mt-12 pb-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                Community discovery
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Pending places
              </h2>
            </div>

            <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              {places.length} waiting
            </span>
          </div>

          {places.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-xl">
                ✓
              </div>
              <h3 className="mt-4 font-semibold">
                No community discoveries waiting
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Traveller-submitted places will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {places.map((place) => (
                <article
                  key={place.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="relative h-56 w-full bg-slate-100">
                    <Image
                      src={place.primary_image_url}
                      alt={place.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />

                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                        {place.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">{place.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {place.location_name} · {place.state}
                        </p>
                      </div>

                      <StatusBadge status={place.moderation_status} />
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {place.short_description}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <form
                        action={async () => {
                          "use server";

                          const adminSupabase = await createClient();

                          await adminSupabase.rpc("moderate_place", {
                            p_place_id: place.id,
                            p_decision: "APPROVE",
                            p_rejection_reason: null,
                          });
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Approve place
                        </button>
                      </form>

                      <form
                        action={async () => {
                          "use server";

                          const adminSupabase = await createClient();

                          await adminSupabase.rpc("moderate_place", {
                            p_place_id: place.id,
                            p_decision: "REJECT",
                            p_rejection_reason: "Needs additional review.",
                          });
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}