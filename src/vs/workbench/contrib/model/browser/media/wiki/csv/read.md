# Read

`CSV.File` parses a whole delimited file into memory as **typed columns**. It is the right choice whenever the file fits comfortably in RAM.

## Construction
```julia
using CSV, Tables

file = CSV.File("data.csv"; delim = ',', missingstring = ["", "NA"], dateformat = "yyyy-mm-dd")
tbl  = Tables.columntable(file)   # named tuple of column vectors
Tables.schema(file)               # column names and types
```
A `CSV.File` is already a Tables.jl table, so it can be passed directly to any package that accepts tables. `Tables.columntable` gives a plain named tuple of vectors: `tbl.price`, `keys(tbl)`, `length(first(tbl))` for the row count.

## Useful Options
- `select = [:a, :b]` or `drop = [:c]`: read only some columns (much faster on wide files).
- `limit = 1000`: read only the first rows, e.g. to inspect a huge file.
- `skipto = 3`, `footerskip = 2`: skip junk lines before the data or at the end.
- `types = Dict(:zip => String)`: force a column type instead of inferring it (keeps leading zeros).
- `comment = "#"`: ignore comment lines.
- `ntasks = 1`: disable multithreaded parsing.

## Strengths and Limits
- Fastest way to load a CSV; type inference and multithreading are automatic.
- Needs memory for the whole table. For larger files use [Stream Rows](rows.md) or [Chunks](chunks.md).

## See Also
- [File Format](file-format.md) · [Write](write.md) · [Diagnostics](diagnostics.md)
