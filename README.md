# FanDuel Scraper (player props, odds, line moves)

An Apify actor that saves FanDuel Sportsbook player props, game lines, futures, line moves, +EV and arbitrage to an Apify dataset (JSON, CSV, Excel) on a schedule or on demand.

It does not scrape FanDuel pages. It reads the documented [fanduelapi.com](https://fanduelapi.com/?utm_source=apify&utm_medium=actor&utm_campaign=fanduel-scraper) API with your own key, so
runs are fast, rows have a stable schema and nothing breaks when the FanDuel site changes. Without a key this actor returns up to 10 real FanDuel props, delayed like the free plan. Add a free key for the full board.

fanduelapi.com is an independent data service operated by Stunning Couches LLC. It is not affiliated with or endorsed by
FanDuel.

## Quick start

1. Get a free key (no card): https://fanduelapi.com/sign-up?utm_source=apify&utm_medium=actor&utm_campaign=fanduel-scraper
2. Run the actor with `apiKey` set, pick what to read, and set `league`.
3. Download the dataset or connect it to Sheets, Zapier, Make or a webhook.

## What it can read

| `endpoint` | Rows |
| --- | --- |
| `props` | Player props (key) |
| `odds` | Game lines: moneyline, spread, total (key) |
| `changes` | Change feed: every line move (key) |
| `futures` | Futures (key) |
| `ev` | +EV prices (key) |
| `arbitrage` | Arbitrage pairs (key) |
| `sample` | Sample props, no key (up to 10 real props, delayed) |

## Input

| Field | Default | Notes |
| --- | --- | --- |
| `apiKey` | empty | Stored as a secret. Empty means the keyless feed. You can also set `FANDUEL_API_KEY` in the actor environment. |
| `endpoint` | `props` | See the table above. |
| `league` | `nba` | |
| `limit` | 100 | Rows per page. |
| `maxPages` | 1 | Pages followed by cursor. Each page spends credits on your own fanduelapi.com plan. |
| `maxItems` | none | Stop after this many rows. |
| `extraParams` | `{}` | Any other query parameter from the [docs](https://fanduelapi.com/docs?utm_source=apify&utm_medium=actor&utm_campaign=fanduel-scraper). |

Each row is the API's own JSON row plus `_endpoint` and `_source`.

## Costs

Apify compute for a one-page run is a few seconds. API usage is billed by fanduelapi.com on your own plan: the free tier
covers small scheduled runs, and [paid plans](https://fanduelapi.com/pricing?utm_source=apify&utm_medium=actor&utm_campaign=fanduel-scraper) raise the limits. Credit costs per call:
https://fanduelapi.com/api/v1/credit-costs

## Prefer code?

The same data is in the official packages: [Python](https://github.com/fanduelapi/fanduelapi-python),
[JavaScript](https://github.com/fanduelapi/fanduelapi-js) and an [MCP server](https://github.com/fanduelapi/fanduelapi-mcp) for AI agents.

## Develop

```bash
npm install
npm test                      # no network
APIFY_LOCAL_STORAGE_DIR=./storage FANDUEL_API_KEY=... npm start
```

MIT License.
