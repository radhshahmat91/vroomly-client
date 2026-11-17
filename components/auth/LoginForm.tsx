"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/ui/FormField";
import { useAuth } from "@/context/AuthContext";
import { authClient } from "@/lib/auth-client";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/constants";
import { authErrorMessage, safeRedirect } from "@/lib/utils";
import { loginSchema, type LoginValues } from "@/lib/validators";
import { AuthShell } from "./AuthShell";
import { PasswordInput } from "./PasswordInput";
import { GoogleButton, OrDivider } from "./SocialButtons";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = safeRedirect(sp.get("redirect"));
  const { user } = useAuth();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  // Already signed in? Skip the form and carry on to where they were headed.
  useEffect(() => {
    if (user) router.replace(redirect);
  }, [user, redirect, router]);

  const onSubmit = async (values: LoginValues) => {
    setFormError("");
    const { error } = await authClient.signIn.email({ email: values.email, password: values.password });
    if (error) {
      // Only the real "wrong credentials" code gets the friendly message. Anything else (403 "Invalid origin", 5xx, ...)
      // must stay visible, otherwise a misconfigured deployment looks like a typo in the password.
      const message =
        error.code === "INVALID_EMAIL_OR_PASSWORD"
          ? "That email and password don't match. Please try again."
          : authErrorMessage(error, "We couldn't log you in. Please try again.");
      setFormError(message);
      toast.error(message);
      return;
    }
    toast.success("Welcome back!");
    router.replace(redirect);
    router.refresh();
  };

  const registerHref = `/register${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`;

  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your trips, bookings and listings.">
      {sp.get("registered") && (
        <div role="status" className="alert alert-success alert-soft mb-6"><CircleCheck size={20} /> <span>Account created. Log in to continue.</span></div>
      )}
      {sp.get("reset") && (
        <div role="status" className="alert alert-success alert-soft mb-6"><CircleCheck size={20} /> <span>Password updated. Log in with your new password.</span></div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {formError && (
          <div role="alert" className="alert alert-error alert-soft"><CircleAlert size={20} /> <span>{formError}</span></div>
        )}
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" className="input input-bordered w-full" aria-invalid={Boolean(errors.email)} {...register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" placeholder="Your password" aria-invalid={Boolean(errors.password)} {...register("password")} />
        </FormField>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isSubmitting}>
          {isSubmitting && <span className="loading loading-spinner" />}
          Login
        </button>
      </form>

      <OrDivider />
      <GoogleButton callbackURL={redirect} />

      <p className="mt-8 text-center text-base-content/70">
        New to Vroomly?{" "}
        <Link href={registerHref} className="font-bold text-secondary underline-offset-4 hover:underline">Create an account</Link>
      </p>

      <div className="mt-8 rounded-2xl bg-base-200 p-4">
        <p className="text-sm font-bold">Trying the demo? Fill in a sample account:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button key={a.email} type="button" className="btn btn-sm btn-outline" onClick={() => { setValue("email", a.email, { shouldValidate: true }); setValue("password", DEMO_PASSWORD, { shouldValidate: true }); }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}
