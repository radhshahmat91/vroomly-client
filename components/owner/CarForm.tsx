"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FormField } from "@/components/ui/FormField";
import { useCreateCar, useUpdateCar } from "@/hooks/useOwner";
import type { CarPayload } from "@/lib/api/owner";
import { CATEGORY_OPTIONS, FEATURE_SUGGESTIONS, FUEL_OPTIONS, TRANSMISSION_OPTIONS } from "@/lib/constants";
import { estimatePrice } from "@/lib/pricing";
import { cn, money } from "@/lib/utils";
import { carFormSchema, type CarFormValues } from "@/lib/validators";
import type { Car } from "@/types";
import { LocationPicker } from "./LocationPicker";
import { PhotoUploader } from "./PhotoUploader";

const blank: CarFormValues = {
  brand: "", model: "", year: new Date().getFullYear(), category: "", description: "", pricePerDay: 50, weeklyDiscount: 10, monthlyDiscount: 20,
  seats: 5, doors: 4, fuelType: "", transmission: "", features: [], images: [], city: "", address: "", country: "", lat: undefined, lng: undefined,
};

const num = { setValueAs: (v: string) => (v === "" || v === null || v === undefined ? undefined : Number(v)) };

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="surface p-6 sm:p-8">
      <h2 className="font-display text-3xl font-bold">{title}</h2>
      {hint && <p className="mt-1 text-base-content/65">{hint}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

const toValues = (car: Car): CarFormValues => ({
  brand: car.brand, model: car.model, year: car.year, category: car.category, description: car.description, pricePerDay: car.pricePerDay,
  weeklyDiscount: car.weeklyDiscount, monthlyDiscount: car.monthlyDiscount, seats: car.seats, doors: car.doors, fuelType: car.fuelType,
  transmission: car.transmission, features: car.features, images: car.images, city: car.city, address: car.address ?? "", country: car.country ?? "",
  lat: car.location?.coordinates[1], lng: car.location?.coordinates[0],
});

export function CarForm({ car }: { car?: Car }) {
  const router = useRouter();
  const create = useCreateCar();
  const update = useUpdateCar();
  const [custom, setCustom] = useState("");
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CarFormValues>({ resolver: zodResolver(carFormSchema), defaultValues: car ? toValues(car) : blank });

  useEffect(() => {
    if (car) reset(toValues(car));
  }, [car, reset]);

  const features = useWatch({ control, name: "features" }) ?? [];
  const price = useWatch({ control, name: "pricePerDay" });
  const weekly = useWatch({ control, name: "weeklyDiscount" });
  const monthly = useWatch({ control, name: "monthlyDiscount" });
  const lat = useWatch({ control, name: "lat" });
  const lng = useWatch({ control, name: "lng" });
  const pending = create.isPending || update.isPending;

  const preview = useMemo(() => {
    if (!(price > 0)) return null;
    return { day: estimatePrice(price, 3, weekly || 0, monthly || 0), week: estimatePrice(price, 7, weekly || 0, monthly || 0), month: estimatePrice(price, 30, weekly || 0, monthly || 0) };
  }, [price, weekly, monthly]);

  const toggleFeature = (f: string) => setValue("features", features.includes(f) ? features.filter((x) => x !== f) : [...features, f], { shouldDirty: true });
  const addCustom = () => {
    const f = custom.trim();
    if (f && !features.includes(f) && features.length < 20) setValue("features", [...features, f], { shouldDirty: true });
    setCustom("");
  };

  const submit = (v: CarFormValues) => {
    const payload: CarPayload = {
      ...v,
      doors: v.doors || undefined,
      lat: Number.isFinite(v.lat) ? v.lat : undefined,
      lng: Number.isFinite(v.lng) ? v.lng : undefined,
    };
    const done = { onSuccess: () => router.push("/owner/cars") };
    if (car) update.mutate({ id: car.id, payload }, done);
    else create.mutate(payload, done);
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
      <Section title="The basics" hint="What is it, and what makes it a good rental?">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Brand" htmlFor="f-brand" error={errors.brand?.message}><input id="f-brand" placeholder="Toyota" className="input input-bordered w-full" {...register("brand")} /></FormField>
          <FormField label="Model" htmlFor="f-model" error={errors.model?.message}><input id="f-model" placeholder="Corolla Hybrid" className="input input-bordered w-full" {...register("model")} /></FormField>
          <FormField label="Year" htmlFor="f-year" error={errors.year?.message}><input id="f-year" type="number" inputMode="numeric" className="input input-bordered w-full" {...register("year", { valueAsNumber: true })} /></FormField>
          <FormField label="Body style" htmlFor="f-cat" error={errors.category?.message}>
            <select id="f-cat" className="select select-bordered w-full" {...register("category")}>
              <option value="">Choose one</option>
              {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>
          <FormField label="Description" htmlFor="f-desc" error={errors.description?.message} hint="Condition, hand-over details, what renters love about it." className="sm:col-span-2">
            <textarea id="f-desc" rows={5} className="textarea textarea-bordered w-full" {...register("description")} />
          </FormField>
        </div>
      </Section>

      <Section title="Specs & features">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Seats" htmlFor="f-seats" error={errors.seats?.message}><input id="f-seats" type="number" min={1} max={15} className="input input-bordered w-full" {...register("seats", { valueAsNumber: true })} /></FormField>
          <FormField label="Doors" htmlFor="f-doors" error={errors.doors?.message}><input id="f-doors" type="number" min={2} max={6} className="input input-bordered w-full" {...register("doors", num)} /></FormField>
          <FormField label="Fuel type" htmlFor="f-fuel" error={errors.fuelType?.message}>
            <select id="f-fuel" className="select select-bordered w-full" {...register("fuelType")}>
              <option value="">Choose one</option>
              {FUEL_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </FormField>
          <FormField label="Transmission" htmlFor="f-trans" error={errors.transmission?.message}>
            <select id="f-trans" className="select select-bordered w-full" {...register("transmission")}>
              <option value="">Choose one</option>
              {TRANSMISSION_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </FormField>
        </div>
        <p className="mb-2 mt-7 text-sm font-semibold">Features</p>
        <div className="flex flex-wrap gap-2">
          {[...new Set([...FEATURE_SUGGESTIONS, ...features])].map((f) => (
            <button key={f} type="button" onClick={() => toggleFeature(f)} aria-pressed={features.includes(f)} className={cn("rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors", features.includes(f) ? "border-primary bg-primary text-primary-content" : "border-base-300 hover:border-base-content/40")}>{f}</button>
          ))}
        </div>
        <div className="mt-4 flex max-w-md gap-2">
          <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="Add your own, e.g. Ski rack" className="input input-bordered min-w-0 flex-1" aria-label="Custom feature" maxLength={40} />
          <button type="button" className="btn btn-outline" onClick={addCustom}><Plus size={16} /> Add</button>
        </div>
      </Section>

      <Section title="Pricing" hint="Longer trips can earn a discount. Renters see the total before they request.">
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="Daily price (USD)" htmlFor="f-price" error={errors.pricePerDay?.message}><input id="f-price" type="number" min={5} step="1" className="input input-bordered w-full" {...register("pricePerDay", { valueAsNumber: true })} /></FormField>
          <FormField label="Weekly discount (%)" htmlFor="f-week" error={errors.weeklyDiscount?.message} hint="Applied from 7 days"><input id="f-week" type="number" min={0} max={60} className="input input-bordered w-full" {...register("weeklyDiscount", { valueAsNumber: true })} /></FormField>
          <FormField label="Monthly discount (%)" htmlFor="f-month" error={errors.monthlyDiscount?.message} hint="Applied from 30 days"><input id="f-month" type="number" min={0} max={80} className="input input-bordered w-full" {...register("monthlyDiscount", { valueAsNumber: true })} /></FormField>
        </div>
        {preview && (
          <dl className="mt-6 grid gap-3 rounded-2xl bg-base-200 p-4 text-sm sm:grid-cols-3">
            <div><dt className="text-base-content/60">3-day trip</dt><dd className="font-display text-2xl font-bold">{money(preview.day.total, { cents: true })}</dd></div>
            <div><dt className="text-base-content/60">7-day trip{preview.week.discountPercent ? ` (−${preview.week.discountPercent}%)` : ""}</dt><dd className="font-display text-2xl font-bold">{money(preview.week.total, { cents: true })}</dd></div>
            <div><dt className="text-base-content/60">30-day trip{preview.month.discountPercent ? ` (−${preview.month.discountPercent}%)` : ""}</dt><dd className="font-display text-2xl font-bold">{money(preview.month.total, { cents: true })}</dd></div>
          </dl>
        )}
      </Section>

      <Section title="Where is it?" hint="Renters search by city and distance. The exact meeting point is only shared after a trip is confirmed.">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="City" htmlFor="f-city" error={errors.city?.message}><input id="f-city" placeholder="Los Angeles" className="input input-bordered w-full" {...register("city")} /></FormField>
          <FormField label="Country" htmlFor="f-country" error={errors.country?.message}><input id="f-country" placeholder="United States" className="input input-bordered w-full" {...register("country")} /></FormField>
          <FormField label="Neighbourhood or street" htmlFor="f-address" error={errors.address?.message} className="sm:col-span-2"><input id="f-address" placeholder="Ocean Ave, Santa Monica" className="input input-bordered w-full" {...register("address")} /></FormField>
          <FormField label="Latitude" htmlFor="f-lat" hint="Needed for “cars near me” search"><input id="f-lat" type="number" step="any" className="input input-bordered w-full" {...register("lat", num)} /></FormField>
          <FormField label="Longitude" htmlFor="f-lng"><input id="f-lng" type="number" step="any" className="input input-bordered w-full" {...register("lng", num)} /></FormField>
        </div>
        <div className="mt-5">
          <LocationPicker lat={Number.isFinite(lat) ? lat : undefined} lng={Number.isFinite(lng) ? lng : undefined} onChange={(p) => { setValue("lat", p.lat, { shouldDirty: true }); setValue("lng", p.lng, { shouldDirty: true }); }} />
        </div>
      </Section>

      <Section title="Photos" hint="Bright, clear photos from a few angles get booked more.">
        <Controller control={control} name="images" render={({ field }) => <PhotoUploader value={field.value} onChange={field.onChange} error={errors.images?.message as string | undefined} />} />
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-base-content/65">{car ? "Changes to a rejected listing send it back for review." : "New listings are reviewed by our team before they go live."}</p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => router.push("/owner/cars")}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
            {pending && <span className="loading loading-spinner" />}
            {car ? "Save changes" : "Submit for review"}
          </button>
        </div>
      </div>
    </form>
  );
}
