"use server";

import { db } from "@/server/db";
import { didjyah_records } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";

export interface NewDidjyahRecordData {
    id: string;
  didjyah_id: string;
  // You can pass JSON inputs as a string or object depending on how you want to handle it.
  inputs?: string;
  // Optional test field, adjust as needed.
  test?: string;
}

export async function createDidjyahRecord(
  data: NewDidjyahRecordData
): Promise<{ success: boolean; message: string | null }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated.");
    }

    await db.insert(didjyah_records).values({
      id: data.id,
      user_id: userId,
      didjyah_id: data.didjyah_id,
      inputs: data.inputs,
      test: data.test,
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
