import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Posting Tracker",
  description: "High-fidelity social posting quota audit platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
