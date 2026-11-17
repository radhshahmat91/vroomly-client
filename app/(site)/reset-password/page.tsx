import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { PageLoader } from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "Reset Password", description: "Choose a new Vroomly password." };

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
