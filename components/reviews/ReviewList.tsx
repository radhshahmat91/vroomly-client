"use client";

import { MessageSquareReply } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { InlineLoader } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { Stars } from "@/components/ui/StarRating";
import { useCarReviews } from "@/hooks/useCars";
import { fmtDate } from "@/lib/utils";

export function ReviewList({ carId }: { carId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCarReviews(carId, page);
  const meta = data?.meta;
  const total = meta?.total ?? 0;

  if (isLoading) return <InlineLoader label="Loading reviews…" />;
  if (!data || total === 0) {
    return <p className="rounded-box bg-base-200 p-6 text-base-content/70">No reviews yet. Reviews appear after a renter completes a trip.</p>;
  }

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div>
          <p className="font-display text-6xl font-bold leading-none">{meta?.average.toFixed(1)}</p>
          <Stars value={meta?.average ?? 0} size={18} className="mt-2" />
          <p className="mt-1 text-sm text-base-content/60">{total} {total === 1 ? "review" : "reviews"}</p>
        </div>
        <ul className="space-y-1.5" aria-label="Rating breakdown">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = meta?.distribution?.[String(n)] ?? 0;
            return (
              <li key={n} className="flex items-center gap-3 text-sm">
                <span className="w-8 font-semibold">{n} ★</span>
                <progress className="progress progress-primary h-2 flex-1" value={total ? (count / total) * 100 : 0} max={100} aria-label={`${count} reviews with ${n} stars`} />
                <span className="w-6 text-right text-base-content/60">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <ul className="mt-8 divide-y divide-base-300">
        {data.data.map((r) => (
          <li key={r.id} className="py-6 first:pt-0">
            <div className="flex items-center gap-3">
              <Avatar name={r.renter.name} src={r.renter.image} />
              <div>
                <p className="font-bold leading-tight">{r.renter.name}</p>
                <p className="text-sm text-base-content/55">{fmtDate(r.createdAt, "MMMM yyyy")}</p>
              </div>
              <Stars value={r.rating} className="ml-auto" />
            </div>
            <p className="mt-3 leading-relaxed">{r.comment}</p>
            {r.reply?.text && (
              <div className="mt-4 rounded-2xl bg-base-200 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-bold"><MessageSquareReply size={16} /> Reply from the host</p>
                <p className="mt-1.5 text-base-content/80">{r.reply.text}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onChange={setPage} className="mt-4" />
    </div>
  );
}
