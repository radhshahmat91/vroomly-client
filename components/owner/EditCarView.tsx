"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageLoader } from "@/components/ui/Spinner";
import { useCar } from "@/hooks/useCars";
import { CarForm } from "./CarForm";

export function EditCarView({ id }: { id: string }) {
  const { data: car, isLoading, isError } = useCar(id);
  if (isLoading) return <PageLoader label="Loading your listing…" />;
  if (isError || !car) return <EmptyState title="We couldn't find that listing" action={<Link href="/owner/cars" className="btn btn-primary">Back to my cars</Link>} />;
  return (
    <div>
      <PageHeader title={`Edit ${car.title}`} subtitle="Update the details renters see." />
      <CarForm car={car} />
    </div>
  );
}
