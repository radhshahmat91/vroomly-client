"use client";

import { Banknote } from "lucide-react";
import { useState } from "react";
import { EarningsChart } from "@/components/charts/EarningsChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { InlineLoader } from "@/components/ui/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { useOwnerEarnings, useOwnerTransactions } from "@/hooks/useOwner";
import { cn, fmtDate, fmtRange, money } from "@/lib/utils";

export function EarningsView() {
  const [page, setPage] = useState(1);
  const { data: earnings, isLoading } = useOwnerEarnings();
  const { data: tx } = useOwnerTransactions(page);

  return (
    <div>
      <PageHeader title="Earnings" subtitle="Every paid trip, net of the Vroomly platform fee." />
      {isLoading && <InlineLoader label="Crunching your numbers…" />}

      {earnings && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard tone="primary" label="You earned (12 months)" value={money(earnings.totals.net, { cents: true })} icon={<Banknote size={18} />} />
            <StatCard label="Gross bookings" value={money(earnings.totals.gross, { cents: true })} hint="What renters paid" />
            <StatCard label="Platform fee" value={money(earnings.totals.commission, { cents: true })} hint="Kept by Vroomly" />
            <StatCard label="Paid trips" value={earnings.totals.trips} />
          </div>

          <section className="surface mt-8 p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-3xl font-bold">Monthly earnings</h2>
              <ul className="flex gap-5 text-sm">
                <li className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-secondary" /> You earned</li>
                <li className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-primary" /> Platform fee</li>
              </ul>
            </div>
            <EarningsChart data={earnings.monthly} />
          </section>
        </>
      )}

      <section className="mt-8">
        <h2 className="font-display text-3xl font-bold">Transactions</h2>
        {tx && tx.data.length === 0 && <EmptyState className="mt-4" icon={<Banknote size={26} />} title="No payments yet" description="When a renter pays for a trip, it will appear here." />}
        {tx && tx.data.length > 0 && (
          <div className="surface mt-4 overflow-x-auto">
            <table className="table">
              <thead>
                <tr><th>Paid</th><th>Car</th><th>Renter</th><th>Trip</th><th className="text-right">Gross</th><th className="text-right">Fee</th><th className="text-right">You earned</th><th>Status</th></tr>
              </thead>
              <tbody>
                {tx.data.map((p) => (
                  <tr key={p.id} className={cn(p.status === "refunded" && "opacity-60")}>
                    <td className="whitespace-nowrap">{fmtDate(p.paidAt)}</td>
                    <td className="font-semibold">{p.car.title}</td>
                    <td>{p.renter.name}</td>
                    <td className="whitespace-nowrap">{typeof p.booking === "object" ? fmtRange(p.booking.startDate, p.booking.endDate) : "—"}</td>
                    <td className="text-right">{money(p.amount, { cents: true })}</td>
                    <td className="text-right text-base-content/65">−{money(p.platformFee, { cents: true })}</td>
                    <td className={cn("text-right font-bold", p.status === "refunded" ? "line-through" : "text-secondary")}>{money(p.ownerEarning, { cents: true })}</td>
                    <td><span className={cn("badge badge-soft font-semibold", p.status === "succeeded" ? "badge-success" : "badge-ghost")}>{p.status === "succeeded" ? "Paid" : "Refunded"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={tx?.meta.totalPages ?? 1} onChange={setPage} className="mt-6" />
      </section>
    </div>
  );
}
