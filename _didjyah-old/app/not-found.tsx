// ./pages/404.tsx

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import BackButton from "@/components/BackButton";

export default function Custom404() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md rounded-lg p-6 shadow-lg">
        <CardHeader className="flex flex-col items-center">
          <CardDescription>404 Not Found</CardDescription>
          {/* Fun SVG Art */}
          <Image
            src="/404-not-found.png" // Ensure you have this SVG in your public/images directory
            alt="Funny Robot"
            width={300}
            height={300}
            className="mb-4"
          />
          <CardTitle className="text-3xl font-bold">Oops!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Looks like you&apos;ve stumbled upon a page that doesn&apos;t exist.
          </p>
          <p className="mb-6">
            Don&apos;t worry, let&apos;s get you back on track!
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-3">
          <BackButton />
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Go to Home <ArrowRight />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
