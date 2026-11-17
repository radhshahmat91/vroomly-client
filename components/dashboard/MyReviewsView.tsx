"use client";

import { MessageSquareReply, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { InlineLoader } from "@/components/ui/Spinner";
import { SmartImage } from "@/components/ui/SmartImage";
import { Stars } from "@/components/ui/StarRating";
import { useMyReviews } from "@/hooks/useReviews";
import { fmtDate } from "@/lib/utils";

export function MyReviewsView() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyReviews(page);

  return (
    <div>
      <PageHeader title="My reviews" subtitle="What you've said about the cars you've driven." />
      {isLoading && <InlineLoader label="Loading your reviews…" />}
      {data && data.data.length === 0 && (
        <EmptyState icon={<Star size={26} />} title="No reviews yet" description="After a trip is completed you can rate the car and the host from My bookings." action={<Link href="/dashboard/bookings?tab=completed" className="btn btn-primary">See completed trips</Link>} />
      )}
      <ul className="space-y-5">
        {data?.data.map((r) => (
          <li key={r.id} className="surface p-5 sm:flex sm:gap-5">
            <SmartImage src={r.car.images?.[0]?.url} alt="" className="mb-4 aspect-[16/10] w-full rounded-xl object-cover sm:mb-0 sm:h-28 sm:w-44 sm:shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/cars/${r.car.id}`} className="font-display text-2xl font-bold hover:underline">{r.car.title}</Link>
                <span className="text-sm text-base-content/55">{fmtDate(r.createdAt)}</span>
              </div>
              <Stars value={r.rating} className="mt-1" />
              <p className="mt-3">{r.comment}</p>
              {r.reply?.text && (
                <div className="mt-4 rounded-2xl bg-base-200 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-bold"><MessageSquareReply size={16} /> The host replied</p>
                  <p className="mt-1 text-base-content/80">{r.reply.text}</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} className="mt-8" />
    </div>
  );
}
