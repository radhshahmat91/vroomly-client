"use client";

import { CalendarCheck, CalendarClock, CreditCard, Flag, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ReviewModal } from "@/components/booking/ReviewModal";
import { PageLoader } from "@/components/ui/Spinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/context/AuthContext";
import { useBookingSummary } from "@/hooks/useBookings";
import { fmtRange, money } from "@/lib/utils";
import type { Booking } from "@/types";

export function DashboardHome() {
  const { user } = useAuth();
  const { data, isLoading } = useBookingSummary();
  const [toReview, setToReview] = useState<Booking | null>(null);

  if (isLoading || !data) return <PageLoader label="Loading your dashboard…" />;
  const { counts, next, toPay, toReview: reviewList } = data;
  const attention = toPay.length + reviewList.length;

  return (
    <div>
      <PageHeader title={`Hi, ${user?.name.split(" ")[0] ?? "there"}`} subtitle="Here's what's happening with your trips." actions={<Link href="/cars" className="btn btn-primary">Browse cars</Link>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="primary" label="Confirmed trips" value={counts.confirmed} icon={<CalendarCheck size={18} />} hint="Paid and locked in" />
        <StatCard label="Awaiting host" value={counts.pending} icon={<CalendarClock size={18} />} hint="Requests not yet answered" />
        <StatCard label="Ready to pay" value={counts.accepted} icon={<CreditCard size={18} />} hint="Accepted by the host" />
        <StatCard label="Completed" value={counts.completed} icon={<Star size={18} />} hint="Trips you've taken" />
      </div>

      {next && (
        <section className="mt-8 overflow-hidden rounded-box bg-neutral text-neutral-content sm:flex">
          <SmartImage src={next.car.images[0]?.url} alt={next.car.title} className="aspect-[16/9] w-full object-cover sm:aspect-auto sm:w-72" />
          <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
            <p className="text-sm font-semibold text-primary">Your next trip</p>
            <h2 className="mt-1 font-display text-4xl font-bold leading-tight text-white">{next.car.title}</h2>
            <p className="mt-2 text-neutral-content/80">{fmtRange(next.startDate, next.endDate)}, hosted by {next.owner.name} in {next.car.city}</p>
            <Link href="/dashboard/bookings?tab=confirmed" className="btn btn-primary mt-5 w-fit">View trip details</Link>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-3xl font-bold">Needs your attention</h2>
        {attention === 0 ? (
          <p className="mt-3 rounded-box bg-base-200 p-6 text-base-content/70">You&apos;re all caught up. Nothing is waiting on you right now.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {toPay.map((b) => (
              <li key={b.id} className="surface flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                  <SmartImage src={b.car.images[0]?.url} alt="" className="h-14 w-20 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold">{b.car.title}</p>
                    <p className="text-sm text-base-content/65">Accepted by the host for {fmtRange(b.startDate, b.endDate)}</p>
                  </div>
                </div>
                <Link href={`/checkout/${b.id}`} className="btn btn-primary btn-sm">Pay {money(b.pricing.total, { cents: true })}</Link>
              </li>
            ))}
            {reviewList.map((b) => (
              <li key={b.id} className="surface flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                  <SmartImage src={b.car.images[0]?.url} alt="" className="h-14 w-20 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold">{b.car.title}</p>
                    <p className="text-sm text-base-content/65">How was your trip? {fmtRange(b.startDate, b.endDate)}</p>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => setToReview(b)}><Star size={16} /> Leave a review</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-box bg-base-200 p-6">
        <div>
          <h2 className="font-display text-2xl font-bold">Something not right?</h2>
          <p className="text-base-content/70">Report a problem with a booking, a payment or a host and our team will respond.</p>
        </div>
        <Link href="/dashboard/complaints" className="btn btn-outline"><Flag size={18} /> Report a problem</Link>
      </section>

      <ReviewModal booking={toReview} onClose={() => setToReview(null)} />
    </div>
  );
}
