import type { Metadata } from "next";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";

export const metadata: Metadata = { title: "Admin Analytics" };

export default function Page() {
  return <AdminAnalytics />;
}
