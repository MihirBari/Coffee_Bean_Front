import React, { useState } from 'react';
import BrandLogo from './BrandLogo';
import BeanoMascot, { BeanoSeal } from './BeanoMascot';
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Leaf, 
  Coffee, 
  ShieldCheck, 
  Clock, 
  Compass, 
  Layers, 
  Package,
  Heart,
  ExternalLink
} from 'lucide-react';

export default function StoryLanding({ onExploreShop }) {
  const [selectedCanister, setSelectedCanister] = useState('classic');

  const canisterVariants = {
    classic: {
      name: "Classic Coffee Gummies",
      flavor: "Deep Roasted Espresso",
      tinColor: "bg-[#4A2E27]",
      tinBorder: "border-[#A5BCD6]",
      labelColor: "bg-[#A5BCD6] text-[#231815]",
      desc: "The authentic richness, comforting warmth, and bold character of a dark roast brew condensed into a chewable bite.",
      caffeine: "50mg per gummy",
      count: "5 Gummies / 40g (1.13 oz)",
      tag: "Original Discipline"
    },
    vanilla: {
      name: "Vanilla Coffee Gummies",
      flavor: "Madagascar Bourbon Vanilla",
      tinColor: "bg-[#A5BCD6]",
      tinBorder: "border-[#F5EFC6]",
      labelColor: "bg-[#F5EFC6] text-[#231815]",
      desc: "Delicate floral bourbon vanilla beans folded seamlessly with gentle morning roast notes. Silky, smooth, and aromatic.",
      caffeine: "50mg per gummy",
      count: "5 Gummies / 40g (1.13 oz)",
      tag: "Smooth & Delicate"
    },
    latte: {
      name: "Latte Coffee Gummies",
      flavor: "Creamy Café Latte",
      tinColor: "bg-[#F5EFC6]",
      tinBorder: "border-[#4A2E27]",
      labelColor: "bg-[#4A2E27] text-[#F5EFC6]",
      desc: "Rich espresso paired with creamy oat milk sweetness. An indulgent coffeehouse classic ready right inside your pocket.",
      caffeine: "50mg per gummy",
      count: "5 Gummies / 40g (1.13 oz)",
      tag: "Creamy Indulgence"
    }
  };

  const paletteColors = [
    { name: 'Transparent Yellow', hex: 'F5EFC6', rgb: '245, 239, 198', cmyk: '4% 3% 25% 0%', bg: '#F5EFC6', text: '#231815', role: 'Warm parchment & crema highlights' },
    { name: 'Potting Soil', hex: '4A2E27', rgb: '74, 46, 39', cmyk: '51% 66% 68% 52%', bg: '#4A2E27', text: '#F5EFC6', role: 'Rich roasted bean brown & card borders' },
    { name: 'Cerulean Blue', hex: 'A5BCD6', rgb: '165, 188, 214', cmyk: '36% 14% 0% 16%', bg: '#A5BCD6', text: '#231815', role: 'Muted craft paper tone & accent badges' },
    { name: 'Java Brown', hex: '231815', rgb: '35, 24, 21', cmyk: '59% 68% 66% 76%', bg: '#231815', text: '#F5EFC6', role: 'Deep espresso backdrop & contrast' },
    { name: 'Sceptre Red', hex: '4D0E12', rgb: '74, 14, 18', cmyk: '38% 96% 85% 48%', bg: '#4D0E12', text: '#F5EFC6', role: 'Deep oxblood CTA buttons & action states' }
  ];

  return (
    <div className="bg-[#231815] text-[#F5EFC6] min-h-screen selection:bg-[#4D0E12] selection:text-[#F5EFC6]">
      
      {/* =========================================================================
          1. HERO SECTION: THE BEAN CO. & CHEW THE BREW
         ========================================================================= */}
      <section className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 border-b border-[#4A2E27] paper-crease-h">
        {/* Subtle Textured Background & Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#4A2E27]/40 via-[#231815] to-[#18100E] z-0" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F5EFC6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto py-12 sm:py-20 lg:py-24 text-center">
          
          {/* Brand Logo Dot-Matrix Mark */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-20 sm:w-24 sm:h-28 rounded-3xl bg-[#18100E] border-2 border-[#A5BCD6]/40 p-3 sm:p-4 shadow-2xl flex items-center justify-center backdrop-blur-md hover:scale-105 transition-transform duration-300">
              <BrandLogo className="w-full h-full" variant="cream" />
            </div>
          </div>

          {/* Eyebrow Pill */}
          <div className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-[#4D0E12] border border-[#F5EFC6]/30 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-subhead font-bold tracking-widest uppercase text-[#F5EFC6] mb-6 sm:mb-8 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A5BCD6]" />
            <span>The Bean Co.</span>
            <span className="text-[#A5BCD6]">•</span>
            <span>Plant-Based Caffeine</span>
          </div>

          {/* Main Giant Tagline Display */}
          <h1 className="font-headline font-black text-4xl xs:text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#F5EFC6] leading-[1.05] uppercase mb-5 sm:mb-6">
            CHEW THE <br />
            <span className="text-[#A5BCD6]">BREW</span>
          </h1>

          {/* Subtext Paragraph */}
          <p className="max-w-3xl mx-auto font-body text-sm sm:text-lg lg:text-xl text-[#F5EFC6]/90 leading-relaxed mb-8 sm:mb-10 px-2">
            Coffee, reimagined. We take the familiar richness, character, and ritual of a classic brew 
            and transform it into something unexpected, playful, and effortlessly modern: 
            <strong className="text-[#F5EFC6] font-bold"> a plant-based coffee gummy you can chew.</strong>
          </p>

          {/* CTAs & Floating Seal */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 px-4 sm:px-0">
            <button
              onClick={onExploreShop}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-black text-xs sm:text-base tracking-wider uppercase border border-[#F5EFC6]/40 shadow-2xl flex items-center justify-center space-x-2 sm:space-x-3 group transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Shop Coffee Gummies</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#A5BCD6] group-hover:translate-x-1.5 transition-transform" />
            </button>

            <a
              href="#project-vision"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#2F201C] hover:bg-[#4A2E27] text-[#F5EFC6] font-subhead font-bold text-xs sm:text-sm tracking-wider uppercase border border-[#4A2E27] transition-all flex items-center justify-center space-x-2"
            >
              <Compass className="w-4 h-4 text-[#A5BCD6]" />
              <span>Explore Brand Vision</span>
            </a>
          </div>

          {/* Key Specs Pill Bar */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto font-subhead">
            <div className="bg-[#18100E]/80 border border-[#4A2E27] rounded-2xl p-3 sm:p-4 text-center">
              <span className="text-xl sm:text-2xl font-headline font-black text-[#A5BCD6] block">50mg</span>
              <span className="text-[10px] sm:text-[11px] text-[#F5EFC6]/70 uppercase tracking-wider">Caffeine Per Gummy</span>
            </div>
            <div className="bg-[#18100E]/80 border border-[#4A2E27] rounded-2xl p-3 sm:p-4 text-center">
              <span className="text-xl sm:text-2xl font-headline font-black text-[#F5EFC6] block">5 Gummies</span>
              <span className="text-[10px] sm:text-[11px] text-[#F5EFC6]/70 uppercase tracking-wider">Per Pocket Tin</span>
            </div>
            <div className="bg-[#18100E]/80 border border-[#4A2E27] rounded-2xl p-3 sm:p-4 text-center">
              <span className="text-xl sm:text-2xl font-headline font-black text-emerald-300 block">100% Plant</span>
              <span className="text-[10px] sm:text-[11px] text-[#F5EFC6]/70 uppercase tracking-wider">Pectin Based</span>
            </div>
            <div className="bg-[#18100E]/80 border border-[#4A2E27] rounded-2xl p-3 sm:p-4 text-center">
              <span className="text-xl sm:text-2xl font-headline font-black text-[#A5BCD6] block">Real Coffee</span>
              <span className="text-[10px] sm:text-[11px] text-[#F5EFC6]/70 uppercase tracking-wider">Specialty Extract</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. PROJECT VISION SECTION (Styled on Cerulean Folded Paper)
         ========================================================================= */}
      <section id="project-vision" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#A5BCD6] text-[#231815] paper-crease-h paper-crease-v border-b border-[#4A2E27]">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 border-b-2 border-[#231815]/20 pb-4 flex items-center justify-between">
            <span className="font-subhead font-bold text-xs sm:text-sm tracking-[0.25em] uppercase text-[#4A2E27]">
              PROJECT VISION
            </span>
            <span className="font-mono text-xs text-[#4A2E27]/60">
              The Bean Co. Brand Manifesto
            </span>
          </div>

          {/* Copy from the Official Vision Document */}
          <div className="font-body text-base sm:text-lg leading-relaxed space-y-6 text-[#231815]/90">
            <p>
              The Bean Company is a modern, coffee-inspired lifestyle brand redefining how people experience energy, indulgence, and everyday convenience. We bring the familiar richness, character, and ritual of coffee into innovative, easy-to-enjoy formats designed for today's fast-moving world and evolving lifestyles.
            </p>

            <p className="bg-[#F5EFC6]/80 p-6 rounded-2xl border border-[#4A2E27]/20 shadow-sm">
              Our flagship concept—<strong className="font-bold text-[#4A2E27]">premium coffee caffeine gummies</strong>—combines the distinctive essence of coffee with portability, precise caffeine dosing, and an enjoyable bite-sized experience. Created for people who are constantly on the move, our products offer a fresh and convenient alternative to traditional ways of consuming caffeine. From everyday productivity and busy workdays to travel, fitness, social occasions, and moments when you simply need an extra boost, The Bean Company is designed to make energy more convenient, stylish, enjoyable, and accessible.
            </p>

            <p>
              With a strong focus on quality, innovation, clean design, and great taste, we aim to create products that seamlessly fit into modern routines while delivering a distinctive brand experience. We believe coffee can be more than just a beverage—it can inspire entirely new ways to enjoy energy and flavour. Through thoughtful product innovation and a strong lifestyle-driven approach, The Bean Company aims to build a globally relevant brand that goes beyond traditional coffee, creating a new generation of functional coffee experiences for a modern, on-the-go world.
            </p>
          </div>

          {/* Vision Badges */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t-2 border-[#231815]/20 font-subhead text-xs">
            <div className="flex items-center space-x-2 text-[#4A2E27]">
              <Zap className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider">Fast & Precise Dosing</span>
            </div>
            <div className="flex items-center space-x-2 text-[#4A2E27]">
              <Package className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider">Pocket Portability</span>
            </div>
            <div className="flex items-center space-x-2 text-[#4A2E27]">
              <Leaf className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider">Clean Functional Living</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. LOGO CONCEPT & THOUGHT PROCESS (Styled on Transparent Yellow Paper)
         ========================================================================= */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#F5EFC6] text-[#231815] paper-crease-h border-b border-[#4A2E27]">
        <div className="max-w-5xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Manifesto Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="border-b-2 border-[#4A2E27]/20 pb-3">
                <span className="font-subhead font-bold text-xs sm:text-sm tracking-[0.25em] uppercase text-[#4A2E27]">
                  LOGO CONCEPT & DESIGN RATIONALE
                </span>
              </div>

              <div className="font-body text-base leading-relaxed space-y-4 text-[#231815]/90">
                <p>
                  At the heart of the bean company is something familiar: the coffee bean. But we wanted to see it differently.
                </p>
                <p>
                  Instead of drawing a traditional coffee bean, we broke its form down into a collection of small, rounded dots inspired by the playful, bite-sized nature of a gummy. Together, these dots come back together to create the unmistakable silhouette of a coffee bean.
                </p>
                <p>
                  The shape in the centre is inspired by the natural crease of a coffee bean, giving the mark its connection to coffee. The individual rounded elements bring in the unexpected part of the brand — the gummy.
                </p>
                <blockquote className="p-4 bg-[#A5BCD6]/40 rounded-xl border-l-4 border-[#4A2E27] font-headline font-bold text-lg text-[#4A2E27]">
                  "So the logo becomes a meeting point between two worlds: The richness of coffee and the playfulness of gummies."
                </blockquote>
                <p>
                  The deep brown represents the warmth, depth and indulgence of coffee, while the soft, dotted construction gives the bean a lighter, more contemporary personality.
                </p>
                <p className="font-subhead font-bold uppercase tracking-wider text-xs text-[#4D0E12]">
                  It is not simply a coffee bean. It is coffee, transformed into something fun.
                </p>
              </div>
            </div>

            {/* Right: The 4-Step Evolution Display */}
            <div className="lg:col-span-5 bg-[#231815] p-6 sm:p-8 rounded-3xl border-2 border-[#4A2E27] shadow-2xl text-center text-[#F5EFC6]">
              <span className="font-subhead text-[10px] uppercase tracking-widest text-[#A5BCD6] block mb-4">
                THE ICON EVOLUTION
              </span>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* 1. Real Bean */}
                <div className="bg-[#18100E] p-3 rounded-2xl border border-[#4A2E27] flex flex-col items-center">
                  <div className="w-12 h-16 flex items-center justify-center">
                    <Coffee className="w-10 h-10 text-amber-600" />
                  </div>
                  <span className="font-subhead text-[9px] uppercase tracking-wider text-[#A5BCD6] mt-2">1. The Origin</span>
                  <span className="font-body text-[10px] text-[#F5EFC6]/70">Roasted Bean</span>
                </div>

                {/* 2. Debossed Dots */}
                <div className="bg-[#18100E] p-3 rounded-2xl border border-[#4A2E27] flex flex-col items-center">
                  <div className="w-12 h-16 flex items-center justify-center">
                    <BrandLogo className="w-10 h-14" variant="debossed" />
                  </div>
                  <span className="font-subhead text-[9px] uppercase tracking-wider text-[#A5BCD6] mt-2">2. Deconstruction</span>
                  <span className="font-body text-[10px] text-[#F5EFC6]/70">Debossed Grid</span>
                </div>

                {/* 3. Transparent Yellow Dots */}
                <div className="bg-[#18100E] p-3 rounded-2xl border border-[#4A2E27] flex flex-col items-center">
                  <div className="w-12 h-16 flex items-center justify-center">
                    <BrandLogo className="w-10 h-14" variant="cream" />
                  </div>
                  <span className="font-subhead text-[9px] uppercase tracking-wider text-[#A5BCD6] mt-2">3. Primary Mark</span>
                  <span className="font-body text-[10px] text-[#F5EFC6]/70">Transparent Yellow</span>
                </div>

                {/* 4. Cerulean Blue Dots */}
                <div className="bg-[#18100E] p-3 rounded-2xl border border-[#4A2E27] flex flex-col items-center">
                  <div className="w-12 h-16 flex items-center justify-center">
                    <BrandLogo className="w-10 h-14" variant="cerulean" />
                  </div>
                  <span className="font-subhead text-[9px] uppercase tracking-wider text-[#A5BCD6] mt-2">4. Accent Mark</span>
                  <span className="font-body text-[10px] text-[#F5EFC6]/70">Cerulean Blue</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#4A2E27]">
                <BrandLogo className="w-14 h-16 mx-auto mb-2" variant="cream" showText={true} textClass="text-2xl" showSubtext={true} />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          4. MEET BÉANO — THE BRAND MASCOT
         ========================================================================= */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#231815] border-b border-[#4A2E27]">
        <div className="max-w-5xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Mascot Character & Rotating Stamp Seal */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative p-5 sm:p-8 rounded-3xl bg-[#18100E] border-2 border-[#A5BCD6] shadow-2xl flex flex-col items-center max-w-full">
                <BeanoSeal size="w-40 h-40 xs:w-48 xs:h-48 sm:w-56 sm:h-56" textColor="#F5EFC6" strokeColor="#A5BCD6" interactive={true} />
                <span className="mt-4 font-subhead text-[10px] sm:text-[11px] uppercase tracking-widest text-[#A5BCD6] text-center">
                  Official Seal • Chew The Brew
                </span>
              </div>
            </div>

            {/* Mascot Story Description */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#4A2E27] text-[#F5EFC6] font-subhead text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#A5BCD6]" />
                <span>Meet Our Character</span>
              </div>

              <h2 className="font-headline font-black text-4xl sm:text-5xl text-[#F5EFC6] tracking-tight">
                Say Hello to <span className="text-[#A5BCD6]">Béano</span>
              </h2>

              <div className="font-body text-base text-[#F5EFC6]/90 leading-relaxed space-y-4">
                <p>
                  Béano brings a playful, friendly personality to The Bean Co., turning the brand's coffee gummies into a character people can instantly connect with.
                </p>
                <p>
                  Its simple, rounded form subtly echoes the shape of a coffee bean while its calm, curious expression gives the brand a warm and approachable feel.
                </p>
                <p>
                  Béano makes the idea of <em>"chewing your coffee"</em> feel fun, memorable, and distinctive, helping The Bean Co. stand out as a fresh, modern take on the everyday coffee ritual.
                </p>
              </div>

              {/* Character Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#4A2E27] font-subhead text-xs">
                <div className="bg-[#18100E] p-3 rounded-xl border border-[#4A2E27]">
                  <span className="text-[10px] text-[#A5BCD6] block uppercase">Personality</span>
                  <span className="font-bold text-[#F5EFC6]">Calm, Curious & Zen</span>
                </div>
                <div className="bg-[#18100E] p-3 rounded-xl border border-[#4A2E27]">
                  <span className="text-[10px] text-[#A5BCD6] block uppercase">Favorite Activity</span>
                  <span className="font-bold text-[#F5EFC6]">Chewing the Brew</span>
                </div>
                <div className="bg-[#18100E] p-3 rounded-xl border border-[#4A2E27] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#A5BCD6] block uppercase">Energy Level</span>
                  <span className="font-bold text-emerald-400">Steady 50mg Flow</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          5. THE PACKAGING LINEUP & 3 SIGNATURE FLAVORS
         ========================================================================= */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#18100E] border-b border-[#4A2E27]">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-subhead text-xs font-bold uppercase tracking-[0.25em] text-[#A5BCD6] block mb-2">
              PACKAGING & PRODUCT FLAVORS
            </span>
            <h2 className="font-headline font-black text-3xl sm:text-5xl text-[#F5EFC6] tracking-tight uppercase">
              Three Distinct Roast Experiences
            </h2>
            <p className="font-body text-sm sm:text-base text-[#F5EFC6]/80 mt-3">
              Each flavor is housed in our signature cylindrical pocket tin with arched color-blocked label badges and lid rim branding.
            </p>
          </div>

          {/* 3 Canister Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* 1. Classic Tin */}
            <div className="bg-[#2F201C] rounded-3xl p-6 border-2 border-[#4A2E27] hover:border-[#A5BCD6] transition-all flex flex-col justify-between group">
              <div>
                {/* Canister Header / Top rim */}
                <div className="bg-[#4A2E27] p-3 rounded-2xl border border-[#A5BCD6]/30 mb-6 text-center">
                  <span className="font-subhead text-[10px] font-bold uppercase tracking-widest text-[#F5EFC6] block">
                    CHEW THE BREW
                  </span>
                  <div className="w-8 h-8 mx-auto my-1">
                    <BrandLogo className="w-full h-full" variant="cream" />
                  </div>
                </div>

                {/* Arched Label Mockup */}
                <div className="bg-[#A5BCD6] text-[#231815] rounded-t-[40px] rounded-b-2xl p-6 text-center shadow-lg mb-6">
                  <BrandLogo className="w-8 h-10 mx-auto mb-2" variant="java" />
                  <span className="font-headline font-black text-xs uppercase tracking-tight block">
                    The Bean Co.
                  </span>
                  <span className="font-subhead text-[9px] uppercase tracking-wider block text-[#231815]/70 mb-2">
                    Chew the brew
                  </span>

                  <h3 className="font-headline font-black text-xl uppercase tracking-tight text-[#4A2E27] my-2">
                    Coffee Gummies
                  </h3>

                  <span className="inline-block px-3 py-1 rounded-full bg-[#4A2E27] text-[#F5EFC6] font-subhead text-[10px] font-bold uppercase tracking-wider mb-3">
                    Classic Roast
                  </span>

                  <p className="font-subhead text-[10px] font-bold text-[#231815]/80">
                    5 GUMMIES • 40g (1.13 oz)
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#231815]/20 flex items-center justify-around text-[9px] font-subhead font-bold">
                    <span>🌱 Plant Based</span>
                    <span>☕ Real Coffee</span>
                  </div>
                </div>

                <h4 className="font-headline font-black text-lg text-[#F5EFC6] mb-1">
                  Classic Espresso
                </h4>
                <p className="font-body text-xs text-[#F5EFC6]/80 leading-relaxed mb-4">
                  Dark roasted cocoa, caramelized sugar, and walnut aromatics. The full-bodied standard for coffee purists.
                </p>
              </div>

              <div className="pt-4 border-t border-[#4A2E27] flex items-center justify-between">
                <div>
                  <span className="font-headline font-black text-lg text-[#F5EFC6]">₹299</span>
                  <span className="text-[10px] font-subhead text-[#A5BCD6] block">50mg / Gummy</span>
                </div>
                <button
                  onClick={onExploreShop}
                  className="px-4 py-2 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Shop Classic
                </button>
              </div>
            </div>

            {/* 2. Vanilla Tin */}
            <div className="bg-[#2F201C] rounded-3xl p-6 border-2 border-[#4A2E27] hover:border-[#F5EFC6] transition-all flex flex-col justify-between group">
              <div>
                {/* Canister Header / Top rim */}
                <div className="bg-[#A5BCD6] p-3 rounded-2xl border border-[#F5EFC6]/40 mb-6 text-center text-[#231815]">
                  <span className="font-subhead text-[10px] font-bold uppercase tracking-widest text-[#231815] block">
                    CHEW THE BREW
                  </span>
                  <div className="w-8 h-8 mx-auto my-1">
                    <BrandLogo className="w-full h-full" variant="java" />
                  </div>
                </div>

                {/* Arched Label Mockup */}
                <div className="bg-[#F5EFC6] text-[#231815] rounded-t-[40px] rounded-b-2xl p-6 text-center shadow-lg mb-6">
                  <BrandLogo className="w-8 h-10 mx-auto mb-2" variant="soil" />
                  <span className="font-headline font-black text-xs uppercase tracking-tight block">
                    The Bean Co.
                  </span>
                  <span className="font-subhead text-[9px] uppercase tracking-wider block text-[#231815]/70 mb-2">
                    Chew the brew
                  </span>

                  <h3 className="font-headline font-black text-xl uppercase tracking-tight text-[#4A2E27] my-2">
                    Coffee Gummies
                  </h3>

                  <span className="inline-block px-3 py-1 rounded-full bg-[#A5BCD6] text-[#231815] font-subhead text-[10px] font-bold uppercase tracking-wider mb-3">
                    Vanilla
                  </span>

                  <p className="font-subhead text-[10px] font-bold text-[#231815]/80">
                    5 GUMMIES • 40g (1.13 oz)
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#231815]/20 flex items-center justify-around text-[9px] font-subhead font-bold">
                    <span>🌱 Plant Based</span>
                    <span>☕ Real Coffee</span>
                  </div>
                </div>

                <h4 className="font-headline font-black text-lg text-[#F5EFC6] mb-1">
                  Vanilla Bean
                </h4>
                <p className="font-body text-xs text-[#F5EFC6]/80 leading-relaxed mb-4">
                  Gentle morning roast infused with real bourbon vanilla essence. A silky, dessert-like caffeine experience.
                </p>
              </div>

              <div className="pt-4 border-t border-[#4A2E27] flex items-center justify-between">
                <div>
                  <span className="font-headline font-black text-lg text-[#F5EFC6]">₹329</span>
                  <span className="text-[10px] font-subhead text-[#A5BCD6] block">50mg / Gummy</span>
                </div>
                <button
                  onClick={onExploreShop}
                  className="px-4 py-2 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Shop Vanilla
                </button>
              </div>
            </div>

            {/* 3. Latte Tin */}
            <div className="bg-[#2F201C] rounded-3xl p-6 border-2 border-[#4A2E27] hover:border-[#4A2E27] transition-all flex flex-col justify-between group">
              <div>
                {/* Canister Header / Top rim */}
                <div className="bg-[#F5EFC6] p-3 rounded-2xl border border-[#4A2E27]/40 mb-6 text-center text-[#231815]">
                  <span className="font-subhead text-[10px] font-bold uppercase tracking-widest text-[#231815] block">
                    CHEW THE BREW
                  </span>
                  <div className="w-8 h-8 mx-auto my-1">
                    <BrandLogo className="w-full h-full" variant="soil" />
                  </div>
                </div>

                {/* Arched Label Mockup */}
                <div className="bg-[#4A2E27] text-[#F5EFC6] rounded-t-[40px] rounded-b-2xl p-6 text-center shadow-lg mb-6">
                  <BrandLogo className="w-8 h-10 mx-auto mb-2" variant="cream" />
                  <span className="font-headline font-black text-xs uppercase tracking-tight block">
                    The Bean Co.
                  </span>
                  <span className="font-subhead text-[9px] uppercase tracking-wider block text-[#F5EFC6]/70 mb-2">
                    Chew the brew
                  </span>

                  <h3 className="font-headline font-black text-xl uppercase tracking-tight text-[#F5EFC6] my-2">
                    Coffee Gummies
                  </h3>

                  <span className="inline-block px-3 py-1 rounded-full bg-[#F5EFC6] text-[#231815] font-subhead text-[10px] font-bold uppercase tracking-wider mb-3">
                    Latte
                  </span>

                  <p className="font-subhead text-[10px] font-bold text-[#F5EFC6]/80">
                    5 GUMMIES • 40g (1.13 oz)
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#F5EFC6]/20 flex items-center justify-around text-[9px] font-subhead font-bold">
                    <span>🌱 Plant Based</span>
                    <span>☕ Real Coffee</span>
                  </div>
                </div>

                <h4 className="font-headline font-black text-lg text-[#F5EFC6] mb-1">
                  Creamy Latte
                </h4>
                <p className="font-body text-xs text-[#F5EFC6]/80 leading-relaxed mb-4">
                  Oat milk creaminess meeting bold espresso shots. Perfectly balanced sweetness without artificial syrups.
                </p>
              </div>

              <div className="pt-4 border-t border-[#4A2E27] flex items-center justify-between">
                <div>
                  <span className="font-headline font-black text-lg text-[#F5EFC6]">₹329</span>
                  <span className="text-[10px] font-subhead text-[#A5BCD6] block">50mg / Gummy</span>
                </div>
                <button
                  onClick={onExploreShop}
                  className="px-4 py-2 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Shop Latte
                </button>
              </div>
            </div>

          </div>

          {/* Tri-Canister Banner Image */}
          <div className="mt-16 rounded-3xl overflow-hidden border-2 border-[#4A2E27] shadow-2xl relative">
            <img 
              src="/assets/brand/packaging-canisters.jpg" 
              alt="The Bean Co. 3 Canisters" 
              className="w-full max-h-[460px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#231815] via-transparent to-transparent flex items-end p-8">
              <div className="max-w-xl">
                <span className="font-subhead text-xs uppercase tracking-widest text-[#A5BCD6] font-bold block mb-1">
                  Collection Showcase
                </span>
                <h3 className="font-headline font-black text-2xl sm:text-3xl text-[#F5EFC6] uppercase">
                  Portable. Measured. Delicious.
                </h3>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          6. COLOR PALETTE & TYPOGRAPHY SYSTEM SHOWCASE
         ========================================================================= */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#231815] border-b border-[#4A2E27]">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-subhead text-xs font-bold uppercase tracking-[0.25em] text-[#A5BCD6] block mb-2">
              BRAND SPECIFICATIONS
            </span>
            <h2 className="font-headline font-black text-3xl sm:text-5xl text-[#F5EFC6] tracking-tight uppercase">
              Colors & Typography System
            </h2>
            <p className="font-body text-sm sm:text-base text-[#F5EFC6]/80 mt-3">
              Grounding our identity in tactile coffee tones, craft paper textures, and clear architectural type.
            </p>
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-16">
            {paletteColors.map((color) => (
              <div 
                key={color.hex}
                className="rounded-2xl p-5 border-2 border-[#4A2E27] shadow-lg flex flex-col justify-between"
                style={{ backgroundColor: color.bg, color: color.text }}
              >
                <div>
                  <h4 className="font-headline font-black text-lg tracking-tight mb-2">
                    {color.name}
                  </h4>
                  <div className="font-mono text-xs space-y-0.5 opacity-90">
                    <p>HEX: #{color.hex}</p>
                    <p>RGB: {color.rgb}</p>
                    <p>CMYK: {color.cmyk}</p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-black/15 font-body text-[11px] opacity-80">
                  {color.role}
                </div>
              </div>
            ))}
          </div>

          {/* Typography Specimen Card */}
          <div className="bg-[#4A2E27] rounded-3xl p-8 sm:p-10 border-2 border-[#A5BCD6]/40 shadow-2xl paper-crease-h">
            <div className="border-b border-[#F5EFC6]/20 pb-4 mb-8 flex items-center justify-between">
              <span className="font-subhead font-bold text-xs uppercase tracking-[0.25em] text-[#A5BCD6]">
                TYPOGRAPHY HIERARCHY
              </span>
              <span className="font-body text-xs text-[#F5EFC6]/60">
                Official Font Stack
              </span>
            </div>

            <div className="space-y-8">
              {/* Headline */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
                <span className="md:col-span-3 font-subhead text-xs uppercase text-[#A5BCD6] font-bold">
                  Headline
                </span>
                <div className="md:col-span-9">
                  <p className="font-headline font-black text-2xl sm:text-4xl text-[#A5BCD6] tracking-tight uppercase">
                    INTERSTATE BOLD IS THE HEADLINE FONT
                  </p>
                  <p className="font-body text-xs text-[#F5EFC6]/70 mt-1">
                    Applied to primary banners, product titles, and punchy statements.
                  </p>
                </div>
              </div>

              {/* Subhead */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline pt-6 border-t border-[#F5EFC6]/15">
                <span className="md:col-span-3 font-subhead text-xs uppercase text-[#A5BCD6] font-bold">
                  Subhead
                </span>
                <div className="md:col-span-9">
                  <p className="font-subhead font-bold text-lg sm:text-xl text-[#A5BCD6] tracking-wider uppercase">
                    SIMPLON MONO MEDIUM IS THE SUBHEAD
                  </p>
                  <p className="font-body text-xs text-[#F5EFC6]/70 mt-1">
                    Applied to badges, metadata labels, product specs, and category tags.
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline pt-6 border-t border-[#F5EFC6]/15">
                <span className="md:col-span-3 font-subhead text-xs uppercase text-[#A5BCD6] font-bold">
                  Body
                </span>
                <div className="md:col-span-9">
                  <p className="font-body text-sm sm:text-base text-[#F5EFC6] leading-relaxed">
                    Prestige Elite Regular is the body font. Used for long-form brand copy, narrative descriptions, brewing specs, and conversational dialogue. It carries the warm, thoughtful tactile rhythm of a classic mechanical typewriter.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          7. STATIONERY & SOCIAL LOOKBOOK
         ========================================================================= */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#18100E] border-b border-[#4A2E27]">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-subhead text-xs font-bold uppercase tracking-[0.25em] text-[#A5BCD6] block mb-2">
              LIFESTYLE & COMMUNITY
            </span>
            <h2 className="font-headline font-black text-3xl sm:text-5xl text-[#F5EFC6] tracking-tight uppercase">
              Everyday Touchpoints
            </h2>
            <p className="font-body text-sm sm:text-base text-[#F5EFC6]/80 mt-3">
              From debossed cards and pocket canisters to our social community at <span className="text-[#A5BCD6] font-bold">@thebean.company</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Stationery Mockup */}
            <div className="rounded-3xl overflow-hidden border-2 border-[#4A2E27] shadow-2xl">
              <img 
                src="/assets/brand/stationery-cards.png" 
                alt="The Bean Co. Stationery & Business Cards" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Social Posts Grid */}
            <div className="rounded-3xl overflow-hidden border-2 border-[#4A2E27] shadow-2xl">
              <img 
                src="/assets/brand/social-posts.png" 
                alt="The Bean Co. Social Posts" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          8. CALL TO ACTION FINALE
         ========================================================================= */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#231815] text-center">
        <div className="max-w-4xl mx-auto">
          
          <div className="w-16 h-20 mx-auto mb-6">
            <BrandLogo className="w-full h-full" variant="cream" />
          </div>

          <span className="font-subhead text-xs font-bold uppercase tracking-[0.25em] text-[#A5BCD6] block mb-3">
            READY TO RETHINK YOUR COFFEE?
          </span>

          <h2 className="font-headline font-black text-4xl sm:text-6xl text-[#F5EFC6] uppercase tracking-tight mb-6">
            CHEW THE BREW TODAY.
          </h2>

          <p className="font-body text-base sm:text-lg text-[#F5EFC6]/85 max-w-2xl mx-auto mb-10 leading-relaxed">
            Grab a pocket canister of Classic, Vanilla, or Latte. 50mg of measured plant-based energy in every single gummy.
          </p>

          <button
            onClick={onExploreShop}
            className="px-10 py-5 rounded-2xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-black text-base sm:text-lg tracking-wider uppercase border-2 border-[#F5EFC6]/40 shadow-2xl inline-flex items-center space-x-3 group transition-all duration-300 transform hover:scale-105"
          >
            <span>Explore The Gummy Shop</span>
            <ArrowRight className="w-6 h-6 text-[#A5BCD6] group-hover:translate-x-2 transition-transform" />
          </button>

        </div>
      </section>

    </div>
  );
}
