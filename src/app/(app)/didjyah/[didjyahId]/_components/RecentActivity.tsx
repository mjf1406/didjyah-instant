/** @format */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type DidjyahWithRecords = InstaQLEntity<
  AppSchema,
  "didjyahs",
  { records: {} }
>;

interface RecentActivityProps {
  didjyah: DidjyahWithRecords;
}

export default function RecentActivity({ didjyah }: RecentActivityProps) {
  const records = didjyah.records || [];

  // Get last 10 records, sorted by date
  const recentRecords = [...records]
    .filter((r) => r.createdDate)
    .sort((a, b) => {
      const dateA = a.createdDate || 0;
      const dateB = b.createdDate || 0;
      return dateB - dateA;
    })
    .slice(0, 10);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? "Just now" : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  if (recentRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No records yet. Start tracking to see your activity here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentRecords.map((record, index) => {
            const timestamp = record.createdDate || 0;
            return (
              <div
                key={record.id || index}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <div className="text-sm font-medium">
                      Record #{recentRecords.length - index}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(timestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(timestamp).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

