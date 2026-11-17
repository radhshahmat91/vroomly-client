"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { BOOKING_STATUS } from "@/lib/constants";
import type { BookingStatus } from "@/types";
import { ChartFrame, chartTooltipStyle } from "./ChartFrame";

const COLORS: Record<BookingStatus, string> = {
  pending: "var(--color-warning)",
  accepted: "var(--color-info)",
  confirmed: "var(--color-success)",
  completed: "var(--color-neutral)",
  rejected: "var(--color-error)",
  cancelled: "var(--color-base-300)",
};

export function StatusChart({ data }: { data: { status: BookingStatus; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const rows = data.map((d) => ({ ...d, name: BOOKING_STATUS[d.status].label }));
  return (
    <div>
      <ChartFrame height={220}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip contentStyle={chartTooltipStyle} />
            <Pie data={rows} dataKey="count" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="var(--color-base-100)" strokeWidth={3}>
              {rows.map((r) => <Cell key={r.status} fill={COLORS[r.status]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartFrame>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.status} className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2"><span className="size-3 rounded-full" style={{ background: COLORS[r.status] }} />{r.name}</span>
            <span className="font-bold">{r.count}{total ? <span className="ml-1 font-normal text-base-content/50">({Math.round((r.count / total) * 100)}%)</span> : null}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
