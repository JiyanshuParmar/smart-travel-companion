"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const BUSINESS_TYPES = [
  "Homestay",
  "Local Guide",
  "Food Experience",
  "Artisan",
  "Activity",
  "Transport",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BusinessRegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");

  const [form, setForm] = useState({
    businessName: "",
    businessType: "Homestay",
    shortDescription: "",
    description: "",
    phone: "",
    website: "",
    address: "",
    state: "",
    district: "",
    city: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/business/register");
        return;
      }

      setEmail(user.email ?? "");
      setLoadingUser(false);
    }

    loadUser();
  }, [router, supabase]);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (form.businessName.trim().length < 2) {
      setErrorMessage("Please enter a valid business name.");
      return;
    }

    if (form.state.trim().length < 2) {
      setErrorMessage("Please enter your state.");
      return;
    }

    if (form.city.trim().length < 2) {
      setErrorMessage("Please enter your city.");
      return;
    }

    setSubmitting(true);

    const generatedSlug =
      slugify(form.businessName) ||
      `business-${Date.now()}`;

    const { error } = await supabase.rpc(
      "create_business_profile",
      {
        p_business_name: form.businessName.trim(),
        p_business_type: form.businessType,
        p_description: form.description.trim() || null,
        p_short_description:
          form.shortDescription.trim() || null,
        p_phone: form.phone.trim() || null,
        p_email: email || null,
        p_website: form.website.trim() || null,
        p_address: form.address.trim() || null,
        p_state: form.state.trim(),
        p_district: form.district.trim() || null,
        p_city: form.city.trim(),
      }
    );

    if (error) {
      console.error(error);

      if (
        error.message
          .toLowerCase()
          .includes("already have a business")
      ) {
        setErrorMessage(
          "You already have a business profile."
        );
      } else {
        setErrorMessage(
          error.message ||
            "Something went wrong while creating your business profile."
        );
      }

      setSubmitting(false);
      return;
    }

    // generatedSlug is intentionally created here so the
    // public business URL can be added later.
    void generatedSlug;

    router.push("/business/dashboard");
    router.refresh();
  }

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-sm text-slate-500">
            Preparing your business workspace...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
              ST
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-slate-950">
                Smart Travel Companion
              </p>
              <p className="text-xs text-slate-500">
                Local partner onboarding
              </p>
            </div>
          </Link>

          <Link
            href="/business/dashboard"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          {/* Left */}
          <div className="lg:sticky lg:top-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Become a local partner
            </div>

            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Bring your local experience to more travellers.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Create your business profile and start showcasing
              your stay, experiences, activities, food, transport,
              or local expertise to travellers.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  number: "01",
                  title: "Create your profile",
                  text: "Tell travellers who you are and what you offer.",
                },
                {
                  number: "02",
                  title: "Add your listings",
                  text: "Publish rooms, tours, experiences, or activities.",
                },
                {
                  number: "03",
                  title: "Manage bookings",
                  text: "Track bookings and grow your local business.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">
                    {item.number}
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-950">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold text-slate-950">
                Business profile
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Tell us about your business
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your profile starts as a draft. You can add listings
                and publish them later.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >
              {/* Basic information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-950">
                  Basic information
                </h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Business name *
                    </label>

                    <input
                      required
                      value={form.businessName}
                      onChange={(event) =>
                        updateField(
                          "businessName",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Goa Coastal Homestay"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Business type *
                    </label>

                    <select
                      required
                      value={form.businessType}
                      onChange={(event) =>
                        updateField(
                          "businessType",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                    >
                      {BUSINESS_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Short description
                    </label>

                    <input
                      value={form.shortDescription}
                      onChange={(event) =>
                        updateField(
                          "shortDescription",
                          event.target.value
                        )
                      }
                      placeholder="A short introduction travellers will see first"
                      maxLength={160}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      About your business
                    </label>

                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        updateField(
                          "description",
                          event.target.value
                        )
                      }
                      rows={5}
                      placeholder="Tell travellers what makes your business special..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="border-t border-slate-100 pt-7">
                <h3 className="text-sm font-semibold text-slate-950">
                  Contact details
                </h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Phone
                    </label>

                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        updateField(
                          "phone",
                          event.target.value
                        )
                      }
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Website
                    </label>

                    <input
                      type="url"
                      value={form.website}
                      onChange={(event) =>
                        updateField(
                          "website",
                          event.target.value
                        )
                      }
                      placeholder="https://yourwebsite.com"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="border-t border-slate-100 pt-7">
                <h3 className="text-sm font-semibold text-slate-950">
                  Location
                </h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Address
                    </label>

                    <input
                      value={form.address}
                      onChange={(event) =>
                        updateField(
                          "address",
                          event.target.value
                        )
                      }
                      placeholder="Street, area, landmark"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      State *
                    </label>

                    <input
                      required
                      value={form.state}
                      onChange={(event) =>
                        updateField(
                          "state",
                          event.target.value
                        )
                      }
                      placeholder="Goa"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      District
                    </label>

                    <input
                      value={form.district}
                      onChange={(event) =>
                        updateField(
                          "district",
                          event.target.value
                        )
                      }
                      placeholder="North Goa"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      City *
                    </label>

                    <input
                      required
                      value={form.city}
                      onChange={(event) =>
                        updateField(
                          "city",
                          event.target.value
                        )
                      }
                      placeholder="Panaji"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                    />
                  </div>
                </div>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Submit */}
              <div className="border-t border-slate-100 pt-7">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Creating your business..."
                    : "Create business profile"}
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                  Your business profile will initially be saved
                  as a draft. You can add listings and publish
                  them from your dashboard.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}