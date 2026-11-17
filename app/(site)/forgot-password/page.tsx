import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { PageLoader } from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "Forgot Password", description: "Get a link to reset your Vroomly password." };

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
