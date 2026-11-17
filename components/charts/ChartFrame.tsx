"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Recharts measures its container, so render it only after mount to avoid server/client size mismatches. */
export function ChartFrame({ height = 300, children }: { height?: number; children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div style={{ height }} className="w-full min-w-0">
      {mounted ? children : <div className="skeleton-shine size-full rounded-2xl" />}
    </div>
  );
}

export const chartTooltipStyle = {
  background: "var(--color-base-100)",
  border: "1px solid var(--color-base-300)",
  borderRadius: 14,
  color: "var(--color-base-content)",
  boxShadow: "0 12px 30px rgb(0 0 0 / 0.12)",
  fontFamily: "var(--font-sans)",
} as const;

export const axisTick = { fill: "color-mix(in oklab, var(--color-base-content) 60%, transparent)", fontSize: 12 } as const;
