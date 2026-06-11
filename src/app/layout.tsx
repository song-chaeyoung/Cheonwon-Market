import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ScrollTopButton } from "@/components/layout/scroll-top-button";

import "./globals.css";

function normalizeSiteUrl(value: string | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    return undefined;
  }

  return normalized.startsWith("http://") ||
    normalized.startsWith("https://")
    ? normalized
    : `https://${normalized}`;
}

const siteUrl =
  normalizeSiteUrl(process.env.SITE_URL) ??
  normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  normalizeSiteUrl(process.env.VERCEL_URL) ??
  "http://localhost:3000";
const title = "천원마켓";
const description =
  "친구들끼리 가볍게 물건을 올리고 예약하는 천원마켓입니다.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <ScrollTopButton />
      </body>
    </html>
  );
}
