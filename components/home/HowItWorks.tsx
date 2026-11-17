"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { CarFront, CreditCard, Search, Send } from "lucide-react";
import { useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  { icon: Search, title: "Find your car", text: "Search by city and dates, then narrow by body style, seats, fuel and price. Every listing has been reviewed by our team." },
  { icon: Send, title: "Send a request", text: "Tell the host when you want to drive. They accept or decline, and you're notified the moment they answer." },
  { icon: CreditCard, title: "Pay securely", text: "Once your request is accepted you pay by card through Stripe. Your trip is confirmed instantly." },
  { icon: CarFront, title: "Pick up and drive", text: "Meet the host, enjoy the trip, then leave a review. Plans change? Cancel before pick-up for a full refund." },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const carLeft = useTransform(progress, [0, 1], ["4%", "92%"]);
  const fill = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how-it-works" className="container-x scroll-mt-24 pt-28">
      <Reveal>
        <h2 className="section-title">How Vroomly works</h2>
        <p className="section-sub">Four steps between you and the open road.</p>
      </Reveal>

      <div ref={ref} className="relative mt-14">
        {/* Road: dashed lane line with a car that follows your scroll (desktop) */}
        <div className="pointer-events-none absolute inset-x-0 top-8 hidden lg:block" aria-hidden="true">
          <div className="road-dashes text-base-300" />
          <motion.div className="road-dashes absolute left-0 top-0 text-primary" style={{ width: fill }} />
          <motion.svg viewBox="0 0 120 48" className="absolute -top-[22px] h-11 w-24 -translate-x-1/2 drop-shadow-lg" style={{ left: carLeft }}>
            <path d="M6 34c0-8 4-13 11-15l14-5c5-6 11-10 20-10h22c8 1 14 5 20 12l12 3c7 2 11 6 11 13v4H6z" fill="#ffc21a" />
            <path d="M40 18l9-9c3-3 6-4 10-4h17c4 0 7 2 10 5l7 8z" fill="#1b1f24" opacity=".85" />
            <circle cx="36" cy="38" r="8" fill="#1b1f24" />
            <circle cx="92" cy="38" r="8" fill="#1b1f24" />
            <circle cx="36" cy="38" r="3" fill="#ffc21a" />
            <circle cx="92" cy="38" r="3" fill="#ffc21a" />
          </motion.svg>
        </div>

        <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-8">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              className="relative flex gap-5 lg:block lg:pt-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative z-10 grid size-16 shrink-0 place-items-center rounded-full bg-primary text-primary-content shadow-lg shadow-primary/30 lg:absolute lg:left-0 lg:top-0">
                <s.icon size={26} />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-secondary">Step {i + 1}</p>
                <h3 className="font-display text-3xl font-bold leading-tight">{s.title}</h3>
                <p className="mt-2 text-base-content/70">{s.text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
