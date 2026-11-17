import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ProfileView } from "@/components/dashboard/ProfileView";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileView />
    </RequireAuth>
  );
}
