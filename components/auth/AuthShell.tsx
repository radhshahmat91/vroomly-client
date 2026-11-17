import type { ReactNode } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { images } from "@/lib/images";

/** Split layout used by every auth screen: photo on the left, form on the right. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="container-x py-8 lg:py-14">
      <div className="grid overflow-hidden rounded-[2rem] border border-base-300 bg-base-100 lg:grid-cols-[1fr_1.05fr]">
        <div className="relative hidden min-h-[640px] lg:block">
          <SmartImage src={images.authPanel} alt="A red convertible beside the water at sunset" priority className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral/90 via-neutral/20 to-neutral/10" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="font-display text-5xl font-bold leading-[1.02]">Your next trip starts with a hello.</p>
            <p className="mt-3 max-w-sm text-white/80">Rent from local hosts, or put your own car to work while it&apos;s parked.</p>
          </div>
        </div>
        <div className="flex items-center p-6 sm:p-10 lg:p-14">
          <div className="mx-auto w-full max-w-md">
            <h1 className="font-display text-5xl font-bold leading-none">{title}</h1>
            {subtitle && <p className="mt-3 text-base-content/70">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
