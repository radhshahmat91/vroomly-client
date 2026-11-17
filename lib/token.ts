/**
 * Short-lived JWT for the Express API.
 * BetterAuth (cookie session) mints it at /api/auth/token; we cache it in memory and refresh shortly before it expires.
 */
let cached: { token: string; exp: number } | null = null;
let inflight: Promise<string | null> | null = null;

function expiry(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : Date.now() + 5 * 60_000;
  } catch {
    return Date.now() + 5 * 60_000;
  }
}

export function clearAccessToken() {
  cached = null;
}

export async function getAccessToken(force = false): Promise<string | null> {
  if (!force && cached && cached.exp - 30_000 > Date.now()) return cached.token;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch("/api/auth/token", { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        cached = null;
        return null;
      }
      const body = (await res.json()) as { token?: string };
      if (!body.token) return null;
      cached = { token: body.token, exp: expiry(body.token) };
      return body.token;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
