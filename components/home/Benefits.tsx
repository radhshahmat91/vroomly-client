"use client";

import { BellRing, CalendarX2, Receipt, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";

const benefits = [
  { icon: ShieldCheck, title: "Reviewed hosts and cars", text: "Hosts apply and listings are approved by the Vroomly team before anyone can book them." },
  { icon: Receipt, title: "Prices you can read", text: "See the daily rate, long-stay discounts and your total before you send a request. Nothing is added at pick-up." },
  { icon: CalendarX2, title: "Free cancellation before pick-up", text: "If plans change, cancel before the trip starts and a paid booking is refunded in full." },
  { icon: BellRing, title: "Live updates", text: "Get a notification the second a host answers, a payment lands or a review comes in." },
];

export function Benefits() {
  return (
    <section className="container-x pt-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:items-center">
        <Reveal>
          <h2 className="section-title">Rent with confidence</h2>
          <p className="section-sub">Peer-to-peer shouldn&apos;t feel risky. Vroomly puts the checks, the receipts and the support in one place.</p>
          <Link href="/cars" className="btn btn-primary btn-lg mt-8">Find a car</Link>
        </Reveal>
        <Stagger className="grid gap-4 sm:grid-cols-2">
          {benefits.map((b) => (
            <StaggerItem key={b.title} className="h-full">
              <div className="surface h-full p-6 transition-colors hover:border-primary">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/30"><b.icon size={24} /></span>
                <h3 className="mt-5 font-display text-2xl font-bold leading-tight">{b.title}</h3>
                <p className="mt-2 text-base-content/70">{b.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
