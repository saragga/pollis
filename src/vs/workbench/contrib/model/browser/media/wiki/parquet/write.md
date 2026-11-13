# Write

The **Write** tab of the Parquet Files panel saves a Julia table as a Parquet file with DuckDB's `COPY` statement.

## How Do I Write a Julia Table to a Parquet File?

```julia
using DuckDB, Tables

con = DBInterface.connect(DuckDB.DB)
DuckDB.register_table(con, tbl, "tbl")   # the Julia table, seen by SQL as the view tbl
DBInterface.execute(con, "COPY tbl TO 'results.parquet' (FORMAT parquet, COMPRESSION zstd)")
```

`DuckDB.register_table` accepts any Tables.jl source, such as a named tuple of vectors, and lets SQL read it as a view called `tbl` without copying it into a table. `COPY ... TO` writes the view to the file. A query can stand in place of the view name, as in `COPY (SELECT * FROM tbl WHERE temp > 85) TO ...`, to save only part of the table.

## Which Options Does COPY TO Parquet Take?

| Option | Effect |
|---|---|
| `COMPRESSION zstd` | The codec: `zstd`, `snappy` (the default of DuckDB), `gzip`, `lz4`, `brotli` or `uncompressed` |
| `ROW_GROUP_SIZE 100000` | Rows per row group; smaller groups let filters skip more finely, larger ones compress better |
| `PARTITION_BY (month)` | One folder per value of a column, as in the **Partitioned** tab |
| `OVERWRITE_OR_IGNORE` | With `PARTITION_BY`, write into a folder that already holds files |

## Which Julia Types Survive a Parquet Round Trip?

Integers, floating-point numbers, booleans, strings, dates and timestamps keep their types: a table written and read back has the same column types, and missing values stay missing. A column of a type DuckDB has no counterpart for, such as `Symbol` or a custom struct, is refused by `DuckDB.register_table`: convert it first, for example with `string.(column)`. Sorting the table before writing, by the column most often filtered on, makes later queries on the file faster.

## See Also
- [Query](query.md) · [Partitioned](partitioned.md) · [Decision Guide](decision-guide.md)
