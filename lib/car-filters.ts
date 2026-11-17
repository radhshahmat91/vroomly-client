import type { CarFilters } from "@/types";

export const PAGE_SIZE = 9;

const num = (v: string | null) => {
  if (v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/** URL → filters. The address bar is the single source of truth, so every search is shareable and survives a reload. */
export function parseFilters(sp: URLSearchParams): CarFilters {
  return {
    search: sp.get("search") || undefined,
    brand: sp.get("brand") || undefined,
    category: sp.get("category") || undefined,
    city: sp.get("city") || undefined,
    fuelType: sp.get("fuelType") || undefined,
    transmission: sp.get("transmission") || undefined,
    seats: num(sp.get("seats")),
    minPrice: num(sp.get("minPrice")),
    maxPrice: num(sp.get("maxPrice")),
    lat: num(sp.get("lat")),
    lng: num(sp.get("lng")),
    radius: num(sp.get("radius")),
    startDate: sp.get("startDate") || undefined,
    endDate: sp.get("endDate") || undefined,
    sort: sp.get("sort") || "recommended",
    page: num(sp.get("page")) ?? 1,
    limit: PAGE_SIZE,
  };
}

export function filtersToParams(f: CarFilters) {
  const q = new URLSearchParams();
  (Object.entries(f) as [keyof CarFilters, unknown][]).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (k === "limit") return;
    if (k === "sort" && v === "recommended") return;
    if (k === "page" && v === 1) return;
    q.set(k, String(v));
  });
  return q;
}

export const FILTER_KEYS: (keyof CarFilters)[] = ["search", "brand", "category", "city", "fuelType", "transmission", "seats", "minPrice", "maxPrice", "lat", "lng", "radius", "startDate", "endDate"];

export function activeFilterCount(f: CarFilters) {
  const geo = f.lat !== undefined && f.lng !== undefined ? 1 : 0;
  const dates = f.startDate && f.endDate ? 1 : 0;
  const price = f.minPrice !== undefined || f.maxPrice !== undefined ? 1 : 0;
  return [f.search, f.brand, f.category, f.city, f.fuelType, f.transmission, f.seats].filter((v) => v !== undefined && v !== "").length + geo + dates + price;
}
