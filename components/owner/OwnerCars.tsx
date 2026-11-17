"use client";

import { CalendarClock, Car as CarIcon, Eye, Pencil, Plus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { InlineLoader } from "@/components/ui/Spinner";
import { SmartImage } from "@/components/ui/SmartImage";
import { CarStatusBadge } from "@/components/ui/StatusBadge";
import { useDeleteCar, useOwnerCars } from "@/hooks/useOwner";
import { money } from "@/lib/utils";
import type { Car } from "@/types";

export function OwnerCars() {
  const { data, isLoading } = useOwnerCars();
  const remove = useDeleteCar();
  const [toDelete, setToDelete] = useState<Car | null>(null);

  return (
    <div>
      <PageHeader title="My cars" subtitle="Your listings, their review status and quick controls." actions={<Link href="/owner/cars/new" className="btn btn-primary"><Plus size={18} /> List a car</Link>} />

      {isLoading && <InlineLoader label="Loading your cars…" />}
      {data && data.length === 0 && (
        <EmptyState icon={<CarIcon size={26} />} title="You haven't listed a car yet" description="Add photos, set your price and submit it for review. It usually takes about ten minutes." action={<Link href="/owner/cars/new" className="btn btn-primary">List your first car</Link>} />
      )}

      <ul className="space-y-5">
        {data?.map((car) => (
          <li key={car.id} className="surface overflow-hidden sm:flex">
            <SmartImage src={car.images[0]?.url} alt={car.title} className="aspect-[16/10] w-full object-cover sm:aspect-auto sm:w-60 sm:shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-3xl font-bold leading-tight">{car.title}</h2>
                  <p className="mt-1 text-sm text-base-content/65">{car.city}, {money(car.pricePerDay)} a day</p>
                </div>
                <CarStatusBadge status={car.status} />
              </div>

              {car.adminNote && (car.status === "rejected" || car.status === "removed") && (
                <p className="mt-3 rounded-xl bg-warning/15 p-3 text-sm"><strong>Note from the review team:</strong> {car.adminNote}</p>
              )}
              {car.status === "pending" && <p className="mt-3 text-sm text-base-content/65">Our team is reviewing this listing. It will go live as soon as it&apos;s approved.</p>}

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-base-content/70">
                <span className="inline-flex items-center gap-1.5"><Star size={15} className="fill-primary text-primary" /> {car.ratingCount ? `${car.ratingAvg.toFixed(1)} (${car.ratingCount})` : "No reviews yet"}</span>
                <span>{car.tripsCount} {car.tripsCount === 1 ? "trip" : "trips"}</span>
              </div>

              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <Link href={`/owner/cars/${car.id}/edit`} className="btn btn-outline btn-sm"><Pencil size={15} /> Edit</Link>
                <Link href="/owner/availability" className="btn btn-ghost btn-sm"><CalendarClock size={15} /> Availability</Link>
                <Link href={`/cars/${car.id}`} className="btn btn-ghost btn-sm"><Eye size={15} /> View listing</Link>
                <button className="btn btn-ghost btn-sm text-error" onClick={() => setToDelete(car)}><Trash2 size={15} /> Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete ${toDelete?.title ?? "this listing"}?`}
        description="This removes the listing and its photos. Cars with active bookings can't be deleted."
        confirmLabel="Delete listing"
        tone="danger"
        loading={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </div>
  );
}
