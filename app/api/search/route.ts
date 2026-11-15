import { NextResponse } from "next/server";
import { PLATFORMS } from "@/lib/platforms";
import { makeVariants } from "@/lib/variants";

const HANDLE_PATTERN = /^[A-Za-z0-9._-]{2,30}$/;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "A JSON object is required." }, { status: 400 });
  }

  const input = body as { username?: unknown; platform?: unknown; authorized?: unknown };

  if (input.authorized !== true) {
    return NextResponse.json(
      { error: "Confirm that you own this account or have explicit permission to audit it." },
      { status: 403 },
    );
  }

  if (typeof input.username !== "string") {
    return NextResponse.json({ error: "Enter a valid username." }, { status: 422 });
  }

  const username = input.username.trim().replace(/^@/, "");
  if (!HANDLE_PATTERN.test(username)) {
    return NextResponse.json(
      { error: "Use 2–30 characters: letters, numbers, dots, underscores or hyphens." },
      { status: 422 },
    );
  }

  let selected = PLATFORMS;
  if (input.platform !== undefined && input.platform !== null && input.platform !== "") {
    if (typeof input.platform !== "string") {
      return NextResponse.json({ error: "Invalid platform." }, { status: 422 });
    }
    const platform = PLATFORMS.find((item) => item.id === input.platform);
    if (!platform) {
      return NextResponse.json({ error: "Unknown platform." }, { status: 404 });
    }
    selected = [platform];
  }

  let githubProfile: Record<string, unknown> | null = null;
  let githubStatus: "exact_match" | "not_found" | "unavailable" = "unavailable";
  if (selected.some((platform) => platform.id === "github")) {
    try {
      const githubResponse = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
        cache: "no-store",
      });
      if (githubResponse.ok) {
        const profile = await githubResponse.json();
        githubProfile = {
          login: profile.login,
          name: profile.name,
          avatar_url: profile.avatar_url,
          html_url: profile.html_url,
          bio: profile.bio,
          blog: profile.blog,
          company: profile.company,
          public_repos: profile.public_repos,
          followers: profile.followers,
          following: profile.following,
        };
        githubStatus = profile.login?.toLowerCase() === username.toLowerCase() ? "exact_match" : "unavailable";
      } else if (githubResponse.status === 404) {
        githubStatus = "not_found";
      }
    } catch {
      githubStatus = "unavailable";
    }
  }

  return NextResponse.json({
    query: username,
    mode: selected.length === 1 ? "platform" : "global",
    results: selected.map((platform) => ({
      platform_id: platform.id,
      platform: platform.name,
      username,
      profile_url: platform.profileUrl(username),
      status: platform.id === "github" ? githubStatus : "link_prepared",
      verification: platform.id === "github" ? githubStatus : "manual_required",
      profile: platform.id === "github" ? githubProfile : null,
    })),
    variants: makeVariants(username),
    notice: "Candidate profile URLs only. Account existence and availability are not verified.",
  });
}
