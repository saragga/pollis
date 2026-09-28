# Write

`CSV.write` saves **any Tables.jl source** as a delimited text file: a named tuple of vectors, a `CSV.File`, a query result, a matrix wrapped with `Tables.table`.

## Construction
```julia
using CSV, Tables

data = (id = [1, 2, 3], price = [9.5, missing, 12.0], city = ["Lisbon", "Porto", "Faro"])
CSV.write("out.csv", data)                                  # comma-separated, header row
CSV.write("out.tsv", data; delim = '\t', missingstring = "NA")
CSV.write("out.csv.gz", data; compress = true)              # gzip
```
A matrix needs column names: `CSV.write("m.csv", Tables.table(M; header = [:a, :b]))`.

## Useful Options
- `delim`: field separator (comma by default).
- `missingstring`: how to write `missing` (empty by default).
- `dateformat`: format for `Date` and `DateTime` values (ISO by default).
- `append = true`: add rows to an existing file without repeating the header.
- `writeheader = false`: omit the header row.
- `compress = true`: write gzip; CSV.jl reads it back transparently.

## Strengths and Limits
- Portable output that any tool can open.
- CSV stores **text only**: types, pooled columns and time zones are lost, and floating-point numbers are written in full precision. Check with the **Round-Trip Check** action.

## See Also
- [Read](read.md) · [File Format](file-format.md) · [Diagnostics](diagnostics.md)
