# Yahoo Finance — Diagnostics

Common problems when downloading from Yahoo Finance and how to recognise them.

## Empty or Truncated Results

**Symptom:** `get_prices` returns very few bars or empty vectors.

- The `interval` is too fine for the requested `range` (intraday bars are only kept for recent windows).
- The `startdt`/`enddt` window predates the security's listing.
- The market was closed for the whole window (e.g. a single non-trading day).

Check `length(prices["timestamp"])` before using the data.

## Invalid or Delisted Symbols

**Symptom:** an error or empty response for a symbol you expect to work.

- Confirm the Yahoo symbol with `get_symbols("company name")` — non-US tickers need an exchange suffix (`"RR.L"`, `"BMW.DE"`).
- Delisted or renamed tickers no longer resolve.

## Throttling

**Symptom:** intermittent failures during bulk downloads.

Yahoo rate-limits rapid access. Space out requests, cache what you reuse, and avoid downloading hundreds of symbols in a tight loop. Configure a proxy if you must scale up.

## Time-Zone Confusion

**Symptom:** timestamps look shifted by several hours.

Prices default to exchange-local time. Pass `exchange_local_time=false` to convert to the user's local time, and remember FX/crypto trade continuously so their "daily" bars straddle time zones.

## Missing Fundamental Items

**Symptom:** a `KeyError` when indexing a statement item.

Available line items differ by company and statement. Inspect `keys(result)` first, then index the items that are present.
