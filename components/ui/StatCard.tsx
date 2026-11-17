import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, icon, hint, tone = "default" }: { label: string; value: ReactNode; icon?: ReactNode; hint?: string; tone?: "default" | "primary" | "dark" }) {
  return (
    <div
      className={cn(
        "rounded-box border p-5",
        tone === "primary" && "border-transparent bg-primary text-primary-content",
        tone === "dark" && "border-transparent bg-neutral text-neutral-content",
        tone === "default" && "border-base-300 bg-base-100",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-sm font-semibold", tone === "default" ? "text-base-content/65" : "opacity-80")}>{label}</p>
        {icon && <span className={cn("grid size-9 place-items-center rounded-full", tone === "default" ? "bg-primary/30" : "bg-white/15")}>{icon}</span>}
      </div>
      <p className="mt-3 font-display text-4xl font-bold leading-none">{value}</p>
      {hint && <p className={cn("mt-2 text-sm", tone === "default" ? "text-base-content/60" : "opacity-75")}>{hint}</p>}
    </div>
  );
}
