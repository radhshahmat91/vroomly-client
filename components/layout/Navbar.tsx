"use client";

import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href.includes("#") ? false : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="glass sticky top-0 z-50 border-b border-base-300/70">
      <div className="container-x flex h-16 items-center gap-3">
        <Link href="/" aria-label="Vroomly home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-base-200", isActive(l.href) && "bg-base-200")}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : isLoading ? (
            <span className="h-10 w-28" aria-hidden="true" />
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost hidden sm:inline-flex">Log in</Link>
              <Link href="/register" className="btn btn-primary">Sign up</Link>
            </>
          )}
          <button className="btn btn-ghost btn-circle lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-base-300 bg-base-100 lg:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-3">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-xl px-4 py-3 font-semibold hover:bg-base-200">
                  {l.label}
                </Link>
              ))}
              {!user && !isLoading && (
                <Link href="/login" className="rounded-xl px-4 py-3 font-semibold hover:bg-base-200 sm:hidden">
                  Log in
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
