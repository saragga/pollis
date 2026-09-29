# FRED — Factsheet

**FredData.jl** is a Julia interface to the [FRED](https://fred.stlouisfed.org) (Federal Reserve Economic Data) API maintained by the Federal Reserve Bank of St. Louis, which hosts 800,000+ U.S. and international economic time series.

| | |
|---|---|
| **Purpose** | Download FRED macroeconomic time series into Julia by series ID |
| **Auth** | Free API key required (see the Authentication page) |
| **Core package** | [FredData.jl](https://github.com/micahjsmith/FredData.jl) |
| **Key env var** | `FRED_API_KEY` |
| **Data covered** | Output, inflation, the labour market, interest rates, money, and exchange rates |

## Key Functions

| Function | Task |
|---|---|
| `Fred()` | Create a client (reads `FRED_API_KEY` or `~/.freddatarc`) |
| `Fred(key)` | Create a client with an explicit key |
| `get_data(f, "GDPC1")` | Download a series by its FRED ID |
| `get_data(f, id; units="pc1")` | Apply a units transform (see below) |
| `get_data(f, id; frequency="q")` | Resample to a coarser frequency |
| `get_data(f, id; vintage_dates="…")` | Fetch a real-time vintage (ALFRED) |

## `get_data` Keywords

| Keyword | Meaning |
|---|---|
| `observation_start` / `observation_end` | Date range, `"YYYY-MM-DD"` |
| `units` | `lin`, `chg`, `ch1`, `pch`, `pc1`, `pca`, `log` |
| `frequency` | `d`, `w`, `m`, `q`, `a`, … (resample) |
| `aggregation_method` | `avg`, `sum`, `eop` (with `frequency`) |
| `vintage_dates` | Real-time snapshots for revision studies |

## The Result

`get_data` returns a `FredSeries`. Its `.data` field is a `DataFrame` with `date` and `value` columns; metadata fields such as `title`, `units`, `frequency`, and `seasonal_adjustment` describe the series.

> **API key.** Use the **Set API key** link above the page to store your free key securely in VS Code Secret Storage. It is injected into the Julia REPL session as `ENV["FRED_API_KEY"]` and never written to a saved file.

## See Also
- [Overview](overview.md) · [Finding Series](finding-series.md) · [Transformations](transformations.md)
