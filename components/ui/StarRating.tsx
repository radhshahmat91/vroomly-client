"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Stars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
          <Star size={size} className="absolute inset-0 text-base-300" strokeWidth={1.75} />
          <span className="absolute inset-0 overflow-hidden" style={{ width: rounded >= i ? "100%" : rounded >= i - 0.5 ? "50%" : "0%" }}>
            <Star size={size} className="fill-primary text-primary" strokeWidth={1.75} />
          </span>
        </span>
      ))}
    </span>
  );
}

export function StarInput({ value, onChange, size = 32 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
  const active = hover || value;
  return (
    <div>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange(i)}
            className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:scale-110"
          >
            <Star size={size} strokeWidth={1.75} className={cn("transition-colors", i <= active ? "fill-primary text-primary" : "text-base-300")} />
          </button>
        ))}
      </div>
      <p className="mt-1 h-5 text-sm text-base-content/70">{active ? labels[active - 1] : "Tap a star to rate"}</p>
    </div>
  );
}
