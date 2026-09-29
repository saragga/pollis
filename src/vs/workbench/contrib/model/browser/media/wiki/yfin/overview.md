# Overview

**YFinance.jl** brings Yahoo Finance market data into Julia. It mirrors the design of Python's `yahooquery` by reading Yahoo's JSON API endpoints, which avoids the decryption issues present in some other clients.

## What You Can Download

- **Prices** — historical and intraday OHLC bars for stocks, ETFs, mutual funds, FX, futures, and crypto. Includes adjusted close, volume, and optional dividend/split adjustment.
- **Quote summary** — company profile, key statistics, calendar events, and earnings estimates.
- **Fundamentals** — income statement, balance sheet, cash flow, and valuation multiples at annual or quarterly frequency.
- **Options** — the full chain of calls and puts with strikes, last prices, and open interest.
- **Search** — resolve ticker symbols from a company name, list an exchange, and fetch recent news.

## Working with the Results

Most functions return an `OrderedDict` whose values are column vectors (e.g. `prices["close"]`). For time-indexed work, sink prices directly into a `TimeArray`:

```julia
using YFinance, TimeSeries
ta = get_prices(TimeArray, "AAPL"; range="1y", interval="1d")
```

A `TimeArray` implements the **Tables.jl** interface, so it interoperates with the wider Julia data ecosystem (iterate rows, collect columns, plot with recipes).

## Typical Workflow

1. Choose a symbol and a `range`/`interval` (see Constraints for valid values).
2. Download prices or another data type.
3. Sink into a `TimeArray` and compute returns, moving averages, or statistics.
4. Plot or compare across tickers.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Constraints](constraints.md)
