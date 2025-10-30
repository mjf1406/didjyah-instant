"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleX } from "lucide-react";
import { DidjyahOptions } from "@/app/api/queryOptions";
import type { DidjyahDb } from "@/server/db/types";
import DidjyahCard from "./DidjyahCard";
import LoaderSmallInline from "../loading/LoaderSmallInline";
import NoDidjyahsCard from "./NoDidjyahsCard";

const DidjyahList: React.FC = () => {
  const { data, isLoading, isError, error } =
    useQuery<DidjyahDb[]>(DidjyahOptions);

  if (isLoading) {
    return (
      <div className="m-auto flex w-full max-w-4xl items-center justify-center lg:min-w-3xl">
        <LoaderSmallInline />
      </div>
    );
  }

  if (isError || error) {
    return (
      <div className="m-auto flex h-auto w-full items-center justify-center">
        <div className="max-w-5xl px-4">
          <Alert
            variant="destructive"
            className="flex w-full items-center gap-4"
          >
            <CircleX
              className="shrink-0"
              style={{ width: "36px", height: "36px" }}
            />
            <div className="w-full">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : "An error occurred"}
              </AlertDescription>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="m-auto flex h-auto w-full items-center justify-center">
        <div className="max-w-5xl px-4">
          {/* <Alert
            variant="destructive"
            className="flex w-full items-center gap-4"
          >
            <AlertTriangle
              className="shrink-0"
              style={{ width: "36px", height: "36px" }}
            />
            <div className="w-full">
              <AlertTitle>No Didjyahs!</AlertTitle>
              <AlertDescription className="whitespace-nowrap">
                Please add a new Didjyah using the appropriate button on the
                dashboard.
              </AlertDescription>
            </div>
          </Alert> */}
          <NoDidjyahsCard />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      {data.map((item) => (
        <DidjyahCard key={item.id} detail={item} />
      ))}
    </div>
  );
};

export default DidjyahList;
