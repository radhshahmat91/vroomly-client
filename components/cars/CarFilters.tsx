"use client";

import { LocateFixed, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CATEGORY_OPTIONS, FUEL_OPTIONS, TRANSMISSION_OPTIONS } from "@/lib/constants";
import { cn, money, toISODate } from "@/lib/utils";
import type { CarFilters as Filters, CarsMeta } from "@/types";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="mb-5 border-b border-base-300 pb-5 last:mb-0 last:border-0 last:pb-0">
      <legend className="mb-3 font-display text-xl font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors", active ? "border-primary bg-primary text-primary-content" : "border-base-300 hover:border-base-content/40")}>
      {children}
    </button>
  );
}

interface Props {
  filters: Filters;
  meta?: CarsMeta;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

export function CarFilters({ filters, meta, onChange, onReset }: Props) {
  const today = toISODate(new Date());
  const [min, setMin] = useState(filters.minPrice?.toString() ?? "");
  const [max, setMax] = useState(filters.maxPrice?.toString() ?? "");
  const [locating, setLocating] = useState(false);

  useEffect(() => setMin(filters.minPrice?.toString() ?? ""), [filters.minPrice]);
  useEffect(() => setMax(filters.maxPrice?.toString() ?? ""), [filters.maxPrice]);

  // Debounce the price inputs so we don't refetch on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      const a = min === "" ? undefined : Number(min);
      const b = max === "" ? undefined : Number(max);
      if (a !== filters.minPrice || b !== filters.maxPrice) onChange({ minPrice: a, maxPrice: b });
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max]);

  const nearMe = () => {
    if (!navigator.geolocation) return toast.error("Your browser can't share its location.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange({ lat: Number(pos.coords.latitude.toFixed(4)), lng: Number(pos.coords.longitude.toFixed(4)), radius: filters.radius ?? 25 });
      },
      () => {
        setLocating(false);
        toast.error("We couldn't get your location. Allow location access and try again.");
      },
      { timeout: 8000 },
    );
  };

  const geoOn = filters.lat !== undefined && filters.lng !== undefined;

  return (
    <div>
      <Group title="Body style">
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.category} onClick={() => onChange({ category: undefined })}>Any</Chip>
          {CATEGORY_OPTIONS.filter((c) => (meta?.categories?.[c.value] ?? 0) > 0 || filters.category === c.value).map((c) => (
            <Chip key={c.value} active={filters.category === c.value} onClick={() => onChange({ category: c.value })}>
              {c.label.split(" /")[0]}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Brand">
        <select className="select select-bordered w-full" value={filters.brand ?? ""} onChange={(e) => onChange({ brand: e.target.value || undefined })} aria-label="Brand">
          <option value="">All brands</option>
          {meta?.brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </Group>

      <Group title="City">
        <select className="select select-bordered w-full" value={filters.city ?? ""} onChange={(e) => onChange({ city: e.target.value || undefined })} aria-label="City">
          <option value="">Anywhere</option>
          {meta?.cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" className={cn("btn btn-sm mt-3 w-full", geoOn ? "btn-secondary" : "btn-outline")} onClick={geoOn ? () => onChange({ lat: undefined, lng: undefined, radius: undefined }) : nearMe} disabled={locating}>
          {locating ? <span className="loading loading-spinner loading-xs" /> : geoOn ? <X size={16} /> : <LocateFixed size={16} />}
          {geoOn ? "Clear near me" : "Cars near me"}
        </button>
        {geoOn && (
          <div className="mt-4">
            <div className="flex justify-between text-sm font-semibold"><span>Within</span><span>{filters.radius ?? 25} km</span></div>
            <input type="range" min={5} max={200} step={5} value={filters.radius ?? 25} onChange={(e) => onChange({ radius: Number(e.target.value) })} className="range range-secondary range-xs mt-2" aria-label="Search radius in kilometres" />
          </div>
        )}
      </Group>

      <Group title="Price per day">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-base-content/60">Min</span>
            <input type="number" min={0} inputMode="numeric" placeholder={meta ? String(Math.floor(meta.priceRange.min)) : "0"} value={min} onChange={(e) => setMin(e.target.value)} className="input input-bordered w-full" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-base-content/60">Max</span>
            <input type="number" min={0} inputMode="numeric" placeholder={meta ? String(Math.ceil(meta.priceRange.max)) : "500"} value={max} onChange={(e) => setMax(e.target.value)} className="input input-bordered w-full" />
          </label>
        </div>
        {meta && meta.priceRange.max > 0 && <p className="mt-2 text-xs text-base-content/55">Prices on Vroomly run from {money(meta.priceRange.min)} to {money(meta.priceRange.max)} a day.</p>}
      </Group>

      <Group title="Seats">
        <div className="flex flex-wrap gap-2">
          {[undefined, 2, 4, 5, 7].map((s) => (
            <Chip key={s ?? "any"} active={filters.seats === s} onClick={() => onChange({ seats: s })}>{s ? `${s}+` : "Any"}</Chip>
          ))}
        </div>
      </Group>

      <Group title="Fuel type">
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.fuelType} onClick={() => onChange({ fuelType: undefined })}>Any</Chip>
          {FUEL_OPTIONS.filter((f) => (meta?.fuelTypes?.[f.value] ?? 0) > 0 || filters.fuelType === f.value).map((f) => (
            <Chip key={f.value} active={filters.fuelType === f.value} onClick={() => onChange({ fuelType: f.value })}>{f.label}</Chip>
          ))}
        </div>
      </Group>

      <Group title="Transmission">
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.transmission} onClick={() => onChange({ transmission: undefined })}>Any</Chip>
          {TRANSMISSION_OPTIONS.map((t) => (
            <Chip key={t.value} active={filters.transmission === t.value} onClick={() => onChange({ transmission: t.value })}>{t.label}</Chip>
          ))}
        </div>
      </Group>

      <Group title="Dates">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-base-content/60">Pick-up</span>
            <input type="date" min={today} value={filters.startDate ?? ""} onChange={(e) => onChange({ startDate: e.target.value || undefined, endDate: filters.endDate && e.target.value > filters.endDate ? e.target.value : filters.endDate })} className="input input-bordered w-full px-3 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-base-content/60">Return</span>
            <input type="date" min={filters.startDate ?? today} value={filters.endDate ?? ""} onChange={(e) => onChange({ endDate: e.target.value || undefined })} className="input input-bordered w-full px-3 text-sm" />
          </label>
        </div>
        {(filters.startDate || filters.endDate) && (!filters.startDate || !filters.endDate) && <p className="mt-2 text-xs text-warning">Choose both dates to hide cars that are already booked.</p>}
      </Group>

      <button type="button" className="btn btn-ghost mt-2 w-full" onClick={onReset}>Reset all filters</button>
    </div>
  );
}
