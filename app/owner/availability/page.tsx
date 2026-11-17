import type { Metadata } from "next";
import { AvailabilityManager } from "@/components/owner/AvailabilityManager";

export const metadata: Metadata = { title: "Availability" };

export default function Page() {
  return <AvailabilityManager />;
}
