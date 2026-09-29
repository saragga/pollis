# SDMX and Alternatives

The ECB API is an **SDMX 2.1** service. This page explains the formats and when a dedicated SDMX package is worth it over raw CSV.

## The SDMX Formats

A single data request can be returned in several representations, chosen with `format`:

- **SDMX-CSV** (`csvdata`) — a flat table, one row per observation. **This is what we use**: `CSV.jl` reads it directly.
- **SDMX-JSON** (`jsondata`) — a compact but deeply nested structure: series are keyed by dimension-index strings (`"0:0:0:0:0"`) and observations are sparse maps indexed by time position. Reconstructing dates and labels means walking the `structure` section. Powerful, but verbose to parse by hand.
- **SDMX-ML** (`genericdata`, `structurespecificdata`) — the canonical XML. Most complete (full metadata), heaviest to parse.

## Why We Default to CSV

For pulling series into Julia, SDMX-CSV gives you 95% of the value with none of the parsing. You get `TIME_PERIOD`, `OBS_VALUE`, the full `KEY`, and human-readable `TITLE`/`UNIT` columns — enough for analysis and plotting.

## When to Reach for SDMX.jl

[SDMX.jl](https://juliapackages.com/p/sdmx) is a Tables.jl-compatible SDMX-**JSON** reader. It can be convenient when you want the parsing and some metadata handled for you:

```julia
using SDMX
url = "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A?format=jsondata"
dt  = SDMX.read(url)      # SDMX.Datatable -> Tables.jl
```

Caveats worth knowing:

- It targets SDMX-JSON; the CSV path here needs no extra dependency.
- The package dates from 2021 and its docs reference the **retired** `sdw-wsrest.ecb.europa.eu` host — use the current `data-api.ecb.europa.eu` base and verify behaviour.
- The newer **SDMXer** / **SDMXerWizard** packages aim at fuller SDMX tooling for official statistics, but are heavier and less battle-tested.

## Recommendation

Start with **HTTP + CSV + Tables** (the *Accessing Data* page). Reach for an SDMX library only when you specifically need structure/metadata parsing that the flat CSV does not give you.

## See Also
- [Accessing Data](accessing-data.md) · [Query Options](query-options.md) · [Overview](overview.md)
