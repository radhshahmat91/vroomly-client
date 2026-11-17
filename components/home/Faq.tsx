"use client";

import { Reveal } from "@/components/ui/Reveal";

const faqs = [
  { q: "How does booking work?", a: "You send a booking request with your dates. The host accepts or declines. If they accept, you pay by card to confirm the trip, and the dates are locked for you." },
  { q: "When am I charged?", a: "Only after the host accepts your request. Sending a request is free and nothing is taken from your card until you complete checkout." },
  { q: "Can I cancel a trip?", a: "Yes. Cancel any time before pick-up. If you've already paid, the full amount is refunded to your card." },
  { q: "What does it cost to host?", a: "Listing a car is free. Vroomly keeps a small platform fee from each paid trip and you receive the rest. Your earnings page shows every trip net of that fee." },
  { q: "Who checks the cars and hosts?", a: "Every host application and every listing is reviewed by the Vroomly team before it goes live, and renters can leave reviews after each completed trip." },
  { q: "What if something goes wrong?", a: "Report it from your dashboard under “Report a problem”. Our team reviews every complaint and replies in the app." },
];

export function Faq() {
  return (
    <section id="faq" className="container-x scroll-mt-24 pt-28">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
        <Reveal>
          <h2 className="section-title">Questions, answered</h2>
          <p className="section-sub">The short version of how renting and hosting work on Vroomly.</p>
        </Reveal>
        <Reveal delay={0.1} className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="collapse collapse-plus rounded-box border border-base-300 bg-base-100">
              <input type="radio" name="faq" defaultChecked={i === 0} aria-label={f.q} />
              <div className="collapse-title font-display text-2xl font-bold">{f.q}</div>
              <div className="collapse-content text-base-content/75">
                <p className="pb-2 pt-1">{f.a}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
