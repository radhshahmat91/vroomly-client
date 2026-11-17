import type { Metadata } from "next";
import { BecomeHostView } from "@/components/dashboard/BecomeHostView";

export const metadata: Metadata = {
  title: "Become a Host",
  description: "List your car on Vroomly, set your own price and availability, and earn every time it hits the road.",
};

export default function BecomeHostPage() {
  return <BecomeHostView />;
}
