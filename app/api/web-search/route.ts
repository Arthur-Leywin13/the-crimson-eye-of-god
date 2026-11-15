import { NextResponse } from "next/server";

const HANDLE_PATTERN = /^[A-Za-z0-9._-]{2,30}$/;

type BraveResult = {
  title?: string;
  url?: string;
  description?: string;
};

function cleanSnippet(value: string | undefined): string {
  if (!value) return "";
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email hidden]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[number hidden]")
    .slice(0, 320);
}

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

  const input = body as { username?: unknown; authorized?: unknown };
  if (input.authorized !== true) {
    return NextResponse.json(
      { error: "Confirm that this is your account or an audit you are explicitly allowed to perform." },
      { status: 403 },
    );
  }

  if (typeof input.username !== "string") {
    return NextResponse.json({ error: "Enter a valid username." }, { status: 422 });
  }

  const username = input.username.trim().replace(/^@/, "");
  if (!HANDLE_PATTERN.test(username)) {
    return NextResponse.json({ error: "Use a valid 2–30 character username." }, { status: 422 });
  }

  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      query: username,
      results: [],
      message: "Web search is not configured. Add BRAVE_SEARCH_API_KEY to the server environment.",
    });
  }

  try {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", `"${username}"`);
    url.searchParams.set("count", "10");
    url.searchParams.set("country", "HT");
    url.searchParams.set("search_lang", "fr");
    url.searchParams.set("safesearch", "strict");

    const response = await fetch(url, {
      headers: { Accept: "application/json", "X-Subscription-Token": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: response.status === 429 ? "Search limit reached. Try again later." : "The web search provider is temporarily unavailable." },
        { status: response.status === 429 ? 429 : 502 },
      );
    }

    const payload = await response.json();
    const rawResults = (payload?.web?.results ?? []) as BraveResult[];
    const results = rawResults
      .filter((item) => typeof item.title === "string" && typeof item.url === "string")
      .slice(0, 10)
      .map((item) => {
        let domain = "";
        try { domain = new URL(item.url as string).hostname.replace(/^www\./, ""); } catch { /* invalid URL */ }
        return {
          title: (item.title as string).slice(0, 180),
          url: item.url,
          domain,
          snippet: cleanSnippet(item.description),
        };
      });

    return NextResponse.json({
      configured: true,
      query: username,
      results,
      notice: "Search-index results only. A matching username or page is not proof that it belongs to the account owner. Open the original source and verify it yourself.",
    });
  } catch {
    return NextResponse.json({ error: "The web search request timed out or could not be completed." }, { status: 502 });
  }
}
