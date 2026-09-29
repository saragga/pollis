# Yahoo Finance — Factsheet

**YFinance.jl** is a Julia interface to Yahoo Finance, inspired by Python's `yfinance`. It accesses Yahoo's public JSON API endpoints directly, so no API key or decryption step is required.

| | |
|---|---|
| **Purpose** | Download prices, fundamentals, options, and news from Yahoo Finance |
| **Output** | `OrderedDict` of column vectors; sinks to `TimeArray` (and others) |
| **Core package** | [YFinance.jl](https://github.com/eohne/YFinance.jl) |
| **Companions** | [TimeSeries.jl](https://github.com/JuliaStats/TimeSeries.jl) (TimeArray), [Tables.jl](https://github.com/JuliaData/Tables.jl) |
| **Data covered** | Stocks, ETFs, mutual funds, FX, futures, and crypto |

## Key Functions

| Function | Task |
|---|---|
| `get_prices(symbol; range, interval)` | Historical and intraday OHLC bars |
| `get_prices(TimeArray, symbol; ...)` | Sink prices straight into a `TimeArray` |
| `get_dividends`, `get_splits` | Corporate-action history |
| `get_quoteSummary(symbol; item)` | Profile, statistics, calendar, estimates |
| `get_Fundamental(symbol, item, interval, startdt, enddt)` | Income, balance sheet, cash flow, valuation |
| `get_Options(symbol)` | Options chain (`"calls"` and `"puts"`) |
| `get_symbols`, `get_all_symbols` | Resolve tickers; list an exchange |
| `search_news(query)` | Recent news headlines and links |

## When to Use
- Pulling market data into Julia for charting, returns, or back-tests.
- Reading company fundamentals and valuation multiples over time.
- Inspecting an options chain or scanning recent news for a ticker.

> **Personal use only.** Yahoo's data may be used for personal use only — see the Constraints page and Yahoo's terms of service.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
