"use client";

import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { notificationIcon } from "@/components/notifications/NotificationBell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { InlineLoader } from "@/components/ui/Spinner";
import { Tabs } from "@/components/ui/Tabs";
import { useDeleteNotification, useMarkAllRead, useMarkRead, useNotifications } from "@/hooks/useNotifications";
import { cn, timeAgo } from "@/lib/utils";

export function NotificationsView() {
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications({ unread: tab === "unread", page, limit: 10 });
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const remove = useDeleteNotification();
  const unread = data?.meta.unread ?? 0;

  return (
    <div className="container-x max-w-4xl py-10 lg:py-14">
      <PageHeader
        title="Notifications"
        subtitle="Booking updates, payments, reviews and messages from the Vroomly team. New ones appear here instantly."
        actions={<button className="btn btn-outline" disabled={!unread || markAll.isPending} onClick={() => markAll.mutate()}><CheckCheck size={18} /> Mark all as read</button>}
      />
      <Tabs
        tabs={[{ key: "all", label: "All" }, { key: "unread", label: "Unread", count: unread }]}
        value={tab}
        onChange={(k) => { setTab(k); setPage(1); }}
      />

      <div className="mt-6">
        {isLoading && <InlineLoader label="Loading notifications…" />}
        {data && data.data.length === 0 && (
          <EmptyState icon={<Bell size={26} />} title={tab === "unread" ? "Nothing unread" : "No notifications yet"} description="When a host answers a request or a payment lands, you'll see it here." />
        )}
        {data && data.data.length > 0 && (
          <ul className="surface divide-y divide-base-300 overflow-hidden">
            {data.data.map((n) => {
              const Icon = notificationIcon(n.type);
              return (
                <li key={n.id} className={cn("flex items-start gap-4 p-5", !n.read && "bg-primary/10")}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-base-200"><Icon size={20} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3">
                      <p className={cn("text-lg", n.read ? "font-semibold" : "font-bold")}>{n.title}</p>
                      {!n.read && <span className="badge badge-secondary badge-sm">New</span>}
                    </div>
                    <p className="mt-0.5 text-base-content/75">{n.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-base-content/55">{timeAgo(n.createdAt)}</span>
                      {n.link && <Link href={n.link} onClick={() => !n.read && markRead.mutate(n.id)} className="font-semibold text-secondary underline-offset-4 hover:underline">Open</Link>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!n.read && <button className="btn btn-ghost btn-sm btn-circle" onClick={() => markRead.mutate(n.id)} aria-label="Mark as read" title="Mark as read"><Check size={18} /></button>}
                    <button className="btn btn-ghost btn-sm btn-circle" onClick={() => remove.mutate(n.id)} aria-label="Delete notification" title="Delete"><Trash2 size={18} /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} className="mt-6" />
      </div>
    </div>
  );
}
