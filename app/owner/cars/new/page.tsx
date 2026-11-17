import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CarForm } from "@/components/owner/CarForm";

export const metadata: Metadata = { title: "List a Car" };

export default function Page() {
  return (
    <div>
      <PageHeader title="List a car" subtitle="Tell renters about your car. Our team reviews every listing before it goes live." />
      <CarForm />
    </div>
  );
}
