import type { Metadata } from "next";
import { AdminCars } from "@/components/admin/AdminCars";

export const metadata: Metadata = { title: "Admin Cars" };

export default function Page() {
  return <AdminCars />;
}
