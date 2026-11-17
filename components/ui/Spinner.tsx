import { cn } from "@/lib/utils";

export function Spinner({ className, size = "md" }: { className?: string; size?: "xs" | "sm" | "md" | "lg" }) {
  return <span role="status" aria-label="Loading" className={cn("loading loading-spinner", `loading-${size}`, "text-secondary", className)} />;
}

/** Centered spinner shown while a page's data loads. */
export function PageLoader({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex min-h-[45vh] flex-col items-center justify-center gap-4 text-base-content/70", className)}>
      <Spinner size="lg" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function InlineLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-sm text-base-content/70">
      <Spinner size="sm" />
      {label && <span>{label}</span>}
    </div>
  );
}
