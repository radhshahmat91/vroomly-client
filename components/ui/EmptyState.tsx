import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-box border border-dashed border-base-300 bg-base-200/50 px-6 py-14 text-center", className)}>
      {icon && <div className="mb-4 grid size-14 place-items-center rounded-full bg-primary/25 text-base-content">{icon}</div>}
      <h3 className="font-display text-2xl font-bold">{title}</h3>
      {description && <p className="mt-2 max-w-md text-base-content/70">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
