import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import IconSidebar from "@/components/Sidebar/IconSidebar";
import SurahList from "@/components/Sidebar/SurahList";
import { getSurahSummaries } from "@/lib/quran";

export const metadata: Metadata = {
  title: "Quran Reader",
  description: "A responsive Quran reader built with Next.js and TypeScript.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const surahs = getSurahSummaries();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-100">
        <IconSidebar />
        <SurahList surahs={surahs} />
        <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-96 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
