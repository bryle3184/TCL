import type { ReactNode } from "react";
import { CheckCircle2, Layers, ShieldCheck, Users } from "lucide-react";

const highlights = [
  { icon: Layers, text: "Tasks, content and campaigns in one workspace" },
  { icon: Users, text: "Role-aware boards for every e-commerce team" },
  { icon: ShieldCheck, text: "Protected accounts and server-side authorization" },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[hsl(var(--sidebar))] p-10 text-sidebar-foreground lg:flex">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-sm font-bold tracking-tight text-primary-foreground">
              TCL
            </span>
            <div className="leading-tight">
              <p className="font-semibold">TCL E-Commerce</p>
              <p className="text-xs text-sidebar-foreground/60">
                Productivity & Task Management
              </p>
            </div>
          </div>

          <h2 className="mt-16 max-w-md text-3xl font-semibold leading-tight tracking-tight">
            One operations hub for the whole e-commerce department.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-sidebar-foreground/70">
            Plan tasks, publish content, track creatives, settle payouts and
            resolve customer concerns — all backed by your live MongoDB Atlas
            workspace.
          </p>

          <ul className="mt-10 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <span className="text-sidebar-foreground/80">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-sidebar-foreground/50">
          <CheckCircle2 className="h-3.5 w-3.5" />
          TCL Sun Inc. · E-Commerce Department
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              TCL
            </span>
            <div className="leading-tight">
              <p className="font-semibold">TCL E-Commerce</p>
              <p className="text-xs text-muted-foreground">Operations hub</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </div>
  );
}
