import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quelliv Deal Agent | Struxurety",
  description:
    "Alex — Quelliv Investor Data Room Deal Agent (Struxurety). Gatekeeper and document guide.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
