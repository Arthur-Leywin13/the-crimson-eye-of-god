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

  return NextResponse.json({
    query: username,
    mode: selected.length === 1 ? "platform" : "global",
    results: selected.map((platform) => ({
      platform_id: platform.id,
      platform: platform.name,
      username,
      profile_url: platform.profileUrl(username),
      status: "link_prepared",
      verification: "manual_required",
    })),
    variants: makeVariants(username),
    notice: "Candidate profile URLs only. Account existence and availability are not verified.",
  });
}
