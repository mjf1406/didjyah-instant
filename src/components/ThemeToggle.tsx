/** @format */

"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const isDark = (theme ?? resolvedTheme) === "dark";

    return (
        <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Light</span>
            <Switch
                checked={isDark}
                onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                }
                aria-label="Toggle theme"
            />
            <span>Dark</span>
        </div>
    );
}
