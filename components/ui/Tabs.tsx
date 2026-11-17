"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

/** Pill tabs with a sliding highlight. */
export function Tabs({ tabs, value, onChange, className }: { tabs: TabItem[]; value: string; onChange: (key: string) => void; className?: string }) {
  const id = useId();
  return (
    <div role="tablist" className={cn("no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-base-200 p-1", className)}>
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={cn("relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors", active ? "text-primary-content" : "text-base-content/70 hover:text-base-content")}
          >
            {active && <motion.span layoutId={`tab-${id}`} className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {t.label}
              {typeof t.count === "number" && t.count > 0 && <span className={cn("rounded-full px-1.5 text-xs", active ? "bg-neutral/15" : "bg-base-300")}>{t.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
