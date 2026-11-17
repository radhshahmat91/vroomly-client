"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { images } from "@/lib/images";

const points = ["You set the daily price and weekly or monthly discounts", "You accept or decline every request", "Block off days whenever you need the car", "Earnings are paid per trip, net of a small platform fee"];

export function HostCta() {
  return (
    <section className="container-x pt-28">
      <div className="grid overflow-hidden rounded-[2rem] bg-neutral text-neutral-content lg:grid-cols-2">
        <Reveal className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
          <h2 className="section-title text-white">Your car is parked most of the day. Put it to work.</h2>
          <p className="mt-4 max-w-lg text-lg text-neutral-content/75">List it in a few minutes, keep full control of who drives it, and earn every time it hits the road.</p>
          <ul className="mt-7 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-content"><Check size={14} strokeWidth={3} /></span>
                <span className="text-neutral-content/90">{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/become-host" className="btn btn-primary btn-lg">Become a host</Link>
            <Link href="/#faq" className="btn btn-lg border-white/30 bg-transparent text-white hover:bg-white/10">Hosting questions</Link>
          </div>
        </Reveal>
        <div className="relative min-h-72 lg:min-h-full">
          <SmartImage src={images.hostCta} alt="A red convertible parked on a quiet country road at sunset" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral via-neutral/10 to-transparent lg:from-neutral/60" />
        </div>
      </div>
    </section>
  );
}
