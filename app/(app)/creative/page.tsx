"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  ImageOff,
  Images,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest, confirmAction } from "@/lib/client";
import {
  CREATIVE_STATUSES,
  MAX_UPLOAD_BYTES,
  PLATFORMS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { CreativeAsset } from "@/lib/types";

function isImageLink(link?: string): boolean {
  return !!link && (link.startsWith("data:image") || link.startsWith("http"));
}

export default function CreativePage() {
  const [assets, setAssets] = useState<CreativeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    campaign: "",
    platform: "Shopee",
    status: "Pending",
    link: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ assets: CreativeAsset[] }>(
        "/api/creative",
      );
      setAssets(data.assets);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load assets",
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
    return assets.filter((asset) => {
      const matchesPlatform =
        platform === "all" || asset.platform === platform;
      const matchesStatus = status === "all" || asset.status === status;
      const matchesSearch =
        !term || asset.campaign.toLowerCase().includes(term);
      return matchesPlatform && matchesStatus && matchesSearch;
    });
  }, [assets, platform, status, search]);

  const counts = useMemo(
    () => ({
      total: assets.length,
      pending: assets.filter((asset) => asset.status !== "Done").length,
      done: assets.filter((asset) => asset.status === "Done").length,
    }),
    [assets],
  );

  function resetForm() {
    setForm({ campaign: "", platform: "Shopee", status: "Pending", link: "" });
    setFile(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.campaign.trim()) {
      toast.error("Campaign name is required.");
      return;
    }
    if (file && file.size > MAX_UPLOAD_BYTES) {
      toast.error("Images must be 2 MB or smaller.");
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append("campaign", form.campaign);
      body.append("platform", form.platform);
      body.append("status", form.status);
      body.append("link", form.link);
      if (file) body.append("file", file);

      await apiRequest("/api/creative", { method: "POST", body });
      toast.success("Creative request added");
      setOpen(false);
      resetForm();
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not upload asset",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(asset: CreativeAsset, next: string) {
    try {
      await apiRequest(`/api/creative/${asset._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setAssets((current) =>
        current.map((item) =>
          item._id === asset._id ? { ...item, status: next } : item,
        ),
      );
      toast.success("Status updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function remove(asset: CreativeAsset) {
    if (!(await confirmAction(`Delete "${asset.campaign}"?`))) return;
    try {
      await apiRequest(`/api/creative/${asset._id}`, { method: "DELETE" });
      toast.success("Creative removed");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Creative asset tracker"
        description="Request, review and approve creative work for every marketplace."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            New creative request
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Badge>{counts.total} total</Badge>
        <Badge>{counts.pending} in progress</Badge>
        <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">
          {counts.done} done
        </Badge>
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search campaigns"
            className="pl-9"
          />
        </div>
        <Select
          value={platform}
          onChange={(event) => setPlatform(event.target.value)}
          className="sm:w-44"
        >
          <option value="all">All platforms</option>
          {PLATFORMS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="sm:w-44"
        >
          <option value="all">All statuses</option>
          {CREATIVE_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-56 animate-pulse rounded-xl bg-secondary"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Images}
          title={assets.length === 0 ? "No creative assets yet" : "No matches"}
          description={
            assets.length === 0
              ? "Create your first creative request to start tracking approvals."
              : "Adjust the filters or search term."
          }
          action={
            assets.length === 0 ? (
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> New request
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((asset) => (
            <Card key={asset._id} className="overflow-hidden">
              <div className="flex h-36 items-center justify-center border-b border-border bg-secondary/50">
                {isImageLink(asset.link) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.link}
                    alt={asset.campaign}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageOff className="h-7 w-7 text-muted-foreground/60" />
                )}
              </div>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{asset.campaign}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {asset.platform} · {formatDate(asset.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={asset.status} />
                </div>

                <Select
                  aria-label="Update status"
                  value={asset.status}
                  onChange={(event) =>
                    void updateStatus(asset, event.target.value)
                  }
                  className="h-9 text-xs"
                >
                  {CREATIVE_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    {asset.link ? (
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={asset.link}
                          target="_blank"
                          rel="noreferrer"
                          download={asset.file || undefined}
                        >
                          {asset.link.startsWith("data:") ? (
                            <Download className="h-3.5 w-3.5" />
                          ) : (
                            <ExternalLink className="h-3.5 w-3.5" />
                          )}
                          Open
                        </a>
                      </Button>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void remove(asset)}
                    aria-label={`Delete ${asset.campaign}`}
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New creative request</DialogTitle>
            <DialogDescription>
              Attach the artwork or link the working file for the design team.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="creative-campaign">Campaign name</Label>
              <Input
                id="creative-campaign"
                value={form.campaign}
                onChange={(event) =>
                  setForm({ ...form, campaign: event.target.value })
                }
                placeholder="e.g. 11.11 Shopee banner"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="creative-platform">Platform</Label>
                <Select
                  id="creative-platform"
                  value={form.platform}
                  onChange={(event) =>
                    setForm({ ...form, platform: event.target.value })
                  }
                >
                  {PLATFORMS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="creative-status">Status</Label>
                <Select
                  id="creative-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                >
                  {CREATIVE_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creative-file">Image file</Label>
              <Input
                id="creative-file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP or GIF up to 2 MB. Stored with the record in
                MongoDB.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creative-link">Or external link</Label>
              <Input
                id="creative-link"
                type="url"
                value={form.link}
                onChange={(event) =>
                  setForm({ ...form, link: event.target.value })
                }
                placeholder="https://drive.google.com/…"
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
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
