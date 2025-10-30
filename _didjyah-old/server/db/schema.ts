// @/server/db/schema.ts

import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { DidjyahInput, DidjyahRecord, DidjyahType } from "./types";

export const didjyahs = sqliteTable('didjyahs',
    {
        id: text().notNull(),
        user_id: text().notNull(),
        name: text().notNull(),
        type: text({ mode: 'json'}).$type<DidjyahType>(),
        icon: text(),
        color: text(),
        icon_color: text(),
        description: text(),
        unit: text(),
        quantity: integer(), // each instance equals this value, could have a daily goal of 2 with quantity of 100, so total would be 200 if complete
        daily_goal: integer(),
        timer: integer(), // 0 means no timer is used
        stopwatch: integer({ mode: 'boolean'}),
        since_last: integer({ mode: 'boolean'}),
        inputs: text({ mode: 'json'}).$type<DidjyahInput>(),
        records: text({ mode: 'json'}).$type<DidjyahRecord>(),
        created_date: text().default(sql`CURRENT_TIMESTAMP`).notNull(),
        updated_date: text().default(sql`CURRENT_TIMESTAMP`).notNull(),
    },
    (table) => [
        index("user_id_idx").on(table.user_id)
    ]
)

export const didjyah_records = sqliteTable('didjyah_records',
    {
        id: text().notNull(),
        user_id: text().notNull(),
        didjyah_id: text().notNull(), // broken for some reason --> .references(() => didjyahs.id),
        inputs: text({ mode: 'json'}),
        test: text(),
        created_date: text().default(sql`CURRENT_TIMESTAMP`).notNull(),
        updated_date: text().default(sql`CURRENT_TIMESTAMP`).notNull(),
        end_date: text().default(sql`CURRENT_TIMESTAMP`).notNull(),
    },
    (table) => [
        index("didjyah_records_user_id_idx").on(table.user_id),
        index("didjyah_records_didjyah_id_idx").on(table.didjyah_id)
    ]
)