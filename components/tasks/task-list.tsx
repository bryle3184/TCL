"use client";

import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
  Pencil,
  Radio,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import type { Task } from "@/lib/types";

export function TaskList({
  tasks,
  onEdit,
  onComplete,
  onDelete,
  emptyMessage,
}: {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  emptyMessage: string;
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border/70">
      {tasks.map((task) => {
        const overdue = isOverdue(task.deadline);
        return (
          <li
            key={task._id}
            className="group flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium leading-snug">{task.task}</p>
                {task.live === "true" ? (
                  <Badge variant="primary">
                    <Radio className="h-3 w-3" /> Live
                  </Badge>
                ) : null}
                {overdue ? (
                  <Badge className="bg-rose-50 text-rose-700 ring-rose-200">
                    Overdue
                  </Badge>
                ) : null}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "inline-flex items-center gap-1",
                    overdue && "font-medium text-rose-600",
                  )}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  {task.deadline ? formatDate(task.deadline) : "No deadline"}
                </span>
                {task.assigned ? (
                  <StatusBadge
                    status={task.assigned}
                    className="bg-secondary text-secondary-foreground ring-border"
                  />
                ) : (
                  <span>Unassigned</span>
                )}
                {task.note ? (
                  <span className="line-clamp-1 max-w-full text-muted-foreground">
                    {task.note}
                  </span>
                ) : null}
              </div>
            </div>

            {onEdit || onComplete || onDelete ? (
              <div className="flex shrink-0 items-center gap-1">
                {onComplete ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onComplete(task)}
                    title="Mark as done"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="sm:sr-only">Done</span>
                  </Button>
                ) : null}
                {onEdit ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(task)}
                    title="Edit task"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sm:sr-only">Edit</span>
                  </Button>
                ) : null}
                {onDelete ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(task)}
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                    <span className="sm:sr-only">Delete</span>
                  </Button>
                ) : null}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <AlarmClock className="h-3.5 w-3.5" />
                Personal
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
