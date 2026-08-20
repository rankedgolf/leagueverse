import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AnnouncementBar } from "@/components/site/announcement-bar";

import { Navbar } from "@/components/site/navbar";

import "./globals.css";

import { Footer } from "@/components/site/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LeagueVerse",
    template: "%s | LeagueVerse",
  },

  description:
    "The future of dynasty fantasy sports. Add contracts, salary caps, free agency, franchise tags, and front-office management to your Sleeper dynasty league.",

  keywords: [
    "dynasty fantasy football",
    "fantasy football contracts",
    "dynasty salary cap",
    "dynasty commissioner tools",
    "Sleeper dynasty",
    "fantasy football free agency",
    "fantasy football franchise mode",
    "LeagueVerse",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
   <body className="flex min-h-full flex-col bg-slate-950 text-white">
  <AnnouncementBar />

  <Navbar />

  <main className="flex-1">
    {children}
  </main>

  <Footer />
</body>
    </html>
  );
}
