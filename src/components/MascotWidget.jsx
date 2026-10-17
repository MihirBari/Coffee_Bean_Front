import React, { useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import BeanoMascot from './BeanoMascot';

export default function MascotWidget({ onExploreShop }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const tips = [
    {
      title: "50mg Exact Dose",
      text: "Each gummy provides an exact 50mg dose of pure caffeine—the strength of half a cup of artisanal brew in a single chew.",
      badge: "Caffeine Science"
    },
    {
      title: "Pocket Portability",
      text: "No paper cups, no boiling water, zero spills. Slip a canister into your pocket, vehicle console, or gym bag.",
      badge: "Convenience"
    },
    {
      title: "Real Arabica Extract",
      text: "Infused with genuine specialty roast extract, retaining natural aromatic oils and authentic coffee terroir.",
      badge: "Real Brew"
    },
    {
      title: "Three Distinct Roasts",
      text: "Classic for dark cocoa espresso, Vanilla for bourbon sweetness, and Latte for creamy oat milk comfort.",
      badge: "Flavors"
    }
  ];

  const handleNextTip = (e) => {
    e.stopPropagation();
    setTipIndex((prev) => (prev + 1) % tips.length);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      
      {/* Speech Popover Card */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] max-w-xs bg-[#1C1310]/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl p-4 shadow-2xl text-left animate-fade-in relative text-xs">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md bg-[#5A1217] text-[#F6F2E8]">
              {tips[tipIndex].badge}
            </span>
            <span className="text-[11px] font-medium text-[#D6A56E]">
              Béano's Note
            </span>
          </div>

          <h4 className="text-sm font-bold text-[#F6F2E8] mb-1">
            {tips[tipIndex].title}
          </h4>

          <p className="text-xs text-[#C7BCB3] leading-relaxed mb-4">
            {tips[tipIndex].text}
          </p>

          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/[0.08]">
            <button
              onClick={handleNextTip}
              className="text-[11px] text-[#D6A56E] hover:text-[#F6F2E8] transition-colors"
            >
              Next ({tipIndex + 1}/{tips.length})
            </button>

            {onExploreShop && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onExploreShop();
                }}
                className="px-3 py-1 rounded-lg bg-[#5A1217] hover:bg-[#6E161C] text-[#F6F2E8] text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Shop</span>
                <ArrowRight className="w-3 h-3 text-[#D6A56E]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#201714] border border-white/[0.12] hover:border-[#D6A56E]/50 rounded-full px-3 py-1.5 shadow-xl transition-all duration-200 active:scale-95 group"
        title="Béano Mascot Guide"
      >
        <div className="w-6 h-7 flex-shrink-0 flex items-center justify-center">
          <BeanoMascot className="w-full h-full" strokeColor="#D6A56E" />
        </div>
        <span className="text-xs font-semibold text-[#F6F2E8] group-hover:text-[#D6A56E] transition-colors pr-1">
          {isOpen ? 'Close' : 'Ask Béano'}
        </span>
      </button>

    </div>
  );
}
