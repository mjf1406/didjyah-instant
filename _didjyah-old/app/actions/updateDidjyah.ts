"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { didjyahs } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";

export interface UpdateDidjyahData {
  id: string;
  name: string;
  type: "since" | "timer" | "stopwatch" | "daily" | "goal";
  icon?: string;
  color?: string;
  icon_color?: string;
  description?: string;
  unit?: string;
  quantity?: number;
  daily_goal?: number;
  timer?: number;
  stopwatch?: boolean;
  since_last?: boolean;
  inputs?: string;
  updated_date: string;
}

export async function updateDidjyah(
  data: UpdateDidjyahData
): Promise<{ success: boolean; message: string | null }> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated.");

    await db
      .update(didjyahs)
      .set({
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
        icon_color: data.icon_color,
        description: data.description,
        unit: data.unit,
        quantity: data.quantity,
        daily_goal: data.daily_goal,
        timer: data.timer,
        stopwatch: data.stopwatch,
        since_last: data.since_last,
        // inputs: data.inputs,
        updated_date: data.updated_date,
      })
      .where(
        and(
            eq(didjyahs.user_id, userId), 
            eq(didjyahs.id, data.id)
        )
    )

    return { success: true, message: null };
  } catch (error: unknown) {
    console.error("Error updating didjyah:", error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred." };
  }
}
