"use client";

import { Bell, CalendarDays, LayoutDashboard, MessageSquareWarning, Star, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";

const items: PortalNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/bookings", label: "My bookings", icon: CalendarDays },
  { href: "/dashboard/reviews", label: "My reviews", icon: Star },
  { href: "/dashboard/complaints", label: "Report a problem", icon: MessageSquareWarning },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function RenterShell({ children }: { children: ReactNode }) {
  return (
    <PortalShell title="Your trips" items={items}>
      {children}
    </PortalShell>
  );
}
