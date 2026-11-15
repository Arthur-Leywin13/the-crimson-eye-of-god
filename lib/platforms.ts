export type Platform = {
  id: string;
  name: string;
  domain: string;
  symbol: string;
  profileUrl: (handle: string) => string;
};

export const PLATFORMS: Platform[] = [
  { id: "instagram", name: "Instagram", domain: "instagram.com", symbol: "◎", profileUrl: (h) => `https://www.instagram.com/${encodeURIComponent(h)}/` },
  { id: "telegram", name: "Telegram", domain: "t.me", symbol: "➤", profileUrl: (h) => `https://t.me/${encodeURIComponent(h)}` },
  { id: "facebook", name: "Facebook", domain: "facebook.com", symbol: "f", profileUrl: (h) => `https://www.facebook.com/${encodeURIComponent(h)}` },
  { id: "x", name: "X", domain: "x.com", symbol: "𝕏", profileUrl: (h) => `https://x.com/${encodeURIComponent(h)}` },
  { id: "threads", name: "Threads", domain: "threads.net", symbol: "@", profileUrl: (h) => `https://www.threads.net/@${encodeURIComponent(h)}` },
  { id: "tiktok", name: "TikTok", domain: "tiktok.com", symbol: "♪", profileUrl: (h) => `https://www.tiktok.com/@${encodeURIComponent(h)}` },
  { id: "youtube", name: "YouTube", domain: "youtube.com", symbol: "▶", profileUrl: (h) => `https://www.youtube.com/@${encodeURIComponent(h)}` },
  { id: "linktree", name: "Linktree", domain: "linktr.ee", symbol: "↗", profileUrl: (h) => `https://linktr.ee/${encodeURIComponent(h)}` },
  { id: "linkedin", name: "LinkedIn", domain: "linkedin.com", symbol: "in", profileUrl: (h) => `https://www.linkedin.com/in/${encodeURIComponent(h)}` },
];
