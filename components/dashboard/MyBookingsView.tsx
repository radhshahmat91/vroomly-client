"use client";

import { CalendarX2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RenterBookingCard } from "@/components/booking/RenterBookingCard";
import { ReviewModal } from "@/components/booking/ReviewModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { InlineLoader } from "@/components/ui/Spinner";
import { Tabs } from "@/components/ui/Tabs";
import { useBookingSummary, useCancelBooking, useMyBookings } from "@/hooks/useBookings";
import type { Booking } from "@/types";

const TABS = [
  { key: "all", label: "All", status: undefined },
  { key: "pending", label: "Awaiting host", status: "pending" },
  { key: "accepted", label: "Ready to pay", status: "accepted" },
  { key: "confirmed", label: "Confirmed", status: "confirmed" },
  { key: "completed", label: "Completed", status: "completed" },
  { key: "cancelled", label: "Cancelled", status: "cancelled,rejected" },
];

export function MyBookingsView() {
  const router = useRouter();
  const sp = useSearchParams();
  const tab = TABS.find((t) => t.key === sp.get("tab")) ?? TABS[0];
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyBookings(tab.status, page);
  const { data: summary } = useBookingSummary();
  const cancel = useCancelBooking();
  const [toCancel, setToCancel] = useState<Booking | null>(null);
  const [toReview, setToReview] = useState<Booking | null>(null);

  const counts = summary?.counts;
  const tabs = TABS.map((t) => ({
    key: t.key,
    label: t.label,
    count: !counts ? undefined : t.key === "all" ? undefined : t.key === "cancelled" ? counts.cancelled + counts.rejected : counts[t.key as keyof typeof counts],
  }));

  const setTab = (key: string) => {
    setPage(1);
    router.replace(key === "all" ? "/dashboard/bookings" : `/dashboard/bookings?tab=${key}`, { scroll: false });
  };

  return (
    <div>
      <PageHeader title="My bookings" subtitle="Every request, trip and receipt in one place." actions={<Link href="/cars" className="btn btn-primary">Find another car</Link>} />
      <Tabs tabs={tabs} value={tab.key} onChange={setTab} />

      <div className="mt-6 space-y-5">
        {isLoading && <InlineLoader label="Loading your bookings…" />}
        {data && data.data.length === 0 && (
          <EmptyState
            icon={<CalendarX2 size={26} />}
            title={tab.key === "all" ? "No bookings yet" : "Nothing here"}
            description={tab.key === "all" ? "When you request a car it will show up here with its status." : "Bookings with this status will appear in this tab."}
            action={<Link href="/cars" className="btn btn-primary">Browse cars</Link>}
          />
        )}
        {data?.data.map((b) => <RenterBookingCard key={b.id} booking={b} onCancel={setToCancel} onReview={setToReview} />)}
      </div>
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} className="mt-8" />

      <ConfirmDialog
        open={Boolean(toCancel)}
        title="Cancel this booking?"
        description={toCancel?.paymentStatus === "paid" ? "Your payment will be refunded in full to your card." : "The host will be told that you cancelled."}
        confirmLabel="Yes, cancel booking"
        tone="danger"
        reasonLabel="Reason (optional)"
        loading={cancel.isPending}
        onClose={() => setToCancel(null)}
        onConfirm={(reason) => toCancel && cancel.mutate({ id: toCancel.id, reason }, { onSuccess: () => setToCancel(null) })}
      />
      <ReviewModal booking={toReview} onClose={() => setToReview(null)} />
    </div>
  );
}
