"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/api/client";
import { ownerApi, type CarPayload } from "@/lib/api/owner";

export const useOwnerCars = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ["owner", "cars"], queryFn: ownerApi.cars, enabled: isAuthenticated });
};
export const useOwnerStats = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ["owner", "stats"], queryFn: ownerApi.stats, enabled: isAuthenticated });
};
export const useOwnerEarnings = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ["owner", "earnings"], queryFn: ownerApi.earnings, enabled: isAuthenticated });
};
export const useOwnerTransactions = (page: number) => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ["owner", "transactions", page], queryFn: () => ownerApi.transactions(page), enabled: isAuthenticated, placeholderData: keepPreviousData });
};

function useOwnerMutation<TVars, TData>(fn: (v: TVars) => Promise<TData>, success: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast.success(success);
      qc.invalidateQueries({ queryKey: ["owner"] });
      qc.invalidateQueries({ queryKey: ["cars"] });
      qc.invalidateQueries({ queryKey: ["car"] });
      qc.invalidateQueries({ queryKey: ["availability"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export const useCreateCar = () => useOwnerMutation((p: CarPayload) => ownerApi.createCar(p), "Listing submitted for review.");
export const useUpdateCar = () => useOwnerMutation(({ id, payload }: { id: string; payload: CarPayload }) => ownerApi.updateCar(id, payload), "Listing updated.");
export const useDeleteCar = () => useOwnerMutation((id: string) => ownerApi.deleteCar(id), "Listing deleted.");
export const useAddBlocked = () =>
  useOwnerMutation(({ id, ...body }: { id: string; start: string; end: string; reason: string }) => ownerApi.addBlocked(id, body), "Dates blocked.");
export const useRemoveBlocked = () =>
  useOwnerMutation(({ id, blockId }: { id: string; blockId: string }) => ownerApi.removeBlocked(id, blockId), "Dates are open for booking again.");
export const useUploadImages = () => useMutation({ mutationFn: ownerApi.uploadImages, onError: (err) => toast.error(errorMessage(err)) });
