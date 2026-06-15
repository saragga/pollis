# Yahoo Finance — Decision Guide

## Simple vs Log Returns

Both describe the same price move, but they aggregate differently. Choosing the right one keeps your maths exact instead of approximate.

| | Simple return | Log return |
|---|---|---|
| **Definition** | `r_t = P_t / P_(t-1) - 1` | `r_t = log(P_t / P_(t-1))` |
| **Aggregates cleanly** | Across **assets** (a portfolio) | Across **time** (multiple periods) |
| **Combination rule** | Weighted **sum** at one date | **Sum** along the time axis |
| **Best for** | Cross-sectional aggregation | Temporal aggregation |

In YFinance.jl both come from `percentchange`:

```julia
using TimeSeries
simple = percentchange(px, :simple)
logret = percentchange(px, :log)
```

## Cross-Sectional Aggregation → Simple Returns

To combine several assets into a portfolio **at a single date**, use simple returns. A portfolio's one-period simple return is the weighted sum of its holdings' simple returns:

```
r_portfolio = w_1 * r_1 + w_2 * r_2 + ... + w_k * r_k
```

This identity holds **only** for simple returns — log returns are not additive across assets, because the log of a weighted sum is not the weighted sum of logs.

## Temporal Aggregation → Log Returns

To combine returns **across time** for a single asset, use log returns. A multi-period log return is simply the sum of the single-period log returns:

```
r_(0->T) = r_1 + r_2 + ... + r_T      (log returns)
```

Convert back to a cumulative simple return with `exp(sum(logret)) - 1`. Summing simple returns over time is only an approximation and drifts as returns grow.

## Rule of Thumb

- **Aggregating across assets (a portfolio, an index)** → simple returns.
- **Aggregating across time (cumulative, multi-period, annualising)** → log returns.

The **Aggregate Returns** card under *Analyse Returns* demonstrates both on live Yahoo Finance data.

## Other Choices

- **`adjclose` vs `close`** — use `adjclose` for any return calculation; it removes dividend and split jumps. Use raw `close` only when you need the unadjusted print.
- **`range` vs `startdt`/`enddt`** — use `range` for a rolling lookback, explicit dates for a fixed window.
- **Sink type** — `OrderedDict` for raw access; `TimeArray` for time-indexed analysis and Tables.jl interop.
