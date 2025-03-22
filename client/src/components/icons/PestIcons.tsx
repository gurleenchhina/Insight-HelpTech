import React from 'react';

// SVG icon components for different pest types
export const StinkbugIcon = ({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 5c-3 0-5 2-6 3-1 1-2 3-2 5 0 3 2 6 8 6s8-3 8-6c0-2-1-4-2-5-1-1-3-3-6-3z" />
    <path d="M12 5V3" />
    <path d="M10 3h4" />
    <path d="M5 10c-1-1-2-1-3 0" />
    <path d="M19 10c1-1 2-1 3 0" />
    <path d="M8 16c0-2 2-3 4-3s4 1 4 3" />
    <path d="M10 10.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5.2-.5.5-.5.5.2.5.5z" />
    <path d="M15 10.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5.2-.5.5-.5.5.2.5.5z" />
  </svg>
);

export const CentipedeIcon = ({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 12h16" />
    <path d="M6 10v4" />
    <path d="M9 8v8" />
    <path d="M12 7v10" />
    <path d="M15 8v8" />
    <path d="M18 10v4" />
    <path d="M4 12c0-1 .5-2 2-2" />
    <path d="M6 10c0-1 .5-2 2-2" />
    <path d="M9 8c0-1 .5-1 2-1" />
    <path d="M12 7c0-.5 .5-1 2-1" />
    <path d="M15 8c0-1 .5-2 2-2" />
    <path d="M18 10c0-1 .5-2 2-2" />
    <path d="M4 12c0 1 .5 2 2 2" />
    <path d="M6 14c0 1 .5 2 2 2" />
    <path d="M9 16c0 1 .5 1 2 1" />
    <path d="M12 17c0 .5 .5 1 2 1" />
    <path d="M15 16c0 1 .5 2 2 2" />
    <path d="M18 14c0 1 .5 2 2 2" />
    <circle cx="3" cy="12" r="1" />
  </svg>
);

export const MillipedeIcon = ({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12h18" />
    <path d="M5 9v6" />
    <path d="M5 9c0-1 .5-2 2-2" />
    <path d="M5 15c0 1 .5 2 2 2" />
    <path d="M8 9v6" />
    <path d="M8 9c0-1 .5-2 2-2" />
    <path d="M8 15c0 1 .5 2 2 2" />
    <path d="M11 9v6" />
    <path d="M11 9c0-1 .5-2 2-2" />
    <path d="M11 15c0 1 .5 2 2 2" />
    <path d="M14 9v6" />
    <path d="M14 9c0-1 .5-2 2-2" />
    <path d="M14 15c0 1 .5 2 2 2" />
    <path d="M17 9v6" />
    <path d="M17 9c0-1 .5-2 2-2" />
    <path d="M17 15c0 1 .5 2 2 2" />
    <circle cx="2" cy="12" r="1" />
    <path d="M20 9v6" />
  </svg>
);

export const BoxelderBugIcon = ({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 9l5 5 5-5" />
    <path d="M12 14V5" />
    <path d="M8 5h8" />
    <path d="M10 3l2 2 2-2" />
    <path d="M7 9L4 12l3 3" />
    <path d="M17 9l3 3-3 3" />
    <path d="M12 14v5" />
    <path d="M9 19h6" />
    <path d="M9 16l-1 1" />
    <path d="M15 16l1 1" />
  </svg>
);

export const AntIcon = ({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 6v2" />
    <path d="M12 18v-2" />
    <circle cx="12" cy="12" r="4" />
    <path d="M14 10l4-2" />
    <path d="M10 10l-4-2" />
    <path d="M14 14l4 2" />
    <path d="M10 14l-4 2" />
  </svg>
);

export const SpiderIcon = ({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M4 4l3 3" />
    <path d="M4 20l3-3" />
    <path d="M20 4l-3 3" />
    <path d="M20 20l-3-3" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M12 2v4" />
    <path d="M12 18v4" />
  </svg>
);

export const WaspIcon = ({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M8 8l2-2 4 2 2-2" />
    <path d="M18 12c0-2.4-1.3-4-3-4h-6c-1.7 0-3 1.6-3 4s1.3 4 3 4h6c1.7 0 3-1.6 3-4z" />
    <path d="M10 8.5v7" />
    <path d="M14 8.5v7" />
    <path d="M7 10h10" />
    <path d="M7 14h10" />
    <path d="M10 16l-3 3" />
    <path d="M14 16l3 3" />
    <circle cx="7" cy="5" r="1" />
    <circle cx="17" cy="5" r="1" />
  </svg>
);

export const RodentIcon = ({ className = "h-6 w-6", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 10c0-1.1.9-2 2-2h10a3 3 0 0 1 0 6H9a5 5 0 0 0-4 2v-6z" />
    <path d="M19 10h2" />
    <path d="M5 10h-2" />
    <circle cx="8" cy="10" r="1" />
    <path d="M15 16a3 3 0 0 1-5.1 2.1L5 17v-4" />
    <path d="M19 16l-2 3" />
  </svg>
);

// Map of pest category names to icons
export const pestIcons: Record<string, React.FC<{ className?: string; color?: string }>> = {
  "Ants": AntIcon,
  "Spiders": SpiderIcon,
  "Wasps": WaspIcon,
  "Stinkbugs": StinkbugIcon,
  "Rodents": RodentIcon,
  "Centipedes": CentipedeIcon,
  "Millipedes": MillipedeIcon,
  "Boxelder Bugs": BoxelderBugIcon
};