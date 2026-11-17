"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/api/client";
import { complaintsApi, usersApi } from "@/lib/api/users";

export const useUpdateProfile = () => {
  const { refresh } = useAuth();
  return useMutation({
    mutationFn: usersApi.update,
    onSuccess: async () => {
      await refresh();
      toast.success("Profile updated.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
};

export const useUploadAvatar = () => {
  const { refresh } = useAuth();
  return useMutation({
    mutationFn: usersApi.uploadAvatar,
    onSuccess: async () => {
      await refresh();
      toast.success("Profile photo updated.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
};

export const useApplyToHost = () => {
  const { refresh } = useAuth();
  return useMutation({
    mutationFn: usersApi.applyToHost,
    onSuccess: async () => {
      await refresh();
      toast.success("Application sent. We'll review it shortly.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
};

export const useMyComplaints = (page: number) => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ["complaints", page], queryFn: () => complaintsApi.mine(page), enabled: isAuthenticated, placeholderData: keepPreviousData });
};

export const useCreateComplaint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: complaintsApi.create,
    onSuccess: () => {
      toast.success("Complaint submitted. Our team will respond soon.");
      qc.invalidateQueries({ queryKey: ["complaints"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
};
