import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "@/auth";
import { Footer } from "@/components/Footer";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "xCollab | Creator & Brand Escrow Marketplace",
  description:
    "xCollab matches premium brands with verified creators. Razorpay-locked escrow, cross-platform identity verification, and transparent EMV/ROI analytics across Instagram, YouTube, and TikTok.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AppShell user={session?.user ?? null}>{children}</AppShell>
        <Footer user={session?.user ?? null} />
      </body>
    </html>
  );
}
