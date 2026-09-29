import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

// ── Badge colour per role ─────────────────────────────────────
const roleBadge: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 border-red-200",
  BUSINESS: "bg-amber-100 text-amber-700 border-amber-200",
  TRAVELLER: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default async function ProfilePage() {
  // ── 1. Create the server Supabase client ──────────────────
  const supabase = await createClient();

  // ── 2. Verify identity server-side via getUser() ──────────
  // getUser() makes a network call to Supabase Auth to verify the JWT.
  // Never trust getSession() alone for authorization — it reads from
  // the cookie without re-verifying with the Auth server.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Not authenticated — redirect to login
    redirect("/login");
  }

  // ── 3. Fetch the profile using the verified user ID ────────
  // We use user.id (from the verified JWT), never a client-supplied value.
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name ?? user.email ?? "Traveller";
  const role = profile?.role ?? "TRAVELLER";
  const badgeClass = roleBadge[role] ?? roleBadge.TRAVELLER;

  // ── 4. Render ─────────────────────────────────────────────
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
            {/* Logo mark */}
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-700 via-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-105 transition-transform duration-200">
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
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                Smart Travel{" "}
                <span className="text-orange-600">Companion</span>
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

          <LogoutButton className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-orange-600 border border-stone-200 hover:border-orange-300 rounded-xl transition-all duration-200" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/60 border border-stone-100 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-700 via-orange-600 to-amber-400" />

            <div className="px-8 pt-8 pb-10 sm:px-10">
              {/* Avatar placeholder + name */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200/60 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-orange-600 select-none">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900 leading-tight">
                    {displayName}
                  </h1>
                  <span
                    className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}
                  >
                    {role}
                  </span>
                </div>
              </div>

              {/* Profile details */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-stone-100 bg-stone-50/60 divide-y divide-stone-100">
                  {/* Email */}
                  <div className="flex items-start gap-3 px-5 py-4">
                    <span className="mt-0.5 text-stone-400 flex-shrink-0">
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x={2} y={4} width={20} height={16} rx={2} />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                        Email
                      </p>
                      <p className="text-sm font-medium text-stone-800 mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Display name */}
                  <div className="flex items-start gap-3 px-5 py-4">
                    <span className="mt-0.5 text-stone-400 flex-shrink-0">
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx={12} cy={7} r={4} />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                        Display name
                      </p>
                      <p className="text-sm font-medium text-stone-800 mt-0.5">
                        {displayName}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-start gap-3 px-5 py-4">
                    <span className="mt-0.5 text-stone-400 flex-shrink-0">
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                        Account role
                      </p>
                      <p className="text-sm font-medium text-stone-800 mt-0.5">
                        {role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/"
                  className="flex-1 text-center py-3 px-4 rounded-xl text-sm font-medium
                    text-stone-700 border border-stone-200 hover:border-orange-300 hover:text-orange-600
                    transition-all duration-200"
                >
                  ← Back to home
                </Link>
                <LogoutButton className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold
                  text-white bg-stone-900 hover:bg-orange-600
                  transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-orange-500/20" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-stone-400 border-t border-stone-200/60">
        Smart Travel Companion · SIH 2026 · India-First AI Travel Platform
      </footer>
    </div>
  );
}
