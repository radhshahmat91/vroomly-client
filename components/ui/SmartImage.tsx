"use client";

import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { PLACEHOLDER } from "@/lib/images";

type Props = ImgHTMLAttributes<HTMLImageElement> & { fallback?: string; priority?: boolean };

/** <img> that swaps to a local illustration if the remote photo is missing or slow to fail. */
export function SmartImage({ src, alt = "", fallback = PLACEHOLDER, priority = false, className, ...rest }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={failed || !src ? fallback : src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}
