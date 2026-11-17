"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { bookingsApi, paymentsApi, type BookingInput } from "@/lib/api/bookings";
import { errorMessage } from "@/lib/api/client";

export const useBookingSummary = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ["bookings", "summary"], queryFn: bookingsApi.summary, enabled: isAuthenticated });
};

export const useMyBookings = (status: string | undefined, page: number) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["bookings", "mine", status, page],
    queryFn: () => bookingsApi.mine(status, page),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  });
};

export const useOwnerBookings = (status: string | undefined, page: number) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["bookings", "owner", status, page],
    queryFn: () => bookingsApi.owner(status, page),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  });
};

export const useBooking = (id?: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ["booking", id], queryFn: () => bookingsApi.get(id as string), enabled: isAuthenticated && Boolean(id) });
};

function useBookingMutation<TVars, TData>(fn: (v: TVars) => Promise<TData>, success: string | ((d: TData) => string)) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      toast.success(typeof success === "function" ? success(data) : success);
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["booking"] });
      qc.invalidateQueries({ queryKey: ["availability"] });
      qc.invalidateQueries({ queryKey: ["owner"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export const useCreateBooking = () =>
  useBookingMutation((input: BookingInput) => bookingsApi.create(input), "Request sent! We'll let you know when the host answers.");
export const useCancelBooking = () =>
  useBookingMutation(
    ({ id, reason }: { id: string; reason?: string }) => bookingsApi.cancel(id, reason),
    (d) => (d.meta.refunded ? "Booking cancelled and your payment was refunded." : "Booking cancelled."),
  );
export const useAcceptBooking = () =>
  useBookingMutation(
    (id: string) => bookingsApi.accept(id),
    (d) =>
      d.meta.autoDeclined
        ? `Request accepted. ${d.meta.autoDeclined} overlapping request${d.meta.autoDeclined > 1 ? "s were" : " was"} declined automatically.`
        : "Request accepted. The renter can pay now.",
  );
export const useRejectBooking = () =>
  useBookingMutation(({ id, reason }: { id: string; reason?: string }) => bookingsApi.reject(id, reason), "Request declined.");
export const useCompleteBooking = () => useBookingMutation((id: string) => bookingsApi.complete(id), "Trip marked as completed.");

export const useCreateIntent = () => useMutation({ mutationFn: (bookingId: string) => paymentsApi.intent(bookingId) });
export const useConfirmPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.confirm,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["booking"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
