import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentAccount } from "@/lib/session";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentAccount();
  if (!user) redirect("/login");

  return <AppShell user={user}>{children}</AppShell>;
}
