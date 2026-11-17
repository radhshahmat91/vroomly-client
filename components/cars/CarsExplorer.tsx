"use client";

import { AnimatePresence, motion } from "motion/react";
import { CarFront, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InlineLoader, PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useCars, useCarsMeta } from "@/hooks/useCars";
import { activeFilterCount, filtersToParams, parseFilters } from "@/lib/car-filters";
import { SORT_OPTIONS } from "@/lib/constants";
import { fmtRange, money } from "@/lib/utils";
import type { CarFilters as Filters } from "@/types";
import { CarCard, categoryLabel } from "./CarCard";
import { CarFilters } from "./CarFilters";

export function CarsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const filters = useMemo(() => parseFilters(new URLSearchParams(sp.toString())), [sp]);
  const { data: meta } = useCarsMeta();
  const { data, isLoading, isError, isFetching, refetch } = useCars(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const [searchText, setSearchText] = useState(filters.search ?? "");
  useEffect(() => setSearchText(filters.search ?? ""), [filters.search]);

  const update = useCallback(
    (patch: Partial<Filters>, { keepPage = false }: { keepPage?: boolean } = {}) => {
      const next: Filters = { ...filters, ...patch };
      if (!keepPage && !("page" in patch)) next.page = 1;
      const qs = filtersToParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  // Debounced keyword search
  useEffect(() => {
    if ((filters.search ?? "") === searchText.trim()) return;
    const t = setTimeout(() => update({ search: searchText.trim() || undefined }), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const reset = () => router.replace(pathname, { scroll: false });
  const count = activeFilterCount(filters);
  const total = data?.meta.total ?? 0;

  const chips: { label: string; clear: Partial<Filters> }[] = [];
  if (filters.category) chips.push({ label: categoryLabel(filters.category), clear: { category: undefined } });
  if (filters.brand) chips.push({ label: filters.brand, clear: { brand: undefined } });
  if (filters.city) chips.push({ label: filters.city, clear: { city: undefined } });
  if (filters.fuelType) chips.push({ label: filters.fuelType[0].toUpperCase() + filters.fuelType.slice(1), clear: { fuelType: undefined } });
  if (filters.transmission) chips.push({ label: filters.transmission[0].toUpperCase() + filters.transmission.slice(1), clear: { transmission: undefined } });
  if (filters.seats) chips.push({ label: `${filters.seats}+ seats`, clear: { seats: undefined } });
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined)
    chips.push({ label: `${filters.minPrice !== undefined ? money(filters.minPrice) : "$0"} – ${filters.maxPrice !== undefined ? money(filters.maxPrice) : "any"}`, clear: { minPrice: undefined, maxPrice: undefined } });
  if (filters.lat !== undefined && filters.lng !== undefined) chips.push({ label: `Within ${filters.radius ?? 25} km of you`, clear: { lat: undefined, lng: undefined, radius: undefined } });
  if (filters.startDate && filters.endDate) chips.push({ label: fmtRange(filters.startDate, filters.endDate), clear: { startDate: undefined, endDate: undefined } });

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Find your car</h1>
          <p className="mt-2 text-base-content/70" aria-live="polite">
            {data ? `${total} ${total === 1 ? "car" : "cars"} ${count ? "match your filters" : "available"}` : "Searching…"}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">
          <label className="input input-bordered flex w-full items-center gap-2 sm:w-72 lg:shrink-0">
            <Search size={18} className="text-base-content/50" />
            <input type="search" className="grow" placeholder="Search make, model or city" value={searchText} onChange={(e) => setSearchText(e.target.value)} aria-label="Search cars" />
          </label>
          <select className="select select-bordered w-full sm:w-56 sm:grow-0" value={filters.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort cars">
            {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button className="btn btn-outline lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={18} /> Filters{count ? ` (${count})` : ""}
          </button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <CarFilters filters={filters} meta={meta} onChange={update} onReset={reset} />
          </div>
        </aside>

        <div ref={topRef} className="min-w-0 scroll-mt-24">
          <AnimatePresence initial={false}>
            {chips.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 flex flex-wrap items-center gap-2 overflow-hidden">
                {chips.map((c) => (
                  <button key={c.label} onClick={() => update(c.clear)} className="inline-flex items-center gap-1.5 rounded-full bg-primary/25 py-1.5 pl-3.5 pr-2.5 text-sm font-semibold hover:bg-primary/40" aria-label={`Remove filter ${c.label}`}>
                    {c.label} <X size={14} />
                  </button>
                ))}
                <button onClick={reset} className="btn btn-ghost btn-sm">Clear all</button>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && <PageLoader label="Finding cars…" />}
          {isError && (
            <EmptyState icon={<CarFront size={26} />} title="We couldn't load cars" description="Check your connection and try again." action={<button className="btn btn-primary" onClick={() => refetch()}>Try again</button>} />
          )}
          {data && data.data.length === 0 && (
            <EmptyState icon={<CarFront size={26} />} title="No cars match those filters" description="Try widening your price range, removing a filter or choosing different dates." action={<button className="btn btn-primary" onClick={reset}>Reset filters</button>} />
          )}
          {data && data.data.length > 0 && (
            <>
              <div className={`grid gap-x-6 gap-y-10 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60" : "opacity-100"}`}>
                {data.data.map((car, i) => (
                  <motion.div key={car.id} className="h-full" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}>
                    <CarCard car={car} />
                  </motion.div>
                ))}
              </div>
              {isFetching && <InlineLoader />}
              <Pagination
                className="mt-12"
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                onChange={(p) => {
                  update({ page: p }, { keepPage: true });
                  topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </>
          )}
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" className="max-h-[88vh] overflow-y-auto">
        <CarFilters filters={filters} meta={meta} onChange={update} onReset={reset} />
        <button className="btn btn-primary mt-4 w-full" onClick={() => setFiltersOpen(false)}>Show {total} {total === 1 ? "car" : "cars"}</button>
      </Modal>
    </div>
  );
}
