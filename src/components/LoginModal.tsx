"use client";

import React, { useState } from "react";
import { Lock, KeyRound, ShieldCheck, AlertCircle } from "lucide-react";
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

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-[#1C1C1C] border-border p-5 rounded-lg">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-foreground">
                Studio Authentication
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Unlock edit, create, and delete actions on app.json
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="my-2 flex items-center gap-2 p-2.5 text-xs text-rose-300 bg-destructive/10 border border-destructive/20 rounded">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 my-2">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Admin Master Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="pl-9 font-mono"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Default password: <code className="text-brand font-mono">samyukt@admin2026</code> (configurable via <code className="text-foreground">ADMIN_SECRET</code> in <code className="text-foreground">.env.local</code>)
            </p>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={loading}
              className="gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {loading ? "Verifying..." : "Unlock Access"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
