import type { Metadata } from "next";
import { OwnerReviews } from "@/components/owner/OwnerReviews";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
  return <OwnerReviews />;
}
