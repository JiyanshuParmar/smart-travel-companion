import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import SubmitListingButton from "@/components/SubmitListingButton";

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
  created_at: string;
};

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusClasses(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";

    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-amber-200";

    case "REJECTED":
      return "bg-red-50 text-red-700 ring-red-200";

    case "INACTIVE":
      return "bg-slate-100 text-slate-600 ring-slate-200";

    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function BusinessListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/business/listings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["BUSINESS", "ADMIN"].includes(profile.role)) {
    redirect("/");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "id, business_name, business_type, city, state, status, rating, review_count"
    )
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) {
    redirect("/business/register");
  }

  const { data: listings } = await supabase
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
        status,
        created_at
      `
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  const allListings = (listings ?? []) as Listing[];

  const totalListings = allListings.length;
  const approvedListings = allListings.filter(
    (listing) => listing.status === "APPROVED"
  ).length;
  const pendingListings = allListings.filter(
    (listing) => listing.status === "PENDING"
  ).length;
  const draftListings = allListings.filter(
    (listing) => listing.status === "DRAFT"
  ).length;
  const rejectedListings = allListings.filter(
    (listing) => listing.status === "REJECTED"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                <Link
                  href="/business/dashboard"
                  className="transition hover:text-slate-900"
                >
                  Business Dashboard
                </Link>

                <span>/</span>

                <span className="text-slate-900">Listings</span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Your listings
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Manage the experiences, stays and local services you offer to
                travellers.
              </p>
            </div>

            <Link
              href="/business/listings/new"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              + Add new listing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              label: "Total listings",
              value: totalListings,
            },
            {
              label: "Approved",
              value: approvedListings,
            },
            {
              label: "Under review",
              value: pendingListings,
            },
            {
              label: "Drafts",
              value: draftListings,
            },
            {
              label: "Needs changes",
              value: rejectedListings,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">
                {stat.label}
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Business context */}
      <section className="mx-auto max-w-7xl px-6 pb-4 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-slate-950">
                  {business.business_name}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClasses(
                    business.status
                  )}`}
                >
                  {formatStatus(business.status)}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {business.business_type} · {business.city}, {business.state}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-lg">★</span>

              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {Number(business.rating ?? 0).toFixed(1)}
                </p>

                <p className="text-xs text-slate-500">
                  {business.review_count ?? 0} reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {allListings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              ✦
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-950">
              Your marketplace starts here
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create your first listing so travellers can discover what makes
              your local business special.
            </p>

            <Link
              href="/business/listings/new"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {allListings.map((listing) => (
              <article
                key={listing.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="relative min-h-[230px] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 lg:w-[300px] lg:shrink-0">
                    {listing.primary_image_url ? (
                      <Image
                        src={listing.primary_image_url}
                        alt={listing.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 300px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-[230px] items-center justify-center text-5xl">
                        ✦
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col p-6 lg:p-7">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClasses(
                              listing.status
                            )}`}
                          >
                            {formatStatus(listing.status)}
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {listing.listing_type}
                          </span>
                        </div>

                        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                          {listing.title}
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                          {listing.description ||
                            "No description has been added yet."}
                        </p>
                      </div>

                      <div className="shrink-0 xl:text-right">
                        <p className="text-2xl font-semibold tracking-tight text-slate-950">
                          {formatInr(listing.price_inr)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {listing.pricing_unit
                            .replaceAll("_", " ")
                            .toLowerCase()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 border-y border-slate-100 py-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Capacity
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {listing.max_guests} guests
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Duration
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {listing.duration_minutes
                            ? `${Math.floor(
                                listing.duration_minutes / 60
                              )}h${
                                listing.duration_minutes % 60
                                  ? ` ${listing.duration_minutes % 60}m`
                                  : ""
                              }`
                            : "Flexible"}
                        </p>
                      </div>

                      <div className="hidden sm:block">
                        <p className="text-xs font-medium text-slate-400">
                          Created
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {new Date(listing.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Rejection message */}
                    {listing.status === "REJECTED" && (
                      <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-800">
                          This listing needs changes
                        </p>

                        <p className="mt-1 text-sm leading-6 text-red-700">
                          Update the listing and resubmit it for review.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/business/listings/${listing.id}/edit`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          Edit listing
                        </Link>

                        <Link
                          href="/business/dashboard"
                          className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          Dashboard
                        </Link>
                      </div>

                      <SubmitListingButton
                        listingId={listing.id}
                        status={listing.status}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}