# FRED — Interpretation

`get_data` returns a `FredSeries`. This page explains its fields and a few economic conventions worth knowing before you read the numbers.

## The `FredSeries` Object

```julia
s = get_data(f, "UNRATE")

s.id                  # "UNRATE"
s.title               # "Unemployment Rate"
s.units               # "Percent"
s.frequency           # "Monthly"
s.seasonal_adjustment # "Seasonally Adjusted"
s.observation_start   # first date available
s.last_updated        # when FRED last revised it
s.notes               # source notes and definitions
s.data                # DataFrame: date, value (+ realtime columns)
```

Most analysis works off `s.data`, a `DataFrame` with a `date` and a `value` column. The `realtime_start` / `realtime_end` columns describe the vintage (see below).

## Seasonal Adjustment

Many series exist in **seasonally adjusted** (SA) and **not seasonally adjusted** (NSA) forms. SA series remove regular calendar patterns (holidays, weather, school terms) and are what most commentary quotes. Check `s.seasonal_adjustment` and pick deliberately — mixing SA and NSA series distorts comparisons.

## Real vs Nominal

- **Nominal** series are in current dollars (e.g. `GDP`).
- **Real** series are inflation-adjusted to a base year (e.g. `GDPC1`, chained 2017 dollars).

Use **real** series to compare value across time; use **nominal** only when the dollar amount itself matters.

## Levels vs Growth

A level (e.g. the CPI index) is rarely interesting on its own — the **change** is. Request `units="pc1"` for year-over-year inflation, or `units="pca"` for an annualised growth rate, rather than differencing by hand (see Transformations).

## Vintages and Revisions

Many macro series are **revised** after first publication. FRED keeps every past **vintage**; ALFRED ("Archival FRED") lets you fetch the data *as it looked* on a given date via `vintage_dates`. This matters for backtesting: a model should only see the numbers that were actually available at decision time, not today's revised values.
