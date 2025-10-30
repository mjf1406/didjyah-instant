"use server";

import { db } from "@/server/db";
import { didjyahs } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";

export interface NewDidjyahRecordData {
    id: string,
  name: string;
  type: "since" | "timer" | "stopwatch" | "daily" | "goal";
  icon?: string;
  color?: string,
  icon_color?: string,
  description?: string;
  unit?: string;
  quantity?: number;
  daily_goal?: number;
  timer?: number;
  since_last?: boolean;
  stopwatch?: boolean;
//   inputs?: string | undefined | null;
}

export async function createDidjyah(
  data: NewDidjyahRecordData
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated.");
    }

    await db.insert(didjyahs).values({
      id: data.id,
      user_id: userId,
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
      since_last: data.since_last,
      stopwatch: data.stopwatch,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    });

    return { success: true, message: null };
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred." };
  }
}
