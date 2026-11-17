"use client";

import Link from "next/link";
import { CarCard } from "@/components/cars/CarCard";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { InlineLoader } from "@/components/ui/Spinner";
import { useFeaturedCars } from "@/hooks/useCars";

export function TopRated() {
  const { data, isLoading, isError } = useFeaturedCars();
  return (
    <section className="container-x pt-24">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="section-title">Top-rated cars</h2>
          <p className="section-sub">The cars renters rate highest, kept spotless by hosts who answer fast.</p>
        </div>
        <Link href="/cars?sort=rating" className="btn btn-outline">See all cars</Link>
      </Reveal>

      {isLoading && <InlineLoader label="Finding the best cars…" />}
      {isError && <p className="mt-10 rounded-box bg-base-200 p-6 text-center text-base-content/70">We couldn&apos;t load cars right now. Please refresh in a moment.</p>}
      {data && (
        <Stagger className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((car) => (
            <StaggerItem key={car.id} className="h-full">
              <CarCard car={car} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
