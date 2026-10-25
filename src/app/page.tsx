"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  LayoutGrid,
  List,
  Smartphone,
  Globe,
  Sparkles,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  FolderGit2,
  Database,
  Layers,
  ArrowUpDown,
  Code,
  History,
} from "lucide-react";
import { RegistryData, AppItem, WebsiteItem } from "@/lib/schemas";
import { Navbar } from "@/components/Navbar";
import { StatCards } from "@/components/StatCards";
import { ItemCard } from "@/components/ItemCard";
import { TableView } from "@/components/TableView";
import { ItemModal } from "@/components/ItemModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { RawJsonModal } from "@/components/RawJsonModal";
import { BackupModal } from "@/components/BackupModal";
import { LoginModal } from "@/components/LoginModal";
import { ToastContainer, ToastMessage } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function RegistryStudioPage() {
  const [registry, setRegistry] = useState<RegistryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  // Filters & Views
  const [activeTab, setActiveTab] = useState<"all" | "apps" | "websites" | "featured">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "name" | "year">("default");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<"create" | "edit">("create");
  const [itemModalType, setItemModalType] = useState<"app" | "website">("app");
  const [selectedItem, setSelectedItem] = useState<AppItem | WebsiteItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    item: AppItem | WebsiteItem;
    type: "app" | "website";
  } | null>(null);

  const [rawJsonModalOpen, setRawJsonModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function addToast(type: "success" | "error" | "info", message: string) {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // Load initial registry and check auth
  useEffect(() => {
    fetchRegistry();
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setIsAuthed(Boolean(data.authenticated));
    } catch {
      setIsAuthed(false);
    }
  }

  async function fetchRegistry(isManual = false) {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/registry", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load registry");
      setRegistry(data);
      if (isManual) addToast("info", "Registry synchronized with app.json");
    } catch (err: any) {
      addToast("error", err.message || "Failed to load app.json");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthed(false);
      addToast("info", "Admin mode locked");
    } catch (err: any) {
      addToast("error", err.message);
    }
  }

  function requireAuth(): boolean {
    if (!isAuthed) {
      setLoginModalOpen(true);
      addToast("info", "Enter master admin password to unlock mutations");
      return false;
    }
    return true;
  }

  // CRUD Operations
  async function handleSaveItem(
    type: "app" | "website",
    data: any,
    originalId?: string
  ) {
    if (!requireAuth()) return;

    const isEdit = Boolean(originalId);
    const endpoint = type === "app" ? "/api/registry/app" : "/api/registry/website";
    const method = isEdit ? "PUT" : "POST";
    const payload = isEdit ? { originalId, ...data } : data;

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        setIsAuthed(false);
        setLoginModalOpen(true);
      }
      throw new Error(result.error || "Failed to save item");
    }

    setRegistry(result.registry);
    addToast(
      "success",
      `${type === "app" ? "Application" : "Website"} ${isEdit ? "updated" : "created"} in app.json`
    );
  }

  async function handleDeleteConfirm() {
    if (!itemToDelete || !requireAuth()) return;

    const { item, type } = itemToDelete;
    const endpoint =
      type === "app"
        ? `/api/registry/app?id=${encodeURIComponent(item.id)}`
        : `/api/registry/website?id=${encodeURIComponent(item.id)}`;

    const res = await fetch(endpoint, { method: "DELETE" });
    const result = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        setIsAuthed(false);
        setLoginModalOpen(true);
      }
      throw new Error(result.error || "Failed to delete item");
    }

    setRegistry(result.registry);
    addToast("success", `Deleted from app.json. Snapshot saved in .backups/`);
  }

  function handleDuplicate(item: AppItem | WebsiteItem, type: "app" | "website") {
    if (!requireAuth()) return;
    const clone = JSON.parse(JSON.stringify(item));
    const randomSuffix = Math.floor(100 + Math.random() * 900);

    if (type === "app") {
      const app = clone as AppItem;
      app.appName = `${app.appName} (Copy)`;
      app.packageName = `${app.packageName}.copy${randomSuffix}`;
      app.id = app.packageName;
    } else {
      const web = clone as WebsiteItem;
      web.name = `${web.name} (Copy)`;
      web.slug = `${web.slug}-copy-${randomSuffix}`;
      web.id = web.slug;
    }

    setItemModalMode("create");
    setItemModalType(type);
    setSelectedItem(clone);
    setItemModalOpen(true);
  }

  async function handleMove(index: number, direction: "up" | "down", type: "app" | "website") {
    if (!requireAuth() || !registry) return;

    const list = type === "app" ? [...registry.apps] : [...registry.websites];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    try {
      const res = await fetch("/api/registry/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: type === "app" ? "apps" : "websites",
          items: list,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reorder");
      setRegistry(data.registry);
      addToast("success", `Updated ${type} order in app.json`);
    } catch (err: any) {
      addToast("error", err.message);
    }
  }

  async function handleSaveRawJson(newRegistry: RegistryData) {
    if (!requireAuth()) return;

    const res = await fetch("/api/registry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRegistry),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to save raw JSON");

    setRegistry(result.data);
    addToast("success", "Saved raw JSON modifications to app.json");
  }

  const existingCategories = useMemo(() => {
    if (!registry) return [];
    const set = new Set<string>();
    registry.apps.forEach((a) => a.category && set.add(a.category));
    registry.websites.forEach((w) => w.category && set.add(w.category));
    return Array.from(set).sort();
  }, [registry]);

  const combinedItems = useMemo(() => {
    if (!registry) return [];

    let list: Array<{ item: AppItem | WebsiteItem; type: "app" | "website" }> = [];

    if (activeTab === "all" || activeTab === "apps") {
      list.push(...registry.apps.map((a) => ({ item: a, type: "app" as const })));
    }
    if (activeTab === "all" || activeTab === "websites") {
      list.push(...registry.websites.map((w) => ({ item: w, type: "website" as const })));
    }
    if (activeTab === "featured") {
      list = [
        ...registry.apps.filter((a) => a.featured).map((a) => ({ item: a, type: "app" as const })),
        ...registry.websites.filter((w) => w.featured).map((w) => ({ item: w, type: "website" as const })),
      ];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(({ item, type }) => {
        const title = type === "app" ? (item as AppItem).appName : (item as WebsiteItem).name;
        const sub = type === "app" ? (item as AppItem).packageName : (item as WebsiteItem).slug;
        const inTitle = title.toLowerCase().includes(q);
        const inSub = sub.toLowerCase().includes(q);
        const inCat = item.category?.toLowerCase().includes(q);
        const inTagline = item.tagline?.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q);
        const inStack = item.stack?.some((s) => s.toLowerCase().includes(q));
        const inHighlights = item.highlights?.some((h) => h.toLowerCase().includes(q));
        return inTitle || inSub || inCat || inTagline || inDesc || inStack || inHighlights;
      });
    }

    if (selectedStatus !== "all") {
      list = list.filter(({ item }) => item.status === selectedStatus);
    }

    if (selectedCategory !== "all") {
      list = list.filter(({ item }) => item.category === selectedCategory);
    }

    if (sortBy === "name") {
      list.sort((a, b) => {
        const nameA = a.type === "app" ? (a.item as AppItem).appName : (a.item as WebsiteItem).name;
        const nameB = b.type === "app" ? (b.item as AppItem).appName : (b.item as WebsiteItem).name;
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === "year") {
      list.sort((a, b) => (b.item.year || "").localeCompare(a.item.year || ""));
    }

    return list;
  }, [registry, activeTab, searchQuery, selectedStatus, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-foreground">
        <div className="w-8 h-8 border-2 border-border border-t-brand rounded-full animate-spin mb-3" />
        <h2 className="text-sm font-medium text-foreground">Connecting to Registry...</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Reading app.json schema</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-foreground">
      {/* Supabase Top Navigation */}
      <Navbar
        version={registry?.version || "2.0.0"}
        updatedAt={registry?.updatedAt || ""}
        isAuthed={isAuthed}
        onOpenAddModal={() => {
          if (!requireAuth()) return;
          setItemModalMode("create");
          setItemModalType(activeTab === "websites" ? "website" : "app");
          setSelectedItem(null);
          setItemModalOpen(true);
        }}
        onOpenRawModal={() => setRawJsonModalOpen(true)}
        onOpenBackupModal={() => setBackupModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Supabase Studio Project Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Ecosystem Application Catalog
              </h2>
              <Badge variant="default" className="text-[10px] font-mono">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Centralized catalog and configuration registry powering Samyukt live discovery hubs.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRegistry(true)}
              disabled={refreshing}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-brand ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (!requireAuth()) return;
                setItemModalMode("create");
                setItemModalType(activeTab === "websites" ? "website" : "app");
                setSelectedItem(null);
                setItemModalOpen(true);
              }}
              className="gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Entry</span>
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <StatCards
          registry={registry}
          onRefresh={() => fetchRegistry(true)}
          refreshing={refreshing}
        />

        {/* Supabase-style Table / Controls Toolbar */}
        <div className="rounded-lg border border-border bg-[#1C1C1C] p-3 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Supabase Pill Tabs */}
            <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-md border border-border shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-[#1C1C1C] text-foreground border border-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Items
                <span className="text-[10px] font-mono px-1 rounded bg-[#171717] text-muted-foreground">
                  {(registry?.apps.length || 0) + (registry?.websites.length || 0)}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("apps")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === "apps"
                    ? "bg-[#1C1C1C] text-foreground border border-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-brand" />
                Mobile Apps
                <span className="text-[10px] font-mono px-1 rounded bg-[#171717] text-muted-foreground">
                  {registry?.apps.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("websites")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === "websites"
                    ? "bg-[#1C1C1C] text-foreground border border-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Web Platforms
                <span className="text-[10px] font-mono px-1 rounded bg-[#171717] text-muted-foreground">
                  {registry?.websites.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("featured")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === "featured"
                    ? "bg-[#1C1C1C] text-foreground border border-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Featured
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter by name, package, category, tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-[#141414]"
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

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#141414] p-0.5 rounded border border-border shrink-0 self-end lg:self-auto">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="iconSm"
                onClick={() => setViewMode("grid")}
                title="Grid Cards View"
                className="h-7 w-7"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="iconSm"
                onClick={() => setViewMode("table")}
                title="Dense Table View"
                className="h-7 w-7"
              >
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Sub-toolbar Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-border/60 text-xs">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <SlidersHorizontal className="w-3 h-3" /> Filter:
            </span>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-7 px-2 bg-[#141414] border border-border rounded text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand text-[11px] capitalize"
            >
              <option value="all">All Statuses</option>
              {registry?.statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st.replace("_", " ")}
                </option>
              ))}
            </select>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-7 px-2 bg-[#141414] border border-border rounded text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand text-[11px] max-w-[200px] truncate"
            >
              <option value="all">All Categories</option>
              {existingCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-7 px-2 bg-[#141414] border border-border rounded text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand text-[11px]"
            >
              <option value="default">Default Registry Order</option>
              <option value="name">Name (A-Z)</option>
              <option value="year">Launch Year (Newest)</option>
            </select>

            {(selectedStatus !== "all" || selectedCategory !== "all" || sortBy !== "default") && (
              <button
                onClick={() => {
                  setSelectedStatus("all");
                  setSelectedCategory("all");
                  setSortBy("default");
                }}
                className="text-[11px] text-brand hover:underline ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Catalog Body */}
        {combinedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-14 rounded-lg bg-[#1C1C1C] border border-border text-center">
            <div className="w-10 h-10 rounded-md bg-[#141414] border border-border flex items-center justify-center text-brand mb-3">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No matching entries found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Adjust your search keywords or status filters to locate catalog items.
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (!requireAuth()) return;
                setItemModalMode("create");
                setItemModalType(activeTab === "websites" ? "website" : "app");
                setSelectedItem(null);
                setItemModalOpen(true);
              }}
              className="mt-4 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Entry
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combinedItems.map(({ item, type }, idx) => (
              <ItemCard
                key={item.id}
                item={item}
                type={type}
                index={idx}
                total={combinedItems.length}
                isAuthed={isAuthed}
                onEdit={(it, tp) => {
                  if (!requireAuth()) return;
                  setItemModalMode("edit");
                  setItemModalType(tp);
                  setSelectedItem(it);
                  setItemModalOpen(true);
                }}
                onDuplicate={handleDuplicate}
                onDelete={(it, tp) => {
                  if (!requireAuth()) return;
                  setItemToDelete({ item: it, type: tp });
                  setDeleteModalOpen(true);
                }}
                onMoveUp={(index, tp) => handleMove(index, "up", tp)}
                onMoveDown={(index, tp) => handleMove(index, "down", tp)}
              />
            ))}
          </div>
        ) : (
          <TableView
            items={combinedItems}
            onEdit={(it, tp) => {
              if (!requireAuth()) return;
              setItemModalMode("edit");
              setItemModalType(tp);
              setSelectedItem(it);
              setItemModalOpen(true);
            }}
            onDuplicate={handleDuplicate}
            onDelete={(it, tp) => {
              if (!requireAuth()) return;
              setItemToDelete({ item: it, type: tp });
              setDeleteModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Supabase-style Footer */}
      <footer className="border-t border-border bg-[#141414] py-4 text-center text-[11px] text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Samyukt Unified Ecosystem Registry</span>
          <span className="font-mono text-[10px]">
            Target: <code className="text-foreground">./app.json</code> • Backups in <code className="text-foreground">./.backups/</code>
          </span>
        </div>
      </footer>

      {/* Modals */}
      <ItemModal
        isOpen={itemModalOpen}
        mode={itemModalMode}
        initialType={itemModalType}
        initialData={selectedItem}
        statusOptions={registry?.statusOptions || []}
        existingCategories={existingCategories}
        onClose={() => setItemModalOpen(false)}
        onSave={handleSaveItem}
        onError={(msg) => addToast("error", msg)}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        itemTitle={
          itemToDelete?.type === "app"
            ? (itemToDelete?.item as AppItem)?.appName || ""
            : (itemToDelete?.item as WebsiteItem)?.name || ""
        }
        itemId={itemToDelete?.item?.id || ""}
        itemType={itemToDelete?.type || "app"}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <RawJsonModal
        isOpen={rawJsonModalOpen}
        data={registry}
        onClose={() => setRawJsonModalOpen(false)}
        onSaveRaw={handleSaveRawJson}
        onError={(msg) => addToast("error", msg)}
      />

      <BackupModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        onRestoreSuccess={() => {
          fetchRegistry();
          addToast("success", "Restored app.json from backup snapshot");
        }}
        onError={(msg) => addToast("error", msg)}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAuthed(true);
          addToast("success", "Admin authentication unlocked");
        }}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
