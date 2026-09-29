# Overview

**FredData.jl** brings the [FRED](https://fred.stlouisfed.org) API into Julia. FRED, maintained by the Federal Reserve Bank of St. Louis, aggregates 800,000+ economic time series from national and international sources. Each series has a short **series ID** (e.g. `GDPC1`, `UNRATE`, `CPIAUCSL`); you download it by that ID.

## What You Can Download

- **Output & Growth** — real and nominal GDP, industrial production, and other activity series.
- **Inflation & Prices** — the Consumer Price Index, core CPI, and the PCE price index.
- **Labour Market** — the unemployment rate, nonfarm payrolls, participation, and jobless claims.
- **Interest Rates** — the federal funds rate, treasury yields, the yield curve, and mortgage rates.
- **Money & Exchange** — the M2 money stock and bilateral exchange rates.

## Typical Workflow

1. Get a free key and store it with **Set API key** (see Authentication).
2. Find the series ID you want on the FRED site (see Finding Series).
3. Create a client: `f = Fred()`.
4. Download the series: `get_data(f, "GDPC1")`.
5. Read `.data` (a `DataFrame` of `date` / `value`) or apply a units transform.

## A Minimal Example

```julia
using FredData

f = Fred()
gdp = get_data(f, "GDPC1")   # real GDP, quarterly
println(gdp.data)
```

## FRED vs Alpha Vantage

- **FRED** (`FredData.jl`) — the canonical source for U.S. macroeconomic series, with revision history (vintages) and rich units transforms.
- **Alpha Vantage** (`AlphaVantage.jl`) — market data (equities, FX, crypto) plus a smaller set of economic indicators.

Use whichever fits your data needs; the **Compare** link in the Concept Map cross-references the two.

## See Also
- [Factsheet](factsheet.md) · [Authentication](authentication.md) · [Finding Series](finding-series.md)
