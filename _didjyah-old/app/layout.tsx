import { ThemeProvider } from "@/components/theme/theme-provider";
import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { type Metadata } from "next";
import { Nunito } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "Didjyah",
  description: "Track the things in your life",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${nunito.variable}`} suppressHydrationWarning>
        <body className="antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>{children}</QueryProvider>
            <Toaster richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
