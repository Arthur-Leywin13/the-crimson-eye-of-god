<div align="center">

# The Crimson Eye of God

**A privacy-conscious OSINT web workspace for discovering publicly accessible username profiles across social platforms.**

[![License: MIT](https://img.shields.io/github/license/USER/REPO?color=9b2335&style=flat-square)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/USER/REPO?color=9b2335&style=flat-square)](https://github.com/USER/REPO/commits)
[![Stars](https://img.shields.io/github/stars/USER/REPO?color=9b2335&style=flat-square)](https://github.com/USER/REPO/stargazers)
[![Issues](https://img.shields.io/github/issues/USER/REPO?color=9b2335&style=flat-square)](https://github.com/USER/REPO/issues)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-9b2335?style=flat-square)](https://github.com/USER/REPO/pulls)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)

</div>

> **Public sources only.** No login bypass, private-data collection, CAPTCHA bypass, stealth scraping, or claims of account availability based on ambiguous HTTP responses.

## Features

- **Authorized self-audit search** across Instagram, Telegram, Facebook, X, Threads, TikTok, YouTube, Linktree, LinkedIn and GitHub.
- **Platform explorer** with per-platform filtering.
- **Validated search endpoint** (`POST /api/search`) with authorization confirmation, handle validation and clear error responses.
- **Username variants** generation.
- **Results page** with platform cards and a selected-result detail panel.
- **GitHub enrichment**: public avatar and basic profile fields via GitHub's official public API.
- **Public web search** powered by the Tavily Search API: indexed page titles, short snippets and original source links (no page scraping, no identity matching).
- **Honest status labels**: *Link prepared / manual verification required*. An error, redirect, login wall or anti-bot challenge is never treated as proof that a username is available.
- **Ash-grey "Light Intelligence" interface** with muted crimson accents.

## Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | Next.js (App Router), React, TypeScript, CSS    |
| API      | Python + FastAPI (optional standalone service)  |

## Getting started

### Frontend

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Standalone API

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## How search works

The frontend submits searches to its own `/api/search` route, which prepares candidate links and username variants.

- **GitHub only**: the official public user endpoint is queried to retrieve an exact username match, avatar and basic public profile fields.
- **Other platforms**: not scraped. They remain unverified candidate links.
- **Public web search**: a separate, manual search through `POST /api/web-search`. It returns search-index titles, short snippets and source URLs only. It does not crawl pages or establish that results belong to the same person.

### FastAPI endpoints

| Method | Route            | Description                                                      |
| ------ | ---------------- | ---------------------------------------------------------------- |
| GET    | `/health`        | Service health check                                             |
| GET    | `/api/platforms` | List of supported platforms (`id`, `name`)                       |
| POST   | `/api/search`    | Candidate profile URLs, username variants and skipped platforms  |

Each platform applies its own username rules. Platforms where the username is invalid are listed in the `skipped` field instead of getting a link. Set `CORS_ORIGINS` (comma-separated) to allow origins other than `http://localhost:3000`.

## Configure public web search

Create a Tavily API key in the Tavily dashboard, then add it as a server-side environment variable:

```env
TAVILY_API_KEY=your_key_here
```

Do not commit the key, expose it in frontend code, or paste it in public issues. Without this variable, the public web search panel shows a setup message and the rest of the app keeps working. See the [Tavily Search API docs](https://docs.tavily.com/documentation/api-reference/endpoint/search).

## Google AdSense

The app includes optional AdSense placements on the home and results pages. Ads remain hidden until the publisher ID and the corresponding ad-unit slot IDs are configured.

1. Create and verify your site in [Google AdSense](https://adsense.google.com/).
2. After Google approves the site, create two responsive display ad units (home and results) and copy their slot IDs.
3. Set the following environment variables in your hosting provider (and locally in `.env.local`):
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID` — publisher ID, in the `ca-pub-...` format.
   - `NEXT_PUBLIC_ADSENSE_HOME_SLOT` — home-page ad unit slot ID.
   - `NEXT_PUBLIC_ADSENSE_RESULTS_SLOT` — results-page ad unit slot ID.
4. Redeploy the site. Do not commit real publisher or slot values to the repository.

See `.env.example` for the variable names. The integration does not bypass Google's site review or guarantee that ads will be served; the site must comply with AdSense policies and have the required privacy disclosures/consent setup for its audience.

## Responsible use

The interface requires the user to confirm that they own the account or have explicit permission to audit it. The FastAPI endpoint independently enforces the same flag and returns **HTTP 403** when it is absent.

This is an accountability safeguard, not identity verification: it cannot prove ownership. Use the tool only for your own accounts or a clearly authorized audit.

## Platform limitations

Each platform has its own rules and technical restrictions. This MVP generates profile links and variants only. GitHub profile details come from its official public API; nothing is scraped from other platforms. Future connectors must use official APIs or explicitly permitted public interfaces, respect rate limits and terms, and expose uncertainty rather than guess.

## Project structure

```
app/               Next.js pages and styles
lib/               Platform catalogue and username variants
api/               FastAPI service
requirements.txt   Python dependencies
```


## License

This project is licensed under the GNU General Public License v3.0, see [LICENSE](LICENSE).