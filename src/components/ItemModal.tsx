"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Smartphone,
  Globe,
  CheckCircle,
  X,
} from "lucide-react";
import { AppItem, WebsiteItem } from "@/lib/schemas";
import { ImagePickerModal } from "./ImagePickerModal";
import { StatusBadge } from "./StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface ItemModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialType: "app" | "website";
  initialData?: AppItem | WebsiteItem | null;
  statusOptions: string[];
  existingCategories: string[];
  onClose: () => void;
  onSave: (type: "app" | "website", data: any, originalId?: string) => Promise<void>;
  onError: (msg: string) => void;
}

export function ItemModal({
  isOpen,
  mode,
  initialType,
  initialData,
  statusOptions,
  existingCategories,
  onClose,
  onSave,
  onError,
}: ItemModalProps) {
  const [itemType, setItemType] = useState<"app" | "website">(initialType);
  const [submitting, setSubmitting] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Form State
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [packageName, setPackageName] = useState("");
  const [slug, setSlug] = useState("");
  const [url, setUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("/images/samyukt.png");
  const [status, setStatus] = useState("production");
  const [category, setCategory] = useState("Android utility & Productivity");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [client, setClient] = useState("Samyukt Proprietary");

  // Arrays
  const [stack, setStack] = useState<string[]>([]);
  const [newStackTag, setNewStackTag] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [newServiceTag, setNewServiceTag] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setItemType(initialType);
        setId(initialData.id || "");
        if ("appName" in initialData) {
          setName(initialData.appName || "");
          setPackageName(initialData.packageName || "");
          setUrl(initialData.playStoreUrl || "");
        } else {
          setName(initialData.name || "");
          setSlug(initialData.slug || "");
          setUrl(initialData.url || "");
        }
        setIconUrl(initialData.iconUrl || "/images/samyukt.png");
        setStatus(initialData.status || "production");
        setCategory(initialData.category || "");
        setTagline(initialData.tagline || "");
        setDescription(initialData.description || "");
        setFeatured(Boolean(initialData.featured));
        setYear(initialData.year || new Date().getFullYear().toString());
        setClient(initialData.client || "Samyukt Proprietary");
        setStack(Array.isArray(initialData.stack) ? initialData.stack : []);
        setServices(Array.isArray(initialData.services) ? initialData.services : []);
        setHighlights(Array.isArray(initialData.highlights) ? initialData.highlights : []);
      } else {
        setItemType(initialType);
        setId("");
        setName("");
        setPackageName("");
        setSlug("");
        setUrl("");
        setIconUrl("/images/samyukt.png");
        setStatus("production");
        setCategory(initialType === "app" ? "Android utility & Tools" : "Web platform & Tools");
        setTagline("");
        setDescription("");
        setFeatured(false);
        setYear(new Date().getFullYear().toString());
        setClient("Samyukt Proprietary");
        setStack(initialType === "app" ? ["Flutter", "Dart"] : ["Next.js", "TypeScript", "Tailwind CSS"]);
        setServices(initialType === "app" ? ["Mobile app"] : ["Web development"]);
        setHighlights(["Fully offline, private, and secure architecture"]);
      }
    }
  }, [isOpen, initialData, initialType]);

  function handleNameChange(val: string) {
    setName(val);
    if (mode === "create") {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      if (itemType === "app") {
        const pkg = `com.${generatedSlug.replace(/-/g, "")}.app`;
        setPackageName(pkg);
        setId(pkg);
      } else {
        setSlug(generatedSlug);
        setId(generatedSlug);
      }
    }
  }

  function addStackTag() {
    const trimmed = newStackTag.trim();
    if (trimmed && !stack.includes(trimmed)) {
      setStack([...stack, trimmed]);
      setNewStackTag("");
    }
  }

  function removeStackTag(tagToRemove: string) {
    setStack(stack.filter((t) => t !== tagToRemove));
  }

  function addHighlightItem() {
    const trimmed = newHighlight.trim();
    if (trimmed) {
      setHighlights([...highlights, trimmed]);
      setNewHighlight("");
    }
  }

  function removeHighlightItem(index: number) {
    setHighlights(highlights.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!id.trim()) throw new Error("Item ID is required");
      if (!name.trim()) throw new Error("Name is required");

      let payload: any;
      if (itemType === "app") {
        payload = {
          id: id.trim(),
          appName: name.trim(),
          packageName: packageName.trim() || id.trim(),
          playStoreUrl: url.trim(),
          iconUrl: iconUrl.trim(),
          status,
          category: category.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          featured,
          year: year.trim(),
          client: client.trim(),
          stack,
          services,
          highlights,
        };
      } else {
        payload = {
          id: id.trim(),
          name: name.trim(),
          slug: slug.trim() || id.trim(),
          url: url.trim(),
          iconUrl: iconUrl.trim(),
          status,
          category: category.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          featured,
          year: year.trim(),
          client: client.trim(),
          stack,
          services,
          highlights,
        };
      }

      await onSave(itemType, payload, initialData?.id);
      onClose();
    } catch (err: any) {
      onError(err.message || "Failed to save item");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-[#1C1C1C] border-border rounded-lg">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-border bg-[#171717] shrink-0 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#141414] border border-border flex items-center justify-center text-brand">
                {itemType === "app" ? (
                  <Smartphone className="w-4 h-4" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold text-foreground">
                  {mode === "create" ? "Add New" : "Edit"}{" "}
                  {itemType === "app" ? "Mobile Application" : "Website Platform"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Saves directly to <code className="text-brand font-mono">app.json</code> with automated snapshot
                </DialogDescription>
              </div>
            </div>

            {mode === "create" && (
              <div className="flex items-center bg-[#141414] p-0.5 rounded border border-border mr-6">
                <Button
                  type="button"
                  variant={itemType === "app" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setItemType("app")}
                  className="h-6 px-2 text-[11px] gap-1"
                >
                  <Smartphone className="w-3 h-3" />
                  App
                </Button>
                <Button
                  type="button"
                  variant={itemType === "website" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setItemType("website")}
                  className="h-6 px-2 text-[11px] gap-1"
                >
                  <Globe className="w-3 h-3" />
                  Website
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Row 1: Name & ID/Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                {itemType === "app" ? "Application Name *" : "Website Name *"}
              </label>
              <Input
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={itemType === "app" ? "e.g. Vault X" : "e.g. Samast"}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                {itemType === "app" ? "Package Name / Unique ID *" : "Slug / Unique ID *"}
              </label>
              <Input
                required
                value={itemType === "app" ? packageName : slug}
                onChange={(e) => {
                  if (itemType === "app") {
                    setPackageName(e.target.value);
                    setId(e.target.value);
                  } else {
                    setSlug(e.target.value);
                    setId(e.target.value);
                  }
                }}
                className="font-mono text-xs"
                placeholder={itemType === "app" ? "e.g. com.vaultx.vault_x" : "e.g. samast"}
              />
            </div>
          </div>

          {/* Row 2: URL, Status, Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                {itemType === "app" ? "Google Play Store URL" : "Live Website URL"}
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={itemType === "app" ? "https://play.google.com/..." : "https://..."}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Lifecycle Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-8 w-full rounded-md border border-border bg-[#141414] px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand capitalize"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Category *
              </label>
              <Input
                list="category-suggestions"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Android utility & Privacy"
              />
              <datalist id="category-suggestions">
                {existingCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Icon Selector Row */}
          <div className="p-3.5 rounded-md bg-[#141414] border border-border flex items-center gap-3.5">
            <div className="w-12 h-12 rounded bg-[#1C1C1C] border border-border flex items-center justify-center p-1.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={iconUrl}
                alt="App Icon"
                className="w-full h-full object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/samyukt.png";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Icon Asset URL
              </label>
              <div className="flex gap-2">
                <Input
                  required
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowImagePicker(true)}
                  className="shrink-0 gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-brand" />
                  Browse / Upload
                </Button>
              </div>
            </div>
          </div>

          {/* Tagline & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Tagline / Pitch
              </label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Short one-line summary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Full Description
              </label>
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full description of features, privacy architecture, etc."
              />
            </div>
          </div>

          {/* Meta: Year, Client, Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-center">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Launch Year
              </label>
              <Input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025"
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Client / Ownership
              </label>
              <Input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Samyukt Proprietary"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 sm:pt-3">
              <Switch
                checked={featured}
                onCheckedChange={setFeatured}
                id="featured-switch"
              />
              <label htmlFor="featured-switch" className="text-xs text-foreground font-medium flex items-center gap-1 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Featured Spotlight
              </label>
            </div>
          </div>

          {/* Tech Stack Input */}
          <div className="p-3 rounded-md bg-[#141414] border border-border space-y-2">
            <label className="block text-[11px] font-medium text-foreground">
              Technology Stack
            </label>
            <div className="flex flex-wrap gap-1">
              {stack.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="gap-1 font-mono text-[10px] bg-[#1C1C1C] border-border"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeStackTag(item)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Input
                value={newStackTag}
                onChange={(e) => setNewStackTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addStackTag();
                  }
                }}
                placeholder="Add tech (Flutter, Kotlin, SQLite)..."
              />
              <Button type="button" variant="secondary" size="sm" onClick={addStackTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Highlights List */}
          <div className="p-3 rounded-md bg-[#141414] border border-border space-y-2">
            <label className="block text-[11px] font-medium text-foreground">
              Architecture & Feature Highlights
            </label>
            <div className="space-y-1.5">
              {highlights.map((hl, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1.5 rounded bg-[#1C1C1C] border border-border text-[11px] text-muted-foreground">
                  <CheckCircle className="w-3 h-3 text-brand shrink-0" />
                  <span className="flex-1">{hl}</span>
                  <button
                    type="button"
                    onClick={() => removeHighlightItem(idx)}
                    className="text-muted-foreground hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Input
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHighlightItem();
                  }
                }}
                placeholder="Add key highlight bullet..."
              />
              <Button type="button" variant="brandOutline" size="sm" onClick={addHighlightItem}>
                Add
              </Button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border bg-[#171717] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Saving..." : mode === "create" ? "Add to app.json" : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <ImagePickerModal
        isOpen={showImagePicker}
        currentValue={iconUrl}
        onSelect={(newUrl) => setIconUrl(newUrl)}
        onClose={() => setShowImagePicker(false)}
        onError={onError}
      />
    </Dialog>
  );
}
