import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: "border-brand/40 bg-[#1C1C1C] text-foreground shadow-lg shadow-brand/5",
    error: "border-rose-500/40 bg-[#1C1C1C] text-foreground",
    info: "border-blue-500/40 bg-[#1C1C1C] text-foreground",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-lg border shadow-xl backdrop-blur-sm transition-all duration-200 animate-in slide-in-from-bottom-2 text-xs",
        borders[toast.type]
      )}
    >
      <div className="flex items-center gap-2 font-medium">
        {icons[toast.type]}
        <span>{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-muted-foreground hover:text-foreground rounded transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
