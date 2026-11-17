import type { Metadata } from "next";
import { OwnerCars } from "@/components/owner/OwnerCars";

export const metadata: Metadata = { title: "My Cars" };

export default function Page() {
  return <OwnerCars />;
}
