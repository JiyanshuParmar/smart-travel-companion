"use client";

import React, { Suspense, useState } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import TripPlanner from "../components/TripPlanner";
import DestinationGrid from "../components/DestinationGrid";
import DiscoverySection from "../components/DiscoverySection";
import ItineraryPreview from "../components/ItineraryPreview";
import BusinessMarketplace from "../components/BusinessMarketplace";
import CommunitySection from "../components/CommunitySection";
import TrustSection from "../components/TrustSection";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

// Modals
import ListBusinessModal from "../components/modals/ListBusinessModal";
import SharePlaceModal from "../components/modals/SharePlaceModal";
import AuthModal from "../components/modals/AuthModal";

function TripPlannerFallback() {
  return (
    <section
      id="planner"
      className="py-12 sm:py-16 scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-stone-200/90 shadow-xl shadow-stone-200/50 overflow-hidden animate-pulse">
          <div className="bg-stone-900 px-6 py-8 sm:px-10 sm:py-10">
            <div className="h-4 w-48 bg-white/10 rounded mb-4" />
            <div className="h-10 w-72 bg-white/10 rounded" />
            <div className="h-4 w-80 bg-white/10 rounded mt-3" />
          </div>

          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-24 rounded-2xl bg-stone-100" />
              <div className="h-24 rounded-2xl bg-stone-100" />
              <div className="h-24 rounded-2xl bg-stone-100" />
            </div>

            <div className="h-20 rounded-2xl bg-stone-100 mt-8" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [isListBusinessOpen, setIsListBusinessOpen] =
    useState(false);

  const [isSharePlaceOpen, setIsSharePlaceOpen] =
    useState(false);

  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: "login" | "signup";
  }>({
    isOpen: false,
    mode: "login",
  });

  const handleOpenAuth = (mode: "login" | "signup") => {
    setAuthModalState({
      isOpen: true,
      mode,
    });
  };

  const handleCloseAuth = () => {
    setAuthModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 overflow-x-hidden">
      {/* 1. Navigation */}
      <Navbar
        onOpenListBusiness={() =>
          setIsListBusinessOpen(true)
        }
        onOpenAuth={handleOpenAuth}
      />

      <main className="flex-1 w-full">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. AI Trip Planner */}
        <Suspense fallback={<TripPlannerFallback />}>
          <TripPlanner />
        </Suspense>

        {/* 4. Popular Destinations */}
        <DestinationGrid />

        {/* 5. Discover The Places Tourists Miss */}
        <DiscoverySection />

        {/* 6. AI Itinerary Preview */}
        <ItineraryPreview />

        {/* 7. Local Business Marketplace */}
        <BusinessMarketplace
          onOpenListModal={() =>
            setIsListBusinessOpen(true)
          }
        />

        {/* 8. Community Discovery */}
        <CommunitySection
          onOpenShareModal={() =>
            setIsSharePlaceOpen(true)
          }
        />

        {/* 9. Trust / Value Section */}
        <TrustSection />

        {/* 10. Final CTA */}
        <FinalCTA />
      </main>

      {/* 11. Footer */}
      <Footer
        onOpenListBusiness={() =>
          setIsListBusinessOpen(true)
        }
        onOpenShareModal={() =>
          setIsSharePlaceOpen(true)
        }
      />

      {/* Interactive Modals */}
      <ListBusinessModal
        isOpen={isListBusinessOpen}
        onClose={() =>
          setIsListBusinessOpen(false)
        }
      />

      <SharePlaceModal
        isOpen={isSharePlaceOpen}
        onClose={() =>
          setIsSharePlaceOpen(false)
        }
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={handleCloseAuth}
      />
    </div>
  );
}