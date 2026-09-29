"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

interface BusinessBookingActionsProps {
  bookingId: string;
}

export default function BusinessBookingActions({
  bookingId,
}: BusinessBookingActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState<
    "confirm" | "cancel" | null
  >(null);

  const [error, setError] = useState("");

  const manageBooking = async (
    decision: "CONFIRM" | "CANCEL"
  ) => {
    setError("");

    setLoading(
      decision === "CONFIRM" ? "confirm" : "cancel"
    );

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const { error: rpcError } = await supabase.rpc(
        "manage_booking",
        {
          p_booking_id: bookingId,
          p_decision: decision,
        }
      );

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => manageBooking("CONFIRM")}
          disabled={loading !== null}
          className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "confirm"
            ? "Confirming..."
            : "Confirm booking"}
        </button>

        <button
          type="button"
          onClick={() => manageBooking("CANCEL")}
          disabled={loading !== null}
          className="flex-1 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "cancel"
            ? "Cancelling..."
            : "Cancel booking"}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs font-medium leading-5 text-red-700">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}