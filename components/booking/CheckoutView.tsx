"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { motion } from "motion/react";
import { CircleAlert, Clock, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SmartImage } from "@/components/ui/SmartImage";
import { PageLoader } from "@/components/ui/Spinner";
import { useBooking, useConfirmPayment, useCreateIntent } from "@/hooks/useBookings";
import { errorMessage } from "@/lib/api/client";
import type { IntentResponse } from "@/lib/api/bookings";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { fmtRange, money, pluralize } from "@/lib/utils";
import type { Booking } from "@/types";

function Summary({ booking }: { booking: Booking }) {
  const p = booking.pricing;
  return (
    <aside className="surface h-fit p-6 lg:sticky lg:top-24">
      <div className="flex gap-4">
        <SmartImage src={booking.car.images[0]?.url} alt="" className="h-20 w-28 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold leading-tight">{booking.car.title}</p>
          <p className="mt-0.5 text-sm text-base-content/65">{booking.car.city}, hosted by {booking.owner.name}</p>
        </div>
      </div>
      <dl className="mt-6 space-y-3 border-t border-base-300 pt-5 text-sm">
        <div className="flex justify-between gap-3"><dt className="text-base-content/70">Dates</dt><dd className="font-semibold">{fmtRange(booking.startDate, booking.endDate)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-base-content/70">{money(p.dailyRate)} × {pluralize(p.days, "day")}</dt><dd className="font-semibold">{money(p.subtotal, { cents: true })}</dd></div>
        {p.discountAmount > 0 && <div className="flex justify-between gap-3 text-secondary"><dt className="font-semibold">Discount ({p.discountPercent}%)</dt><dd className="font-bold">−{money(p.discountAmount, { cents: true })}</dd></div>}
        <div className="flex items-baseline justify-between gap-3 border-t border-base-300 pt-4"><dt className="font-bold">Total (USD)</dt><dd className="font-display text-4xl font-bold leading-none">{money(p.total, { cents: true })}</dd></div>
      </dl>
      <p className="mt-5 flex items-start gap-2 text-xs text-base-content/60"><ShieldCheck size={16} className="mt-0.5 shrink-0" /> Free cancellation until pick-up. A paid trip you cancel is refunded in full.</p>
    </aside>
  );
}

function StripeForm({ booking, onPaid }: { booking: Booking; onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const confirm = useConfirmPayment();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError("");
    const { error: err, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/${booking.id}` },
      redirect: "if_required",
    });
    if (err) {
      setError(err.message ?? "Your payment didn't go through. Please check your card details.");
    } else if (paymentIntent?.status === "succeeded") {
      try {
        await confirm.mutateAsync({ bookingId: booking.id, paymentIntentId: paymentIntent.id });
        onPaid();
      } catch (ex) {
        setError(errorMessage(ex));
      }
    } else {
      setError(`Your payment is ${paymentIntent?.status?.replaceAll("_", " ") ?? "pending"}. Give it a moment, then check My bookings.`);
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <div role="alert" className="alert alert-error alert-soft"><CircleAlert size={20} /> <span>{error}</span></div>}
      <button type="submit" className="btn btn-primary btn-lg w-full" disabled={!stripe || busy}>
        {busy ? <span className="loading loading-spinner" /> : <Lock size={18} />}
        Pay {money(booking.pricing.total, { cents: true })}
      </button>
      <p className="text-center text-xs text-base-content/60">Test mode: use card 4242 4242 4242 4242 with any future expiry and any CVC.</p>
    </form>
  );
}

function DemoForm({ booking, onPaid }: { booking: Booking; onPaid: () => void }) {
  const confirm = useConfirmPayment();
  const [error, setError] = useState("");
  const pay = async () => {
    setError("");
    try {
      await confirm.mutateAsync({ bookingId: booking.id, demo: true });
      onPaid();
    } catch (ex) {
      setError(errorMessage(ex));
    }
  };
  return (
    <div className="space-y-5">
      <div className="alert alert-info alert-soft"><CircleAlert size={20} /> <span>Demo checkout. Stripe isn&apos;t configured on this server, so no card is charged.</span></div>
      <div className="rounded-2xl bg-neutral p-5 text-neutral-content">
        <p className="text-sm opacity-70">Demo card</p>
        <p className="mt-6 font-mono text-xl tracking-widest">4242 4242 4242 4242</p>
        <p className="mt-4 text-sm opacity-70">Any future date, any CVC</p>
      </div>
      {error && <div role="alert" className="alert alert-error alert-soft"><span>{error}</span></div>}
      <button className="btn btn-primary btn-lg w-full" onClick={pay} disabled={confirm.isPending}>
        {confirm.isPending ? <span className="loading loading-spinner" /> : <Lock size={18} />}
        Pay {money(booking.pricing.total, { cents: true })} (demo)
      </button>
    </div>
  );
}

function Success({ booking }: { booking: Booking }) {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg text-center">
        <svg viewBox="0 0 52 52" className="mx-auto size-24" aria-hidden="true">
          <motion.circle cx="26" cy="26" r="24" fill="none" stroke="#0b6b4d" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />
          <motion.path d="M14 27l8 8 16-17" fill="none" stroke="#0b6b4d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.55 }} />
        </svg>
        <h1 className="mt-6 font-display text-6xl font-bold leading-none">You&apos;re booked!</h1>
        <p className="mt-4 text-lg text-base-content/75">
          {booking.car.title} is yours {fmtRange(booking.startDate, booking.endDate)}. {booking.owner.name} has been notified and will share pick-up details.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard/bookings?tab=confirmed" className="btn btn-primary btn-lg">View my trips</Link>
          <Link href="/cars" className="btn btn-outline btn-lg">Keep browsing</Link>
        </div>
      </motion.div>
    </div>
  );
}

export function CheckoutView({ bookingId }: { bookingId: string }) {
  const sp = useSearchParams();
  const { resolvedTheme } = useTheme();
  const { data: booking, isLoading, isError } = useBooking(bookingId);
  const createIntent = useCreateIntent();
  const confirm = useConfirmPayment();
  const [intent, setIntent] = useState<IntentResponse | null>(null);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");
  const requested = useRef(false);
  const returned = useRef(false);

  const payable = booking?.status === "accepted" && booking.paymentStatus !== "paid";

  // Back from a redirect-based payment method: finish the booking.
  useEffect(() => {
    const pi = sp.get("payment_intent");
    if (!booking || returned.current || !pi || sp.get("redirect_status") !== "succeeded" || booking.paymentStatus === "paid") return;
    returned.current = true;
    confirm.mutateAsync({ bookingId, paymentIntentId: pi }).then(() => setPaid(true)).catch((e) => setError(errorMessage(e)));
  }, [booking, sp, bookingId, confirm]);

  useEffect(() => {
    if (!payable || requested.current || sp.get("payment_intent")) return;
    requested.current = true;
    // Promise form (not per-call callbacks) so React StrictMode's dev-only remount can't swallow the result.
    createIntent.mutateAsync(bookingId).then(setIntent).catch((e) => setError(errorMessage(e)));
  }, [payable, bookingId, createIntent, sp]);

  if (isLoading) return <PageLoader label="Loading your booking…" />;
  if (isError || !booking) {
    return (
      <div className="container-x py-20">
        <EmptyState icon={<CircleAlert size={26} />} title="We couldn't find that booking" description="It may belong to a different account." action={<Link href="/dashboard/bookings" className="btn btn-primary">Go to my bookings</Link>} />
      </div>
    );
  }
  if (paid || booking.paymentStatus === "paid") return <Success booking={booking} />;

  if (booking.status !== "accepted") {
    return (
      <div className="container-x py-20">
        <EmptyState
          icon={<Clock size={26} />}
          title={booking.status === "pending" ? "Waiting for the host" : "This booking can't be paid right now"}
          description={booking.status === "pending" ? "You'll get a notification as soon as the host accepts. Then you can pay here." : `This booking is ${booking.status}.`}
          action={<Link href="/dashboard/bookings" className="btn btn-primary">Back to my bookings</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="page-title">Confirm and pay</h1>
      <p className="mt-2 text-base-content/70">The host accepted your request. Pay now to lock in your trip.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <section className="surface p-6 sm:p-8">
          <h2 className="font-display text-3xl font-bold">Payment</h2>
          <div className="mt-6">
            {!intent && !error && <PageLoader className="min-h-48" label="Preparing secure checkout…" />}
            {error && <div role="alert" className="alert alert-error alert-soft"><CircleAlert size={20} /> <span>{error}</span></div>}
            {intent?.demo && <DemoForm booking={booking} onPaid={() => setPaid(true)} />}
            {intent?.clientSecret && !stripeConfigured && (
              <div role="alert" className="alert alert-warning alert-soft"><span>Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to the client environment to show the card form.</span></div>
            )}
            {intent?.clientSecret && stripeConfigured && (
              <Elements
                stripe={getStripe()}
                options={{
                  clientSecret: intent.clientSecret,
                  appearance: {
                    theme: resolvedTheme === "vroomly-dark" ? "night" : "stripe",
                    variables: { colorPrimary: "#0b6b4d", borderRadius: "12px", fontFamily: "Figtree Variable, system-ui, sans-serif" },
                  },
                }}
              >
                <StripeForm booking={booking} onPaid={() => setPaid(true)} />
              </Elements>
            )}
          </div>
        </section>
        <Summary booking={booking} />
      </div>
    </div>
  );
}
