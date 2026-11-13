import React from 'react';
import { motion } from 'motion/react';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function OdometerDigit({ digit }) {
  const num = parseInt(digit, 10);
  if (isNaN(num)) {
    return (
      <span className="inline-block select-none tabular-nums" aria-hidden="true">
        {digit === ' ' ? '\u00A0' : digit}
      </span>
    );
  }

  return (
    <span
      className="inline-block h-[1.15em] overflow-hidden leading-[1.15em] align-baseline select-none"
      aria-hidden="true"
    >
      <motion.span
        className="flex flex-col tabular-nums"
        initial={false}
        animate={{ y: `-${num * 10}%` }}
        transition={{ type: 'spring', stiffness: 280, damping: 28, mass: 0.8 }}
      >
        {DIGITS.map((n) => (
          <span key={n} className="h-[1.15em] flex items-center justify-center">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/**
 * Vertical spring-physics digit odometer for live prices and counters.
 */
export function KineticOdometer({ value, text, children, className = '' }) {
  const rawValue = value ?? text ?? children ?? '';
  const str = String(rawValue);

  return (
    <span
      className={`inline-flex items-baseline tabular-nums font-mono whitespace-nowrap ${className}`}
      aria-label={str}
    >
      {str.split('').map((char, idx, arr) => {
        const isDigit = !isNaN(parseInt(char, 10));
        const revIdx = arr.length - 1 - idx;
        const key = isDigit ? `d-${revIdx}` : `s-${revIdx}-${char}`;
        return <OdometerDigit key={key} digit={char} />;
      })}
    </span>
  );
}

export const RollingNumber = KineticOdometer;
export default KineticOdometer;

