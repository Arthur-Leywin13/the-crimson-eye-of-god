# The Crimson Eye of God

A privacy-conscious OSINT web workspace for discovering **publicly accessible username profiles** across social platforms.

> Public sources only. No login bypass, private-data collection, CAPTCHA bypass, stealth scraping, or claims of account availability based on ambiguous HTTP responses.

## Current MVP

- Authorized self-audit search catalogue across Instagram, Telegram, Facebook, X, Threads, TikTok, YouTube, Linktree, LinkedIn and GitHub.
- Platform explorer with per-platform filtering.
- Validated Next.js search endpoint (`POST /api/search`) used by the interface, with authorization confirmation, handle validation and clear error responses.
- Username variant generation.
- Dedicated results page with platform cards and a selected-result detail panel.
- GitHub public avatar and basic profile fields retrieved through GitHub's official public API.
- Public Web Search section powered by Brave Search API, showing indexed page titles, short snippets and original source links (no page scraping or identity matching).
- Direct links to public profile routes.
- Clear status labels: **Link prepared / manual verification required**. A profile URL returning an error, redirect, login wall or anti-bot challenge is not treated as proof that a username is available.
- Ash-grey premium Light Intelligence interface with muted crimson accents.

## Stack

- Frontend: Next.js App Router, React, TypeScript, CSS
- API: Python + FastAPI (optional standalone service)

## Run the frontend

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Search endpoint

The frontend submits searches to its own `/api/search` route. It prepares candidate links and username variants. The results page also offers a separate, manual public-web-index search through `POST /api/web-search`. For GitHub only, it queries the official public user endpoint to retrieve an exact username match, avatar and basic public profile fields. Other platforms are not scraped and remain unverified candidate links. The web search route uses Brave Search API and requires the server-side `BRAVE_SEARCH_API_KEY` environment variable. It returns search-index titles, short snippets and source URLs only; it does not crawl pages or establish that results belong to the same person. The standalone FastAPI service remains available for integrations and local API testing.

## Configure public web search

Create a Brave Search API key in the Brave Search API dashboard, then add it as a server-side environment variable:

```env
BRAVE_SEARCH_API_KEY=your_key_here
```

Do not commit the key, expose it in frontend code, or paste it into public issues. Without this variable, the public web search panel displays a setup message and the rest of the app continues to work. Brave API documentation: https://api-dashboard.search.brave.com/app/documentation/web-search.

## Run the API

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Responsible-use gate

The interface requires the user to confirm that they own the account or have explicit permission to audit it. The FastAPI endpoint independently enforces the same authorization flag and returns HTTP 403 when it is absent. This is an accountability safeguard, not identity verification; it cannot prove that a user owns an account. Use the tool only for your own accounts or a clearly authorized audit.

## Platform limitations

Each platform has different rules and technical restrictions. This MVP generates profile links and variants. GitHub profile details are retrieved through its official public API; profile photos and details are not scraped from other platforms. Future connectors must use official APIs or explicitly permitted public interfaces, respect rate limits and terms, and expose uncertainty rather than guessing.

## Project structure

```
app/              Next.js pages and styles
lib/              Platform catalogue and username variants
api/              FastAPI service
requirements.txt  Python dependencies
```

## License

MIT — see [LICENSE](LICENSE).
