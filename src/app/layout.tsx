import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import AppShell from "@/components/Layout/AppShell";
import ScrollToTop from "@/components/ScrollToTop";
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
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full bg-slate-950 text-slate-100">
        <ScrollToTop />
        <AppShell surahs={surahs}>{children}</AppShell>
      </body>
    </html>
  );
}
