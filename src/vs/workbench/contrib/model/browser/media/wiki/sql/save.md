# Save Table

The Save Table tab stores a **Julia table** in the database, for any Tables.jl source: a named tuple of vectors, a `CSV.File`, a query result.

## Construction
```julia
using DuckDB, DBInterface, Tables

mydb = DBInterface.connect(DuckDB.DB, "mydata.duckdb")   # a database of your own, created if new
DuckDB.register_table(mydb, Tables.columntable(tbl), "julia_data")   # a view of the Julia columns
DBInterface.execute(mydb, "CREATE OR REPLACE TABLE results AS SELECT * FROM julia_data")
DuckDB.unregister_table(mydb, "julia_data")
```
`register_table` lets SQL read the Julia columns in place, **without copying** them; `CREATE TABLE ... AS SELECT` then copies them into the database file. Unregister the view afterwards, since it refers to Julia memory that is not saved.

## Transforming on the Way In
Because the Julia table is visible to SQL, you can reshape it while saving: `CREATE TABLE t AS SELECT *, price * qty AS revenue FROM julia_data WHERE qty > 0`, or join it with tables already in the database.

## Types
Julia types map to DuckDB types: `Int64` → `BIGINT`, `Float64` → `DOUBLE`, `String` → `VARCHAR`, `Date` → `DATE`, `Bool` → `BOOLEAN`, and `missing` → `NULL`. Columns of other types (e.g. `Any`, custom structs) cannot be saved: convert them first.

## Alternatives
`DuckDB.Appender` inserts rows one at a time, useful when they arrive in a loop. For a whole table, `register_table` is simpler and faster.

## See Also
- [Import File](import.md) · [Query](query.md)
