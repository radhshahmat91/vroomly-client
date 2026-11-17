import type { Metadata } from "next";
import { OwnerBookings } from "@/components/owner/OwnerBookings";

export const metadata: Metadata = { title: "Booking Requests" };

export default function Page() {
  return <OwnerBookings />;
}
