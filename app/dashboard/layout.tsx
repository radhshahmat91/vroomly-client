import { Navbar } from "@/components/layout/Navbar";
import { RenterShell } from "@/components/dashboard/RenterShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <RenterShell>{children}</RenterShell>
    </>
  );
}
