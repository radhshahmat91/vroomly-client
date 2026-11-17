import type { Metadata } from "next";
import { AdminPayments } from "@/components/admin/AdminLedgers";

export const metadata: Metadata = { title: "Admin Payments" };

export default function Page() {
  return <AdminPayments />;
}
