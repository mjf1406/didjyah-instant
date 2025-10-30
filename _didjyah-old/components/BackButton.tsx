"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button variant={"default"} onClick={() => router.back()}>
      <ArrowLeft /> Go Back
    </Button>
  );
}
