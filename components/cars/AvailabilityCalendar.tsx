"use client";

import { addMonths, startOfToday } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
import { parseDay } from "@/lib/utils";
import type { Availability } from "@/types";

/**
 * The calendar doubles as the date-range picker: days that are booked or blocked by the host are crossed out and
 * can't be selected, and a range can never swallow an unavailable day.
 */
export function AvailabilityCalendar({ availability, value, onChange }: { availability?: Availability; value?: DateRange; onChange: (range: DateRange | undefined) => void }) {
  const today = useMemo(() => startOfToday(), []);
  const [months, setMonths] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setMonths(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const unavailable = useMemo(
    () => [...(availability?.blocked ?? []), ...(availability?.booked ?? [])].map((r) => ({ from: parseDay(r.start), to: parseDay(r.end) })),
    [availability],
  );
  const disabled: Matcher[] = [{ before: today }, ...unavailable];

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 p-3 sm:p-5">
        <DayPicker
          mode="range"
          selected={value}
          onSelect={onChange}
          disabled={disabled}
          excludeDisabled
          numberOfMonths={months}
          startMonth={today}
          endMonth={addMonths(today, 12)}
          modifiers={{ unavailable }}
          modifiersClassNames={{ unavailable: "rdp-unavailable" }}
          showOutsideDays={false}
          className="mx-auto w-fit"
        />
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/70">
        <li className="inline-flex items-center gap-2"><span className="size-4 rounded-full border border-base-300" /> Available</li>
        <li className="inline-flex items-center gap-2"><span className="size-4 rounded-full bg-secondary" /> Your dates</li>
        <li className="inline-flex items-center gap-2"><span className="size-4 rounded-full bg-base-300 [background-image:repeating-linear-gradient(135deg,transparent_0_3px,rgb(0_0_0/0.12)_3px_5px)]" /> Booked or blocked by the host</li>
      </ul>
    </div>
  );
}
