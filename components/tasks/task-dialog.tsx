"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/client";
import { ROLES } from "@/lib/constants";
import { toDateInput } from "@/lib/utils";
import { taskSchema } from "@/lib/validations";
import type { Task } from "@/lib/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSaved: () => void | Promise<void>;
};

const empty = {
  task: "",
  deadline: "",
  live: "",
  note: "",
  assigned: "",
};

export function TaskDialog({ open, onOpenChange, task, onSaved }: Props) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      task
        ? {
            task: task.task,
            deadline: toDateInput(task.deadline),
            live: task.live ?? "",
            note: task.note ?? "",
            assigned: task.assigned ?? "",
          }
        : empty,
    );
  }, [open, task]);

  function set<K extends keyof typeof empty>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = taskSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }

    setSaving(true);
    try {
      if (task) {
        await apiRequest(`/api/tasks/${task._id}`, {
          method: "PATCH",
          body: JSON.stringify(parsed.data),
        });
        toast.success("Task updated");
      } else {
        await apiRequest("/api/tasks", {
          method: "POST",
          body: JSON.stringify(parsed.data),
        });
        toast.success("Task created");
      }
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Add task"}</DialogTitle>
          <DialogDescription>
            Assign work to a team role and set a clear deadline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Task</Label>
            <Input
              id="task-name"
              value={form.task}
              onChange={(event) => set("task", event.target.value)}
              placeholder="e.g. Upload Shopee 11.11 banner"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-deadline">Deadline</Label>
              <Input
                id="task-deadline"
                type="date"
                value={form.deadline}
                onChange={(event) => set("deadline", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assigned">Assign to role</Label>
              <Select
                id="task-assigned"
                value={form.assigned}
                onChange={(event) => set("assigned", event.target.value)}
              >
                <option value="">Unassigned</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-note">Notes</Label>
            <Textarea
              id="task-note"
              value={form.note}
              onChange={(event) => set("note", event.target.value)}
              placeholder="Context, requirements or handoff notes"
              rows={3}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
              checked={form.live === "true"}
              onChange={(event) =>
                set("live", event.target.checked ? "true" : "")
              }
            />
            Livestream-related task
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {task ? "Save changes" : "Add task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
