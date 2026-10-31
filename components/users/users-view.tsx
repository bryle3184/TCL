"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, confirmAction } from "@/lib/client";
import { ROLES, isManager } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { AccountRecord } from "@/lib/types";

const emptyForm = {
  name: "",
  username: "",
  birthday: "",
  role: "Sales Channel Operators",
  password: "",
};

export function UsersView({ currentUserId }: { currentUserId: string }) {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AccountRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ accounts: AccountRecord[] }>(
        "/api/users",
      );
      setAccounts(data.accounts);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load accounts",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const managerCount = useMemo(
    () => accounts.filter((account) => isManager(account.role)).length,
    [accounts],
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(account: AccountRecord) {
    setEditing(account);
    setForm({
      name: account.name,
      username: account.username,
      birthday: account.birthday ?? "",
      role: account.role,
      password: "",
    });
    setOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await apiRequest(`/api/users/${editing._id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: form.name,
            role: form.role,
            birthday: form.birthday,
            ...(form.password ? { password: form.password } : {}),
          }),
        });
        toast.success("Account updated");
      } else {
        await apiRequest("/api/users", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast.success("Account created");
      }
      setOpen(false);
      setForm(emptyForm);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save account",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(account: AccountRecord) {
    if (
      !(await confirmAction(
        `Delete ${account.name}'s account? They will lose access immediately.`,
      ))
    ) {
      return;
    }
    try {
      await apiRequest(`/api/users/${account._id}`, { method: "DELETE" });
      toast.success("Account deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Team accounts"
        description="Manage workspace access, roles and password resets."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add account
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Accounts" value={accounts.length} icon={Users} />
        <StatCard
          label="Managers"
          value={managerCount}
          icon={ShieldCheck}
          tone="info"
        />
        <StatCard
          label="Staff roles"
          value={accounts.length - managerCount}
          icon={UserRound}
        />
      </div>

      <Card className="mt-6">
        <CardContent className="p-4 sm:p-5">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((key) => (
                <div
                  key={key}
                  className="h-12 animate-pulse rounded-lg bg-secondary"
                />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No accounts"
              description="Add your first team account."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Birthday</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account._id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        {account.name}
                        {account._id === currentUserId ? (
                          <Badge variant="primary">You</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {account.username}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{account.role}</span>
                        {isManager(account.role) ? (
                          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(account.birthday)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(account.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(account)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void remove(account)}
                          disabled={account._id === currentUserId}
                          aria-label="Delete account"
                        >
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit account" : "Add account"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update role, details or set a new password."
                : "Create login credentials for a team member."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Full name</Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user-username">Username</Label>
                <Input
                  id="user-username"
                  value={form.username}
                  onChange={(event) =>
                    setForm({ ...form, username: event.target.value })
                  }
                  disabled={!!editing}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-birthday">Birthday</Label>
                <Input
                  id="user-birthday"
                  type="date"
                  value={form.birthday}
                  onChange={(event) =>
                    setForm({ ...form, birthday: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select
                id="user-role"
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value })
                }
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-password">
                {editing ? "New password (optional)" : "Password"}
              </Label>
              <Input
                id="user-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                placeholder="At least 8 characters"
                required={!editing}
              />
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <KeyRound className="h-3 w-3" />
                Passwords are hashed with bcrypt before storage.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Create account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
