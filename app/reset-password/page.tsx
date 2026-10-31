import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Verify your account details to set a new password."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
