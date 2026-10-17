import React from 'react';

/**
 * Béano - The official mascot of The Bean Co.
 * A friendly, zen-like coffee bean who embodies "chewing your coffee".
 */
export default function BeanoMascot({ 
  className = "w-24 h-32", 
  strokeColor = "#A5BCD6", // Cerulean Blue default
  fillColor = "transparent",
  showSpeechBubble = false,
  speechText = "Chew the brew!"
}) {
  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {showSpeechBubble && (
        <div className="mb-2 px-3 py-1.5 rounded-2xl bg-[#F5EFC6] text-[#231815] font-subhead text-[11px] font-bold shadow-lg border border-[#4A2E27] relative animate-bounce">
          <span>{speechText}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#F5EFC6] rotate-45 border-r border-b border-[#4A2E27]" />
        </div>
      )}

      <svg 
        viewBox="0 0 120 160" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Bean Body */}
        <path 
          d="M 60 14 C 88 14 100 38 100 70 C 100 102 85 124 60 124 C 35 124 20 102 20 70 C 20 38 32 14 60 14 Z" 
          fill={fillColor}
          stroke={strokeColor} 
          strokeWidth="3.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Central Bean Seam with Nose */}
        <path 
          d="M 60 14 C 64 36 63 56 62 68 C 57 70 55 72 58 74 C 63 76 61 95 60 124" 
          stroke={strokeColor} 
          strokeWidth="2.8" 
          strokeLinecap="round" 
        />

        {/* Left Eye (Peaceful / Smiling closed eye) */}
        <path 
          d="M 44 60 C 44 65 48 65 48 60" 
          stroke={strokeColor} 
          strokeWidth="2.6" 
          strokeLinecap="round" 
        />

        {/* Right Eye (Peaceful / Smiling closed eye) */}
        <path 
          d="M 72 60 C 72 65 76 65 76 60" 
          stroke={strokeColor} 
          strokeWidth="2.6" 
          strokeLinecap="round" 
        />

        {/* Left Arm */}
        <path 
          d="M 23 72 C 16 85 16 100 23 112" 
          stroke={strokeColor} 
          strokeWidth="2.8" 
          strokeLinecap="round" 
        />

        {/* Right Arm */}
        <path 
          d="M 97 72 C 104 85 104 100 97 112" 
          stroke={strokeColor} 
          strokeWidth="2.8" 
          strokeLinecap="round" 
        />

        {/* Left Leg & Foot */}
        <path 
          d="M 46 124 L 46 148 L 36 148 C 34 148 34 152 38 152 L 48 152 C 50 152 50 148 50 148 L 50 124" 
          stroke={strokeColor} 
          strokeWidth="2.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* Right Leg & Foot */}
        <path 
          d="M 70 124 L 70 148 L 60 148 C 58 148 58 152 62 152 L 72 152 C 74 152 74 148 74 148 L 74 124" 
          stroke={strokeColor} 
          strokeWidth="2.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Official Brand Stamp Seal:
 * Circular lockup with 'chew the brew' arched text and Béano in the middle.
 */
export function BeanoSeal({ 
  size = "w-36 h-36", 
  textColor = "#F5EFC6", 
  strokeColor = "#F5EFC6",
  bgColor = "transparent",
  interactive = true 
}) {
  return (
    <div 
      className={`relative ${size} flex items-center justify-center select-none ${interactive ? 'group' : ''}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Rotating Circular Typography Ring */}
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full absolute inset-0 spin-slow"
      >
        <defs>
          {/* Top text arc */}
          <path
            id="seal-text-top"
            d="M 25 100 A 75 75 0 0 1 175 100"
            fill="none"
          />
          {/* Bottom text arc */}
          <path
            id="seal-text-bottom"
            d="M 175 100 A 75 75 0 0 1 25 100"
            fill="none"
          />
        </defs>

        {/* Top Text: chew the brew */}
        <text 
          fill={textColor} 
          className="font-headline font-bold text-[18px] tracking-[0.28em] uppercase"
        >
          <textPath href="#seal-text-top" startOffset="50%" textAnchor="middle">
            chew the brew
          </textPath>
        </text>

        {/* Separator Left Dot */}
        <circle cx="24" cy="100" r="5" fill={textColor} />

        {/* Separator Right Dot */}
        <circle cx="176" cy="100" r="5" fill={textColor} />

        {/* Bottom Text: chew the brew */}
        <text 
          fill={textColor} 
          className="font-headline font-bold text-[18px] tracking-[0.28em] uppercase"
        >
          <textPath href="#seal-text-bottom" startOffset="50%" textAnchor="middle">
            chew the brew
          </textPath>
        </text>
      </svg>

      {/* Center Béano Mascot */}
      <div className="relative z-10 w-[48%] h-[58%] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
        <BeanoMascot 
          className="w-full h-full" 
          strokeColor={strokeColor} 
        />
      </div>
    </div>
  );
}
