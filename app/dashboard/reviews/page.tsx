import type { Metadata } from "next";
import { MyReviewsView } from "@/components/dashboard/MyReviewsView";

export const metadata: Metadata = { title: "My Reviews" };

export default function Page() {
  return <MyReviewsView />;
}
