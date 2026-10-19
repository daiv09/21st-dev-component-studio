import type { Metadata } from "next";
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
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
