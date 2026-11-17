import type { Metadata } from "next";
import { Suspense } from "react";
import { CarsExplorer } from "@/components/cars/CarsExplorer";
import { PageLoader } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "All Cars",
  description: "Search and filter cars from local hosts by brand, price, city, seats, fuel type and transmission.",
};

export default function CarsPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading cars…" />}>
      <CarsExplorer />
    </Suspense>
  );
}
