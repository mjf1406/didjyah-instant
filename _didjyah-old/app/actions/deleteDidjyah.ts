"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { didjyahs } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function deleteDidjyah(
  id: string
): Promise<{ success: boolean; message: string | null }> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated.");

    await db
      .delete(didjyahs)
      .where(and(eq(didjyahs.user_id, userId), eq(didjyahs.id, id)));

    return { success: true, message: null };
  } catch (error: unknown) {
    console.error("Error deleting didjyah:", error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred." };
  }
}
