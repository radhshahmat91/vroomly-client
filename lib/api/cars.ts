import type { Availability, Car, CarFilters, CarsMeta, Paginated, PublicStats, Review, ReviewMeta } from "@/types";
import { api, unwrap } from "./client";

const clean = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && !Number.isNaN(v)));

export const carsApi = {
  list: async (filters: CarFilters) => (await api.get<Paginated<Car>>("/cars", { params: clean(filters) })).data,
  featured: async () => unwrap<Car[]>(await api.get("/cars/featured")),
  meta: async () => unwrap<CarsMeta>(await api.get("/cars/meta")),
  stats: async () => unwrap<PublicStats>(await api.get("/stats")),
  get: async (id: string) => unwrap<Car>(await api.get(`/cars/${id}`)),
  availability: async (id: string) => unwrap<Availability>(await api.get(`/cars/${id}/availability`)),
  reviews: async (id: string, page = 1) =>
    (await api.get<Paginated<Review, ReviewMeta>>(`/reviews/car/${id}`, { params: { page, limit: 5 } })).data,
  featuredReviews: async () => unwrap<Review[]>(await api.get("/reviews/featured")),
};
