"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  CalendarDays,
  Headphones,
  Images,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn, initials } from "@/lib/utils";
import { isManager } from "@/lib/constants";
import type { SessionUser } from "@/lib/jwt";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/archive", label: "Task Archive", icon: Archive },
      { href: "/calendar", label: "Calendars", icon: CalendarDays },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/creative", label: "Creative Assets", icon: Images },
      { href: "/payout", label: "Payout Tracker", icon: Wallet },
      { href: "/csr", label: "Customer Service", icon: Headphones },
    ],
  },
  {
    label: "Marketing",
    items: [{ href: "/marketing", label: "Digital Marketing", icon: Megaphone }],
  },
];

function NavLinks({
  onNavigate,
  manager,
}: {
  onNavigate?: () => void;
  manager: boolean;
}) {
  const pathname = usePathname();

  const groups = [...NAV_GROUPS];
  if (manager) {
    groups.push({
      label: "Administration",
      items: [{ href: "/users", label: "Team Accounts", icon: Users }],
    });
  }

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-white/10 font-medium text-white"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        active ? "text-primary" : "text-current",
                      )}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="border-t border-sidebar-border p-3">
      <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
          {initials(user.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-sidebar-foreground/50">
            {user.role}
          </p>
        </div>
      </div>
      <Link
        href="/account"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <Settings className="h-3.5 w-3.5" />
        Account settings
      </Link>
      <button
        type="button"
        onClick={logout}
        disabled={pending}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground disabled:opacity-50"
      >
        <LogOut className="h-3.5 w-3.5" />
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const manager = isManager(user.role);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <Link
          href="/dashboard"
          className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-xs font-bold tracking-tight text-primary-foreground">
            TCL
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">E-Commerce Ops</p>
            <p className="text-[11px] text-sidebar-foreground/50">
              Productivity Suite
            </p>
          </div>
        </Link>
        <NavLinks manager={manager} />
        <SidebarFooter user={user} />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent
                className="left-0 top-0 flex h-full max-h-none w-72 max-w-[85vw] translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none border-r border-sidebar-border bg-sidebar p-0 text-sidebar-foreground sm:p-0"
                aria-describedby={undefined}
              >
                <DialogTitle className="sr-only">Navigation</DialogTitle>
                <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                      TCL
                    </span>
                    <div className="leading-tight">
                      <p className="text-sm font-semibold">E-Commerce Ops</p>
                      <p className="text-[11px] text-sidebar-foreground/50">
                        Productivity Suite
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent"
                    aria-label="Close navigation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <NavLinks
                  manager={manager}
                  onNavigate={() => setMobileOpen(false)}
                />
                <SidebarFooter user={user} />
              </DialogContent>
            </Dialog>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                Welcome back, {user.name.split(" ")[0]}
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                {user.role} · TCL Sun Inc.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
              {manager ? "Manager access" : "Staff access"}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
