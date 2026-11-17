import clsx, { type ClassValue } from "clsx";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export function money(value: number, { cents = false }: { cents?: boolean } = {}) {
  const showCents = cents || !Number.isInteger(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(value);
}

/** 'YYYY-MM-DD' (or a full ISO timestamp) → "Nov 5, 2026" in the viewer's calendar. */
export function fmtDate(iso: string, pattern = "MMM d, yyyy") {
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

export function fmtRange(start: string, end: string) {
  const s = parseISO(start);
  const e = parseISO(end);
  if (format(s, "yyyy") === format(e, "yyyy")) {
    return start === end ? format(s, "MMM d, yyyy") : `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
  }
  return `${format(s, "MMM d, yyyy")} – ${format(e, "MMM d, yyyy")}`;
}

export const timeAgo = (iso: string) => {
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
  } catch {
    return "";
  }
};

export const toISODate = (d: Date) => format(d, "yyyy-MM-dd");
export const parseDay = (iso: string) => parseISO(iso);

export function initials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

export const titleCase = (s = "") => s.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Only allow same-site redirects (prevents open-redirect abuse of ?redirect=). */
export function safeRedirect(path?: string | null, fallback = "/") {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  return path;
}

/** Turns a BetterAuth error into something a person can act on. 5xx usually means the database is unreachable. */
export function authErrorMessage(error: { status?: number; message?: string }, fallback: string) {
  if ((error.status ?? 0) >= 500) {
    return process.env.NODE_ENV === "production"
      ? "Something went wrong on our side. Please try again in a moment."
      : "The server couldn't reach MongoDB. Check MONGODB_URI in .env.local, and if the terminal says \"querySrv ECONNREFUSED\" add DNS_SERVERS=8.8.8.8,1.1.1.1 (see the README).";
  }
  return error.message || fallback;
}

export const pluralize = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const monthLabel = (ym: string) => {
  try {
    return format(parseISO(`${ym}-01`), "MMM yy");
  } catch {
    return ym;
  }
};
