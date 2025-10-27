/** @format */

"use client";

import React, { useState } from "react";
import { db } from "@/lib/db";
import SignedInApp from "@/components/SignedInApp";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

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

function App() {
    return (
        <>
            <db.SignedIn>
                <SignedInApp />
            </db.SignedIn>
            <db.SignedOut>
                <Login />
            </db.SignedOut>
        </>
    );
}

function Login() {
    const [nonce] = useState(crypto.randomUUID());
    return (
        <div className="min-h-screen flex items-center justify-center">
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
                            const { user } = await db.auth.signInWithIdToken({
                                clientName:
                                    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_NAME!,
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
    );
}

export default App;
