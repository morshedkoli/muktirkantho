import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Console surface — a hairline box on the newsprint canvas.
 *
 * No drop shadow by default: the console gets its depth from the dark rail
 * against the light canvas, not from twenty cards all floating a few pixels
 * off the page. Things that genuinely float (menus, dialogs) use `.adm-pop`.
 */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[var(--ad-radius)] border border-[var(--ad-border)] bg-[var(--ad-card)] text-[var(--ad-text-primary)]",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-1 border-b border-[var(--ad-border)] px-5 py-4",
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "adm-display text-[15px] leading-tight text-[var(--ad-text-primary)]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[12.5px] leading-relaxed text-[var(--ad-text-secondary)]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 border-t border-[var(--ad-border)] bg-[var(--ad-card-alt)] px-5 py-3.5",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
