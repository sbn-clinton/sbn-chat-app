import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SBN Chat App",
  description: "Created by SBN_WEB_DEV",
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
