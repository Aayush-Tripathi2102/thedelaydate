import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const display = localFont({ src: "../../public/fonts/bricolage.ttf", variable: "--font-display", display: "swap", weight: "200 800" });
const body = localFont({ src: "../../public/fonts/manrope.ttf", variable: "--font-body", display: "swap", weight: "200 800" });

export const metadata: Metadata = {
  title: "The Delay Date — Tannu, your wait is over.",
  description: "One slightly overdue Ayush Tripathi. One very patient Tannu. A date, finally out of development.",
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>;
}
