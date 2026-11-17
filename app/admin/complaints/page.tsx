import type { Metadata } from "next";
import { AdminComplaints } from "@/components/admin/AdminComplaints";

export const metadata: Metadata = { title: "Admin Complaints" };

export default function Page() {
  return <AdminComplaints />;
}
