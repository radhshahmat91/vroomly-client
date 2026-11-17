"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="input input-bordered flex w-full items-center gap-2 sm:w-72">
      <Search size={18} className="text-base-content/50" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="grow" aria-label={placeholder} />
    </label>
  );
}

export function PersonCell({ name, email, image }: { name: string; email?: string; image?: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} src={image} size="sm" />
      <div className="min-w-0">
        <p className="truncate font-semibold leading-tight">{name}</p>
        {email && <p className="truncate text-xs text-base-content/60">{email}</p>}
      </div>
    </div>
  );
}

export function TableShell({ children }: { children: ReactNode }) {
  return <div className="surface overflow-x-auto"><table className="table">{children}</table></div>;
}
