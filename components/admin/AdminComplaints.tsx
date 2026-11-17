"use client";

import { Flag, MessageSquareReply } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { InlineLoader } from "@/components/ui/Spinner";
import { ComplaintBadge, RoleBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { useAdminComplaints, useUpdateComplaint } from "@/hooks/useAdmin";
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUS } from "@/lib/constants";
import { fmtDate } from "@/lib/utils";
import type { AppUser, Complaint, ComplaintStatus } from "@/types";
import { PersonCell } from "./AdminBits";

const TABS = [
  { key: "open", label: "Open" },
  { key: "in_review", label: "In review" },
  { key: "resolved", label: "Resolved" },
  { key: "dismissed", label: "Dismissed" },
  { key: "all", label: "All" },
];

export function AdminComplaints() {
  const [tab, setTab] = useState("open");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminComplaints({ status: tab, page, limit: 8 });
  const update = useUpdateComplaint();
  const [active, setActive] = useState<Complaint | null>(null);
  const [status, setStatus] = useState<ComplaintStatus>("in_review");
  const [response, setResponse] = useState("");

  const openDialog = (c: Complaint) => {
    setActive(c);
    setStatus(c.status === "open" ? "in_review" : c.status);
    setResponse(c.adminResponse ?? "");
  };
  const category = (v: string) => COMPLAINT_CATEGORIES.find((c) => c.value === v)?.label ?? v;

  return (
    <div>
      <PageHeader title="Complaints" subtitle="Review reports from renters and hosts, and reply in the app." />
      <Tabs tabs={TABS.map((t) => ({ ...t, count: t.key === "open" ? data?.meta.open : undefined }))} value={tab} onChange={(k) => { setTab(k); setPage(1); }} />

      <div className="mt-6 space-y-4">
        {isLoading && <InlineLoader label="Loading complaints…" />}
        {data && data.data.length === 0 && <EmptyState icon={<Flag size={26} />} title="Nothing in this queue" description="Complaints from users will show up here." />}
        {data?.data.map((c) => {
          const user = typeof c.user === "object" ? (c.user as AppUser) : null;
          return (
            <article key={c.id} className="surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-bold leading-tight">{c.subject}</p>
                  <p className="mt-1 text-sm text-base-content/60">{category(c.category)}, filed {fmtDate(c.createdAt)}{c.booking?.car?.title ? ` for ${c.booking.car.title}` : ""}</p>
                </div>
                <ComplaintBadge status={c.status} />
              </div>
              {user && <div className="mt-4 flex items-center gap-3"><PersonCell name={user.name} email={user.email} image={user.image} /><RoleBadge role={user.role} className="badge-sm" /></div>}
              <p className="mt-4 text-base-content/80">{c.description}</p>
              {c.adminResponse && (
                <div className="mt-4 rounded-2xl bg-base-200 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-bold"><MessageSquareReply size={16} /> Response{c.respondedAt ? `, ${fmtDate(c.respondedAt)}` : ""}</p>
                  <p className="mt-1 text-base-content/80">{c.adminResponse}</p>
                </div>
              )}
              <button className="btn btn-primary btn-sm mt-4" onClick={() => openDialog(c)}>{c.adminResponse ? "Update response" : "Respond"}</button>
            </article>
          );
        })}
      </div>
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} className="mt-6" />

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title="Respond to complaint" description={active?.subject}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!active) return;
            update.mutate({ id: active.id, status, adminResponse: response.trim() }, { onSuccess: () => setActive(null) });
          }}
        >
          <FormField label="Status" htmlFor="cs">
            <select id="cs" className="select select-bordered w-full" value={status} onChange={(e) => setStatus(e.target.value as ComplaintStatus)}>
              {(Object.keys(COMPLAINT_STATUS) as ComplaintStatus[]).map((s) => <option key={s} value={s}>{COMPLAINT_STATUS[s].label}</option>)}
            </select>
          </FormField>
          <FormField label="Response" htmlFor="cr" hint="The user sees this in their dashboard and gets a notification.">
            <textarea id="cr" rows={5} maxLength={2000} value={response} onChange={(e) => setResponse(e.target.value)} className="textarea textarea-bordered w-full" />
          </FormField>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setActive(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={update.isPending || (status !== "open" && status !== "in_review" && response.trim().length < 3)}>
              {update.isPending && <span className="loading loading-spinner loading-sm" />}
              Save response
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
