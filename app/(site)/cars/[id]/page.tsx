import type { Metadata } from "next";
import { Suspense } from "react";
import { CarDetails } from "@/components/cars/CarDetails";
import { PageLoader } from "@/components/ui/Spinner";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api").replace(/\/+$/, "");

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API}/cars/${id}`, { next: { revalidate: 120 }, signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const { data } = await res.json();
      return {
        title: data.title,
        description: String(data.description ?? "").slice(0, 155),
        openGraph: { title: `${data.title} in ${data.city}`, images: data.images?.[0]?.url ? [data.images[0].url] : undefined },
      };
    }
  } catch {
    /* the API may be asleep or offline — fall back to a generic title */
  }
  return { title: "Car details" };
}

export default async function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageLoader label="Loading car details…" />}>
      <CarDetails id={id} />
    </Suspense>
  );
}
