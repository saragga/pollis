# Constraints

## API Key Required

Every request needs a free API key (see Authentication). Without one, calls fail with an authentication error.

## Free-Tier Rate Limits

The free tier is rate-limited — historically around **25 requests per day** and **5 requests per minute** (Alpha Vantage adjusts these; check their site for current values). For heavier use, Alpha Vantage offers paid plans with higher limits.

- Space out requests; avoid tight loops over many symbols.
- Cache results you reuse rather than re-downloading.
- A rate-limit response is a JSON note rather than an error — inspect the returned value if it looks unexpected.

## Premium Endpoints

Some endpoints require **premium** API access. Calling one with a free key raises a `PremiumEndpointError` with a descriptive message. The Diagnostics page lists how to recognise this.

## Valid Intervals and Arguments

| Argument | Valid values |
|---|---|
| `interval` (intraday) | `"1min"`, `"5min"`, `"15min"`, `"30min"`, `"60min"` |
| `interval` (indicators / economic) | `"daily"`, `"weekly"`, `"monthly"` (and `"annual"`/`"quarterly"` for some macro series) |
| `outputsize` | `"compact"` (latest 100 points) or `"full"` (20+ years) |
| `series_type` | `"close"`, `"open"`, `"high"`, `"low"` |

## Symbol Formats

- Equities: plain ticker, e.g. `"AAPL"`, `"MSFT"`, `"SPY"`.
- Forex: two ISO currency codes, e.g. `currency_exchange_rate("USD", "EUR")`.
- Crypto: coin + market, e.g. `digital_currency_daily("BTC", "USD")`.

## See Also
- [Authentication](authentication.md) · [Diagnostics](diagnostics.md) · [Factsheet](factsheet.md)
