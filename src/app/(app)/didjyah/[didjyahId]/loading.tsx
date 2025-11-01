/** @format */

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Loading() {
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    disabled
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>

            {/* Dashboard Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton
                        key={i}
                        className="h-32"
                    />
                ))}
            </div>

            {/* Charts Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
            </div>

            {/* Streak Tracker Skeleton */}
            <Skeleton className="h-64" />

            {/* Recent Activity Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton
                        key={i}
                        className="h-20"
                    />
                ))}
            </div>
        </div>
    );
}
