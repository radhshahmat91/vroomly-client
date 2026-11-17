"use client";

import { Banknote, CalendarCheck, CalendarClock, Car, Plus, Star } from "lucide-react";
import Link from "next/link";
import { PageLoader } from "@/components/ui/Spinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { StatCard } from "@/components/ui/StatCard";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useOwnerBookings } from "@/hooks/useBookings";
import { useOwnerStats } from "@/hooks/useOwner";
import { fmtRange, money } from "@/lib/utils";

export function OwnerOverview() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useOwnerStats();
  const { data: pending } = useOwnerBookings("pending", 1);

  if (isLoading || !stats) return <PageLoader label="Loading your host dashboard…" />;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0] ?? "host"}`}
        subtitle="Requests, earnings and listings at a glance."
        actions={<Link href="/owner/cars/new" className="btn btn-primary"><Plus size={18} /> List a car</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard tone="primary" label="Earned this month" value={money(stats.earnings.thisMonth, { cents: true })} icon={<Banknote size={18} />} hint="After the platform fee" />
        <StatCard label="All-time earnings" value={money(stats.earnings.allTime, { cents: true })} icon={<Banknote size={18} />} hint={`${stats.earnings.trips} paid ${stats.earnings.trips === 1 ? "trip" : "trips"}`} />
        <StatCard label="Requests to answer" value={stats.pendingRequests} icon={<CalendarClock size={18} />} hint={stats.pendingRequests ? "Renters are waiting on you" : "You're all caught up"} />
        <StatCard label="Upcoming trips" value={stats.upcomingTrips} icon={<CalendarCheck size={18} />} hint="Paid and confirmed" />
        <StatCard label="Live listings" value={stats.listings.approved} icon={<Car size={18} />} hint={stats.listings.pending ? `${stats.listings.pending} in review` : `${stats.listings.total} in total`} />
        <StatCard label="Average rating" value={stats.rating.count ? stats.rating.average.toFixed(1) : "—"} icon={<Star size={18} />} hint={`${stats.rating.count} ${stats.rating.count === 1 ? "review" : "reviews"}`} />
      </div>

      {stats.listings.pending > 0 && (
        <div role="status" className="alert alert-info alert-soft mt-6"><span>{stats.listings.pending} {stats.listings.pending === 1 ? "listing is" : "listings are"} waiting for review by the Vroomly team. You&apos;ll be notified when {stats.listings.pending === 1 ? "it goes" : "they go"} live.</span></div>
      )}
      {stats.listings.rejected > 0 && (
        <div role="status" className="alert alert-warning alert-soft mt-4"><span>{stats.listings.rejected} {stats.listings.rejected === 1 ? "listing needs" : "listings need"} changes. <Link href="/owner/cars" className="font-bold underline">Review the notes</Link>.</span></div>
      )}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-bold">Waiting for your answer</h2>
          <Link href="/owner/bookings" className="btn btn-ghost btn-sm">All requests</Link>
        </div>
        {!pending || pending.data.length === 0 ? (
          <p className="mt-4 rounded-box bg-base-200 p-6 text-base-content/70">No pending requests right now. New ones appear here the moment they arrive.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.data.slice(0, 4).map((b) => (
              <li key={b.id} className="surface flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                  <SmartImage src={b.car.images[0]?.url} alt="" className="h-14 w-20 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold">{b.car.title}</p>
                    <p className="flex items-center gap-2 text-sm text-base-content/65"><Avatar name={b.renter.name} src={b.renter.image} size="xs" /> {b.renter.name}, {fmtRange(b.startDate, b.endDate)}</p>
                  </div>
                </div>
                <Link href="/owner/bookings" className="btn btn-outline btn-sm">Respond</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
