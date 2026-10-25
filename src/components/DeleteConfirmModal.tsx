"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemTitle: string;
  itemId: string;
  itemType: "app" | "website";
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmModal({
  isOpen,
  itemTitle,
  itemId,
  itemType,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-[#1C1C1C] border-border p-5 rounded-lg">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-destructive/15 border border-destructive/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-foreground">
                Delete {itemType === "app" ? "Application" : "Website"}?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                This modification will update <code className="text-brand font-mono">app.json</code>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-3 my-2 rounded bg-[#141414] border border-border space-y-1">
          <p className="text-xs text-foreground font-medium">{itemTitle}</p>
          <p className="text-[11px] text-muted-foreground font-mono truncate">{itemId}</p>
        </div>

        <div className="flex items-center gap-2 p-2.5 text-[11px] text-brand bg-brand/5 border border-brand/20 rounded">
          <ShieldAlert className="w-4 h-4 shrink-0 text-brand" />
          <span>An automated timestamped snapshot will be saved in <code>.backups/</code>.</span>
        </div>

        <DialogFooter className="pt-2 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
