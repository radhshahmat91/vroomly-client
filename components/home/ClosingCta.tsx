"use client";

import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { images } from "@/lib/images";

export function ClosingCta() {
  return (
    <section className="container-x pt-28">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-neutral px-6 py-20 text-center text-white sm:px-12 sm:py-28">
        <SmartImage src={images.closing} alt="" className="absolute inset-0 -z-10 size-full object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-neutral via-neutral/50 to-neutral/70" />
        <Reveal>
          <h2 className="section-title mx-auto max-w-3xl text-white">Where to next?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Your next trip is a few taps away. Find a car near you and send your first request today.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/cars" className="btn btn-primary btn-lg">Find a car</Link>
            <Link href="/register" className="btn btn-lg border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20">Create a free account</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
