"use client";

import { CalendarDays, CreditCard } from "lucide-react";
import { useState } from "react";
import { BookingBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { InlineLoader } from "@/components/ui/Spinner";
import { useAdminBookings, useAdminPayments } from "@/hooks/useAdmin";
import { BOOKING_STATUS } from "@/lib/constants";
import { cn, fmtDate, fmtRange, money } from "@/lib/utils";
import type { BookingStatus } from "@/types";
import { TableShell } from "./AdminBits";

export function AdminBookings() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminBookings({ status, page, limit: 12 });

  return (
    <div>
      <PageHeader title="Bookings" subtitle="A read-only ledger of every booking on the platform." />
      <select className="select select-bordered mb-5" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
        <option value="">All statuses</option>
        {(Object.keys(BOOKING_STATUS) as BookingStatus[]).map((s) => <option key={s} value={s}>{BOOKING_STATUS[s].label}</option>)}
      </select>
      {isLoading && <InlineLoader label="Loading bookings…" />}
      {data && data.data.length === 0 && <EmptyState icon={<CalendarDays size={26} />} title="No bookings" description="Nothing matches this filter." />}
      {data && data.data.length > 0 && (
        <TableShell>
          <thead><tr><th>Requested</th><th>Car</th><th>Renter</th><th>Host</th><th>Trip</th><th className="text-right">Total</th><th>Payment</th><th>Status</th></tr></thead>
          <tbody>
            {data.data.map((b) => (
              <tr key={b.id}>
                <td className="whitespace-nowrap">{fmtDate(b.createdAt)}</td>
                <td className="font-semibold">{b.car.title}</td>
                <td>{b.renter.name}</td>
                <td>{b.owner.name}</td>
                <td className="whitespace-nowrap">{fmtRange(b.startDate, b.endDate)}</td>
                <td className="text-right font-semibold">{money(b.pricing.total, { cents: true })}</td>
                <td><span className={cn("badge badge-soft font-semibold", b.paymentStatus === "paid" ? "badge-success" : b.paymentStatus === "refunded" ? "badge-warning" : "badge-ghost")}>{b.paymentStatus}</span></td>
                <td><BookingBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} className="mt-6" />
    </div>
  );
}

export function AdminPayments() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminPayments({ status, page, limit: 12 });

  return (
    <div>
      <PageHeader title="Payments" subtitle="Every card payment, with its Stripe reference." />
      <select className="select select-bordered mb-5" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
        <option value="">All payments</option><option value="succeeded">Succeeded</option><option value="refunded">Refunded</option>
      </select>
      {isLoading && <InlineLoader label="Loading payments…" />}
      {data && data.data.length === 0 && <EmptyState icon={<CreditCard size={26} />} title="No payments" description="Nothing matches this filter." />}
      {data && data.data.length > 0 && (
        <TableShell>
          <thead><tr><th>Date</th><th>Car</th><th>Renter</th><th>Host</th><th className="text-right">Amount</th><th className="text-right">Commission</th><th className="text-right">Host payout</th><th>Stripe reference</th><th>Status</th></tr></thead>
          <tbody>
            {data.data.map((p) => (
              <tr key={p.id}>
                <td className="whitespace-nowrap">{fmtDate(p.paidAt)}</td>
                <td className="font-semibold">{p.car.title}</td>
                <td>{p.renter.name}</td>
                <td>{p.owner.name}</td>
                <td className="text-right font-semibold">{money(p.amount, { cents: true })}</td>
                <td className="text-right">{money(p.platformFee, { cents: true })}</td>
                <td className="text-right">{money(p.ownerEarning, { cents: true })}</td>
                <td className="font-mono text-xs">{p.stripePaymentIntentId}</td>
                <td><span className={cn("badge badge-soft font-semibold", p.status === "succeeded" ? "badge-success" : "badge-warning")}>{p.status === "succeeded" ? "Succeeded" : "Refunded"}</span></td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} className="mt-6" />
    </div>
  );
}
