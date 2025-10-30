/** @format */

"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnsureProfile from "@/app/(app)/_components/user/EnsureProfile";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";
import DashboardStats from "./_components/DashboardStats";
import RecordsChart from "./_components/RecordsChart";
import StreakTracker from "./_components/StreakTracker";
import GoalProgress from "./_components/GoalProgress";
import RecentActivity from "./_components/RecentActivity";

type DidjyahWithRecords = InstaQLEntity<
  AppSchema,
  "didjyahs",
  { owner: {}; records: {} }
>;

export default function DidjyahDashboardPage() {
  return (
    <>
      <db.SignedIn>
        <EnsureProfile />
        <DidjyahDashboard />
      </db.SignedIn>
      <db.SignedOut>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Sign in to view dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in to view your didjyah analytics.
            </p>
          </div>
        </div>
      </db.SignedOut>
    </>
  );
}

function DidjyahDashboard() {
  const params = useParams();
  const router = useRouter();
  const didjyahId = params.didjyahId as string;
  const user = db.useUser();

  const { data, isLoading, error } = db.useQuery({
    didjyahs: {
      $: {
        where: {
          id: didjyahId,
          "owner.id": user.id,
        },
      },
      records: {},
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
          <CircleX className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "An error occurred"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const didjyah = data?.didjyahs?.[0] as DidjyahWithRecords | undefined;

  if (!didjyah) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert>
          <AlertTitle>Didjyah not found</AlertTitle>
          <AlertDescription>
            This didjyah doesn't exist or you don't have access to it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{didjyah.name}</h1>
          {didjyah.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {didjyah.description}
            </p>
          )}
        </div>
      </div>

      {/* Dashboard Components */}
      <DashboardStats didjyah={didjyah} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecordsChart didjyah={didjyah} />
        <GoalProgress didjyah={didjyah} />
      </div>
      <StreakTracker didjyah={didjyah} />
      <RecentActivity didjyah={didjyah} />
    </div>
  );
}

