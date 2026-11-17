"use client";

import { CalendarDays, CreditCard, MessageSquareQuote, Star, X } from "lucide-react";
import Link from "next/link";
import { BookingBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { SmartImage } from "@/components/ui/SmartImage";
import { BOOKING_STATUS } from "@/lib/constants";
import { fmtRange, money, pluralize, toISODate } from "@/lib/utils";
import type { Booking } from "@/types";

interface Props {
  booking: Booking;
  onCancel: (b: Booking) => void;
  onReview: (b: Booking) => void;
}

export function RenterBookingCard({ booking: b, onCancel, onReview }: Props) {
  const today = toISODate(new Date());
  const canCancel = b.status === "pending" || b.status === "accepted" || (b.status === "confirmed" && b.startDate >= today);

  return (
    <article className="surface overflow-hidden sm:flex">
      <Link href={`/cars/${b.car.id}`} className="block shrink-0 sm:w-56">
        <SmartImage src={b.car.images[0]?.url} alt={b.car.title} className="aspect-[16/10] size-full object-cover sm:aspect-auto sm:h-full" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/cars/${b.car.id}`} className="font-display text-3xl font-bold leading-tight hover:underline">{b.car.title}</Link>
            <p className="mt-1 flex items-center gap-2 text-sm text-base-content/70"><Avatar name={b.owner.name} src={b.owner.image} size="xs" /> Hosted by {b.owner.name} in {b.car.city}</p>
          </div>
          <BookingBadge status={b.status} />
        </div>

        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div><dt className="text-base-content/60">Dates</dt><dd className="inline-flex items-center gap-1.5 font-semibold"><CalendarDays size={15} /> {fmtRange(b.startDate, b.endDate)} ({pluralize(b.days, "day")})</dd></div>
          <div><dt className="text-base-content/60">{b.paymentStatus === "paid" ? "Paid" : b.paymentStatus === "refunded" ? "Refunded" : "Total"}</dt><dd className="font-bold">{money(b.pricing.total, { cents: true })}</dd></div>
        </dl>

        {b.message && b.status === "pending" && <p className="mt-3 inline-flex items-start gap-2 text-sm text-base-content/65"><MessageSquareQuote size={16} className="mt-0.5 shrink-0" /> “{b.message}”</p>}
        {(b.status === "rejected" || b.status === "cancelled") && b.cancelReason && <p className="mt-3 text-sm text-base-content/70">Reason: {b.cancelReason}</p>}
        <p className="mt-3 text-sm text-base-content/60">{BOOKING_STATUS[b.status].hint}{b.paymentStatus === "refunded" ? " Your payment was refunded." : ""}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {b.status === "accepted" && <Link href={`/checkout/${b.id}`} className="btn btn-primary btn-sm"><CreditCard size={16} /> Pay {money(b.pricing.total, { cents: true })}</Link>}
          {b.status === "completed" && !b.reviewed && <button className="btn btn-primary btn-sm" onClick={() => onReview(b)}><Star size={16} /> Leave a review</button>}
          {b.status === "completed" && b.reviewed && <Link href="/dashboard/reviews" className="btn btn-ghost btn-sm">See your review</Link>}
          {canCancel && <button className="btn btn-ghost btn-sm text-error" onClick={() => onCancel(b)}><X size={16} /> Cancel{b.paymentStatus === "paid" ? " & refund" : ""}</button>}
          <Link href={`/cars/${b.car.id}`} className="btn btn-ghost btn-sm">View car</Link>
        </div>
      </div>
    </article>
  );
}
