"use client";

import React, { useState, useEffect } from "react";
import { Code, CheckCircle, AlertCircle, Copy, Check, Download } from "lucide-react";
import { RegistryData } from "@/lib/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RawJsonModalProps {
  isOpen: boolean;
  data: RegistryData | null;
  onClose: () => void;
  onSaveRaw: (jsonData: RegistryData) => Promise<void>;
  onError: (msg: string) => void;
}

export function RawJsonModal({
  isOpen,
  data,
  onClose,
  onSaveRaw,
  onError,
}: RawJsonModalProps) {
  const [jsonText, setJsonText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && data) {
      setJsonText(JSON.stringify(data, null, 2));
      setParseError(null);
    }
  }, [isOpen, data]);

  function handleTextChange(val: string) {
    setJsonText(val);
    try {
      JSON.parse(val);
      setParseError(null);
    } catch (e: any) {
      setParseError(e.message || "Invalid JSON syntax");
    }
  }

  async function handleSave() {
    try {
      const parsed = JSON.parse(jsonText);
      setSaving(true);
      await onSaveRaw(parsed);
      onClose();
    } catch (e: any) {
      setParseError(e.message);
      onError("Please resolve JSON syntax errors before saving");
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "app.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-[#1C1C1C] border-border rounded-lg">
        {/* Supabase style Editor Header */}
        <DialogHeader className="p-4 border-b border-border bg-[#171717] shrink-0 text-left">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#141414] border border-border flex items-center justify-center text-brand">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  app.json Studio Editor
                  <Badge variant="secondary" className="font-mono text-[10px] bg-[#141414]">
                    root/app.json
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Direct raw JSON modification with real-time schema validation
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="secondary" size="sm" onClick={handleCopy} className="h-7 text-xs gap-1">
                {copied ? <Check className="w-3 h-3 text-brand" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
              <Button variant="secondary" size="sm" onClick={handleDownload} className="h-7 text-xs gap-1">
                <Download className="w-3 h-3" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {parseError && (
          <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20 flex items-center gap-2 text-xs text-rose-300 shrink-0 font-mono">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 p-3 bg-[#121212] overflow-hidden font-mono text-xs">
          <textarea
            value={jsonText}
            onChange={(e) => handleTextChange(e.target.value)}
            spellCheck={false}
            className="w-full h-full p-2 bg-transparent text-[#3ECF8E] placeholder:text-muted-foreground resize-none focus:outline-none overflow-y-auto leading-relaxed border-0"
          />
        </div>

        {/* Footer */}
        <DialogFooter className="p-3 border-t border-border bg-[#171717] shrink-0 flex items-center justify-between">
          <div>
            {parseError ? (
              <span className="text-rose-400 text-xs font-mono">Invalid JSON</span>
            ) : (
              <span className="text-brand text-xs font-mono flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Valid Schema
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={Boolean(parseError) || saving}
            >
              {saving ? "Saving..." : "Save to app.json"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
