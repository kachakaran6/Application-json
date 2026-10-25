"use client";

import React from "react";
import {
  Code,
  History,
  Plus,
  Lock,
  Unlock,
  GitBranch,
  FileJson,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  version: string;
  updatedAt: string;
  isAuthed: boolean;
  onOpenAddModal: () => void;
  onOpenRawModal: () => void;
  onOpenBackupModal: () => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export function Navbar({
  version,
  updatedAt,
  isAuthed,
  onOpenAddModal,
  onOpenRawModal,
  onOpenBackupModal,
  onOpenLoginModal,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-[#171717]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Supabase Studio Project Selector / Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Supabase Green Logo Mark */}
          <div className="w-8 h-8 rounded-md bg-[#1F1F1F] border border-border flex items-center justify-center text-brand shadow-sm">
            <Zap className="w-4 h-4 fill-brand text-brand" />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-foreground tracking-tight sm:text-sm">
              Samyukt
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground font-medium hidden sm:inline">
              Registry Studio
            </span>

            <div className="hidden md:flex items-center gap-1.5 ml-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#1F1F1F] text-muted-foreground border border-border">
                <GitBranch className="w-3 h-3 text-brand" />
                main
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-brand/10 text-brand border border-brand/30">
                <FileJson className="w-3 h-3" />
                app.json
              </span>

              <span className="text-[10px] text-muted-foreground font-mono">
                v{version}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls with Shadcn Buttons */}
        <div className="flex items-center gap-2">
          {/* Backups Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenBackupModal}
            title="View backup history and snapshots"
            className="hidden sm:inline-flex gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <History className="w-3.5 h-3.5 text-brand" />
            <span>Backups</span>
          </Button>

          {/* Raw JSON Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenRawModal}
            title="Inspect or edit raw JSON directly"
            className="hidden sm:inline-flex gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Raw JSON</span>
          </Button>

          {/* Admin Lock / Unlock Status */}
          {isAuthed ? (
            <Button
              variant="brandOutline"
              size="sm"
              onClick={onLogout}
              className="gap-1.5 text-[11px]"
              title="Admin session active (Click to Lock)"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Admin Mode</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenLoginModal}
              className="gap-1.5 text-[11px] border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              title="Authenticate as Admin"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Unlock</span>
            </Button>
          )}

          {/* Primary Add Button (Supabase green) */}
          <Button
            variant="default"
            size="sm"
            onClick={onOpenAddModal}
            className="gap-1 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
