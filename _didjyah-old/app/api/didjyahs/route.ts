// src/app/api/didjyahs/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { didjyahs, didjyah_records } from "@/server/db/schema";
import { db } from "@/server/db";

export const revalidate = 360; // Revalidate data every 360s (ISR-like caching)
export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all didjyahs that belong to the user
    const didjyahsData = await db
      .select()
      .from(didjyahs)
      .where(eq(didjyahs.user_id, userId));

    // Fetch all didjyah_records that belong to the user
    const recordsData = await db
      .select()
      .from(didjyah_records)
      .where(eq(didjyah_records.user_id, userId));

    // For each didjyah, attach the didjyah_records based on didjyah ID
    const combinedData = didjyahsData.map((didjyah) => ({
      ...didjyah,
      records: recordsData.filter(
        (record) => record.didjyah_id === didjyah.id
      ),
    }));

    return NextResponse.json(combinedData, { status: 200 });
  } catch (error) {
    console.error("Error fetching didjyahs:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
