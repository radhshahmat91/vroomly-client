import type { Metadata } from "next";
import { ComplaintsView } from "@/components/dashboard/ComplaintsView";

export const metadata: Metadata = { title: "Report a Problem" };

export default function Page() {
  return <ComplaintsView />;
}
