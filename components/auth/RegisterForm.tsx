"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CircleAlert, Circle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/ui/FormField";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage, cn, safeRedirect } from "@/lib/utils";
import { passwordRules, registerSchema, type RegisterValues } from "@/lib/validators";
import { AuthShell } from "./AuthShell";
import { PasswordInput } from "./PasswordInput";
import { GoogleButton, OrDivider } from "./SocialButtons";

export function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = safeRedirect(sp.get("redirect"));
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { name: "", email: "", photoURL: "", password: "" }, mode: "onTouched" });
  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = async (values: RegisterValues) => {
    setFormError("");
    try {
      const res = await fetch("/api/email-exists", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: values.email }) });
      const { exists } = res.ok ? ((await res.json()) as { exists?: boolean }) : { exists: false };
      if (exists) {
        const message = "An account with this email already exists. Try logging in instead.";
        setFormError(message);
        toast.error(message);
        return;
      }
    } catch {
      /* if the check fails we still let sign-up run — BetterAuth enforces uniqueness */
    }
    const { error } = await authClient.signUp.email({
      name: values.name.trim(),
      email: values.email,
      password: values.password,
      image: values.photoURL.trim() || undefined,
    });
    if (error) {
      const message = /exist|already/i.test(error.message ?? "") ? "An account with this email already exists. Try logging in instead." : authErrorMessage(error, "We couldn't create your account. Please try again.");
      setFormError(message);
      toast.error(message);
      return;
    }
    toast.success("Account created! Log in to get started.");
    router.replace(`/login?registered=1${redirect !== "/" ? `&redirect=${encodeURIComponent(redirect)}` : ""}`);
  };

  return (
    <AuthShell title="Create your account" subtitle="Join Vroomly to rent cars from local hosts, or list your own.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {formError && (
          <div role="alert" className="alert alert-error alert-soft"><CircleAlert size={20} /> <span>{formError}</span></div>
        )}
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <input id="name" autoComplete="name" placeholder="Your full name" className="input input-bordered w-full" aria-invalid={Boolean(errors.name)} {...register("name")} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" className="input input-bordered w-full" aria-invalid={Boolean(errors.email)} {...register("email")} />
        </FormField>
        <FormField label="Photo URL" htmlFor="photoURL" error={errors.photoURL?.message} hint="Optional — a link to a profile picture.">
          <input id="photoURL" type="url" inputMode="url" placeholder="https://example.com/me.jpg" className="input input-bordered w-full" aria-invalid={Boolean(errors.photoURL)} {...register("photoURL")} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="new-password" placeholder="Create a password" aria-invalid={Boolean(errors.password)} {...register("password")} />
          <ul className="mt-3 space-y-1.5" aria-label="Password requirements">
            {passwordRules.map((r) => {
              const ok = r.test(password);
              return (
                <li key={r.id} className={cn("flex items-center gap-2 text-sm transition-colors", ok ? "text-success" : "text-base-content/60")}>
                  {ok ? <Check size={16} strokeWidth={3} /> : <Circle size={16} />}
                  {r.label}
                </li>
              );
            })}
          </ul>
        </FormField>
        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isSubmitting}>
          {isSubmitting && <span className="loading loading-spinner" />}
          Register
        </button>
      </form>

      <OrDivider />
      <GoogleButton callbackURL="/" label="Sign up with Google" />

      <p className="mt-8 text-center text-base-content/70">
        Already have an account?{" "}
        <Link href={`/login${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="font-bold text-secondary underline-offset-4 hover:underline">Login</Link>
      </p>
    </AuthShell>
  );
}
