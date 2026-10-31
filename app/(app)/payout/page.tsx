"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
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
import { PAYOUT_STATUSES } from "@/lib/constants";
import { formatDate, todayISO } from "@/lib/utils";
import type { Payout } from "@/lib/types";

export default function PayoutPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [form, setForm] = useState({
    name: "",
    campaign: "",
    date: todayISO(),
    link: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ payouts: Payout[] }>("/api/payouts");
      setPayouts(data.payouts);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load payouts",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return payouts.filter((item) => {
      const matchesStatus = status === "all" || item.status === status;
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.campaign.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [payouts, search, status]);

  const stats = useMemo(
    () => ({
      total: payouts.length,
      done: payouts.filter((item) => item.status === "Done").length,
      finance: payouts.filter((item) =>
        ["Waiting for Finance", "SI Delivered"].includes(item.status),
      ).length,
    }),
    [payouts],
  );

  async function updateStatus(item: Payout, next: string) {
    try {
      await apiRequest(`/api/payouts/${item._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setPayouts((current) =>
        current.map((row) =>
          row._id === item._id ? { ...row, status: next } : row,
        ),
      );
      toast.success("Payout status updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function remove(item: Payout) {
    if (
      !(await confirmAction(
        `Delete the payout record for ${item.name} – ${item.campaign}?`,
      ))
    ) {
      return;
    }
    try {
      await apiRequest(`/api/payouts/${item._id}`, { method: "DELETE" });
      toast.success("Payout deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.campaign.trim()) {
      toast.error("Influencer and campaign are required.");
      return;
    }

    setSaving(true);
    try {
      await apiRequest("/api/payouts", {
        method: "POST",
        body: JSON.stringify({ ...form, status: "Ongoing Creation" }),
      });
      toast.success("Campaign added to payout tracker");
      setOpen(false);
      setForm({
        name: "",
        campaign: "",
        date: todayISO(),
        link: "",
      });
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Payout tracker"
        description="Follow influencer campaigns from creation through finance release."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Add campaign
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Campaigns" value={stats.total} icon={Wallet} />
        <StatCard
          label="Delivered / completed"
          value={stats.done}
          icon={CircleDollarSign}
          tone="success"
        />
        <StatCard
          label="With finance"
          value={stats.finance}
          icon={CircleDollarSign}
          tone="info"
        />
      </div>

      <Card className="mt-6">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search influencer or campaign"
                className="pl-9"
              />
            </div>
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="sm:w-56"
            >
              <option value="all">All statuses</option>
              {PAYOUT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((key) => (
                <div
                  key={key}
                  className="h-12 animate-pulse rounded-lg bg-secondary"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title={payouts.length === 0 ? "No payouts tracked" : "No matches"}
              description={
                payouts.length === 0
                  ? "Add a campaign to start tracking influencer payments."
                  : "Try a different search or status."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.campaign}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(item.date)}
                    </TableCell>
                    <TableCell className="min-w-[190px]">
                      <Select
                        aria-label={`Status for ${item.campaign}`}
                        value={item.status}
                        onChange={(event) =>
                          void updateStatus(item, event.target.value)
                        }
                        className="h-9 text-xs"
                      >
                        {PAYOUT_STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        {item.status === "Done" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void remove(item)}
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                            Delete
                          </Button>
                        ) : (
                          <StatusBadge status={item.status} />
                        )}
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
            <DialogTitle>Add campaign</DialogTitle>
            <DialogDescription>
              New payouts begin in “Ongoing Creation”.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payout-name">Influencer</Label>
              <Input
                id="payout-name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Influencer name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-campaign">Campaign</Label>
              <Input
                id="payout-campaign"
                value={form.campaign}
                onChange={(event) =>
                  setForm({ ...form, campaign: event.target.value })
                }
                placeholder="Campaign name"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payout-date">Date</Label>
                <Input
                  id="payout-date"
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payout-link">Reference link</Label>
                <Input
                  id="payout-link"
                  type="url"
                  value={form.link}
                  onChange={(event) =>
                    setForm({ ...form, link: event.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
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
                Add campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
