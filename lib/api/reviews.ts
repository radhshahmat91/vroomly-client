import type { Paginated, Review, ReviewMeta } from "@/types";
import { api, unwrap } from "./client";

export const reviewsApi = {
  mine: async (page = 1) => (await api.get<Paginated<Review>>("/reviews/mine", { params: { page, limit: 8 } })).data,
  owner: async (page = 1) => (await api.get<Paginated<Review, ReviewMeta>>("/owner/reviews", { params: { page, limit: 8 } })).data,
  create: async (input: { bookingId: string; rating: number; comment: string }) => unwrap<Review>(await api.post("/reviews", input)),
  reply: async (id: string, text: string) => unwrap<Review>(await api.post(`/reviews/${id}/reply`, { text })),
};
