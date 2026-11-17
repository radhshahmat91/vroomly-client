"use client";

import { Banknote, CalendarClock, CalendarDays, Car, LayoutDashboard, Star } from "lucide-react";
import type { ReactNode } from "react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";

const items: PortalNavItem[] = [
  { href: "/owner", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/owner/cars", label: "My cars", icon: Car },
  { href: "/owner/bookings", label: "Booking requests", icon: CalendarDays },
  { href: "/owner/availability", label: "Availability", icon: CalendarClock },
  { href: "/owner/earnings", label: "Earnings", icon: Banknote },
  { href: "/owner/reviews", label: "Reviews", icon: Star },
];

export function OwnerShell({ children }: { children: ReactNode }) {
  return (
    <PortalShell title="Host dashboard" roles={["owner"]} items={items}>
      {children}
    </PortalShell>
  );
}
