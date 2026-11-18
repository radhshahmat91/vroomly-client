# Vroomly — client

**Live site:** https://vroomly-client.vercel.app/
**Server repo:** https://github.com/radhshahmat91/vroomly-server
the Express API : https://vroomly-server.onrender.com

Vroomly is a peer-to-peer car rental marketplace. Renters search, book and pay for cars from local hosts; hosts list vehicles and manage requests and earnings; admins moderate the whole platform.

## Features

* **Search that scales** — keyword search, server-side pagination, sorting, and filters for brand, body style, price range, city, seats, fuel type, transmission and dates. Optional "cars near me" geo-radius search. Every search lives in the URL, so it can be shared and survives a reload.
* **Rich car pages** — spec sheet, photo gallery with thumbnails and a full-screen lightbox, host profile, location map (Google Maps, or OpenStreetMap when no key is set) and reviews with a rating breakdown.
* **Availability calendar that doubles as the date picker** — booked and host-blocked days are crossed out and can never be part of a selection; a live price estimate with weekly/monthly discounts updates as you pick dates.
* **Request-to-book with secure card payment** — the host accepts, then the renter pays through the Stripe Payment Element (test mode). Paid trips can be cancelled for a full refund before pick-up.
* **Reviews and replies** — one 1–5 star review per completed trip; hosts reply publicly.
* **Real-time notifications** — a bell with unread count plus a full page, pushed live over Socket.IO the moment a host answers or a payment lands.
* **Host dashboard** — add listings with multi-photo upload (Cloudinary), pricing tiers, availability blocking, accept/decline with automatic conflict resolution, a monthly earnings chart and a per-trip transactions table net of the platform fee.
* **Admin console** — approve hosts, moderate listings, suspend users, browse the bookings and payments ledgers, answer complaints, export the revenue report as CSV, and read KPI + revenue analytics.
* **Authentication done properly** — BetterAuth with the MongoDB adapter: email/password, Google sign-in, password reset, and private routes that send you to login and back. Reloading a private page never logs you out.
* **Polished, accessible UI** — light and dark themes, Motion animations that respect "reduce motion", custom 404, loading spinners everywhere data loads, toasts instead of browser alerts, and layouts that work from 360 px phones to wide desktops.

## How the pieces fit

```
                        ┌──────────────────────────────┐
   Browser ───────────▶ │  Next.js 16 (this repo)      │
   (React 19, Tailwind) │  • UI, routing, animations   │
        │               │  • BetterAuth + MongoDB      │──┐  users, sessions,
        │               │    adapter: sign-up/in,      │  │  accounts, JWKS keys
        │               │    Google, password reset    │  │
        │               │  • mints a 1-hour JWT        │  ▼
        │               │    GET /api/auth/token       │  ┌───────────┐
        │               │  • publishes public keys     │  │  MongoDB  │
        │               │    GET /api/auth/jwks        │  └───────────┘
        │               └──────────────────────────────┘     ▲
        │  Authorization: Bearer <JWT>                        │ same database
        ▼                                                     │
   ┌──────────────────────────────┐   verifies the JWT        │
   │  Express API (server)        │   with the public keys    │
   │  • REST + Zod validation     │ ──────────────────────────┘
   │  • Socket.IO notifications   │ ── Stripe (PaymentIntents) ── Cloudinary (photos)
   └──────────────────────────────┘
```

All authentication happens in Next.js with BetterAuth and its MongoDB adapter (email + password and Google). The Express API never sees a password or cookie: it only accepts the short-lived **JWT** that BetterAuth's `jwt` plugin signs, and validates it against the public keys published at `/api/auth/jwks`.

## Tech stack

Next.js 16 (App Router, `proxy.ts`) · React 19 · TypeScript · Tailwind CSS v4 · DaisyUI 5 · BetterAuth (MongoDB adapter, `jwt` plugin) · TanStack Query · Axios · react-hook-form + Zod · Motion · Recharts · react-day-picker · Stripe Elements · Socket.IO client · Sonner.

## Getting started

```bash
npm install
cp .env.example .env.local     # then fill it in (see below)
npm run dev                    # http://localhost:3000
```

