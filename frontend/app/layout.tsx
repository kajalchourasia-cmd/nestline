import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maya AI — Your maternal companion",
  description: "A calm, personalised companion for pregnancy, postpartum wellbeing, nutrition, movement and trusted weekly guidance.",
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
