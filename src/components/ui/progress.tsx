"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  value?: number;
  showPercentage?: boolean;
}

function Progress({
  className,
  value = 0,
  showPercentage = false,
  ...props
}: ProgressProps) {
  // Change text color based on percentage value.
  const textColor = value >= 50 ? "text-background" : "text-foreground";

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
      {showPercentage && (
        <span
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-medium",
            textColor,
          )}
        >
          {Math.round(value)}%
        </span>
      )}
    </ProgressPrimitive.Root>
  );
}

export { Progress };

