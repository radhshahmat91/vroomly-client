import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { NotFoundRoad } from "@/components/ui/NotFoundRoad";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="container-x grid min-h-[70vh] place-items-center py-16">
        <div className="w-full max-w-2xl text-center">
          <NotFoundRoad />
          <h1 className="mt-4 font-display text-5xl font-bold sm:text-6xl">This road doesn&apos;t go anywhere</h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-base-content/70">The page you were looking for has moved, been removed, or never existed. Let&apos;s get you back on the route.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-primary btn-lg">Back to Home</Link>
            <Link href="/cars" className="btn btn-outline btn-lg">Browse cars</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
