import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import IconSidebar from "@/components/Sidebar/IconSidebar";
import SurahList from "@/components/Sidebar/SurahList";

export const metadata: Metadata = {
  title: "Quran Reader",
  description: "A responsive Quran reader built with Next.js and TypeScript.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex">
        <IconSidebar />
        <SurahList />
        <main className="flex-1 p-4 lg:ml-80">
          {children}
        </main>
      </body>
    </html>
  );
}
