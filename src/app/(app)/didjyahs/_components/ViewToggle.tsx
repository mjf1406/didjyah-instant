"use client";

import React from "react";
import { List, LayoutGrid } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ViewMode = "list" | "grid";

const STORAGE_KEY = "didjyah-view-mode";

interface ViewToggleProps {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
}

export function ViewToggle({ value, onValueChange }: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(newValue) => {
        if (newValue) {
          onValueChange(newValue as ViewMode);
        }
      }}
    >
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export function useViewMode(): [ViewMode, (value: ViewMode) => void] {
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [isMounted, setIsMounted] = React.useState(false);

  // Sync with localStorage after hydration
  React.useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "list" || stored === "grid") {
      setViewMode(stored as ViewMode);
    }
  }, []);

  const setViewModeWithStorage = React.useCallback((value: ViewMode) => {
    setViewMode(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, value);
    }
  }, []);

  return [viewMode, setViewModeWithStorage];
}

