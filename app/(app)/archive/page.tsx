"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowLeft,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, confirmAction } from "@/lib/client";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { ArchivedTask } from "@/lib/types";

export default function ArchivePage() {
  const [archives, setArchives] = useState<ArchivedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ archives: ArchivedTask[] }>(
        "/api/archive",
      );
      setArchives(data.archives);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load archive",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return archives.filter((item) => {
      const matchesStatus = status === "all" || item.status === status;
      const matchesQuery =
        !term ||
        item.task.toLowerCase().includes(term) ||
        (item.assigned ?? "").toLowerCase().includes(term) ||
        (item.note ?? "").toLowerCase().includes(term);
      return matchesStatus && matchesQuery;
    });
  }, [archives, query, status]);

  async function restore(item: ArchivedTask) {
    if (!(await confirmAction(`Restore "${item.task}" to the task board?`))) {
      return;
    }
    try {
      await apiRequest(`/api/archive/${item._id}/restore`, { method: "POST" });
      toast.success("Task restored");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Restore failed");
    }
  }

  async function remove(item: ArchivedTask) {
    if (
      !(await confirmAction(
        `Permanently delete "${item.task}" from the archive? This cannot be undone.`,
      ))
    ) {
      return;
    }
    try {
      await apiRequest(`/api/archive/${item._id}`, { method: "DELETE" });
      toast.success("Archived task deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Task archive"
        description="Completed and removed tasks are preserved here and can be restored at any time."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to board
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search archived tasks, roles or notes"
                className="pl-9"
              />
            </div>
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="sm:w-48"
            >
              <option value="all">All statuses</option>
              <option value="Done">Done</option>
              <option value="Deleted">Deleted</option>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-3 py-2">
              {[0, 1, 2, 3].map((key) => (
                <div
                  key={key}
                  className="h-12 animate-pulse rounded-lg bg-secondary"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Archive}
              title={archives.length === 0 ? "Archive is empty" : "No matches"}
              description={
                archives.length === 0
                  ? "Tasks you complete or delete will appear here."
                  : "Try a different search term or status."
              }
            />
          ) : (
            <>
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Archived</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <p className="font-medium">{item.task}</p>
                          {item.note ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {item.note}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.assigned || "Unassigned"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDateTime(item.createdAt) !== "—"
                            ? formatDateTime(item.createdAt)
                            : formatDate(item.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void restore(item)}
                            >
                              <RotateCcw className="h-4 w-4" />
                              Restore
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void remove(item)}
                            >
                              <Trash2 className="h-4 w-4 text-rose-600" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <ul className="divide-y divide-border sm:hidden">
                {filtered.map((item) => (
                  <li key={item._id} className="space-y-2 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{item.task}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.assigned || "Unassigned"} ·{" "}
                      {formatDate(item.date ?? item.createdAt)}
                    </p>
                    {item.note ? (
                      <p className="text-sm text-muted-foreground">{item.note}</p>
                    ) : null}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void restore(item)}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void remove(item)}
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
