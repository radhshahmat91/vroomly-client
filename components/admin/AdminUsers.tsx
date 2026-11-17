"use client";

import { Ban, RotateCcw, Users } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { InlineLoader } from "@/components/ui/Spinner";
import { RoleBadge } from "@/components/ui/StatusBadge";
import { useAdminUsers, useSetUserStatus } from "@/hooks/useAdmin";
import { useDebounced } from "@/hooks/useDebounced";
import { fmtDate } from "@/lib/utils";
import type { AppUser } from "@/types";
import { PersonCell, SearchInput, TableShell } from "./AdminBits";

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const q = useDebounced(search);
  const { data, isLoading } = useAdminUsers({ search: q, role, status, page, limit: 10 });
  const setUserStatus = useSetUserStatus();
  const [toSuspend, setToSuspend] = useState<AppUser | null>(null);

  const reset = (fn: () => void) => { fn(); setPage(1); };

  return (
    <div>
      <PageHeader title="Users" subtitle="Search accounts, and suspend or reinstate renters and hosts." />
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput value={search} onChange={(v) => reset(() => setSearch(v))} placeholder="Search name or email" />
        <select className="select select-bordered" value={role} onChange={(e) => reset(() => setRole(e.target.value))} aria-label="Filter by role">
          <option value="">All roles</option><option value="renter">Renters</option><option value="owner">Hosts</option>
        </select>
        <select className="select select-bordered" value={status} onChange={(e) => reset(() => setStatus(e.target.value))} aria-label="Filter by status">
          <option value="">Any status</option><option value="active">Active</option><option value="suspended">Suspended</option>
        </select>
      </div>

      {isLoading && <InlineLoader label="Loading users…" />}
      {data && data.data.length === 0 && <EmptyState icon={<Users size={26} />} title="No users match" description="Try a different search or filter." />}
      {data && data.data.length > 0 && (
        <TableShell>
          <thead><tr><th>User</th><th>Role</th><th>City</th><th>Joined</th><th>Status</th><th className="text-right">Action</th></tr></thead>
          <tbody>
            {data.data.map((u) => (
              <tr key={u.id}>
                <td><PersonCell name={u.name} email={u.email} image={u.image} /></td>
                <td><RoleBadge role={u.role} /></td>
                <td>{u.city || "—"}</td>
                <td className="whitespace-nowrap">{u.createdAt ? fmtDate(u.createdAt) : "—"}</td>
                <td>{u.status === "suspended" ? <span className="badge badge-error badge-soft font-semibold">Suspended</span> : <span className="badge badge-success badge-soft font-semibold">Active</span>}</td>
                <td className="text-right">
                  {u.status === "suspended" ? (
                    <button className="btn btn-outline btn-sm" disabled={setUserStatus.isPending} onClick={() => setUserStatus.mutate({ id: u.id, status: "active" })}><RotateCcw size={15} /> Reinstate</button>
                  ) : (
                    <button className="btn btn-ghost btn-sm text-error" onClick={() => setToSuspend(u)}><Ban size={15} /> Suspend</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} className="mt-6" />

      <ConfirmDialog
        open={Boolean(toSuspend)}
        title={`Suspend ${toSuspend?.name ?? "this user"}?`}
        description={toSuspend?.role === "owner" ? "They'll be signed out of the API and all of their listings are hidden until they're reinstated." : "They'll lose access to bookings and the dashboard until they're reinstated."}
        confirmLabel="Suspend account"
        tone="danger"
        reasonLabel="Reason (kept in the audit trail)"
        reasonRequired
        loading={setUserStatus.isPending}
        onClose={() => setToSuspend(null)}
        onConfirm={(reason) => toSuspend && setUserStatus.mutate({ id: toSuspend.id, status: "suspended", reason }, { onSuccess: () => setToSuspend(null) })}
      />
    </div>
  );
}
