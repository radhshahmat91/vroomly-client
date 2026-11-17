"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { adminApi, type ListParams } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";

function useAdminList<T>(key: string, params: ListParams, fn: (p: ListParams) => Promise<T>) {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ["admin", key, params], queryFn: () => fn(params), enabled: isAuthenticated, placeholderData: keepPreviousData });
}

export const useAdminAnalytics = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ["admin", "analytics"], queryFn: adminApi.analytics, enabled: isAuthenticated });
};
export const useAdminUsers = (p: ListParams) => useAdminList("users", p, adminApi.users);
export const useAdminOwners = (p: ListParams) => useAdminList("owners", p, adminApi.owners);
export const useAdminCars = (p: ListParams) => useAdminList("cars", p, adminApi.cars);
export const useAdminBookings = (p: ListParams) => useAdminList("bookings", p, adminApi.bookings);
export const useAdminPayments = (p: ListParams) => useAdminList("payments", p, adminApi.payments);
export const useAdminComplaints = (p: ListParams) => useAdminList("complaints", p, adminApi.complaints);
export const useRevenueReport = (months: number) => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ["admin", "revenue", months], queryFn: () => adminApi.revenue(months), enabled: isAuthenticated });
};

function useAdminMutation<TVars, TData>(fn: (v: TVars) => Promise<TData>, success: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast.success(success);
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["cars"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export const useSetUserStatus = () =>
  useAdminMutation(({ id, status, reason }: { id: string; status: "active" | "suspended"; reason?: string }) => adminApi.setUserStatus(id, status, reason), "Account updated.");
export const useDecideHost = () =>
  useAdminMutation(({ id, decision, note }: { id: string; decision: "approve" | "reject"; note?: string }) => adminApi.decideHost(id, decision, note), "Application reviewed.");
export const useModerateCar = () =>
  useAdminMutation(({ id, action, note }: { id: string; action: "approve" | "reject" | "remove" | "restore"; note?: string }) => adminApi.moderateCar(id, action, note), "Listing updated.");
export const useUpdateComplaint = () =>
  useAdminMutation(({ id, ...body }: { id: string; status: string; adminResponse: string }) => adminApi.updateComplaint(id, body), "Response saved.");
