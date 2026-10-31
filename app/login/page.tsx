import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your tasks, calendars and e-commerce operations."
    >
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-secondary" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
