"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/api/client";
import { notificationsApi } from "@/lib/api/users";

export const useNotifications = (params: { unread?: boolean; page?: number; limit?: number } = {}) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationsApi.list(params),
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });
};

function useNotificationMutation<TVars>(fn: (v: TVars) => Promise<unknown>, success?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      if (success) toast.success(success);
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export const useMarkRead = () => useNotificationMutation((id: string) => notificationsApi.read(id));
export const useMarkAllRead = () => useNotificationMutation(() => notificationsApi.readAll(), "All caught up.");
export const useDeleteNotification = () => useNotificationMutation((id: string) => notificationsApi.remove(id));
