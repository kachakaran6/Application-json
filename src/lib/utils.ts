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
        badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
        dot: "bg-emerald-600 dark:bg-emerald-400",
      };
    case "closed_testing":
      return {
        badge: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25",
        dot: "bg-purple-600 dark:bg-purple-400",
      };
    case "in_progress":
      return {
        badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25",
        dot: "bg-blue-600 dark:bg-blue-400",
      };
    case "coming_soon":
      return {
        badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
        dot: "bg-amber-600 dark:bg-amber-400",
      };
    case "draft":
    default:
      return {
        badge: "bg-muted text-muted-foreground border-border",
        dot: "bg-muted-foreground",
      };
  }
}
