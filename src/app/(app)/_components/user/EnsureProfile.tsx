/** @format */

"use client";

import React from "react";
import { db } from "@/lib/db";

type EnsureProfileProps = {
    defaults?: {
        firstName?: string;
        lastName?: string;
        googlePicture?: string;
        plan?: string;
    };
};

export default function EnsureProfile({ defaults }: EnsureProfileProps) {
    const user = db.useUser();
    const { data, isLoading, error } = db.useQuery({
        profiles: { $: { where: { "user.id": user.id } } },
    });
    const createdRef = React.useRef(false);

    React.useEffect(() => {
        if (createdRef.current) return;
        if (!user?.id) return;
        if (user.isGuest) return;
        if (isLoading) return;
        const existing = data?.profiles?.[0];
        if (existing) return;

        createdRef.current = true;
        const firstName = defaults?.firstName ?? "";
        const lastName = defaults?.lastName ?? "";
        const googlePicture = defaults?.googlePicture;
        const plan = defaults?.plan ?? "free";

        db.transact(
            db.tx.profiles[user.id]
                .update({
                    joined: new Date(),
                    plan,
                    firstName,
                    lastName,
                    googlePicture,
                })
                .link({ user: user.id })
        ).catch(() => {
            // swallow; profile creation is best effort
            createdRef.current = false;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.isGuest, isLoading, data?.profiles?.[0]?.id]);

    if (error) return null;
    return null;
}
