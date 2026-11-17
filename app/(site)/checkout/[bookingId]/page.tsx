import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CheckoutView } from "@/components/booking/CheckoutView";
import { PageLoader } from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return (
    <RequireAuth>
      <Suspense fallback={<PageLoader />}>
        <CheckoutView bookingId={bookingId} />
      </Suspense>
    </RequireAuth>
  );
}
