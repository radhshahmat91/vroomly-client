"use client";

import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { useCarsMeta } from "@/hooks/useCars";
import { CATEGORY_TILES } from "@/lib/constants";

export function CategoryGrid() {
  const { data } = useCarsMeta();
  const count = (key: string) => (key === "electric" ? data?.fuelTypes?.electric : data?.categories?.[key]) ?? 0;

  return (
    <section className="container-x pt-20">
      <Reveal>
        <h2 className="section-title">Pick a body style</h2>
        <p className="section-sub">From city runabouts to weekend roadsters — start with the kind of car that fits your plans.</p>
      </Reveal>
      <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {CATEGORY_TILES.map((c) => (
          <StaggerItem key={c.key}>
            <Link href={c.href} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-neutral">
              <SmartImage src={c.image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral/95 via-neutral/20 to-transparent" />
              {count(c.key) > 0 && (
                <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-content">{count(c.key)} available</span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                <h3 className="font-display text-3xl font-bold leading-none sm:text-4xl">{c.label}</h3>
                <p className="mt-1.5 text-sm text-white/75">{c.blurb}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
