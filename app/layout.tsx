import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "21st Dev Component Studio",
  description: "A curated workspace for interactive React component studies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
