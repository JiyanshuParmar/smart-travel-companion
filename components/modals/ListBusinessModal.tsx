"use client";

import React, { useState } from "react";
import { XIcon, StoreIcon, ShieldCheckIcon, CheckIcon } from "../icons";
import { BUSINESS_CATEGORIES, BusinessCategory } from "../../data/businesses";

interface ListBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ListBusinessModal({ isOpen, onClose }: ListBusinessModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<BusinessCategory>("Homestay");
  const [location, setLocation] = useState("");
  const [hostName, setHostName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setBusinessName("");
    setLocation("");
    setHostName("");
    setPhone("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 sm:p-8 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close dialog"
          >
            <XIcon size={18} />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/90 text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <StoreIcon size={14} />
            Grassroots Merchant Portal
          </div>
          <h3 className="text-2xl font-serif font-bold">List Your Local Business</h3>
          <p className="text-stone-300 text-xs sm:text-sm mt-1">
            Empower your homestay, craft loom, or guiding enterprise with direct subcontinental traveller connections.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckIcon size={32} />
              </div>
              <h4 className="text-xl font-bold font-serif text-stone-900">
                Application Received (Demo Preview)
              </h4>
              <p className="text-stone-600 text-sm max-w-md mx-auto">
                Thank you, <strong>{hostName || "Host"}</strong>! In the live version, our regional verification field team will contact you at <strong>{phone || "your number"}</strong> within 24 hours to schedule verification.
              </p>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left">
                <strong>SIH 2026 Commitment:</strong> Smart Travel Companion supports 100% fair host retention with zero middleman deductions.
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Business / Experience Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Ancestral Cashew Grove Homestay"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 font-medium"
                  >
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Location &amp; State *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mandovi Valley, Goa"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Host / Artisan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    WhatsApp / Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  What makes your experience authentic?
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your family recipe, traditional loom, or local walking route..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2 text-xs text-stone-600">
                <ShieldCheckIcon size={16} className="text-emerald-600 shrink-0" />
                <span>Zero commission lock-in • 100% direct guest settlement</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs"
                >
                  Submit Application (Demo)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
