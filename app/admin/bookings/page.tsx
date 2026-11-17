import type { Metadata } from "next";
import { AdminBookings } from "@/components/admin/AdminLedgers";

export const metadata: Metadata = { title: "Admin Bookings" };

export default function Page() {
  return <AdminBookings />;
}
