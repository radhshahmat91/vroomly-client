"use client";

import { BadgeCheck, CarFront, ChevronRight, DoorOpen, Fuel, Gauge, MapPin, Route, Settings2, Users, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { BookingCard } from "@/components/booking/BookingCard";
import { ReviewList } from "@/components/reviews/ReviewList";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { PageLoader } from "@/components/ui/Spinner";
import { Stars } from "@/components/ui/StarRating";
import { CarStatusBadge } from "@/components/ui/StatusBadge";
import { useCar, useCarAvailability } from "@/hooks/useCars";
import { fmtDate, money, parseDay, toISODate } from "@/lib/utils";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { categoryLabel } from "./CarCard";
import { CarGallery } from "./CarGallery";
import { CarMap } from "./CarMap";

export function CarDetails({ id }: { id: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { data: car, isLoading, isError } = useCar(id);
  const { data: availability } = useCarAvailability(id);

  const [range, setRange] = useState<DateRange | undefined>(() => {
    const s = sp.get("start");
    const e = sp.get("end");
    return s && e ? { from: parseDay(s), to: parseDay(e) } : undefined;
  });

  // Keep the chosen dates in the address bar so they survive login redirects and reloads.
  const startKey = range?.from ? toISODate(range.from) : "";
  const endKey = range?.to ? toISODate(range.to) : "";
  useEffect(() => {
    const cur = `${sp.get("start") ?? ""}|${sp.get("end") ?? ""}`;
    if (cur === `${startKey}|${endKey}`) return;
    router.replace(startKey && endKey ? `${pathname}?start=${startKey}&end=${endKey}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startKey, endKey]);

  const specs = useMemo(() => {
    if (!car) return [];
    const FuelIcon = car.fuelType === "electric" ? Zap : Fuel;
    return [
      { icon: Users, label: "Seats", value: String(car.seats) },
      ...(car.doors ? [{ icon: DoorOpen, label: "Doors", value: String(car.doors) }] : []),
      { icon: Settings2, label: "Transmission", value: car.transmission === "automatic" ? "Automatic" : "Manual" },
      { icon: FuelIcon, label: "Fuel", value: car.fuelType[0].toUpperCase() + car.fuelType.slice(1) },
      { icon: Gauge, label: "Year", value: String(car.year) },
      { icon: CarFront, label: "Body style", value: categoryLabel(car.category) },
    ];
  }, [car]);

  if (isLoading) return <PageLoader label="Loading car details…" />;
  if (isError || !car) {
    return (
      <div className="container-x py-20">
        <EmptyState icon={<CarFront size={26} />} title="We couldn't find that car" description="It may have been removed by the host, or the link is out of date." action={<Link href="/cars" className="btn btn-primary">Browse all cars</Link>} />
      </div>
    );
  }

  const coords = car.location?.coordinates;
  const stats = car.ownerStats;

  return (
    <div className="container-x py-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-base-content/65">
        <Link href="/cars" className="hover:text-base-content">Cars</Link>
        <ChevronRight size={14} />
        <Link href={`/cars?city=${encodeURIComponent(car.city)}`} className="hover:text-base-content">{car.city}</Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-base-content">{car.title}</span>
      </nav>

      {car.status !== "approved" && (
        <div role="status" className="alert alert-warning mb-6">
          <span>This listing is <CarStatusBadge status={car.status} className="mx-1" /> and is only visible to you{car.adminNote ? ` — note from the review team: “${car.adminNote}”` : "."}</span>
        </div>
      )}

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">{car.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold">
              <Stars value={car.ratingAvg} />
              {car.ratingCount ? `${car.ratingAvg.toFixed(1)} (${car.ratingCount} ${car.ratingCount === 1 ? "review" : "reviews"})` : "No reviews yet"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-base-content/70"><MapPin size={16} /> {car.address ? `${car.address}, ` : ""}{car.city}</span>
            <span className="inline-flex items-center gap-1.5 text-base-content/70"><Route size={16} /> {car.tripsCount} {car.tripsCount === 1 ? "trip" : "trips"}</span>
          </div>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
        <div className="min-w-0 space-y-14">
          <CarGallery images={car.images} title={car.title} />

          <Reveal>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map((s) => (
                <li key={s.label} className="flex items-center gap-3 rounded-2xl bg-base-200 px-4 py-3.5">
                  <s.icon size={22} className="shrink-0 text-secondary" />
                  <div>
                    <p className="text-xs font-semibold text-base-content/60">{s.label}</p>
                    <p className="font-bold leading-tight">{s.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="font-display text-3xl font-bold">About this car</h2>
            <p className="mt-3 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-base-content/80">{car.description}</p>
            {car.features.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Features">
                {car.features.map((f) => <li key={f} className="rounded-full border border-base-300 px-3.5 py-1.5 text-sm font-semibold">{f}</li>)}
              </ul>
            )}
          </Reveal>

          <Reveal>
            <h2 className="font-display text-3xl font-bold">Choose your dates</h2>
            <p className="mt-1 text-base-content/70">Select a pick-up day, then a return day. Crossed-out days are already taken.</p>
            <div className="mt-5">
              <AvailabilityCalendar availability={availability} value={range} onChange={setRange} />
            </div>
          </Reveal>

          <Reveal>
            <h2 className="font-display text-3xl font-bold">Hosted by {car.owner.name}</h2>
            <div className="surface mt-5 flex flex-col gap-5 p-6 sm:flex-row">
              <Avatar name={car.owner.name} src={car.owner.image} size="xl" />
              <div className="min-w-0 flex-1">
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary"><BadgeCheck size={18} /> Approved by the Vroomly team</p>
                {car.owner.bio && <p className="mt-2 text-base-content/80">{car.owner.bio}</p>}
                <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                  {car.owner.createdAt && <div><dt className="text-base-content/60">Member since</dt><dd className="font-bold">{fmtDate(car.owner.createdAt, "MMMM yyyy")}</dd></div>}
                  {stats && <div><dt className="text-base-content/60">Trips hosted</dt><dd className="font-bold">{stats.tripsCount}</dd></div>}
                  {stats && stats.ratingCount > 0 && <div><dt className="text-base-content/60">Host rating</dt><dd className="font-bold">{stats.ratingAvg.toFixed(1)} ★</dd></div>}
                  {stats && <div><dt className="text-base-content/60">Cars listed</dt><dd className="font-bold">{stats.carsCount}</dd></div>}
                </dl>
              </div>
            </div>
          </Reveal>

          {coords && (
            <Reveal>
              <h2 className="font-display text-3xl font-bold">Pick-up area</h2>
              <p className="mt-1 text-base-content/70">{car.address ? `${car.address}, ` : ""}{car.city}. The host shares the exact meeting point once your trip is confirmed.</p>
              <div className="mt-5 h-80 overflow-hidden rounded-3xl border border-base-300">
                <CarMap lat={coords[1]} lng={coords[0]} title={car.title} />
              </div>
            </Reveal>
          )}

          <Reveal>
            <h2 className="font-display text-3xl font-bold">Reviews</h2>
            <div className="mt-5">
              <ReviewList carId={car.id} />
            </div>
          </Reveal>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <BookingCard car={car} range={range} onClear={() => setRange(undefined)} />
          <p className="mt-4 px-2 text-center text-sm text-base-content/60">Daily rate {money(car.pricePerDay)}. Hosts can decline requests, so you&apos;re never committed until you pay.</p>
        </aside>
      </div>
    </div>
  );
}
