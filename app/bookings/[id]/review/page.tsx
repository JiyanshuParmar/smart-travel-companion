"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Booking {
  id: string;
  payment_status: string;
  total_amount_inr: number;
  listing_id: string | null;
  business_id: string | null;
}

interface Listing {
  title: string;
  primary_image_url: string | null;
}

interface Business {
  business_name: string;
  city: string;
  state: string;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const bookingId = String(params.id);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBooking() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(
          `/login?redirect=/bookings/${bookingId}/review`,
        );
        return;
      }

      const { data, error: bookingError } = await supabase
        .from("bookings")
        .select(
          `
            id,
            payment_status,
            total_amount_inr,
            listing_id,
            business_id
          `,
        )
        .eq("id", bookingId)
        .eq("traveller_id", user.id)
        .maybeSingle();

      if (bookingError || !data) {
        setError("We could not find this booking.");
        setLoading(false);
        return;
      }

      if (data.payment_status !== "PAID") {
        setError(
          "A review can be submitted after payment is completed.",
        );
        setLoading(false);
        return;
      }

      setBooking(data);

      if (data.listing_id) {
        const { data: listingData } = await supabase
          .from("listings")
          .select("title, primary_image_url")
          .eq("id", data.listing_id)
          .maybeSingle();

        if (listingData) {
          setListing(listingData);
        }
      }

      if (data.business_id) {
        const { data: businessData } = await supabase
          .from("businesses")
          .select("business_name, city, state")
          .eq("id", data.business_id)
          .maybeSingle();

        if (businessData) {
          setBusiness(businessData);
        }
      }

      setLoading(false);
    }

    loadBooking();
  }, [bookingId, router, supabase]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    if (comment.trim().length < 5) {
      setError(
        "Please write at least a few words about your experience.",
      );
      return;
    }

    setSubmitting(true);

    const { error: reviewError } = await supabase.rpc(
      "create_review",
      {
        p_booking_id: bookingId,
        p_rating: rating,
        p_title: title.trim() || null,
        p_comment: comment.trim(),
      },
    );

    if (reviewError) {
      setError(reviewError.message);
      setSubmitting(false);
      return;
    }

    router.push(`/bookings/${bookingId}`);
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-8 h-80 animate-pulse rounded-[2rem] bg-white" />
        </div>
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto flex min-h-screen max-w-xl items-center px-6">
          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              !
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-950">
              Review unavailable
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <Link
              href={`/bookings/${bookingId}`}
              className="mt-7 inline-flex rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white"
            >
              Back to booking
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const displayedRating = hoverRating || rating;

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
              ST
            </div>

            <div>
              <p className="text-sm font-black text-slate-950">
                Smart Travel
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                Companion
              </p>
            </div>
          </Link>

          <Link
            href={`/bookings/${bookingId}`}
            className="text-sm font-semibold text-slate-600 hover:text-slate-950"
          >
            Back to booking
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Share your experience
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            How was your trip?
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Your feedback helps travellers discover great local experiences
            and helps local partners grow.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 p-7 sm:p-9">
            <div className="flex gap-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                {listing?.primary_image_url ? (
                  <Image
                    src={listing.primary_image_url}
                    alt={listing.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">
                    ✦
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  {listing?.title || "Your travel experience"}
                </h2>

                {business && (
                  <p className="mt-1 text-sm text-slate-500">
                    {business.business_name}
                    {business.city
                      ? ` • ${business.city}, ${business.state}`
                      : ""}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 p-7 sm:p-9">
            <label className="text-sm font-bold text-slate-950">
              Your rating
            </label>

            <div className="mt-5 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} out of 5`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="text-4xl transition hover:scale-110"
                >
                  <span
                    className={
                      star <= displayedRating
                        ? "text-amber-400"
                        : "text-slate-200"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs font-medium text-slate-400">
              {displayedRating === 0
                ? "Tap a star to rate your experience"
                : displayedRating === 5
                  ? "Excellent"
                  : displayedRating === 4
                    ? "Great"
                    : displayedRating === 3
                      ? "Good"
                      : displayedRating === 2
                        ? "Could be better"
                        : "Needs improvement"}
            </p>
          </div>

          <div className="p-7 sm:p-9">
            <div>
              <label
                htmlFor="review-title"
                className="text-sm font-bold text-slate-950"
              >
                Give your review a title
                <span className="ml-2 font-normal text-slate-400">
                  optional
                </span>
              </label>

              <input
                id="review-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={100}
                placeholder="What stood out?"
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="review-comment"
                className="text-sm font-bold text-slate-950"
              >
                Tell us about your experience
              </label>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                minLength={5}
                maxLength={1000}
                rows={6}
                placeholder="What did you enjoy? What should other travellers know?"
                className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />

              <div className="mt-2 flex justify-end">
                <span className="text-xs text-slate-400">
                  {comment.length}/1000
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                <p className="text-sm font-medium leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 w-full rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Publishing your review..."
                : "Publish review"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              Your review will be visible to other travellers after
              submission.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}