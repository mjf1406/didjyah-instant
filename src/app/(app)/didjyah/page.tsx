/** @format */

"use client";

import React from "react";
import { db } from "@/lib/db";
import DidjyahList from "@/app/(app)/didjyahs/_components/DidjyahList";
import EnsureProfile from "@/app/(app)/_components/user/EnsureProfile";

export default function DidjyahPage() {
    return (
        <>
            <db.SignedIn>
                <EnsureProfile />
                <main className="p-2 md:p-4">
                    <DidjyahList />
                </main>
            </db.SignedIn>
            <db.SignedOut>
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-4">Sign in to use DidjYah</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please sign in to track your activities.
                        </p>
                    </div>
                </div>
            </db.SignedOut>
        </>
    );
}

