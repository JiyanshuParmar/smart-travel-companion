"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  onOpenListBusiness?: () => void;
  onOpenAuth?: (...args: never[]) => void;
}

type Profile = {
  display_name: string | null;
  role: "TRAVELLER" | "BUSINESS" | "ADMIN";
};

export default function Navbar({
  onOpenAuth,
}: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setProfile(null);
        setUserEmail(null);
        setLoading(false);
        return;
      }

      setUserEmail(user.email ?? null);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      setProfile(profileData as Profile | null);
      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();

    setProfile(null);
    setUserEmail(null);
    setMobileOpen(false);

    router.push("/");
    router.refresh();
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const displayName =
    profile?.display_name?.trim() ||
    userEmail?.split("@")[0] ||
    "Traveller";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "T";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-black text-white shadow-lg shadow-cyan-500/20 transition-transform duration-200 group-hover:scale-105">
            S
          </div>

          <div className="hidden sm:block">
            <div className="text-sm font-semibold tracking-[0.18em] text-cyan-300">
              SMART TRAVEL
            </div>

            <div className="text-base font-bold text-white">
              Companion
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          <Link
            href="/places"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Explore
          </Link>

          <Link
            href="/#planner"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Plan Trip
          </Link>

          <Link
            href="/#businesses"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Local Businesses
          </Link>

          <Link
            href="/#community"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Community
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {!loading && profile ? (
            <>
              {profile.role === "BUSINESS" ||
              profile.role === "ADMIN" ? (
                <Link
                  href="/business/dashboard"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Business Dashboard
                </Link>
              ) : (
                <Link
                  href="/business/register"
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/15"
                >
                  Become a Partner
                </Link>
              )}

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-bold text-white">
                  {initials}
                </div>

                <span className="max-w-28 truncate text-sm font-medium text-slate-200">
                  {displayName}
                </span>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="ml-1 text-xs font-semibold text-slate-400 transition hover:text-white"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/business/register"
                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/15"
              >
                Become a Partner
              </Link>

              {onOpenAuth ? (
                <button
                  type="button"
                  onClick={() => onOpenAuth()}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
                >
                  Sign in
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
                >
                  Sign in
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 lg:hidden">
          {!loading && profile ? (
            <Link
              href={
                profile.role === "BUSINESS" ||
                profile.role === "ADMIN"
                  ? "/business/dashboard"
                  : "/profile"
              }
              onClick={closeMobileMenu}
              aria-label="Open profile"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold text-white"
            >
              {initials}
            </Link>
          ) : (
            <Link
              href="/business/register"
              onClick={closeMobileMenu}
              className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-200"
            >
              Partner
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className="text-xl">
              {mobileOpen ? "×" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950 px-4 py-5 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            <Link
              href="/places"
              onClick={closeMobileMenu}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
            >
              Explore
            </Link>

            <Link
              href="/#planner"
              onClick={closeMobileMenu}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
            >
              Plan Trip
            </Link>

            <Link
              href="/#businesses"
              onClick={closeMobileMenu}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
            >
              Local Businesses
            </Link>

            <Link
              href="/#community"
              onClick={closeMobileMenu}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
            >
              Community
            </Link>

            <div className="my-2 h-px bg-white/10" />

            {!loading && profile ? (
              <>
                {profile.role === "BUSINESS" ||
                profile.role === "ADMIN" ? (
                  <Link
                    href="/business/dashboard"
                    onClick={closeMobileMenu}
                    className="rounded-2xl bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15"
                  >
                    Business Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/business/register"
                    onClick={closeMobileMenu}
                    className="rounded-2xl bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15"
                  >
                    Become a Local Partner
                  </Link>
                )}

                <Link
                  href="/profile"
                  onClick={closeMobileMenu}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
                >
                  My Profile
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-300 transition hover:bg-red-400/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/business/register"
                  onClick={closeMobileMenu}
                  className="rounded-2xl bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15"
                >
                  Become a Local Partner
                </Link>

                {onOpenAuth ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      onOpenAuth();
                    }}
                    className="rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold text-slate-950"
                  >
                    Sign in
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950"
                  >
                    Sign in
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}