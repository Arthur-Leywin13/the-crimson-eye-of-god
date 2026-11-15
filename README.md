# The Crimson Eye of God

A privacy-conscious OSINT web workspace for discovering **publicly accessible username profiles** across social platforms.

> Public sources only. No login bypass, private-data collection, CAPTCHA bypass, stealth scraping, or claims of account availability based on ambiguous HTTP responses.

## Current MVP

- Authorized self-audit search catalogue across Instagram, Telegram, Facebook, X, Threads, TikTok, YouTube, Linktree and LinkedIn.
- Platform explorer with per-platform filtering.
- Username variant generation.
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

Each platform has different rules and technical restrictions. This MVP generates profile links and variants; it does not scrape pages or download profile photos. Future connectors must use official APIs or explicitly permitted public interfaces, respect rate limits and terms, and expose uncertainty rather than guessing.

## Project structure

```
app/              Next.js pages and styles
lib/              Platform catalogue and username variants
api/              FastAPI service
requirements.txt  Python dependencies
```

## License

MIT — see [LICENSE](LICENSE).
