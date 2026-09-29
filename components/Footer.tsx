import React from "react";
import Link from "next/link";
import { CompassIcon } from "./icons";

interface FooterProps {
  onOpenListBusiness?: () => void;
  onOpenShareModal?: () => void;
}

export default function Footer({ onOpenListBusiness, onOpenShareModal }: FooterProps) {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800/80">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 text-white">
              <span className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                <CompassIcon size={20} />
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight">
                Smart Travel <span className="text-orange-500">Companion</span>
              </span>
            </Link>

            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              India-first AI travel planning and local discovery platform. Built for conscious explorers to uncover generational secrets, support authentic grassroots businesses, and discover India beyond the guidebooks.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-xs text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Smart India Hackathon 2026 Initiative</span>
            </div>
          </div>

          {/* Column 1: Navigation & Discovery */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Explore India
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <a href="#destinations" className="hover:text-orange-400 transition-colors">
                  Goa Estuaries
                </a>
              </li>
              <li>
                <a href="#destinations" className="hover:text-orange-400 transition-colors">
                  Kerala Backwaters
                </a>
              </li>
              <li>
                <a href="#destinations" className="hover:text-orange-400 transition-colors">
                  Rajasthan Havelis
                </a>
              </li>
              <li>
                <a href="#destinations" className="hover:text-orange-400 transition-colors">
                  Himachal Pine Valleys
                </a>
              </li>
              <li>
                <a href="#destinations" className="hover:text-orange-400 transition-colors">
                  Meghalaya Root Bridges
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Planner & Businesses */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <a href="#planner" className="hover:text-orange-400 transition-colors">
                  AI Trip Planner
                </a>
              </li>
              <li>
                <a href="#itinerary-preview" className="hover:text-orange-400 transition-colors">
                  Itinerary Preview
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenListBusiness}
                  className="hover:text-orange-400 transition-colors text-left"
                >
                  List Your Business
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenShareModal}
                  className="hover:text-orange-400 transition-colors text-left"
                >
                  Share a Hidden Place
                </button>
              </li>
              <li>
                <a href="#businesses" className="hover:text-orange-400 transition-colors">
                  Local Marketplace
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Initiative
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <span className="text-stone-300">About Smart Travel</span>
              </li>
              <li>
                <span className="text-stone-300">Responsible Travel Code</span>
              </li>
              <li>
                <span className="text-stone-300">Contact Team</span>
              </li>
              <li>
                <span className="text-stone-300">Privacy Policy</span>
              </li>
              <li>
                <span className="text-stone-300">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 Smart Travel Companion • SIH 2026. Made with pride for incredible India.</p>
          <div className="flex items-center gap-6">
            <span>Dynamic ₹ Calibration</span>
            <span>Zero Data Monopolies</span>
            <span>Verified Local Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
