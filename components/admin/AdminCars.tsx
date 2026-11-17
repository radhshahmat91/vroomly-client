"use client";

import { Car, Check, Eye, RotateCcw, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { InlineLoader } from "@/components/ui/Spinner";
import { SmartImage } from "@/components/ui/SmartImage";
import { CarStatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { useAdminCars, useModerateCar } from "@/hooks/useAdmin";
import { useDebounced } from "@/hooks/useDebounced";
import { money } from "@/lib/utils";
import type { Car as CarType } from "@/types";
import { SearchInput, TableShell } from "./AdminBits";

const TABS = [
  { key: "pending", label: "Review queue" },
  { key: "approved", label: "Live" },
  { key: "rejected", label: "Rejected" },
  { key: "removed", label: "Removed" },
  { key: "all", label: "All" },
];

export function AdminCars() {
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const q = useDebounced(search);
  const { data, isLoading } = useAdminCars({ status: tab, search: q, page, limit: 8 });
  const moderate = useModerateCar();
  const [dialog, setDialog] = useState<{ car: CarType; action: "reject" | "remove" } | null>(null);

  return (
    <div>
      <PageHeader title="Cars" subtitle="Approve new listings, or reject and remove ones that break the rules." />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={TABS.map((t) => ({ ...t, count: t.key === "pending" ? data?.meta.pending : undefined }))} value={tab} onChange={(k) => { setTab(k); setPage(1); }} />
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search title, brand or city" />
      </div>

      {isLoading && <InlineLoader label="Loading listings…" />}
      {data && data.data.length === 0 && <EmptyState icon={<Car size={26} />} title={tab === "pending" ? "The review queue is empty" : "No listings here"} description="New listings from hosts show up in the review queue." />}
      {data && data.data.length > 0 && (
        <TableShell>
          <thead><tr><th>Listing</th><th>Host</th><th>City</th><th className="text-right">Price</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {data.data.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <SmartImage src={c.images[0]?.url} alt="" className="h-12 w-[4.5rem] shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0"><p className="font-semibold leading-tight">{c.title}</p><p className="text-xs capitalize text-base-content/60">{c.category}, {c.fuelType}</p></div>
                  </div>
                </td>
                <td>{c.owner.name}</td>
                <td>{c.city}</td>
                <td className="text-right font-semibold">{money(c.pricePerDay)}</td>
                <td><CarStatusBadge status={c.status} /></td>
                <td>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Link href={`/cars/${c.id}`} className="btn btn-ghost btn-sm btn-circle" aria-label={`View ${c.title}`} title="View listing"><Eye size={16} /></Link>
                    {c.status === "pending" && (
                      <>
                        <button className="btn btn-primary btn-sm" disabled={moderate.isPending} onClick={() => moderate.mutate({ id: c.id, action: "approve" })}><Check size={15} /> Approve</button>
                        <button className="btn btn-ghost btn-sm text-error" onClick={() => setDialog({ car: c, action: "reject" })}><X size={15} /> Reject</button>
                      </>
                    )}
                    {c.status === "approved" && <button className="btn btn-ghost btn-sm text-error" onClick={() => setDialog({ car: c, action: "remove" })}><Trash2 size={15} /> Remove</button>}
                    {(c.status === "rejected" || c.status === "removed") && <button className="btn btn-outline btn-sm" disabled={moderate.isPending} onClick={() => moderate.mutate({ id: c.id, action: "restore" })}><RotateCcw size={15} /> Restore</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} className="mt-6" />

      <ConfirmDialog
        open={Boolean(dialog)}
        title={dialog?.action === "reject" ? `Reject ${dialog.car.title}?` : `Remove ${dialog?.car.title ?? "listing"}?`}
        description={dialog?.action === "reject" ? "The host is told what to fix and can resubmit." : "The listing disappears from search. The host is notified."}
        confirmLabel={dialog?.action === "reject" ? "Reject listing" : "Remove listing"}
        tone="danger"
        reasonLabel="Note for the host"
        reasonRequired
        loading={moderate.isPending}
        onClose={() => setDialog(null)}
        onConfirm={(note) => dialog && moderate.mutate({ id: dialog.car.id, action: dialog.action, note }, { onSuccess: () => setDialog(null) })}
      />
    </div>
  );
}
