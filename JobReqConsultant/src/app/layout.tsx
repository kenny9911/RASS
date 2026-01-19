import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as premium font
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Requisition Consultant AI",
  description: "AI Agent Team for Recruitment Optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={cn(inter.className, "bg-background text-foreground min-h-screen antialiased")}>
        <div className="mx-auto max-w-md md:max-w-2xl min-h-screen bg-card shadow-2xl overflow-hidden flex flex-col items-stretch">
          {/* Mobile-first logic: constrain width on desktop, full on mobile */}
          {children}
        </div>
      </body>
    </html>
  );
}
