/** @format */

"use client";

import React from "react";
import { db } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(firstName?: string, lastName?: string) {
    const f = (firstName || "").trim();
    const l = (lastName || "").trim();
    if (!f && !l) return "?";
    return `${f[0] || ""}${l[0] || ""}`.toUpperCase();
}

export default function UserCard() {
    return (
        <>
            <db.SignedIn>
                <SignedInUserCard />
            </db.SignedIn>
            <db.SignedOut>
                <GuestUserCard />
            </db.SignedOut>
        </>
    );
}

function SignedInUserCard() {
    const user = db.useUser();
    const { data } = db.useQuery({
        profiles: {
            $: { where: { "user.id": user.id } },
        },
    });
    const profile = data?.profiles?.[0];
    const fullName = [profile?.firstName, profile?.lastName]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage
                    src={profile?.googlePicture}
                    alt={fullName}
                />
                <AvatarFallback>
                    {getInitials(profile?.firstName, profile?.lastName)}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-sm font-medium">
                    {fullName || "User"}
                </span>
                <span className="text-xs text-gray-500">
                    {profile?.plan || "free"}
                </span>
            </div>
        </div>
    );
}

function GuestUserCard() {
    return (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarFallback>?</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-sm font-medium">Guest</span>
                <span className="text-xs text-gray-500">free</span>
            </div>
        </div>
    );
}