The app needs the Express API ([vroomly-server](https://github.com/radhshahmat91/vroomly-server)) running, and the **same MongoDB database** the API uses — BetterAuth stores users, sessions and accounts there.

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Public URL of this app (used for metadata) |
| `NEXT_PUBLIC_API_URL` | Base URL of the Express API, ending in `/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Origin of the Express API (Socket.IO) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable test key (`pk_test_…`) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional. Without it maps fall back to OpenStreetMap |
| `BETTER_AUTH_SECRET` | Long random string (`openssl rand -base64 32`). **Use the same value everywhere you run the app against the same database.** BetterAuth's JWT signing key is stored in that database, encrypted with this secret; a different secret can't read it and `/api/auth/token` then fails |
| `BETTER_AUTH_URL` | Public URL of this app, no trailing slash. **Must equal the API's `AUTH_URL`** |
| `MONGODB_URI`, `MONGODB_DB` | Same database as the API |
| `DNS_SERVERS` | Optional. Public DNS (`8.8.8.8,1.1.1.1`) for Node. If your network refuses Atlas SRV lookups (`querySrv ECONNREFUSED`) the app already falls back to resolving the address over HTTPS on its own (`instrumentation.ts`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in. Redirect URI: `{BETTER_AUTH_URL}/api/auth/callback/google` |
| `SMTP_*`, `MAIL_FROM` | Optional. Password-reset emails; without SMTP the reset link is printed in the server console |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |

## Demo accounts

After `npm run seed` has run in the server repo (against the **same database** this app uses), these accounts exist. Password for every account: **`Vroomly@123`**

| Role | Email |
|---|---|
| Admin | `admin@vroomly.app` |
| Host (approved) | `host@vroomly.app` (Amelia, Los Angeles), also `daniel@`, `priya@`, `marcus@`, `sofia@vroomly.app` |
| Renter | `renter@vroomly.app` (has trips to review, one to pay for, one upcoming) |
| Host applicant (pending approval) | `liam@vroomly.app` |
| Suspended renter | `ethan@vroomly.app` |

The login page has one-click buttons that fill in the renter, host and admin demo accounts.

## How authentication works

1. BetterAuth (`lib/auth.ts`, route `app/api/auth/[...all]`) handles sign-up, login, Google and password reset, storing data in MongoDB.
2. After login, the browser holds a session cookie. `lib/token.ts` asks `/api/auth/token` for a **1-hour JWT** and caches it in memory.
3. Axios (`lib/api/client.ts`) sends it as `Authorization: Bearer …` to the Express API, which verifies it against `/api/auth/jwks` and loads the user from MongoDB.
4. `proxy.ts` redirects signed-out visitors away from private routes (`/dashboard`, `/owner`, `/admin`, `/checkout`, `/profile`, `/notifications`); `<RequireAuth />` then enforces roles. It waits for the first session lookup, so a refresh on a private page keeps you where you are.

## Project structure

```
app/
  (site)/            public pages: home, cars, car details, auth, become-host, checkout, profile, notifications
  dashboard/         renter portal
  owner/             host portal
  admin/             admin portal
  api/auth/          BetterAuth handler
  api/email-exists/  friendly duplicate-email check for sign-up
components/          ui/ layout/ cars/ booking/ reviews/ notifications/ charts/ auth/ home/ dashboard/ owner/ admin/
context/             AuthContext, SocketContext
hooks/               TanStack Query hooks, one file per resource
lib/                 api client + one module per resource, auth, validators, pricing, constants, images
types/               shared TypeScript types (mirror the API models)
proxy.ts             optimistic route guard (Next.js 16's replacement for middleware)
docs/                go-live guide: Atlas, Stripe, Cloudinary, Google, Render, Vercel
```

## Troubleshooting

| What you see | What it means and the fix |
|---|---|
| Terminal shows **`querySrv ECONNREFUSED _mongodb._tcp…`** and login / sign-up return 500 | Your network's DNS is refusing the SRV lookup a `mongodb+srv://` Atlas address needs (common with some ISPs, routers and VPNs). Both apps fall back automatically to resolving the address over HTTPS and log *"resolved the address over HTTPS instead"*. Run **`npm run check-db`** in the server repo to see exactly which step fails. If it still can't connect: use a local MongoDB (`docker compose up -d` in the server repo, `MONGODB_URI=mongodb://127.0.0.1:27017/vroomly` in **both** `.env` files), try a phone hotspot, or paste Atlas' long non-SRV string (*Connect → Drivers → Node.js "2.2.12 or later"*). Also check Atlas → Network Access allows your IP. |
| Demo accounts "don't work" | They only exist after `npm run seed` has run in the server repo against the **same database** the web app uses. Check that `MONGODB_URI` and `MONGODB_DB` are identical in both `.env` files. |
| "Invalid origin" from BetterAuth | `BETTER_AUTH_URL` must match the address in your browser exactly (e.g. `http://localhost:3000`). |
| Pages load but there are no cars | The API isn't running, or `NEXT_PUBLIC_API_URL` isn't `http://localhost:5000/api`. Restart `npm run dev` after editing `.env.local`. |
| Login says "Welcome back!" but the navbar still shows Log in / Sign up | The login worked and the session check right after it failed. See the first row of the troubleshooting table in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). |

Problems that only appear on the live site (login loop, CORS, 401s) are covered in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Deploy to Vercel

1. Import this repository into Vercel (framework: Next.js).
2. Add every variable from the table above. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel URL (`https://<project-name>.vercel.app`, no trailing slash) **before the first deploy** — the app refuses to run in production without it.
3. Deploy. Then set the API's `CLIENT_URL` and `AUTH_URL` to the same Vercel URL.

The complete walkthrough (Atlas, Stripe, Cloudinary, Google, Render, Vercel) is in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

Because the app is server-rendered, any route can be reloaded directly without a 404 or a client-side error.

## Credits

Photography from [Pexels](https://www.pexels.com). Fonts: Barlow Condensed and Figtree via Fontsource.
