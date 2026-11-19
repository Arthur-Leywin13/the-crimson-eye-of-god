import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export const metadata: Metadata = {
  title: "The Crimson Eye of God — Public Identity Intelligence",
  description: "A privacy-conscious workspace for exploring publicly accessible username profiles.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {adsenseClientId && (
          <Script
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          />
        )}
        {children}
      </body>
    </html>
  );
}
