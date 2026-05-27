import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AgeGate } from "@/components/age-gate";
import { RiskBanner } from "@/components/risk-banner";
import { SiteHeader } from "@/components/site-header";
import { branding } from "@/lib/branding";
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
  title: branding.appName,
  description: branding.taglineFr,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 text-zinc-950">
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <SiteHeader />
        <main id="main-content" className="min-h-screen pb-20 pt-14" tabIndex={-1}>
          {children}
        </main>
        <RiskBanner />
        <AgeGate />
      </body>
    </html>
  );
}
