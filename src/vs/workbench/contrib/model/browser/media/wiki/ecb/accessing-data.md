# Accessing Data

This page is the core recipe: fetch a series with **no API key**, in **CSV**, into a **Tables.jl** table.

## The Three Packages

```julia
import Pkg; Pkg.add(["HTTP", "CSV", "Tables"])
using HTTP, CSV, Tables
```

- **HTTP.jl** — issues the GET request.
- **CSV.jl** — parses the response into a `CSV.File`.
- **Tables.jl** — the common interface that lets you read columns or hand the table to any sink.

## Fetch One Series

```julia
base = "https://data-api.ecb.europa.eu/service/data"
url  = "$base/EXR/D.USD.EUR.SP00.A?startPeriod=2015-01-01&format=csvdata"

resp = HTTP.get(url)
tbl  = CSV.File(resp.body)          # Tables.jl-compatible
```

`format=csvdata` is what makes this easy: the body is a flat CSV with one row per observation.

## Read Columns Without Committing to a Frame

```julia
dates  = Tables.getcolumn(tbl, :TIME_PERIOD)
values = Tables.getcolumn(tbl, :OBS_VALUE)
```

`Tables.getcolumn` works on any Tables.jl source, so this code is independent of whichever container you choose next.

## Pipe Into the Container You Prefer

Because `CSV.File` is a Tables.jl source, the choice of frame is **yours**, not the API's:

```julia
cols = Tables.columntable(tbl)   # NamedTuple of column vectors

using TimeSeries
ta = TimeArray(tbl; timestamp = :TIME_PERIOD)
```

## A Small Helper

When you fetch many series, wrap the pattern:

```julia
function ecb(flow, key; params = "format=csvdata")
    url = "https://data-api.ecb.europa.eu/service/data/$flow/$key?$params"
    return CSV.File(HTTP.get(url).body)
end

usd = ecb("EXR", "D.USD.EUR.SP00.A"; params = "startPeriod=2020-01-01&format=csvdata")
```

> No authentication headers are needed. If a request returns no rows, check the key on its ECB series page (see *Finding Series*) and confirm the frequency dimension matches the data.

## See Also
- [Query Options](query-options.md) · [Finding Series](finding-series.md) · [SDMX and Alternatives](sdmx-alternatives.md)
