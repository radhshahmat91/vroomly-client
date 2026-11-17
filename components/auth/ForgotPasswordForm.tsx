"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/ui/FormField";
import { authClient } from "@/lib/auth-client";
import { forgotSchema, type ForgotValues } from "@/lib/validators";
import { AuthShell } from "./AuthShell";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });

  const onSubmit = async ({ email }: ForgotValues) => {
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    // We say the same thing whether or not the account exists, so this form can't be used to probe for emails.
    if (error && error.status !== 400 && error.status !== 404) {
      toast.error(error.message || "We couldn't send the email. Please try again.");
      return;
    }
    setSent(email);
  };

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter the email you signed up with and we'll send you a link to choose a new one.">
      {sent ? (
        <div className="rounded-2xl bg-base-200 p-6 text-center">
          <MailCheck size={36} className="mx-auto text-secondary" />
          <p className="mt-3 font-display text-3xl font-bold">Check your inbox</p>
          <p className="mt-2 text-base-content/70">If an account exists for <strong>{sent}</strong>, a reset link is on its way. It expires in one hour.</p>
          <Link href="/login" className="btn btn-primary mt-6">Back to login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <input id="email" type="email" autoComplete="email" placeholder="you@example.com" className="input input-bordered w-full" {...register("email")} />
          </FormField>
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isSubmitting}>
            {isSubmitting && <span className="loading loading-spinner" />}
            Send reset link
          </button>
          <p className="text-center"><Link href="/login" className="text-sm font-semibold text-secondary underline-offset-4 hover:underline">Back to login</Link></p>
        </form>
      )}
    </AuthShell>
  );
}
