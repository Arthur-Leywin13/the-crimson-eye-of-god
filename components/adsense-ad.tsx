"use client";

import { useEffect } from "react";

type AdSenseWindow = Window & {
  adsbygoogle?: Array<Record<string, never>>;
};

export default function AdSenseAd({ slot, className = "" }: { slot: string; className?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!client || !slot) return;
    try {
      const adsWindow = window as AdSenseWindow;
      adsWindow.adsbygoogle = adsWindow.adsbygoogle || [];
      adsWindow.adsbygoogle.push({});
    } catch {
      // AdSense can reject an ad request while the site is being reviewed or an ad is unavailable.
    }
  }, [client, slot]);

  if (!client || !slot) return null;

  return (
    <aside className={`adsense-placement ${className}`} aria-label="Advertisement">
      <span className="adsense-label">ADVERTISEMENT</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: "100px" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
