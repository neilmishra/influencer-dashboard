import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DashboardProvider } from "@/context/DashboardContext";
import { FilterBar } from "@/components/layout/FilterBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
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
  title: "Pulseboard | Influencer Data Dashboard",
  description:
    "Track creator performance, campaign ROI, EMV, and audience demographics across Instagram, YouTube, and TikTok.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <DashboardProvider>
          <div className="flex min-h-full">
            <Sidebar />
            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
              <Topbar />
              <FilterBar />
              <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
            </div>
          </div>
        </DashboardProvider>
      </body>
    </html>
  );
}
