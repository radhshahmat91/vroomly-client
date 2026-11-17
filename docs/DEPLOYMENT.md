# Going live: MongoDB Atlas + Render (API) + Vercel (web)

Do these in order. Keep a scratch note of the URLs as you go — several settings point at each other.

## 1. MongoDB Atlas
1. Create a free cluster, a database user, and under **Network Access** allow `0.0.0.0/0`.
2. Copy the connection string and **put the database name in it**:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/vroomly?retryWrites=true&w=majority`
3. Use this same string as `MONGODB_URI` in both the web app and the API (with `MONGODB_DB=vroomly`).
4. If you also run the apps on your own computer against this same database, use the **same `BETTER_AUTH_SECRET`** locally as on Vercel. BetterAuth keeps its JWT signing key in the database (the `jwks` collection), encrypted with that secret, and a different secret can't read it (see Troubleshooting).

## 2. Cloudinary (photo uploads)
Create a free account and copy the cloud name, API key and API secret. Hosts can still paste image links without it.

## 3. Stripe (test mode)
1. Dashboard → **Developers → API keys**: copy the publishable key (`pk_test_…`) and secret key (`sk_test_…`).
2. The webhook comes after the API is live (step 6).

## 4. Google sign-in (optional but in the brief)
1. Google Cloud Console → **APIs & Services → Credentials → Create OAuth client ID → Web application**.
2. Authorised JavaScript origin: `https://YOUR-APP.vercel.app` (and `http://localhost:3000` for dev).
3. Authorised redirect URI: `https://YOUR-APP.vercel.app/api/auth/callback/google` (and the localhost equivalent).
4. Copy the client ID and secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` on Vercel.

## 5. Vercel (web app) — first deploy
1. Import the client repository (`vroomly-client`). Framework preset: Next.js. The project name you choose becomes the address: `https://<project-name>.vercel.app`.
2. Add the variables from `.env.example`. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to that address **now**, exactly as it will appear in the browser (`https://…`, no trailing slash) — the app refuses to run in production without it. For the two API URLs, use placeholders for the moment.
3. Set `BETTER_AUTH_SECRET` to a long random value (`openssl rand -base64 32`) and keep a copy.
4. Deploy, then open **Settings → Domains** and check the production address is the one you typed. If Vercel had to change the name, correct `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` and redeploy.

## 6. Render (API)
1. New → **Web Service** (or Blueprint using `render.yaml`), connect the server repository (`vroomly-server`).
2. Build `npm install`, start `npm start`, health check `/api/health`.
3. Environment:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI`, `MONGODB_DB` | as above |
| `CLIENT_URL` | your Vercel URL |
| `AUTH_URL` | **the same Vercel URL** (where BetterAuth runs) |
| `STRIPE_SECRET_KEY` | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | from the next step |
| `CLOUDINARY_*` | from step 2 |
| `PLATFORM_COMMISSION` | `0.10` |

4. In Stripe → **Developers → Webhooks → Add endpoint**: `https://YOUR-API.onrender.com/api/payments/webhook`, event `payment_intent.succeeded`. Copy the signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.

## 7. Point the web app at the API
In Vercel set `NEXT_PUBLIC_API_URL=https://YOUR-API.onrender.com/api`, `NEXT_PUBLIC_SOCKET_URL=https://YOUR-API.onrender.com`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…`, then **redeploy** (public variables are baked in at build time).

## 8. Seed demo data and create your admin
From your machine, inside your clone of the server repository, with the Atlas URI:
```bash
MONGODB_URI="mongodb+srv://…/vroomly" npm run seed
```
This creates the demo accounts listed in the client README (password `Vroomly@123`). Your own admin: sign up on the live site, then
```bash
MONGODB_URI="mongodb+srv://…/vroomly" npm run make-admin -- you@example.com
```
When grading is over, `npm run seed:destroy` removes the demo users and data.

## 9. Smoke test
* Open the site, log in as `renter@vroomly.app`, and **reload** `/dashboard/bookings` — you should stay signed in.
* Request a car, then log in as its host (`host@vroomly.app` for Amelia's cars) in another browser and accept; the renter pays with card `4242 4242 4242 4242` (any future date, any CVC).
* Check `/admin` as `admin@vroomly.app`.

## Troubleshooting
| Symptom | Likely cause |
|---|---|
| Login says "Welcome back!" but the navbar still shows Log in / Sign up, and the dashboard won't open | The login worked; the session check right after it failed. Log in, then open `https://YOUR-SITE/api/auth/get-session` in a new tab. **JSON with your user** → the session is fine, hard-refresh. **`null`** → the browser didn't keep the cookie or the server can't see the session: `BETTER_AUTH_URL` must equal the address bar exactly, and Vercel variables only apply after a redeploy. **An error / 500** → read the Vercel log for that request (database unreachable, wrong `MONGODB_URI` / `MONGODB_DB`, or a missing variable) |
| API returns 401 "session has expired" for everyone | `AUTH_URL` on Render differs from `BETTER_AUTH_URL` on Vercel (watch for trailing slashes and `http` vs `https`), or the web app is asleep/unreachable |
| Browser console shows a CORS error | `CLIENT_URL` on Render doesn't include the exact web origin |
| Login works but API calls never authenticate | `NEXT_PUBLIC_API_URL` missing the `/api` suffix, or not redeployed after changing it, or `/api/auth/token` returns an error (open that URL while logged in). `Failed to decrypt private key` in the Vercel log means `BETTER_AUTH_SECRET` doesn't match the one that created the signing key stored in the `jwks` collection — typically the app was also run locally against the same database with another secret. Use one secret everywhere, or delete all documents in the `jwks` collection in Atlas: a new key is created on the next request and existing sessions stay valid |
| "Invalid origin" from BetterAuth | `BETTER_AUTH_URL` doesn't match the URL in the browser's address bar |
| Google button says it isn't available | `GOOGLE_CLIENT_ID/SECRET` missing, or the redirect URI doesn't match exactly |
| Checkout says card payments aren't set up | `STRIPE_SECRET_KEY` not set on Render |
| Login and sign-up return 500 and logs show `querySrv ECONNREFUSED` | The machine's DNS refuses Atlas SRV lookups. Both apps fall back to resolving the address over HTTPS; run `npm run check-db` in the server repo to see which step still fails (blocked port 27017, IP not allowed in Atlas, wrong password) |
| Everything is slow after a pause | Render's free plan sleeps; the first request wakes it |
