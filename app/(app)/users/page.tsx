import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UsersView } from "@/components/users/users-view";
import { getCurrentAccount } from "@/lib/session";
import { isManager } from "@/lib/constants";

export const metadata: Metadata = { title: "Team accounts" };

export default async function UsersPage() {
  const user = await getCurrentAccount();
  if (!user) redirect("/login");
  if (!isManager(user.role)) redirect("/dashboard");

  return <UsersView currentUserId={user.id} />;
}
