"use client";

import { Quote } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Stars } from "@/components/ui/StarRating";
import { useFeaturedReviews } from "@/hooks/useCars";
import { timeAgo } from "@/lib/utils";

export function Testimonials() {
  const { data } = useFeaturedReviews();
  const reviews = (data ?? []).slice(0, 3);
  if (reviews.length < 2) return null;

  return (
    <section className="container-x pt-28">
      <Reveal>
        <h2 className="section-title">What renters say</h2>
        <p className="section-sub">Straight from reviews left after completed trips.</p>
      </Reveal>
      <Stagger className="mt-10 grid gap-5 lg:grid-cols-3">
        {reviews.map((r) => (
          <StaggerItem key={r.id} className="h-full">
            <figure className="surface flex h-full flex-col p-7">
              <Quote size={30} className="text-primary" fill="currentColor" />
              <Stars value={r.rating} className="mt-4" />
              <blockquote className="mt-3 line-clamp-6 flex-1 text-lg leading-relaxed">{r.comment}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-base-300 pt-5">
                <Avatar name={r.renter.name} src={r.renter.image} />
                <div className="min-w-0">
                  <p className="truncate font-bold">{r.renter.name}</p>
                  <p className="truncate text-sm text-base-content/60">{r.car.title}, {timeAgo(r.createdAt)}</p>
                </div>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
