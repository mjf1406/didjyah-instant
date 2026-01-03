"use client";

import React from "react";
import { List, LayoutGrid } from "lucide-react";

export type ViewMode = "list" | "grid";

const STORAGE_KEY = "didjyah-view-mode";

export function ViewToggle() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  // Sync with localStorage after hydration
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "list" || stored === "grid") {
      setViewMode(stored as ViewMode);
    }
  }, []);

  const toggleView = React.useCallback(() => {
    const newMode: ViewMode = viewMode === "list" ? "grid" : "list";
    setViewMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newMode);
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event("viewModeChange"));
    }
  }, [viewMode]);

  const isGridView = viewMode === "grid";

  return (
    <button
      type="button"
      onClick={toggleView}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900"
      aria-label={isGridView ? "Switch to list view" : "Switch to grid view"}
    >
      <List
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          isGridView ? "-rotate-90 scale-0" : "rotate-0 scale-100"
        }`}
      />
      <LayoutGrid
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
          isGridView ? "rotate-0 scale-100" : "rotate-90 scale-0"
        }`}
      />
      <span className="sr-only">Toggle view</span>
    </button>
  );
}

export function useViewMode(): [ViewMode, (value: ViewMode) => void] {
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  // Sync with localStorage after hydration
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "list" || stored === "grid") {
      setViewMode(stored as ViewMode);
    }
  }, []);

  // Listen for storage changes (when ViewToggle in navbar updates)
  React.useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "list" || stored === "grid") {
        setViewMode(stored as ViewMode);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Also listen for custom event for same-tab updates
    window.addEventListener("viewModeChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("viewModeChange", handleStorageChange);
    };
  }, []);

  const setViewModeWithStorage = React.useCallback((value: ViewMode) => {
    setViewMode(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, value);
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event("viewModeChange"));
    }
  }, []);

  return [viewMode, setViewModeWithStorage];
}

