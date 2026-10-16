# World Bank Indicators — Factsheet

`WorldBankData.jl` downloads series from the World Bank Indicators API (v2). There is **no API key**. `wdi()` returns a table with one row per country and year and one column per indicator; it is `Tables.jl`-compatible, so columns are read with `Tables.getcolumn` or rows with `Tables.rows`.

| | |
|---|---|
| **Purpose** | Download World Development Indicators into Julia |
| **Auth** | None, no API key required |
| **API** | `https://api.worldbank.org/v2/` |
| **Julia stack** | `WorldBankData.jl` + `Tables.jl` (plus `HTTP.jl` + `JSON.jl` for indicator search) |
| **Data covered** | About 1,500 development indicators for over 200 economies and regional and income aggregates |

## Main Functions

```julia
wdi(indicators, countries, startyear, endyear; extra = false)
search_wdi("countries", field, regex)
```

- **indicators**: one code or a vector of codes, such as `"NY.GDP.PCAP.KD"`.
- **countries**: ISO2 or ISO3 codes, aggregate codes (`"WLD"`, `"EUU"`, `"HIC"`), or `"all"`.
- **extra = true** adds `iso3c`, `region`, `capital`, `longitude`, `latitude`, `income`, and `lending` columns.
- **search_wdi("countries", ...)** searches the country list by `name`, `region`, `capital`, `iso2c`, `iso3c`, `income`, or `lending`.

## Shape of the Result

| Column | Meaning |
|---|---|
| `iso2c`, `country` | The economy |
| `year` | The year (a floating-point number; use `Int(year)` to print it) |
| one column per indicator | The code with dots replaced by underscores: `NY.GDP.PCAP.KD` becomes `NY_GDP_PCAP_KD` |

Missing observations are `missing`.

## Searching Indicators

`search_wdi("indicators", ...)` reads only the first 25,000 entries of the API's indicator list, which is longer, so some World Development Indicators are not found by it. The WDI are source 2 of the API, and that list is complete:

```julia
using HTTP, JSON

url = "https://api.worldbank.org/v2/sources/2/indicators?per_page=2000&format=json"
_, wdilist = JSON.parse(String(HTTP.get(url).body))
filter(i -> occursin(r"life expectancy"i, i["name"]), wdilist)   # fields: id, name, sourceNote
```

## Common Codes

| Code | Indicator |
|---|---|
| `NY.GDP.PCAP.KD` | GDP per capita, constant 2015 US$ |
| `NY.GDP.MKTP.KD.ZG` | GDP growth, annual % |
| `SP.POP.TOTL` | Population, total |
| `SP.DYN.LE00.IN` | Life expectancy at birth, total (years) |
| `SH.DYN.MORT` | Under-five mortality rate, per 1,000 live births |
| `SL.UEM.TOTL.ZS` | Unemployment, total (% of labour force, modelled ILO estimate) |

## See Also
- [Overview](overview.md)
