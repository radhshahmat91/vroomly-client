"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { setApiSignedIn } from "@/lib/api/client";
import { clearAccessToken } from "@/lib/token";
import type { AppUser, HostStatus, Role } from "@/types";

interface AuthValue {
  user: AppUser | null;
  /** True only while the very first session lookup is running — guards use this to avoid redirect flashes. */
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending, refetch } = authClient.useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const user = useMemo<AppUser | null>(() => {
    const u = data?.user as (Record<string, unknown> & { id: string; name: string; email: string }) | undefined;
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: (u.image as string | null | undefined) ?? null,
      role: ((u.role as Role) || "renter") as Role,
      status: (u.status as AppUser["status"]) || "active",
      hostStatus: ((u.hostStatus as HostStatus) || "none") as HostStatus,
      phone: (u.phone as string) || "",
      city: (u.city as string) || "",
      bio: (u.bio as string) || "",
    };
  }, [data?.user]);

  const userId = user?.id;
  useEffect(() => {
    setApiSignedIn(Boolean(userId));
    if (!userId) clearAccessToken();
  }, [userId]);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    clearAccessToken();
    setApiSignedIn(false);
    queryClient.clear();
    router.push("/");
    router.refresh();
  }, [queryClient, router]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo<AuthValue>(
    () => ({ user, isLoading: isPending, isAuthenticated: Boolean(user), signOut, refresh }),
    [user, isPending, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
