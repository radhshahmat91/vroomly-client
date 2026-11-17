import type { BlockedRange, Car, CarImage, EarningsData, OwnerStatsData, Paginated, Payment } from "@/types";
import { api, unwrap } from "./client";

export interface CarPayload {
  brand: string;
  model: string;
  year: number;
  category: string;
  description: string;
  pricePerDay: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  seats: number;
  doors?: number;
  fuelType: string;
  transmission: string;
  features: string[];
  images: CarImage[];
  city: string;
  address: string;
  country: string;
  lat?: number;
  lng?: number;
}

export const ownerApi = {
  cars: async () => unwrap<Car[]>(await api.get("/owner/cars")),
  stats: async () => unwrap<OwnerStatsData>(await api.get("/owner/stats")),
  earnings: async () => unwrap<EarningsData>(await api.get("/owner/earnings")),
  transactions: async (page = 1) => (await api.get<Paginated<Payment>>("/owner/transactions", { params: { page, limit: 8 } })).data,
  createCar: async (payload: CarPayload) => unwrap<Car>(await api.post("/cars", payload)),
  updateCar: async (id: string, payload: CarPayload) => unwrap<Car>(await api.patch(`/cars/${id}`, payload)),
  deleteCar: async (id: string) => api.delete(`/cars/${id}`),
  addBlocked: async (id: string, body: { start: string; end: string; reason: string }) =>
    unwrap<BlockedRange[]>(await api.post(`/cars/${id}/blocked-dates`, body)),
  removeBlocked: async (id: string, blockId: string) => unwrap<BlockedRange[]>(await api.delete(`/cars/${id}/blocked-dates/${blockId}`)),
  uploadImages: async (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));
    return unwrap<CarImage[]>(await api.post("/uploads/images", form, { timeout: 60_000 }));
  },
};
