# FRED — Transformations

FRED can transform a series **server-side** before it reaches Julia, so you rarely need to compute growth rates or resample by hand. Pass the `units` and `frequency` keywords to `get_data`.

## Units

The `units` keyword controls how each observation is expressed:

| `units` | Meaning |
|---|---|
| `lin` | Levels (no transform — the default) |
| `chg` | Change from the previous period |
| `ch1` | Change from a year ago |
| `pch` | Percent change from the previous period |
| `pc1` | Percent change from a year ago (year-over-year) |
| `pca` | Compounded annual rate of change |
| `log` | Natural log of the level |

```julia
# Headline CPI as year-over-year inflation
cpi = get_data(f, "CPIAUCSL"; units="pc1")

# Real GDP as a compounded annual growth rate
gdp = get_data(f, "GDPC1"; units="pca")
```

## Frequency and Aggregation

The `frequency` keyword resamples a series to a **coarser** frequency; `aggregation_method` says how to combine the higher-frequency observations:

| `frequency` | Target |
|---|---|
| `d`, `w`, `bw` | Daily, weekly, biweekly |
| `m`, `q`, `sa`, `a` | Monthly, quarterly, semiannual, annual |

| `aggregation_method` | Combine by |
|---|---|
| `avg` | Average (default) |
| `sum` | Sum |
| `eop` | End of period |

```julia
# Daily fed funds rate, averaged to a monthly series
funds = get_data(f, "DFF"; frequency="m", aggregation_method="avg")
```

## Date Range

Limit the observations with `observation_start` / `observation_end`:

```julia
indpro = get_data(f, "INDPRO"; observation_start="2000-01-01")
```

> Transforms are applied by FRED, not by FredData.jl, so the returned `units` field reflects the transform you requested.
