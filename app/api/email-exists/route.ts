import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/**
 * BetterAuth deliberately answers a duplicate sign-up with a generic success when auto sign-in is off (so attackers
 * can't probe for accounts). For a friendlier form we check explicitly and say so, which is the usual trade-off
 * for a consumer marketplace.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@") || email.length > 254) return NextResponse.json({ exists: false });
  const count = await getDb().collection("user").countDocuments({ email }, { limit: 1 });
  return NextResponse.json({ exists: count > 0 });
}
