import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { PageLoader } from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "Register", description: "Create a free Vroomly account to rent cars or list your own." };

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RegisterForm />
    </Suspense>
  );
}
