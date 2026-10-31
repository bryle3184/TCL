"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Headphones,
  Loader2,
  MessageSquarePlus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
import { CSR_CONCERNS, CSR_STATUSES } from "@/lib/constants";
import { formatDate, todayISO } from "@/lib/utils";
import type { CsrTicket } from "@/lib/types";

export default function CsrPage() {
  const [tickets, setTickets] = useState<CsrTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [form, setForm] = useState({
    customer: "",
    concern: "Warranty",
    otherConcern: "",
    chatlink: "",
    date: todayISO(),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ tickets: CsrTicket[] }>("/api/csr");
      setTickets(data.tickets);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load tickets",
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
    return tickets.filter((ticket) => {
      const matchesStatus = status === "all" || ticket.status === status;
      const matchesSearch =
        !term ||
        ticket.customer.toLowerCase().includes(term) ||
        ticket.concern.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [tickets, search, status]);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "Open").length,
      progress: tickets.filter((ticket) => ticket.status === "In Progress").length,
      resolved: tickets.filter((ticket) => ticket.status === "Resolved").length,
    }),
    [tickets],
  );

  async function updateStatus(ticket: CsrTicket, next: string) {
    try {
      await apiRequest(`/api/csr/${ticket._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setTickets((current) =>
        current.map((row) =>
          row._id === ticket._id ? { ...row, status: next } : row,
        ),
      );
      toast.success("Ticket status updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function remove(ticket: CsrTicket) {
    if (
      !(await confirmAction(`Delete the ticket for ${ticket.customer}?`))
    ) {
      return;
    }
    try {
      await apiRequest(`/api/csr/${ticket._id}`, { method: "DELETE" });
      toast.success("Ticket deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const concern =
      form.concern === "Others" ? form.otherConcern.trim() : form.concern;

    if (!form.customer.trim() || !concern) {
      toast.error("Customer and concern are required.");
      return;
    }

    setSaving(true);
    try {
      await apiRequest("/api/csr", {
        method: "POST",
        body: JSON.stringify({
          customer: form.customer,
          concern,
          date: form.date,
          chatlink: form.chatlink,
          status: "Open",
        }),
      });
      toast.success("Customer concern logged");
      setOpen(false);
      setForm({
        customer: "",
        concern: "Warranty",
        otherConcern: "",
        chatlink: "",
        date: todayISO(),
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
        title="Customer service"
        description="Log buyer concerns and keep resolution status visible to the team."
        actions={
          <Button onClick={() => setOpen(true)}>
            <MessageSquarePlus className="h-4 w-4" />
            Add concern
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All tickets" value={stats.total} icon={Headphones} />
        <StatCard
          label="Open"
          value={stats.open}
          icon={Headphones}
          tone={stats.open > 0 ? "danger" : "default"}
        />
        <StatCard
          label="In progress"
          value={stats.progress}
          icon={Headphones}
          tone="info"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          tone="success"
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
                placeholder="Search customer or concern"
                className="pl-9"
              />
            </div>
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="sm:w-48"
            >
              <option value="all">All statuses</option>
              {CSR_STATUSES.map((item) => (
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
              icon={Headphones}
              title={tickets.length === 0 ? "No customer concerns" : "No matches"}
              description={
                tickets.length === 0
                  ? "Log the first concern to start tracking resolutions."
                  : "Try a different search or status."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Concern</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Chat</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell className="font-medium">
                      {ticket.customer}
                    </TableCell>
                    <TableCell className="max-w-[18rem]">
                      <span className="line-clamp-2">{ticket.concern}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(ticket.date)}
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <Select
                        aria-label={`Status for ${ticket.customer}`}
                        value={ticket.status}
                        onChange={(event) =>
                          void updateStatus(ticket, event.target.value)
                        }
                        className="h-9 text-xs"
                      >
                        {CSR_STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      {ticket.chatlink ? (
                        <a
                          href={ticket.chatlink}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void remove(ticket)}
                          aria-label="Delete ticket"
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
            <DialogTitle>Add customer concern</DialogTitle>
            <DialogDescription>
              Capture the buyer, concern type and chat reference.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csr-customer">Customer</Label>
              <Input
                id="csr-customer"
                value={form.customer}
                onChange={(event) =>
                  setForm({ ...form, customer: event.target.value })
                }
                placeholder="Customer name"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="csr-concern">Concern</Label>
                <Select
                  id="csr-concern"
                  value={form.concern}
                  onChange={(event) =>
                    setForm({ ...form, concern: event.target.value })
                  }
                >
                  {CSR_CONCERNS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="csr-date">Date</Label>
                <Input
                  id="csr-date"
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                />
              </div>
            </div>

            {form.concern === "Others" ? (
              <div className="space-y-2">
                <Label htmlFor="csr-other">Describe the concern</Label>
                <Input
                  id="csr-other"
                  value={form.otherConcern}
                  onChange={(event) =>
                    setForm({ ...form, otherConcern: event.target.value })
                  }
                  placeholder="What is the customer asking about?"
                  required
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="csr-chat">Chat link</Label>
              <Input
                id="csr-chat"
                type="url"
                value={form.chatlink}
                onChange={(event) =>
                  setForm({ ...form, chatlink: event.target.value })
                }
                placeholder="https://…"
              />
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
                Add concern
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
