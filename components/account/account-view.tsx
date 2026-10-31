"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/client";
import { changePasswordSchema } from "@/lib/validations";
import { formatDate, initials } from "@/lib/utils";

type Me = {
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    birthday?: string;
  };
  isManager: boolean;
};

export function AccountView() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    password: "",
    confirm: "",
  });

  useEffect(() => {
    let active = true;
    apiRequest<Me>("/api/auth/me")
      .then((data) => {
        if (active) setMe(data);
      })
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : "Could not load profile",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    const parsed = changePasswordSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }

    setSaving(true);
    try {
      await apiRequest("/api/auth/password", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Password updated");
      setForm({ currentPassword: "", password: "", confirm: "" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update password",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Account settings"
        description="Your profile details and password."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !me ? (
              <div className="space-y-3">
                <div className="h-16 animate-pulse rounded-lg bg-secondary" />
                <div className="h-10 animate-pulse rounded-lg bg-secondary" />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    {initials(me.user.name)}
                  </span>
                  <div>
                    <p className="font-semibold">{me.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{me.user.username}
                    </p>
                  </div>
                </div>

                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
                    <dt className="text-muted-foreground">Role</dt>
                    <dd className="flex items-center gap-2 font-medium">
                      {me.user.role}
                      {me.isManager ? (
                        <Badge className="bg-rose-50 text-rose-700 ring-rose-200">
                          Manager
                        </Badge>
                      ) : null}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
                    <dt className="text-muted-foreground">Birthday</dt>
                    <dd className="font-medium">
                      {formatDate(me.user.birthday)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Access</dt>
                    <dd className="inline-flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Protected session
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={form.currentPassword}
                  onChange={(event) =>
                    setForm({ ...form, currentPassword: event.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={(event) =>
                    setForm({ ...form, confirm: event.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Update password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
