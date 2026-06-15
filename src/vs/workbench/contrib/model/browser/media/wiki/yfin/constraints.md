# Yahoo Finance — Constraints

## Terms of Use

Yahoo!, Y!Finance, and Yahoo! Finance are registered trademarks of Yahoo, Inc. **YFinance.jl is not endorsed by or affiliated with Yahoo.** The data retrieved may be used for **personal use only** — review Yahoo's Developer API Terms of Use and Terms of Service before relying on it.

## Valid Ranges and Intervals

`get_prices` accepts a `range` **or** an explicit `startdt`/`enddt`, plus an `interval`:

| Argument | Valid values |
|---|---|
| `range` | `"1d"`, `"5d"`, `"1mo"`, `"3mo"`, `"6mo"`, `"1y"`, `"2y"`, `"5y"`, `"10y"`, `"ytd"`, `"max"` |
| `interval` | `"1m"`, `"2m"`, `"5m"`, `"15m"`, `"30m"`, `"60m"`, `"90m"`, `"1h"`, `"1d"`, `"5d"`, `"1wk"`, `"1mo"`, `"3mo"` |

Intraday intervals (minutes/hours) are only available for **recent** windows — Yahoo limits how far back fine-grained bars go. Combining a very long `range` with a tiny `interval` returns an empty or truncated result.

## Symbol Formats

Symbols follow Yahoo's conventions:

- Equities: plain ticker, e.g. `"AAPL"`, `"MSFT"`.
- Non-US listings: suffix with the exchange, e.g. `"RR.L"` (London), `"BMW.DE"` (Frankfurt).
- FX pairs: `"EURUSD=X"`. Futures: `"CL=F"`. Crypto: `"BTC-USD"`.

## Rate Limits and Etiquette

Yahoo throttles heavy or rapid access from a single host. Cache results you reuse, avoid tight loops over many symbols, and add delays when downloading in bulk. A proxy can be configured when needed (see the package docs).

## Time Zones

By default timestamps are returned in exchange-local time. Pass `exchange_local_time=false` to receive them in the user's local time instead.
