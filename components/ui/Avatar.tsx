"use client";

import { useEffect, useState } from "react";
import { cn, initials } from "@/lib/utils";

const sizes = { xs: "size-6 text-[10px]", sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg", xl: "size-24 text-3xl" };

export function Avatar({ name, src, size = "md", className }: { name?: string; src?: string | null; size?: keyof typeof sizes; className?: string }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-display font-bold text-primary-content", sizes[size], className)}>
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ? `${name}'s photo` : ""} className="size-full object-cover" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
