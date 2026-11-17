import { AdminShell } from "@/components/admin/AdminShell";
import { Navbar } from "@/components/layout/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <AdminShell>{children}</AdminShell>
    </>
  );
}
