import { Navbar } from "@/components/layout/Navbar";
import { OwnerShell } from "@/components/owner/OwnerShell";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <OwnerShell>{children}</OwnerShell>
    </>
  );
}
