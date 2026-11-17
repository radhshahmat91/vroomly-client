/** Loads the Google Maps JavaScript API once. Resolves to null when no API key is configured. */
declare global {
  interface Window {
    __vroomlyMapsReady?: () => void;
  }
}

let loader: Promise<typeof google | null> | null = null;

export const hasGoogleMaps = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

export function loadGoogleMaps(): Promise<typeof google | null> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key || typeof window === "undefined") return Promise.resolve(null);
  if (window.google?.maps) return Promise.resolve(window.google);
  if (!loader) {
    loader = new Promise((resolve) => {
      window.__vroomlyMapsReady = () => resolve(window.google);
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&v=weekly&loading=async&callback=__vroomlyMapsReady`;
      script.async = true;
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }
  return loader;
}

export const osmEmbedUrl = (lat: number, lng: number) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.012}%2C${lng + 0.02}%2C${lat + 0.012}&layer=mapnik&marker=${lat}%2C${lng}`;
