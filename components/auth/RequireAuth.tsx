"use client";

import { Ban, Lock } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

/**
 * Guards private pages. It waits for the first session lookup before deciding anything, so a signed-in visitor who
 * reloads a private route is never bounced to /login. Signed-out visitors are sent to /login and come straight back.
 */
export function RequireAuth({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      const target = pathname + (typeof window !== "undefined" ? window.location.search : "");
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading) return <PageLoader label="Checking your session…" />;
  if (!user) return <PageLoader label="Taking you to the login page…" />;

  if (user.status === "suspended") {
    return (
      <Notice icon={<Ban size={28} />} title="Your account is suspended" text="You can't use Vroomly right now. If you think this is a mistake, please contact our support team.">
        <button className="btn btn-neutral" onClick={signOut}>Log out</button>
      </Notice>
    );
  }

  if (roles && !roles.includes(user.role)) {
    const hostArea = roles.includes("owner");
    return (
      <Notice
        icon={<Lock size={28} />}
        title={hostArea ? "This area is for approved hosts" : "You don't have access to this page"}
        text={hostArea ? "List your car on Vroomly and once our team approves your application you'll unlock the host dashboard." : "Your account doesn't have permission to view this section."}
      >
        {hostArea && user.role === "renter" ? (
          <Link href="/become-host" className="btn btn-primary">{user.hostStatus === "pending" ? "View my application" : "Become a host"}</Link>
        ) : (
          <Link href="/" className="btn btn-primary">Back to Home</Link>
        )}
      </Notice>
    );
  }

  return <>{children}</>;
}

function Notice({ icon, title, text, children }: { icon: ReactNode; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="container-x grid min-h-[55vh] place-items-center py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-primary/30">{icon}</div>
        <h1 className="font-display text-4xl font-bold">{title}</h1>
        <p className="mt-3 text-base-content/70">{text}</p>
        <div className="mt-7 flex justify-center gap-2">{children}</div>
      </div>
    </div>
  );
}
