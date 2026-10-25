import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
  {
    variants: {
      variant: {
        default:
          "border-brand/40 bg-brand/10 text-brand",
        secondary:
          "border-border bg-studio-panel text-muted-foreground",
        destructive:
          "border-rose-500/30 bg-rose-500/10 text-rose-400",
        outline:
          "text-foreground border-border",
        amber:
          "border-amber-500/30 bg-amber-500/10 text-amber-400",
        blue:
          "border-blue-500/30 bg-blue-500/10 text-blue-400",
        purple:
          "border-purple-500/30 bg-purple-500/10 text-purple-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
