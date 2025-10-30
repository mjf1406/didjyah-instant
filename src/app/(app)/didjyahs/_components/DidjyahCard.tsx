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
import { useRouter } from "next/navigation";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type DidjyahWithRecords = InstaQLEntity<
  AppSchema,
  "didjyahs",
  { records: {} }
>;

interface DidjyahCardProps {
  detail: DidjyahWithRecords;
}

const DidjyahCard: React.FC<DidjyahCardProps> = ({ detail }) => {
  const user = db.useUser();
  const router = useRouter();
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
          className="text-3xl md:text-5xl"
        />
      );
    }
  }
  // Fallback if no icon is set
  iconComponent ??= <span className="text-xs md:text-2xl">❓</span>;

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

  return (
    <div
      id={`DidgYa-${detail.id}`}
      className="flex w-[450px] overflow-hidden rounded-lg border shadow-sm"
    >
      {/* Left Side: Full-height colored column with the icon */}
      <div
        id={`emoji-${detail.id}`}
        style={{ backgroundColor: detail.color ?? "#ffffff" }}
        className="flex w-12 items-center justify-center p-2 md:w-20 md:min-w-20 md:p-4"
      >
        {iconComponent}
      </div>

      {/* Right Side: Main content */}
      <div className="mx-auto flex w-full flex-col gap-1 p-2 md:gap-2 md:p-4">
        <div className="flex justify-between gap-3 md:gap-5">
          {/* Name and performedToday */}
          <div className="flex flex-col">
            <span
              id={`name-${detail.id}`}
              className="text-xs font-semibold md:text-base"
            >
              {detail.name}{" "}
              {detail.sinceLast && lastRecord && lastRecord.createdDate && (
                <SinceStopwatch
                  startDateTime={lastRecord.createdDate}
                />
              )}
            </span>
            <span
              id={`performedToday-${detail.id}`}
              className="text-[10px] md:text-xs"
            >
              <b>
                {todayCount} {dailyGoalNum > 0 && `/ ${dailyGoalNum}`}
              </b>{" "}
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
            </span>
          </div>
          {/* Buttons & Location Row */}
          <div className="mt-1 flex items-center justify-end space-x-2 md:mt-2">
            <span
              id={`stop-${detail.id}`}
              className="text-supporting-light dark:text-supporting-dark hover:text-supporting-light/80 dark:hover:text-supporting-dark/80 hidden cursor-pointer"
            >
              <FontAwesomeIcon
                className="text-2xl text-red-600 md:text-3xl"
                icon={["fas", "stop"]}
              />
            </span>
            <Button
              id={`play-${detail.id}`}
              onClick={handlePlayClick}
              variant={"ghost"}
              size={"icon"}
            >
              <FontAwesomeIcon
                className="text-2xl text-green-600 md:text-3xl"
                icon={["fas", "play"]}
              />
            </Button>
            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/didjyah/${detail.id}`)}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Dashboard
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
            showPercentage
            value={percentage}
            className="h-3 w-full md:h-4"
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

