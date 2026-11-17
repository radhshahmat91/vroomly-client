import type { Metadata } from "next";
import { EarningsView } from "@/components/owner/EarningsView";

export const metadata: Metadata = { title: "Earnings" };

export default function Page() {
  return <EarningsView />;
}
