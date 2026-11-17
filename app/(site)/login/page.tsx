import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { PageLoader } from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "Login", description: "Log in to Vroomly to manage your trips, bookings and listings." };

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoginForm />
    </Suspense>
  );
}
