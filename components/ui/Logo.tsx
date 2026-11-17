import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-9", className)} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#ffc21a" />
      <path d="M14 18l14 30h8L50 18" fill="none" stroke="#1b1f24" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 24v6M32 35v6" stroke="#1b1f24" strokeWidth="3.5" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && <span className="font-display text-[1.7rem] font-extrabold leading-none tracking-tight">Vroomly</span>}
    </span>
  );
}
