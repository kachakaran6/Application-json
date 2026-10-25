import React from "react";
import { formatStatusLabel, getStatusColor, cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { badge, dot } = getStatusColor(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors",
        badge,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {formatStatusLabel(status)}
    </span>
  );
}
