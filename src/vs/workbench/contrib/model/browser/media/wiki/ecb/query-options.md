# ECB Data Portal — Query Options

The ECB REST API transforms little on the server (unlike FRED's `units`); instead you shape the request with **query parameters** appended after the key. Combine them with `&`.

## Time Range

| Parameter | Meaning | Example |
|---|---|---|
| `startPeriod` | First period to return | `startPeriod=2015-01-01` |
| `endPeriod` | Last period to return | `endPeriod=2023-12-31` |

Periods follow the series frequency: `YYYY` (annual), `YYYY-MM` (monthly), `YYYY-Qn` (quarterly), `YYYY-MM-DD` (daily).

```julia
url = "$base/EXR/D.USD.EUR.SP00.A?startPeriod=2023-01-01&endPeriod=2023-12-31&format=csvdata"
```

## Latest Observations

`lastNObservations` returns only the most recent *n* points — handy for a current reading without downloading history:

```julia
url = "$base/FM/B.U2.EUR.4F.KR.DFR.LEV?lastNObservations=1&format=csvdata"
```

There is also `firstNObservations` for the oldest *n* points.

## Format

| `format` | Body |
|---|---|
| `csvdata` | Flat CSV — recommended, reads via `CSV.jl` |
| `jsondata` | SDMX-JSON — deeply nested |
| `genericdata` | SDMX-ML generic (the default if `format` is omitted) |
| `structurespecificdata` | SDMX-ML structure-specific |

## Detail

`detail` controls how much comes back:

| `detail` | Returns |
|---|---|
| `full` | Data and all attributes (default) |
| `dataonly` | Observations without attributes |
| `serieskeysonly` | Just the matching series keys (no data) |
| `nodata` | Series and attributes, no observations |

`serieskeysonly` is useful for discovery: use a wildcard key to list every series that matches.

## Wildcards and Multiple Keys

- Leave a dimension **empty** to wildcard it: `EXR/D..EUR.SP00.A` returns every currency.
- Use `+` for alternatives in one dimension: `EXR/D.USD+GBP+JPY.EUR.SP00.A` returns three currencies in one call.

## Updated After

`updatedAfter=2024-01-01T00:00:00` returns only observations added or revised since a timestamp — useful for incremental refreshes.
