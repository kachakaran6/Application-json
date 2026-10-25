import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatStatusLabel(status: string): string {
  switch (status) {
    case "production":
      return "Production";
    case "published":
      return "Published";
    case "closed_testing":
      return "Closed Testing";
    case "in_progress":
      return "In Progress";
    case "coming_soon":
      return "Coming Soon";
    case "draft":
      return "Draft";
    default:
      return status
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case "production":
    case "published":
      return {
        badge: "bg-brand/10 text-brand border-brand/30",
        dot: "bg-brand",
      };
    case "closed_testing":
      return {
        badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        dot: "bg-purple-400",
      };
    case "in_progress":
      return {
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        dot: "bg-blue-400",
      };
    case "coming_soon":
      return {
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        dot: "bg-amber-400",
      };
    case "draft":
    default:
      return {
        badge: "bg-studio-panel text-muted-foreground border-border",
        dot: "bg-muted-foreground",
      };
  }
}
