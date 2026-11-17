"use client";

import { Bell, BadgeCheck, CalendarCheck, Car, CreditCard, MessageSquareWarning, Star, UserCog, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMarkAllRead, useMarkRead, useNotifications } from "@/hooks/useNotifications";
import { cn, timeAgo } from "@/lib/utils";
import type { AppNotification } from "@/types";

export function notificationIcon(type: string): LucideIcon {
  if (type.startsWith("booking")) return CalendarCheck;
  if (type.startsWith("payment")) return CreditCard;
  if (type.startsWith("review")) return Star;
  if (type.startsWith("car")) return Car;
  if (type.startsWith("host")) return BadgeCheck;
  if (type.startsWith("complaint")) return MessageSquareWarning;
  if (type === "account") return UserCog;
  return Bell;
}

export function NotificationBell() {
  const router = useRouter();
  const { data } = useNotifications({ limit: 6 });
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const unread = data?.meta.unread ?? 0;
  const items = data?.data ?? [];

  const open = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
    (document.activeElement as HTMLElement | null)?.blur();
    if (n.link) router.push(n.link);
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" aria-label={unread ? `${unread} unread notifications` : "Notifications"}>
        <span className="indicator">
          <Bell size={20} />
          {unread > 0 && <span className="badge badge-primary badge-xs indicator-item min-w-4 font-bold">{unread > 9 ? "9+" : unread}</span>}
        </span>
      </div>
      <div tabIndex={0} className="dropdown-content z-[60] mt-3 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
          <p className="font-display text-xl font-bold">Notifications</p>
          <button className="btn btn-ghost btn-xs" disabled={!unread || markAll.isPending} onClick={() => markAll.mutate()}>
            Mark all read
          </button>
        </div>
        <ul className="max-h-96 overflow-y-auto">
          {items.length === 0 && <li className="px-4 py-10 text-center text-sm text-base-content/60">You're all caught up.</li>}
          {items.map((n) => {
            const Icon = notificationIcon(n.type);
            return (
              <li key={n.id}>
                <button onClick={() => open(n)} className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-base-200", !n.read && "bg-primary/10")}>
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-base-200">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className={cn("text-sm", !n.read ? "font-bold" : "font-semibold")}>{n.title}</span>
                      {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-secondary" aria-label="Unread" />}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-sm text-base-content/70">{n.message}</span>
                    <span className="mt-1 block text-xs text-base-content/50">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <Link href="/notifications" onClick={() => (document.activeElement as HTMLElement | null)?.blur()} className="block border-t border-base-300 px-4 py-3 text-center text-sm font-semibold hover:bg-base-200">
          View all notifications
        </Link>
      </div>
    </div>
  );
}
