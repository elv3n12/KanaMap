import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { AgeGate } from "@/components/age-gate";
import { RiskBanner } from "@/components/risk-banner";
import { SiteHeader } from "@/components/site-header";
import { branding } from "@/lib/branding";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: branding.appName,
  description: branding.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-obs-void font-sans text-zinc-100">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader />
        <RiskBanner />
        <main id="main-content" className="min-h-screen pt-14" tabIndex={-1}>
          {children}
        </main>
        <AgeGate />
      </body>
    </html>
  );
}
