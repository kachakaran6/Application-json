"use client";

import React, { useState, useEffect } from "react";
import { Search, Upload, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ImageItem {
  filename: string;
  url: string;
  size: number;
}

interface ImagePickerModalProps {
  isOpen: boolean;
  currentValue: string;
  onSelect: (url: string) => void;
  onClose: () => void;
  onError: (msg: string) => void;
}

export function ImagePickerModal({
  isOpen,
  currentValue,
  onSelect,
  onClose,
  onError,
}: ImagePickerModalProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  async function loadImages() {
    setLoading(true);
    try {
      const res = await fetch("/api/images/list");
      const data = await res.json();
      if (res.ok) {
        setImages(data.images || []);
      }
    } catch {
      onError("Failed to load icons");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      await loadImages();
      onSelect(data.url);
      onClose();
    } catch (err: any) {
      onError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  const filtered = images.filter((img) =>
    img.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-[#1C1C1C] border-border rounded-lg">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border bg-[#171717] shrink-0 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#141414] border border-border flex items-center justify-center text-brand">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-foreground">
                Icon Asset Library
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Assets located in <code className="text-brand font-mono">/images/</code>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search & Upload bar */}
        <div className="p-4 pb-2 flex flex-col sm:flex-row gap-2.5 shrink-0 border-b border-border/40">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-brand text-[#042f1a] font-semibold text-xs cursor-pointer hover:bg-brand-hover shadow-sm transition-colors shrink-0">
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{uploading ? "Uploading..." : "Upload New Icon"}</span>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.ico,.webp,.gif"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-brand mb-2" />
              <p className="text-xs">Loading icons...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              No matching images found.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filtered.map((img) => {
                const isSelected = currentValue === img.url;
                return (
                  <button
                    key={img.filename}
                    type="button"
                    onClick={() => {
                      onSelect(img.url);
                      onClose();
                    }}
                    className={`group relative flex flex-col items-center p-3 rounded-md border text-left transition-colors ${
                      isSelected
                        ? "border-brand bg-brand/10 shadow-sm"
                        : "border-border hover:border-[#383838] bg-[#141414] hover:bg-[#191919]"
                    }`}
                  >
                    <div className="w-12 h-12 rounded bg-[#1C1C1C] border border-border flex items-center justify-center p-1.5 mb-2 group-hover:scale-105 transition-transform">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="w-full h-full object-contain rounded"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-foreground truncate w-full text-center">
                      {img.filename}
                    </span>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand text-[#042f1a] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
