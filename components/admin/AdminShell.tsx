"use client";

import { BadgeCheck, BarChart3, CalendarDays, Car, CreditCard, FileSpreadsheet, MessageSquareWarning, Users } from "lucide-react";
import type { ReactNode } from "react";
import { PortalShell, type PortalNavItem } from "@/components/layout/PortalShell";

const items: PortalNavItem[] = [
  { href: "/admin", label: "Analytics", icon: BarChart3, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/owners", label: "Vehicle owners", icon: BadgeCheck },
  { href: "/admin/cars", label: "Cars", icon: Car },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reports", label: "Reports", icon: FileSpreadsheet },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <PortalShell title="Admin console" roles={["admin"]} items={items}>
      {children}
    </PortalShell>
  );
}
