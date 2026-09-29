"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

interface BookingFormProps {
  listingId: string;
  price: number;
  pricingUnit: string;
  maxGuests: number;
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  return date.toISOString().split("T")[0];
}

export default function BookingForm({
  listingId,
  price,
  pricingUnit,
  maxGuests,
}: BookingFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [bookingDate, setBookingDate] = useState(getTomorrow());
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(() => {
    if (pricingUnit === "PER_PERSON") {
      return price * guests;
    }

    return price;
  }, [price, guests, pricingUnit]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!bookingDate) {
      setError("Please select a booking date.");
      return;
    }

    if (guests < 1) {
      setError("At least one guest is required.");
      return;
    }

    if (guests > maxGuests) {
      setError(
        `This experience accepts a maximum of ${maxGuests} guests.`
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?redirect=/book/${listingId}`);
        return;
      }

      const { data, error: rpcError } =
        await supabase.rpc("create_booking", {
          p_listing_id: listingId,
          p_booking_date: bookingDate,
          p_guests: guests,
          p_notes: notes.trim() || null,
        });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      if (!data) {
        throw new Error("Booking could not be created.");
      }

      router.push(`/bookings/${data}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating your booking."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <label
          htmlFor="booking-date"
          className="text-sm font-semibold text-slate-900"
        >
          Choose your date
        </label>

        <p className="mt-1 text-xs text-slate-500">
          Select when you want to experience this activity.
        </p>

        <input
          id="booking-date"
          type="date"
          value={bookingDate}
          min={getTomorrow()}
          onChange={(event) => setBookingDate(event.target.value)}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          required
        />
      </div>

      <div className="mt-7">
        <label
          htmlFor="guests"
          className="text-sm font-semibold text-slate-900"
        >
          Number of guests
        </label>

        <p className="mt-1 text-xs text-slate-500">
          Maximum {maxGuests}{" "}
          {maxGuests === 1 ? "guest" : "guests"}.
        </p>

        <div className="mt-3 flex items-center rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() =>
              setGuests((value) => Math.max(1, value - 1))
            }
            disabled={guests <= 1}
            className="flex h-12 w-12 items-center justify-center text-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>

          <div className="flex flex-1 items-center justify-center text-sm font-semibold text-slate-950">
            {guests} {guests === 1 ? "guest" : "guests"}
          </div>

          <button
            type="button"
            onClick={() =>
              setGuests((value) =>
                Math.min(maxGuests, value + 1)
              )
            }
            disabled={guests >= maxGuests}
            className="flex h-12 w-12 items-center justify-center text-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-7">
        <label
          htmlFor="booking-notes"
          className="text-sm font-semibold text-slate-900"
        >
          Notes for your host
          <span className="ml-1 font-normal text-slate-400">
            optional
          </span>
        </label>

        <textarea
          id="booking-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Anything your local host should know?"
          className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <div className="mt-8 rounded-2xl bg-slate-50 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {formatInr(price)} ×{" "}
            {pricingUnit === "PER_PERSON"
              ? `${guests} guest${guests === 1 ? "" : "s"}`
              : "booking"}
          </span>

          <span className="font-semibold text-slate-950">
            {formatInr(total)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="font-semibold text-slate-900">
            Total
          </span>

          <span className="text-xl font-semibold text-slate-950">
            {formatInr(total)}
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium leading-6 text-red-700">
            {error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Creating booking..."
          : "Continue to booking →"}
      </button>

      <p className="mt-3 text-center text-xs leading-5 text-slate-400">
        No payment is taken at this step.
      </p>
    </form>
  );
}