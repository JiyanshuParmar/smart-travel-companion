"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SubmitListingButtonProps {
  listingId: string;
  status: string;
}

export default function SubmitListingButton({
  listingId,
  status,
}: SubmitListingButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/business/listings");
        return;
      }

      const { error: rpcError } = await supabase.rpc(
        "submit_listing_for_review",
        {
          p_listing_id: listingId,
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
          : "Something went wrong while submitting the listing."
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
        Under review
      </span>
    );
  }

  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        Approved
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Submitting..."
          : status === "REJECTED"
            ? "Resubmit for review"
            : "Submit for review"}
      </button>

      {error && (
        <p className="max-w-xs text-right text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}