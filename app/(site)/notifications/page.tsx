import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { NotificationsView } from "@/components/dashboard/NotificationsView";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsView />
    </RequireAuth>
  );
}
