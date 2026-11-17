"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/ui/FormField";
import { authClient } from "@/lib/auth-client";
import { resetSchema, type ResetValues } from "@/lib/validators";
import { AuthShell } from "./AuthShell";
import { PasswordInput } from "./PasswordInput";

export function ResetPasswordForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token");
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema), defaultValues: { password: "", confirm: "" } });

  const onSubmit = async (values: ResetValues) => {
    if (!token) return;
    const { error } = await authClient.resetPassword({ newPassword: values.password, token });
    if (error) {
      const message = error.message || "This reset link has expired. Request a new one.";
      setFormError(message);
      toast.error(message);
      return;
    }
    toast.success("Password updated.");
    router.replace("/login?reset=1");
  };

  if (!token || sp.get("error")) {
    return (
      <AuthShell title="This link isn't valid" subtitle="Reset links work once and expire after an hour.">
        <Link href="/forgot-password" className="btn btn-primary btn-lg w-full">Request a new link</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Pick something you haven't used before.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {formError && <div role="alert" className="alert alert-error alert-soft"><CircleAlert size={20} /> <span>{formError}</span></div>}
        <FormField label="New password" htmlFor="password" error={errors.password?.message} hint="At least 6 characters with an uppercase and a lowercase letter.">
          <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
        </FormField>
        <FormField label="Confirm password" htmlFor="confirm" error={errors.confirm?.message}>
          <PasswordInput id="confirm" autoComplete="new-password" {...register("confirm")} />
        </FormField>
        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isSubmitting}>
          {isSubmitting && <span className="loading loading-spinner" />}
          Update password
        </button>
      </form>
    </AuthShell>
  );
}
