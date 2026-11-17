import { MongoClient, type Db } from "mongodb";
import { applyDnsOverride } from "./mongo-uri";

declare global {
  // Development only: reuse one client across hot reloads (module state is reset on every reload).
  // eslint-disable-next-line no-var
  var _vroomlyMongo: MongoClient | undefined;
}

// Production: one client per server instance. Without this every getDb() call (e.g. /api/email-exists on each
// sign-up check) would open a brand-new client that is never closed, and leak connections on Atlas.
let prodClient: MongoClient | undefined;

applyDnsOverride();

/**
 * The same database the Express API uses — BetterAuth keeps users, sessions and accounts here.
 * `_vroomlyMongoUri` is set at server start (instrumentation.ts) when the network refuses mongodb+srv:// lookups
 * and the address had to be resolved over HTTPS instead.
 */
export function getDb(): Db {
  const uri = globalThis._vroomlyMongoUri ?? process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/vroomly";
  const client =
    process.env.NODE_ENV === "production"
      ? (prodClient ??= new MongoClient(uri))
      : (globalThis._vroomlyMongo ??= new MongoClient(uri));
  return client.db(process.env.MONGODB_DB || undefined);
}
