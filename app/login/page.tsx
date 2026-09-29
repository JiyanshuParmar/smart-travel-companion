"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ── Types ────────────────────────────────────────────────────
interface FormValues {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

// ── Validation ───────────────────────────────────────────────
function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

// ── Icons ─────────────────────────────────────────────────────
function CompassIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx={12} cy={12} r={10} />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  ) : (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1={1} y1={1} x2={23} y2={23} />
    </svg>
  );
}

// ── Reusable Field ─────────────────────────────────────────────
interface FieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
  showToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
  disabled,
  showToggle,
  showPassword,
  onTogglePassword,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showToggle ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full px-4 py-3 rounded-xl border text-stone-900 placeholder-stone-400 text-sm
            bg-white transition-all duration-150 outline-none
            focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400
            disabled:opacity-60 disabled:cursor-not-allowed
            ${
              error
                ? "border-red-400 focus:ring-red-300/30 focus:border-red-400"
                : "border-stone-200 hover:border-stone-300"
            }`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <EyeIcon open={!!showPassword} />
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600 flex items-center gap-1">
          <span aria-hidden="true">✕</span> {error}
        </p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();

  const [values, setValues] = useState<FormValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function set(field: keyof FormValues) {
    return (v: string) => {
      setValues((prev) => ({ ...prev, [field]: v }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setServerError(null);
    };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });

      if (error) {
        const msg = error.message.toLowerCase();

        if (
          msg.includes("invalid login credentials") ||
          msg.includes("invalid password") ||
          msg.includes("user not found") ||
          msg.includes("email not found")
        ) {
          setServerError(
            "Incorrect email or password. Please check your credentials and try again."
          );
        } else if (msg.includes("email not confirmed")) {
          setServerError(
            "Your email address has not been confirmed yet. Please check your inbox for the confirmation link."
          );
        } else if (
          msg.includes("rate limit") ||
          msg.includes("too many requests") ||
          msg.includes("too many")
        ) {
          setServerError(
            "Too many login attempts. Please wait a few minutes and try again."
          );
        } else if (
          msg.includes("network") ||
          msg.includes("fetch") ||
          msg.includes("failed to fetch")
        ) {
          setServerError(
            "A network error occurred. Please check your connection and try again."
          );
        } else {
          setServerError(
            error.message || "Something went wrong. Please try again."
          );
        }
        return;
      }

      // Successful login → navigate to profile
      router.push("/profile");
      router.refresh(); // refresh server component cache so profile page reads the new session
    } catch {
      setServerError(
        "A network error occurred. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Minimal header */}
      <header className="w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-stone-900 group"
            aria-label="Smart Travel Companion Home"
          >
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-700 via-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-105 transition-transform duration-200">
              <CompassIcon />
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                Smart Travel <span className="text-orange-600">Companion</span>
              </span>
              <div className="flex items-center gap-1.5 -mt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase text-stone-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  India-First AI
                </span>
                <span className="text-stone-300 text-[10px]">•</span>
                <span className="text-[10px] font-medium text-amber-700/80">SIH 2026</span>
              </div>
            </div>
          </Link>

          <Link
            href="/register"
            className="text-sm font-medium text-stone-600 hover:text-orange-600 transition-colors"
          >
            New here?{" "}
            <span className="font-semibold text-orange-600">Create account</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/60 border border-stone-100 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-700 via-orange-600 to-amber-400" />

            <div className="px-8 pt-8 pb-10 sm:px-10">
              {/* Heading */}
              <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold text-stone-900 leading-tight">
                  Welcome back
                </h1>
                <p className="mt-2 text-sm text-stone-500">
                  Continue your journey across incredible India.
                </p>
              </div>

              {/* Server error */}
              {serverError && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 px-4 py-4 text-sm text-red-700"
                >
                  <span className="mt-0.5 flex-shrink-0">⚠</span>
                  <p>{serverError}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <Field
                  id="email"
                  label="Email address"
                  type="email"
                  value={values.email}
                  onChange={set("email")}
                  error={errors.email}
                  autoComplete="email"
                  placeholder="arjun@example.com"
                  disabled={isLoading}
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-stone-700"
                    >
                      Password
                    </label>
                    {/* Forgot password — visually present, not yet implemented */}
                    <span
                      title="Password reset coming soon"
                      className="text-xs text-stone-400 cursor-not-allowed select-none"
                      aria-label="Forgot password? (not yet available)"
                    >
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={(e) => set("password")(e.target.value)}
                      autoComplete="current-password"
                      placeholder="Your password"
                      disabled={isLoading}
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                      className={`w-full px-4 py-3 rounded-xl border text-stone-900 placeholder-stone-400 text-sm
                        bg-white transition-all duration-150 outline-none
                        focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400
                        disabled:opacity-60 disabled:cursor-not-allowed
                        ${
                          errors.password
                            ? "border-red-400 focus:ring-red-300/30 focus:border-red-400"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      id="password-error"
                      className="text-xs text-red-600 flex items-center gap-1"
                    >
                      <span aria-hidden="true">✕</span> {errors.password}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white
                      bg-stone-900 hover:bg-orange-600
                      disabled:opacity-60 disabled:cursor-not-allowed
                      transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-orange-500/20
                      focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx={12}
                            cy={12}
                            r={10}
                            stroke="currentColor"
                            strokeWidth={4}
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3V4a8 8 0 00-8 8h4z"
                          />
                        </svg>
                        Signing in…
                      </span>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-stone-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>

      {/* Footer note */}
      <footer className="py-6 text-center text-xs text-stone-400 border-t border-stone-200/60">
        Smart Travel Companion · SIH 2026 · India-First AI Travel Platform
      </footer>
    </div>
  );
}
