/** @format */

"use client";

import React, { useState } from "react";
import { db } from "@/lib/db";
import { useRouter } from "next/navigation";
import GoogleSignIn from "@/app/(app)/_components/auth/GoogleSignIn";
import { getErrorMessage } from "@/lib/errors";

export default function LoginPage() {
    const [nonce] = useState(crypto.randomUUID());
    const router = useRouter();
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black">
                <h1 className="mb-2 text-center text-xl font-semibold">
                    Log in to DidjYah
                </h1>
                <p className="mb-6 text-center text-sm text-gray-500">
                    Continue with your Google account
                </p>
                <div className="flex justify-center">
                    <GoogleSignIn
                        nonce={nonce}
                        onSuccess={() => router.push("/app")}
                    />
                </div>
                <div className="mt-6">
                    <button
                        onClick={async () => {
                            try {
                                await db.auth.signInAsGuest();
                                router.push("/app");
                            } catch (err) {
                                alert("Uh oh: " + getErrorMessage(err));
                            }
                        }}
                        className="w-full bg-gray-800 px-3 py-2 font-semibold text-white hover:bg-gray-900 rounded-md"
                    >
                        Try before signing up
                    </button>
                </div>
            </div>
        </div>
    );
}
