import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-[#042f1a] font-semibold hover:bg-brand-hover shadow-sm active:scale-[0.98]",
        secondary:
          "bg-studio-panel hover:bg-studio-hover text-foreground border border-border shadow-sm",
        outline:
          "border border-border bg-transparent hover:bg-studio-panel text-foreground",
        ghost:
          "hover:bg-studio-panel hover:text-foreground text-muted-foreground",
        destructive:
          "bg-destructive/15 text-rose-400 border border-destructive/30 hover:bg-destructive/25",
        brandOutline:
          "border border-brand/40 bg-brand/10 text-brand hover:bg-brand/20",
        link:
          "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3.5 py-1.5",
        sm: "h-7 rounded px-2.5 text-[11px]",
        lg: "h-9 rounded-md px-4 text-sm",
        icon: "h-8 w-8",
        iconSm: "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
