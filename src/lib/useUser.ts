/** @format */

"use client";

import { db } from "@/lib/db";

type UseUserResult = {
    user: ReturnType<typeof db.useUser>;
    profile: any | undefined;
    isLoading: boolean;
    error: Error | undefined;
};

export function useUserWithProfile(): UseUserResult {
    const user = db.useUser();
    const {
        data,
        isLoading,
        error: queryError,
    } = db.useQuery({
        profiles: {
            $: { where: { "user.id": user.id } },
        },
    });
    const profile = data?.profiles?.[0];

    const normalizedError: Error | undefined = queryError
        ? queryError instanceof Error
            ? queryError
            : new Error((queryError as any)?.message ?? String(queryError))
        : undefined;

    return { user, profile, isLoading, error: normalizedError };
}
