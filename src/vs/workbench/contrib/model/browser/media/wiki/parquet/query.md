# Query

The **Query** tab of the Parquet Files panel runs SQL on a Parquet file with DuckDB, through DuckDB.jl ([Raasveldt and Mühleisen (2026)](#ref-RM2026a)). The file is not loaded first: DuckDB reads from it only what the query asks for.

## How Do I Query a Parquet File from Julia?

```julia
using DuckDB, Tables

con = DBInterface.connect(DuckDB.DB)   # an in-memory database
tbl = Tables.columntable(DBInterface.execute(con, """
SELECT month, avg(temp) AS mean_temp
FROM read_parquet('data.parquet')
GROUP BY month
"""))
```

`DBInterface.connect(DuckDB.DB)` opens a database in memory; the Parquet file stays where it is. `read_parquet` takes a path, a list of paths, or a pattern such as `'data/*.parquet'` that reads many files as one table. `Tables.columntable` turns the result into a named tuple of vectors.

## Why Is Querying a Parquet File Fast?

Two things make DuckDB read less than the whole file. **Projection pushdown**: only the columns the query names are read, so three columns of a table of fifty cost about three fiftieths of the file. **Filter pushdown**: the `WHERE` condition is checked against the minimum and maximum the file records for each row group, and row groups that cannot match are skipped. The **Query Plan** action shows both, as `Projections` and `Filters` under the Parquet scan.

## Which Columns and Filter Should the Query Tab Get?

The **Columns** field takes a list such as `month, day, temp`, or `*` for all columns. The **Filter** field takes any SQL condition: `temp > 85`, `month IN (6, 7, 8)`, `ozone IS NOT NULL`, or several joined with `AND`. Text values go in single quotes, such as `station = 'Central Park'`. A filter on a column the file is sorted by skips the most row groups.

## How Is a Parquet Query Result Used in Julia?

The result of `DBInterface.execute` is a Tables.jl table, so it can go straight to any package that takes tables: a plot, a regression, `CSV.write`. A Julia table can also go the other way: `DuckDB.register_table(con, tbl, "name")` makes it visible to SQL as a view, so that a query can join a Parquet file with data already in Julia. Both directions avoid writing temporary files.

## References

<a id="ref-RM2026a"></a>Raasveldt, M. and Mühleisen, H. (2026). DuckDB.jl: the DuckDB Julia package. [github.com/duckdb/DuckDB.jl](https://github.com/duckdb/DuckDB.jl)

## See Also
- [File Format](file-format.md) · [Read](read.md) · [Partitioned](partitioned.md)
