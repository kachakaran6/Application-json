"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Smartphone,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Info,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AppPlayStatus,
  PlayConsoleResponse,
  TrackReleaseInfo,
} from "@/lib/play-console";

interface PlayConsoleMonitorProps {
  onToast?: (type: "success" | "error" | "info", message: string) => void;
}

export function PlayConsoleMonitor({ onToast }: PlayConsoleMonitorProps) {
  const [data, setData] = useState<PlayConsoleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<
    "all" | "production" | "closed_testing" | "internal_draft"
  >("all");

  // Release notes modal
  const [activeNotesApp, setActiveNotesApp] = useState<AppPlayStatus | null>(null);
  const [selectedNotesTrack, setSelectedNotesTrack] = useState<
    "production" | "alpha" | "internal" | "beta"
  >("production");

  // Copy feedback
  const [copiedPkg, setCopiedPkg] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus(false);
  }, []);

  async function fetchStatus(forceRefresh = false) {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const url = forceRefresh
        ? "/api/play-console/status?force_refresh=true"
        : "/api/play-console/status";
      const res = await fetch(url, { cache: "no-store" });
      const json: PlayConsoleResponse = await res.json();

      if (!res.ok || !json.success) {
        throw new Error((json as any).error || "Failed to fetch Google Play status");
      }

      setData(json);
      if (forceRefresh) {
        onToast?.("success", "Google Play Console telemetry refreshed live!");
      }
    } catch (err: any) {
      const msg = err.message || "Failed to communicate with Google Play API";
      setError(msg);
      onToast?.("error", msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleCopy(pkg: string) {
    navigator.clipboard.writeText(pkg);
    setCopiedPkg(pkg);
    setTimeout(() => {
      setCopiedPkg((prev) => (prev === pkg ? null : prev));
    }, 2000);
    onToast?.("info", `Copied ${pkg} to clipboard`);
  }

  function openReleaseNotes(app: AppPlayStatus) {
    setActiveNotesApp(app);
    // default to available track notes
    if (app.production?.releaseNotes?.length) {
      setSelectedNotesTrack("production");
    } else if (app.alpha?.releaseNotes?.length) {
      setSelectedNotesTrack("alpha");
    } else if (app.internal?.releaseNotes?.length) {
      setSelectedNotesTrack("internal");
    } else {
      setSelectedNotesTrack("production");
    }
  }

  // Filtered list
  const filteredApps = useMemo(() => {
    if (!data?.apps) return [];

    let list = [...data.apps];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.catalogName.toLowerCase().includes(q) ||
          a.packageName.toLowerCase().includes(q) ||
          (a.localizedTitle && a.localizedTitle.toLowerCase().includes(q))
      );
    }

    // Track filter
    if (trackFilter === "production") {
      list = list.filter((a) => a.isLiveProduction);
    } else if (trackFilter === "closed_testing") {
      list = list.filter((a) => a.isClosedTesting);
    } else if (trackFilter === "internal_draft") {
      list = list.filter((a) => a.isInternalDraft);
    }

    return list;
  }, [data, searchQuery, trackFilter]);

  // Relative time helper
  const formattedSyncTime = useMemo(() => {
    if (!data?.timestamp) return "Never";
    const date = new Date(data.timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-lg border border-border bg-card shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              Google Play Apps Console Monitor
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-brand/10 text-brand border border-brand/30">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              API v3 Live
            </span>
            {data?.cached && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-muted-foreground bg-muted border border-border">
                Cached (15m TTL)
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5">
            <span>Authenticated Service Account:</span>
            <code className="text-foreground font-mono bg-muted px-1.5 py-0.5 rounded border border-border text-[11px]">
              {data?.serviceAccount || "karan-dev@flutter-applcations.iam.gserviceaccount.com"}
            </code>
          </p>
        </div>

        {/* Sync Indicator & Refresh Button */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
              Last Synced
            </div>
            <div className="text-xs font-mono font-medium text-foreground">
              {formattedSyncTime}
            </div>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => fetchStatus(true)}
            disabled={refreshing || loading}
            className="gap-2 text-xs bg-brand text-black hover:bg-brand/90 font-medium px-4 h-9 shadow-sm transition-all active:scale-95"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing || loading ? "animate-spin" : ""}`}
            />
            <span>{refreshing ? "Refreshing Live..." : "Refresh Data"}</span>
          </Button>
        </div>
      </div>

      {/* Error Banner if any */}
      {error && (
        <div className="flex items-center gap-3 p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <div className="flex-1">
            <span className="font-semibold">Error syncing Google Play Console:</span>{" "}
            {error}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchStatus(true)}
            className="text-xs text-red-300 hover:text-white hover:bg-red-500/20 h-7"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Notice Banner if fallback */}
      {data?.notice && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <div className="flex-1">
            <span className="font-semibold">Telemetry Mode:</span> {data.notice}
          </div>
        </div>
      )}

      {/* Summary Metric Cards (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Apps */}
        <Card
          onClick={() => setTrackFilter("all")}
          className={`cursor-pointer transition-all bg-card border-border hover:border-brand/40 ${
            trackFilter === "all" ? "ring-1 ring-brand border-brand/50" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Monitored Apps
              </p>
              <p className="text-2xl font-bold font-mono text-foreground">
                {loading ? "--" : data?.metrics.total ?? 18}
              </p>
              <p className="text-[10px] text-muted-foreground">Catalog registry target</p>
            </div>
            <div className="w-9 h-9 rounded-md bg-muted border border-border flex items-center justify-center text-brand">
              <Smartphone className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Live in Production */}
        <Card
          onClick={() => setTrackFilter("production")}
          className={`cursor-pointer transition-all bg-card border-border hover:border-emerald-500/40 ${
            trackFilter === "production" ? "ring-1 ring-emerald-500 border-emerald-500/50" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                Live in Production
              </p>
              <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {loading ? "--" : data?.metrics.liveProduction ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">Production track completed</p>
            </div>
            <div className="w-9 h-9 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Closed Testing (Alpha) */}
        <Card
          onClick={() => setTrackFilter("closed_testing")}
          className={`cursor-pointer transition-all bg-card border-border hover:border-amber-500/40 ${
            trackFilter === "closed_testing" ? "ring-1 ring-amber-500 border-amber-500/50" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                Closed Testing (Alpha)
              </p>
              <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {loading ? "--" : data?.metrics.closedTesting ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">Pre-production verification</p>
            </div>
            <div className="w-9 h-9 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Internal / Draft */}
        <Card
          onClick={() => setTrackFilter("internal_draft")}
          className={`cursor-pointer transition-all bg-card border-border hover:border-slate-500/40 ${
            trackFilter === "internal_draft" ? "ring-1 ring-slate-400 border-slate-500/50" : ""
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Internal / Draft
              </p>
              <p className="text-2xl font-bold font-mono text-foreground">
                {loading ? "--" : data?.metrics.internalDraft ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">Internal or setup pending</p>
            </div>
            <div className="w-9 h-9 rounded-md bg-muted border border-border flex items-center justify-center text-muted-foreground">
              <Archive className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-sync Notification Info Bar */}
      <div className="flex items-start sm:items-center gap-2.5 p-3 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5 sm:mt-0" />
        <span className="leading-relaxed">
          <strong className="text-foreground">Play Console Auto-Discovery:</strong> When you invite or grant permission to{" "}
          <code className="text-brand font-mono text-[11px]">
            karan-dev@flutter-applcations.iam.gserviceaccount.com
          </code>{" "}
          in Google Play Console Users & Permissions, click{" "}
          <strong className="text-foreground">Refresh Data</strong> to immediately populate real-time telemetry.
        </span>
      </div>

      {/* Controls & Filter Bar */}
      <div className="rounded-lg border border-border bg-card p-3 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Track Filter Tabs */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-md border border-border shrink-0 overflow-x-auto">
            <button
              onClick={() => setTrackFilter("all")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                trackFilter === "all"
                  ? "bg-card text-foreground border border-border shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Tracked
              <span className="text-[10px] font-mono px-1 rounded bg-muted text-muted-foreground">
                {data?.metrics.total ?? 18}
              </span>
            </button>

            <button
              onClick={() => setTrackFilter("production")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                trackFilter === "production"
                  ? "bg-card text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              Live Production
              <span className="text-[10px] font-mono px-1 rounded bg-muted text-emerald-600 dark:text-emerald-400">
                {data?.metrics.liveProduction ?? 0}
              </span>
            </button>

            <button
              onClick={() => setTrackFilter("closed_testing")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                trackFilter === "closed_testing"
                  ? "bg-card text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
              Closed Testing
              <span className="text-[10px] font-mono px-1 rounded bg-muted text-amber-600 dark:text-amber-400">
                {data?.metrics.closedTesting ?? 0}
              </span>
            </button>

            <button
              onClick={() => setTrackFilter("internal_draft")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                trackFilter === "internal_draft"
                  ? "bg-card text-foreground border border-border shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Internal / Draft
              <span className="text-[10px] font-mono px-1 rounded bg-muted text-muted-foreground">
                {data?.metrics.internalDraft ?? 0}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by app title, package name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground font-mono"
              >
                ESC
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-8 h-8 border-2 border-border border-t-brand rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium text-foreground">
              Querying Google Play Developer API (v3)...
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Auditing 18 application release tracks
            </p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-14 text-center">
            <Smartphone className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
            <p className="text-sm font-medium text-foreground">No applications match your filter</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or reset the track filter
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setTrackFilter("all");
              }}
              className="mt-3 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[300px]">App Name & Package</TableHead>
                  <TableHead className="w-[200px]">Production Track</TableHead>
                  <TableHead className="w-[240px]">Closed Testing Track (Alpha)</TableHead>
                  <TableHead className="w-[180px]">Internal Track</TableHead>
                  <TableHead className="w-[130px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.map((app) => {
                  const hasProd = Boolean(app.production);
                  const isProdCompleted = app.production?.status === "completed";
                  const hasAlpha = Boolean(app.alpha);
                  const hasInternal = Boolean(app.internal);

                  return (
                    <TableRow
                      key={app.packageName}
                      className="hover:bg-muted/50 transition-colors border-border"
                    >
                      {/* App Name & Package */}
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-md bg-muted/60 border border-border p-1 shrink-0 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={app.iconUrl || "/images/samyukt.png"}
                              alt={app.catalogName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/samyukt.png";
                              }}
                            />
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-xs text-foreground truncate">
                                {app.catalogName}
                              </span>
                              {app.localizedTitle &&
                                app.localizedTitle !== app.catalogName && (
                                  <span className="text-[10px] text-muted-foreground truncate">
                                    ({app.localizedTitle})
                                  </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                              <span className="truncate max-w-[190px]">
                                {app.packageName}
                              </span>
                              <button
                                onClick={() => handleCopy(app.packageName)}
                                title="Copy package ID"
                                className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                              >
                                {copiedPkg === app.packageName ? (
                                  <Check className="w-3 h-3 text-brand" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Production Track */}
                      <TableCell>
                        {app.status === "error" ? (
                          <div className="space-y-1">
                            <span
                              title={app.errorMessage || "Google Play API temporary error"}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 cursor-help"
                            >
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                              Sync Error
                            </span>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[170px]" title={app.errorMessage}>
                              Click Refresh Data
                            </div>
                          </div>
                        ) : isProdCompleted ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Completed
                            </span>
                            <div className="text-[11px] font-mono text-muted-foreground">
                              v{app.production?.name || "1.0.0"}{" "}
                              <span className="text-[10px] text-muted-foreground/70">
                                [{app.production?.versionCodes?.[0] || "?"}]
                              </span>
                            </div>
                          </div>
                        ) : hasProd ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 capitalize">
                              {app.production?.status}
                            </span>
                            <div className="text-[11px] font-mono text-muted-foreground">
                              v{app.production?.name || "1.0.0"}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 font-mono">
                            ⚪ No Releases
                          </span>
                        )}
                      </TableCell>

                      {/* Closed Testing (Alpha) Track */}
                      <TableCell>
                        {app.status === "error" ? (
                          <span className="text-[11px] text-muted-foreground/50 font-mono">--</span>
                        ) : hasAlpha ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isProdCompleted ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                                  Promoted to Prod
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  Closed Testing
                                </span>
                              )}
                              <span className="text-[11px] font-mono text-muted-foreground">
                                v{app.alpha?.name || "1.0.0"}{" "}
                                <span className="text-[10px] text-muted-foreground/70">
                                  [{app.alpha?.versionCodes?.[0] || "?"}]
                                </span>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 font-mono">
                            ⚪ No Releases
                          </span>
                        )}
                      </TableCell>

                      {/* Internal Track */}
                      <TableCell>
                        {app.status === "error" ? (
                          <span className="text-[11px] text-muted-foreground/50 font-mono">--</span>
                        ) : hasInternal ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                              Internal
                            </span>
                            <div className="text-[11px] font-mono text-muted-foreground">
                              v{app.internal?.name || "1.0.0"}{" "}
                              <span className="text-[10px] text-muted-foreground/70">
                                [{app.internal?.versionCodes?.[0] || "?"}]
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 font-mono">
                            ⚪ No Releases
                          </span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Release notes button */}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openReleaseNotes(app)}
                            title="View Release Notes & Changelog"
                            className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <FileText className="w-3.5 h-3.5 text-brand" />
                            <span className="hidden md:inline">Notes</span>
                          </Button>

                          {/* Play Store Link for live apps */}
                          {isProdCompleted && app.playStoreUrl && (
                            <a
                              href={app.playStoreUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Open in Google Play Store"
                              className="p-1.5 rounded text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-muted transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Release Notes Modal */}
      <Dialog
        open={Boolean(activeNotesApp)}
        onOpenChange={(open) => !open && setActiveNotesApp(null)}
      >
        <DialogContent className="max-w-xl">
          {activeNotesApp && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-muted/60 border border-border p-1 shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeNotesApp.iconUrl || "/images/samyukt.png"}
                      alt={activeNotesApp.catalogName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain rounded"
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-semibold">
                      {activeNotesApp.catalogName}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-mono text-muted-foreground">
                      {activeNotesApp.packageName}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Track Selector inside Modal */}
              <div className="flex items-center gap-1.5 border-b border-border pb-2.5">
                {activeNotesApp.production && (
                  <button
                    onClick={() => setSelectedNotesTrack("production")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      selectedNotesTrack === "production"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Production (v{activeNotesApp.production.name})
                  </button>
                )}

                {activeNotesApp.alpha && (
                  <button
                    onClick={() => setSelectedNotesTrack("alpha")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      selectedNotesTrack === "alpha"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Closed Alpha (v{activeNotesApp.alpha.name})
                  </button>
                )}

                {activeNotesApp.internal && (
                  <button
                    onClick={() => setSelectedNotesTrack("internal")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      selectedNotesTrack === "internal"
                        ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Internal (v{activeNotesApp.internal.name})
                  </button>
                )}
              </div>

              {/* Selected Track Details */}
              {(() => {
                const trackRelease =
                  selectedNotesTrack === "production"
                    ? activeNotesApp.production
                    : selectedNotesTrack === "alpha"
                    ? activeNotesApp.alpha
                    : activeNotesApp.internal;

                if (!trackRelease) {
                  return (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      No release notes recorded for this track.
                    </div>
                  );
                }

                const notes = trackRelease.releaseNotes || [];

                return (
                  <div className="space-y-4 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded bg-muted/50 border border-border text-xs">
                      <div>
                        <span className="text-muted-foreground">Version Name: </span>
                        <span className="font-mono font-semibold text-foreground">
                          v{trackRelease.name || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Version Code: </span>
                        <span className="font-mono text-foreground">
                          {trackRelease.versionCodes?.join(", ") || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status: </span>
                        <span className="font-medium text-emerald-500 dark:text-emerald-400 capitalize">
                          {trackRelease.status || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-brand" />
                        Changelog & Release Notes:
                      </h4>

                      {notes.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic p-3 rounded bg-muted/50 border border-border">
                          No release notes entered in Google Play Console for this build.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {notes.map((n, i) => (
                            <div
                              key={i}
                              className="p-3 rounded bg-muted/50 border border-border space-y-1 text-xs"
                            >
                              {n.language && (
                                <Badge variant="outline" className="text-[10px] font-mono">
                                  {n.language}
                                </Badge>
                              )}
                              <p className="whitespace-pre-wrap font-sans text-foreground/90 text-xs leading-relaxed">
                                {n.text || "(Empty)"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                {activeNotesApp.playStoreUrl && activeNotesApp.isLiveProduction ? (
                  <a
                    href={activeNotesApp.playStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline font-medium"
                  >
                    <ExternalLink className="w-3 h-3" /> View on Google Play Store
                  </a>
                ) : (
                  <div />
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveNotesApp(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
