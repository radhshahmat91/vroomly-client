"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

function SidebarInner({ title, items }: { title: string; items: PortalNavItem[] }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const active = (i: PortalNavItem) => (i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(`${i.href}/`));

  return (
    <>
      <aside className="lg:sticky lg:top-24 lg:h-fit lg:w-64 lg:shrink-0">
        <div className="mb-4 hidden items-center gap-3 rounded-box border border-base-300 bg-base-100 p-4 lg:flex">
          <Avatar name={user?.name} src={user?.image} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user?.name}</p>
            <RoleBadge role={user?.role ?? "renter"} className="badge-sm mt-1" />
          </div>
        </div>
        <p className="mb-2 hidden px-3 font-display text-lg font-bold text-base-content/60 lg:block">{title}</p>
        <nav aria-label={title} className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
          {items.map((item) => {
            const on = active(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors lg:rounded-xl",
                  on ? "bg-primary text-primary-content" : "text-base-content/75 hover:bg-base-200",
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export function PortalShell({ title, roles, items, children }: { title: string; roles?: Role[]; items: PortalNavItem[]; children: ReactNode }) {
  return (
    <RequireAuth roles={roles}>
      <div className="container-x flex flex-col gap-6 py-6 lg:flex-row lg:gap-10 lg:py-10">
        <SidebarInner title={title} items={items} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </RequireAuth>
  );
}
