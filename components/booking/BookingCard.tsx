"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck, Info, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useAuth } from "@/context/AuthContext";
import { useCreateBooking } from "@/hooks/useBookings";
import { estimatePrice, inclusiveDays } from "@/lib/pricing";
import { fmtDate, money, pluralize, toISODate } from "@/lib/utils";
import type { Car } from "@/types";

export function BookingCard({ car, range, onClear }: { car: Car; range?: DateRange; onClear: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const create = useCreateBooking();
  const [message, setMessage] = useState("");

  const from = range?.from;
  const to = range?.to ?? range?.from;
  const days = from && to ? inclusiveDays(from, to) : 0;
  const price = days ? estimatePrice(car.pricePerDay, days, car.weeklyDiscount, car.monthlyDiscount) : null;

  const isOwn = user?.id === car.owner.id;
  const live = car.status === "approved";

  const submit = () => {
    if (!user) {
      const back = `${pathname}${from && to ? `?start=${toISODate(from)}&end=${toISODate(to)}` : ""}`;
      router.push(`/login?redirect=${encodeURIComponent(back)}`);
      return;
    }
    if (!from || !to) return;
    create.mutate(
      { carId: car.id, startDate: toISODate(from), endDate: toISODate(to), message: message.trim() },
      { onSuccess: () => router.push("/dashboard/bookings?tab=pending") },
    );
  };

  const tiers = [car.weeklyDiscount > 0 && `${car.weeklyDiscount}% off 7+ days`, car.monthlyDiscount > 0 && `${car.monthlyDiscount}% off 30+ days`].filter(Boolean);

  return (
    <div id="booking" className="surface scroll-mt-28 p-6 shadow-xl shadow-black/5">
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-5xl font-bold leading-none">{money(car.pricePerDay)}</span>
        <span className="text-base-content/60">per day</span>
      </div>
      {tiers.length > 0 && <p className="mt-2 text-sm font-semibold text-secondary">{tiers.join(", ")}</p>}

      <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-base-300">
        <div className="border-r border-base-300 p-3.5">
          <p className="text-xs font-bold text-base-content/60">Pick-up</p>
          <p className="mt-0.5 font-semibold">{from ? fmtDate(toISODate(from), "EEE, MMM d") : "Add date"}</p>
        </div>
        <div className="p-3.5">
          <p className="text-xs font-bold text-base-content/60">Return</p>
          <p className="mt-0.5 font-semibold">{to ? fmtDate(toISODate(to), "EEE, MMM d") : "Add date"}</p>
        </div>
      </div>
      {!from ? (
        <p className="mt-3 inline-flex items-start gap-2 text-sm text-base-content/65"><Info size={16} className="mt-0.5 shrink-0" /> Choose your pick-up and return days in the calendar.</p>
      ) : (
        <button type="button" onClick={onClear} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-base-content/70 hover:text-base-content"><X size={14} /> Clear dates</button>
      )}

      <AnimatePresence initial={false}>
        {price && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <dl className="mt-5 space-y-2.5 border-t border-base-300 pt-5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-base-content/70">{money(car.pricePerDay)} × {pluralize(price.days, "day")}</dt>
                <dd className="font-semibold">{money(price.subtotal, { cents: true })}</dd>
              </div>
              {price.discountPercent > 0 && (
                <div className="flex justify-between gap-3 text-secondary">
                  <dt className="font-semibold">{price.days >= 30 ? "Monthly" : "Weekly"} discount ({price.discountPercent}%)</dt>
                  <dd className="font-bold">−{money(price.discountAmount, { cents: true })}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-3 border-t border-base-300 pt-3">
                <dt className="font-bold">Estimated total</dt>
                <dd className="font-display text-3xl font-bold leading-none">{money(price.total, { cents: true })}</dd>
              </div>
            </dl>
          </motion.div>
        )}
      </AnimatePresence>

      {live && !isOwn && user && (
        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-semibold">Message to the host <span className="font-normal text-base-content/55">(optional)</span></span>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={3} placeholder="Introduce yourself and share your plans" className="textarea textarea-bordered w-full" />
        </label>
      )}

      <button
        type="button"
        className="btn btn-primary btn-lg mt-5 w-full"
        disabled={!live || isOwn || create.isPending || (Boolean(user) && !from)}
        onClick={submit}
      >
        {create.isPending ? <span className="loading loading-spinner" /> : <CalendarCheck size={20} />}
        {isOwn ? "This is your listing" : !live ? "Not available to book" : !user ? "Log in to request" : "Request to book"}
      </button>
      <p className="mt-3 text-center text-xs text-base-content/60">You won&apos;t be charged yet. You only pay if the host accepts, and you can cancel free before pick-up.</p>
    </div>
  );
}
