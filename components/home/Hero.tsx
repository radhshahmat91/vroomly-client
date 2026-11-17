"use client";

import { motion } from "motion/react";
import { CalendarDays, MapPin, Search, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { useCarsMeta, useFeaturedCars } from "@/hooks/useCars";
import { images } from "@/lib/images";
import { money, toISODate } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-1">
      <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay, ease }}>
        {children}
      </motion.span>
    </span>
  );
}

export function Hero() {
  const router = useRouter();
  const { data: meta } = useCarsMeta();
  const { data: featured } = useFeaturedCars();
  const today = toISODate(new Date());
  const [city, setCity] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");

  const spotlight = featured?.[0];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (start && end && end < start) {
      setError("The return date can't be before the pick-up date.");
      return;
    }
    if ((start && !end) || (!start && end)) {
      setError("Pick both a pick-up and a return date, or leave both empty.");
      return;
    }
    setError("");
    const q = new URLSearchParams();
    if (city.trim()) q.set("city", city.trim());
    if (start && end) {
      q.set("startDate", start);
      q.set("endDate", end);
    }
    router.push(`/cars${q.toString() ? `?${q}` : ""}`);
  };

  return (
    <section className="relative isolate overflow-hidden bg-neutral text-white">
      <motion.div className="absolute inset-0 -z-10" initial={{ scale: 1.12, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease }}>
        <SmartImage src={images.hero} alt="" priority className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral via-neutral/80 to-neutral/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral/90 via-transparent to-neutral/30" />
      </motion.div>

      <div className="container-x grid gap-10 pb-12 pt-16 sm:pt-24 lg:grid-cols-[1.6fr_1fr] lg:pb-14 lg:pt-28">
        <div>
          <h1 className="font-display text-[clamp(3rem,6.4vw,5.5rem)] font-extrabold leading-[0.92] tracking-tight">
            <Line delay={0.15}>The car you want,</Line>
            <Line delay={0.28}>from someone nearby.</Line>
          </h1>
          <motion.p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7, ease }}>
            Browse cars owned by local hosts, pick your dates and drive away. No counters, no queues, no surprise fees at pick-up.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.7, ease }}>
            <Link href="/cars" className="btn btn-primary btn-lg">Browse cars</Link>
            <Link href="/become-host" className="btn btn-lg border-white/40 bg-white/5 text-white backdrop-blur hover:bg-white/15">Become a host</Link>
          </motion.div>
        </div>

        {spotlight && (
          <motion.div className="hidden items-end justify-end lg:flex" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1, duration: 0.8, ease }}>
            <Link href={`/cars/${spotlight.id}`} className="animate-float block w-72 rounded-3xl bg-white/12 p-3 text-left shadow-2xl ring-1 ring-white/25 backdrop-blur-xl transition-colors hover:bg-white/20">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                <SmartImage src={spotlight.images[0]?.url} alt={spotlight.title} className="size-full object-cover" />
              </div>
              <div className="px-1.5 pb-1 pt-3">
                <p className="text-xs font-semibold text-white/70">Top rated right now</p>
                <p className="mt-0.5 font-display text-2xl font-bold leading-tight">{spotlight.title}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Star size={15} className="fill-primary text-primary" /> {spotlight.ratingCount ? spotlight.ratingAvg.toFixed(1) : "New"}
                  </span>
                  <span className="font-bold">{money(spotlight.pricePerDay)} / day</span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Lane markings drawing themselves along the bottom edge */}
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-3 w-full text-primary" preserveAspectRatio="none" viewBox="0 0 1000 6" aria-hidden="true">
        <motion.line x1="0" y1="3" x2="1000" y2="3" stroke="currentColor" strokeWidth="4" strokeDasharray="26 18" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: 0.6, ease: "easeInOut" }} />
      </svg>

      {/* Search */}
      <div className="container-x relative z-10 pb-16 sm:pb-20 lg:pb-24">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease }}
          aria-label="Search cars"
        >
          <div className="grid gap-2 rounded-[1.75rem] border border-base-300 bg-base-100 p-2.5 text-base-content shadow-2xl shadow-black/30 md:grid-cols-[1.3fr_1fr_1fr_auto]">
            <label className="flex items-center gap-3 rounded-2xl px-4 py-2.5 hover:bg-base-200 focus-within:bg-base-200">
              <MapPin size={20} className="shrink-0 text-secondary" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-base-content/60">Where</span>
                <input list="hero-cities" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City or neighbourhood" className="w-full bg-transparent font-semibold outline-none placeholder:font-medium placeholder:text-base-content/45" />
                <datalist id="hero-cities">{meta?.cities.map((c) => <option key={c} value={c} />)}</datalist>
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-2xl px-4 py-2.5 hover:bg-base-200 focus-within:bg-base-200">
              <CalendarDays size={20} className="shrink-0 text-secondary" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-base-content/60">Pick-up</span>
                <input type="date" min={today} value={start} onChange={(e) => { setStart(e.target.value); if (end && e.target.value > end) setEnd(e.target.value); }} className="w-full bg-transparent font-semibold outline-none" />
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-2xl px-4 py-2.5 hover:bg-base-200 focus-within:bg-base-200">
              <CalendarDays size={20} className="shrink-0 text-secondary" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-base-content/60">Return</span>
                <input type="date" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} className="w-full bg-transparent font-semibold outline-none" />
              </span>
            </label>
            <button type="submit" className="btn btn-primary btn-lg h-auto min-h-14 md:px-8">
              <Search size={20} /> Search cars
            </button>
          </div>
          {error && <p role="alert" className="mt-3 text-center text-sm font-semibold text-error">{error}</p>}
        </motion.form>
      </div>
    </section>
  );
}
