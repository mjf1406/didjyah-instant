"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconPrefix, IconName } from "@fortawesome/fontawesome-svg-core";
import { toast } from "sonner";
import { id } from "@instantdb/react";
import { db } from "@/lib/db";
import { Progress } from "@/components/ui/progress";
import EditDidjyahDialog from "./EditDidjyahDialog";
import { Button } from "@/components/ui/button";
import SinceStopwatch from "./SinceStopWatch";
import DeleteDidjyahAlertDialog from "./DeleteDidjyahAlertDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash, BarChart3 } from "lucide-react";
import Link from "next/link";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type DidjyahWithRecords = InstaQLEntity<
  AppSchema,
  "didjyahs",
  { records: {} }
>;

interface DidjyahCardProps {
  detail: DidjyahWithRecords;
  viewMode?: "list" | "grid";
}

const DidjyahCard: React.FC<DidjyahCardProps> = ({ detail, viewMode = "list" }) => {
  const user = db.useUser();
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // Parse the icon from the stored string "prefix|iconName"
  let iconComponent: React.ReactNode = null;
  if (detail.icon) {
    const parts = detail.icon.split("|");
    if (parts.length === 2) {
      const [prefix, iconName] = parts;
      iconComponent = (
        <FontAwesomeIcon
          icon={[prefix as IconPrefix, iconName as IconName]}
          style={{ color: detail.iconColor ?? "#000000" }}
          className={viewMode === "grid" ? "text-lg" : "text-3xl md:text-5xl"}
        />
      );
    }
  }
  // Fallback if no icon is set
  iconComponent ??= <span className={viewMode === "grid" ? "text-xs" : "text-xs md:text-2xl"}>❓</span>;

  // Filter records for today only based on createdDate (number timestamp).
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartTimestamp = todayStart.getTime();
  const todayEndTimestamp = todayStartTimestamp + 24 * 60 * 60 * 1000;

  const todayCount = (detail.records || []).filter((record) => {
    const recordDate = record.createdDate;
    if (!recordDate) return false;
    return recordDate >= todayStartTimestamp && recordDate < todayEndTimestamp;
  }).length;

  const handlePlayClick = async () => {
    try {
      const now = Date.now();
      await db.transact(
        db.tx.didjyahRecords[id()]
          .update({
            createdDate: now,
            updatedDate: now,
            endDate: now,
          })
          .link({ didjyah: detail.id })
          .link({ owner: user.id })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred while adding the record.";
      toast.error(message);
    }
  };

  // Calculate progress based on today's count multiplied by quantity
  // and the daily goal multiplied by quantity.
  const current = detail.quantity ? todayCount * detail.quantity : todayCount;
  const total =
    detail.dailyGoal && detail.quantity
      ? detail.dailyGoal * detail.quantity
      : detail.dailyGoal ?? 0;
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const dailyGoalNum = Number(detail.dailyGoal);

  // Get the most recent record for the "since last" timer
  const records = detail.records || [];
  const lastRecord = records.length > 0 
    ? records.reduce((latest, record) => {
        if (!latest) return record;
        if (!record.createdDate) return latest;
        if (!latest.createdDate) return record;
        return record.createdDate > latest.createdDate ? record : latest;
      })
    : null;

  const isGrid = viewMode === "grid";

  return (
    <div
      id={`DidgYa-${detail.id}`}
      className={`flex overflow-hidden rounded-lg border shadow-sm ${
        isGrid
          ? "w-full flex-col"
          : "w-full max-w-[450px] flex-row"
      }`}
    >
      {/* Icon Section */}
      <div
        id={`emoji-${detail.id}`}
        style={{ backgroundColor: detail.color ?? "#ffffff" }}
        className={`flex items-center justify-center ${
          isGrid
            ? "w-full h-16 p-2"
            : "w-12 md:w-20 md:min-w-20 p-2 md:p-4"
        }`}
      >
        {iconComponent}
      </div>

      {/* Main content */}
      <div className={`flex w-full flex-col ${
        isGrid ? "gap-1 p-2" : "gap-1 p-2 md:gap-2 md:p-4"
      }`}>
        <div className={`flex ${isGrid ? "flex-col gap-1" : "justify-between gap-3 md:gap-5"}`}>
          {/* Name and performedToday */}
          <div className="flex flex-col min-w-0">
            {isGrid ? (
              <>
                <span
                  id={`name-${detail.id}`}
                  className="font-semibold truncate text-[10px]"
                >
                  {detail.name}
                </span>
                {detail.sinceLast && lastRecord && lastRecord.createdDate && (
                  <span className="text-[8px] truncate">
                    <SinceStopwatch
                      startDateTime={lastRecord.createdDate}
                    />
                  </span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1 min-w-0">
                <span
                  id={`name-${detail.id}`}
                  className="font-semibold truncate text-xs md:text-base"
                >
                  {detail.name}
                </span>
                {detail.sinceLast && lastRecord && lastRecord.createdDate && (
                  <span className="shrink-0 text-[10px] md:text-xs">
                    <SinceStopwatch
                      startDateTime={lastRecord.createdDate}
                    />
                  </span>
                )}
              </div>
            )}
            <span
              id={`performedToday-${detail.id}`}
              className={`${isGrid ? "text-[9px]" : "text-[10px] md:text-xs"}`}
            >
              <b>
                {todayCount} {dailyGoalNum > 0 && `/ ${dailyGoalNum}`}
              </b>
              {!isGrid && (
                <>
                  {" "}
                  {todayCount === 1 ? "time" : "times"} today{" "}
                  {detail.quantity !== 0 && detail.quantity && dailyGoalNum > 0 && (
                    <>
                      <b>
                        ({(todayCount * detail.quantity).toLocaleString()} /{" "}
                        {(dailyGoalNum * detail.quantity).toLocaleString()})
                      </b>{" "}
                      {detail.unit}
                    </>
                  )}
                </>
              )}
            </span>
          </div>
          {/* Buttons Row */}
          <div className={`flex items-center ${isGrid ? "justify-center gap-1" : "justify-end space-x-2 md:mt-2"}`}>
            <span
              id={`stop-${detail.id}`}
              className="text-supporting-light dark:text-supporting-dark hover:text-supporting-light/80 dark:hover:text-supporting-dark/80 hidden cursor-pointer"
            >
              <FontAwesomeIcon
                className={`text-red-600 ${isGrid ? "text-sm" : "text-2xl md:text-3xl"}`}
                icon={["fas", "stop"]}
              />
            </span>
            <Button
              id={`play-${detail.id}`}
              onClick={handlePlayClick}
              variant={"ghost"}
              size={isGrid ? "icon-sm" : "icon"}
            >
              <FontAwesomeIcon
                className={`text-green-600 ${isGrid ? "text-sm" : "text-2xl md:text-3xl"}`}
                icon={["fas", "play"]}
              />
            </Button>
            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size={isGrid ? "icon-sm" : "icon"}>
                  <MoreVertical className={isGrid ? "h-3 w-3" : "h-4 w-4"} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/didjyah/${detail.id}`} prefetch={true}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  variant="destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Bar */}
        {dailyGoalNum > 0 && (
          <Progress
            showPercentage={!isGrid}
            value={percentage}
            className={`w-full ${isGrid ? "h-1.5" : "h-3 md:h-4"}`}
          />
        )}
      </div>
      {/* Dialogs - controlled by dropdown menu */}
      <EditDidjyahDialog 
        didjyah={detail} 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      <DeleteDidjyahAlertDialog 
        detail={detail}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
};

export default DidjyahCard;

