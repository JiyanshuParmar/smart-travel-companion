import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface Business {
  id: string;
  business_name: string;
  slug: string;
  business_type: string;
  short_description: string | null;
  city: string;
  state: string;
  primary_image_url: string | null;
  status: string;
  rating: number;
  review_count: number;
}

interface Listing {
  id: string;
  title: string;
  slug: string;
  listing_type: string;
  price_inr: number;
  pricing_unit: string;
  max_guests: number;
  primary_image_url: string | null;
  status: string;
  created_at: string;
}

function formatInr(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getStatusClasses(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";

    case "INACTIVE":
      return "bg-stone-100 text-stone-600 border-stone-200";

    case "DRAFT":
    default:
      return "bg-stone-100 text-stone-700 border-stone-200";
  }
}

function getListingTypeLabel(type: string) {
  switch (type) {
    case "ROOM":
      return "Stay";

    case "TOUR":
      return "Tour";

    case "EXPERIENCE":
      return "Experience";

    case "ACTIVITY":
      return "Activity";

    case "TRANSPORT":
      return "Transport";

    default:
      return type;
  }
}

function getPricingLabel(unit: string) {
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

export default async function BusinessDashboardPage() {
  const supabase = await createClient();

  /* ============================================================
     AUTHENTICATION
     ============================================================ */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?redirect=/business/dashboard",
    );
  }

  /* ============================================================
     PROFILE
     ============================================================ */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "id, display_name, avatar_url, role",
    )
    .eq("id", user.id)
    .single<Profile>();

  if (profileError || !profile) {
    redirect("/");
  }

  /* ============================================================
     ROLE PROTECTION
     ============================================================ */

  if (
    profile.role !== "BUSINESS" &&
    profile.role !== "ADMIN"
  ) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <div className="rounded-3xl bg-white border border-stone-200 shadow-xl shadow-stone-200/40 p-8 sm:p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl mb-6">
              ✦
            </div>

            <p className="text-xs uppercase tracking-[0.18em] font-bold text-orange-600 mb-3">
              Local Business
            </p>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950">
              Your business dashboard is not active yet
            </h1>

            <p className="mt-4 text-stone-600 leading-7 max-w-xl mx-auto">
              Your current account is registered as a
              traveller. Business accounts will be able
              to create listings, manage bookings and
              connect with travellers looking for local
              experiences.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-stone-950 text-white font-semibold hover:bg-stone-800 transition-colors"
              >
                Back to Home
              </Link>

              <Link
                href="/profile"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-stone-200 bg-white text-stone-800 font-semibold hover:bg-stone-50 transition-colors"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ============================================================
     BUSINESS PROFILE
     ============================================================ */

  const {
    data: business,
    error: businessError,
  } = await supabase
    .from("businesses")
    .select(
      `
        id,
        business_name,
        slug,
        business_type,
        short_description,
        city,
        state,
        primary_image_url,
        status,
        rating,
        review_count
      `,
    )
    .eq("owner_id", user.id)
    .maybeSingle<Business>();

  if (businessError) {
    console.error(
      "Business dashboard profile error:",
      businessError,
    );
  }

  /* ============================================================
     NO BUSINESS PROFILE YET
     ============================================================ */

  if (!business) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="rounded-[2rem] overflow-hidden bg-stone-950 text-white shadow-2xl">
            <div className="p-8 sm:p-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-orange-300 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                Business Workspace
              </div>

              <h1 className="mt-6 font-serif text-4xl sm:text-5xl font-bold tracking-tight">
                Welcome to your local business workspace.
              </h1>

              <p className="mt-5 max-w-2xl text-stone-300 text-base sm:text-lg leading-8">
                Your account has business access, but you
                have not created a business profile yet.
                Set up your profile first and then you can
                start publishing local experiences.
              </p>

              <div className="mt-8">
                <Link
                  href="/business/register"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors shadow-lg"
                >
                  Create Business Profile
                  <span className="ml-2">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ============================================================
     LISTINGS
     ============================================================ */

  const {
    data: listings,
    error: listingsError,
  } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        slug,
        listing_type,
        price_inr,
        pricing_unit,
        max_guests,
        primary_image_url,
        status,
        created_at
      `,
    )
    .eq("business_id", business.id)
    .order("created_at", {
      ascending: false,
    })
    .returns<Listing[]>();

  if (listingsError) {
    console.error(
      "Business listings error:",
      listingsError,
    );
  }

  const safeListings = listings ?? [];

  /* ============================================================
     DASHBOARD STATS
     ============================================================ */

  const totalListings =
    safeListings.length;

  const approvedListings =
    safeListings.filter(
      (listing) =>
        listing.status === "APPROVED",
    ).length;

  const pendingListings =
    safeListings.filter(
      (listing) =>
        listing.status === "PENDING",
    ).length;

  const draftListings =
    safeListings.filter(
      (listing) =>
        listing.status === "DRAFT",
    ).length;

  const firstName =
    profile.display_name
      ?.trim()
      .split(" ")[0] ||
    "Partner";

  /* ============================================================
     DASHBOARD UI
     ============================================================ */

  return (
    <main className="min-h-screen bg-stone-50">
      {/* ========================================================
          TOP BAR
          ======================================================== */}

      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-950 text-orange-400 flex items-center justify-center font-serif font-bold text-lg">
              S
            </div>

            <div className="hidden sm:block">
              <p className="font-serif font-bold text-stone-950 leading-none">
                Smart Travel
              </p>

              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500 mt-1">
                Business
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              View Website
            </Link>

            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">
                {firstName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <span className="hidden sm:block text-sm font-semibold text-stone-800">
                {firstName}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================
          CONTENT
          ======================================================== */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* ======================================================
            WELCOME
            ====================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-600 mb-3">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Business Dashboard
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-950">
              Good to see you,
              {" "}
              {firstName}.
            </h1>

            <p className="mt-3 text-stone-600 max-w-2xl">
              Manage your local experiences,
              listings and traveller visibility
              from one place.
            </p>
          </div>

          <Link
            href="/business/listings/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg shadow-orange-600/15 transition-all hover:-translate-y-0.5"
          >
            <span className="text-lg leading-none">
              +
            </span>
            Add New Listing
          </Link>
        </div>

        {/* ======================================================
            BUSINESS STATUS
            ====================================================== */}

        <div className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 overflow-hidden flex items-center justify-center">
                {business.primary_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      business.primary_image_url
                    }
                    alt={
                      business.business_name
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-serif font-bold text-stone-500">
                    {business.business_name
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold text-stone-950">
                  {business.business_name}
                </h2>

                <p className="text-sm text-stone-500 mt-0.5">
                  {business.business_type}
                  {" · "}
                  {business.city},{" "}
                  {business.state}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusClasses(
                  business.status,
                )}`}
              >
                {business.status}
              </span>

              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                <span className="text-amber-500">
                  ★
                </span>

                {Number(
                  business.rating || 0,
                ).toFixed(1)}

                <span className="text-stone-400 font-normal">
                  ({business.review_count})
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================
            STATS
            ====================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-3xl bg-white border border-stone-200 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-bold text-stone-500">
              Total Listings
            </p>

            <p className="mt-3 text-3xl font-serif font-bold text-stone-950">
              {totalListings}
            </p>

            <p className="mt-1 text-xs text-stone-500">
              Experiences and services
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-stone-200 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-bold text-stone-500">
              Approved
            </p>

            <p className="mt-3 text-3xl font-serif font-bold text-emerald-700">
              {approvedListings}
            </p>

            <p className="mt-1 text-xs text-stone-500">
              Visible to travellers
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-stone-200 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-bold text-stone-500">
              Pending
            </p>

            <p className="mt-3 text-3xl font-serif font-bold text-amber-600">
              {pendingListings}
            </p>

            <p className="mt-1 text-xs text-stone-500">
              Awaiting review
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-stone-200 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider font-bold text-stone-500">
              Drafts
            </p>

            <p className="mt-3 text-3xl font-serif font-bold text-stone-700">
              {draftListings}
            </p>

            <p className="mt-1 text-xs text-stone-500">
              Not submitted yet
            </p>
          </div>
        </div>

        {/* ======================================================
            MAIN GRID
            ====================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* ====================================================
              LISTINGS
              ==================================================== */}

          <section className="rounded-3xl bg-white border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-stone-100 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-950">
                  Your Listings
                </h2>

                <p className="text-sm text-stone-500 mt-1">
                  Manage the experiences travellers
                  can discover.
                </p>
              </div>

              <Link
                href="/business/listings"
                className="text-sm font-semibold text-orange-700 hover:text-orange-800"
              >
                View all
              </Link>
            </div>

            {safeListings.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl">
                  +
                </div>

                <h3 className="mt-5 font-serif text-xl font-bold text-stone-950">
                  Your first listing starts here
                </h3>

                <p className="mt-2 text-sm text-stone-500 max-w-md mx-auto">
                  Add a homestay, local tour,
                  food experience, activity or
                  another service travellers can
                  discover.
                </p>

                <Link
                  href="/business/listings/new"
                  className="inline-flex mt-6 px-5 py-2.5 rounded-xl bg-stone-950 text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
                >
                  Create Listing
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {safeListings
                  .slice(0, 8)
                  .map((listing) => (
                    <div
                      key={listing.id}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center"
                    >
                      <div className="w-full sm:w-20 h-24 sm:h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                        {listing.primary_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              listing.primary_image_url
                            }
                            alt={
                              listing.title
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            ✦
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-stone-950 truncate">
                            {listing.title}
                          </h3>

                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${getStatusClasses(
                              listing.status,
                            )}`}
                          >
                            {listing.status}
                          </span>
                        </div>

                        <p className="text-xs text-stone-500 mt-1">
                          {getListingTypeLabel(
                            listing.listing_type,
                          )}
                          {" · "}
                          {listing.max_guests}{" "}
                          guest
                          {listing.max_guests !==
                          1
                            ? "s"
                            : ""}
                        </p>

                        <p className="mt-2 text-sm font-bold text-stone-900">
                          {formatInr(
                            listing.price_inr,
                          )}

                          <span className="ml-1 text-xs font-normal text-stone-500">
                            {getPricingLabel(
                              listing.pricing_unit,
                            )}
                          </span>
                        </p>
                      </div>

                      <Link
                        href={`/business/listings/${listing.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        Manage
                      </Link>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {/* ====================================================
              SIDEBAR
              ==================================================== */}

          <aside className="space-y-6">

            {/* QUICK ACTIONS */}

            <div className="rounded-3xl bg-stone-950 text-white p-6">
              <p className="text-xs uppercase tracking-[0.16em] font-bold text-orange-300">
                Quick Actions
              </p>

              <div className="mt-5 space-y-2">
                <Link
                  href="/business/listings/new"
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
                >
                  <span className="text-sm font-medium">
                    Add listing
                  </span>

                  <span>
                    →
                  </span>
                </Link>

                <Link
                  href="/business/listings"
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
                >
                  <span className="text-sm font-medium">
                    Manage listings
                  </span>

                  <span>
                    →
                  </span>
                </Link>

                <Link
                  href="/business/bookings"
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
                >
                  <span className="text-sm font-medium">
                    View bookings
                  </span>

                  <span>
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* PROFILE COMPLETENESS */}

            <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-stone-950">
                  Business Profile
                </h3>

                <span className="text-xs font-bold text-orange-700">
                  Active
                </span>
              </div>

              <div className="mt-5 h-2 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full w-[85%] rounded-full bg-orange-600" />
              </div>

              <p className="mt-3 text-xs text-stone-500">
                Keep your description, photos and
                contact details complete to give
                travellers more confidence.
              </p>

              <Link
                href="/profile"
                className="inline-flex mt-4 text-sm font-semibold text-stone-900 hover:text-orange-700"
              >
                Edit profile →
              </Link>
            </div>

            {/* RATING */}

            <div className="rounded-3xl bg-orange-50 border border-orange-100 p-6">
              <p className="text-xs uppercase tracking-[0.16em] font-bold text-orange-700">
                Traveller Trust
              </p>

              <div className="mt-4 flex items-end gap-2">
                <span className="font-serif text-4xl font-bold text-stone-950">
                  {Number(
                    business.rating || 0,
                  ).toFixed(1)}
                </span>

                <span className="text-amber-500 text-xl mb-1">
                  ★
                </span>
              </div>

              <p className="mt-1 text-sm text-stone-600">
                Based on{" "}
                {business.review_count}{" "}
                traveller review
                {business.review_count !==
                1
                  ? "s"
                  : ""}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}