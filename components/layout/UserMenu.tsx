"use client";

import { Bell, CalendarDays, LayoutDashboard, LogOut, PlusCircle, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";

const close = () => (document.activeElement as HTMLElement | null)?.blur();

export function UserMenu() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const home = user.role === "admin" ? "/admin" : user.role === "owner" ? "/owner" : "/dashboard";
  const homeLabel = user.role === "admin" ? "Admin console" : user.role === "owner" ? "Host dashboard" : "My dashboard";

  const items = [
    { href: home, label: homeLabel, icon: user.role === "admin" ? ShieldCheck : LayoutDashboard },
    { href: "/dashboard/bookings", label: "My trips", icon: CalendarDays },
    ...(user.role === "renter" ? [{ href: "/become-host", label: user.hostStatus === "pending" ? "Host application" : "Become a host", icon: PlusCircle }] : []),
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile & settings", icon: UserRound },
  ];

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar" aria-label="Open account menu">
        <Avatar name={user.name} src={user.image} size="sm" />
      </div>
      <div tabIndex={0} className="dropdown-content z-[60] mt-3 w-72 overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-base-300 p-4">
          <Avatar name={user.name} src={user.image} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-bold">{user.name}</p>
            <p className="truncate text-sm text-base-content/60">{user.email}</p>
            <RoleBadge role={user.role} className="mt-1.5 badge-sm" />
          </div>
        </div>
        <ul className="p-2">
          {items.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-base-200">
                <Icon size={18} className="text-base-content/70" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-base-300 p-2">
          <button
            onClick={() => {
              close();
              signOut();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-error hover:bg-error/10"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
