import type { Metadata } from "next";
import { DashboardHome } from "@/components/dashboard/DashboardHome";

export const metadata: Metadata = { title: "My Dashboard" };

export default function Page() {
  return <DashboardHome />;
}
