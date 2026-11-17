import { BOOKING_STATUS, COMPLAINT_STATUS } from "@/lib/constants";
import { cn, titleCase } from "@/lib/utils";
import type { BookingStatus, CarStatus, ComplaintStatus } from "@/types";

export function BookingBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const s = BOOKING_STATUS[status];
  return <span className={cn("badge badge-soft font-semibold", s.badge, className)}>{s.label}</span>;
}

const CAR_BADGE: Record<CarStatus, string> = {
  approved: "badge-success",
  pending: "badge-warning",
  rejected: "badge-error",
  removed: "badge-neutral",
  suspended: "badge-ghost",
};
export function CarStatusBadge({ status, className }: { status: CarStatus; className?: string }) {
  const label = status === "approved" ? "Live" : status === "pending" ? "In review" : titleCase(status);
  return <span className={cn("badge badge-soft font-semibold", CAR_BADGE[status], className)}>{label}</span>;
}

export function ComplaintBadge({ status, className }: { status: ComplaintStatus; className?: string }) {
  const s = COMPLAINT_STATUS[status];
  return <span className={cn("badge badge-soft font-semibold", s.badge, className)}>{s.label}</span>;
}

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  const tone = role === "admin" ? "badge-neutral" : role === "owner" ? "badge-secondary" : "badge-ghost";
  return <span className={cn("badge badge-soft font-semibold", tone, className)}>{role === "owner" ? "Host" : titleCase(role)}</span>;
}
