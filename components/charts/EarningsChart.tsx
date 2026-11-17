"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money, monthLabel } from "@/lib/utils";
import type { EarningsMonth } from "@/types";
import { axisTick, ChartFrame, chartTooltipStyle } from "./ChartFrame";

/** Monthly earnings for a host: net payout stacked on top of the platform fee. */
export function EarningsChart({ data }: { data: EarningsMonth[] }) {
  const rows = data.map((d) => ({ ...d, label: monthLabel(d.month) }));
  return (
    <ChartFrame height={320}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-base-300)" strokeDasharray="4 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
          <YAxis tickLine={false} axisLine={false} tick={axisTick} tickFormatter={(v) => `$${v}`} width={56} />
          <Tooltip
            cursor={{ fill: "color-mix(in oklab, var(--color-primary) 18%, transparent)" }}
            contentStyle={chartTooltipStyle}
            formatter={(value, name) => [money(Number(value), { cents: true }), name === "net" ? "You earned" : "Platform fee"]}
          />
          <Bar dataKey="net" stackId="a" fill="var(--color-secondary)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="commission" stackId="a" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
