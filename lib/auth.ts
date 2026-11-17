import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { getDb } from "./mongodb";
import { sendMail } from "./mailer";

const isProd = process.env.NODE_ENV === "production";
const rawUrl = process.env.BETTER_AUTH_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || "";
const looksLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(rawUrl.replace(/\/+$/, ""));

// Fail loudly instead of quietly falling back to localhost. On a live site a wrong or missing value breaks login
// without any obvious error: BetterAuth answers 403 "Invalid origin", no cookie is set and /get-session returns null,
// so the navbar just looks logged out. (localhost is still fine for `next build && next start` on your own machine,
// but never on Vercel.)
if (isProd) {
  if (!(rawUrl.startsWith("https://") || (looksLocal && !process.env.VERCEL))) {
    throw new Error(
      "BETTER_AUTH_URL must be this app's public https:// URL, exactly as it appears in the browser's address bar (no trailing slash). " +
        `Current value: "${rawUrl || "(not set)"}".`,
    );
  }
  if (!process.env.BETTER_AUTH_SECRET) throw new Error("BETTER_AUTH_SECRET is not set. Generate one with: openssl rand -base64 32");
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set (use the same Atlas database as the Express API).");
}

const baseURL = (rawUrl || "http://localhost:3000").replace(/\/+$/, "");
const origin = new URL(baseURL).origin;

const googleReady = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

/**
 * All authentication lives here, in Next.js: BetterAuth + the MongoDB adapter.
 * The Express API never sees a password or a cookie — it only verifies the short-lived JWT that the `jwt`
 * plugin mints (see lib/token.ts), using the public keys at /api/auth/jwks.
 */
export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(getDb()),
  trustedOrigins: [origin],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    // After registering, people land on the login page (as the brief asks) instead of being signed in silently.
    autoSignIn: false,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Reset your Vroomly password",
        text: `Hi ${user.name},\n\nUse this link to choose a new password (it expires in one hour):\n${url}\n\nIf you didn't ask for this, you can ignore this email.`,
        html: `<p>Hi ${user.name},</p><p><a href="${url}">Choose a new password</a> — the link expires in one hour.</p><p>If you didn't ask for this, you can ignore this email.</p>`,
      });
    },
  },

  socialProviders: googleReady
    ? { google: { clientId: process.env.GOOGLE_CLIENT_ID as string, clientSecret: process.env.GOOGLE_CLIENT_SECRET as string } }
    : {},

  user: {
    additionalFields: {
      // Marketplace fields. `input: false` means nobody can set them from the sign-up form.
      role: { type: "string", required: false, defaultValue: "renter", input: false },
      status: { type: "string", required: false, defaultValue: "active", input: false },
      hostStatus: { type: "string", required: false, defaultValue: "none", input: false },
      phone: { type: "string", required: false, input: false },
      city: { type: "string", required: false, input: false },
      bio: { type: "string", required: false, input: false },
    },
  },

  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },

  plugins: [
    jwt({
      // The app fetches its JWT from /api/auth/token (lib/token.ts) and never reads the `set-auth-jwt` header.
      // Without this, every successful /get-session also signs a JWT with the key stored in the `jwks` collection;
      // if that key can't be read (e.g. BETTER_AUTH_SECRET differs from the one that created it), /get-session
      // fails and a correctly logged-in user looks logged out.
      disableSettingJwtHeader: true,
      jwt: { issuer: origin, audience: origin, expirationTime: "1h" },
    }),
    nextCookies(), // keep this last so server actions can set cookies
  ],
});
