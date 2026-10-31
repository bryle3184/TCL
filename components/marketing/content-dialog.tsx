"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
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
import {
  MARKETING_ACCOUNTS,
  MARKETING_STATUSES,
  MAX_UPLOAD_BYTES,
  PLATFORMS,
} from "@/lib/constants";
import { toDateInput } from "@/lib/utils";
import type { MarketingContent } from "@/lib/types";

const empty = {
  schedule: "",
  account: "TCL",
  platform: "Shopee",
  event: "",
  visual: "",
  header: "",
  subheader: "",
  caption: "",
  hashtags: "",
  creatives: "",
  campaign: "",
  notes: "",
  status: "Pending",
  file: "",
};

type FormState = typeof empty;

export function ContentDialog({
  open,
  onOpenChange,
  entry,
  archive,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: MarketingContent | null;
  archive: string;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      entry
        ? {
            schedule: toDateInput(entry.schedule),
            account: entry.account || "TCL",
            platform: entry.platform || "Shopee",
            event: entry.event ?? "",
            visual: entry.visual ?? "",
            header: entry.header ?? "",
            subheader: entry.subheader ?? "",
            caption: entry.caption ?? "",
            hashtags: entry.hashtags ?? "",
            creatives: entry.creatives ?? "",
            campaign: entry.campaign ?? "",
            notes: entry.notes ?? "",
            status: entry.status || "Pending",
            file: entry.file ?? "",
          }
        : empty,
    );
  }, [open, entry]);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleImage(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Images must be 2 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => set("file", String(reader.result ?? ""));
    reader.onerror = () => toast.error("Could not read that image.");
    reader.readAsDataURL(file);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.event.trim()) {
      toast.error("Event name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, archive };
      if (entry) {
        await apiRequest(`/api/marketing/content/${entry._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Content entry updated");
      } else {
        await apiRequest("/api/marketing/content", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Content entry created");
      }
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save entry",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Edit content entry" : "New content entry"}
          </DialogTitle>
          <DialogDescription>
            {archive
              ? `Filing into the “${archive}” archive.`
              : "Filing onto the active content calendar."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="content-schedule">Schedule</Label>
              <Input
                id="content-schedule"
                type="date"
                value={form.schedule}
                onChange={(event) => set("schedule", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-account">Account</Label>
              <Select
                id="content-account"
                value={form.account}
                onChange={(event) => set("account", event.target.value)}
              >
                {MARKETING_ACCOUNTS.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-platform">Platform</Label>
              <Select
                id="content-platform"
                value={form.platform}
                onChange={(event) => set("platform", event.target.value)}
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="content-event">Event</Label>
              <Input
                id="content-event"
                value={form.event}
                onChange={(event) => set("event", event.target.value)}
                placeholder="e.g. Payday sale teaser"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-campaign">Campaign period</Label>
              <Input
                id="content-campaign"
                value={form.campaign}
                onChange={(event) => set("campaign", event.target.value)}
                placeholder="e.g. 11.11 – 11.15"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="content-visual">Visual concept</Label>
              <Input
                id="content-visual"
                value={form.visual}
                onChange={(event) => set("visual", event.target.value)}
                placeholder="Hero shot, flat lay…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-creatives">Creatives / video link</Label>
              <Input
                id="content-creatives"
                type="url"
                value={form.creatives}
                onChange={(event) => set("creatives", event.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="content-header">Header</Label>
              <Input
                id="content-header"
                value={form.header}
                onChange={(event) => set("header", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-subheader">Subheader</Label>
              <Input
                id="content-subheader"
                value={form.subheader}
                onChange={(event) => set("subheader", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-caption">Caption</Label>
            <Textarea
              id="content-caption"
              rows={3}
              value={form.caption}
              onChange={(event) => set("caption", event.target.value)}
              placeholder="Post copy"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="content-hashtags">Hashtags</Label>
              <Input
                id="content-hashtags"
                value={form.hashtags}
                onChange={(event) => set("hashtags", event.target.value)}
                placeholder="#TCL #11Sale"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-status">Status</Label>
              <Select
                id="content-status"
                value={form.status}
                onChange={(event) => set("status", event.target.value)}
              >
                {MARKETING_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-3 sm:flex-row sm:items-center">
              {form.file ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.file}
                  alt="Thumbnail preview"
                  className="h-20 w-20 rounded-md border border-border object-cover"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  <ImagePlus className="h-6 w-6" />
                </span>
              )}
              <div className="flex-1 space-y-1">
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(event) =>
                    void handleImage(event.target.files?.[0] ?? null)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Up to 2 MB, stored in MongoDB.
                </p>
                {form.file ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => set("file", "")}
                  >
                    Remove thumbnail
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-notes">Notes</Label>
            <Textarea
              id="content-notes"
              rows={2}
              value={form.notes}
              onChange={(event) => set("notes", event.target.value)}
            />
          </div>

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
              {entry ? "Save changes" : "Create entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
