# Write

The **Write** tab of the JSON Files panel saves a Julia table as JSON in one of three layouts: JSON Lines and an array of records with DuckDB's `COPY`, and an object of columns with JSON.jl.

## How Do I Write a Julia Table as JSON Lines?

```julia
using DuckDB, Tables

con = DBInterface.connect(DuckDB.DB)
DuckDB.register_table(con, tbl, "tbl")
DBInterface.execute(con, "COPY tbl TO 'out.jsonl' (FORMAT json)")               # JSON Lines
DBInterface.execute(con, "COPY tbl TO 'out.json' (FORMAT json, ARRAY true)")    # one array
```

`COPY ... TO` with `FORMAT json` writes one object per row, with the column names as keys and `null` for missing values; `ARRAY true` wraps the objects in one array. A query in place of `tbl`, such as `(SELECT month, temp FROM tbl)`, saves part of the table.

## How Do I Write Any Julia Value as JSON with JSON.jl?

`JSON.json(x)` returns the JSON text of a value, and `JSON.json(path, x)` writes it to a file. Named tuples and structs become objects, vectors become arrays, `missing` and `nothing` become `null`. A named tuple of column vectors, such as `tbl`, becomes one object with an array per column, the **columns** layout of the tab. `pretty = true` indents the text for reading, and `jsonlines = true` writes a vector one element per line.

## What Do Dates and Special Numbers Become in Written JSON?

JSON has no date type, so dates and timestamps are written as strings in ISO 8601 form, such as `"2024-07-01"`, which most readers turn back into dates. `NaN` and infinity have no JSON form: JSON.jl refuses to write them unless `allownan = true` is given, which produces a file that strict readers reject. Replacing them with `missing` before writing gives `null`, which every reader accepts.

## See Also
- [Query](query.md) · [Decision Guide](decision-guide.md) · [File Format](file-format.md)
