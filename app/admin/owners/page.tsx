import type { Metadata } from "next";
import { AdminOwners } from "@/components/admin/AdminOwners";

export const metadata: Metadata = { title: "Admin Vehicle Owners" };

export default function Page() {
  return <AdminOwners />;
}
