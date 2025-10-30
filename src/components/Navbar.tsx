/** @format */

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { db } from "@/lib/db";
import { useUserWithProfile } from "@/lib/useUser";
import ThemeToggle from "@/components/ThemeToggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateDidjyahDialog } from "@/app/(app)/didjyahs/_components/CreateDidjyahDialog";

// Google login is handled on the /login page

function getInitials(firstName?: string, lastName?: string) {
    const f = (firstName || "").trim();
    const l = (lastName || "").trim();
    if (!f && !l) return "?";
    return `${f[0] || ""}${l[0] || ""}`.toUpperCase();
}

export default function Navbar() {
    const pathname = usePathname();
    const isDidjyahRoute = pathname === "/didjyah";

    return (
        <header className="border-b border-gray-200 dark:border-gray-800">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="flex items-center gap-2"
                    >
                        <Image
                            src="/vercel.svg"
                            alt="DidjYah"
                            width={24}
                            height={24}
                        />
                        <span className="font-semibold tracking-tight">
                            DidjYah
                        </span>
                    </Link>
                </div>

                {/* Center: Links */}
                <nav className="hidden md:flex items-center gap-6 text-sm">
                    <Link
                        href="/todo"
                        className="hover:underline"
                    >
                        Todos
                    </Link>
                    <Link
                        href="/didjyah"
                        className="hover:underline"
                    >
                        DidjYah
                    </Link>
                    <Link
                        href="/about"
                        className="hover:underline"
                    >
                        About
                    </Link>
                    <Link
                        href="/pricing"
                        className="hover:underline"
                    >
                        Pricing
                    </Link>
                    <Link
                        href="/contact"
                        className="hover:underline"
                    >
                        Contact
                    </Link>
                </nav>

                {/* Right: Auth */}
                <div className="flex items-center gap-3">
                    {isDidjyahRoute && (
                        <db.SignedIn>
                            <CreateDidjyahDialog />
                        </db.SignedIn>
                    )}
                    <ThemeToggle />
                    <db.SignedOut>
                        <Link
                            href="/app/login"
                            className="rounded-full border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                        >
                            Log in
                        </Link>
                    </db.SignedOut>

                    <db.SignedIn>
                        <NavbarSignedIn />
                    </db.SignedIn>
                </div>
            </div>
        </header>
    );
}

function NavbarSignedIn() {
    const { user, profile } = useUserWithProfile();
    const fullName = [profile?.firstName, profile?.lastName]
        .filter(Boolean)
        .join(" ");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar>
                    <AvatarImage
                        src={profile?.googlePicture}
                        alt={fullName}
                    />
                    <AvatarFallback>
                        {getInitials(profile?.firstName, profile?.lastName)}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56"
            >
                <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage
                                src={profile?.googlePicture}
                                alt={fullName}
                            />
                            <AvatarFallback>
                                {getInitials(
                                    profile?.firstName,
                                    profile?.lastName
                                )}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">
                                {fullName || "User"}
                            </span>
                            <span className="text-xs text-gray-500">
                                {profile?.plan ?? "Free"}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/app/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/app/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.isGuest ? (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href="/app/login">Sign in with Google</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                ) : null}
                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault();
                        db.auth.signOut();
                    }}
                >
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
