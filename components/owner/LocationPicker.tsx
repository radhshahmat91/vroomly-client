"use client";

import { LocateFixed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { hasGoogleMaps, loadGoogleMaps, osmEmbedUrl } from "@/lib/google-maps";

interface Props {
  lat?: number;
  lng?: number;
  onChange: (pos: { lat: number; lng: number }) => void;
}

/**
 * Pin the car's pick-up area. With a Google Maps key you can click the map or drag the marker;
 * without one you can still use your current location or type the coordinates.
 */
export function LocationPicker({ lat, lng, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!hasGoogleMaps) return;
    let cancelled = false;
    loadGoogleMaps().then((g) => {
      if (cancelled || !g || !ref.current) return;
      const center = { lat: lat ?? 37.7749, lng: lng ?? -122.4194 };
      const map = new g.maps.Map(ref.current, { center, zoom: lat !== undefined ? 14 : 3, disableDefaultUI: true, zoomControl: true, gestureHandling: "cooperative" });
      const marker = new g.maps.Marker({ map, position: center, draggable: true, visible: lat !== undefined && lng !== undefined });
      const emit = (pos: google.maps.LatLng | null | undefined) => pos && onChangeRef.current({ lat: Number(pos.lat().toFixed(5)), lng: Number(pos.lng().toFixed(5)) });
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        marker.setVisible(true);
        marker.setPosition(e.latLng);
        emit(e.latLng);
      });
      marker.addListener("dragend", () => emit(marker.getPosition()));
      mapRef.current = map;
      markerRef.current = marker;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
    // The map is created once; later coordinate changes are pushed in by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || lat === undefined || lng === undefined) return;
    markerRef.current?.setVisible(true);
    markerRef.current?.setPosition({ lat, lng });
    mapRef.current?.panTo({ lat, lng });
  }, [ready, lat, lng]);

  const locate = () => {
    if (!navigator.geolocation) return toast.error("Your browser can't share its location.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange({ lat: Number(pos.coords.latitude.toFixed(5)), lng: Number(pos.coords.longitude.toFixed(5)) });
      },
      () => {
        setLocating(false);
        toast.error("We couldn't get your location. Allow access, or type the coordinates instead.");
      },
      { timeout: 8000 },
    );
  };

  const hasPoint = lat !== undefined && lng !== undefined;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-base-content/65">{hasGoogleMaps ? "Click the map or drag the pin to set the pick-up area." : "Use your current location or enter coordinates below."}</p>
        <button type="button" className="btn btn-outline btn-sm" onClick={locate} disabled={locating}>
          {locating ? <span className="loading loading-spinner loading-xs" /> : <LocateFixed size={16} />} Use my location
        </button>
      </div>
      <div className="mt-3 h-64 overflow-hidden rounded-2xl border border-base-300 bg-base-200">
        {hasGoogleMaps ? <div ref={ref} className="size-full" /> : hasPoint ? <iframe title="Pick-up area" src={osmEmbedUrl(lat, lng)} className="size-full border-0" loading="lazy" /> : <div className="grid size-full place-items-center px-6 text-center text-sm text-base-content/60">Set a location to preview it here.</div>}
      </div>
    </div>
  );
}
