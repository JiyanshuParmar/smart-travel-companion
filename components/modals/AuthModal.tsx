"use client";

import React from "react";
import { XIcon, CompassIcon } from "../icons";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  initialMode: "login" | "signup";
  onClose: () => void;
}

export default function AuthModal({
  isOpen,
  initialMode,
  onClose,
}: AuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  function handleContinue() {
    onClose();

    if (initialMode === "login") {
      router.push("/login");
    } else {
      router.push("/register");
    }
  }

  function handleSwitch() {
    onClose();

    if (initialMode === "login") {
      router.push("/register");
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close dialog"
          >
            <XIcon size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <CompassIcon size={18} />
            </span>

            <span className="font-serif font-bold text-lg">
              Smart Travel Companion
            </span>
          </div>

          <h3 className="text-xl font-bold font-serif">
            {initialMode === "login"
              ? "Welcome Back Explorer"
              : "Join the Community Scout Portal"}
          </h3>

          <p className="text-stone-300 text-xs mt-1">
            Access curated routes, saved itineraries, local discoveries, and
            direct host bookings.
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-center py-5">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-5">
              <CompassIcon size={28} />
            </div>

            {/* Heading */}
            <h4 className="text-lg font-bold text-stone-900">
              {initialMode === "login"
                ? "Sign in to your journey"
                : "Create your travel account"}
            </h4>

            <p className="text-sm text-stone-500 leading-relaxed mt-2 max-w-sm mx-auto">
              {initialMode === "login"
                ? "Sign in to access your profile, saved trips, bookings, and personalized travel plans."
                : "Create your account to save trips, discover local places, and build personalized journeys across India."}
            </p>

            {/* Continue button */}
            <button
              type="button"
              onClick={handleContinue}
              className="w-full mt-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-colors shadow-sm"
            >
              {initialMode === "login"
                ? "Continue to Sign In"
                : "Continue to Create Account"}
            </button>

            {/* Switch mode */}
            <button
              type="button"
              onClick={handleSwitch}
              className="mt-4 text-xs text-orange-600 font-semibold hover:underline"
            >
              {initialMode === "login"
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </button>

            {/* Security note */}
            <p className="mt-5 text-[11px] text-stone-400">
              Your account is securely managed through Supabase authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}