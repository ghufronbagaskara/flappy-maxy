import type { Metadata } from "next";
import { DM_Sans, Orbitron } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: "Flappy Maxy | MAXY Academy",
  description:
    "Flappy Bird technical test with automated score email delivery via Resend.",
  openGraph: {
    images: [
      {
        url: "/assets/flappy-maxy-logo.png",
        width: 1200,
        height: 1200,
        alt: "Flappy Maxy logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
