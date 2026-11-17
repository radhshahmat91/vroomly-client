"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { carsApi } from "@/lib/api/cars";
import type { CarFilters } from "@/types";

export const useCars = (filters: CarFilters) =>
  useQuery({ queryKey: ["cars", "list", filters], queryFn: () => carsApi.list(filters), placeholderData: keepPreviousData });

export const useFeaturedCars = () => useQuery({ queryKey: ["cars", "featured"], queryFn: carsApi.featured });
export const useCarsMeta = () => useQuery({ queryKey: ["cars", "meta"], queryFn: carsApi.meta, staleTime: 5 * 60_000 });
export const usePublicStats = () => useQuery({ queryKey: ["stats"], queryFn: carsApi.stats, staleTime: 5 * 60_000 });
export const useCar = (id?: string) => useQuery({ queryKey: ["car", id], queryFn: () => carsApi.get(id as string), enabled: Boolean(id) });
export const useCarAvailability = (id?: string) =>
  useQuery({ queryKey: ["availability", id], queryFn: () => carsApi.availability(id as string), enabled: Boolean(id) });
export const useCarReviews = (id: string | undefined, page: number) =>
  useQuery({ queryKey: ["car-reviews", id, page], queryFn: () => carsApi.reviews(id as string, page), enabled: Boolean(id), placeholderData: keepPreviousData });
export const useFeaturedReviews = () => useQuery({ queryKey: ["reviews", "featured"], queryFn: carsApi.featuredReviews, staleTime: 5 * 60_000 });
