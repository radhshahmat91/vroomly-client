"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/api/client";
import { reviewsApi } from "@/lib/api/reviews";

export const useMyReviews = (page: number) => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ["reviews", "mine", page], queryFn: () => reviewsApi.mine(page), enabled: isAuthenticated, placeholderData: keepPreviousData });
};

export const useOwnerReviews = (page: number) => {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ["reviews", "owner", page], queryFn: () => reviewsApi.owner(page), enabled: isAuthenticated, placeholderData: keepPreviousData });
};

export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: () => {
      toast.success("Thanks for your review!");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["car-reviews"] });
      qc.invalidateQueries({ queryKey: ["car"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
};

export const useReplyReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => reviewsApi.reply(id, text),
    onSuccess: () => {
      toast.success("Reply posted.");
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["car-reviews"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
};
