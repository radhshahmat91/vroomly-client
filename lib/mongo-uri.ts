import dns from "node:dns";

/**
 * A "mongodb+srv://" address needs a DNS SRV (and TXT) lookup. Some networks refuse those lookups
 * ("querySrv ECONNREFUSED") even though ordinary browsing works. When that happens we ask a public
 * DNS-over-HTTPS resolver instead (plain HTTPS on port 443) and build the equivalent standard
 * "mongodb://host1,host2,host3/..." address, which needs no SRV lookup at all.
 * (Mirrors backend/src/utils/mongoUri.js.)
 */
const DEFAULT_DOH = ["https://cloudflare-dns.com/dns-query", "https://dns.google/resolve"];
const TXT_OPTIONS = new Set(["authsource", "replicaset", "loadbalanced"]);
const TYPES = { SRV: 33, TXT: 16 } as const;

declare global {
  // eslint-disable-next-line no-var
  var _vroomlyMongoUri: string | undefined;
}

const dohEndpoints = () => {
  const custom = (process.env.DOH_ENDPOINTS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return custom.length ? custom : DEFAULT_DOH;
};

async function dohQuery(name: string, type: keyof typeof TYPES): Promise<string[]> {
  let lastError: unknown;
  for (const base of dohEndpoints()) {
    try {
      const res = await fetch(`${base}?name=${encodeURIComponent(name)}&type=${type}`, {
        headers: { accept: "application/dns-json" },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { Status: number; Answer?: { type: number; data: string }[] };
      if (json.Status !== 0) throw new Error(`DNS status ${json.Status}`);
      return (json.Answer ?? []).filter((a) => a.type === TYPES[type]).map((a) => String(a.data));
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("no DNS-over-HTTPS endpoint available");
}

export function buildStandardUri(srvUri: string, srvData: string[], txtData: string[] = []) {
  const url = new URL(srvUri);
  const hosts = srvData.map((d) => {
    const [, , port, target] = d.trim().split(/\s+/);
    return `${target.replace(/\.$/, "")}:${port}`;
  });
  if (!hosts.length) throw new Error("no SRV records");

  const params = new URLSearchParams(url.search);
  if (!params.has("tls") && !params.has("ssl")) params.set("tls", "true");
  for (const txt of txtData) {
    const joined = txt.replace(/"\s+"/g, "").replace(/^"|"$/g, "");
    for (const [key, value] of new URLSearchParams(joined)) {
      if (TXT_OPTIONS.has(key.toLowerCase()) && !params.has(key)) params.set(key, value);
    }
  }
  const auth = url.username ? `${url.username}${url.password ? `:${url.password}` : ""}@` : "";
  const path = url.pathname && url.pathname !== "/" ? url.pathname : "/";
  return `mongodb://${auth}${hosts.join(",")}${path}?${params.toString()}`;
}

export function applyDnsOverride() {
  const servers = (process.env.DNS_SERVERS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

const HELP = [
  "",
  "  Your network is refusing the DNS lookup a mongodb+srv:// address needs, and the HTTPS fallback failed too,",
  "  so login and sign-up will fail. Fix it with ONE of these:",
  "    1. Develop against a local MongoDB: run `docker compose up -d` in the project root and set",
  "       MONGODB_URI=mongodb://127.0.0.1:27017/vroomly in .env.local (and backend/.env). Keep Atlas for deployment.",
  "    2. Change your computer's DNS to 8.8.8.8 / 1.1.1.1, or try a phone hotspot / turn off the VPN.",
  '    3. In Atlas choose Connect > Drivers > Node.js "2.2.12 or later" and use the long mongodb://host1,host2,host3 string.',
  "  In the backend folder, `npm run check-db` shows exactly which step fails.",
  "",
].join("\n");

/**
 * Runs once when the server starts (see instrumentation.ts). Works out the connection string the app should use and
 * stores it for lib/mongodb.ts, so BetterAuth keeps working even when the network refuses SRV lookups.
 */
export async function prepareMongoUri() {
  applyDnsOverride();
  const uri = process.env.MONGODB_URI ?? "";
  if (!uri.startsWith("mongodb+srv://")) return;

  let host: string;
  try {
    host = new URL(uri).hostname;
  } catch {
    return;
  }
  try {
    await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
    return; // the system resolver is fine — nothing to do
  } catch (systemError) {
    const code = (systemError as NodeJS.ErrnoException).code ?? "error";
    try {
      const [srv, txt] = await Promise.all([dohQuery(`_mongodb._tcp.${host}`, "SRV"), dohQuery(host, "TXT").catch(() => [] as string[])]);
      globalThis._vroomlyMongoUri = buildStandardUri(uri, srv, txt);
      console.warn(`[vroomly] Your DNS refused the Atlas SRV lookup (${code}); resolved the address over HTTPS instead.`);
    } catch (dohError) {
      console.error(`[vroomly] Could not resolve your MongoDB Atlas address (${code}); HTTPS fallback failed: ${(dohError as Error).message}`);
      console.error(HELP);
    }
  }
}
