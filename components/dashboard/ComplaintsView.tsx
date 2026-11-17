"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LifeBuoy, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { InlineLoader } from "@/components/ui/Spinner";
import { ComplaintBadge } from "@/components/ui/StatusBadge";
import { useCreateComplaint, useMyComplaints } from "@/hooks/useAccount";
import { useMyBookings } from "@/hooks/useBookings";
import { COMPLAINT_CATEGORIES } from "@/lib/constants";
import { fmtDate, fmtRange } from "@/lib/utils";
import { complaintSchema, type ComplaintValues } from "@/lib/validators";

export function ComplaintsView() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useMyComplaints(page);
  const { data: bookings } = useMyBookings(undefined, 1);
  const create = useCreateComplaint();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintValues>({ resolver: zodResolver(complaintSchema), defaultValues: { category: "booking", bookingId: "", subject: "", description: "" } });

  const submit = (v: ComplaintValues) =>
    create.mutate(
      { subject: v.subject, description: v.description, category: v.category, bookingId: v.bookingId || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      },
    );

  return (
    <div>
      <PageHeader title="Report a problem" subtitle="Tell us what went wrong. A member of the team will review it and reply here." actions={<button className="btn btn-primary" onClick={() => setOpen(true)}><Plus size={18} /> New complaint</button>} />

      {isLoading && <InlineLoader label="Loading your complaints…" />}
      {data && data.data.length === 0 && (
        <EmptyState icon={<LifeBuoy size={26} />} title="No complaints" description="If a booking, payment or host gives you trouble, file a complaint and we'll look into it." action={<button className="btn btn-primary" onClick={() => setOpen(true)}>File a complaint</button>} />
      )}
      <ul className="space-y-4">
        {data?.data.map((c) => (
          <li key={c.id} className="surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-2xl font-bold leading-tight">{c.subject}</p>
                <p className="mt-1 text-sm text-base-content/60">Filed {fmtDate(c.createdAt)}{c.booking?.car?.title ? ` for ${c.booking.car.title}` : ""}</p>
              </div>
              <ComplaintBadge status={c.status} />
            </div>
            <p className="mt-3 text-base-content/80">{c.description}</p>
            {c.adminResponse && (
              <div className="mt-4 rounded-2xl bg-base-200 p-4">
                <p className="text-sm font-bold">Response from the Vroomly team{c.respondedAt ? `, ${fmtDate(c.respondedAt)}` : ""}</p>
                <p className="mt-1 text-base-content/80">{c.adminResponse}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} className="mt-8" />

      <Modal open={open} onClose={() => setOpen(false)} title="File a complaint" description="The more detail you share, the faster we can help.">
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormField label="What is it about?" htmlFor="c-cat">
            <select id="c-cat" className="select select-bordered w-full" {...register("category")}>
              {COMPLAINT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>
          <FormField label="Related booking" htmlFor="c-booking" hint="Optional">
            <select id="c-booking" className="select select-bordered w-full" {...register("bookingId")}>
              <option value="">Not about a specific booking</option>
              {bookings?.data.map((b) => <option key={b.id} value={b.id}>{b.car.title} — {fmtRange(b.startDate, b.endDate)}</option>)}
            </select>
          </FormField>
          <FormField label="Subject" htmlFor="c-subject" error={errors.subject?.message}>
            <input id="c-subject" className="input input-bordered w-full" placeholder="A short summary" {...register("subject")} />
          </FormField>
          <FormField label="What happened?" htmlFor="c-desc" error={errors.description?.message}>
            <textarea id="c-desc" rows={5} className="textarea textarea-bordered w-full" {...register("description")} />
          </FormField>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={create.isPending}>
              {create.isPending && <span className="loading loading-spinner loading-sm" />}
              Submit complaint
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
