"use client";

import { useCarsMeta } from "@/hooks/useCars";

/** A slow ticker of the makes currently listed on the platform (real data from the API). */
export function BrandMarquee() {
  const { data } = useCarsMeta();
  const brands = data?.brands ?? [];
  if (brands.length < 4) return null;
  const row = [...brands, ...brands];
  return (
    <section aria-label="Makes available on Vroomly" className="overflow-hidden border-b border-base-300 py-7">
      <div className="flex w-max animate-marquee gap-14 whitespace-nowrap hover:[animation-play-state:paused]">
        {row.concat(row).map((b, i) => (
          <span key={`${b}-${i}`} className="font-display text-4xl font-bold text-base-content/25 transition-colors hover:text-base-content">
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}
