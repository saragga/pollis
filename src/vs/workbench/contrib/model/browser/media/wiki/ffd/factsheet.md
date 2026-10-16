# Kenneth French Data Library — Factsheet

`FamaFrenchData.jl` downloads files from Kenneth French's Data Library, the standard public source for the Fama-French factors and sorted portfolio returns. There is **no API key**. Each file comes back as a vector of tables plus their notes; the tables are `Tables.jl`-compatible.

| | |
|---|---|
| **Purpose** | Download factor and portfolio returns into Julia |
| **Auth** | None, no API key required |
| **Source** | `mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html` |
| **Julia stack** | `FamaFrenchData.jl` + `Tables.jl` |
| **Data covered** | US and international factors, sorted portfolios, industry portfolios; monthly, annual, weekly, and daily |

## Main Functions

```julia
tables, tablenotes, filenotes = readFamaFrench(name)
listFamaFrench()             # every file name
downloadFamaFrench(savename, name)
clearFamaFrenchCache()
```

- **name** is the file name without extension, such as `"F-F_Research_Data_Factors"`.
- **tables** holds every table in the file, in order: usually monthly returns first, then annual, then other statistics.
- **tablenotes** has one title per table; **filenotes** describes how the file was built.

## Shape of a Table

| Column | Meaning |
|---|---|
| `Date` | An integer: `192607` for July 1926 in monthly tables, `1927` in annual ones |
| the other columns | Returns in **percent**, one column per factor or portfolio |

Column names with a hyphen or space need `Symbol`: `Tables.getcolumn(t, Symbol("Mkt-RF"))`. Convert a monthly date with `Date(div(d, 100), rem(d, 100))`.

The library marks missing values with `-99.99` or `-999`; check for them before averaging long histories of small portfolios.

## Common Files

| File | Contents |
|---|---|
| `F-F_Research_Data_Factors` | Mkt-RF, SMB, HML, RF |
| `F-F_Research_Data_5_Factors_2x3` | Mkt-RF, SMB, HML, RMW, CMA, RF |
| `F-F_Momentum_Factor` | Mom |
| `25_Portfolios_5x5` | 25 portfolios sorted on size and book-to-market |
| `10_Industry_Portfolios` | Ten industry portfolios |

Add `_daily` (and for the three factors, `_weekly`) for higher frequencies.

## See Also
- [Overview](overview.md)
