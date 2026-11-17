"use client";

import { useEffect, useRef, useState } from "react";
import { hasGoogleMaps, loadGoogleMaps, osmEmbedUrl } from "@/lib/google-maps";

/** Google Maps when an API key is configured, otherwise a keyless OpenStreetMap embed. */
export function CarMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"loading" | "google" | "osm">(hasGoogleMaps ? "loading" : "osm");

  useEffect(() => {
    if (!hasGoogleMaps) return;
    let cancelled = false;
    loadGoogleMaps().then((g) => {
      if (cancelled) return;
      if (!g || !ref.current) return setMode("osm");
      const map = new g.maps.Map(ref.current, { center: { lat, lng }, zoom: 14, disableDefaultUI: true, zoomControl: true, gestureHandling: "cooperative" });
      new g.maps.Marker({ position: { lat, lng }, map, title });
      setMode("google");
    });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, title]);

  if (mode === "osm") {
    return <iframe title={`Map showing where ${title} is located`} src={osmEmbedUrl(lat, lng)} className="size-full border-0" loading="lazy" />;
  }
  return (
    <div className="relative size-full">
      <div ref={ref} className="size-full" />
      {mode === "loading" && <div className="absolute inset-0 grid place-items-center bg-base-200"><span className="loading loading-spinner text-secondary" /></div>}
    </div>
  );
}
