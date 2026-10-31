"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderPlus,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
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
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ContentDialog } from "@/components/marketing/content-dialog";
import { apiRequest, confirmAction } from "@/lib/client";
import { MARKETING_STATUSES, PLATFORMS } from "@/lib/constants";
import {
  cn,
  dateKey,
  formatDate,
  formatPeso,
  monthLabel,
  toDateInput,
} from "@/lib/utils";
import type {
  Campaign,
  MarketingArchiveRecord,
  MarketingContent,
} from "@/lib/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const platformTone: Record<string, string> = {
  Shopee: "bg-orange-50 text-orange-700",
  TikTok: "bg-slate-100 text-slate-700",
  Lazada: "bg-indigo-50 text-indigo-700",
};

export default function MarketingPage() {
  const [tab, setTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [content, setContent] = useState<MarketingContent[]>([]);
  const [archives, setArchives] = useState<MarketingArchiveRecord[]>([]);
  const [activeArchive, setActiveArchive] = useState("");
  const [loading, setLoading] = useState(true);

  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campaignSaving, setCampaignSaving] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    campaign: "",
    date: "",
    budget: "",
    link: "",
    notes: "",
  });

  const [contentOpen, setContentOpen] = useState(false);
  const [editingContent, setEditingContent] =
    useState<MarketingContent | null>(null);

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveName, setArchiveName] = useState("");
  const [archiveSaving, setArchiveSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [viewCursor, setViewCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const loadCampaigns = useCallback(async () => {
    const data = await apiRequest<{ campaigns: Campaign[] }>("/api/campaigns");
    setCampaigns(data.campaigns);
  }, []);

  const loadArchives = useCallback(async () => {
    const data = await apiRequest<{ archives: MarketingArchiveRecord[] }>(
      "/api/marketing/archives",
    );
    setArchives(data.archives);
  }, []);

  const loadContent = useCallback(async (archive: string) => {
    const query = archive ? `?archive=${encodeURIComponent(archive)}` : "";
    const data = await apiRequest<{ content: MarketingContent[] }>(
      `/api/marketing/content${query}`,
    );
    setContent(data.content);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCampaigns(),
        loadArchives(),
        loadContent(activeArchive),
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load marketing data",
      );
    } finally {
      setLoading(false);
    }
  }, [activeArchive, loadArchives, loadCampaigns, loadContent]);

  useEffect(() => {
    void loadAll();
    // Only re-run when the selected archive changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeArchive]);

  const filteredContent = useMemo(() => {
    const term = search.trim().toLowerCase();
    return content.filter((entry) => {
      const matchesStatus =
        statusFilter === "all" || entry.status === statusFilter;
      const matchesSearch =
        !term ||
        (entry.event ?? "").toLowerCase().includes(term) ||
        (entry.campaign ?? "").toLowerCase().includes(term) ||
        (entry.account ?? "").toLowerCase().includes(term) ||
        (entry.caption ?? "").toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [content, search, statusFilter]);

  const stats = useMemo(
    () => ({
      campaigns: campaigns.length,
      content: content.length,
      posted: content.filter((entry) => entry.status === "Posted").length,
      archives: archives.length,
    }),
    [campaigns, content, archives],
  );

  async function addCampaign(event: React.FormEvent) {
    event.preventDefault();
    if (!campaignForm.campaign.trim()) {
      toast.error("Campaign name is required.");
      return;
    }

    setCampaignSaving(true);
    try {
      await apiRequest("/api/campaigns", {
        method: "POST",
        body: JSON.stringify({
          ...campaignForm,
          budget: campaignForm.budget || 0,
        }),
      });
      toast.success("Campaign added");
      setCampaignOpen(false);
      setCampaignForm({
        campaign: "",
        date: "",
        budget: "",
        link: "",
        notes: "",
      });
      await loadCampaigns();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not add campaign",
      );
    } finally {
      setCampaignSaving(false);
    }
  }

  async function removeCampaign(campaign: Campaign) {
    if (!(await confirmAction(`Delete campaign "${campaign.campaign}"?`))) return;
    try {
      await apiRequest(`/api/campaigns/${campaign._id}`, { method: "DELETE" });
      toast.success("Campaign deleted");
      await loadCampaigns();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  async function updateContentStatus(
    entry: MarketingContent,
    status: string,
  ) {
    try {
      await apiRequest(`/api/marketing/content/${entry._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setContent((current) =>
        current.map((row) =>
          row._id === entry._id ? { ...row, status } : row,
        ),
      );
      toast.success("Status updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function removeContent(entry: MarketingContent) {
    if (!(await confirmAction(`Delete "${entry.event || "this entry"}"?`))) {
      return;
    }
    try {
      await apiRequest(`/api/marketing/content/${entry._id}`, {
        method: "DELETE",
      });
      toast.success("Content entry deleted");
      await loadContent(activeArchive);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  async function createArchive(event: React.FormEvent) {
    event.preventDefault();
    if (!archiveName.trim()) {
      toast.error("Archive name is required.");
      return;
    }

    setArchiveSaving(true);
    try {
      await apiRequest("/api/marketing/archives", {
        method: "POST",
        body: JSON.stringify({ name: archiveName }),
      });
      toast.success("Archive created");
      setArchiveOpen(false);
      setArchiveName("");
      await loadArchives();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create archive",
      );
    } finally {
      setArchiveSaving(false);
    }
  }

  async function removeArchive(record: MarketingArchiveRecord) {
    if (
      !(await confirmAction(
        `Delete the archive “${record.name}” and all of its content entries?`,
      ))
    ) {
      return;
    }
    try {
      await apiRequest(`/api/marketing/archives/${record._id}`, {
        method: "DELETE",
      });
      if (activeArchive === record.name) setActiveArchive("");
      toast.success("Archive deleted");
      await loadArchives();
      await loadContent(activeArchive === record.name ? "" : activeArchive);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  function openArchive(name: string) {
    setActiveArchive(name);
    setTab("content");
    setSearch("");
    setStatusFilter("all");
  }

  const viewCells = useMemo(() => {
    const first = new Date(viewCursor.year, viewCursor.month, 1).getDay();
    const total = new Date(
      viewCursor.year,
      viewCursor.month + 1,
      0,
    ).getDate();
    const cells: (number | null)[] = Array.from({ length: first }, () => null);
    for (let day = 1; day <= total; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewCursor]);

  const contentByDay = useMemo(() => {
    const map: Record<string, MarketingContent[]> = {};
    for (const entry of content) {
      if (!entry.schedule) continue;
      const key = toDateInput(entry.schedule) || entry.schedule.slice(0, 10);
      if (!key) continue;
      map[key] = [...(map[key] ?? []), entry];
    }
    return map;
  }, [content]);

  return (
    <div>
      <PageHeader
        title="Digital marketing"
        description="Plan campaigns, run the content calendar and file finished work into archives."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setArchiveOpen(true)}
            >
              <FolderPlus className="h-4 w-4" />
              New archive
            </Button>
            <Button
              onClick={() => {
                setEditingContent(null);
                setContentOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New content entry
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Campaigns" value={stats.campaigns} icon={Megaphone} />
        <StatCard
          label={activeArchive ? "Archived entries" : "Content entries"}
          value={stats.content}
          icon={CalendarDays}
          tone="info"
        />
        <StatCard
          label="Posted"
          value={stats.posted}
          icon={ExternalLink}
          tone="success"
        />
        <StatCard label="Archives" value={stats.archives} icon={Archive} />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="flex-wrap sm:flex-nowrap">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="content">Content calendar</TabsTrigger>
          <TabsTrigger value="view">Calendar view</TabsTrigger>
          <TabsTrigger value="archives">Archives</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">Scheduled marketing campaigns</p>
                  <p className="text-sm text-muted-foreground">
                    Budget and performance notes per campaign.
                  </p>
                </div>
                <Button size="sm" onClick={() => setCampaignOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add campaign
                </Button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((key) => (
                    <div
                      key={key}
                      className="h-12 animate-pulse rounded-lg bg-secondary"
                    />
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="No campaigns yet"
                  description="Add a campaign to track budget, schedule and links."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign._id}>
                        <TableCell className="font-medium">
                          {campaign.campaign}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(campaign.date)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium">
                          {formatPeso(campaign.budget)}
                        </TableCell>
                        <TableCell>
                          {campaign.link ? (
                            <a
                              href={campaign.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[16rem]">
                          <span className="line-clamp-2 text-muted-foreground">
                            {campaign.notes || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void removeCampaign(campaign)}
                              aria-label="Delete campaign"
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
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardContent className="p-4 sm:p-5">
              {activeArchive ? (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-2">
                  <p className="text-sm">
                    Viewing archive{" "}
                    <span className="font-semibold">{activeArchive}</span>
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveArchive("")}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Active board
                  </Button>
                </div>
              ) : null}

              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search event, campaign, account or caption"
                    className="pl-9"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="sm:w-44"
                >
                  <option value="all">All statuses</option>
                  {MARKETING_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
                <Button
                  onClick={() => {
                    setEditingContent(null);
                    setContentOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add entry
                </Button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((key) => (
                    <div
                      key={key}
                      className="h-12 animate-pulse rounded-lg bg-secondary"
                    />
                  ))}
                </div>
              ) : filteredContent.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title={
                    content.length === 0
                      ? "No content entries"
                      : "No matching entries"
                  }
                  description={
                    content.length === 0
                      ? "Plan the first post for this calendar."
                      : "Try a different search or status."
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Account / platform</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Thumbnail</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContent.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(entry.schedule)}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{entry.event || "—"}</p>
                          {entry.header ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {entry.header}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1.5 text-sm">
                            <span>{entry.account || "—"}</span>
                            {entry.platform ? (
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-xs font-medium",
                                  platformTone[entry.platform] ??
                                    "bg-secondary text-muted-foreground",
                                )}
                              >
                                {entry.platform}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {entry.campaign || "—"}
                        </TableCell>
                        <TableCell className="min-w-[130px]">
                          <Select
                            aria-label="Update content status"
                            value={entry.status}
                            onChange={(event) =>
                              void updateContentStatus(entry, event.target.value)
                            }
                            className="h-9 text-xs"
                          >
                            {MARKETING_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          {entry.file ? (
                            <a
                              href={entry.file}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingContent(entry);
                                setContentOpen(true);
                              }}
                              aria-label="Edit entry"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void removeContent(entry)}
                              aria-label="Delete entry"
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
        </TabsContent>

        <TabsContent value="view">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setViewCursor((current) => {
                        const date = new Date(
                          current.year,
                          current.month - 1,
                          1,
                        );
                        return {
                          year: date.getFullYear(),
                          month: date.getMonth(),
                        };
                      })
                    }
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <p className="min-w-[10rem] text-center text-sm font-semibold">
                    {monthLabel(viewCursor.year, viewCursor.month)}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setViewCursor((current) => {
                        const date = new Date(
                          current.year,
                          current.month + 1,
                          1,
                        );
                        return {
                          year: date.getFullYear(),
                          month: date.getMonth(),
                        };
                      })
                    }
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeArchive
                    ? `Archive: ${activeArchive}`
                    : "Active content calendar"}
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-border">
                <div className="grid grid-cols-7 border-b border-border bg-secondary/60">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs"
                    >
                      <span className="sm:hidden">{day[0]}</span>
                      <span className="hidden sm:inline">{day}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {viewCells.map((day, index) => {
                    if (day === null) {
                      return (
                        <div
                          key={`view-empty-${index}`}
                          className="min-h-[80px] border-b border-r border-border/60 bg-secondary/20 sm:min-h-[110px]"
                        />
                      );
                    }
                    const key = dateKey(
                      viewCursor.year,
                      viewCursor.month,
                      day,
                    );
                    const dayEntries = contentByDay[key] ?? [];
                    return (
                      <div
                        key={key}
                        className="min-h-[80px] border-b border-r border-border/60 p-1.5 sm:min-h-[110px] sm:p-2"
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          {day}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayEntries.slice(0, 3).map((entry) => (
                            <div
                              key={entry._id}
                              className={cn(
                                "rounded px-1 py-0.5 text-[10px] font-medium leading-tight sm:text-[11px]",
                                platformTone[entry.platform ?? ""] ??
                                  "bg-secondary text-muted-foreground",
                              )}
                              title={`${entry.event ?? ""} · ${entry.account ?? ""}`}
                            >
                              <span className="line-clamp-2">
                                {entry.event || entry.campaign || "Content"} ·{" "}
                                {entry.account}
                              </span>
                            </div>
                          ))}
                          {dayEntries.length > 3 ? (
                            <p className="text-[10px] text-muted-foreground">
                              +{dayEntries.length - 3} more
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archives">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">Archived entries</p>
                  <p className="text-sm text-muted-foreground">
                    Keep completed campaigns grouped by period.
                  </p>
                </div>
                <Button size="sm" onClick={() => setArchiveOpen(true)}>
                  <FolderPlus className="h-4 w-4" />
                  Create archive
                </Button>
              </div>

              {archives.length === 0 ? (
                <EmptyState
                  icon={Archive}
                  title="No archives yet"
                  description="Create an archive to file completed content entries."
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {archives.map((record) => (
                    <div
                      key={record._id}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{record.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Created {formatDate(record.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void removeArchive(record)}
                          aria-label="Delete archive"
                        >
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </Button>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openArchive(record.name)}
                        >
                          Open archive
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ContentDialog
        open={contentOpen}
        onOpenChange={setContentOpen}
        entry={editingContent}
        archive={activeArchive}
        onSaved={() => loadContent(activeArchive)}
      />

      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add campaign</DialogTitle>
            <DialogDescription>
              Track the budget, schedule and reference link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addCampaign} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mkt-name">Campaign name</Label>
              <Input
                id="mkt-name"
                value={campaignForm.campaign}
                onChange={(event) =>
                  setCampaignForm({
                    ...campaignForm,
                    campaign: event.target.value,
                  })
                }
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mkt-date">Execution date</Label>
                <Input
                  id="mkt-date"
                  type="date"
                  value={campaignForm.date}
                  onChange={(event) =>
                    setCampaignForm({
                      ...campaignForm,
                      date: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mkt-budget">Budget (₱)</Label>
                <Input
                  id="mkt-budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={campaignForm.budget}
                  onChange={(event) =>
                    setCampaignForm({
                      ...campaignForm,
                      budget: event.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mkt-link">Link</Label>
              <Input
                id="mkt-link"
                type="url"
                value={campaignForm.link}
                onChange={(event) =>
                  setCampaignForm({
                    ...campaignForm,
                    link: event.target.value,
                  })
                }
                placeholder="https://…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mkt-notes">Performance notes</Label>
              <Textarea
                id="mkt-notes"
                rows={3}
                value={campaignForm.notes}
                onChange={(event) =>
                  setCampaignForm({
                    ...campaignForm,
                    notes: event.target.value,
                  })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCampaignOpen(false)}
                disabled={campaignSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={campaignSaving}>
                {campaignSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Add campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create archive</DialogTitle>
            <DialogDescription>
              Name the archive after a campaign period or month.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createArchive} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="archive-name">Archive name</Label>
              <Input
                id="archive-name"
                value={archiveName}
                onChange={(event) => setArchiveName(event.target.value)}
                placeholder="e.g. 11.11 Mega Sale 2026"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setArchiveOpen(false)}
                disabled={archiveSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={archiveSaving}>
                {archiveSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Create archive
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
