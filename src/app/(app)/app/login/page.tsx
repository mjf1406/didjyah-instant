/** @format */

"use client";

import React, { useState } from "react";
import { db } from "@/lib/db";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

type JWTResponse = {
    given_name: string;
    email: string;
    family_name: string;
    picture?: string | undefined;
};

function parseIdToken(idToken: string): JWTResponse {
    const base64Url = idToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
    );
    const decoded = atob(padded);
    return JSON.parse(decoded);
}

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
                    <GoogleOAuthProvider
                        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
                    >
                        <GoogleLogin
                            nonce={nonce}
                            onError={() => alert("Login failed")}
                            onSuccess={async ({ credential }) => {
                                if (!credential) return;
                                try {
                                    const parsed = parseIdToken(credential);
                                    const { user } =
                                        await db.auth.signInWithIdToken({
                                            clientName:
                                                process.env
                                                    .NEXT_PUBLIC_GOOGLE_CLIENT_NAME!,
                                            idToken: credential,
                                            nonce,
                                        });
                                    await db.transact([
                                        db.tx.profiles[user.id]
                                            .update({
                                                firstName: parsed.given_name,
                                                lastName: parsed.family_name,
                                                googlePicture: parsed.picture,
                                                joined: new Date(),
                                                plan: "free",
                                            })
                                            .link({ user: user.id }),
                                    ]);
                                    router.push("/app");
                                } catch (err: any) {
                                    alert(
                                        "Uh oh: " +
                                            (err?.body?.message ||
                                                err?.message ||
                                                String(err))
                                    );
                                }
                            }}
                        />
                    </GoogleOAuthProvider>
                </div>
                <div className="mt-6">
                    <button
                        onClick={async () => {
                            try {
                                await db.auth.signInAsGuest();
                                router.push("/app");
                            } catch (err: any) {
                                alert(
                                    "Uh oh: " +
                                        (err?.body?.message ||
                                            err?.message ||
                                            String(err))
                                );
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
