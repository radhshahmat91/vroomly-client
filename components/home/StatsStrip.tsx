"use client";

import { CountUp } from "@/components/ui/CountUp";
import { usePublicStats } from "@/hooks/useCars";

export function StatsStrip() {
  const { data } = usePublicStats();
  if (!data) return <div className="h-6" />;
  const items = [
    { label: "Cars to choose from", value: data.cars },
    { label: "Local hosts", value: data.hosts },
    { label: "Trips completed", value: data.trips },
    { label: "Cities", value: data.cities },
  ];
  return (
    <section aria-label="Vroomly in numbers" className="border-b border-base-300 bg-base-200/60">
      <div className="container-x grid grid-cols-2 gap-y-6 py-8 md:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="text-center md:text-left">
            <p className="font-display text-5xl font-bold leading-none"><CountUp value={i.value} /></p>
            <p className="mt-1.5 text-sm font-semibold text-base-content/65">{i.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
