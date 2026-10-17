import React from 'react';

/**
 * The Bean Co. official dot-matrix coffee bean logo.
 * Exact representation of the coffee bean constructed from bite-sized gummy dots.
 */
export default function BrandLogo({ 
  className = "w-10 h-10", 
  variant = "cream", // 'cream' | 'cerulean' | 'potting' | 'debossed'
  showText = false,
  textClass = "text-xl",
  showSubtext = false
}) {
  const colorMap = {
    cream: '#F5EFC6',
    yellow: '#F5EFC6',
    cerulean: '#A5BCD6',
    blue: '#A5BCD6',
    potting: '#4A2E27',
    soil: '#4A2E27',
    java: '#231815',
    sceptre: '#4D0E12',
    debossed: '#38201A'
  };

  const dotFill = colorMap[variant] || colorMap.cream;

  // Exact dot matrix coordinates for the 14-row coffee bean with central S-curve seam
  // Format: [colIndex, rowIndex] where col: 0..9, row: 0..14
  const dotCoords = [
    // Row 0
    [4,0],[6,0],
    // Row 1
    [3,1],[4,1],[6,1],[7,1],
    // Row 2
    [3,2],[4,2],[6,2],[7,2],
    // Row 3
    [2,3],[3,3],[4,3],[6,3],[7,3],[8,3],
    // Row 4
    [2,4],[3,4],[4,4],[6,4],[7,4],[8,4],
    // Row 5
    [1,5],[2,5],[3,5],[4,5],[6,5],[7,5],[8,5],[9,5],
    // Row 6 (seam curves slightly left)
    [1,6],[2,6],[3,6],[5,6],[6,6],[7,6],[8,6],[9,6],
    // Row 7 (middle)
    [1,7],[2,7],[3,7],[5,7],[6,7],[7,7],[8,7],[9,7],
    // Row 8 (seam curves slightly right)
    [1,8],[2,8],[3,8],[4,8],[6,8],[7,8],[8,8],[9,8],
    // Row 9
    [1,9],[2,9],[3,9],[4,9],[6,9],[7,9],[8,9],
    // Row 10
    [2,10],[3,10],[4,10],[6,10],[7,10],[8,10],
    // Row 11
    [2,11],[3,11],[4,11],[6,11],[7,11],[8,11],
    // Row 12
    [3,12],[4,12],[6,12],[7,12],
    // Row 13
    [3,13],[4,13],[6,13],
    // Row 14
    [4,14],[5,14]
  ];

  return (
    <div className="inline-flex items-center space-x-3">
      {/* Dot Matrix Bean Icon */}
      <svg 
        viewBox="0 0 110 160" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} flex-shrink-0 transition-transform duration-300`}
        aria-label="The Bean Co. Logo"
      >
        {variant === 'debossed' && (
          <filter id="deboss-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="0" dy="1.5" />
            <feGaussianBlur stdDeviation="1" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="#000" floodOpacity="0.8" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        )}
        
        <g filter={variant === 'debossed' ? "url(#deboss-shadow)" : undefined}>
          {dotCoords.map(([col, row], idx) => {
            const cx = 15 + col * 9.2;
            const cy = 14 + row * 9.6;
            return (
              <circle 
                key={idx} 
                cx={cx} 
                cy={cy} 
                r={3.4} 
                fill={dotFill}
                opacity={variant === 'debossed' ? 0.85 : 1}
              />
            );
          })}
        </g>
      </svg>

      {/* Brand Text Lockup */}
      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-headline font-black tracking-tight text-[#F5EFC6] leading-none ${textClass}`}>
            The Bean Co.
          </span>
          <span className="font-subhead text-[10px] tracking-widest uppercase text-[#A5BCD6] mt-1 font-medium">
            Chew the brew
          </span>
          {showSubtext && (
            <span className="font-body text-[9px] text-[#F5EFC6]/60 mt-0.5 tracking-tight">
              Plant based caffeine products
            </span>
          )}
        </div>
      )}
    </div>
  );
}
