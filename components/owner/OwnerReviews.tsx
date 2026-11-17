"use client";

import { MessageSquareReply, Star } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { InlineLoader } from "@/components/ui/Spinner";
import { Stars } from "@/components/ui/StarRating";
import { useOwnerReviews, useReplyReview } from "@/hooks/useReviews";
import { fmtDate } from "@/lib/utils";
import type { Review } from "@/types";

function ReplyBox({ review }: { review: Review }) {
  const existing = review.reply?.text ?? "";
  const [editing, setEditing] = useState(!existing);
  const [text, setText] = useState(existing);
  const reply = useReplyReview();

  if (!editing) {
    return (
      <div className="mt-4 rounded-2xl bg-base-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-sm font-bold"><MessageSquareReply size={16} /> Your reply</p>
          <button className="btn btn-ghost btn-xs" onClick={() => setEditing(true)}>Edit</button>
        </div>
        <p className="mt-1 text-base-content/80">{existing}</p>
      </div>
    );
  }
  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim().length < 2) return;
        reply.mutate({ id: review.id, text: text.trim() }, { onSuccess: () => setEditing(false) });
      }}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Reply publicly</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={800} placeholder="Thank the renter or add context. Replies appear under the review." className="textarea textarea-bordered w-full" />
      </label>
      <div className="mt-2 flex justify-end gap-2">
        {existing && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setText(existing); setEditing(false); }}>Cancel</button>}
        <button type="submit" className="btn btn-primary btn-sm" disabled={reply.isPending || text.trim().length < 2}>
          {reply.isPending && <span className="loading loading-spinner loading-xs" />}
          {existing ? "Save reply" : "Post reply"}
        </button>
      </div>
    </form>
  );
}

export function OwnerReviews() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOwnerReviews(page);

  return (
    <div>
      <PageHeader title="Reviews" subtitle={data && data.meta.total ? `${data.meta.total} reviews with a ${data.meta.average.toFixed(1)} average rating` : "What renters say about your cars."} />
      {isLoading && <InlineLoader label="Loading reviews…" />}
      {data && data.data.length === 0 && <EmptyState icon={<Star size={26} />} title="No reviews yet" description="Reviews appear after a renter completes a trip in one of your cars." />}
      <ul className="space-y-5">
        {data?.data.map((r) => (
          <li key={r.id} className="surface p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Avatar name={r.renter.name} src={r.renter.image} />
              <div>
                <p className="font-bold leading-tight">{r.renter.name}</p>
                <p className="text-sm text-base-content/60">{r.car.title}, {fmtDate(r.createdAt)}</p>
              </div>
              <Stars value={r.rating} className="ml-auto" />
            </div>
            <p className="mt-3 leading-relaxed">{r.comment}</p>
            <ReplyBox review={r} />
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} className="mt-8" />
    </div>
  );
}
