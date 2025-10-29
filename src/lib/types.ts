/** @format */

import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

// Entity aliases derived from schema for strict typing across the app
export type Todo = InstaQLEntity<AppSchema, "todos">;
export type Profile = InstaQLEntity<AppSchema, "profiles">;
export type User = InstaQLEntity<AppSchema, "$users">;
export type UserWithGuests = InstaQLEntity<
    AppSchema,
    "$users",
    { linkedGuestUsers: {} }
>;

// Minimal Google ID token claims we use
export type GoogleJWTClaims = {
    given_name: string;
    family_name: string;
    email?: string;
    picture?: string;
};
