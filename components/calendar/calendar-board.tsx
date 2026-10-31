"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, confirmAction } from "@/lib/client";
import { PLATFORMS } from "@/lib/constants";
import { cn, dateKey, formatDate, monthLabel } from "@/lib/utils";
import type { CalendarEvent, CalendarMap } from "@/lib/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarType = "live" | "leave";

const emptyForm = {
  host: "",
  topic: "",
  time: "",
  platform: "Shopee",
  employee: "",
  reason: "",
};

export function CalendarBoard({ type }: { type: CalendarType }) {
  const [events, setEvents] = useState<CalendarMap>({});
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ events: CalendarMap }>(
        `/api/calendar?type=${type}`,
      );
      setEvents(data.events ?? {});
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load calendar",
      );
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    void load();
  }, [load]);

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1).getDay();
    const total = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const result: (number | null)[] = Array.from({ length: first }, () => null);
    for (let day = 1; day <= total; day += 1) result.push(day);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [cursor]);

  const today = new Date();
  const todayKey = dateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  function shiftMonth(delta: number) {
    setCursor((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function openDay(key: string) {
    setSelected(key);
    setEditingIndex(null);
    setForm(emptyForm);
  }

  function closeDialog(open: boolean) {
    if (!open) {
      setSelected(null);
      setEditingIndex(null);
      setForm(emptyForm);
    }
  }

  function startEdit(index: number) {
    if (!selected) return;
    const event = (events[selected] ?? [])[index];
    if (!event) return;

    setEditingIndex(index);
    setForm({
      host: event.host ?? "",
      topic: event.topic ?? "",
      time: event.time ?? "",
      platform: event.platform ?? "Shopee",
      employee: event.employee ?? "",
      reason: event.reason ?? "",
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;

    if (type === "live" && (!form.host.trim() || !form.topic.trim())) {
      toast.error("Host and topic are required.");
      return;
    }
    if (type === "leave" && !form.employee.trim()) {
      toast.error("Employee name is required.");
      return;
    }

    const payload =
      type === "live"
        ? {
            host: form.host.trim(),
            topic: form.topic.trim(),
            time: form.time.trim(),
            platform: form.platform,
          }
        : { employee: form.employee.trim(), reason: form.reason.trim() };

    setSaving(true);
    try {
      const data = await apiRequest<{ events: CalendarMap }>(
        `/api/calendar?type=${type}`,
        {
          method: "POST",
          body: JSON.stringify({
            date: selected,
            event: payload,
            ...(editingIndex !== null ? { index: editingIndex } : {}),
          }),
        },
      );
      setEvents(data.events);
      toast.success(editingIndex !== null ? "Event updated" : "Event added");
      setEditingIndex(null);
      setForm(emptyForm);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function removeEvent(index: number) {
    if (!selected) return;
    if (!(await confirmAction("Remove this calendar entry?"))) return;

    try {
      const data = await apiRequest<{ events: CalendarMap }>(
        `/api/calendar?type=${type}`,
        {
          method: "DELETE",
          body: JSON.stringify({ date: selected, index }),
        },
      );
      setEvents(data.events);
      setEditingIndex(null);
      setForm(emptyForm);
      toast.success("Entry removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  const selectedEvents = selected ? (events[selected] ?? []) : [];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="min-w-[10rem] text-center text-sm font-semibold sm:text-base">
            {monthLabel(cursor.year, cursor.month)}
          </p>
          <Button
            variant="outline"
            size="icon"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const now = new Date();
              setCursor({ year: now.getFullYear(), month: now.getMonth() });
            }}
          >
            Today
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {type === "live"
            ? "Click a date to add or edit a livestream."
            : "Click a date to file or review leave."}
        </p>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border bg-secondary/60">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-2 sm:text-xs"
            >
              <span className="sm:hidden">{day[0]}</span>
              <span className="hidden sm:inline">{day}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex h-72 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[72px] border-b border-r border-border/60 bg-secondary/20 sm:min-h-[112px]"
                  />
                );
              }

              const key = dateKey(cursor.year, cursor.month, day);
              const dayEvents = events[key] ?? [];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => openDay(key)}
                  className={cn(
                    "group min-h-[72px] border-b border-r border-border/60 p-1.5 text-left align-top transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-[112px] sm:p-2",
                    key === todayKey && "bg-rose-50/50",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      key === todayKey
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {day}
                  </span>

                  <span className="mt-1 hidden space-y-1 sm:block">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <span
                        key={eventIndex}
                        className={cn(
                          "block truncate rounded px-1.5 py-0.5 text-[11px] font-medium",
                          type === "live"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {type === "live"
                          ? `${event.platform ?? ""}: ${event.topic ?? ""}`
                          : event.employee}
                      </span>
                    ))}
                    {dayEvents.length > 2 ? (
                      <span className="block text-[10px] text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </span>
                    ) : null}
                  </span>

                  {dayEvents.length > 0 ? (
                    <span className="mt-1 flex items-center gap-0.5 sm:hidden">
                      {dayEvents.slice(0, 3).map((_, eventIndex) => (
                        <span
                          key={eventIndex}
                          className="h-1.5 w-1.5 rounded-full bg-primary"
                        />
                      ))}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          Livestream
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Leave
        </span>
      </div>

      <Dialog open={selected !== null} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected ? formatDate(selected) : "Day"}</DialogTitle>
            <DialogDescription>
              {type === "live"
                ? "Livestream schedule for this date."
                : "Leave requests for this date."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {selectedEvents.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
                Nothing scheduled yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedEvents.map((event, index) => (
                  <li
                    key={index}
                    className="flex items-start justify-between gap-2 rounded-lg border border-border bg-secondary/40 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {type === "live"
                          ? `${event.platform ?? "Platform"} · ${event.host ?? "Host"}`
                          : event.employee}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {type === "live" ? event.topic : event.reason}
                      </p>
                      {type === "live" && event.time ? (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(index)}
                        aria-label="Edit entry"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void removeEvent(index)}
                        aria-label="Delete entry"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={submit} className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">
              {editingIndex !== null
                ? "Edit entry"
                : type === "live"
                  ? "Add livestream"
                  : "File leave"}
            </p>

            {type === "live" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="cal-host">Host</Label>
                    <Input
                      id="cal-host"
                      value={form.host}
                      onChange={(event) =>
                        setForm({ ...form, host: event.target.value })
                      }
                      placeholder="Host name"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cal-platform">Platform</Label>
                    <Select
                      id="cal-platform"
                      value={form.platform}
                      onChange={(event) =>
                        setForm({ ...form, platform: event.target.value })
                      }
                    >
                      {PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cal-topic">Topic</Label>
                  <Input
                    id="cal-topic"
                    value={form.topic}
                    onChange={(event) =>
                      setForm({ ...form, topic: event.target.value })
                    }
                    placeholder="e.g. 11.11 flash sale"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cal-time">Time</Label>
                  <Input
                    id="cal-time"
                    value={form.time}
                    onChange={(event) =>
                      setForm({ ...form, time: event.target.value })
                    }
                    placeholder="e.g. 8:00 PM – 10:00 PM"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="cal-employee">Employee</Label>
                  <Input
                    id="cal-employee"
                    value={form.employee}
                    onChange={(event) =>
                      setForm({ ...form, employee: event.target.value })
                    }
                    placeholder="Who is on leave?"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cal-reason">Reason</Label>
                  <Textarea
                    id="cal-reason"
                    rows={2}
                    value={form.reason}
                    onChange={(event) =>
                      setForm({ ...form, reason: event.target.value })
                    }
                    placeholder="Optional context"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {editingIndex !== null ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingIndex(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel edit
                </Button>
              ) : null}
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarPlus className="h-4 w-4" />
                )}
                {editingIndex !== null ? "Save changes" : "Add entry"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
