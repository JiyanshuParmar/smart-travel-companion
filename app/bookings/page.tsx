import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PayNowButton from "@/components/PayNowButton";

interface BookingPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatInr(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not specified";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusClasses(status: string) {
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

function getPaymentClasses(status: string) {
  switch (status) {
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export default async function BookingDetailPage({
  params,
}: BookingPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/bookings/${id}`);
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("traveller_id", user.id)
    .maybeSingle();

  if (bookingError || !booking) {
    notFound();
  }

  const listingId =
    typeof booking.listing_id === "string" ? booking.listing_id : null;

  let listing: Record<string, unknown> | null = null;
  let business: Record<string, unknown> | null = null;

  if (listingId) {
    const { data: listingData } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .maybeSingle();

    listing = listingData;

    const businessId =
      listingData && typeof listingData.business_id === "string"
        ? listingData.business_id
        : null;

    if (businessId) {
      const { data: businessData } = await supabase
        .from("businesses")
        .select("id, business_name, city, state, primary_image_url")
        .eq("id", businessId)
        .maybeSingle();

      business = businessData;
    }
  }

  const totalAmount =
    typeof booking.total_amount_inr === "number"
      ? booking.total_amount_inr
      : Number(booking.total_amount_inr || 0);

  const bookingStatus = String(booking.status || "PENDING");
  const paymentStatus = String(booking.payment_status || "PENDING");

  const listingTitle =
    listing && typeof listing.title === "string"
      ? listing.title
      : "Travel experience";

  const listingDescription =
    listing && typeof listing.description === "string"
      ? listing.description
      : "Your local travel experience booking.";

  const listingImage =
    listing && typeof listing.primary_image_url === "string"
      ? listing.primary_image_url
      : null;

  const businessName =
    business && typeof business.business_name === "string"
      ? business.business_name
      : "Local travel partner";

  const city =
    business && typeof business.city === "string" ? business.city : "";

  const state =
    business && typeof business.state === "string" ? business.state : "";

  const location = [city, state].filter(Boolean).join(", ");

  const bookingDate =
    typeof booking.created_at === "string" ? booking.created_at : null;

  const guests =
    typeof booking.guests === "number"
      ? booking.guests
      : typeof booking.guest_count === "number"
        ? booking.guest_count
        : null;

  const startDate =
    typeof booking.start_date === "string" ? booking.start_date : null;

  const endDate =
    typeof booking.end_date === "string" ? booking.end_date : null;

  const canPay =
    bookingStatus === "CONFIRMED" &&
    paymentStatus !== "PAID" &&
    totalAmount > 0;

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
              ST
            </div>

            <div>
              <p className="text-sm font-black tracking-tight text-slate-950">
                Smart Travel
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                Companion
              </p>
            </div>
          </Link>

          <Link
            href="/bookings"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            My bookings
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-400">
          <Link
            href="/bookings"
            className="transition hover:text-slate-700"
          >
            Bookings
          </Link>

          <span>/</span>

          <span className="text-slate-700">Booking details</span>
        </div>

        {/* Main grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
          {/* Left */}
          <section>
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              {/* Cover */}
              <div className="relative h-[280px] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                {listingImage ? (
                  <Image
                    src={listingImage}
                    alt={listingTitle}
                    fill
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-6xl">✦</span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-8">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                    Booking confirmed
                  </p>

                  <h1 className="max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {listingTitle}
                  </h1>
                </div>
              </div>

              {/* Content */}
              <div className="p-7 sm:p-9">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                      bookingStatus,
                    )}`}
                  >
                    {bookingStatus}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getPaymentClasses(
                      paymentStatus,
                    )}`}
                  >
                    Payment: {paymentStatus}
                  </span>
                </div>

                <div className="mt-7">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    About this experience
                  </p>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    {listingDescription}
                  </p>
                </div>

                {/* Booking information */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-xs font-semibold text-slate-400">
                      Local partner
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-950">
                      {businessName}
                    </p>

                    {location && (
                      <p className="mt-1 text-xs text-slate-500">
                        {location}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-xs font-semibold text-slate-400">
                      Booking created
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-950">
                      {formatDate(bookingDate)}
                    </p>
                  </div>

                  {startDate && (
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-xs font-semibold text-slate-400">
                        Start date
                      </p>

                      <p className="mt-2 text-sm font-bold text-slate-950">
                        {formatDate(startDate)}
                      </p>
                    </div>
                  )}

                  {endDate && (
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-xs font-semibold text-slate-400">
                        End date
                      </p>

                      <p className="mt-2 text-sm font-bold text-slate-950">
                        {formatDate(endDate)}
                      </p>
                    </div>
                  )}

                  {guests !== null && (
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-xs font-semibold text-slate-400">
                        Guests
                      </p>

                      <p className="mt-2 text-sm font-bold text-slate-950">
                        {guests}
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment information */}
                {paymentStatus === "PAID" && (
                  <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg">
                        ✓
                      </div>

                      <div>
                        <p className="text-sm font-bold text-emerald-900">
                          Payment completed
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-700">
                          Your payment has been securely verified. Your
                          experience is ready.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Right */}
          <aside>
            <div className="sticky top-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Payment summary
              </p>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">
                    Total booking amount
                  </p>

                  <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                    {formatInr(totalAmount)}
                  </p>
                </div>

                <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                  INR
                </span>
              </div>

              <div className="my-6 h-px bg-slate-200" />

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Booking status</span>
                  <span className="font-bold text-slate-950">
                    {bookingStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Payment status</span>
                  <span className="font-bold text-slate-950">
                    {paymentStatus}
                  </span>
                </div>
              </div>

              <div className="mt-7">
                {canPay ? (
                  <PayNowButton
                    bookingId={booking.id}
                    amount={totalAmount}
                  />
                ) : paymentStatus === "PAID" ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                    <p className="text-sm font-bold text-emerald-800">
                      Payment complete ✓
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      No further payment is required for this booking.
                    </p>
                  </div>
                ) : bookingStatus === "PENDING" ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-sm font-bold text-amber-900">
                      Waiting for partner confirmation
                    </p>

                    <p className="mt-2 text-xs leading-5 text-amber-700">
                      Once the local partner confirms your booking, the secure
                      payment option will appear here.
                    </p>
                  </div>
                ) : bookingStatus === "CANCELLED" ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-bold text-red-900">
                      Booking cancelled
                    </p>

                    <p className="mt-2 text-xs leading-5 text-red-700">
                      This booking is no longer available for payment.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-800">
                      Payment unavailable
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      This booking cannot currently accept a payment.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <div className="flex gap-3">
                  <span className="text-lg">🔒</span>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Secure checkout
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      Payments are processed securely through Razorpay. Your
                      card or UPI details are handled by the payment provider.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/bookings"
                className="mt-5 flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to my bookings
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}