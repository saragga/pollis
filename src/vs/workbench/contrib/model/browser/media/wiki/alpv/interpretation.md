# Interpretation

How to read the data AlphaVantage.jl returns.

## Time Series (Equities, Forex, Crypto)

Functions like `time_series_daily`, `fx_daily`, and `digital_currency_daily` return the parsed API response: timestamps paired with OHLC (and volume) values. Newest observations are typically first. Use `outputsize="full"` for the complete history and `"compact"` for the latest 100 points.

For equities, `time_series_daily_adjusted` adds an **adjusted close** that accounts for splits and dividends — prefer it for return calculations.

## Global Quote

`stock_quote(sym)` returns a single snapshot: latest price, change, percent change, and volume. Use it for a quick read rather than a series.

## Technical Indicators

Indicator functions (`SMA`, `EMA`, `RSI`, `MACD`, `VWAP`, …) are computed **by Alpha Vantage**, so you receive the indicator series directly — no need to implement it. Key arguments:

- `interval` — the bar size the indicator runs on (`"daily"`, `"weekly"`, `"60min"`, …).
- `time_period` — the look-back window (e.g. 20 for SMA(20)).
- `series_type` — which price the indicator uses (`"close"` is typical).

## Economic Indicators

`real_gdp`, `cpi`, `treasury_yield`, and `federal_fund_rate` return macro series with a date and a value per period. `interval` selects the frequency (`"annual"`, `"quarterly"`, `"monthly"`), and some accept extra arguments (e.g. `maturity="10year"` for `treasury_yield`).

## A Note on Types

AlphaVantage.jl returns the parsed response as Julia values you can index and iterate. Convert to your preferred tabular type for analysis; avoid `DataFrames.jl` in favour of lighter table interfaces if you only need iteration.

## See Also
- [Diagnostics](diagnostics.md) · [Factsheet](factsheet.md) · [Overview](overview.md)
