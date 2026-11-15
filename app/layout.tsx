import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Crimson Eye of God — Public Identity Intelligence",
  description: "A privacy-conscious workspace for exploring publicly accessible username profiles.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
