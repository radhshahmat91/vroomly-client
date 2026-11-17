import type { Metadata } from "next";
import { Benefits } from "@/components/home/Benefits";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { HostCta } from "@/components/home/HostCta";
import { HowItWorks } from "@/components/home/HowItWorks";
import { StatsStrip } from "@/components/home/StatsStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { TopRated } from "@/components/home/TopRated";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: { absolute: `${SITE.name} | ${SITE.tagline}` } };

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <BrandMarquee />
      <CategoryGrid />
      <TopRated />
      <HowItWorks />
      <Benefits />
      <HostCta />
      <Testimonials />
      <Faq />
      <ClosingCta />
    </>
  );
}
