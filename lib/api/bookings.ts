import type { Booking, Paginated } from "@/types";
import { api, unwrap } from "./client";

export interface BookingInput {
  carId: string;
  startDate: string;
  endDate: string;
  message?: string;
}

export interface BookingSummary {
  counts: Record<"pending" | "accepted" | "confirmed" | "completed" | "rejected" | "cancelled", number>;
  next: Booking | null;
  toPay: Booking[];
  toReview: Booking[];
}

export const bookingsApi = {
  summary: async () => unwrap<BookingSummary>(await api.get("/bookings/summary")),
  mine: async (status: string | undefined, page = 1) =>
    (await api.get<Paginated<Booking>>("/bookings/mine", { params: { status, page, limit: 8 } })).data,
  owner: async (status: string | undefined, page = 1) =>
    (await api.get<Paginated<Booking>>("/owner/bookings", { params: { status, page, limit: 8 } })).data,
  get: async (id: string) => unwrap<Booking>(await api.get(`/bookings/${id}`)),
  create: async (input: BookingInput) => unwrap<Booking>(await api.post("/bookings", input)),
  cancel: async (id: string, reason = "") => (await api.patch<{ data: Booking; meta: { refunded: boolean } }>(`/bookings/${id}/cancel`, { reason })).data,
  accept: async (id: string) => (await api.patch<{ data: Booking; meta: { autoDeclined: number } }>(`/bookings/${id}/accept`)).data,
  reject: async (id: string, reason = "") => unwrap<Booking>(await api.patch(`/bookings/${id}/reject`, { reason })),
  complete: async (id: string) => unwrap<Booking>(await api.patch(`/bookings/${id}/complete`)),
};

export interface IntentResponse {
  demo?: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  amount: number;
}

export const paymentsApi = {
  intent: async (bookingId: string) => unwrap<IntentResponse>(await api.post("/payments/intent", { bookingId })),
  confirm: async (input: { bookingId: string; paymentIntentId?: string; demo?: boolean }) =>
    unwrap<Booking>(await api.post("/payments/confirm", input)),
};
