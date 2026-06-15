# ECB Data Portal — Factsheet

The [ECB Data Portal](https://data.ecb.europa.eu) publishes the European Central Bank's statistics through a standard **SDMX 2.1 REST API**. There is **no API key** — requests are open. The simplest way into Julia is to ask for `format=csvdata` and read the flat table with `HTTP.jl` + `CSV.jl` into a `Tables.jl`-compatible table.

| | |
|---|---|
| **Purpose** | Download euro-area statistics from the ECB Data Portal into Julia |
| **Auth** | None — no API key required |
| **API base** | `https://data-api.ecb.europa.eu/service/` |
| **Standard** | SDMX 2.1 REST |
| **Julia stack** | `HTTP.jl` + `CSV.jl` + `Tables.jl` |
| **Data covered** | Exchange rates, key interest rates, HICP inflation, monetary aggregates, yield curve |

## Request Shape

```
{base}/data/{flowRef}/{key}?{parameters}
```

- **flowRef** — the dataflow, e.g. `EXR`, `ICP`, `BSI`, `YC`, `FM`, `EST`.
- **key** — dot-separated dimension values, e.g. `D.USD.EUR.SP00.A`.
- **parameters** — `startPeriod`, `endPeriod`, `format`, `lastNObservations`, `detail`.

## Minimal Example

```julia
using HTTP, CSV, Tables

base = "https://data-api.ecb.europa.eu/service/data"
url  = "$base/EXR/D.USD.EUR.SP00.A?startPeriod=2015-01-01&format=csvdata"
tbl  = CSV.File(HTTP.get(url).body)

Tables.getcolumn(tbl, :OBS_VALUE)   # the observations
```

## Useful Columns

The CSV is flat; the columns you usually want are:

| Column | Meaning |
|---|---|
| `KEY` | The full series key |
| `TIME_PERIOD` | The observation date/period |
| `OBS_VALUE` | The observed value |
| `TITLE` / `UNIT` | Human-readable series title and unit |

> `CSV.File` is Tables.jl-compatible, so you can pipe it straight into the container you prefer: `DataFrame(tbl)`, a `TimeArray`, or anything else that accepts a Tables.jl source.
