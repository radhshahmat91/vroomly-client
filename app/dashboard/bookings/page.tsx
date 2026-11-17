import type { Metadata } from "next";
import { Suspense } from "react";
import { MyBookingsView } from "@/components/dashboard/MyBookingsView";
import { PageLoader } from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "My Bookings" };

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MyBookingsView />
    </Suspense>
  );
}
