import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "tinted" | "vibrant";
  hover?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hover = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-[32px] border border-border/40 bg-card/40 shadow-premium backdrop-blur-xl transition-all duration-300",
          variant === "tinted" && "bg-primary/[0.03] border-primary/20",
          variant === "vibrant" && "bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent",
          hover && "hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
