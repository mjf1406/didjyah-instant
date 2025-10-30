/** @format */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function App() {
    const router = useRouter();
    
    useEffect(() => {
        router.push("/todo");
    }, [router]);

    return null;
}
