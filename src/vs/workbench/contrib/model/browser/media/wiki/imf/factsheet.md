# IMF Data — Factsheet

The International Monetary Fund publishes its statistics through an **SDMX 2.1 REST API** at `api.imf.org`. There is **no API key**. Ask for SDMX-CSV with an `Accept` header and the reply is a flat table that `CSV.jl` reads straight into a `Tables.jl`-compatible object.

| | |
|---|---|
| **Purpose** | Download IMF statistics into Julia |
| **Auth** | None, no API key required |
| **API base** | `https://api.imf.org/external/sdmx/2.1/data/` |
| **Standard** | SDMX 2.1 REST |
| **Julia stack** | `HTTP.jl` + `CSV.jl` + `Tables.jl` |
| **Data covered** | World Economic Outlook, consumer prices, exchange rates, reserves (COFER), commodity prices |

## Request Shape

```
{base}/{agency},{dataflow}/{key}?{parameters}
```

- **agency,dataflow**: for example `IMF.RES,WEO` or `IMF.STA,CPI`.
- **key**: dot-separated dimension values, one per dimension, in the dataflow's order. Join several values for one dimension with `+`, for example `USA+DEU+JPN`.
- **parameters**: `startPeriod` and `endPeriod`.

## The CSV Header

The API returns SDMX-ML (XML) by default; adding `format=csv` to the URL is **not** enough. Send this header instead:

```
Accept: application/vnd.sdmx.data+csv;version=1.0.0
```

## Minimal Example

```julia
using HTTP, CSV, Tables

base = "https://api.imf.org/external/sdmx/2.1/data"
csvheader = ["Accept" => "application/vnd.sdmx.data+csv;version=1.0.0"]
imf(flow, key; query = "") = CSV.File(HTTP.get("$base/$flow/$key?$query", csvheader).body)

tbl = imf("IMF.RES,WEO", "USA.NGDP_RPCH.A"; query = "startPeriod=2015")
Tables.getcolumn(tbl, :OBS_VALUE)
```

## Dataflows Used in the Panel

| Dataflow | Key pattern | Example indicator codes |
|---|---|---|
| `IMF.RES,WEO` | COUNTRY.INDICATOR.FREQ | `NGDP_RPCH` real GDP growth, `PCPIPCH` inflation, `LUR` unemployment, `GGXWDG_NGDP` government debt, `BCA_NGDPD` current account |
| `IMF.STA,CPI` | COUNTRY.INDEX_TYPE.COICOP.TRANSFORM.FREQ | `CPI._T.YOY_PCH_PA_PT.M` (all items, year-on-year % change, monthly) |
| `IMF.STA,ER` | COUNTRY.INDICATOR.TRANSFORM.FREQ | `XDC_USD.PA_RT.M` (period average), `XDC_USD.EOP_RT.M` (end of period) |
| `IMF.STA,COFER` | COUNTRY.INDICATOR.CURRENCY.TRANSFORM.FREQ | `G001.AFXRA.CI_USD.SHRO_PT.Q` (US dollar share of allocated reserves) |
| `IMF.RES,PCPS` | COUNTRY.INDICATOR.TRANSFORM.FREQ | `G001.POILBRE.USD.M` (Brent), `PGOLD`, `PCOPP`, `PALLFNF.INDEX` |

## Useful Columns

| Column | Meaning |
|---|---|
| `TIME_PERIOD` | The period: `2024` (annual), `2024-Q3` (quarterly), `2024-M09` (monthly) |
| `OBS_VALUE` | The observed value |
| `COUNTRY`, `INDICATOR`, ... | One column per dimension of the key |

Annual periods are read by `CSV.jl` as integers; monthly ones stay strings, so convert `"2024-M09"` to a `Date` before plotting to keep any gaps visible.

## See Also
- [Overview](overview.md)
