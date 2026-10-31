"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ListTodo,
  Plus,
  RefreshCw,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskList } from "@/components/tasks/task-list";
import { apiRequest, confirmAction } from "@/lib/client";
import type { Task } from "@/lib/types";

function isWithinNextWeek(value?: string | null): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const week = new Date(now);
  week.setDate(week.getDate() + 7);
  return date >= now && date <= week;
}

function isOverdueTask(task: Task): boolean {
  if (!task.deadline) return false;
  const date = new Date(task.deadline);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [personal, setPersonal] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [all, mine] = await Promise.all([
        apiRequest<{ tasks: Task[] }>("/api/tasks"),
        apiRequest<{ tasks: Task[] }>("/api/tasks?scope=mine"),
      ]);
      setTasks(all.tasks);
      setPersonal(mine.tasks);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load tasks",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      dueSoon: tasks.filter((task) => isWithinNextWeek(task.deadline)).length,
      overdue: tasks.filter(isOverdueTask).length,
      personal: personal.length,
    }),
    [tasks, personal],
  );

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setDialogOpen(true);
  }

  async function archiveTask(task: Task, status: "Done" | "Deleted") {
    const message =
      status === "Done"
        ? `Mark "${task.task}" as done? It will move to the task archive.`
        : `Delete "${task.task}"? It will be kept in the task archive.`;
    if (!(await confirmAction(message))) return;

    try {
      await apiRequest(`/api/tasks/${task._id}/archive`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      toast.success(status === "Done" ? "Task completed" : "Task archived");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not archive task",
      );
    }
  }

  return (
    <div>
      <PageHeader
        title="Task board"
        description="Everything the e-commerce department is working on, in one place."
        actions={
          <>
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refresh
            </Button>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active tasks" value={stats.total} icon={ListTodo} />
        <StatCard
          label="Due this week"
          value={stats.dueSoon}
          icon={CalendarClock}
          tone="info"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={TriangleAlert}
          tone={stats.overdue > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Assigned to your role"
          value={stats.personal}
          icon={UserRound}
          tone="success"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                Upcoming tasks
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Ordered by nearest deadline.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/archive">
                <Archive className="h-4 w-4" />
                Archive
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((key) => (
                  <div
                    key={key}
                    className="h-14 animate-pulse rounded-lg bg-secondary"
                  />
                ))}
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                emptyMessage="No active tasks. Add the first one to get the team moving."
                onEdit={openEdit}
                onComplete={(task) => void archiveTask(task, "Done")}
                onDelete={(task) => void archiveTask(task, "Deleted")}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              My tasks
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Assigned to your role.
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[0, 1].map((key) => (
                  <div
                    key={key}
                    className="h-14 animate-pulse rounded-lg bg-secondary"
                  />
                ))}
              </div>
            ) : (
              <TaskList
                tasks={personal}
                emptyMessage="Nothing assigned to your role right now."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        onSaved={load}
      />
    </div>
  );
}
