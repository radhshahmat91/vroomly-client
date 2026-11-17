"use client";

import { CalendarDays, Check, CheckCheck, MessageSquareQuote, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { InlineLoader } from "@/components/ui/Spinner";
import { SmartImage } from "@/components/ui/SmartImage";
import { BookingBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { useAcceptBooking, useCancelBooking, useCompleteBooking, useOwnerBookings, useRejectBooking } from "@/hooks/useBookings";
import { fmtDate, fmtRange, money, pluralize, toISODate } from "@/lib/utils";
import type { Booking } from "@/types";

const TABS = [
  { key: "pending", label: "Requests", status: "pending" },
  { key: "upcoming", label: "Accepted & upcoming", status: "accepted,confirmed" },
  { key: "completed", label: "Completed", status: "completed" },
  { key: "closed", label: "Declined & cancelled", status: "rejected,cancelled" },
];

const overlaps = (a: Booking, b: Booking) => a.startDate <= b.endDate && a.endDate >= b.startDate;

export function OwnerBookings() {
  const [tab, setTab] = useState(TABS[0]);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOwnerBookings(tab.status, page);
  const accept = useAcceptBooking();
  const reject = useRejectBooking();
  const complete = useCompleteBooking();
  const cancel = useCancelBooking();
  const [toReject, setToReject] = useState<Booking | null>(null);
  const [toCancel, setToCancel] = useState<Booking | null>(null);
  const today = toISODate(new Date());

  const clashes = useMemo(() => {
    const map = new Map<string, number>();
    const pending = (data?.data ?? []).filter((b) => b.status === "pending");
    pending.forEach((b) => map.set(b.id, pending.filter((o) => o.id !== b.id && o.car.id === b.car.id && overlaps(b, o)).length));
    return map;
  }, [data]);

  return (
    <div>
      <PageHeader title="Booking requests" subtitle="Accept the trips you want. If dates overlap, accepting one automatically declines the others." />
      <Tabs tabs={TABS.map(({ key, label }) => ({ key, label }))} value={tab.key} onChange={(k) => { setTab(TABS.find((t) => t.key === k) ?? TABS[0]); setPage(1); }} />

      <div className="mt-6 space-y-5">
        {isLoading && <InlineLoader label="Loading requests…" />}
        {data && data.data.length === 0 && <EmptyState icon={<CalendarDays size={26} />} title="Nothing here yet" description="Requests with this status will show up in this tab." />}

        {data?.data.map((b) => {
          const clash = clashes.get(b.id) ?? 0;
          return (
            <article key={b.id} className="surface overflow-hidden sm:flex">
              <Link href={`/cars/${b.car.id}`} className="block shrink-0 sm:w-52">
                <SmartImage src={b.car.images[0]?.url} alt={b.car.title} className="aspect-[16/10] size-full object-cover sm:aspect-auto sm:h-full" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-3xl font-bold leading-tight">{b.car.title}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-base-content/70"><Avatar name={b.renter.name} src={b.renter.image} size="xs" /> Requested by <strong>{b.renter.name}</strong> on {fmtDate(b.createdAt, "MMM d")}</p>
                  </div>
                  <BookingBadge status={b.status} />
                </div>

                <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div><dt className="text-base-content/60">Dates</dt><dd className="font-semibold">{fmtRange(b.startDate, b.endDate)} ({pluralize(b.days, "day")})</dd></div>
                  <div><dt className="text-base-content/60">Renter pays</dt><dd className="font-semibold">{money(b.pricing.total, { cents: true })}</dd></div>
                  <div><dt className="text-base-content/60">You earn</dt><dd className="font-bold text-secondary">{money(b.pricing.ownerEarning, { cents: true })}</dd></div>
                  <div><dt className="text-base-content/60">Platform fee</dt><dd className="font-semibold">{money(b.pricing.platformFee, { cents: true })}</dd></div>
                </dl>

                {b.message && <p className="mt-3 inline-flex items-start gap-2 text-sm text-base-content/75"><MessageSquareQuote size={16} className="mt-0.5 shrink-0" /> “{b.message}”</p>}
                {clash > 0 && <p className="mt-3 inline-flex items-start gap-2 rounded-xl bg-warning/15 px-3 py-2 text-sm"><TriangleAlert size={16} className="mt-0.5 shrink-0" /> Overlaps with {pluralize(clash, "other request")}. Accepting this one will decline {clash === 1 ? "it" : "them"} automatically.</p>}
                {b.status === "accepted" && <p className="mt-3 text-sm text-base-content/65">Accepted — waiting for the renter to pay.</p>}
                {(b.status === "rejected" || b.status === "cancelled") && b.cancelReason && <p className="mt-3 text-sm text-base-content/65">Reason: {b.cancelReason}</p>}

                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  {b.status === "pending" && (
                    <>
                      <button className="btn btn-primary btn-sm" disabled={accept.isPending} onClick={() => accept.mutate(b.id)}><Check size={16} /> Accept</button>
                      <button className="btn btn-ghost btn-sm text-error" onClick={() => setToReject(b)}><X size={16} /> Decline</button>
                    </>
                  )}
                  {b.status === "confirmed" && (
                    <button className="btn btn-primary btn-sm" disabled={b.startDate > today || complete.isPending} onClick={() => complete.mutate(b.id)} title={b.startDate > today ? `Available from ${fmtDate(b.startDate)}` : undefined}>
                      <CheckCheck size={16} /> Mark as completed
                    </button>
                  )}
                  {b.status === "confirmed" && b.startDate > today && <span className="self-center text-xs text-base-content/55">You can complete this trip from {fmtDate(b.startDate)}.</span>}
                  {(b.status === "accepted" || (b.status === "confirmed" && b.startDate >= today)) && <button className="btn btn-ghost btn-sm text-error" onClick={() => setToCancel(b)}>Cancel{b.paymentStatus === "paid" ? " & refund" : ""}</button>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} className="mt-8" />

      <ConfirmDialog
        open={Boolean(toReject)}
        title="Decline this request?"
        description="The renter will be notified."
        confirmLabel="Decline request"
        tone="danger"
        reasonLabel="Reason (optional, shared with the renter)"
        loading={reject.isPending}
        onClose={() => setToReject(null)}
        onConfirm={(reason) => toReject && reject.mutate({ id: toReject.id, reason }, { onSuccess: () => setToReject(null) })}
      />
      <ConfirmDialog
        open={Boolean(toCancel)}
        title="Cancel this booking?"
        description={toCancel?.paymentStatus === "paid" ? "The renter has already paid and will be refunded in full." : "The renter will be notified."}
        confirmLabel="Cancel booking"
        tone="danger"
        reasonLabel="Reason (optional)"
        loading={cancel.isPending}
        onClose={() => setToCancel(null)}
        onConfirm={(reason) => toCancel && cancel.mutate({ id: toCancel.id, reason }, { onSuccess: () => setToCancel(null) })}
      />
    </div>
  );
}
