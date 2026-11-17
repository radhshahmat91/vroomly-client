"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money, monthLabel } from "@/lib/utils";
import { axisTick, ChartFrame, chartTooltipStyle } from "./ChartFrame";

export function RevenueChart({ data }: { data: { month: string; gross: number; commission: number }[] }) {
  const rows = data.map((d) => ({ ...d, label: monthLabel(d.month) }));
  return (
    <ChartFrame height={320}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="gGross" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gFee" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.7} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-base-300)" strokeDasharray="4 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
          <YAxis tickLine={false} axisLine={false} tick={axisTick} tickFormatter={(v) => `$${v}`} width={56} />
          <Tooltip contentStyle={chartTooltipStyle} formatter={(value, name) => [money(Number(value), { cents: true }), name === "gross" ? "Gross bookings" : "Vroomly commission"]} />
          <Area type="monotone" dataKey="gross" stroke="var(--color-secondary)" strokeWidth={2.5} fill="url(#gGross)" />
          <Area type="monotone" dataKey="commission" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#gFee)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
