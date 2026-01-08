/** @format */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import ConnectionStatusMonitor from "@/components/ConnectionStatusMonitor";
import { UndoProvider } from "@/lib/undo";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "DidjYah",
    description: "DidjYah is a app to track all the things you do.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
        >
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem={false}
                >
                    <UndoProvider>
                        <ConnectionStatusMonitor />
                        <Navbar />
                        <div className="pb-16 md:pb-0">{children}</div>
                        <Toaster />
                    </UndoProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
