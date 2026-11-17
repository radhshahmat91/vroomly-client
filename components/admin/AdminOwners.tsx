"use client";

import { BadgeCheck, Ban, Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { InlineLoader } from "@/components/ui/Spinner";
import { Tabs } from "@/components/ui/Tabs";
import { useAdminOwners, useDecideHost, useSetUserStatus } from "@/hooks/useAdmin";
import { useDebounced } from "@/hooks/useDebounced";
import { fmtDate } from "@/lib/utils";
import type { AppUser } from "@/types";
import { PersonCell, SearchInput } from "./AdminBits";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

export function AdminOwners() {
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const q = useDebounced(search);
  const { data, isLoading } = useAdminOwners({ hostStatus: tab, search: q, page, limit: 8 });
  const decide = useDecideHost();
  const setUserStatus = useSetUserStatus();
  const [toReject, setToReject] = useState<AppUser | null>(null);
  const [toSuspend, setToSuspend] = useState<AppUser | null>(null);

  return (
    <div>
      <PageHeader title="Vehicle owners" subtitle="Approve new hosts, and suspend or reinstate existing ones." />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={TABS.map((t) => ({ ...t, count: t.key === "pending" ? data?.meta.pending : undefined }))} value={tab} onChange={(k) => { setTab(k); setPage(1); }} />
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name or email" />
      </div>

      {isLoading && <InlineLoader label="Loading hosts…" />}
      {data && data.data.length === 0 && <EmptyState icon={<BadgeCheck size={26} />} title={tab === "pending" ? "No applications waiting" : "No hosts here"} description="New host applications will appear in the Pending tab." />}

      <ul className="space-y-4">
        {data?.data.map((u) => (
          <li key={u.id} className="surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <PersonCell name={u.name} email={u.email} image={u.image} />
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge badge-soft font-semibold ${u.hostStatus === "approved" ? "badge-success" : u.hostStatus === "pending" ? "badge-warning" : "badge-error"}`}>{u.hostStatus === "approved" ? "Approved" : u.hostStatus === "pending" ? "Pending" : "Rejected"}</span>
                {u.status === "suspended" && <span className="badge badge-error badge-soft font-semibold">Suspended</span>}
              </div>
            </div>

            <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
              <div><dt className="text-base-content/60">Phone</dt><dd className="font-semibold">{u.hostProfile?.phone || u.phone || "—"}</dd></div>
              <div><dt className="text-base-content/60">City</dt><dd className="font-semibold">{u.hostProfile?.city || u.city || "—"}</dd></div>
              <div><dt className="text-base-content/60">Applied</dt><dd className="font-semibold">{u.hostProfile?.appliedAt ? fmtDate(u.hostProfile.appliedAt) : "—"}</dd></div>
            </dl>
            {u.hostProfile?.about && <p className="mt-3 rounded-xl bg-base-200 p-3.5 text-base-content/80">{u.hostProfile.about}</p>}
            {u.hostProfile?.reviewNote && <p className="mt-3 text-sm text-base-content/65">Review note: {u.hostProfile.reviewNote}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              {u.hostStatus === "pending" && (
                <>
                  <button className="btn btn-primary btn-sm" disabled={decide.isPending} onClick={() => decide.mutate({ id: u.id, decision: "approve" })}><Check size={16} /> Approve host</button>
                  <button className="btn btn-ghost btn-sm text-error" onClick={() => setToReject(u)}><X size={16} /> Reject</button>
                </>
              )}
              {u.hostStatus === "approved" && (u.status === "suspended" ? (
                <button className="btn btn-outline btn-sm" disabled={setUserStatus.isPending} onClick={() => setUserStatus.mutate({ id: u.id, status: "active" })}><RotateCcw size={15} /> Reinstate</button>
              ) : (
                <button className="btn btn-ghost btn-sm text-error" onClick={() => setToSuspend(u)}><Ban size={15} /> Suspend</button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} className="mt-6" />

      <ConfirmDialog open={Boolean(toReject)} title={`Reject ${toReject?.name ?? "this application"}?`} description="They'll be notified and can apply again." confirmLabel="Reject application" tone="danger" reasonLabel="Note for the applicant" reasonRequired loading={decide.isPending} onClose={() => setToReject(null)} onConfirm={(note) => toReject && decide.mutate({ id: toReject.id, decision: "reject", note }, { onSuccess: () => setToReject(null) })} />
      <ConfirmDialog open={Boolean(toSuspend)} title={`Suspend ${toSuspend?.name ?? "this host"}?`} description="All of their listings are hidden until they're reinstated." confirmLabel="Suspend host" tone="danger" reasonLabel="Reason" reasonRequired loading={setUserStatus.isPending} onClose={() => setToSuspend(null)} onConfirm={(reason) => toSuspend && setUserStatus.mutate({ id: toSuspend.id, status: "suspended", reason }, { onSuccess: () => setToSuspend(null) })} />
    </div>
  );
}
