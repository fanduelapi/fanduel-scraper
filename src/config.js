// Generated: endpoints this actor can read.
export default {
  "name": "fanduel-scraper",
  "base": "https://fanduelapi.com",
  "env": "FANDUEL_API_KEY",
  "endpoints": {
    "props": {
      "path": "/api/v1/props",
      "label": "Player props (key)",
      "league": "league"
    },
    "odds": {
      "path": "/api/v1/odds",
      "label": "Game lines: moneyline, spread, total (key)",
      "league": "league"
    },
    "changes": {
      "path": "/api/v1/changes",
      "label": "Change feed: every line move (key)",
      "league": "league"
    },
    "futures": {
      "path": "/api/v1/futures",
      "label": "Futures (key)",
      "league": "league"
    },
    "ev": {
      "path": "/api/v1/ev",
      "label": "+EV prices (key)",
      "league": "league"
    },
    "arbitrage": {
      "path": "/api/v1/arbitrage",
      "label": "Arbitrage pairs (key)",
      "league": "league"
    },
    "sample": {
      "mcpTool": "get_sample_props",
      "label": "Sample props, no key (up to 10 real props, delayed)",
      "league": "sport",
      "keyless": true
    }
  },
  "defaultEndpoint": "props",
  "noKey": "sample",
  "noKeyNote": "Without a key this actor returns up to 10 real FanDuel props, delayed like the free plan. Add a free key for the full board.",
  "free": "no card",
  "signupUrl": "https://fanduelapi.com/sign-up?utm_source=apify&utm_medium=actor&utm_campaign=fanduel-scraper",
  "leagueDefault": "nba"
};
