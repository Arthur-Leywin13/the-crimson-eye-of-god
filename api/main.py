from __future__ import annotations

import re
from urllib.parse import quote

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="The Crimson Eye of God API",
    description="Public-profile URL discovery. No scraping or private-data collection.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

PLATFORMS = {
    "instagram": ("Instagram", "https://www.instagram.com/{handle}/"),
    "telegram": ("Telegram", "https://t.me/{handle}"),
    "facebook": ("Facebook", "https://www.facebook.com/{handle}"),
    "x": ("X", "https://x.com/{handle}"),
    "threads": ("Threads", "https://www.threads.net/@{handle}"),
    "tiktok": ("TikTok", "https://www.tiktok.com/@{handle}"),
    "youtube": ("YouTube", "https://www.youtube.com/@{handle}"),
    "linktree": ("Linktree", "https://linktr.ee/{handle}"),
    "linkedin": ("LinkedIn", "https://www.linkedin.com/in/{handle}"),
}


class SearchRequest(BaseModel):
    username: str = Field(min_length=2, max_length=30)
    platform: str | None = None


def normalize_handle(value: str) -> str:
    handle = value.strip().removeprefix("@")
    if not re.fullmatch(r"[A-Za-z0-9._-]{2,30}", handle):
        raise HTTPException(
            status_code=422,
            detail="Use 2–30 characters: letters, numbers, dots, underscores or hyphens.",
        )
    return handle


def make_variants(handle: str) -> list[str]:
    candidates = [
        handle,
        handle.lower(),
        handle.upper(),
        re.sub(r"[._-]+", "", handle),
        re.sub(r"[._-]+", "_", handle),
        re.sub(r"[._-]+", ".", handle),
        f"{handle}_",
        f"_{handle}",
        f"{handle}.official",
        f"the_{handle}",
    ]
    return list(dict.fromkeys(v for v in candidates if 2 <= len(v) <= 30))[:10]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "crimson-eye-api"}


@app.post("/api/search")
def search(payload: SearchRequest) -> dict:
    handle = normalize_handle(payload.username)
    platform_filter = payload.platform.lower() if payload.platform else None
    if platform_filter and platform_filter not in PLATFORMS:
        raise HTTPException(status_code=404, detail="Unknown platform.")

    selected = (
        {platform_filter: PLATFORMS[platform_filter]}
        if platform_filter
        else PLATFORMS
    )
    results = [
        {
            "platform_id": platform_id,
            "platform": name,
            "username": handle,
            "profile_url": template.format(handle=quote(handle, safe="._-")),
            "status": "link_prepared",
            "verification": "manual_required",
        }
        for platform_id, (name, template) in selected.items()
    ]

    return {
        "query": handle,
        "mode": "platform" if platform_filter else "global",
        "results": results,
        "variants": make_variants(handle),
        "notice": (
            "Candidate profile URLs only. This endpoint does not confirm account "
            "existence or availability and does not scrape profile pages."
        ),
    }
