# Alpha Vantage — Overview

**AlphaVantage.jl** brings the [Alpha Vantage](https://www.alphavantage.co) REST API into Julia. Unlike Yahoo Finance, Alpha Vantage requires a free API key but offers server-side technical indicators and a broad set of macroeconomic series.

## What You Can Download

- **Equities** — intraday, daily, weekly, and monthly OHLC series, plus a latest global quote.
- **Forex** — real-time exchange rates and daily/weekly/monthly FX series for currency pairs.
- **Crypto** — daily and intraday digital-currency prices in a chosen market, plus FCAS ratings.
- **Indicators** — 50+ technical indicators (SMA, EMA, RSI, MACD, VWAP, …) computed by the API.
- **Economic** — macro series: real GDP, CPI, treasury yields, the federal funds rate, and more.

## Typical Workflow

1. Get a free key and store it with **Set API key** (see Authentication).
2. Choose a topic (Equities, Forex, Crypto, Indicators, Economic) and a symbol.
3. Call the matching function, e.g. `time_series_daily("AAPL")`.
4. Inspect or post-process the returned series.

## Alpha Vantage vs Yahoo Finance

- **Alpha Vantage** — needs a key; rate-limited on the free tier; provides server-side indicators and rich economic data.
- **Yahoo Finance** (`YFinance.jl`) — no key; looser limits; great for raw OHLC and options.

Use whichever fits your data needs; the **Compare** link in the Concept Map cross-references the two.
