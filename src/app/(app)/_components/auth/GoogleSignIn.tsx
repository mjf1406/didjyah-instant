/** @format */

"use client";

import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { signInWithGoogle } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

type GoogleSignInProps = {
    nonce: string;
    onSuccess?: () => void;
    onError?: (message: string) => void;
};

export default function GoogleSignIn({
    nonce,
    onSuccess,
    onError,
}: GoogleSignInProps) {
    return (
        <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
            <GoogleLogin
                nonce={nonce}
                onError={() => {
                    const message = "Login failed";
                    onError ? onError(message) : alert(message);
                }}
                onSuccess={async ({ credential }) => {
                    if (!credential) return;
                    try {
                        await signInWithGoogle(credential, nonce);
                        onSuccess?.();
                    } catch (err) {
                        const message = getErrorMessage(err);
                        onError ? onError(message) : alert("Uh oh: " + message);
                    }
                }}
            />
        </GoogleOAuthProvider>
    );
}
