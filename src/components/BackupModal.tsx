"use client";

import React, { useState, useEffect } from "react";
import { History, RotateCcw, Plus, Calendar, Loader2 } from "lucide-react";
import { BackupFileItem } from "@/lib/registry";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess: () => void;
  onError: (msg: string) => void;
}

export function BackupModal({
  isOpen,
  onClose,
  onRestoreSuccess,
  onError,
}: BackupModalProps) {
  const [backups, setBackups] = useState<BackupFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBackups();
    }
  }, [isOpen]);

  async function loadBackups() {
    setLoading(true);
    try {
      const res = await fetch("/api/backups");
      const data = await res.json();
      if (res.ok) {
        setBackups(data.backups || []);
      }
    } catch {
      onError("Failed to load backups");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSnapshot() {
    setCreating(true);
    try {
      const res = await fetch("/api/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create snapshot");
      await loadBackups();
    } catch (err: any) {
      onError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleRestore(filename: string) {
    if (!confirm(`Are you sure you want to restore "${filename}"? Current app.json will be replaced.`)) {
      return;
    }

    setRestoring(filename);
    try {
      const res = await fetch("/api/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", filename }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore backup");
      onRestoreSuccess();
      onClose();
    } catch (err: any) {
      onError(err.message);
    } finally {
      setRestoring(null);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden bg-[#1C1C1C] border-border rounded-lg">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border bg-[#171717] shrink-0 text-left">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#141414] border border-border flex items-center justify-center text-brand">
                <History className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold text-foreground">
                  Version History & Backups
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Point-in-time recovery snapshots before every registry update
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={handleCreateSnapshot}
              disabled={creating}
              className="gap-1.5 text-xs h-7"
            >
              {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              <span>{creating ? "Saving..." : "Create Snapshot"}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Backups List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-brand mb-2" />
              <p className="text-xs">Loading snapshots...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No backups created yet.
            </div>
          ) : (
            backups.map((b) => (
              <div
                key={b.filename}
                className="flex items-center justify-between p-2.5 rounded bg-[#141414] border border-border hover:border-[#383838] transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-foreground font-medium">{b.filename}</span>
                    <Badge variant="secondary" className="font-mono text-[9px] bg-[#1C1C1C]">
                      {(b.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(b.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRestore(b.filename)}
                  disabled={restoring === b.filename}
                  className="h-7 text-xs gap-1"
                >
                  {restoring === b.filename ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3 text-brand" />
                  )}
                  <span>Restore</span>
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
