"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, CalendarCheck, Camera, Clock, Wallet } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { FormField } from "@/components/ui/FormField";
import { SmartImage } from "@/components/ui/SmartImage";
import { InlineLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useApplyToHost } from "@/hooks/useAccount";
import { images } from "@/lib/images";
import { hostApplySchema, type HostApplyValues } from "@/lib/validators";

const steps = [
  { icon: Camera, title: "List your car", text: "Add photos, specs, a daily price and where it's parked. It takes about ten minutes." },
  { icon: BadgeCheck, title: "Get approved", text: "Our team reviews your application and each listing before it goes live." },
  { icon: CalendarCheck, title: "Accept requests", text: "Renters send requests for your dates. You accept the ones you like and decline the rest." },
  { icon: Wallet, title: "Earn per trip", text: "Every paid trip lands in your earnings, net of a small platform fee." },
];

function Application() {
  const { user, isLoading } = useAuth();
  const apply = useApplyToHost();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HostApplyValues>({
    resolver: zodResolver(hostApplySchema),
    defaultValues: { phone: user?.phone ?? "", city: user?.city ?? "", about: "" },
  });

  if (isLoading) return <InlineLoader />;

  if (!user) {
    return (
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold">Ready to start?</h2>
        <p className="mx-auto mt-3 max-w-md text-base-content/70">Create a free account (or log in) and you&apos;ll come straight back here to apply.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/register?redirect=%2Fbecome-host" className="btn btn-primary btn-lg">Create an account</Link>
          <Link href="/login?redirect=%2Fbecome-host" className="btn btn-outline btn-lg">Log in</Link>
        </div>
      </div>
    );
  }

  if (user.role === "owner") {
    return (
      <div className="text-center">
        <BadgeCheck size={44} className="mx-auto text-secondary" />
        <h2 className="mt-3 font-display text-4xl font-bold">You&apos;re an approved host</h2>
        <p className="mx-auto mt-3 max-w-md text-base-content/70">Add a car, manage requests and track your earnings from the host dashboard.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/owner/cars/new" className="btn btn-primary btn-lg">List a car</Link>
          <Link href="/owner" className="btn btn-outline btn-lg">Host dashboard</Link>
        </div>
      </div>
    );
  }

  if (user.role === "admin") {
    return <p className="text-center text-lg text-base-content/70">Admin accounts moderate the marketplace and can&apos;t list cars. Use a separate renter account to try hosting.</p>;
  }

  if (user.hostStatus === "pending") {
    return (
      <div className="text-center">
        <Clock size={44} className="mx-auto text-warning" />
        <h2 className="mt-3 font-display text-4xl font-bold">Application under review</h2>
        <p className="mx-auto mt-3 max-w-md text-base-content/70">Thanks, {user.name.split(" ")[0]}! Our team is looking at your application. You&apos;ll get a notification as soon as there&apos;s a decision.</p>
        <Link href="/cars" className="btn btn-outline btn-lg mt-6">Browse cars meanwhile</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => apply.mutate(v))} noValidate className="mx-auto max-w-xl space-y-5">
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold">Apply to become a host</h2>
        {user.hostStatus === "rejected" && <p className="mt-3 rounded-xl bg-warning/15 p-3 text-sm font-medium">Your previous application wasn&apos;t approved. You&apos;re welcome to update your details and apply again.</p>}
        <p className="mt-3 text-base-content/70">Tell us a little about you and your car. A team member reviews every application.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Phone" htmlFor="h-phone" error={errors.phone?.message}>
          <input id="h-phone" type="tel" placeholder="+1 555 000 0000" className="input input-bordered w-full" {...register("phone")} />
        </FormField>
        <FormField label="City" htmlFor="h-city" error={errors.city?.message}>
          <input id="h-city" placeholder="Where is the car based?" className="input input-bordered w-full" {...register("city")} />
        </FormField>
      </div>
      <FormField label="About you and your car" htmlFor="h-about" error={errors.about?.message} hint="For example: the make and model, how often it sits unused, and when you're free to hand it over.">
        <textarea id="h-about" rows={5} className="textarea textarea-bordered w-full" {...register("about")} />
      </FormField>
      <button className="btn btn-primary btn-lg w-full" type="submit" disabled={apply.isPending}>
        {apply.isPending && <span className="loading loading-spinner" />}
        Submit application
      </button>
    </form>
  );
}

export function BecomeHostView() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-neutral text-white">
        <SmartImage src={images.hostCta} alt="" priority className="absolute inset-0 -z-10 size-full object-cover opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-neutral via-neutral/75 to-neutral/10" />
        <div className="container-x py-20 sm:py-28">
          <Reveal y={30}>
            <h1 className="max-w-3xl font-display text-[clamp(3rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight">Earn with the car you already own</h1>
            <p className="mt-6 max-w-xl text-xl text-white/80">Hosting is free to start. You choose the price, the dates and who gets the keys.</p>
            <a href="#apply" className="btn btn-primary btn-lg mt-8">Apply to host</a>
          </Reveal>
        </div>
      </section>

      <section className="container-x pt-20">
        <Reveal>
          <h2 className="section-title">How hosting works</h2>
          <p className="section-sub">Four steps from parked car to first payout.</p>
        </Reveal>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <StaggerItem key={s.title} className="h-full">
              <div className="surface h-full p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/30"><s.icon size={24} /></span>
                <p className="mt-5 font-display text-xl font-bold text-secondary">Step {i + 1}</p>
                <h3 className="font-display text-3xl font-bold leading-tight">{s.title}</h3>
                <p className="mt-2 text-base-content/70">{s.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section id="apply" className="container-x scroll-mt-24 pt-24">
        <div className="surface mx-auto max-w-3xl p-6 sm:p-12">
          <Application />
        </div>
      </section>
    </>
  );
}
