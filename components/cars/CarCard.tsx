"use client";

import { motion } from "motion/react";
import { Fuel, MapPin, Settings2, Star, Users, Zap } from "lucide-react";
import Link from "next/link";
import { SmartImage } from "@/components/ui/SmartImage";
import { CATEGORY_OPTIONS } from "@/lib/constants";
import { cn, money } from "@/lib/utils";
import type { Car } from "@/types";

export const categoryLabel = (key: string) => CATEGORY_OPTIONS.find((c) => c.value === key)?.label.split(" /")[0] ?? key;

export function CarCard({ car, className }: { car: Car; className?: string }) {
  const bestDiscount = Math.max(car.weeklyDiscount || 0, car.monthlyDiscount || 0);
  const FuelIcon = car.fuelType === "electric" ? Zap : Fuel;

  return (
    <motion.article whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 320, damping: 24 }} className={cn("group h-full", className)}>
      <Link href={`/cars/${car.id}`} className="flex h-full flex-col rounded-3xl focus-visible:outline-offset-4" aria-label={`${car.title}, ${money(car.pricePerDay)} per day`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-base-200">
          <SmartImage src={car.images[0]?.url} alt={car.title} className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
          <span className="absolute left-3 top-3 rounded-full bg-base-100/90 px-3 py-1 text-xs font-bold text-base-content backdrop-blur">{categoryLabel(car.category)}</span>
          {typeof car.distanceKm === "number" && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-neutral/80 px-2.5 py-1 text-xs font-semibold text-neutral-content backdrop-blur">
              <MapPin size={12} /> {car.distanceKm} km away
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col pt-3.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 font-display text-[1.45rem] font-bold leading-[1.1]">{car.title}</h3>
            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-sm font-bold">
              <Star size={15} className="fill-primary text-primary" />
              {car.ratingCount ? car.ratingAvg.toFixed(1) : "New"}
              {car.ratingCount > 0 && <span className="font-medium text-base-content/55">({car.ratingCount})</span>}
            </span>
          </div>

          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-base-content/65">
            <MapPin size={14} /> {car.city}
          </p>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-base-content/75">
            <li className="inline-flex items-center gap-1.5"><Users size={15} /> {car.seats} seats</li>
            <li className="inline-flex items-center gap-1.5"><Settings2 size={15} /> {car.transmission === "automatic" ? "Automatic" : "Manual"}</li>
            <li className="inline-flex items-center gap-1.5"><FuelIcon size={15} /> {car.fuelType[0].toUpperCase() + car.fuelType.slice(1)}</li>
          </ul>

          <div className="mt-auto flex items-end justify-between gap-2 pt-4">
            <p className="leading-none">
              <span className="font-display text-[2rem] font-bold">{money(car.pricePerDay)}</span>
              <span className="text-sm text-base-content/60"> / day</span>
            </p>
            {bestDiscount > 0 && <span className="rounded-full bg-secondary/12 px-2.5 py-1 text-xs font-bold text-secondary">Save up to {bestDiscount}%</span>}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
