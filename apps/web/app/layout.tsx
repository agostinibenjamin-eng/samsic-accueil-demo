import type { Metadata } from "next";
import { Open_Sans, Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const openSans = Open_Sans({ 
  subsets: ['latin'], 
  variable: '--font-body',
  weight: ['300', '400', '600', '700', '800']
});

const roboto = Roboto({ 
  subsets: ['latin'], 
  variable: '--font-display',
  weight: ['400', '500', '700', '900']
});

export const metadata: Metadata = {
  title: "Samsic Accueil",
  description: "Plateforme IA de Planification",
};

import { TopHeader } from "@/components/layout/TopHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn(openSans.variable, roboto.variable)}>
      <body className="antialiased font-body bg-[var(--bg-page)] text-[var(--text-primary)] h-screen w-screen flex flex-col overflow-hidden">
        <TopHeader />
        <div className="flex-1 w-full flex overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
