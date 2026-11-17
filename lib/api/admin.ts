import type { AdminAnalytics, AppUser, Booking, Car, Complaint, Paginated, Payment } from "@/types";
import { api, unwrap } from "./client";

export interface ListParams {
  search?: string;
  status?: string;
  role?: string;
  hostStatus?: string;
  page?: number;
  limit?: number;
}
const clean = (p: ListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== "" && v !== "all"));

export interface RevenueRow {
  month: string;
  bookings: number;
  gross: number;
  commission: number;
  payouts: number;
  refunds: number;
}

export const adminApi = {
  analytics: async () => unwrap<AdminAnalytics>(await api.get("/admin/analytics")),
  users: async (p: ListParams) => (await api.get<Paginated<AppUser>>("/admin/users", { params: clean(p) })).data,
  setUserStatus: async (id: string, status: "active" | "suspended", reason = "") => unwrap<AppUser>(await api.patch(`/admin/users/${id}/status`, { status, reason })),
  owners: async (p: ListParams) => (await api.get<Paginated<AppUser, { pending: number }>>("/admin/owners", { params: clean(p) })).data,
  decideHost: async (id: string, decision: "approve" | "reject", note = "") => unwrap<AppUser>(await api.patch(`/admin/owners/${id}/decision`, { decision, note })),
  cars: async (p: ListParams) => (await api.get<Paginated<Car, { pending: number }>>("/admin/cars", { params: clean(p) })).data,
  moderateCar: async (id: string, action: "approve" | "reject" | "remove" | "restore", note = "") => unwrap<Car>(await api.patch(`/admin/cars/${id}/moderate`, { action, note })),
  bookings: async (p: ListParams) => (await api.get<Paginated<Booking>>("/admin/bookings", { params: clean(p) })).data,
  payments: async (p: ListParams) => (await api.get<Paginated<Payment>>("/admin/payments", { params: clean(p) })).data,
  revenue: async (months = 12) => unwrap<{ rows: RevenueRow[]; totals: Omit<RevenueRow, "month"> }>(await api.get("/admin/reports/revenue", { params: { months } })),
  revenueCsv: async (months = 12) => (await api.get<Blob>("/admin/reports/revenue", { params: { months, format: "csv" }, responseType: "blob" })).data,
  complaints: async (p: ListParams) => (await api.get<Paginated<Complaint, { open: number }>>("/admin/complaints", { params: clean(p) })).data,
  updateComplaint: async (id: string, body: { status: string; adminResponse: string }) => unwrap<Complaint>(await api.patch(`/admin/complaints/${id}`, body)),
};
