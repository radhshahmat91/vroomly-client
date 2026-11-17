"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3A12 12 0 1 1 24 12a11.900 11.900 0 0 1 7.900 3l5.700-5.700A20 20 0 1 0 44 24c0-1.300-.1-2.600-.4-3.900z" />
      <path fill="#FF3D00" d="M6.300 14.700l6.600 4.800A12 12 0 0 1 24 12c3 0 5.800 1.100 7.900 3l5.700-5.700A20 20 0 0 0 6.300 14.700z" />
      <path fill="#4CAF50" d="M24 44c5.200 0 9.900-2 13.400-5.200l-6.200-5.200A12 12 0 0 1 12.700 28l-6.500 5C9.500 39.600 16.200 44 24 44z" />
      <path fill="#1976D2" d="M43.600 20.100H42V20H24v8h11.300a12 12 0 0 1-4.100 5.600l6.200 5.200C37 39.200 44 34 44 24c0-1.300-.1-2.600-.4-3.900z" />
    </svg>
  );
}

/** "Continue with Google" — signs in (or up) through BetterAuth, then lands on `callbackURL`. */
export function GoogleButton({ callbackURL = "/", label = "Continue with Google" }: { callbackURL?: string; label?: string }) {
  const [loading, setLoading] = useState(false);

  const go = async () => {
    setLoading(true);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL });
    if (error) {
      setLoading(false);
      toast.error(error.message || "Google sign-in isn't available right now. Please use your email and password.");
    }
  };

  return (
    <button type="button" onClick={go} disabled={loading} className="btn btn-outline w-full">
      {loading ? <span className="loading loading-spinner loading-sm" /> : <GoogleIcon />}
      {label}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-4 text-sm text-base-content/50" role="separator">
      <span className="h-px flex-1 bg-base-300" />
      or
      <span className="h-px flex-1 bg-base-300" />
    </div>
  );
}
