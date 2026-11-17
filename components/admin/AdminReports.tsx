"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { PageHeader } from "@/components/ui/PageHeader";
import { InlineLoader } from "@/components/ui/Spinner";
import { useRevenueReport } from "@/hooks/useAdmin";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { money, monthLabel } from "@/lib/utils";
import { TableShell } from "./AdminBits";

export function AdminReports() {
  const [months, setMonths] = useState(12);
  const [exporting, setExporting] = useState(false);
  const { data, isLoading } = useRevenueReport(months);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const blob = await adminApi.revenueCsv(months);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vroomly-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded.");
    } catch (err) {
      toast.error(errorMessage(err, "We couldn't export the report."));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Revenue report"
        subtitle="Gross bookings, Vroomly's commission and host payouts by month."
        actions={
          <>
            <select className="select select-bordered" value={months} onChange={(e) => setMonths(Number(e.target.value))} aria-label="Report period">
              <option value={6}>Last 6 months</option><option value={12}>Last 12 months</option><option value={24}>Last 24 months</option>
            </select>
            <button className="btn btn-primary" onClick={exportCsv} disabled={exporting || !data}>
              {exporting ? <span className="loading loading-spinner loading-sm" /> : <Download size={18} />} Export CSV
            </button>
          </>
        }
      />
      {isLoading && <InlineLoader label="Building the report…" />}
      {data && (
        <>
          <section className="surface p-5 sm:p-6"><RevenueChart data={data.rows} /></section>
          <div className="mt-6">
            <TableShell>
              <thead><tr><th>Month</th><th className="text-right">Paid bookings</th><th className="text-right">Gross revenue</th><th className="text-right">Commission</th><th className="text-right">Host payouts</th><th className="text-right">Refunded</th></tr></thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.month}>
                    <td className="font-semibold">{monthLabel(r.month)}</td>
                    <td className="text-right">{r.bookings}</td>
                    <td className="text-right">{money(r.gross, { cents: true })}</td>
                    <td className="text-right">{money(r.commission, { cents: true })}</td>
                    <td className="text-right">{money(r.payouts, { cents: true })}</td>
                    <td className="text-right text-base-content/60">{money(r.refunds, { cents: true })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td>Total</td>
                  <td className="text-right">{data.totals.bookings}</td>
                  <td className="text-right">{money(data.totals.gross, { cents: true })}</td>
                  <td className="text-right">{money(data.totals.commission, { cents: true })}</td>
                  <td className="text-right">{money(data.totals.payouts, { cents: true })}</td>
                  <td className="text-right">{money(data.totals.refunds, { cents: true })}</td>
                </tr>
              </tfoot>
            </TableShell>
          </div>
        </>
      )}
    </div>
  );
}
