import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maya AI — Your maternal companion",
  description: "A controlled fictional local demo of Nestline journey, safety, planning, and evidence-validation boundaries.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
