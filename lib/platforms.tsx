import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaSnapchat,
  FaThreads,
  FaTiktok,
  FaTelegram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { SiLinktree } from "react-icons/si";

export type Platform = {
  id: string;
  name: string;
  domain: string;
  Icon: IconType;
  /** RRules for handles specific to the platform (identical to api/main.py). */
  pattern: RegExp;
  profileUrl: (handle: string) => string;
};

const enc = encodeURIComponent;

export const PLATFORMS: Platform[] = [
  {
    id: "instagram",
    name: "Instagram",
    domain: "instagram.com",
    Icon: FaInstagram,
    pattern: /^[A-Za-z0-9._]{1,30}$/,
    profileUrl: (h) => `https://www.instagram.com/${enc(h)}/`,
  },
  {
    id: "telegram",
    name: "Telegram",
    domain: "t.me",
    Icon: FaTelegram,
    pattern: /^[A-Za-z][A-Za-z0-9_]{4,31}$/,
    profileUrl: (h) => `https://t.me/${enc(h)}`,
  },
  {
    id: "facebook",
    name: "Facebook",
    domain: "facebook.com",
    Icon: FaFacebook,
    pattern: /^[A-Za-z0-9.]{5,50}$/,
    profileUrl: (h) => `https://www.facebook.com/${enc(h)}`,
  },
  {
    id: "x",
    name: "X",
    domain: "x.com",
    Icon: FaXTwitter,
    pattern: /^[A-Za-z0-9_]{1,15}$/,
    profileUrl: (h) => `https://x.com/${enc(h)}`,
  },
  {
    id: "threads",
    name: "Threads",
    domain: "threads.com",
    Icon: FaThreads,
    pattern: /^[A-Za-z0-9._]{1,30}$/,
    profileUrl: (h) => `https://www.threads.com/@${enc(h)}`,
  },
  {
    id: "tiktok",
    name: "TikTok",
    domain: "tiktok.com",
    Icon: FaTiktok,
    pattern: /^[A-Za-z0-9._]{2,24}$/,
    profileUrl: (h) => `https://www.tiktok.com/@${enc(h)}`,
  },
  {
    id: "youtube",
    name: "YouTube",
    domain: "youtube.com",
    Icon: FaYoutube,
    pattern: /^[A-Za-z0-9._-]{3,30}$/,
    profileUrl: (h) => `https://www.youtube.com/@${enc(h)}`,
  },
  {
    id: "linktree",
    name: "Linktree",
    domain: "linktr.ee",
    Icon: SiLinktree,
    pattern: /^[A-Za-z0-9._-]{2,30}$/,
    profileUrl: (h) => `https://linktr.ee/${enc(h)}`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    domain: "linkedin.com",
    Icon: FaLinkedin,
    pattern: /^[A-Za-z0-9-]{3,30}$/,
    profileUrl: (h) => `https://www.linkedin.com/in/${enc(h)}`,
  },
  {
    id: "github",
    name: "GitHub",
    domain: "github.com",
    Icon: FaGithub,
    pattern: /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/,
    profileUrl: (h) => `https://github.com/${enc(h)}`,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    domain: "pinterest.com",
    Icon: FaPinterest,
    pattern: /^[A-Za-z0-9_]{3,30}$/,
    profileUrl: (h) => `https://www.pinterest.com/${enc(h)}/`,
  },
  {
    id: "snapchat",
    name: "Snapchat",
    domain: "snapchat.com",
    Icon: FaSnapchat,
    pattern: /^[A-Za-z][A-Za-z0-9._-]{2,14}$/,
    profileUrl: (h) => `https://www.snapchat.com/add/${enc(h)}`,
  },
];

/** Same general rules as HANDLE_RE in api/main.py. */
export const HANDLE_RE = /^[A-Za-z0-9._-]{2,30}$/;

/** Remove spaces and the initial "@", like the Pydantic validator. */
export function cleanHandle(value: string): string {
  return value.trim().replace(/^@/, "");
}

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

export function isValidFor(platform: Platform, handle: string): boolean {
  return platform.pattern.test(handle);
}