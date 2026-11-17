import type { Metadata } from "next";
import { OwnerOverview } from "@/components/owner/OwnerOverview";

export const metadata: Metadata = { title: "Host Dashboard" };

export default function Page() {
  return <OwnerOverview />;
}
