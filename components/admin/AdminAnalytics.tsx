"use client";

import { BadgeCheck, Banknote, CalendarDays, Car, DollarSign, Flag, Users } from "lucide-react";
import Link from "next/link";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { StatusChart } from "@/components/charts/StatusChart";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageLoader } from "@/components/ui/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { useAdminAnalytics } from "@/hooks/useAdmin";
import { money } from "@/lib/utils";

export function AdminAnalytics() {
  const { data, isLoading, isError } = useAdminAnalytics();
  if (isLoading) return <PageLoader label="Loading analytics…" />;
  if (isError || !data) return <p className="rounded-box bg-error/10 p-6 text-error">We couldn&apos;t load the analytics. Please refresh.</p>;

  const { kpis, queues } = data;
  const queueCards = [
    { label: "Host applications", count: queues.pendingHosts, href: "/admin/owners", icon: BadgeCheck, hint: "waiting for a decision" },
    { label: "Listings to review", count: queues.pendingCars, href: "/admin/cars", icon: Car, hint: "waiting for moderation" },
    { label: "Open complaints", count: queues.openComplaints, href: "/admin/complaints", icon: Flag, hint: "need a response" },
  ];

  return (
    <div>
      <PageHeader title="Marketplace analytics" subtitle="How Vroomly is doing right now." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard tone="primary" label="Gross bookings" value={money(kpis.grossRevenue, { cents: true })} icon={<DollarSign size={18} />} hint={`${kpis.payments} successful payments`} />
        <StatCard tone="dark" label="Platform commission" value={money(kpis.commission, { cents: true })} icon={<Banknote size={18} />} hint="Vroomly's share" />
        <StatCard label="Bookings" value={kpis.bookings} icon={<CalendarDays size={18} />} hint={`${kpis.completedTrips} completed trips`} />
        <StatCard label="Users" value={kpis.users} icon={<Users size={18} />} hint="Renters and hosts" />
        <StatCard label="Hosts" value={kpis.hosts} icon={<BadgeCheck size={18} />} hint="Approved vehicle owners" />
        <StatCard label="Live cars" value={kpis.cars} icon={<Car size={18} />} hint="Approved listings" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {queueCards.map((q) => (
          <Link key={q.label} href={q.href} className="surface group flex items-center gap-4 p-5 transition-colors hover:border-primary">
            <span className={`grid size-12 place-items-center rounded-2xl ${q.count ? "bg-primary" : "bg-base-200"}`}><q.icon size={22} /></span>
            <div>
              <p className="font-display text-4xl font-bold leading-none">{q.count}</p>
              <p className="text-sm font-semibold">{q.label}</p>
              <p className="text-xs text-base-content/55">{q.hint}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="surface p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl font-bold">Revenue by month</h2>
            <ul className="flex gap-5 text-sm">
              <li className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-secondary" /> Gross</li>
              <li className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-primary" /> Commission</li>
            </ul>
          </div>
          <RevenueChart data={data.revenueByMonth} />
        </section>
        <section className="surface p-5 sm:p-6">
          <h2 className="mb-2 font-display text-3xl font-bold">Bookings by status</h2>
          <StatusChart data={data.bookingsByStatus} />
        </section>
      </div>
    </div>
  );
}
