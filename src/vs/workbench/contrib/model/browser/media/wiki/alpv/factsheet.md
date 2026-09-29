# Alpha Vantage — Factsheet

**AlphaVantage.jl** is a Julia wrapper for the [Alpha Vantage](https://www.alphavantage.co) API, which provides realtime and historical data for equities, forex, cryptocurrencies, 50+ technical indicators, and macroeconomic series.

| | |
|---|---|
| **Purpose** | Download market and economic data from Alpha Vantage into Julia |
| **Auth** | Free API key required (see the Authentication page) |
| **Core package** | [AlphaVantage.jl](https://github.com/ellisvalentiner/AlphaVantage.jl) |
| **Key env var** | `ALPHA_VANTAGE_API_KEY` |
| **Data covered** | Equities, forex, crypto, technical indicators, economic indicators |

## Key Functions

| Function | Task |
|---|---|
| `time_series_daily(sym)` / `_intraday` / `_weekly` / `_monthly` | Equity OHLC series |
| `stock_quote(sym)` | Latest global quote |
| `currency_exchange_rate(from, to)` | Real-time FX rate |
| `fx_daily(from, to)` | Daily FX series |
| `digital_currency_daily(sym, market)` | Daily crypto prices |
| `SMA`, `EMA`, `RSI`, `MACD`, `VWAP`, … | Technical indicators (server-side) |
| `real_gdp`, `cpi`, `treasury_yield`, `federal_fund_rate` | Economic indicators |

## When to Use
- Pulling equity, FX, or crypto series into Julia for analysis.
- Computing technical indicators without implementing them yourself.
- Reading macroeconomic series (GDP, CPI, yields, policy rates).

> **API key.** Use the **Set API key** link above the page to store your free key securely in VS Code Secret Storage. It is injected into the Julia REPL session as `ENV["ALPHA_VANTAGE_API_KEY"]` and never written to a saved file.

## See Also
- [Overview](overview.md) · [Authentication](authentication.md) · [Interpretation](interpretation.md)
