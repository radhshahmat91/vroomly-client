import type { AppNotification, AppUser, Complaint, Paginated } from "@/types";
import { api, unwrap } from "./client";

export const usersApi = {
  me: async () => unwrap<AppUser>(await api.get("/users/me")),
  update: async (body: Partial<Pick<AppUser, "name" | "phone" | "city" | "bio" | "image">>) => unwrap<AppUser>(await api.patch("/users/me", body)),
  uploadAvatar: async (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return unwrap<AppUser>(await api.post("/users/me/avatar", form, { timeout: 60_000 }));
  },
  applyToHost: async (body: { phone: string; city: string; about: string }) => unwrap<AppUser>(await api.post("/users/me/become-host", body)),
};

export const notificationsApi = {
  list: async (params: { unread?: boolean; page?: number; limit?: number } = {}) =>
    (await api.get<Paginated<AppNotification, { unread: number }>>("/notifications", { params: { ...params, unread: params.unread ? "true" : undefined } })).data,
  read: async (id: string) => unwrap<AppNotification>(await api.patch(`/notifications/${id}/read`)),
  readAll: async () => api.patch("/notifications/read-all"),
  remove: async (id: string) => api.delete(`/notifications/${id}`),
};

export const complaintsApi = {
  mine: async (page = 1) => (await api.get<Paginated<Complaint>>("/complaints/mine", { params: { page, limit: 8 } })).data,
  create: async (body: { subject: string; description: string; category: string; bookingId?: string }) =>
    unwrap<Complaint>(await api.post("/complaints", body)),
};
