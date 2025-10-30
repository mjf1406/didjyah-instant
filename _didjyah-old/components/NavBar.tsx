/** @format */

"use client";

import React from "react";
import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./theme/theme-toggle";
import { LogoHeader } from "./brand/logo"; // renamed component to Logo for mobile
import { Button } from "@/components/ui/button"; // Example shadcn component
import { Menu } from "lucide-react"; // Icons from lucide-react
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CreateDidjyahDialog from "./didjyahs/CreateDidjyahDialog";

export default function Navbar() {
  const navItems = [
    {
      title: "About",
      url: "/about",
    },
    {
      title: "Contact",
      url: "/contact",
    },
  ];

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle menu">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetTitle hidden>Are you absolutely sure?</SheetTitle>
            <SheetContent side="left">
              <div className="px-4 py-2">
                <LogoHeader />
              </div>
              <nav className="px-4 py-2">
                <ul className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <li key={item.title}>
                      <Link
                        className="block text-sm hover:underline"
                        href={item.url}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden md:block">
          <LogoHeader />
        </div>
        <div className="flex items-center justify-center gap-5">
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link className="hover:underline" href={item.url}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <CreateDidjyahDialog />
          <div className="flex items-center gap-2">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
