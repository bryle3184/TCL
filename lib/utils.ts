import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function toDateInput(value?: string | Date | null): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function isOverdue(value?: string | Date | null): boolean {
  if (!value) return false;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

export function formatPeso(value?: number | null): string {
  return `₱${Number(value ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const TONE_MAP: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  "in-design": "bg-violet-50 text-violet-700 ring-violet-200",
  "for-approval": "bg-sky-50 text-sky-700 ring-sky-200",
  done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "in progress": "bg-sky-50 text-sky-700 ring-sky-200",
  open: "bg-amber-50 text-amber-700 ring-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "in review": "bg-violet-50 text-violet-700 ring-violet-200",
  scheduled: "bg-sky-50 text-sky-700 ring-sky-200",
  posted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  deleted: "bg-rose-50 text-rose-700 ring-rose-200",
  "ongoing creation": "bg-amber-50 text-amber-700 ring-amber-200",
  "waiting for finance": "bg-orange-50 text-orange-700 ring-orange-200",
  "so creation": "bg-violet-50 text-violet-700 ring-violet-200",
  "for approval": "bg-sky-50 text-sky-700 ring-sky-200",
  "waiting for si": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "si delivered": "bg-teal-50 text-teal-700 ring-teal-200",
};

export function statusTone(status?: string | null): string {
  if (!status) return "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    TONE_MAP[status.toLowerCase()] ??
    "bg-slate-100 text-slate-600 ring-slate-200"
  );
}

export function dateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${monthIndex + 1}-${day}`;
}

export function monthLabel(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
}
