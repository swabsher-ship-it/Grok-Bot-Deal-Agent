import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quelliv Deal Agent | Struxurety",
  description:
    "Ask Alex — Quelliv in-room assistant and Data Room gatekeeper (Struxurety). Unlocks Investor Preview / Data Room after the access gate.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
