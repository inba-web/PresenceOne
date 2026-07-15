import React from 'react';

/**
 * PresenceOne Logo System
 * Variant:
 *  - 'icon': Just the geometric symbol
 *  - 'horizontal': Symbol + Title (used in Navbars & Sidebars)
 *  - 'vertical': Symbol on top of Title (used in Auth / Welcome screens)
 * 
 * Theme:
 *  - 'light': Suitable for light backgrounds (dark text)
 *  - 'dark': Suitable for dark backgrounds (white text)
 *  - 'monochrome': Single color matching inheritance
 */
export default function Logo({ variant = 'horizontal', theme = 'light', className = '' }) {
  const isDark = theme === 'dark';
  
  // The Presence Node: An isometric geometric network structure of trust and presence.
  const logoMark = (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Hexagon outline */}
      <polygon
        points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5"
        stroke={isDark ? '#38BDF8' : '#2563EB'}
        strokeWidth="6"
        strokeLinejoin="round"
        className="opacity-20"
      />
      {/* Dynamic connecting beams */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="5"
        stroke={isDark ? '#60A5FA' : '#2563EB'}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="50"
        x2="89"
        y2="72.5"
        stroke={isDark ? '#34D399' : '#10B981'}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="50"
        x2="11"
        y2="72.5"
        stroke={isDark ? '#38BDF8' : '#0EA5E9'}
        strokeWidth="6"
        strokeLinecap="round"
      />
      
      {/* Outer nodes */}
      <circle cx="50" cy="5" r="7" fill={isDark ? '#60A5FA' : '#2563EB'} />
      <circle cx="89" cy="72.5" r="7" fill={isDark ? '#34D399' : '#10B981'} />
      <circle cx="11" cy="72.5" r="7" fill={isDark ? '#38BDF8' : '#0EA5E9'} />

      {/* Central Presence node with a glowing pulse */}
      <circle
        cx="50"
        cy="50"
        r="14"
        fill={isDark ? '#38BDF8' : '#2563EB'}
        className="animate-pulse"
      />
      <circle
        cx="50"
        cy="50"
        r="8"
        fill="#FFFFFF"
      />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`w-8 h-8 flex-shrink-0 ${className}`}>{logoMark}</div>;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${className}`}>
        <div className="w-16 h-16">{logoMark}</div>
        <div className="flex flex-col items-center text-center">
          <span className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            PresenceOne
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary mt-1">
            Enterprise Verification
          </span>
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-8 h-8 flex-shrink-0">{logoMark}</div>
      <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
        PresenceOne
      </span>
    </div>
  );
}
