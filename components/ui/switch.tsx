"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/cn";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "peer inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-full border border-[var(--ad-border-strong)] p-[2px] transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ad-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ad-background)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:border-[var(--ad-primary)] data-[state=checked]:bg-[var(--ad-primary)] data-[state=unchecked]:bg-[var(--ad-inset)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-[var(--ad-card)] shadow-sm ring-0 transition-transform",
        "data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-[var(--ad-on-primary)] data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;
