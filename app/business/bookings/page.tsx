import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import BusinessBookingActions from "@/components/BusinessBookingActions";

type BookingItem = {
  id: string;
  booking_date: string;
  guests: number;
  unit_price_inr: number;
  total_amount_inr: number;
  notes: string | null;
  status: string;
  payment_status: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    listing_type: string;
    primary_image_url: string | null;
  } | null;
};

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function statusClass(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";

    case "COMPLETED":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "Confirmed";
    case "CANCELLED":
      return "Cancelled";
    case "COMPLETED":
      return "Completed";
    default:
      return "Pending";
  }
}

export default async function BusinessBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/business/bookings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    (profile.role !== "BUSINESS" && profile.role !== "ADMIN")
  ) {
    redirect("/");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, business_name, status")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business && profile.role !== "ADMIN") {
    redirect("/business/register");
  }

  if (!business) {
    redirect("/admin");
  }

  const { data } = await supabase
    .from("bookings")
    .select(
      `
        id,
        booking_date,
        guests,
        unit_price_inr,
        total_amount_inr,
        notes,
        status,
        payment_status,
        created_at,
        listings (
          id,
          title,
          listing_type,
          primary_image_url
        )
      `
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  const bookings: BookingItem[] = (data ?? []).map((booking) => ({
    ...booking,
    listing: Array.isArray(booking.listings)
      ? booking.listings[0] ?? null
      : booking.listings ?? null,
  })) as BookingItem[];

  const pending = bookings.filter(
    (booking) => booking.status === "PENDING"
  );

  const confirmed = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  );

  const completed = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  );

  const revenue = bookings
    .filter(
      (booking) =>
        booking.status === "CONFIRMED" ||
        booking.status === "COMPLETED"
    )
    .reduce(
      (sum, booking) => sum + booking.total_amount_inr,
      0
    );

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                href="/business/dashboard"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                ← Business dashboard
              </Link>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Booking management
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {business.business_name}
              </h1>

              <p className="mt-3 text-sm text-slate-400">
                Manage traveller requests and upcoming experiences.
              </p>
            </div>

            <Link
              href="/business/listings"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Manage listings
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending requests
            </p>

            <p className="mt-2 text-3xl font-semibold text-amber-600">
              {pending.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Confirmed
            </p>

            <p className="mt-2 text-3xl font-semibold text-emerald-600">
              {confirmed.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {completed.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Confirmed value
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {formatInr(revenue)}
            </p>
          </div>
        </div>
      </section>

      {/* Bookings */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Incoming bookings
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Traveller requests
          </h2>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
              ✦
            </div>

            <h3 className="mt-5 text-xl font-semibold text-slate-950">
              No bookings yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Traveller bookings will appear here when someone
              books one of your approved experiences.
            </p>

            <Link
              href="/business/listings"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View my listings
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative min-h-[220px] w-full bg-slate-100 md:w-[260px] md:shrink-0">
                    {booking.listing?.primary_image_url ? (
                      <Image
                        src={booking.listing.primary_image_url}
                        alt={booking.listing.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 260px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-[220px] items-center justify-center text-5xl">
                        ✦
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-6 lg:p-7">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                              booking.status
                            )}`}
                          >
                            {statusLabel(booking.status)}
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {booking.listing?.listing_type ??
                              "Experience"}
                          </span>
                        </div>

                        <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                          {booking.listing?.title ??
                            "Local experience"}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                          Booking #{booking.id.slice(0, 8)}
                        </p>
                      </div>

                      <div className="xl:text-right">
                        <p className="text-xl font-semibold text-slate-950">
                          {formatInr(
                            booking.total_amount_inr
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Payment: {booking.payment_status}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-400">
                          Experience date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {formatDate(
                            booking.booking_date
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-400">
                          Guests
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {booking.guests}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-400">
                          Request date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {new Date(
                            booking.created_at
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-medium text-slate-400">
                          Traveller note
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {booking.notes}
                        </p>
                      </div>
                    )}

                    {booking.status === "PENDING" && (
                      <div className="mt-6 border-t border-slate-100 pt-6">
                        <BusinessBookingActions
                          bookingId={booking.id}
                        />
                      </div>
                    )}
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