"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Avatar } from "@/components/ui/Avatar";
import { FormField } from "@/components/ui/FormField";
import { PageHeader } from "@/components/ui/PageHeader";
import { RoleBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { useUpdateProfile, useUploadAvatar } from "@/hooks/useAccount";
import { authClient } from "@/lib/auth-client";
import { changePasswordSchema, profileSchema, type ChangePasswordValues, type ProfileValues } from "@/lib/validators";

export function ProfileView() {
  const { user } = useAuth();
  const update = useUpdateProfile();
  const upload = useUploadAvatar();
  const fileRef = useRef<HTMLInputElement>(null);

  const profile = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: "", phone: "", city: "", bio: "", image: "" } });
  useEffect(() => {
    if (user) profile.reset({ name: user.name, phone: user.phone ?? "", city: user.city ?? "", bio: user.bio ?? "", image: user.image ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.name, user?.image, user?.phone, user?.city, user?.bio]);

  const [pwError, setPwError] = useState("");
  const password = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: "", newPassword: "", confirm: "" } });

  const saveProfile = (v: ProfileValues) => {
    const body: Parameters<typeof update.mutate>[0] = { name: v.name, phone: v.phone, city: v.city, bio: v.bio };
    if (v.image) body.image = v.image;
    update.mutate(body);
  };

  const savePassword = async (v: ChangePasswordValues) => {
    setPwError("");
    const { error } = await authClient.changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword, revokeOtherSessions: true });
    if (error) {
      const msg = /credential|not found/i.test(error.message ?? "")
        ? "This account signs in with Google, so there's no password to change."
        : /invalid|incorrect/i.test(error.message ?? "") ? "Your current password is incorrect." : error.message || "We couldn't change your password.";
      setPwError(msg);
      toast.error(msg);
      return;
    }
    toast.success("Password changed. Other devices were signed out.");
    password.reset();
  };

  if (!user) return null;

  return (
    <div className="container-x max-w-4xl py-10 lg:py-14">
      <PageHeader title="Profile & settings" subtitle="Update how you appear to hosts and renters, and keep your account secure." />

      <section className="surface p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative">
            <Avatar name={user.name} src={user.image} size="xl" />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={upload.isPending} className="btn btn-primary btn-circle btn-sm absolute -bottom-1 -right-1" aria-label="Upload a new profile photo">
              {upload.isPending ? <span className="loading loading-spinner loading-xs" /> : <Camera size={16} />}
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); e.target.value = ""; }} />
          </div>
          <div>
            <p className="font-display text-4xl font-bold leading-none">{user.name}</p>
            <p className="mt-1.5 text-base-content/70">{user.email}</p>
            <RoleBadge role={user.role} className="mt-3" />
          </div>
        </div>

        <form onSubmit={profile.handleSubmit(saveProfile)} noValidate className="mt-8 grid gap-5 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="p-name" error={profile.formState.errors.name?.message}>
            <input id="p-name" className="input input-bordered w-full" {...profile.register("name")} />
          </FormField>
          <FormField label="Email" htmlFor="p-email" hint="Your email is your login and can't be changed here.">
            <input id="p-email" className="input input-bordered w-full" value={user.email} readOnly disabled />
          </FormField>
          <FormField label="Phone" htmlFor="p-phone" error={profile.formState.errors.phone?.message}>
            <input id="p-phone" type="tel" placeholder="+1 555 000 0000" className="input input-bordered w-full" {...profile.register("phone")} />
          </FormField>
          <FormField label="City" htmlFor="p-city" error={profile.formState.errors.city?.message}>
            <input id="p-city" className="input input-bordered w-full" {...profile.register("city")} />
          </FormField>
          <FormField label="Photo URL" htmlFor="p-image" error={profile.formState.errors.image?.message} hint="Or use the camera button to upload a photo." className="sm:col-span-2">
            <input id="p-image" type="url" placeholder="https://…" className="input input-bordered w-full" {...profile.register("image")} />
          </FormField>
          <FormField label="About you" htmlFor="p-bio" error={profile.formState.errors.bio?.message} hint="Hosts see this when you request a car." className="sm:col-span-2">
            <textarea id="p-bio" rows={4} className="textarea textarea-bordered w-full" {...profile.register("bio")} />
          </FormField>
          <div className="sm:col-span-2">
            <button className="btn btn-primary" type="submit" disabled={update.isPending}>
              {update.isPending && <span className="loading loading-spinner loading-sm" />}
              Save changes
            </button>
          </div>
        </form>
      </section>

      <section className="surface mt-8 p-6 sm:p-8">
        <h2 className="font-display text-3xl font-bold">Change password</h2>
        <p className="mt-1 text-base-content/70">You&apos;ll stay signed in here; other devices will be signed out.</p>
        <form onSubmit={password.handleSubmit(savePassword)} noValidate className="mt-6 grid gap-5 sm:grid-cols-2">
          {pwError && <div role="alert" className="alert alert-error alert-soft sm:col-span-2"><span>{pwError}</span></div>}
          <FormField label="Current password" htmlFor="cp" error={password.formState.errors.currentPassword?.message} className="sm:col-span-2">
            <PasswordInput id="cp" autoComplete="current-password" {...password.register("currentPassword")} />
          </FormField>
          <FormField label="New password" htmlFor="np" error={password.formState.errors.newPassword?.message} hint="6+ characters with an uppercase and a lowercase letter.">
            <PasswordInput id="np" autoComplete="new-password" {...password.register("newPassword")} />
          </FormField>
          <FormField label="Confirm new password" htmlFor="cf" error={password.formState.errors.confirm?.message}>
            <PasswordInput id="cf" autoComplete="new-password" {...password.register("confirm")} />
          </FormField>
          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-neutral" disabled={password.formState.isSubmitting}>
              {password.formState.isSubmitting && <span className="loading loading-spinner loading-sm" />}
              Update password
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
