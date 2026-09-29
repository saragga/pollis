# Interpretation

How to read the data YFinance.jl returns.

## Price Bars

`get_prices` returns an `OrderedDict` with these keys:

| Key | Meaning |
|---|---|
| `ticker` | The resolved symbol |
| `timestamp` | `Vector{DateTime}`, one entry per bar |
| `open`, `high`, `low`, `close` | Raw OHLC prices |
| `adjclose` | Close adjusted for dividends and splits |
| `vol` | Trading volume |

Use **`adjclose`** for return and performance calculations — it removes the artificial jumps caused by dividends and splits. Use raw `close` only when you specifically need the unadjusted print.

## Quote Summary

`get_quoteSummary` returns a nested JSON object with many modules (profile, key statistics, calendar, earnings). Request a single module with `item="quoteType"`, or use the helpers `get_calendar_events`, `get_earnings_estimates`, and `get_eps`.

## Fundamentals

`get_Fundamental(symbol, item, interval, startdt, enddt)` returns one column per line item plus a `timestamp` column of period-end dates. The `item` is either a whole statement (`"income_statement"`, `"balance_sheet"`, `"cash_flow"`, `"valuation"`) or a single sub-item. Values are reported figures, so compare like-for-like periods (annual vs annual).

## Options Chain

`get_Options` returns a dict with `"calls"` and `"puts"`, each a dict of column vectors aligned by row: `strike`, `lastPrice`, `bid`, `ask`, `volume`, `openInterest`, and the `contractSymbol`. High `openInterest` indicates a liquid contract.

## Search and News

`get_symbols` returns candidate tickers for a name; `get_all_symbols(exchange)` lists every symbol on an exchange. `search_news` returns a news collection — read it with `titles`, `links`, and `timestamps`.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
