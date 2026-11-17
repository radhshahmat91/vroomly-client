"use client";

import { addMonths, startOfToday } from "date-fns";
import { CalendarClock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { InlineLoader } from "@/components/ui/Spinner";
import { useCarAvailability } from "@/hooks/useCars";
import { useAddBlocked, useOwnerCars, useRemoveBlocked } from "@/hooks/useOwner";
import { fmtRange, parseDay, toISODate } from "@/lib/utils";

export function AvailabilityManager() {
  const { data: cars, isLoading } = useOwnerCars();
  const [carId, setCarId] = useState<string>();
  const [range, setRange] = useState<DateRange>();
  const [reason, setReason] = useState("");
  const [months, setMonths] = useState(1);
  const add = useAddBlocked();
  const remove = useRemoveBlocked();
  const today = useMemo(() => startOfToday(), []);

  const car = cars?.find((c) => c.id === carId) ?? cars?.[0];
  const { data: availability } = useCarAvailability(car?.status === "approved" ? car.id : undefined);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setMonths(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const blocked = useMemo(() => (car?.blockedDates ?? []).map((b) => ({ from: parseDay(b.start), to: parseDay(b.end) })), [car]);
  const booked = useMemo(() => (availability?.booked ?? []).map((b) => ({ from: parseDay(b.start), to: parseDay(b.end) })), [availability]);
  const disabled: Matcher[] = [{ before: today }, ...blocked, ...booked];

  if (isLoading) return <InlineLoader label="Loading your cars…" />;
  if (!cars || cars.length === 0) {
    return <EmptyState icon={<CalendarClock size={26} />} title="Add a car first" description="Once you have a listing you can block off the days it isn't available." action={<Link href="/owner/cars/new" className="btn btn-primary">List a car</Link>} />;
  }

  const from = range?.from;
  const to = range?.to ?? range?.from;

  return (
    <div>
      <PageHeader title="Availability" subtitle="Block days for maintenance or personal use. Renters can't request blocked days, and days with a booking can't be blocked." />

      <label className="block max-w-sm">
        <span className="mb-1.5 block text-sm font-semibold">Car</span>
        <select className="select select-bordered w-full" value={car?.id} onChange={(e) => { setCarId(e.target.value); setRange(undefined); }}>
          {cars.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </label>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div>
          <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 p-3 sm:p-5">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              disabled={disabled}
              excludeDisabled
              numberOfMonths={months}
              startMonth={today}
              endMonth={addMonths(today, 12)}
              modifiers={{ blockedOwn: blocked, bookedOwn: booked }}
              modifiersClassNames={{ blockedOwn: "rdp-blocked-own", bookedOwn: "rdp-booked-own" }}
              showOutsideDays={false}
              className="mx-auto w-fit"
            />
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/70">
            <li className="inline-flex items-center gap-2"><span className="size-4 rounded-full bg-secondary" /> Selected to block</li>
            <li className="inline-flex items-center gap-2"><span className="size-4 rounded-full bg-warning/50" /> Blocked by you</li>
            <li className="inline-flex items-center gap-2"><span className="size-4 rounded-full bg-secondary/30" /> Booked by a renter</li>
          </ul>
        </div>

        <div className="space-y-6">
          <div className="surface p-5">
            <h2 className="font-display text-2xl font-bold">Block dates</h2>
            <p className="mt-1 text-sm text-base-content/65">{from && to ? fmtRange(toISODate(from), toISODate(to)) : "Select a start and end day in the calendar."}</p>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-semibold">Reason <span className="font-normal text-base-content/55">(only you see this)</span></span>
              <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={140} placeholder="Service, personal use…" className="input input-bordered w-full" />
            </label>
            <button
              className="btn btn-primary mt-4 w-full"
              disabled={!car || !from || !to || add.isPending}
              onClick={() => car && from && to && add.mutate({ id: car.id, start: toISODate(from), end: toISODate(to), reason: reason.trim() }, { onSuccess: () => { setRange(undefined); setReason(""); } })}
            >
              {add.isPending && <span className="loading loading-spinner loading-sm" />}
              Block these dates
            </button>
          </div>

          <div className="surface p-5">
            <h2 className="font-display text-2xl font-bold">Blocked periods</h2>
            {(car?.blockedDates?.length ?? 0) === 0 ? (
              <p className="mt-2 text-sm text-base-content/65">Nothing blocked. Renters can request any open day.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {car?.blockedDates?.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl bg-base-200 px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="font-semibold">{fmtRange(b.start, b.end)}</p>
                      {b.reason && <p className="truncate text-sm text-base-content/60">{b.reason}</p>}
                    </div>
                    <button className="btn btn-ghost btn-sm btn-circle text-error" onClick={() => car && remove.mutate({ id: car.id, blockId: b.id })} aria-label={`Unblock ${fmtRange(b.start, b.end)}`}><Trash2 size={16} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
