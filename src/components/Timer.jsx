import React, { useEffect, useMemo, useState } from 'react';

const getColor = (percent) => {
  if (percent > 0.6) return '#22c55e';
  if (percent > 0.3) return '#f59e0b';
  return '#ef4444';
};

/**
 * Timer component — single source of truth.
 *
 * Priority order:
 *  1. If `startTimestamp` is provided, compute remaining time from the wall clock
 *     (accurate even after tab switches / re-renders).
 *  2. Otherwise fall back to the `remaining` prop passed from the parent.
 *
 * This removes the previous dual-interval bug where two setInterval calls
 * were fighting each other and causing flickering / incorrect values.
 */
const Timer = ({ duration, remaining, startTimestamp }) => {
  const [localRemaining, setLocalRemaining] = useState(() => {
    if (startTimestamp && duration) {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      return Math.max(duration - elapsed, 0);
    }
    return remaining ?? duration ?? 0;
  });

  useEffect(() => {
    // If we have a startTimestamp, drive the timer from the wall clock.
    // This is the only interval — no second one.
    if (startTimestamp && duration) {
      const tick = () => {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        setLocalRemaining(Math.max(duration - elapsed, 0));
      };
      tick(); // immediate update
      const id = setInterval(tick, 250);
      return () => clearInterval(id);
    }

    // No startTimestamp — just mirror the `remaining` prop from the parent.
    if (remaining != null) {
      setLocalRemaining(remaining);
    }
  }, [startTimestamp, duration, remaining]);

  const normalized = useMemo(() => {
    if (!duration) return 0;
    return Math.max(0, Math.min(1, localRemaining / duration));
  }, [localRemaining, duration]);

  const strokeColor = getColor(normalized);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - normalized);

  const minutes = Math.floor(localRemaining / 60);
  const seconds = localRemaining % 60;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
        <circle cx="60" cy="60" r={radius} fill="#e0e5ec" stroke="#d1d5db" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute text-center text-sm font-semibold text-[#4a4a6a]">
        <div>{minutes}:{seconds.toString().padStart(2, '0')}</div>
        <div className="text-xs text-slate-500">left</div>
      </div>
    </div>
  );
};

export default Timer;
