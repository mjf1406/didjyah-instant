"use client";

import React from "react";
import type { DidjyahDb, DidjyahRecord } from "@/server/db/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconPrefix, IconName } from "@fortawesome/fontawesome-svg-core";
import { toast } from "sonner";
import { createDidjyahRecord } from "@/app/actions/addDidjyahRecord";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import EditDidjyahDialog from "./EditDidjyahDialog";
import { Button } from "../ui/button";
import { generateUuidWithPrefix } from "@/lib/utils";
import SinceStopwatch from "../SinceStopWatch";
import DeleteDidjyahAlertDialog from "./DeleteDidjyahAlertDialog";

interface DidjyahCardProps {
  detail: DidjyahDb;
}

const DidjyahCard: React.FC<DidjyahCardProps> = ({ detail }) => {
  // Parse the icon from the stored string "prefix|iconName"
  let iconComponent: React.ReactNode = null;
  if (detail.icon) {
    const parts = detail.icon.split("|");
    if (parts.length === 2) {
      const [prefix, iconName] = parts;
      iconComponent = (
        <FontAwesomeIcon
          icon={[prefix as IconPrefix, iconName as IconName]}
          style={{ color: detail.icon_color ?? "#000000" }}
          className="text-3xl md:text-5xl"
        />
      );
    }
  }
  // Fallback if no icon is set
  iconComponent ??= <span className="text-xs md:text-2xl">❓</span>;

  // Filter records for today only based on created_date.
  const todayCount = detail.records.filter((record) => {
    const recordDate = new Date(record.created_date);
    const today = new Date();
    return recordDate.toDateString() === today.toDateString();
  }).length;

  const queryClient = useQueryClient();

  const handlePlayClick = async () => {
    // Create an optimistic record using a temporary ID.
    const optimisticRecord: DidjyahRecord = {
      id: generateUuidWithPrefix("record_"),
      user_id: detail.user_id,
      didjyah_id: detail.id,
      test: "",
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
    };

    // Optimistically update the cached didjyahs data.
    queryClient.setQueryData<DidjyahDb[]>(["didjyahs"], (oldData) => {
      if (!oldData) return oldData;
      return oldData.map((d) => {
        if (d.id === detail.id) {
          return { ...d, records: [...d.records, optimisticRecord] };
        }
        return d;
      });
    });

    // Call the server action.
    const result = await createDidjyahRecord({
      didjyah_id: detail.id,
      id: optimisticRecord.id,
    });
    if (!result.success) {
      toast.error(
        result.message ?? "An error occurred while adding the record.",
      );
      // Optionally, roll back the optimistic update here.
    } else {
      toast.success(`${detail.name} recorded`);
    }
  };

  // Calculate progress based on today's count multiplied by quantity
  // and the daily goal multiplied by quantity.
  const current = detail.quantity ? todayCount * detail.quantity : todayCount;
  const total =
    detail.daily_goal && detail.quantity
      ? detail.daily_goal * detail.quantity
      : (detail.daily_goal ?? 0);
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const dailyGoalNum = Number(detail.daily_goal);

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
              {detail.since_last && detail.records.length > 0 && (
                <SinceStopwatch
                  startDateTime={
                    detail.records[detail.records.length - 1]?.created_date ??
                    null
                  }
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
            {/* Edit */}
            <EditDidjyahDialog didjyah={detail} />
            {/* Delete */}
            <DeleteDidjyahAlertDialog detail={detail} />
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
    </div>
  );
};

export default DidjyahCard;
