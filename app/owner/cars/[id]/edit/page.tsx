import type { Metadata } from "next";
import { EditCarView } from "@/components/owner/EditCarView";

export const metadata: Metadata = { title: "Edit Listing" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCarView id={id} />;
}
