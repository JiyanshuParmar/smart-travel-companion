"use client";

import React, { useState } from "react";
import { XIcon, SparklesIcon, CheckIcon, CameraIcon } from "../icons";

interface SharePlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SharePlaceModal({ isOpen, onClose }: SharePlaceModalProps) {
  const [placeName, setPlaceName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Hidden Places");
  const [description, setDescription] = useState("");
  const [scoutName, setScoutName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setPlaceName("");
    setLocation("");
    setDescription("");
    setScoutName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-6 sm:p-8 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close dialog"
          >
            <XIcon size={18} />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/90 text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <SparklesIcon size={14} />
            Community Scout Network
          </div>
          <h3 className="text-2xl font-serif font-bold">Share a Hidden Place</h3>
          <p className="text-stone-300 text-xs sm:text-sm mt-1">
            Contribute an authentic viewpoint, generational eatery, or tranquil estuary that preserves regional heritage.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckIcon size={32} />
              </div>
              <h4 className="text-xl font-bold font-serif text-stone-900">
                Discovery Submitted! (Demo Mode)
              </h4>
              <p className="text-stone-600 text-sm max-w-md mx-auto">
                Thank you for contributing <strong>{placeName || "your hidden place"}</strong>! In the production release, submissions are vetted by local community scouts before appearing on the public subcontinental map.
              </p>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left">
                <strong>Responsible Tourism Note:</strong> Sensitive ecological regions and indigenous tribal territories are protected with strict non-disclosure safeguards.
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
                  Place / Secret Spot Name *
                </label>
                <input
                  type="text"
                  required
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="e.g. Gurez Valley Shepherd Ridge Meadow"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Location &amp; District *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bandipora, Kashmir"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 font-medium"
                  >
                    <option value="Hidden Places">Hidden Places</option>
                    <option value="Local Food">Local Food</option>
                    <option value="Homestays">Homestays</option>
                    <option value="Culture">Culture</option>
                    <option value="Adventure">Adventure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Why is this special? (Secret backstory) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what makes this place unique, how to reach respectfully, and what travellers must know..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Your Name / Scout Alias *
                  </label>
                  <input
                    type="text"
                    required
                    value={scoutName}
                    onChange={(e) => setScoutName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Photo Attachment (Demo)
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 border border-dashed border-stone-300 rounded-xl text-xs text-stone-500 bg-stone-50 cursor-pointer">
                    <CameraIcon size={16} className="text-stone-400" />
                    <span>Upload scenic photograph</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
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
                  Submit Hidden Place (Demo)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
