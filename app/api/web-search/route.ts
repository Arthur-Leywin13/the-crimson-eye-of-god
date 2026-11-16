import { NextResponse } from "next/server";

const HANDLE_PATTERN = /^[A-Za-z0-9._-]{2,30}$/;

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
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

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      query: username,
      results: [],
      message: "Web search is not configured. Add TAVILY_API_KEY to the server environment.",
    });
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: \`Bearer \${apiKey}\`,
      },
      body: JSON.stringify({
        query: \`"\${username}"\`,
        search_depth: "basic",
        topic: "general",
        max_results: 10,
        include_answer: false,
        include_raw_content: false,
        include_images: false,
        country: "haiti",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: response.status === 429 ? "Search limit reached. Try again later." : "The web search provider is temporarily unavailable." },
        { status: response.status === 429 ? 429 : 502 },
      );
    }

    const payload = await response.json();
    const rawResults = (payload?.results ?? []) as TavilyResult[];
    const results = rawResults
      .filter((item) => typeof item.title === "string" && typeof item.url === "string")
      .slice(0, 10)
      .flatMap((item) => {
        try {
          const parsedUrl = new URL(item.url as string);
          if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") return [];
          return [{
            title: (item.title as string).slice(0, 180),
            url: parsedUrl.toString(),
            domain: parsedUrl.hostname.replace(/^www\./, ""),
            snippet: cleanSnippet(item.content),
          }];
        } catch {
          return [];
        }
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
