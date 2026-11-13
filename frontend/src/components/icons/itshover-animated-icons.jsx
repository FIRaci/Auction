import React, { useId } from 'react';
import { motion } from 'motion/react';

/**
 * Bespoke luxury brand mark for RoyalAuction:
 * Precision obsidian squircle with subtle iridescent rim, faceted crown crest,
 * and gradient auction plinth bar.
 */
export function RoyalBrandMark({ className = 'w-9 h-9' }) {
  const uid = useId().replace(/:/g, '');
  const bgId = `royal-bg-${uid}`;
  const borderId = `royal-border-${uid}`;
  const crestId = `royal-crest-${uid}`;

  return (
    <motion.svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      initial="rest"
      whileHover="hover"
    >
      <defs>
        <linearGradient id={bgId} x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#23252c" />
          <stop offset="100%" stopColor="#111216" />
        </linearGradient>
        <linearGradient id={borderId} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="45%" stopColor="#ff6e54" stopOpacity="0.35" />
          <stop offset="75%" stopColor="#a864ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1888ff" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={crestId} x1="9" y1="10" x2="27" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff6e54" />
          <stop offset="52%" stopColor="#a864ff" />
          <stop offset="100%" stopColor="#1888ff" />
        </linearGradient>
      </defs>

      {/* Precision obsidian squircle */}
      <rect
        x="0.75"
        y="0.75"
        width="34.5"
        height="34.5"
        rx="9.5"
        fill={`url(#${bgId})`}
        stroke={`url(#${borderId})`}
        strokeWidth="1.25"
      />

      {/* Faceted crown crest */}
      <motion.g
        variants={{
          rest: { y: 0 },
          hover: { y: -0.9, transition: { type: 'spring', stiffness: 420, damping: 22 } },
        }}
      >
        <path
          d="M9.5 13.75L14 16.5L18 9.75L22 16.5L26.5 13.75L24.5 21.75H11.5L9.5 13.75Z"
          fill="#ffffff"
          fillOpacity="0.96"
        />
        {/* Inner architectural facet */}
        <path
          d="M18 9.75L22 16.5L18 21.75L14 16.5L18 9.75Z"
          fill={`url(#${crestId})`}
          fillOpacity="0.92"
        />
      </motion.g>

      {/* Signature auction plinth bar */}
      <rect
        x="10.5"
        y="24"
        width="15"
        height="2.4"
        rx="1.2"
        fill={`url(#${crestId})`}
      />
    </motion.svg>
  );
}

/**
 * Path-level animated SVG icons inspired by itshover.com.
 * Each icon's internal paths react fluidly to hover/active states using motion/react.
 */

export function HoverGavelIcon({ className = 'w-4 h-4', strokeWidth = 1.9 }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      {/* Soundblock base */}
      <path d="M3 21h10" />
      <path d="M5 18h6" />

      {/* Hinged mallet head + handle */}
      <motion.g
        style={{ transformOrigin: '14px 12px' }}
        variants={{
          rest: { rotate: 0 },
          hover: { rotate: [0, -18, 8, 0], transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
          tap: { rotate: 16, transition: { duration: 0.12 } },
        }}
      >
        <rect
          x="10.2"
          y="4.2"
          width="8.4"
          height="4.8"
          rx="1.2"
          transform="rotate(-35 14.4 6.6)"
        />
        <path d="m13.2 8.4-6.4 6.4" />
      </motion.g>
    </motion.svg>
  );
}

export function HoverArrowUpRightIcon({ className = 'w-4 h-4', strokeWidth = 2 }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="rest"
      whileHover="hover"
    >
      <motion.g
        variants={{
          rest: { x: 0, y: 0 },
          hover: { x: 2, y: -2, transition: { type: 'spring', stiffness: 400, damping: 20 } },
        }}
      >
        <path d="M7 7h10v10" />
        <path d="M7 17 17 7" />
      </motion.g>
    </motion.svg>
  );
}

export function HoverRadarLiveIcon({ className = 'w-4 h-4', strokeWidth = 1.9 }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="rest"
      whileHover="hover"
    >
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <motion.path
        d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49"
        variants={{
          rest: { opacity: 0.9, scale: 1 },
          hover: { opacity: [0.4, 1, 0.4], scale: [0.95, 1.06, 0.95], transition: { duration: 0.8, repeat: Infinity } },
        }}
      />
      <motion.path
        d="M19.07 4.93a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"
        variants={{
          rest: { opacity: 0.65 },
          hover: { opacity: [0.2, 1, 0.2], transition: { duration: 0.8, delay: 0.15, repeat: Infinity } },
        }}
      />
    </motion.svg>
  );
}

export function HoverShieldCheckIcon({ className = 'w-4 h-4', strokeWidth = 1.9 }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="rest"
      whileHover="hover"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <motion.path
        d="m9 12 2 2 4-4"
        variants={{
          rest: { pathLength: 1 },
          hover: { pathLength: [0, 1], transition: { duration: 0.4, ease: 'easeOut' } },
        }}
      />
    </motion.svg>
  );
}

export function HoverBoltZapIcon({ className = 'w-4 h-4', strokeWidth = 1.9 }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="rest"
      whileHover="hover"
    >
      <motion.path
        d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"
        variants={{
          rest: { scale: 1 },
          hover: { scale: [1, 1.14, 0.96, 1], transition: { duration: 0.35 } },
        }}
      />
    </motion.svg>
  );
}

export function HoverLayersQueueIcon({ className = 'w-4 h-4', strokeWidth = 1.9 }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="rest"
      whileHover="hover"
    >
      <motion.path
        d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
        variants={{
          rest: { y: 0 },
          hover: { y: -1.5, transition: { duration: 0.25 } },
        }}
      />
      <path d="m22 12.5-8.97 4.08a2 2 0 0 1-1.66 0L2 12.5" />
      <motion.path
        d="m22 17.5-8.97 4.08a2 2 0 0 1-1.66 0L2 17.5"
        variants={{
          rest: { y: 0 },
          hover: { y: 1.5, transition: { duration: 0.25 } },
        }}
      />
    </motion.svg>
  );
}

export function HoverLockSingleRoomIcon({ className = 'w-4 h-4', strokeWidth = 1.9 }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="rest"
      whileHover="hover"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <motion.path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        variants={{
          rest: { y: 0 },
          hover: { y: [0, -2, 0], transition: { duration: 0.35 } },
        }}
      />
    </motion.svg>
  );
}

export function HoverBellAlertIcon({ className = 'w-4 h-4', strokeWidth = 1.9 }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="rest"
      whileHover="hover"
    >
      <motion.g
        style={{ transformOrigin: '12px 3px' }}
        variants={{
          rest: { rotate: 0 },
          hover: { rotate: [0, 12, -10, 6, 0], transition: { duration: 0.5 } },
        }}
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </motion.g>
    </motion.svg>
  );
}

export function HoverWalletBalanceIcon({ className = 'w-4 h-4', strokeWidth = 1.9 }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="rest"
      whileHover="hover"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <motion.path
        d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"
        variants={{
          rest: { scale: 1 },
          hover: { scale: 1.03, transition: { duration: 0.2 } },
        }}
      />
    </motion.svg>
  );
}

export function HoverSparklesAiIcon({ className = 'w-4 h-4', strokeWidth = 1.9 }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="rest"
      whileHover="hover"
    >
      <motion.path
        d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
        variants={{
          rest: { rotate: 0, scale: 1 },
          hover: { rotate: 18, scale: 1.08, transition: { type: 'spring', stiffness: 320, damping: 18 } },
        }}
      />
    </motion.svg>
  );
}

