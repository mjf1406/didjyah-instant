"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Import your custom primitives
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";

/**
 * A custom hook to detect mobile viewports.
 * Adjust the media query as appropriate.
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    setIsMobile(media.matches);

    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return isMobile;
}

export interface DialogDrawerProps {
  /**
   * The element that will trigger the dialog.
   */
  trigger: React.ReactNode;
  /**
   * The content to be rendered inside of the dialog.
   */
  children: React.ReactNode;
  /**
   * Additional className to pass to the content component.
   */
  className?: string;
}

/**
 * DialogDrawer acts as a unified component that renders a
 * fullscreen Dialog on mobile and a standard dialog on desktop.
 */
export function DialogDrawer({
  trigger,
  children,
  className,
}: DialogDrawerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  // When mobile display, apply fullscreen styles; otherwise, limit max height.
  const contentClasses = isMobile
    ? cn("h-screen w-screen overflow-y-auto", className)
    : cn("overflow-y-auto max-h-[80vh]", className);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={contentClasses}>{children}</DialogContent>
    </Dialog>
  );
}
